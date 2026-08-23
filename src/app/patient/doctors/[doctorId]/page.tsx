"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { SectionCard } from "@/components/ui/card";
import { Input, Textarea, Label, FieldError } from "@/components/ui/forms";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { createPatientAppointment, getPatientDoctor, getPatientDoctorSlots } from "@/lib/api";
import type { AppointmentSlot, CreateAppointmentInput, DoctorDetails } from "@/types/appointments";

function dateValue(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

const emptyBooking: Omit<CreateAppointmentInput, "slotId"> = {
  reasonForVisit: "",
  symptoms: "",
  symptomDuration: "",
  additionalNotes: "",
};

function PatientDoctorDetailsContent() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const router = useRouter();
  const { session } = useAuth();
  
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [from, setFrom] = useState(() => dateValue(0));
  const [to, setTo] = useState(() => dateValue(14));
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [booking, setBooking] = useState(emptyBooking);
  
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  const loadSlots = useCallback(async () => {
    if (!session || !doctorId || !from || !to) return;
    setSlotsLoading(true);
    setError(null);
    try {
      setSlots(await getPatientDoctorSlots(session.access_token, doctorId, from, to));
      setSelectedSlot(null);
    } catch (slotError) {
      setError(slotError instanceof Error ? slotError.message : "Online consultation times could not be loaded.");
    } finally {
      setSlotsLoading(false);
    }
  }, [doctorId, from, session, to]);

  useEffect(() => {
    if (!session || !doctorId) return;
    const token = session.access_token;
    async function init() {
      try {
        const [doctorValue, slotValues] = await Promise.all([
          getPatientDoctor(token, doctorId),
          getPatientDoctorSlots(token, doctorId, from, to),
        ]);
        setDoctor(doctorValue);
        setSlots(slotValues);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "The doctor profile could not be loaded.");
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, session]);

  useEffect(() => {
    const initial = window.setTimeout(() => setNow(Date.now()), 0);
    const minuteTimer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => { window.clearTimeout(initial); window.clearInterval(minuteTimer); };
  }, []);

  const visibleSlots = slots.filter((slot) => new Date(slot.startsAt).getTime() > now);

  const slotsByDate = visibleSlots.reduce((acc, slot) => {
    const dateStr = new Date(slot.startsAt).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(slot);
    return acc;
  }, {} as Record<string, AppointmentSlot[]>);

  async function requestAppointment(event: FormEvent) {
    event.preventDefault();
    if (!session || !selectedSlot) return;
    if (new Date(selectedSlot.startsAt).getTime() <= Date.now()) {
      setSelectedSlot(null);
      setError("This consultation time is no longer available. Please choose another available time.");
      await loadSlots();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createPatientAppointment(session.access_token, { slotId: selectedSlot.id, ...booking });
      router.push("/patient/appointments?created=1");
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "The online consultation request could not be submitted.");
      await loadSlots();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingPanel label="Loading doctor profile..." />;

  return (
    <div className="space-y-8">
      <PortalHeading 
        eyebrow="Verified Doctor" 
        title={doctor?.displayName ?? "Doctor Profile"}
        backHref="/patient/doctors" 
        backLabel="Back to doctor search"
        description={doctor ? `${doctor.specializationName} · ${doctor.hospitalName}` : "Doctor details"} 
      />
      
      {error && <Alert tone="error">{error}</Alert>}

      {doctor && (
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-8">
            <SectionCard>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-100 text-3xl font-bold uppercase text-teal-900">
                  {doctor.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={doctor.profileImageUrl} alt={`Dr. ${doctor.displayName}`} className="size-full object-cover" />
                  ) : (
                    doctor.displayName.replace("Dr. ", "").charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className="text-2xl font-semibold text-slate-950">{doctor.displayName}</h2>
                    {doctor.verified && (
                      <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="size-4" />
                        <span className="text-xs font-bold uppercase tracking-wide">Verified</span>
                      </div>
                    )}
                  </div>
                  <p className="text-teal-700 font-medium mb-3">{doctor.specializationName}</p>
                  <p className="text-slate-600 text-sm">{doctor.hospitalName}</p>
                  <p className="text-slate-600 text-sm">{doctor.departmentName}</p>
                </div>
              </div>

              {doctor.bio && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-950 mb-3">About</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{doctor.bio}</p>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Professional Information">
              <dl className="grid gap-6 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-slate-500 font-medium mb-1">Qualifications</dt>
                  <dd className="font-medium text-slate-950">{doctor.qualifications}</dd>
                </div>
                {doctor.yearsOfExperience > 0 && (
                  <div>
                    <dt className="text-slate-500 font-medium mb-1">Experience</dt>
                    <dd className="font-medium text-slate-950">{doctor.yearsOfExperience} years</dd>
                  </div>
                )}
                <div>
                  <dt className="text-slate-500 font-medium mb-1">Hospital</dt>
                  <dd className="font-medium text-slate-950">{doctor.hospitalName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium mb-1">Department</dt>
                  <dd className="font-medium text-slate-950">{doctor.departmentName}</dd>
                </div>
              </dl>
            </SectionCard>
          </div>

          <div className="lg:col-span-1 space-y-8 sticky top-6">
            <SectionCard title="Available Consultation Times">
              <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="from">From</Label>
                    <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="to">To</Label>
                    <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                  </div>
                </div>
                <Button variant="secondary" loading={slotsLoading} onClick={loadSlots}>
                  Update Dates
                </Button>
              </div>

              {slotsLoading ? (
                <div className="py-8 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
                  <LoadingPanel label="Loading times..." />
                </div>
              ) : visibleSlots.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No times available"
                  description="Try selecting a different date range."
                />
              ) : (
                <div className="space-y-6 max-h-125 overflow-y-auto pr-2">
                  {Object.entries(slotsByDate).map(([date, daySlots]) => (
                    <div key={date}>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3 sticky top-0 bg-white py-1">{date}</h4>
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map(slot => {
                          const isSelected = selectedSlot?.id === slot.id;
                          return (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`
                                rounded-xl border px-3 py-2 text-sm font-medium transition-all
                                ${isSelected 
                                  ? "border-teal-600 bg-teal-50 text-teal-700 ring-2 ring-teal-600/20" 
                                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-slate-50"}
                              `}
                            >
                              {new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {selectedSlot && new Date(selectedSlot.startsAt).getTime() > now && (
        <SectionCard>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">Book Online Consultation</p>
            <h2 className="text-2xl font-semibold text-slate-950">Consultation Request</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Selected time: <span className="font-semibold text-slate-900">{formatAppointmentTime(selectedSlot.startsAt)}</span>
            </p>
          </div>

          <form onSubmit={requestAppointment} className="space-y-6 max-w-3xl">
            <div className="space-y-1">
              <Label htmlFor="reasonForVisit">Reason for consultation <span className="text-rose-600">*</span></Label>
              <Input
                id="reasonForVisit"
                maxLength={300}
                required
                value={booking.reasonForVisit}
                onChange={(e) => setBooking({ ...booking, reasonForVisit: e.target.value })}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="symptoms">Symptoms <span className="text-rose-600">*</span></Label>
              <Textarea
                id="symptoms"
                maxLength={2000}
                required
                className="min-h-32"
                value={booking.symptoms}
                onChange={(e) => setBooking({ ...booking, symptoms: e.target.value })}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="symptomDuration">Symptom duration</Label>
                <Input
                  id="symptomDuration"
                  maxLength={200}
                  placeholder="e.g., 3 days"
                  value={booking.symptomDuration}
                  onChange={(e) => setBooking({ ...booking, symptomDuration: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="additionalNotes">Additional notes</Label>
                <Textarea
                  id="additionalNotes"
                  maxLength={2000}
                  className="min-h-24"
                  value={booking.additionalNotes}
                  onChange={(e) => setBooking({ ...booking, additionalNotes: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" loading={submitting}>
                Request Consultation
              </Button>
            </div>
          </form>
        </SectionCard>
      )}
    </div>
  );
}

export default function PatientDoctorDetailsPage() {
  return <ProtectedRoute roles={["PATIENT"]}><PatientDoctorDetailsContent /></ProtectedRoute>;
}

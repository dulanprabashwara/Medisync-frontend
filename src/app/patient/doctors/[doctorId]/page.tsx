"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { inputClassName } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { InlineError, PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
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
    const timer = window.setTimeout(async () => {
      setLoading(true);
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
    }, 0);
    return () => window.clearTimeout(timer);
    // The date controls reload explicitly, avoiding a duplicate initial request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, session]);

  async function requestAppointment(event: FormEvent) {
    event.preventDefault();
    if (!session || !selectedSlot) return;
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

  if (loading) return <LoadingPanel label="Loading doctor profile and available times..." />;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading eyebrow="Verified doctor" title={doctor?.displayName ?? "Doctor profile"}
        backHref="/patient/doctors" backLabel="Back to doctor search"
        description={doctor ? `${doctor.specializationName} · Affiliated with ${doctor.hospitalName}` : "Doctor details"} />
      <div className="mt-7"><InlineError message={error} /></div>

      {doctor ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <dl className="grid flex-1 gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div><dt className="text-slate-500">Affiliated hospital</dt><dd className="mt-1 font-semibold text-slate-950">{doctor.hospitalName}</dd></div>
              <div><dt className="text-slate-500">Department</dt><dd className="mt-1 font-semibold text-slate-950">{doctor.departmentName}</dd></div>
              <div><dt className="text-slate-500">Specialization</dt><dd className="mt-1 font-semibold text-slate-950">{doctor.specializationName}</dd></div>
              <div><dt className="text-slate-500">Qualifications</dt><dd className="mt-1 font-semibold text-slate-950">{doctor.qualifications}</dd></div>
              <div><dt className="text-slate-500">Experience</dt><dd className="mt-1 font-semibold text-slate-950">{doctor.yearsOfExperience} years</dd></div>
            </dl>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800">ADMIN VERIFIED</span>
          </div>
          {doctor.bio ? <div className="mt-7 border-t border-slate-100 pt-6"><h2 className="font-semibold text-slate-950">About</h2><p className="mt-2 leading-7 text-slate-600">{doctor.bio}</p></div> : null}
        </section>
      ) : null}

      <section className="mt-9" aria-labelledby="available-times-heading">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><h2 className="text-2xl font-semibold text-slate-950" id="available-times-heading">Available Online Consultation Times</h2><p className="mt-2 text-sm text-slate-600">Only future online consultation times that are open for requests are shown.</p></div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-medium text-slate-700">From
              <input className={`${inputClassName} min-w-40`} type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            </label>
            <label className="text-sm font-medium text-slate-700">To
              <input className={`${inputClassName} min-w-40`} type="date" value={to} onChange={(event) => setTo(event.target.value)} />
            </label>
            <button className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60" disabled={slotsLoading} onClick={() => void loadSlots()}>
              {slotsLoading ? "Loading..." : "Update dates"}
            </button>
          </div>
        </div>

        {slotsLoading ? <LoadingPanel label="Loading online consultation times..." /> : slots.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No online consultation times are currently available.</div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <button aria-pressed={selectedSlot?.id === slot.id} className={`rounded-2xl border p-4 text-left transition ${selectedSlot?.id === slot.id ? "border-teal-600 bg-teal-50 ring-4 ring-teal-600/10" : "border-slate-200 bg-white hover:border-teal-300"}`}
                key={slot.id} onClick={() => setSelectedSlot(slot)}>
                <span className="block font-semibold text-slate-950">{formatAppointmentTime(slot.startsAt)}</span>
                <span className="mt-1 block text-sm text-slate-500">Ends {new Date(slot.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedSlot ? (
        <section className="mt-9 rounded-3xl border border-teal-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="booking-form-heading">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Book Online Consultation</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950" id="booking-form-heading">Request {formatAppointmentTime(selectedSlot.startsAt)}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">You are requesting an online consultation with {doctor?.displayName ?? "this doctor"}. Describe what you want the doctor to review; MediSync records your words and does not diagnose your symptoms.</p>
          <form className="mt-6 space-y-5" onSubmit={requestAppointment}>
            <label className="block text-sm font-medium text-slate-700">Reason for consultation <span className="text-rose-600">*</span>
              <input className={inputClassName} maxLength={300} required value={booking.reasonForVisit} onChange={(event) => setBooking({ ...booking, reasonForVisit: event.target.value })} />
            </label>
            <label className="block text-sm font-medium text-slate-700">Symptoms <span className="text-rose-600">*</span>
              <textarea className={`${inputClassName} min-h-32 resize-y`} maxLength={2000} required value={booking.symptoms} onChange={(event) => setBooking({ ...booking, symptoms: event.target.value })} />
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Symptom duration
                <input className={inputClassName} maxLength={200} placeholder="For example, 3 days" value={booking.symptomDuration} onChange={(event) => setBooking({ ...booking, symptomDuration: event.target.value })} />
              </label>
              <label className="block text-sm font-medium text-slate-700">Additional notes
                <textarea className={`${inputClassName} min-h-24 resize-y`} maxLength={2000} value={booking.additionalNotes} onChange={(event) => setBooking({ ...booking, additionalNotes: event.target.value })} />
              </label>
            </div>
            <button className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60" disabled={submitting} type="submit">
              {submitting ? "Requesting online consultation..." : "Request online consultation"}
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}

export default function PatientDoctorDetailsPage() {
  return <ProtectedRoute roles={["PATIENT"]}><PatientDoctorDetailsContent /></ProtectedRoute>;
}

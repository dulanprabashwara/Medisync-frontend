"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { inputClassName } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { InlineError, PortalHeading, StateBadge, formatAppointmentTime } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { cancelPatientAppointment, getPatientAppointments } from "@/lib/api";
import type { Appointment } from "@/types/appointments";

function PatientAppointmentsContent() {
  const { session } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const page = await getPatientAppointments(session.access_token);
      setAppointments(page.content);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Your appointments could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (new URLSearchParams(window.location.search).get("created") === "1") {
        setMessage("Your appointment request was submitted. The doctor can now review it.");
      }
      setNow(Date.now());
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const groups = useMemo(() => {
    const ascending = (left: Appointment, right: Appointment) => new Date(left.scheduledStart).getTime() - new Date(right.scheduledStart).getTime();
    const descending = (left: Appointment, right: Appointment) => -ascending(left, right);
    return {
      pending: appointments.filter((value) => value.status === "REQUESTED").sort(ascending),
      confirmed: appointments.filter((value) => value.status === "CONFIRMED" && new Date(value.scheduledStart).getTime() > now).sort(ascending),
      history: appointments.filter((value) => value.status !== "REQUESTED" && !(value.status === "CONFIRMED" && new Date(value.scheduledStart).getTime() > now)).sort(descending),
    };
  }, [appointments, now]);

  async function cancel(appointmentId: string) {
    if (!session) return;
    setBusy(appointmentId);
    setError(null);
    try {
      await cancelPatientAppointment(session.access_token, appointmentId, cancelReason.trim());
      setCancelId(null);
      setCancelReason("");
      setMessage("The appointment was cancelled and its slot was released.");
      await load();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "The appointment could not be cancelled.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading eyebrow="Patient care" title="My appointments" backHref="/patient/dashboard"
        description="Track appointment requests, confirmed times, rejection reasons, and cancellations." />
      <div className="mt-7 space-y-3">
        <InlineError message={error} />
        {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900" role="status">{message}</div> : null}
      </div>

      {loading ? <LoadingPanel label="Loading your appointments..." /> : appointments.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">You have no appointment requests yet.</div>
      ) : (
        <div className="mt-9 space-y-10">
          <AppointmentSection title="Pending requests" empty="You have no requests waiting for a doctor." appointments={groups.pending}
            expandedId={expandedId} setExpandedId={setExpandedId} cancelId={cancelId} setCancelId={setCancelId}
            cancelReason={cancelReason} setCancelReason={setCancelReason} busy={busy} now={now} onCancel={cancel} />
          <AppointmentSection title="Upcoming confirmed" empty="You have no upcoming confirmed appointments." appointments={groups.confirmed}
            expandedId={expandedId} setExpandedId={setExpandedId} cancelId={cancelId} setCancelId={setCancelId}
            cancelReason={cancelReason} setCancelReason={setCancelReason} busy={busy} now={now} onCancel={cancel} />
          <AppointmentSection title="Previous, rejected, or cancelled" empty="No appointment history yet." appointments={groups.history}
            expandedId={expandedId} setExpandedId={setExpandedId} cancelId={cancelId} setCancelId={setCancelId}
            cancelReason={cancelReason} setCancelReason={setCancelReason} busy={busy} now={now} onCancel={cancel} />
        </div>
      )}
    </main>
  );
}

interface SectionProps {
  title: string;
  empty: string;
  appointments: Appointment[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  cancelId: string | null;
  setCancelId: (id: string | null) => void;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  busy: string | null;
  now: number;
  onCancel: (id: string) => Promise<void>;
}

function AppointmentSection(props: SectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-950">{props.title}</h2>
      {props.appointments.length === 0 ? <p className="mt-4 rounded-2xl bg-white p-5 text-sm text-slate-500">{props.empty}</p> : (
        <div className="mt-4 space-y-4">
          {props.appointments.map((appointment) => {
            const expanded = props.expandedId === appointment.id;
            const cancellable = (appointment.status === "REQUESTED" || appointment.status === "CONFIRMED")
              && new Date(appointment.scheduledStart).getTime() > props.now;
            return (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" key={appointment.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{appointment.doctorName}</h3>
                    <p className="mt-1 text-sm font-medium text-teal-700">{appointment.specializationName}</p>
                    <p className="mt-3 text-sm text-slate-600">{formatAppointmentTime(appointment.scheduledStart)} · {appointment.hospitalName}</p>
                  </div>
                  <StateBadge status={appointment.status} />
                </div>
                <p className="mt-5 text-sm text-slate-700"><span className="font-semibold">Reason:</span> {appointment.symptoms.reasonForVisit}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => props.setExpandedId(expanded ? null : appointment.id)}>
                    {expanded ? "Hide details" : "View details"}
                  </button>
                  {cancellable ? <button className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50" onClick={() => props.setCancelId(props.cancelId === appointment.id ? null : appointment.id)}>Cancel appointment</button> : null}
                </div>
                {expanded ? (
                  <dl className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-5 text-sm sm:grid-cols-2">
                    <Detail label="Department" value={appointment.departmentName} />
                    <Detail label="Symptoms" value={appointment.symptoms.symptoms} />
                    <Detail label="Symptom duration" value={appointment.symptoms.symptomDuration} />
                    <Detail label="Additional notes" value={appointment.symptoms.additionalNotes} />
                    {appointment.doctorRejectionReason ? <Detail label="Doctor rejection reason" value={appointment.doctorRejectionReason} /> : null}
                    {appointment.cancellationReason ? <Detail label="Cancellation reason" value={appointment.cancellationReason} /> : null}
                  </dl>
                ) : null}
                {props.cancelId === appointment.id ? (
                  <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-5">
                    <label className="text-sm font-medium text-rose-900">Cancellation reason (optional)
                      <input className={inputClassName} maxLength={1000} value={props.cancelReason} onChange={(event) => props.setCancelReason(event.target.value)} />
                    </label>
                    <button className="mt-4 rounded-xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={props.busy !== null} onClick={() => void props.onCancel(appointment.id)}>
                      {props.busy === appointment.id ? "Cancelling..." : "Confirm cancellation"}
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return <div><dt className="font-medium text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-slate-900">{value || "Not provided"}</dd></div>;
}

export default function PatientAppointmentsPage() {
  return <ProtectedRoute roles={["PATIENT"]}><PatientAppointmentsContent /></ProtectedRoute>;
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { inputClassName } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { InlineError, PortalHeading, StateBadge, formatAppointmentTime } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import {
  acceptDoctorAppointment,
  cancelDoctorAppointment,
  getDoctorAppointments,
  rejectDoctorAppointment,
} from "@/lib/api";
import type { Appointment } from "@/types/appointments";

type ReasonAction = { id: string; kind: "reject" | "cancel" } | null;

function DoctorAppointmentsContent() {
  const { session } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reasonAction, setReasonAction] = useState<ReasonAction>(null);
  const [reason, setReason] = useState("");
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
      setAppointments((await getDoctorAppointments(session.access_token)).content);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Consultation requests could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
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

  async function accept(appointmentId: string) {
    if (!session) return;
    setBusy(appointmentId);
    setError(null);
    try {
      await acceptDoctorAppointment(session.access_token, appointmentId);
      setMessage("The consultation is confirmed and its time is booked.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The consultation request could not be accepted.");
    } finally {
      setBusy(null);
    }
  }

  async function submitReasonAction() {
    if (!session || !reasonAction || reason.trim().length < 3) return;
    const current = reasonAction;
    setBusy(current.id);
    setError(null);
    try {
      if (current.kind === "reject") {
        await rejectDoctorAppointment(session.access_token, current.id, reason.trim());
        setMessage("The consultation request was declined and its time is available again.");
      } else {
        await cancelDoctorAppointment(session.access_token, current.id, reason.trim());
        setMessage("The confirmed consultation was cancelled and its time is available again.");
      }
      setReasonAction(null);
      setReason("");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The consultation could not be updated.");
    } finally {
      setBusy(null);
    }
  }

  function openReason(id: string, kind: "reject" | "cancel") {
    setReason("");
    setReasonAction({ id, kind });
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading eyebrow="Doctor care requests" title="Online Consultations" backHref="/doctor/dashboard"
        description="Review consultation requests for your published times, including the symptoms each patient submitted." />
      <div className="mt-7 space-y-3">
        <InlineError message={error} />
        {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900" role="status">{message}</div> : null}
      </div>

      {loading ? <LoadingPanel label="Loading consultation requests..." /> : appointments.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No consultation requests are currently waiting for review.</div>
      ) : (
        <div className="mt-9 space-y-10">
          <DoctorAppointmentSection title="Pending Consultation Requests" empty="No consultation requests are currently waiting for review." appointments={groups.pending}
            expandedId={expandedId} setExpandedId={setExpandedId} reasonAction={reasonAction} reason={reason} setReason={setReason}
            busy={busy} now={now} onAccept={accept} onOpenReason={openReason} onSubmitReason={submitReasonAction} />
          <DoctorAppointmentSection title="Upcoming Online Consultations" empty="No upcoming confirmed online consultations." appointments={groups.confirmed}
            expandedId={expandedId} setExpandedId={setExpandedId} reasonAction={reasonAction} reason={reason} setReason={setReason}
            busy={busy} now={now} onAccept={accept} onOpenReason={openReason} onSubmitReason={submitReasonAction} />
          <DoctorAppointmentSection title="Declined, Cancelled, or Previous Consultations" empty="No consultation history yet." appointments={groups.history}
            expandedId={expandedId} setExpandedId={setExpandedId} reasonAction={reasonAction} reason={reason} setReason={setReason}
            busy={busy} now={now} onAccept={accept} onOpenReason={openReason} onSubmitReason={submitReasonAction} />
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
  reasonAction: ReasonAction;
  reason: string;
  setReason: (reason: string) => void;
  busy: string | null;
  now: number;
  onAccept: (id: string) => Promise<void>;
  onOpenReason: (id: string, kind: "reject" | "cancel") => void;
  onSubmitReason: () => Promise<void>;
}

function DoctorAppointmentSection(props: SectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-950">{props.title}</h2>
      {props.appointments.length === 0 ? <p className="mt-4 rounded-2xl bg-white p-5 text-sm text-slate-500">{props.empty}</p> : (
        <div className="mt-4 space-y-4">
          {props.appointments.map((appointment) => {
            const expanded = props.expandedId === appointment.id;
            const reasonOpen = props.reasonAction?.id === appointment.id;
            return (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" key={appointment.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{appointment.patientName}</h3>
                    <p className="mt-2 text-sm text-slate-600">{formatAppointmentTime(appointment.scheduledStart)}</p>
                    <p className="mt-3 text-sm text-slate-700"><span className="font-semibold">Reason:</span> {appointment.symptoms.reasonForVisit}</p>
                  </div>
                  <StateBadge status={appointment.status} />
                </div>
                <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"><span className="font-semibold">Symptoms:</span> {appointment.symptoms.symptoms}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => props.setExpandedId(expanded ? null : appointment.id)}>{expanded ? "Hide details" : "View details"}</button>
                  {appointment.status === "REQUESTED" ? (
                    <>
                      <button className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60" disabled={props.busy !== null} onClick={() => void props.onAccept(appointment.id)}>{props.busy === appointment.id ? "Processing..." : "Accept"}</button>
                      <button className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60" disabled={props.busy !== null} onClick={() => props.onOpenReason(appointment.id, "reject")}>Decline</button>
                    </>
                  ) : null}
                  {appointment.status === "CONFIRMED" && new Date(appointment.scheduledStart).getTime() > props.now ? (
                    <button className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60" disabled={props.busy !== null} onClick={() => props.onOpenReason(appointment.id, "cancel")}>Cancel consultation</button>
                  ) : null}
                </div>
                {expanded ? (
                  <dl className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-5 text-sm sm:grid-cols-2">
                    <Detail label="Requested at" value={formatAppointmentTime(appointment.createdAt)} />
                    <Detail label="Symptom duration" value={appointment.symptoms.symptomDuration} />
                    <Detail label="Additional notes" value={appointment.symptoms.additionalNotes} />
                    {appointment.doctorRejectionReason ? <Detail label="Decline reason" value={appointment.doctorRejectionReason} /> : null}
                    {appointment.cancellationReason ? <Detail label="Cancellation reason" value={appointment.cancellationReason} /> : null}
                  </dl>
                ) : null}
                {reasonOpen ? (
                  <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-5">
                    <label className="text-sm font-medium text-rose-900">{props.reasonAction?.kind === "reject" ? "Decline" : "Cancellation"} reason <span className="text-rose-700">*</span>
                      <textarea className={`${inputClassName} min-h-24 resize-y`} maxLength={1000} minLength={3} required value={props.reason} onChange={(event) => props.setReason(event.target.value)} />
                    </label>
                    <button className="mt-4 rounded-xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={props.busy !== null || props.reason.trim().length < 3} onClick={() => void props.onSubmitReason()}>
                      {props.busy === appointment.id ? "Processing..." : props.reasonAction?.kind === "reject" ? "Confirm decline" : "Confirm cancellation"}
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

export default function DoctorAppointmentsPage() {
  return <ProtectedRoute roles={["DOCTOR"]}><DoctorAppointmentsContent /></ProtectedRoute>;
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { inputClassName } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import {
  ConsultationStatusBadge,
  InlineError,
  PortalHeading,
  StateBadge,
  formatAppointmentTime,
} from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import {
  acceptDoctorAppointment,
  cancelDoctorAppointment,
  getDoctorAppointments,
  rejectDoctorAppointment,
} from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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
  const [activeTab, setActiveTab] = useState<"action_required" | "upcoming" | "past">("action_required");

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setAppointments(
        (await getDoctorAppointments(session.access_token, undefined, 0, 50)).content,
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Consultation requests could not be loaded.",
      );
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
    const ascending = (left: Appointment, right: Appointment) =>
      new Date(left.scheduledStart).getTime() -
      new Date(right.scheduledStart).getTime();
    const descending = (left: Appointment, right: Appointment) =>
      -ascending(left, right);
    return {
      action_required: appointments
        .filter((value) => value.status === "REQUESTED")
        .sort(ascending),
      upcoming: appointments
        .filter(
          (value) =>
            value.status === "CONFIRMED" ||
            value.consultationStatus === "IN_PROGRESS" ||
            value.consultationStatus === "SCHEDULED"
        )
        .sort(ascending),
      past: appointments
        .filter(
          (value) =>
            value.consultationStatus === "COMPLETED" ||
            value.status === "REJECTED" ||
            value.status === "CANCELLED_BY_PATIENT" ||
            value.status === "CANCELLED_BY_DOCTOR" ||
            (value.status !== "REQUESTED" && value.status !== "CONFIRMED" && value.consultationStatus !== "IN_PROGRESS" && value.consultationStatus !== "SCHEDULED")
        )
        .sort(descending),
    };
  }, [appointments]);

  async function accept(appointmentId: string) {
    if (!session) return;
    setBusy(appointmentId);
    setError(null);
    try {
      await acceptDoctorAppointment(session.access_token, appointmentId);
      setMessage("The consultation is confirmed and its time is booked.");
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "The consultation request could not be accepted.",
      );
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
        await rejectDoctorAppointment(
          session.access_token,
          current.id,
          reason.trim(),
        );
        setMessage(
          "The consultation request was declined and its time is available again.",
        );
      } else {
        await cancelDoctorAppointment(
          session.access_token,
          current.id,
          reason.trim(),
        );
        setMessage(
          "The confirmed consultation was cancelled and its time is available again.",
        );
      }
      setReasonAction(null);
      setReason("");
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "The consultation could not be updated.",
      );
    } finally {
      setBusy(null);
    }
  }

  function openReason(id: string, kind: "reject" | "cancel") {
    setReason("");
    setReasonAction({ id, kind });
  }

  return (
    <div className="space-y-8">
      <PortalHeading
        eyebrow="Doctor Portal"
        title="Consultations Manager"
        backHref="/doctor/dashboard"
        description="Review consultation requests, open active workspaces, and browse patient history."
      />

      {(error || message) && (
        <div className="mt-7 space-y-3">
          {error && <InlineError message={error} />}
          {message ? (
            <div
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900"
              role="status"
            >
              {message}
            </div>
          ) : null}
        </div>
      )}

      <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 mb-8 overflow-x-auto hide-scrollbar w-full sm:max-w-md">
        <button
          onClick={() => setActiveTab("action_required")}
          className={`w-full rounded-lg py-2 text-sm font-medium leading-5 ${
            activeTab === "action_required"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
          }`}
        >
          Action Required
          {groups.action_required.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
              {groups.action_required.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`w-full rounded-lg py-2 text-sm font-medium leading-5 ${
            activeTab === "upcoming"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`w-full rounded-lg py-2 text-sm font-medium leading-5 ${
            activeTab === "past"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
          }`}
        >
          Past
        </button>
      </div>

      {loading ? (
        <LoadingPanel label="Loading consultations..." />
      ) : (
        <div className="space-y-4">
          {activeTab === "action_required" && (
            <DoctorAppointmentSection
              emptyTitle="No action required"
              emptyDescription="You have no pending consultation requests waiting for review."
              appointments={groups.action_required}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              reasonAction={reasonAction}
              reason={reason}
              setReason={setReason}
              busy={busy}
              now={now}
              onAccept={accept}
              onOpenReason={openReason}
              onSubmitReason={submitReasonAction}
              tab="action_required"
            />
          )}
          {activeTab === "upcoming" && (
            <DoctorAppointmentSection
              emptyTitle="No upcoming consultations"
              emptyDescription="You have no confirmed consultations scheduled for the future."
              appointments={groups.upcoming}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              reasonAction={reasonAction}
              reason={reason}
              setReason={setReason}
              busy={busy}
              now={now}
              onAccept={accept}
              onOpenReason={openReason}
              onSubmitReason={submitReasonAction}
              tab="upcoming"
            />
          )}
          {activeTab === "past" && (
            <DoctorAppointmentSection
              emptyTitle="No past consultations"
              emptyDescription="You have no completed or cancelled consultations."
              appointments={groups.past}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              reasonAction={reasonAction}
              reason={reason}
              setReason={setReason}
              busy={busy}
              now={now}
              onAccept={accept}
              onOpenReason={openReason}
              onSubmitReason={submitReasonAction}
              tab="past"
            />
          )}
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  emptyTitle: string;
  emptyDescription: string;
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
  tab: "action_required" | "upcoming" | "past";
}

function DoctorAppointmentSection(props: SectionProps) {
  if (props.appointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={props.emptyTitle}
        description={props.emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      {props.appointments.map((appointment) => {
        const expanded = props.expandedId === appointment.id;
        const reasonOpen = props.reasonAction?.id === appointment.id;
        return (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-teal-100 transition-colors"
            key={appointment.id}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-950 truncate">
                    {appointment.patientName}
                  </h3>
                  <StateBadge status={appointment.status} />
                  {appointment.consultationStatus ? (
                    <ConsultationStatusBadge
                      status={appointment.consultationStatus}
                    />
                  ) : null}
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium text-slate-700">
                    {formatAppointmentTime(appointment.scheduledStart)}
                  </p>
                  <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                    <span className="font-medium text-slate-700">Reason:</span>{" "}
                    {appointment.symptoms.reasonForVisit}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => props.setExpandedId(expanded ? null : appointment.id)}
              >
                {expanded ? "Hide details" : "View details"}
              </button>

              {props.tab === "action_required" && appointment.status === "REQUESTED" && (
                <>
                  <button
                    className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60 transition-colors"
                    disabled={props.busy !== null}
                    onClick={() => void props.onAccept(appointment.id)}
                  >
                    {props.busy === appointment.id ? "Processing..." : "Accept"}
                  </button>
                  <button
                    className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60 transition-colors"
                    disabled={props.busy !== null}
                    onClick={() => props.onOpenReason(appointment.id, "reject")}
                  >
                    Decline
                  </button>
                </>
              )}

              {props.tab === "upcoming" && appointment.consultationId && (
                <Link
                  className={buttonVariants()}
                  href={`/doctor/consultations/${appointment.consultationId}`}
                >
                  Open Workspace
                </Link>
              )}

              {props.tab === "upcoming" && appointment.status === "CONFIRMED" && (
                <button
                  className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60 transition-colors"
                  disabled={props.busy !== null}
                  onClick={() => props.onOpenReason(appointment.id, "cancel")}
                >
                  Cancel
                </button>
              )}

              {props.tab === "past" && appointment.consultationId && (
                <Link
                  className={buttonVariants("secondary")}
                  href={`/doctor/consultations/${appointment.consultationId}`}
                >
                  View Record
                </Link>
              )}
            </div>

            {expanded && (
              <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Detail
                    label="Symptoms"
                    value={appointment.symptoms.symptoms}
                  />
                  <Detail
                    label="Symptom duration"
                    value={appointment.symptoms.symptomDuration}
                  />
                  <Detail
                    label="Additional notes"
                    value={appointment.symptoms.additionalNotes}
                  />
                  <Detail
                    label="Requested at"
                    value={formatAppointmentTime(appointment.createdAt)}
                  />
                  {appointment.doctorRejectionReason && (
                    <Detail
                      label="Decline reason"
                      value={appointment.doctorRejectionReason}
                    />
                  )}
                  {appointment.cancellationReason && (
                    <Detail
                      label="Cancellation reason"
                      value={appointment.cancellationReason}
                    />
                  )}
                </dl>
              </div>
            )}

            {reasonOpen && (
              <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-5">
                <label className="block text-sm font-medium text-rose-900 mb-2">
                  {props.reasonAction?.kind === "reject" ? "Decline" : "Cancellation"}{" "}
                  reason <span className="text-rose-700">*</span>
                </label>
                <textarea
                  className={`${inputClassName} min-h-24 resize-y bg-white`}
                  maxLength={1000}
                  minLength={3}
                  required
                  value={props.reason}
                  onChange={(event) => props.setReason(event.target.value)}
                  placeholder="Please provide a reason..."
                />
                <button
                  className="mt-4 rounded-xl bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60 transition-colors"
                  disabled={props.busy !== null || props.reason.trim().length < 3}
                  onClick={() => void props.onSubmitReason()}
                >
                  {props.busy === appointment.id
                    ? "Processing..."
                    : props.reasonAction?.kind === "reject"
                      ? "Confirm decline"
                      : "Confirm cancellation"}
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-slate-900 leading-relaxed">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export default function DoctorAppointmentsPage() {
  return (
    <ProtectedRoute roles={["DOCTOR"]}>
      <DoctorAppointmentsContent />
    </ProtectedRoute>
  );
}


"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Activity, History } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { cancelPatientAppointment, getPatientAppointments } from "@/lib/api";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/forms";
import { Alert } from "@/components/ui/alert";
import { formatDoctorName } from "@/lib/formatters";
import type { Appointment } from "@/types/appointments";

type Tab = "upcoming" | "requests" | "history";

export default function PatientAppointmentsPage() {
  const { session } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

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
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Your online consultations could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (new URLSearchParams(window.location.search).get("created") === "1") {
        setMessage(
          "Your online consultation request was submitted. The doctor can now review it.",
        );
        setActiveTab("requests");
      }
      setNow(Date.now());
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const groups = useMemo(() => {
    const asc = (a: Appointment, b: Appointment) =>
      new Date(a.scheduledStart).getTime() -
      new Date(b.scheduledStart).getTime();
    const desc = (a: Appointment, b: Appointment) =>
      new Date(b.scheduledStart).getTime() -
      new Date(a.scheduledStart).getTime();

    return {
      upcoming: appointments
        .filter(
          (a) =>
            a.status === "CONFIRMED" ||
            a.consultationStatus === "IN_PROGRESS" ||
            a.consultationStatus === "SCHEDULED",
        )
        .sort(asc),
      requests: appointments.filter((a) => a.status === "REQUESTED").sort(asc),
      history: appointments
        .filter(
          (a) =>
            a.status !== "REQUESTED" &&
            a.status !== "CONFIRMED" &&
            a.consultationStatus !== "IN_PROGRESS" &&
            a.consultationStatus !== "SCHEDULED",
        )
        .sort(desc),
    };
  }, [appointments]);

  async function cancel(appointmentId: string) {
    if (!session) return;
    setBusy(appointmentId);
    setError(null);
    try {
      await cancelPatientAppointment(
        session.access_token,
        appointmentId,
        cancelReason.trim(),
      );
      setCancelId(null);
      setCancelReason("");
      setMessage("The consultation was cancelled.");
      await load();
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "The consultation could not be cancelled.",
      );
    } finally {
      setBusy(null);
    }
  }

  function getStatusBadge(appointment: Appointment) {
    if (appointment.status === "REQUESTED") {
      return <StatusBadge tone="warning">Awaiting Doctor Response</StatusBadge>;
    }
    if (appointment.consultationStatus === "IN_PROGRESS") {
      return <StatusBadge tone="info">In Progress</StatusBadge>;
    }
    if (
      appointment.status === "CONFIRMED" ||
      appointment.consultationStatus === "SCHEDULED"
    ) {
      return <StatusBadge tone="success">Scheduled</StatusBadge>;
    }
    if (appointment.consultationStatus === "COMPLETED") {
      return <StatusBadge tone="neutral">Completed</StatusBadge>;
    }
    if (appointment.status === "REJECTED") {
      return <StatusBadge tone="error">Declined</StatusBadge>;
    }
    if (appointment.status === "CANCELLED_BY_PATIENT") {
      return <StatusBadge tone="neutral">Cancelled by You</StatusBadge>;
    }
    if (appointment.status === "CANCELLED_BY_DOCTOR") {
      return <StatusBadge tone="neutral">Cancelled by Doctor</StatusBadge>;
    }
    return <StatusBadge tone="neutral">{appointment.status}</StatusBadge>;
  }

  const renderList = (
    list: Appointment[],
    emptyTitle: string,
    emptyDesc: string,
    emptyIcon: React.ElementType,
  ) => {
    if (list.length === 0) {
      return (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDesc}
          action={
            <Link
              href="/patient/doctors"
              className={buttonVariants("secondary")}
            >
              Find a Doctor
            </Link>
          }
        />
      );
    }

    return (
      <div className="space-y-6">
        {list.map((appointment) => {
          const expanded = expandedId === appointment.id;
          const cancellable =
            appointment.status === "REQUESTED" &&
            new Date(appointment.scheduledStart).getTime() > now &&
            (!appointment.consultationStatus ||
              appointment.consultationStatus === "SCHEDULED");

          return (
            <SectionCard key={appointment.id}>
              <div className="flex flex-col sm:flex-row gap-6 items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    {formatDoctorName(appointment.doctorName)}
                  </h3>
                  <p className="font-medium text-teal-700 text-sm mb-3">
                    {appointment.specializationName}
                  </p>
                  <p className="text-sm text-slate-600 mb-1">
                    {formatAppointmentTime(appointment.scheduledStart)}
                  </p>
                  <p className="text-sm text-slate-600">
                    {appointment.hospitalName}
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                  {getStatusBadge(appointment)}
                  {appointment.consultationId && (
                    <Link
                      href={`/patient/consultations/${appointment.consultationId}`}
                      className={buttonVariants("primary")}
                    >
                      Open Consultation
                    </Link>
                  )}
                </div>
              </div>

              {appointment.status === "REJECTED" &&
                appointment.doctorRejectionReason && (
                  <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm">
                    <span className="font-semibold text-rose-900 block mb-1">
                      Reason for decline:
                    </span>
                    <span className="text-rose-800">
                      {appointment.doctorRejectionReason}
                    </span>
                  </div>
                )}

              {appointment.status.startsWith("CANCELLED") &&
                appointment.cancellationReason && (
                  <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                    <span className="font-semibold text-slate-900 block mb-1">
                      Cancellation reason:
                    </span>
                    <span className="text-slate-700">
                      {appointment.cancellationReason}
                    </span>
                  </div>
                )}

              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setExpandedId(expanded ? null : appointment.id)
                    }
                  >
                    {expanded ? "Hide Details" : "View Details"}
                  </Button>
                  {cancellable && (
                    <Button
                      variant="danger"
                      onClick={() =>
                        setCancelId(
                          cancelId === appointment.id ? null : appointment.id,
                        )
                      }
                    >
                      Cancel Request
                    </Button>
                  )}
                </div>

                {expanded && (
                  <dl className="mt-6 grid gap-6 sm:grid-cols-2 text-sm bg-slate-50 p-5 rounded-2xl">
                    <div>
                      <dt className="text-slate-500 font-medium mb-1">
                        Reason for consultation
                      </dt>
                      <dd className="font-medium text-slate-900">
                        {appointment.symptoms.reasonForVisit}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 font-medium mb-1">
                        Symptoms
                      </dt>
                      <dd className="font-medium text-slate-900">
                        {appointment.symptoms.symptoms}
                      </dd>
                    </div>
                    {appointment.symptoms.symptomDuration && (
                      <div>
                        <dt className="text-slate-500 font-medium mb-1">
                          Duration
                        </dt>
                        <dd className="font-medium text-slate-900">
                          {appointment.symptoms.symptomDuration}
                        </dd>
                      </div>
                    )}
                    {appointment.symptoms.additionalNotes && (
                      <div className="sm:col-span-2">
                        <dt className="text-slate-500 font-medium mb-1">
                          Additional notes
                        </dt>
                        <dd className="font-medium text-slate-900 whitespace-pre-wrap">
                          {appointment.symptoms.additionalNotes}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}

                {cancelId === appointment.id && (
                  <div className="mt-6 p-5 rounded-2xl bg-rose-50 border border-rose-100">
                    <Label
                      htmlFor={`cancel-${appointment.id}`}
                      className="text-rose-900"
                    >
                      Cancellation reason (optional)
                    </Label>
                    <Textarea
                      id={`cancel-${appointment.id}`}
                      className="mt-2 min-h-24"
                      maxLength={1000}
                      value={cancelReason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelReason(e.target.value)}
                    />
                    <div className="mt-4 flex gap-3">
                      <Button
                        variant="danger"
                        loading={busy === appointment.id}
                        onClick={() => void cancel(appointment.id)}
                      >
                        Confirm Cancellation
                      </Button>
                      <Button variant="ghost" onClick={() => setCancelId(null)}>
                        Keep Consultation
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute roles={["PATIENT"]}>
        <LoadingPanel label="Loading your consultations..." />
      </ProtectedRoute>
    );
  }

  const currentTab = activeTab || (groups.upcoming.length === 0 && groups.requests.length > 0 ? "requests" : "upcoming");

  console.log("DEBUG FRONTEND APPOINTMENTS:", appointments);
  console.log("DEBUG FRONTEND GROUPS:", groups);

  return (
    <ProtectedRoute roles={["PATIENT"]}>
      <div className="space-y-8">
        <PortalHeading
          eyebrow="Patient Care"
          title="My Consultations"
          backHref="/patient/dashboard"
          description="Manage your consultation requests, upcoming sessions and history."
        />

        {error && (
          <Alert tone="error" className="mb-6">
            {error}
          </Alert>
        )}
        {message && (
          <Alert tone="success" className="mb-6">
            {message}
          </Alert>
        )}

        <div className="mb-8 border-b border-slate-200 overflow-x-auto hide-scrollbar">
          <nav className="-mb-px flex gap-6 min-w-max" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold transition-colors
                ${currentTab === "upcoming" ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"}
              `}
            >
              <Calendar className="inline-block size-4 mr-2 mb-0.5" />
              Upcoming
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {groups.upcoming.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold transition-colors
                ${currentTab === "requests" ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"}
              `}
            >
              <Clock className="inline-block size-4 mr-2 mb-0.5" />
              Requests
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {groups.requests.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold transition-colors
                ${currentTab === "history" ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"}
              `}
            >
              <History className="inline-block size-4 mr-2 mb-0.5" />
              History
            </button>
          </nav>
        </div>

        <div>
          {currentTab === "upcoming" &&
            renderList(
              groups.upcoming,
              "No upcoming consultations",
              "You don't have any confirmed or scheduled consultations.",
              Calendar,
            )}

          {currentTab === "requests" &&
            renderList(
              groups.requests,
              "No pending requests",
              "You don't have any consultation requests waiting for a doctor's response.",
              Activity,
            )}

          {currentTab === "history" &&
            renderList(
              groups.history,
              "No consultation history",
              "You haven't completed or cancelled any consultations yet.",
              History,
            )}
        </div>
      </div>
    </ProtectedRoute>
  );
}


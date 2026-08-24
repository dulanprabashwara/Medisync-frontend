"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { getPatientAppointments, getPatientPrescriptions } from "@/lib/api";
import { formatDoctorName } from "@/lib/formatters";
import { LoadingPanel } from "@/components/loading-panel";
import { SectionCard, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Appointment } from "@/types/appointments";
import type { PatientPrescriptionSummary } from "@/types/prescriptions";

function PatientDashboardContent() {
  const { profile, session } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<
    PatientPrescriptionSummary[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [now, setNow] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0);
    async function loadData() {
      if (!session) return;
      try {
        const [apptsData, presData] = await Promise.all([
          getPatientAppointments(session.access_token),
          getPatientPrescriptions(session.access_token, 0, 50),
        ]);
        setAppointments(apptsData.content);
        setPrescriptions(presData.content);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session]);

  const { upcoming, pendingRequests, history } = useMemo(() => {
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
            (a.status === "CONFIRMED" ||
              a.consultationStatus === "IN_PROGRESS" ||
              a.consultationStatus === "SCHEDULED") &&
            (new Date(a.scheduledStart).getTime() > now ||
              a.consultationStatus === "IN_PROGRESS"),
        )
        .sort(asc),
      pendingRequests: appointments
        .filter((a) => a.status === "REQUESTED")
        .sort(asc),
      history: appointments
        .filter(
          (a) =>
            a.consultationStatus === "COMPLETED" ||
            (a.status !== "REQUESTED" &&
              a.status !== "CONFIRMED" &&
              a.consultationStatus !== "IN_PROGRESS" &&
              a.consultationStatus !== "SCHEDULED"),
        )
        .sort(desc),
    };
  }, [appointments, now]);

  const { pendingPayments, activePrescriptions } = useMemo(() => {
    return {
      pendingPayments: prescriptions.filter(
        (p) =>
          p.doctorFeeStatus === "AWAITING_CONFIRMATION" &&
          p.status === "ISSUED",
      ),
      activePrescriptions: prescriptions.filter(
        (p) =>
          p.status === "ISSUED" &&
          p.dispensingStatus === "NOT_DISPENSED" &&
          !p.expired,
      ),
    };
  }, [prescriptions]);

  const nextConsultation = upcoming[0];
  const attentionItem = pendingPayments[0]
    ? {
        type: "payment",
        title: "Prescription issued",
        message:
          "Your doctor has issued a prescription. Payment is awaiting confirmation.",
        actionLabel: "Open Consultation",
        href: `/patient/consultations/${pendingPayments[0].consultationId}`,
        icon: AlertCircle,
        tone: "border-amber-200 bg-amber-50 text-amber-900",
      }
    : pendingRequests[0]
      ? {
          type: "request",
          title: "Consultation request awaiting response",
          message: `Your request to ${formatDoctorName(pendingRequests[0].doctorName)} is pending.`,
          actionLabel: "View Request",
          href: "/patient/appointments",
          icon: Calendar,
          tone: "border-sky-200 bg-sky-50 text-sky-900",
        }
      : null;

  if (loading) return <LoadingPanel label="Loading your dashboard..." />;

  const isNewPatient = appointments.length === 0 && prescriptions.length === 0;

  return (
    <div>
      <PortalHeading
        eyebrow="Patient Portal"
        title={`Welcome back, ${profile?.firstName ?? "Patient"}`}
        description={
          isNewPatient
            ? "Welcome to MediSync. Find a verified doctor and request your first online consultation."
            : "Here’s what’s happening with your care."
        }
        backHref=""
        action={
          <Link href="/patient/doctors" className={buttonVariants()}>
            <Search className="size-4 mr-2" />
            Find a Doctor
          </Link>
        }
      />

      {isNewPatient ? (
        <EmptyState
          icon={Activity}
          title="You don’t have any consultations yet"
          description="Find a verified doctor and request your first online consultation."
          action={
            <Link href="/patient/doctors" className={buttonVariants()}>
              Find a Doctor
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {attentionItem && (
                <div className={`rounded-2xl border p-5 ${attentionItem.tone}`}>
                  <div className="flex items-start gap-4">
                    <attentionItem.icon className="size-5 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{attentionItem.title}</h3>
                      <p className="mt-1 text-sm">{attentionItem.message}</p>
                      <Link
                        href={attentionItem.href}
                        className={`${buttonVariants("secondary")} mt-4 border-none bg-white/60 hover:bg-white shadow-sm`}
                      >
                        {attentionItem.actionLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {nextConsultation ? (
                <SectionCard title="Next Consultation">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-950">
                        {formatDoctorName(nextConsultation.doctorName)}
                      </h3>
                      <p className="text-sm font-medium text-teal-700">
                        {nextConsultation.specializationName}
                      </p>
                      <div className="mt-4 space-y-1">
                        <p className="text-sm text-slate-600">
                          {formatAppointmentTime(
                            nextConsultation.scheduledStart,
                          )}
                        </p>
                        <p className="text-sm text-slate-600">
                          {nextConsultation.hospitalName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-3">
                      <StatusBadge
                        tone={
                          nextConsultation.consultationStatus === "IN_PROGRESS"
                            ? "info"
                            : "success"
                        }
                      >
                        {nextConsultation.consultationStatus === "IN_PROGRESS"
                          ? "In Progress"
                          : "Scheduled"}
                      </StatusBadge>
                      {nextConsultation.consultationId && (
                        <Link
                          href={`/patient/consultations/${nextConsultation.consultationId}`}
                          className={buttonVariants("secondary")}
                        >
                          View Consultation
                        </Link>
                      )}
                    </div>
                  </div>
                </SectionCard>
              ) : (
                <SectionCard title="Next Consultation">
                  <EmptyState
                    icon={Calendar}
                    title="No upcoming consultations"
                    description="Find a verified doctor and request an online consultation."
                    action={
                      <Link
                        href="/patient/doctors"
                        className={buttonVariants("secondary")}
                      >
                        Find a Doctor
                      </Link>
                    }
                  />
                </SectionCard>
              )}
            </div>

            <div className="space-y-6">
              <StatCard
                label="Upcoming"
                value={upcoming.length}
                icon={Calendar}
              />
              <StatCard
                label="Pending Requests"
                value={pendingRequests.length}
                icon={Activity}
              />
              <StatCard
                label="Active Prescriptions"
                value={activePrescriptions.length}
                icon={FileText}
              />
            </div>
          </div>

          {history.length > 0 && (
            <SectionCard title="Recent Consultations">
              <div className="divide-y divide-slate-100">
                {history.slice(0, 3).map((appt) => (
                  <div
                    key={appt.id}
                    className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">
                        {formatDoctorName(appt.doctorName)}
                      </p>
                      <p className="text-sm text-slate-500">
                        Completed ·{" "}
                        {new Date(appt.scheduledStart).toLocaleDateString()}
                      </p>
                    </div>
                    {appt.consultationId && (
                      <Link
                        href={`/patient/consultations/${appt.consultationId}`}
                        className="text-sm font-medium text-teal-700 hover:text-teal-800"
                      >
                        View
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}

export default function PatientDashboardPage() {
  return (
    <ProtectedRoute roles={["PATIENT"]}>
      <PatientDashboardContent />
    </ProtectedRoute>
  );
}

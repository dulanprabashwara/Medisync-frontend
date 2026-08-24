"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  FileText,
} from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { formatDoctorName } from "@/lib/formatters";
import { getDoctorAppointments, getDoctorPrescriptions, getDoctorProfile } from "@/lib/api";
import { LoadingPanel } from "@/components/loading-panel";
import { SectionCard, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import type { Appointment } from "@/types/appointments";
import type { DoctorPrescription } from "@/types/prescriptions";
import type { DoctorProfessionalProfile } from "@/types/user";

function DoctorDashboardContent() {
  const { profile: user, session } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfessionalProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<DoctorPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0);
    async function loadData() {
      if (!session) return;
      try {
        const [profileData, apptsData, presData] = await Promise.all([
          getDoctorProfile(session.access_token),
          getDoctorAppointments(session.access_token, undefined, 0, 50),
          getDoctorPrescriptions(session.access_token, 0, 50)
        ]);
        setDoctorProfile(profileData);
        setAppointments(apptsData.content);
        setPrescriptions(presData.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
    return () => clearTimeout(timer);
  }, [session]);

  const { upcoming, pendingRequests, scheduledToday, pendingPayments } = useMemo(() => {
    const asc = (a: Appointment, b: Appointment) =>
      new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime();
      
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingAppointments = appointments
      .filter((a) => (a.status === "CONFIRMED" || a.consultationStatus === "IN_PROGRESS" || a.consultationStatus === "SCHEDULED") && (new Date(a.scheduledStart).getTime() > now || a.consultationStatus === "IN_PROGRESS"))
      .sort(asc);

    return {
      upcoming: upcomingAppointments,
      pendingRequests: appointments.filter((a) => a.status === "REQUESTED").sort(asc),
      scheduledToday: appointments.filter((a) => 
        (a.status === "CONFIRMED" || a.consultationStatus === "IN_PROGRESS" || a.consultationStatus === "SCHEDULED") && 
        new Date(a.scheduledStart).getTime() >= today.getTime() && 
        new Date(a.scheduledStart).getTime() < tomorrow.getTime()
      ),
      pendingPayments: prescriptions.filter((p) => p.doctorFeeStatus === "AWAITING_CONFIRMATION" && p.status === "ISSUED")
    };
  }, [appointments, prescriptions, now]);

  if (loading) return <LoadingPanel label="Loading doctor dashboard..." />;

  if (!doctorProfile) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-950">
          {error ?? "Your professional profile could not be loaded."}
        </div>
      </main>
    );
  }

  const verified = doctorProfile.verificationStatus === "VERIFIED";

  if (!verified) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        <PortalHeading
          eyebrow="Doctor Portal"
          title={`Welcome, ${formatDoctorName(`${user?.firstName || ""} ${user?.lastName || ""}`.trim())}`}
          description="Your professional profile is not yet verified."
          backHref=""
        />
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
           <h2 className="text-xl font-semibold text-amber-900">Verification Required</h2>
           <p className="mt-2 text-amber-800">
             You need to complete your professional profile and be verified by an administrator before you can use clinical features.
           </p>
           <div className="mt-6">
             <Link href="/doctor/profile" className={buttonVariants()}>
               Go to Profile
             </Link>
           </div>
        </div>
      </div>
    );
  }

  const nextConsultation = upcoming[0];
  const attentionItem = pendingPayments[0] ? {
    title: "Payment Confirmation Required",
    message: "A prescription payment needs your confirmation.",
    actionLabel: "Review Prescription",
    href: `/doctor/prescriptions`,
    icon: AlertCircle,
    tone: "border-amber-200 bg-amber-50 text-amber-900",
  } : pendingRequests[0] ? {
    title: "Consultation request needs review",
    message: `You have ${pendingRequests.length} pending consultation request${pendingRequests.length > 1 ? 's' : ''}.`,
    actionLabel: "Review Requests",
    href: "/doctor/appointments",
    icon: Activity,
    tone: "border-sky-200 bg-sky-50 text-sky-900",
  } : null;

  return (
    <div className="mx-auto max-w-7xl">
      <PortalHeading
        eyebrow="Doctor Portal"
        title={`Good morning, ${formatDoctorName(`${user?.firstName || ""} ${user?.lastName || ""}`.trim())}`}
        description="Here's your clinical activity for today."
        backHref=""
        action={
          <Link href="/doctor/availability" className={buttonVariants()}>
            <Clock className="size-4 mr-2" />
            Manage Availability
          </Link>
        }
      />
      
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Pending Requests"
              value={pendingRequests.length}
              helperText="Needs review"
              icon={Activity}
            />
            <StatCard
              label="Awaiting Payment"
              value={pendingPayments.length}
              helperText="Confirmations needed"
              icon={FileText}
            />
            <StatCard
              label="Scheduled Today"
              value={scheduledToday.length}
              helperText="Confirmed appointments"
              icon={Calendar}
            />
        </div>
        
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
                        {nextConsultation.patientName}
                      </h3>
                      <div className="mt-4 space-y-1">
                        <p className="text-sm text-slate-600">
                          {formatAppointmentTime(nextConsultation.scheduledStart)}
                        </p>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={`/doctor/consultations/${nextConsultation.consultationId || nextConsultation.id}`}
                          className={buttonVariants()}
                        >
                          Open Workspace
                        </Link>
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
                    </div>
                  </div>
              </SectionCard>
            ) : (
              <SectionCard title="Next Consultation">
                <EmptyState
                  icon={Calendar}
                  title="No upcoming consultations"
                  description="You have no confirmed consultations scheduled for the near future."
                  action={
                    <Link href="/doctor/availability" className={buttonVariants("secondary")}>
                      Manage Availability
                    </Link>
                  }
                />
              </SectionCard>
            )}
          </div>
          
          <div className="space-y-6">
              <SectionCard title="Upcoming Schedule">
                {upcoming.length > 0 ? (
                  <div className="space-y-4">
                    {upcoming.slice(0, 5).map((appt) => (
                      <div key={appt.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 p-4 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium text-slate-900">{appt.patientName}</p>
                            <p className="text-sm text-slate-500 mt-1">
                              {new Date(appt.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {upcoming.length > 5 && (
                      <Link href="/doctor/appointments" className="block text-center text-sm font-medium text-teal-700 hover:text-teal-800 p-2">
                        View all upcoming
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No appointments scheduled.</p>
                )}
              </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboardPage() {
  return (
    <ProtectedRoute roles={["DOCTOR"]}>
      <DoctorDashboardContent />
    </ProtectedRoute>
  );
}

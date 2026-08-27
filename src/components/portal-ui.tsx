import Link from "next/link";
import type { AppointmentStatus, SlotStatus } from "@/types/appointments";
import type { ConsultationStatus } from "@/types/consultations";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { Alert } from "@/components/ui/alert";

import { ChevronLeft } from "lucide-react";

export function PortalHeading({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Back to dashboard",
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.055)] sm:p-6 lg:p-7">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-[var(--portal-accent)]" />
      <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-[var(--portal-accent-soft)] opacity-60 blur-3xl" />
      {backHref && (
        <Link
          className="relative inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-[var(--portal-accent)] transition-colors mb-4"
          href={backHref}
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          {backLabel}
        </Link>
      )}
      <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--portal-accent)]">
              <span className="h-px w-6 bg-[var(--portal-accent)] opacity-70" />
              {eyebrow}
            </p>
          )}
          <h1 className="text-[28px] font-bold tracking-[-0.025em] text-slate-950 sm:text-[32px]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-3xl text-sm md:text-[15px] leading-relaxed text-slate-600">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 sm:pb-0.5">{action}</div>}
      </div>
    </div>
  );
}

export function StateBadge({
  status,
}: {
  status: AppointmentStatus | SlotStatus;
}) {
  const labels: Record<AppointmentStatus | SlotStatus, string> = {
    AVAILABLE: "Available",
    RESERVED: "Request pending",
    BOOKED: "Booked",
    BLOCKED: "Unavailable",
    REQUESTED: "Consultation requested",
    CONFIRMED: "Consultation confirmed",
    REJECTED: "Consultation request declined",
    CANCELLED_BY_PATIENT: "Cancelled by patient",
    CANCELLED_BY_DOCTOR: "Cancelled by doctor",
  };
  const tone: StatusTone =
    status === "AVAILABLE" || status === "CONFIRMED"
      ? "success"
      : status === "REQUESTED" || status === "RESERVED"
        ? "warning"
        : status === "BOOKED"
          ? "info"
          : "neutral";
  return <StatusBadge tone={tone}>{labels[status]}</StatusBadge>;
}

export function formatAppointmentTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ConsultationStatusBadge({
  status,
}: {
  status: ConsultationStatus;
}) {
  const labels: Record<ConsultationStatus, string> = {
    SCHEDULED: "Scheduled",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  const tones: Record<ConsultationStatus, StatusTone> = {
    SCHEDULED: "warning",
    IN_PROGRESS: "info",
    COMPLETED: "success",
    CANCELLED: "neutral",
  };
  return <StatusBadge tone={tones[status]}>{labels[status]}</StatusBadge>;
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4">
      <Alert tone="error">{message}</Alert>
    </div>
  );
}

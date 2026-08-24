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
  backHref: string;
  backLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {backHref && (
        <Link
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4"
          href={backHref}
        >
          <ChevronLeft className="size-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700 mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm md:text-[15px] leading-relaxed text-slate-600">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
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

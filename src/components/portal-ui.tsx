import Link from "next/link";
import type { AppointmentStatus, SlotStatus } from "@/types/appointments";

export function PortalHeading({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Back to dashboard",
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel?: string;
}) {
  return (
    <div>
      <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href={backHref}>
        ← {backLabel}
      </Link>
      <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-600">{description}</p>
    </div>
  );
}

export function StateBadge({ status }: { status: AppointmentStatus | SlotStatus }) {
  const tone = status === "AVAILABLE" || status === "CONFIRMED"
    ? "bg-emerald-100 text-emerald-800"
    : status === "REQUESTED" || status === "RESERVED"
      ? "bg-amber-100 text-amber-900"
      : status === "BOOKED"
        ? "bg-teal-100 text-teal-800"
        : "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide ${tone}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function formatAppointmentTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800" role="alert">
      {message}
    </div>
  );
}

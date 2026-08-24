import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export type AlertTone = "info" | "success" | "warning" | "error" | "neutral";

export function Alert({
  tone = "info",
  title,
  icon,
  children,
  className = "",
}: {
  tone?: AlertTone;
  title?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-sky-200 bg-sky-50 text-sky-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    neutral: "border-slate-200 bg-slate-50 text-slate-800",
  };

  const defaultIcons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
    neutral: Info,
  };

  const Icon = icon || defaultIcons[tone];

  return (
    <div
      className={`rounded-xl border p-4 ${tones[tone]} ${className}`}
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
    >
      <div className="flex gap-3">
        <Icon className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 text-sm leading-6">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

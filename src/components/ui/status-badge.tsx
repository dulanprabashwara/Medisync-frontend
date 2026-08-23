import type { ReactNode } from "react";

export type StatusTone = "success" | "warning" | "error" | "info" | "neutral";

export function StatusBadge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-900",
    error: "bg-rose-100 text-rose-800",
    info: "bg-sky-100 text-sky-800",
    neutral: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

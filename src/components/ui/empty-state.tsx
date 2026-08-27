import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-[22px] border border-dashed border-slate-300 bg-linear-to-b from-slate-50/80 to-white px-6 py-12 text-center ${className}`}
    >
      <div className="pointer-events-none absolute -top-14 size-32 rounded-full bg-[var(--portal-accent-soft)] opacity-50 blur-3xl" />
      {Icon && (
        <div className="relative mb-4 flex size-14 items-center justify-center rounded-2xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5">
          <Icon className="size-6 text-[var(--portal-accent)]" aria-hidden="true" />
        </div>
      )}
      <h3 className="relative text-base font-bold text-slate-950">{title}</h3>
      {description && (
        <p className="relative mt-1.5 text-sm leading-6 text-slate-500 max-w-md">{description}</p>
      )}
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  );
}

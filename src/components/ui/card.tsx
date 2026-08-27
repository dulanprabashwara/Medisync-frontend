import { useId, type ReactNode } from "react";

export function SectionCard({
  title,
  description,
  action,
  children,
  footer,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const headingId = useId();
  return (
    <section
      className={`relative rounded-[22px] border border-slate-200/90 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.045)] overflow-hidden transition-[border-color,box-shadow,transform] duration-200 hover:border-slate-300/90 hover:shadow-[0_14px_38px_rgba(15,23,42,0.065)] ${className}`}
      aria-labelledby={title ? headingId : undefined}
    >
      {(title || description || action) && (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 bg-linear-to-r from-slate-50/80 via-white to-white">
          <div className="min-w-0">
            {title && (
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-1 rounded-full bg-[var(--portal-accent)]" />
                <h2 id={headingId} className="text-base font-bold leading-6 text-slate-950">
                  {title}
                </h2>
              </div>
            )}
            {description && (
              <p className={`${title ? "ml-3.5" : ""} mt-1.5 max-w-3xl text-sm leading-6 text-slate-500`}>{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="p-5 sm:p-6 lg:p-7">{children}</div>

      {footer && (
        <div className="bg-slate-50/80 px-5 py-4 sm:px-6 border-t border-slate-100">
          {footer}
        </div>
      )}
    </section>
  );
}

export function StatCard({
  label,
  value,
  helperText,
  icon: Icon,
  className = "",
}: {
  label: string;
  value: string | number;
  helperText?: string;
  icon?: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[22px] border border-slate-200/90 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)] ${className}`}
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[var(--portal-accent)] to-transparent opacity-80" />
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</h3>
        {Icon && (
          <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--portal-accent-soft)] transition-transform duration-200 group-hover:scale-105">
            <Icon className="size-5 text-[var(--portal-accent)] shrink-0" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950">
        {value}
      </p>
      {helperText && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

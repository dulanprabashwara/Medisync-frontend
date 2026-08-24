import type { ReactNode } from "react";

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
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}
    >
      {(title || description || action) && (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-100">
          <div>
            {title && (
              <h2 className="text-base font-semibold leading-6 text-slate-950">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="p-5 sm:p-6">{children}</div>

      {footer && (
        <div className="bg-slate-50 px-5 py-4 sm:px-6 border-t border-slate-100">
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
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium text-slate-500">{label}</h3>
        {Icon && (
          <Icon className="size-5 text-slate-400 shrink-0" aria-hidden="true" />
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      {helperText && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

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
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center ${className}`}>
      {Icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <Icon className="size-6 text-slate-400" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

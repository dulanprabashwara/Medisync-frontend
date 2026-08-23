import type { ReactNode } from "react";

export function Table({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <table className="w-full text-left text-sm text-slate-600">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">{children}</thead>;
}

export function TableRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tr className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${className}`}>{children}</tr>;
}

export function TableHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`whitespace-nowrap px-6 py-4 font-semibold text-slate-700 ${className}`}>{children}</th>;
}

export function TableCell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-6 py-4 ${className}`}>{children}</td>;
}

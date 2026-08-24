import { Loader2 } from "lucide-react";

export function LoadingPanel({
  label = "Loading MediSync…",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex min-h-[45vh] items-center justify-center"
      role="status"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
        <Loader2 className="size-5 animate-spin text-teal-600 shrink-0" />
        {label}
      </div>
    </div>
  );
}

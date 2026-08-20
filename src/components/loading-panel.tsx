export function LoadingPanel({ label = "Loading MediSync…" }: { label?: string }) {
  return (
    <div className="flex min-h-[45vh] items-center justify-center" role="status">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
        <span className="size-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        {label}
      </div>
    </div>
  );
}

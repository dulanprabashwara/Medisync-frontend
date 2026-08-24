export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500 shadow-sm">
      {message}
    </div>
  );
}

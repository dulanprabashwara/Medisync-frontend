import { Loader2 } from "lucide-react";
import { HeartbeatLoader } from "./heartbeat-loader";

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
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-6 text-sm font-medium text-slate-600 shadow-sm">
        <HeartbeatLoader size={48} />
        {label}
      </div>
    </div>
  );
}

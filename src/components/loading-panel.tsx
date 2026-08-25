import { HeartbeatLoader } from "./heartbeat-loader";

export function LoadingPanel({ label }: { label?: string }) {
  return (
    <div
      className="flex min-h-[45vh] items-center justify-center"
      role="status"
    >
      <div className="flex flex-col items-center justify-center p-8">
        <HeartbeatLoader size={96} />
        {label && <p className="mt-4 text-sm text-slate-500">{label}</p>}
      </div>
    </div>
  );
}

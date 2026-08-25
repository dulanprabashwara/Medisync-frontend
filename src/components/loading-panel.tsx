import { Loader2 } from "lucide-react";
import { HeartbeatLoader } from "./heartbeat-loader";

export function LoadingPanel(_props: {
  label?: string;
}) {
  return (
    <div
      className="flex min-h-[45vh] items-center justify-center"
      role="status"
    >
      <div className="flex flex-col items-center justify-center p-8">
        <HeartbeatLoader size={96} />
      </div>
    </div>
  );
}

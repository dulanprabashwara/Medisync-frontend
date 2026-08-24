import { StatusPanel } from "@/components/status-panel";

export default function NotFound() {
  return (
    <StatusPanel
      title="Page not found"
      message="The page you requested is not available in this MediSync phase."
      actionHref="/"
      actionLabel="Return home"
    />
  );
}

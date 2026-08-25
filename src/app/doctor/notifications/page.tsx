import { NotificationsPage } from "@/components/notifications/notifications-page";
import { ProtectedRoute } from "@/components/protected-route";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Doctor Dashboard | MediSync",
};

export default function DoctorNotificationsPage() {
  return (
    <ProtectedRoute roles={["DOCTOR"]}>
      <NotificationsPage />
    </ProtectedRoute>
  );
}

import { NotificationsPage } from "@/components/notifications/notifications-page";
import { ProtectedRoute } from "@/components/protected-route";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Admin Dashboard | MediSync",
};

export default function AdminNotificationsPage() {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <NotificationsPage />
    </ProtectedRoute>
  );
}

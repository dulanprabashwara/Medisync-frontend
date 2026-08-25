import { NotificationsPage } from "@/components/notifications/notifications-page";
import { ProtectedRoute } from "@/components/protected-route";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Patient Dashboard | MediSync",
};

export default function PatientNotificationsPage() {
  return (
    <ProtectedRoute roles={["PATIENT"]}>
      <NotificationsPage />
    </ProtectedRoute>
  );
}

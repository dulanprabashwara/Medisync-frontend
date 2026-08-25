import { NotificationsPage } from "@/components/notifications/notifications-page";
import { ProtectedRoute } from "@/components/protected-route";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Pharmacist Dashboard | MediSync",
};

export default function PharmacistNotificationsPage() {
  return (
    <ProtectedRoute roles={["PHARMACIST"]}>
      <NotificationsPage />
    </ProtectedRoute>
  );
}

"use client";

import { PortalHeading } from "@/components/portal-ui";
import { ProfileImageEditor } from "@/components/profile-image-editor";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { AdminProfileEditor } from "@/components/admin-profile-editor";
import { AdminNavigation } from "@/components/admin-navigation";
import { AccountSettingsDangerZone } from "@/components/account-settings-danger-zone";

function AdminProfileContent() {
  const { profile } = useAuth();
  
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-8 lg:py-14">
      <AdminNavigation />
      <PortalHeading 
        eyebrow="Admin Profile" 
        title={`${profile?.firstName ?? "Administrator"} Profile`}
        description="Manage your administration account details and profile picture."
        backHref="/admin/dashboard" 
      />
      <ProfileImageEditor />
      <AdminProfileEditor />
    </main>
  );
}

export default function AdminProfilePage() {
  return <ProtectedRoute roles={["ADMIN"]}><AdminProfileContent /></ProtectedRoute>;
}

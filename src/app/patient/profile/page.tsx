"use client";

import { PortalHeading } from "@/components/portal-ui";
import { ProfileImageEditor } from "@/components/profile-image-editor";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { AccountSettingsDangerZone } from "@/components/account-settings-danger-zone";

function PatientProfileContent() {
  const { profile } = useAuth();
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading eyebrow="Patient profile" title={`${profile?.firstName ?? "Your"} MediSync profile`}
        description="Manage the photo shown to your doctor inside your private consultation chat."
        backHref="/patient/dashboard" />
      <ProfileImageEditor />
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-500">Name</dt><dd className="mt-1 font-semibold text-slate-950">{profile?.firstName} {profile?.lastName}</dd></div>
          <div><dt className="text-sm text-slate-500">Email</dt><dd className="mt-1 font-semibold text-slate-950">{profile?.email}</dd></div>
        </dl>
      </section>
      <AccountSettingsDangerZone />
    </main>
  );
}

export default function PatientProfilePage() {
  return <ProtectedRoute roles={["PATIENT"]}><PatientProfileContent /></ProtectedRoute>;
}

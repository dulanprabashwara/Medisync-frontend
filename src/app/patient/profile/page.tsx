"use client";

import { PortalHeading } from "@/components/portal-ui";
import { ProfileImageEditor } from "@/components/profile-image-editor";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { AccountSettingsDangerZone } from "@/components/account-settings-danger-zone";
import { SectionCard } from "@/components/ui/card";

function PatientProfileContent() {
  const { profile } = useAuth();
  
  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <PortalHeading 
        eyebrow="Account Settings" 
        title={`${profile?.firstName ?? "Your"} MediSync Profile`}
        description="Manage the photo shown to your doctor inside your private consultation chat."
        backHref="/patient/dashboard" 
      />
      
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-8">
          <SectionCard title="Personal Information">
            <dl className="grid gap-6 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-slate-500 font-medium mb-1">First Name</dt>
                <dd className="font-medium text-slate-950">{profile?.firstName}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium mb-1">Last Name</dt>
                <dd className="font-medium text-slate-950">{profile?.lastName}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500 font-medium mb-1">Email Address</dt>
                <dd className="font-medium text-slate-950">{profile?.email}</dd>
              </div>
            </dl>
          </SectionCard>

          <AccountSettingsDangerZone />
        </div>

        <div className="lg:col-span-1">
          <ProfileImageEditor />
        </div>
      </div>
    </div>
  );
}

export default function PatientProfilePage() {
  return <ProtectedRoute roles={["PATIENT"]}><PatientProfileContent /></ProtectedRoute>;
}

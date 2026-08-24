"use client";

import { useState } from "react";
import { PortalHeading } from "@/components/portal-ui";
import { ProfileImageEditor } from "@/components/profile-image-editor";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { AccountSettingsDangerZone } from "@/components/account-settings-danger-zone";
import { SectionCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/forms";
import { Alert } from "@/components/ui/alert";
import { updatePatientProfile } from "@/lib/api";

function PatientProfileContent() {
  const { profile, session, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updatePatientProfile(session.access_token, {
        firstName,
        lastName,
        phone: phone || null,
      });
      await refreshProfile();
      setSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setFirstName(profile?.firstName ?? "");
    setLastName(profile?.lastName ?? "");
    setPhone(profile?.phone ?? "");
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <PortalHeading
        eyebrow="PATIENT ACCOUNT"
        title="Profile"
        description="Manage your personal information, profile photo and account settings."
        backHref="/patient/dashboard"
      />

      <div className="space-y-8">
        <SectionCard title="Personal Information">
          {error && (
            <Alert tone="error" className="mb-6">
              {error}
            </Alert>
          )}
          {success && (
            <Alert tone="success" className="mb-6">
              Profile updated successfully.
            </Alert>
          )}

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            {/* Avatar / Photo Column */}
            <div className="w-full md:w-56 shrink-0">
              <ProfileImageEditor compact />
            </div>

            {/* Information / Edit Column */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <form onSubmit={handleSave} className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <dl className="grid gap-6 sm:grid-cols-2 text-sm mb-6">
                    <div>
                      <dt className="text-slate-500 font-medium mb-1">
                        First Name
                      </dt>
                      <dd className="font-medium text-slate-950">
                        {profile?.firstName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 font-medium mb-1">
                        Last Name
                      </dt>
                      <dd className="font-medium text-slate-950">
                        {profile?.lastName}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500 font-medium mb-1">
                        Phone Number
                      </dt>
                      <dd className="font-medium text-slate-950">
                        {profile?.phone || (
                          <span className="text-slate-400 italic">
                            Not provided
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                  <div className="pt-4 border-t border-slate-100">
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="secondary"
                    >
                      Edit Information
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Account Information">
          <dl className="grid gap-6 sm:grid-cols-2 text-sm">
            <div className="sm:col-span-2">
              <dt className="text-slate-500 font-medium mb-1">
                Email Address
              </dt>
              <dd className="font-medium text-slate-950 flex items-center gap-3">
                {profile?.email}
                <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  Read only
                </span>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500 font-medium mb-1">Account role</dt>
              <dd className="font-medium text-slate-950 flex items-center gap-3">
                Patient
                <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  Read only
                </span>
              </dd>
            </div>
          </dl>
        </SectionCard>

        <div className="pt-2">
          <AccountSettingsDangerZone />
        </div>
      </div>
    </div>
  );
}

export default function PatientProfilePage() {
  return (
    <ProtectedRoute roles={["PATIENT"]}>
      <PatientProfileContent />
    </ProtectedRoute>
  );
}

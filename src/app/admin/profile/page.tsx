"use client";

import { useState } from "react";
import { PortalHeading } from "@/components/portal-ui";
import { ProfileImageEditor } from "@/components/profile-image-editor";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { updateAdminProfile } from "@/lib/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/forms";
import { SectionCard } from "@/components/ui/card";

function PersonalInformationCard() {
  const { session, profile, refreshProfile } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(profile?.firstName || "");
  const [lastName, setLastName] = useState(profile?.lastName || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  if (!profile || !session) return null;

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      await updateAdminProfile(session!.access_token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });
      await refreshProfile();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    setFirstName(profile?.firstName || "");
    setLastName(profile?.lastName || "");
    setPhone(profile?.phone || "");
    setError(null);
    setEditing(false);
  }

  return (
    <SectionCard title="Personal Information">
      {error && <Alert tone="error" className="mb-6">{error}</Alert>}

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="w-full md:w-56 shrink-0">
          <ProfileImageEditor compact />
        </div>
        <div className="flex-1 min-w-0">
          {!editing ? (
            <div className="space-y-6">
              <dl className="grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-slate-500 mb-1">First Name</dt>
                  <dd className="text-sm font-medium text-slate-900">{profile.firstName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500 mb-1">Last Name</dt>
                  <dd className="text-sm font-medium text-slate-900">{profile.lastName}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-semibold text-slate-500 mb-1">Phone Number</dt>
                  <dd className="text-sm font-medium text-slate-900">{profile.phone || <span className="text-slate-400 italic">Not provided</span>}</dd>
                </div>
              </dl>
              <div className="pt-2">
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  Edit Information
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="primary" onClick={() => void handleSave()} disabled={busy}>
                  {busy ? "Saving..." : "Save changes"}
                </Button>
                <Button variant="secondary" onClick={handleCancel} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function AccountInformationCard() {
  const { profile } = useAuth();
  
  if (!profile) return null;
  
  return (
    <SectionCard title="Account Information">
      <dl className="mt-2 grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-slate-500 mb-1">Email Address</dt>
          <dd className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-900">{profile.email}</span>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              READ ONLY
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-slate-500 mb-1">Account role</dt>
          <dd className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-900">Admin</span>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              READ ONLY
            </span>
          </dd>
        </div>
      </dl>
    </SectionCard>
  );
}

function AdminProfileContent() {
  const { profile } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PortalHeading
        eyebrow="ACCOUNT"
        title="Admin Profile"
        description="Manage your administration account details and profile picture."
      />
      
      <div className="space-y-8">
        <PersonalInformationCard />
        <AccountInformationCard />
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <AdminProfileContent />
    </ProtectedRoute>
  );
}


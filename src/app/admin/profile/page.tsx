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
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">Update your name and contact details.</p>
        {!editing && (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {!editing ? (
        <dl className="grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">First name</dt>
            <dd className="text-sm font-medium text-slate-900">{profile.firstName}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Last name</dt>
            <dd className="text-sm font-medium text-slate-900">{profile.lastName}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</dt>
            <dd className="text-sm font-medium text-slate-900">{profile.phone || <span className="text-slate-400 italic">Not provided</span>}</dd>
          </div>
        </dl>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
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
    </SectionCard>
  );
}

function AccountInformationCard() {
  const { profile } = useAuth();
  
  if (!profile) return null;
  
  return (
    <SectionCard title="Account Information">
      <p className="text-sm text-slate-500 mb-4">Your administrative login credentials and role.</p>
      <dl className="grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</dt>
          <dd className="text-sm font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.email}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</dt>
          <dd className="text-sm font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.role}</dd>
        </div>
      </dl>
    </SectionCard>
  );
}

function AdminProfileContent() {
  const { profile } = useAuth();

  return (
    <main className="max-w-4xl mx-auto space-y-8 pb-10">
      <PortalHeading
        eyebrow="ACCOUNT"
        title="Admin Profile"
        description="Manage your administration account details and profile picture."
      />
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ProfileImageEditor />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <PersonalInformationCard />
          <AccountInformationCard />
        </div>
      </div>
    </main>
  );
}

export default function AdminProfilePage() {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <AdminProfileContent />
    </ProtectedRoute>
  );
}

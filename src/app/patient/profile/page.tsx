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
    <div className="max-w-4xl space-y-8 pb-10">
      <PortalHeading 
        eyebrow="Account Settings" 
        title="Profile"
        description="Manage your personal information, profile photo and account settings."
        backHref="/patient/dashboard" 
      />
      
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start flex-col-reverse lg:flex-row">
        
        <div className="space-y-8 order-2 lg:order-1">
          <SectionCard title="Personal Information">
            {error && <Alert tone="error" className="mb-6">{error}</Alert>}
            {success && <Alert tone="success" className="mb-6">Profile updated successfully.</Alert>}
            
            {isEditing ? (
              <form onSubmit={handleSave} className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSaving}>
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
                    <dt className="text-slate-500 font-medium mb-1">First Name</dt>
                    <dd className="font-medium text-slate-950">{profile?.firstName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium mb-1">Last Name</dt>
                    <dd className="font-medium text-slate-950">{profile?.lastName}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500 font-medium mb-1">Phone Number</dt>
                    <dd className="font-medium text-slate-950">{profile?.phone || <span className="text-slate-400 italic">Not provided</span>}</dd>
                  </div>
                </dl>
                <div className="pt-4 border-t border-slate-100">
                  <Button onClick={() => setIsEditing(true)} variant="secondary">
                    Edit Information
                  </Button>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Account Information">
            <dl className="grid gap-6 sm:grid-cols-2 text-sm">
              <div className="sm:col-span-2">
                <dt className="text-slate-500 font-medium mb-1">Email Address</dt>
                <dd className="font-medium text-slate-950 flex items-center gap-3">
                  {profile?.email}
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Read only</span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500 font-medium mb-1">Role</dt>
                <dd className="font-medium text-slate-950 flex items-center gap-3">
                  Patient
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Read only</span>
                </dd>
              </div>
            </dl>
          </SectionCard>

          <div className="pt-8">
            <AccountSettingsDangerZone />
          </div>
        </div>

        <div className="order-1 lg:order-2 space-y-6">
          <SectionCard title="Profile Summary">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <div className="size-24 rounded-2xl overflow-hidden bg-teal-100 text-teal-900 font-bold flex items-center justify-center text-2xl uppercase">
                  {profile?.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.profileImageUrl} alt="Profile" className="size-full object-cover" />
                  ) : (
                    profile?.firstName?.charAt(0) || "U"
                  )}
                </div>
              </div>
              <h2 className="text-lg font-semibold text-slate-950">{profile?.firstName} {profile?.lastName}</h2>
              <p className="text-sm font-medium text-teal-700 mt-1">Patient</p>
              <p className="text-sm text-slate-500 mt-1">{profile?.email}</p>
            </div>
          </SectionCard>

          <ProfileImageEditor />
        </div>
      </div>
    </div>
  );
}

export default function PatientProfilePage() {
  return <ProtectedRoute roles={["PATIENT"]}><PatientProfileContent /></ProtectedRoute>;
}

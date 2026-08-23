"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { updateAdminProfile } from "@/lib/api";
import { InlineError } from "@/components/portal-ui";
import { inputClassName } from "@/components/auth-card";

export function AdminProfileEditor() {
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
      await updateAdminProfile(session!.access_token, { firstName, lastName, phone });
      await refreshProfile();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-950">Your Profile Info</h2>
        {!editing && (
          <button 
            onClick={() => {
              setFirstName(profile.firstName);
              setLastName(profile.lastName);
              setPhone(profile.phone || "");
              setEditing(true);
            }} 
            className="text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            Edit Profile
          </button>
        )}
      </div>

      {!editing ? (
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-500">First Name</dt>
            <dd className="mt-1 font-semibold text-slate-950">{profile.firstName}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Last Name</dt>
            <dd className="mt-1 font-semibold text-slate-950">{profile.lastName}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Phone</dt>
            <dd className="mt-1 font-semibold text-slate-950">{profile.phone || "Not provided"}</dd>
          </div>
        </dl>
      ) : (
        <div className="mt-5 grid gap-4">
          <InlineError message={error} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm font-semibold text-slate-700">
              First Name
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Last Name
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={inputClassName} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Phone Number
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inputClassName} />
            </label>
          </div>
          <div className="mt-2 flex gap-3">
            <button disabled={busy} onClick={() => void handleSave()} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
              {busy ? "Saving..." : "Save Changes"}
            </button>
            <button disabled={busy} onClick={() => setEditing(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

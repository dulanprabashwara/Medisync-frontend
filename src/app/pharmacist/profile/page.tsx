"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FormAlert, inputClassName } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { ProfileImageEditor } from "@/components/profile-image-editor";
import {
  getPharmacistProfessionalProfile,
  submitPharmacistVerification,
  updatePharmacistProfessionalProfile,
} from "@/lib/api";
import type { PharmacistProfessionalProfile, PharmacistProfileInput } from "@/types/user";

const emptyForm: PharmacistProfileInput = {
  professionalRegistrationNumber: "",
  pharmacyName: "",
  pharmacyRegistrationNumber: "",
  pharmacyAddress: "",
  qualifications: "",
};

const draftStoragePrefix = "medisync:pharmacist-profile-draft:";
const draftFields: (keyof PharmacistProfileInput)[] = [
  "professionalRegistrationNumber",
  "pharmacyName",
  "pharmacyRegistrationNumber",
  "pharmacyAddress",
  "qualifications",
];

function profileForm(profile: PharmacistProfessionalProfile): PharmacistProfileInput {
  return {
    professionalRegistrationNumber: profile.professionalRegistrationNumber ?? "",
    pharmacyName: profile.pharmacyName ?? "",
    pharmacyRegistrationNumber: profile.pharmacyRegistrationNumber ?? "",
    pharmacyAddress: profile.pharmacyAddress ?? "",
    qualifications: profile.qualifications ?? "",
  };
}

function draftKey(userId: string) {
  return `${draftStoragePrefix}${userId}`;
}

function readDraft(userId: string): PharmacistProfileInput | null {
  try {
    const stored = window.sessionStorage.getItem(draftKey(userId));
    if (!stored) return null;
    const candidate = JSON.parse(stored) as Partial<Record<keyof PharmacistProfileInput, unknown>>;
    if (draftFields.some((field) => typeof candidate[field] !== "string")) {
      window.sessionStorage.removeItem(draftKey(userId));
      return null;
    }
    return Object.fromEntries(draftFields.map((field) => [field, candidate[field]])) as unknown as PharmacistProfileInput;
  } catch {
    return null;
  }
}

function writeDraft(userId: string, draft: PharmacistProfileInput) {
  try {
    window.sessionStorage.setItem(draftKey(userId), JSON.stringify(draft));
  } catch {
    // The form still works if browser storage is unavailable.
  }
}

function clearDraft(userId: string) {
  try {
    window.sessionStorage.removeItem(draftKey(userId));
  } catch {
    // The server remains the source of truth after a successful save.
  }
}

function Content() {
  const { session, refreshProfile } = useAuth();
  const [value, setValue] = useState<PharmacistProfessionalProfile | null>(null);
  const [form, setForm] = useState<PharmacistProfileInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const apply = useCallback((next: PharmacistProfessionalProfile) => {
    setValue(next);
    setForm(profileForm(next));
  }, []);

  const load = useCallback(async () => {
    if (!session) return;
    const storedDraft = readDraft(session.user.id);
    if (storedDraft) setForm(storedDraft);
    setDraftAvailable(storedDraft !== null);
    setDraftRestored(false);
    setLoading(true);
    try {
      const next = await getPharmacistProfessionalProfile(session.access_token);
      setValue(next);
      if (storedDraft && next.editable) {
        setForm(storedDraft);
        setDraftRestored(true);
      } else {
        setForm(profileForm(next));
        setDraftAvailable(false);
        if (!next.editable) clearDraft(session.user.id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The professional profile could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  function updateField(field: keyof PharmacistProfileInput, text: string) {
    if (!session) return;
    setForm((current) => {
      const next = { ...current, [field]: text };
      writeDraft(session.user.id, next);
      return next;
    });
    setDraftAvailable(true);
    setDraftRestored(false);
    setMessage(null);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!session || !value?.editable) return;
    setBusy("save"); setError(null); setMessage(null);
    try {
      const next = await updatePharmacistProfessionalProfile(session.access_token, form);
      clearDraft(session.user.id);
      setDraftAvailable(false);
      setDraftRestored(false);
      apply(next);
      setMessage("Professional profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The profile could not be saved.");
    } finally { setBusy(null); }
  }

  async function submit() {
    if (!session || !value?.editable || !window.confirm("Submit this professional profile for administrator verification?")) return;
    setBusy("submit"); setError(null); setMessage(null);
    try {
      await updatePharmacistProfessionalProfile(session.access_token, form);
      const next = await submitPharmacistVerification(session.access_token);
      clearDraft(session.user.id);
      setDraftAvailable(false);
      setDraftRestored(false);
      apply(next);
      setMessage("Profile submitted for verification.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The profile could not be submitted.");
    } finally { setBusy(null); }
  }

  if (loading && !draftAvailable) return <LoadingPanel label="Loading your professional profile..." />;
  const verified = value?.pharmacyAccessAllowed === true;

  return <main className="mx-auto max-w-4xl px-6 py-10 lg:px-8 lg:py-14">
    <PortalHeading eyebrow="Pharmacist verification" title="Professional profile"
      description="Administrator verification is required before prescription scanning or dispensing."
      backHref="/pharmacist/dashboard" />
    <ProfileImageEditor />
    <div className="mt-7 space-y-3">{error ? <FormAlert message={error} /> : null}{message ? <FormAlert message={message} success /> : null}</div>
    {value?.verificationStatus === "REJECTED" ? <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-950"><h2 className="font-semibold">Verification rejected</h2><p className="mt-2 whitespace-pre-wrap text-sm">{value.verificationRejectionReason}</p><p className="mt-2 text-sm">Correct the profile and submit it again.</p></section> : null}
    {value?.submitted ? <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><h2 className="font-semibold">Awaiting administrator review</h2><p className="mt-2 text-sm">Submitted {value.submittedForVerificationAt ? new Date(value.submittedForVerificationAt).toLocaleString() : "recently"}. Professional fields are locked during review.</p></section> : null}
    {verified ? <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><h2 className="font-semibold">Verified pharmacist</h2><p className="mt-2 text-sm">Your account may securely verify and dispense eligible prescriptions.</p><button className="mt-4 rounded-xl border border-emerald-700 px-4 py-2 text-sm font-semibold" onClick={() => void refreshProfile()}>Refresh account access</button></section> : null}
    <form className="mt-7 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={save}>
      {loading && draftAvailable ? <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">Your unsaved changes were restored. Checking your current verification status...</p> : null}
      {!loading && value?.editable && draftAvailable ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{draftRestored ? "Your unsaved changes were restored for this browser tab." : "Unsaved changes are being kept while this browser tab remains open."}</p> : null}
      <ProfileField label="Professional registration number" required maxLength={100} disabled={!value?.editable} value={form.professionalRegistrationNumber} onChange={(text) => updateField("professionalRegistrationNumber", text)} />
      <ProfileField label="Pharmacy name" required maxLength={200} disabled={!value?.editable} value={form.pharmacyName} onChange={(text) => updateField("pharmacyName", text)} />
      <ProfileField label="Pharmacy registration number" maxLength={100} disabled={!value?.editable} value={form.pharmacyRegistrationNumber} onChange={(text) => updateField("pharmacyRegistrationNumber", text)} />
      <label className="block text-sm font-semibold text-slate-700">Pharmacy address <span className="text-rose-600">*</span><textarea className={`${inputClassName} min-h-28 resize-y`} required maxLength={500} disabled={!value?.editable} value={form.pharmacyAddress} onChange={(event) => updateField("pharmacyAddress", event.target.value)} /></label>
      <ProfileField label="Qualifications" maxLength={500} disabled={!value?.editable} value={form.qualifications} onChange={(text) => updateField("qualifications", text)} />
      {value?.editable ? <div className="flex flex-wrap gap-3"><button className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold disabled:opacity-50" disabled={busy !== null} type="submit">{busy === "save" ? "Saving..." : "Save profile"}</button><button className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={busy !== null} type="button" onClick={() => void submit()}>{busy === "submit" ? "Submitting..." : "Save and submit for verification"}</button></div> : null}
    </form>
  </main>;
}

function ProfileField({ label, required = false, maxLength, disabled, value, onChange }: { label: string; required?: boolean; maxLength: number; disabled: boolean; value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}{required ? <span className="text-rose-600"> *</span> : null}<input className={inputClassName} required={required} maxLength={maxLength} disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

export default function Page() {
  return <ProtectedRoute roles={["PHARMACIST"]}><Content /></ProtectedRoute>;
}

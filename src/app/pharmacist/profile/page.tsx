"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FormAlert, inputClassName } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
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

function Content() {
  const { session, refreshProfile } = useAuth();
  const [value, setValue] = useState<PharmacistProfessionalProfile | null>(null);
  const [form, setForm] = useState<PharmacistProfileInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const apply = useCallback((next: PharmacistProfessionalProfile) => {
    setValue(next);
    setForm({
      professionalRegistrationNumber: next.professionalRegistrationNumber ?? "",
      pharmacyName: next.pharmacyName ?? "",
      pharmacyRegistrationNumber: next.pharmacyRegistrationNumber ?? "",
      pharmacyAddress: next.pharmacyAddress ?? "",
      qualifications: next.qualifications ?? "",
    });
  }, []);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      apply(await getPharmacistProfessionalProfile(session.access_token));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The professional profile could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [apply, session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!session || !value?.editable) return;
    setBusy("save"); setError(null); setMessage(null);
    try {
      apply(await updatePharmacistProfessionalProfile(session.access_token, form));
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
      apply(await submitPharmacistVerification(session.access_token));
      setMessage("Profile submitted for verification.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The profile could not be submitted.");
    } finally { setBusy(null); }
  }

  if (loading) return <LoadingPanel label="Loading your professional profile..." />;
  const verified = value?.pharmacyAccessAllowed === true;

  return <main className="mx-auto max-w-4xl px-6 py-10 lg:px-8 lg:py-14">
    <PortalHeading eyebrow="Pharmacist verification" title="Professional profile"
      description="Administrator verification is required before prescription scanning or dispensing."
      backHref="/pharmacist/dashboard" />
    <div className="mt-7 space-y-3">{error ? <FormAlert message={error} /> : null}{message ? <FormAlert message={message} success /> : null}</div>
    {value?.verificationStatus === "REJECTED" ? <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-950"><h2 className="font-semibold">Verification rejected</h2><p className="mt-2 whitespace-pre-wrap text-sm">{value.verificationRejectionReason}</p><p className="mt-2 text-sm">Correct the profile and submit it again.</p></section> : null}
    {value?.submitted ? <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><h2 className="font-semibold">Awaiting administrator review</h2><p className="mt-2 text-sm">Submitted {value.submittedForVerificationAt ? new Date(value.submittedForVerificationAt).toLocaleString() : "recently"}. Professional fields are locked during review.</p></section> : null}
    {verified ? <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><h2 className="font-semibold">Verified pharmacist</h2><p className="mt-2 text-sm">Your account may securely verify and dispense eligible prescriptions.</p><button className="mt-4 rounded-xl border border-emerald-700 px-4 py-2 text-sm font-semibold" onClick={() => void refreshProfile()}>Refresh account access</button></section> : null}
    <form className="mt-7 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={save}>
      <ProfileField label="Professional registration number" required maxLength={100} disabled={!value?.editable} value={form.professionalRegistrationNumber} onChange={(text) => setForm({ ...form, professionalRegistrationNumber: text })} />
      <ProfileField label="Pharmacy name" required maxLength={200} disabled={!value?.editable} value={form.pharmacyName} onChange={(text) => setForm({ ...form, pharmacyName: text })} />
      <ProfileField label="Pharmacy registration number" maxLength={100} disabled={!value?.editable} value={form.pharmacyRegistrationNumber} onChange={(text) => setForm({ ...form, pharmacyRegistrationNumber: text })} />
      <label className="block text-sm font-semibold text-slate-700">Pharmacy address <span className="text-rose-600">*</span><textarea className={`${inputClassName} min-h-28 resize-y`} required maxLength={500} disabled={!value?.editable} value={form.pharmacyAddress} onChange={(event) => setForm({ ...form, pharmacyAddress: event.target.value })} /></label>
      <ProfileField label="Qualifications" maxLength={500} disabled={!value?.editable} value={form.qualifications} onChange={(text) => setForm({ ...form, qualifications: text })} />
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

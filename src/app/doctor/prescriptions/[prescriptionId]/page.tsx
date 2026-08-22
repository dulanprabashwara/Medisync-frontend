"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { InlineError, PortalHeading } from "@/components/portal-ui";
import { PrescriptionItemsView, PrescriptionStatusBadge } from "@/components/prescription-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { ApiError, cancelPrescription, discardPrescriptionDraft, getDoctorPrescription, issuePrescription, updatePrescriptionDraft } from "@/lib/api";
import type { DoctorPrescription, PrescriptionDraftInput, PrescriptionItemInput } from "@/types/prescriptions";

const emptyItem = (): PrescriptionItemInput => ({ medicineName: "", strength: "", medicineForm: "", dosage: "", frequency: "", duration: "", quantity: "", route: "", instructions: "" });
const requiredItemFields = ["medicineName", "dosage", "frequency", "duration"] as const;
const fieldLabels: Record<keyof PrescriptionItemInput, string> = {
  medicineName: "Medicine Name",
  strength: "Strength",
  medicineForm: "Medicine Form",
  dosage: "Dosage",
  frequency: "Frequency",
  duration: "Duration",
  quantity: "Quantity",
  route: "Route",
  instructions: "Instructions",
};
const fieldMaxLengths: Partial<Record<keyof PrescriptionItemInput, number>> = {
  medicineName: 200,
  strength: 100,
  medicineForm: 100,
  dosage: 200,
  frequency: 200,
  duration: 200,
  quantity: 100,
  route: 100,
  instructions: 2000,
};

function Content() {
  const { prescriptionId } = useParams<{ prescriptionId: string }>(); const { session } = useAuth();
  const router = useRouter();
  const [value, setValue] = useState<DoctorPrescription | null>(null); const [form, setForm] = useState<PrescriptionDraftInput>({ validityDays: 30, generalInstructions: "", doctorFeeAmount: 0, items: [] });
  const [busy, setBusy] = useState<string | null>(null); const [error, setError] = useState<string | null>(null); const [notice, setNotice] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const loadedPrescriptionRef = useRef<string | null>(null);
  const loadSequenceRef = useRef(0);
  const apply = useCallback((next: DoctorPrescription) => { setValue(next); setForm({ validityDays: next.validityDays, generalInstructions: next.generalInstructions ?? "", doctorFeeAmount: next.doctorFeeAmount, items: next.items.map((item) => ({ medicineName: item.medicineName, strength: item.strength, medicineForm: item.medicineForm, dosage: item.dosage, frequency: item.frequency, duration: item.duration, quantity: item.quantity, route: item.route, instructions: item.instructions })) }); setDirty(false); }, []);
  const load = useCallback(async () => {
    if (!session || loadedPrescriptionRef.current === prescriptionId) return;
    loadedPrescriptionRef.current = prescriptionId;
    const sequence = ++loadSequenceRef.current;
    try {
      const next = await getDoctorPrescription(session.access_token, prescriptionId);
      if (sequence === loadSequenceRef.current) apply(next);
    } catch (e) {
      if (sequence !== loadSequenceRef.current) return;
      loadedPrescriptionRef.current = null;
      setError(e instanceof Error ? e.message : "The prescription could not be loaded.");
    }
  }, [apply, prescriptionId, session]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);
  function change(index: number, field: keyof PrescriptionItemInput, text: string) { setDirty(true); setValidationErrors((current) => { const next = { ...current }; delete next[`${index}.${field}`]; return next; }); setForm((current) => ({ ...current, items: current.items.map((item, i) => i === index ? { ...item, [field]: text } : item) })); }
  function validateDraft() {
    const nextErrors: Record<string, string> = {};
    if (!Number.isInteger(form.validityDays) || form.validityDays < 1 || form.validityDays > 90) {
      nextErrors.validityDays = "Validity must be between 1 and 90 days.";
    }
    if (!Number.isFinite(form.doctorFeeAmount) || form.doctorFeeAmount < 0 || form.doctorFeeAmount > 99999999.99) {
      nextErrors.doctorFeeAmount = "Enter a valid fee from 0 to 99,999,999.99.";
    }
    form.items.forEach((item, index) => {
      requiredItemFields.forEach((field) => {
        if (!item[field]?.trim()) nextErrors[`${index}.${field}`] = `${fieldLabels[field]} is required.`;
      });
    });
    setValidationErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("Complete the highlighted required fields before saving this draft.");
      setNotice(null);
      return false;
    }
    return true;
  }
  function requestMessage(requestError: unknown, fallback: string) {
    if (requestError instanceof ApiError) {
      const details = [...new Set(Object.values(requestError.fieldErrors))];
      return details.length > 0 ? `${requestError.message}: ${details.join(" ")}` : requestError.message;
    }
    return requestError instanceof Error ? requestError.message : fallback;
  }
  async function save() { if (!session || !validateDraft()) return; setBusy("save"); setError(null); setNotice(null); try { apply(await updatePrescriptionDraft(session.access_token, prescriptionId, form)); setNotice("Draft saved."); } catch (e) { setError(requestMessage(e, "The draft could not be saved.")); } finally { setBusy(null); } }
  async function issue() { if (!session || !validateDraft() || !window.confirm("Issue this prescription? It will become immutable.")) return; setBusy("issue"); setError(null); try { apply(await updatePrescriptionDraft(session.access_token, prescriptionId, form)); apply(await issuePrescription(session.access_token, prescriptionId)); setNotice("Prescription issued securely."); } catch (e) { setError(requestMessage(e, "The prescription could not be issued.")); } finally { setBusy(null); } }
  async function cancel() { if (!session) return; const reason = window.prompt("Cancellation reason (required, at least 3 characters):"); if (!reason) return; setBusy("cancel"); setError(null); try { apply(await cancelPrescription(session.access_token, prescriptionId, reason)); setNotice("Prescription cancelled and its QR revoked."); } catch (e) { setError(e instanceof Error ? e.message : "The prescription could not be cancelled."); } finally { setBusy(null); } }
  async function discard() { if (!session || !window.confirm("Discard this draft prescription? This cannot be undone.")) return; setBusy("discard"); setError(null); try { await discardPrescriptionDraft(session.access_token, prescriptionId); setDirty(false); router.push("/doctor/prescriptions"); } catch (e) { setError(e instanceof Error ? e.message : "The draft could not be discarded."); setBusy(null); } }
  if (!value && !error) return <LoadingPanel label="Loading prescription editor..." />;
  const draftWritable = value?.consultationStatus === "SCHEDULED" || value?.consultationStatus === "IN_PROGRESS";
  return <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14"><PortalHeading eyebrow="Doctor prescription" title={value ? `Prescription for ${value.patientName}` : "Prescription"} description="Create structured medication instructions and issue them when the consultation permits." backHref="/doctor/prescriptions" backLabel="Back to prescriptions" />
    <div className="mt-7 space-y-3"><InlineError message={error} />{notice ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</p> : null}</div>{value ? <>
      <div className="mt-8"><PrescriptionStatusBadge status={value.status} expired={value.expired} dispensingStatus={value.dispensingStatus} /></div>
      {value.status === "ISSUED" && value.doctorFeeAmount > 0 ? <section className={`mt-6 rounded-2xl border p-5 ${value.doctorFeeStatus === "CONFIRMED" ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}><p className="text-xs font-bold uppercase tracking-[0.16em]">Consultation fee</p><h2 className="mt-2 text-2xl font-semibold">{value.doctorFeeCurrency} {Number(value.doctorFeeAmount).toFixed(2)}</h2><p className="mt-2 text-sm">{value.doctorFeeStatus === "CONFIRMED" ? `Payment confirmed${value.doctorFeeConfirmedAt ? ` ${new Date(value.doctorFeeConfirmedAt).toLocaleString()}` : ""}.` : "Awaiting confirmation. The patient's QR remains locked until payment is confirmed in the consultation room."}</p></section> : null}
      {value.dispensingStatus === "DISPENSED" ? <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sky-950"><h2 className="font-semibold">Dispensing status: Dispensed</h2>{value.dispensedAt ? <p className="mt-2 text-sm">Dispensed {new Date(value.dispensedAt).toLocaleString()}</p> : null}{value.dispensingPharmacy ? <p className="mt-1 text-sm">Pharmacy: {value.dispensingPharmacy}</p> : null}<p className="mt-3 text-sm">A dispensed prescription cannot be cancelled.</p></section> : null}
      {value.status === "DRAFT" ? draftWritable ? <section className="mt-6 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <label className="block text-sm font-medium">Validity (days) <span className="text-rose-600">*</span><input className={`mt-2 block w-full rounded-xl border px-4 py-3 ${validationErrors.validityDays ? "border-rose-500 bg-rose-50" : "border-slate-300"}`} min={1} max={90} type="number" value={form.validityDays} onChange={(e) => { setDirty(true); setValidationErrors((current) => { const next = { ...current }; delete next.validityDays; return next; }); setForm({ ...form, validityDays: Number(e.target.value) }); }} />{validationErrors.validityDays ? <span className="mt-1 block text-xs text-rose-700">{validationErrors.validityDays}</span> : null}</label>
        <label className="block text-sm font-medium">Doctor consultation fee (LKR)<input className={`mt-2 block w-full rounded-xl border px-4 py-3 ${validationErrors.doctorFeeAmount ? "border-rose-500 bg-rose-50" : "border-slate-300"}`} min={0} max={99999999.99} step="0.01" type="number" value={form.doctorFeeAmount} onChange={(e) => { setDirty(true); setValidationErrors((current) => { const next = { ...current }; delete next.doctorFeeAmount; return next; }); setForm({ ...form, doctorFeeAmount: Number(e.target.value) }); }} />{validationErrors.doctorFeeAmount ? <span className="mt-1 block text-xs text-rose-700">{validationErrors.doctorFeeAmount}</span> : <span className="mt-1 block text-xs text-slate-500">Use 0 when no manual payment confirmation is required. The fee becomes immutable after issue.</span>}</label>
        <label className="block text-sm font-medium">General instructions<textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" maxLength={5000} value={form.generalInstructions} onChange={(e) => { setDirty(true); setForm({ ...form, generalInstructions: e.target.value }); }} /></label>
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Medicines ({form.items.length}/20)</h2>{dirty ? <p className="mt-1 text-xs font-medium text-amber-700">Unsaved changes</p> : null}</div><button type="button" className="rounded-xl border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-800 disabled:opacity-50" disabled={form.items.length >= 20 || busy !== null} onClick={() => { setDirty(true); setForm((current) => ({ ...current, items: [...current.items, emptyItem()] })); }}>Add medicine</button></div>
        {form.items.map((item, index) => <fieldset className="grid gap-4 rounded-2xl border border-slate-200 p-5 sm:grid-cols-2" key={index}><legend className="px-2 font-semibold">Medicine {index + 1}</legend>{(["medicineName", "strength", "medicineForm", "dosage", "frequency", "duration", "quantity", "route"] as const).map((field) => { const fieldError = validationErrors[`${index}.${field}`]; const required = requiredItemFields.includes(field as typeof requiredItemFields[number]); return <label className="text-sm font-medium" key={field}>{fieldLabels[field]}{required ? <span className="text-rose-600"> *</span> : null}<input aria-invalid={Boolean(fieldError)} maxLength={fieldMaxLengths[field]} required={required} className={`mt-1 block w-full rounded-xl border px-3 py-2 ${fieldError ? "border-rose-500 bg-rose-50" : "border-slate-300"}`} value={item[field] ?? ""} onChange={(e) => change(index, field, e.target.value)} />{fieldError ? <span className="mt-1 block text-xs text-rose-700">{fieldError}</span> : null}</label>; })}<label className="text-sm font-medium sm:col-span-2">Instructions<textarea className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2" maxLength={fieldMaxLengths.instructions} value={item.instructions ?? ""} onChange={(e) => change(index, "instructions", e.target.value)} /></label><button type="button" className="justify-self-start text-sm font-semibold text-rose-700" onClick={() => { setDirty(true); setValidationErrors({}); setForm((current) => ({ ...current, items: current.items.filter((_, i) => i !== index) })); }}>Remove</button></fieldset>)}
        <div className="flex flex-wrap gap-3"><button type="button" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold disabled:opacity-50" disabled={busy !== null} onClick={() => void save()}>{busy === "save" ? "Saving..." : "Save draft"}</button>{value.consultationStatus === "IN_PROGRESS" ? <button type="button" className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={busy !== null || form.items.length === 0} onClick={() => void issue()}>{busy === "issue" ? "Issuing..." : "Issue prescription"}</button> : null}<button type="button" className="rounded-xl border border-rose-300 px-5 py-3 text-sm font-semibold text-rose-700 disabled:opacity-50" disabled={busy !== null} onClick={() => void discard()}>{busy === "discard" ? "Discarding..." : "Discard draft"}</button></div>
      </section> : <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950"><h2 className="font-semibold">Legacy draft is read-only</h2><p className="mt-2 text-sm">This consultation is {value.consultationStatus.toLowerCase().replace("_", " ")}. The draft cannot be edited or issued, but it can be safely discarded.</p>{value.items.length > 0 ? <div className="mt-5"><PrescriptionItemsView items={value.items} /></div> : null}<button type="button" className="mt-5 rounded-xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={busy !== null} onClick={() => void discard()}>{busy === "discard" ? "Discarding..." : "Discard draft"}</button></section> : value.status === "CANCELLED" ? <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-950"><h2 className="font-semibold">Prescription cancelled</h2>{value.cancelledAt ? <p className="mt-2 text-sm">Cancelled {new Date(value.cancelledAt).toLocaleString()}</p> : null}<p className="mt-2 whitespace-pre-wrap text-sm">{value.cancellationReason || "No cancellation reason was provided."}</p><p className="mt-3 text-sm">Medicine details and instructions are hidden for cancelled prescriptions.</p></section> : <><section className="mt-8"><PrescriptionItemsView items={value.items} /></section>{value.generalInstructions ? <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 whitespace-pre-wrap">{value.generalInstructions}</p> : null}{value.cancellationAllowed ? <button type="button" className="mt-6 rounded-xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={busy !== null} onClick={() => void cancel()}>{busy === "cancel" ? "Cancelling..." : "Cancel prescription"}</button> : value.cancellationBlockedReason ? <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{value.cancellationBlockedReason}</p> : null}</>}
    </> : null}</main>;
}
export default function Page() { return <ProtectedRoute roles={["DOCTOR"]}><Content /></ProtectedRoute>; }

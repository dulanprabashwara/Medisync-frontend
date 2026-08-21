"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { InlineError, PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { PrescriptionItemsView, PrescriptionQr, PrescriptionStatusBadge } from "@/components/prescription-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { getPatientPrescription } from "@/lib/api";
import type { PatientPrescriptionDetail } from "@/types/prescriptions";

function Content() {
  const { prescriptionId } = useParams<{ prescriptionId: string }>(); const { session } = useAuth();
  const [value, setValue] = useState<PatientPrescriptionDetail | null>(null); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { if (!session) return; try { setValue(await getPatientPrescription(session.access_token, prescriptionId)); } catch (e) { setError(e instanceof Error ? e.message : "The prescription could not be loaded."); } }, [prescriptionId, session]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  if (!value && !error) return <LoadingPanel label="Loading prescription..." />;
  return <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14"><PortalHeading eyebrow="Digital prescription" title="Prescription details" description="Your issued clinical medication instructions." backHref="/patient/prescriptions" backLabel="Back to prescriptions" /><div className="mt-7"><InlineError message={error} /></div>{value ? <>
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex justify-between gap-4"><div><h2 className="text-xl font-semibold">{value.doctorName}</h2><p className="mt-1 text-sm text-slate-600">{value.medicalRegistrationNumber} · {value.specializationName}</p><p className="text-sm text-slate-600">{value.hospitalName} · {value.departmentName}</p></div><PrescriptionStatusBadge status={value.status} expired={value.expired} /></div><p className="mt-5 text-sm text-slate-600">Consultation: {formatAppointmentTime(value.consultationScheduledStart)}</p>{value.validUntil ? <p className="mt-1 text-sm text-slate-600">Valid until: {formatAppointmentTime(value.validUntil)}</p> : null}</section>
    {value.status === "CANCELLED" ? <section className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950"><h2 className="font-semibold">Prescription cancelled</h2><p className="mt-2 whitespace-pre-wrap text-sm">{value.cancellationReason}</p></section> : value.expired ? <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">This prescription has expired. Contact your doctor if you need further care.</section> : null}
    <section className="mt-8"><h2 className="mb-4 text-2xl font-semibold">Medicines</h2><PrescriptionItemsView items={value.items} /></section>
    {value.generalInstructions ? <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">General instructions</h2><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{value.generalInstructions}</p></section> : null}
    <section className="mt-8 rounded-3xl border border-teal-200 bg-teal-50 p-6 text-center sm:p-8"><h2 className="text-xl font-semibold text-teal-950">Prescription QR</h2>{value.qrUsable && value.qrPayload ? <><p className="mx-auto mt-2 max-w-xl text-sm text-teal-900">Present this QR when prescription verification becomes available. It contains only a secure opaque reference.</p><div className="mt-5"><PrescriptionQr payload={value.qrPayload} /></div></> : <p className="mt-2 text-sm text-teal-900">The QR is unavailable because this prescription is cancelled or expired.</p>}</section>
    <button className="mt-6 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold print:hidden" onClick={() => window.print()}>Print prescription</button>
  </> : null}</main>;
}
export default function Page() { return <ProtectedRoute roles={["PATIENT"]}><Content /></ProtectedRoute>; }

"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { InlineError, PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { PrescriptionItemsView, PrescriptionQr, PrescriptionStatusBadge } from "@/components/prescription-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { generatePatientPrescriptionQr, getPatientPrescription } from "@/lib/api";
import type { PatientPrescriptionDetail } from "@/types/prescriptions";

function Content() {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const { session } = useAuth();
  const [value, setValue] = useState<PatientPrescriptionDetail | null>(null);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [qrBusy, setQrBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      setValue(await getPatientPrescription(session.access_token, prescriptionId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The prescription could not be loaded.");
    }
  }, [prescriptionId, session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function generateQr() {
    if (!session) return;
    setQrBusy(true);
    setError(null);
    try {
      const generated = await generatePatientPrescriptionQr(session.access_token, prescriptionId);
      setQrPayload(generated.qrPayload);
    } catch (generateError) {
      setQrPayload(null);
      setError(generateError instanceof Error ? generateError.message : "The QR could not be generated.");
      await load();
    } finally {
      setQrBusy(false);
    }
  }

  if (!value && !error) return <LoadingPanel label="Loading prescription..." />;
  const cancelled = value?.status === "CANCELLED";
  const dispensed = value?.dispensingStatus === "DISPENSED";

  return <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">
    <PortalHeading eyebrow="Digital prescription" title="Prescription details" description="Your issued clinical medication instructions." backHref="/patient/prescriptions" backLabel="Back to prescriptions" />
    <div className="mt-7"><InlineError message={error} /></div>
    {value ? <>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex justify-between gap-4"><div><h2 className="text-xl font-semibold">{value.doctorName}</h2><p className="mt-1 text-sm text-slate-600">{value.medicalRegistrationNumber} · {value.specializationName}</p><p className="text-sm text-slate-600">{value.hospitalName} · {value.departmentName}</p></div><PrescriptionStatusBadge status={value.status} expired={value.expired} dispensingStatus={value.dispensingStatus} /></div>
        <p className="mt-5 text-sm text-slate-600">Consultation: {formatAppointmentTime(value.consultationScheduledStart)}</p>
        {value.validUntil ? <p className="mt-1 text-sm text-slate-600">Valid until: {formatAppointmentTime(value.validUntil)}</p> : null}
      </section>
      {dispensed ? <section className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 p-6 text-sky-950"><h2 className="font-semibold">Prescription dispensed</h2>{value.dispensedAt ? <p className="mt-2 text-sm">Dispensed {formatAppointmentTime(value.dispensedAt)}</p> : null}{value.dispensingPharmacy ? <p className="mt-1 text-sm">Pharmacy: {value.dispensingPharmacy}</p> : null}<p className="mt-3 text-sm">This prescription has already been dispensed. Another QR cannot be generated.</p></section> : null}

      {cancelled ? <section className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950"><h2 className="font-semibold">Prescription cancelled</h2>{value.cancelledAt ? <p className="mt-2 text-sm">Cancelled {formatAppointmentTime(value.cancelledAt)}</p> : null}<p className="mt-2 whitespace-pre-wrap text-sm">{value.cancellationReason || "No cancellation reason was provided."}</p><p className="mt-3 text-sm">Medicine details and instructions are no longer displayed for a cancelled prescription.</p></section> : <>
        {value.expired ? <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">This prescription has expired. Contact your doctor if you need further care.</section> : null}
        <section className="mt-8"><h2 className="mb-4 text-2xl font-semibold">Medicines</h2><PrescriptionItemsView items={value.items} /></section>
        {value.generalInstructions ? <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">General instructions</h2><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{value.generalInstructions}</p></section> : null}
      </>}
      {!cancelled && !dispensed && value.doctorFeeStatus !== "AWAITING_CONFIRMATION" ? <section className="mt-8 rounded-3xl border border-teal-200 bg-teal-50 p-6 text-center sm:p-8"><h2 className="text-xl font-semibold text-teal-950">Secure Prescription QR</h2>
        {qrPayload ? <><p className="mx-auto mt-2 max-w-xl text-sm text-teal-900">This newly generated QR replaces any earlier QR for this prescription.</p><div className="mt-5"><PrescriptionQr payload={qrPayload} /></div><button className="mt-5 rounded-xl border border-teal-700 px-5 py-3 text-sm font-semibold text-teal-900 disabled:opacity-50 print:hidden" disabled={qrBusy} onClick={() => void generateQr()}>{qrBusy ? "Generating..." : "Generate a new QR"}</button></> : value.qrGenerationAllowed ? <><p className="mx-auto mt-2 max-w-xl text-sm text-teal-900">Generate a secure QR when you are ready to present this prescription. The secret is returned only for this request.</p><button className="mt-5 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 print:hidden" disabled={qrBusy} onClick={() => void generateQr()}>{qrBusy ? "Generating..." : "Generate QR"}</button></> : <p className="mt-2 text-sm text-teal-900">QR generation is unavailable because this prescription is expired.</p>}
      </section> : null}
      {!cancelled ? <button className="mt-6 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold print:hidden" onClick={() => window.print()}>Print prescription</button> : null}
    </> : null}
  </main>;
}

export default function Page() {
  return <ProtectedRoute roles={["PATIENT"]}><Content /></ProtectedRoute>;
}

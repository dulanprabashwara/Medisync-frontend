"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Printer, AlertCircle, CheckCircle2, QrCode } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import {
  PrescriptionItemsView,
  PrescriptionQr,
  PrescriptionStatusBadge,
} from "@/components/prescription-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { SectionCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  generatePatientPrescriptionQr,
  getPatientPrescription,
} from "@/lib/api";
import { formatDoctorName } from "@/lib/formatters";
import type { PatientPrescriptionDetail } from "@/types/prescriptions";

export default function PatientPrescriptionDetailPage() {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const { session } = useAuth();

  const [value, setValue] = useState<PatientPrescriptionDetail | null>(null);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [qrBusy, setQrBusy] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      setValue(
        await getPatientPrescription(session.access_token, prescriptionId),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The prescription could not be loaded.",
      );
    } finally {
      setLoading(false);
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
      const generated = await generatePatientPrescriptionQr(
        session.access_token,
        prescriptionId,
      );
      setQrPayload(generated.qrPayload);
    } catch (generateError) {
      setQrPayload(null);
      setError(
        generateError instanceof Error
          ? generateError.message
          : "The QR could not be generated.",
      );
      await load();
    } finally {
      setQrBusy(false);
    }
  }

  if (loading && !value) {
    return (
      <ProtectedRoute roles={["PATIENT"]}>
        <LoadingPanel label="Loading prescription..." />
      </ProtectedRoute>
    );
  }

  const cancelled = value?.status === "CANCELLED";
  const dispensed = value?.dispensingStatus === "DISPENSED";
  const awaitingPayment = value?.doctorFeeStatus === "AWAITING_CONFIRMATION";

  return (
    <ProtectedRoute roles={["PATIENT"]}>
      <div className="max-w-6xl mx-auto space-y-8">
        <PortalHeading
          eyebrow="Patient Care"
          title="Prescription Details"
          description="Your issued clinical medication instructions."
          backHref="/patient/prescriptions"
          backLabel="Back to prescriptions"
          action={
            !cancelled ? (
              <Button
                variant="secondary"
                onClick={() => window.print()}
                className="print:hidden"
              >
                <Printer className="size-4 mr-2" />
                Print Prescription
              </Button>
            ) : null
          }
        />

        {error && <Alert tone="error">{error}</Alert>}

        {value && (
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2 space-y-8">
              <SectionCard>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      {formatDoctorName(value.doctorName)}
                    </h2>
                    <p className="text-sm font-medium text-teal-700 mt-1">
                      {value.specializationName}
                    </p>
                    <p className="text-sm text-slate-600">
                      {value.medicalRegistrationNumber}
                    </p>
                  </div>
                  <PrescriptionStatusBadge
                    status={value.status}
                    expired={value.expired}
                    dispensingStatus={value.dispensingStatus}
                  />
                </div>

                <dl className="grid gap-4 sm:grid-cols-2 text-sm pt-6 border-t border-slate-100">
                  <div>
                    <dt className="text-slate-500 mb-1">Hospital</dt>
                    <dd className="font-medium text-slate-900">
                      {value.hospitalName}
                    </dd>
                    <dd className="text-slate-600">{value.departmentName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-1">Consultation Date</dt>
                    <dd className="font-medium text-slate-900">
                      {formatAppointmentTime(value.consultationScheduledStart)}
                    </dd>
                  </div>
                  {value.issuedAt && (
                    <div>
                      <dt className="text-slate-500 mb-1">Issued</dt>
                      <dd className="font-medium text-slate-900">
                        {formatAppointmentTime(value.issuedAt)}
                      </dd>
                    </div>
                  )}
                  {value.validUntil && (
                    <div>
                      <dt className="text-slate-500 mb-1">Valid Until</dt>
                      <dd className="font-medium text-slate-900">
                        {formatAppointmentTime(value.validUntil)}
                      </dd>
                    </div>
                  )}
                </dl>
              </SectionCard>

              {dispensed && (
                <Alert tone="success" icon={CheckCircle2}>
                  <div className="font-semibold mb-1">
                    Prescription Dispensed
                  </div>
                  <div>
                    {value.dispensedAt &&
                      `Dispensed ${formatAppointmentTime(value.dispensedAt)}`}
                    {value.dispensingPharmacy &&
                      ` · Pharmacy: ${value.dispensingPharmacy}`}
                  </div>
                  <div className="mt-2 text-xs">
                    This prescription has already been dispensed. Another QR
                    cannot be generated.
                  </div>
                </Alert>
              )}

              {cancelled && (
                <Alert tone="error" icon={AlertCircle}>
                  <div className="font-semibold mb-1">
                    Prescription Cancelled
                  </div>
                  {value.cancelledAt && (
                    <div className="mb-2">
                      Cancelled {formatAppointmentTime(value.cancelledAt)}
                    </div>
                  )}
                  <div className="bg-rose-100/50 p-3 rounded-lg text-rose-900 mb-2">
                    <span className="font-medium block mb-1">Reason:</span>
                    {value.cancellationReason ||
                      "No cancellation reason was provided."}
                  </div>
                  <div className="text-xs">
                    Medicine details and instructions are no longer displayed
                    for a cancelled prescription.
                  </div>
                </Alert>
              )}

              {!cancelled && (
                <>
                  {value.expired && (
                    <Alert tone="warning" icon={AlertCircle}>
                      This prescription has expired. Contact your doctor if you
                      need further care.
                    </Alert>
                  )}

                  <SectionCard title="Medicines">
                    <PrescriptionItemsView items={value.items} />
                  </SectionCard>

                  {value.generalInstructions && (
                    <SectionCard title="General Instructions">
                      <p className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {value.generalInstructions}
                      </p>
                    </SectionCard>
                  )}
                </>
              )}
            </div>

            <div className="lg:col-span-1 print:hidden">
              {!cancelled && !dispensed && (
                <SectionCard
                  title="Prescription QR"
                  className={
                    awaitingPayment
                      ? "border-amber-200"
                      : "border-teal-200 bg-teal-50/30"
                  }
                >
                  {awaitingPayment ? (
                    <div className="text-center space-y-5 py-4">
                      <div className="size-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-600">
                        <AlertCircle className="size-8" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          QR pending payment
                        </p>
                        <p className="mt-2 text-sm text-amber-700">
                          QR generation will become available after the required
                          payment is confirmed.
                        </p>
                      </div>
                      <Button asChild variant="secondary" className="w-full">
                        <Link
                          href={`/patient/consultations/${value.consultationId}`}
                        >
                          Return to Consultation
                        </Link>
                      </Button>
                    </div>
                  ) : qrPayload ? (
                    <div className="text-center space-y-6 py-2">
                      <p className="text-sm text-slate-600">
                        A verified MediSync pharmacist can scan this QR.
                        Generating a new QR will invalidate the previous one.
                      </p>
                      <div className="flex justify-center">
                        <PrescriptionQr payload={qrPayload} />
                      </div>
                      <Button
                        variant="secondary"
                        className="w-full"
                        disabled={qrBusy}
                        onClick={() => void generateQr()}
                      >
                        {qrBusy ? "Generating..." : "Generate New QR"}
                      </Button>
                    </div>
                  ) : value.qrGenerationAllowed ? (
                    <div className="text-center space-y-5 py-4">
                      <div className="size-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto text-teal-600">
                        <QrCode className="size-8" />
                      </div>
                      <p className="text-sm text-slate-600">
                        Your prescription is ready for pharmacy verification.
                      </p>
                      <Button
                        className="w-full"
                        disabled={qrBusy}
                        onClick={() => void generateQr()}
                      >
                        {qrBusy ? "Generating..." : "Generate QR"}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-600">
                        QR generation is unavailable because this prescription
                        is expired.
                      </p>
                    </div>
                  )}
                </SectionCard>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

"use client";

import type { Html5Qrcode } from "html5-qrcode";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useAuth } from "@/components/auth-provider";
import { PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import {
  dispensePharmacistPrescription,
  verifyPharmacistPrescription,
} from "@/lib/api";
import type {
  DispensePrescriptionResult,
  PharmacyPrescriptionVerification,
} from "@/types/pharmacy";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SectionCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDoctorName } from "@/lib/formatters";
import { QrCode, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

const readerId = "medisync-pharmacist-qr-reader";

function Content() {
  const { session } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanHandledRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualPayload, setManualPayload] = useState("");
  const [activePayload, setActivePayload] = useState<string | null>(null);
  const [verification, setVerification] =
    useState<PharmacyPrescriptionVerification | null>(null);
  const [success, setSuccess] = useState<DispensePrescriptionResult | null>(null);
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        if (scanner.isScanning) await scanner.stop();
        scanner.clear();
      } catch {
        // Camera cleanup is best-effort; no QR material is logged.
      }
    }
    setCameraActive(false);
  }, []);

  const verifyPayload = useCallback(
    async (payload: string) => {
      if (!session) return;
      const normalized = payload.trim();
      if (!normalized) {
        setError("Scan a QR or paste a QR payload first.");
        return;
      }
      setBusy("verify");
      setError(null);
      setSuccess(null);
      setVerification(null);
      try {
        const result = await verifyPharmacistPrescription(
          session.access_token,
          normalized,
        );
        setVerification(result);
        setActivePayload(result.dispensingEligible ? normalized : null);
      } catch (verifyError) {
        setActivePayload(null);
        setError(
          verifyError instanceof Error
            ? verifyError.message
            : "We couldn't verify this prescription. Please check your connection and try again.",
        );
      } finally {
        setBusy(null);
      }
    },
    [session],
  );

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is unavailable. Allow camera access to scan a prescription, or enter the QR manually.");
      setShowManual(true);
      return;
    }
    await stopCamera();
    setError(null);
    setSuccess(null);
    setVerification(null);
    setActivePayload(null);
    setShowManual(false);
    scanHandledRef.current = false;
    try {
      const { Html5Qrcode: Scanner } = await import("html5-qrcode");
      const scanner = new Scanner(readerId, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (scanHandledRef.current) return;
          scanHandledRef.current = true;
          void (async () => {
            await stopCamera();
            await verifyPayload(decodedText);
          })();
        },
        () => undefined,
      );
      setCameraActive(true);
    } catch {
      await stopCamera();
      setError("Camera access is unavailable. Allow camera access to scan a prescription, or enter the QR manually.");
      setShowManual(true);
    }
  }, [stopCamera, verifyPayload]);

  useEffect(() => {
    const timer = window.setTimeout(() => void startCamera(), 0);
    return () => {
      window.clearTimeout(timer);
      void stopCamera();
    };
  }, [startCamera, stopCamera]);

  async function submitManual(event: FormEvent) {
    event.preventDefault();
    await stopCamera();
    await verifyPayload(manualPayload);
  }

  async function dispense() {
    if (!session || !activePayload || !verification?.dispensingEligible) return;
    setBusy("dispense");
    setError(null);
    try {
      const result = await dispensePharmacistPrescription(
        session.access_token,
        activePayload,
        note,
      );
      setSuccess(result);
      setActivePayload(null);
      setManualPayload("");
      setVerification(null);
      setNote("");
      setConfirming(false);
    } catch (dispenseError) {
      setConfirming(false);
      setError(
        dispenseError instanceof Error
          ? dispenseError.message
          : "The prescription could not be dispensed.",
      );
    } finally {
      setBusy(null);
    }
  }

  function handleScanAnother() {
    setSuccess(null);
    setVerification(null);
    setActivePayload(null);
    setError(null);
    setManualPayload("");
    void startCamera();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PortalHeading
        eyebrow=""
        title="Scan Prescription"
        description="Scan a patient's MediSync prescription QR to verify it before dispensing."
        backHref="/pharmacist/dashboard"
      />

      <div className="space-y-6">
        {error ? (
          <Alert tone="error">
            {error}
          </Alert>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
            <div className="flex items-center gap-3 text-emerald-700 mb-4">
              <CheckCircle2 className="size-8" />
              <h2 className="text-2xl font-semibold">Prescription Dispensed ✓</h2>
            </div>
            <p className="text-emerald-900 font-medium mb-6">
              The prescription has been successfully dispensed and cannot be used again.
            </p>
            <div className="bg-white/60 rounded-xl p-4 mb-6">
              <p className="text-sm text-emerald-800"><span className="font-semibold">Patient:</span> {verification?.patientName || "Unknown"}</p>
              <p className="text-sm text-emerald-800"><span className="font-semibold">Dispensed:</span> {formatAppointmentTime(success.dispensedAt)}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleScanAnother}>Scan Another Prescription</Button>
            </div>
          </div>
        ) : verification ? (
          <VerificationResult
            value={verification}
            note={note}
            busy={busy !== null}
            onNote={setNote}
            onDispense={() => setConfirming(true)}
            onScanAnother={handleScanAnother}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Camera Section */}
            <SectionCard className="flex flex-col">
              <div className="mb-4 text-center">
                <h3 className="font-semibold text-lg text-slate-900">Ready to scan</h3>
                <p className="text-sm text-slate-600">Position the MediSync prescription QR inside the camera frame.</p>
              </div>
              <div
                id={readerId}
                className="mt-2 w-full flex-1 min-h-72 overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center relative"
              >
                {!cameraActive && busy === "verify" && (
                  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-white font-medium flex-col gap-2 z-10">
                    <RefreshCw className="size-6 animate-spin" />
                    Verifying prescription...
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-col items-center justify-center gap-4">
                {!showManual ? (
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-2">Having trouble scanning?</p>
                    <Button variant="secondary" onClick={() => setShowManual(true)}>Enter QR manually</Button>
                  </div>
                ) : null}
              </div>
            </SectionCard>

            {/* Manual Entry Section */}
            {showManual && (
              <SectionCard className="flex flex-col h-full">
                <form onSubmit={submitManual} className="flex flex-col h-full">
                  <h3 className="font-semibold text-lg text-slate-900">Enter Prescription QR</h3>
                  <label className="mt-4 block flex-1">
                    <textarea
                      className="w-full h-full min-h-48 resize-y rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm focus-visible:outline-teal-600"
                      autoComplete="off"
                      spellCheck={false}
                      value={manualPayload}
                      onChange={(event) => setManualPayload(event.target.value)}
                      placeholder="MEDISYNC:RX:..."
                      required
                    />
                  </label>
                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setShowManual(false)} type="button">Cancel</Button>
                    <Button type="submit" disabled={busy !== null || !manualPayload.trim()} loading={busy === "verify"}>
                      Verify Prescription
                    </Button>
                  </div>
                </form>
              </SectionCard>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={confirming}
        onClose={() => !busy && setConfirming(false)}
        title="Confirm dispensing?"
        description="You are about to mark this prescription as dispensed."
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="text-sm text-slate-700"><strong>Patient:</strong> {verification?.patientName || "Unknown"}</p>
            <p className="text-sm text-slate-700"><strong>Doctor:</strong> {formatDoctorName(verification?.doctorName || "")}</p>
            <p className="text-sm text-slate-700"><strong>Issued:</strong> {verification?.issuedAt ? formatAppointmentTime(verification.issuedAt) : "Unknown"}</p>
          </div>
          
          <Alert tone="warning">
            This action prevents the prescription from being used again.
          </Alert>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy !== null}>Cancel</Button>
            <Button onClick={() => void dispense()} disabled={busy !== null} loading={busy === "dispense"}>
              Confirm Dispensing
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function VerificationResult({
  value,
  note,
  busy,
  onNote,
  onDispense,
  onScanAnother,
}: {
  value: PharmacyPrescriptionVerification;
  note: string;
  busy: boolean;
  onNote: (value: string) => void;
  onDispense: () => void;
  onScanAnother: () => void;
}) {
  if (!value.dispensingEligible) {
    const isExpired = value.status === "EXPIRED";
    const isCancelled = value.status === "CANCELLED";
    const isDispensed = value.status === "ALREADY_DISPENSED";
    const isInvalid = value.status === "QR_NO_LONGER_VALID" || value.status === "VERIFIED";

    return (
      <SectionCard className={`border ${isExpired || isCancelled ? "border-rose-200 bg-rose-50" : isDispensed ? "border-amber-200 bg-amber-50" : "border-slate-200"}`}>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className={`size-6 ${isExpired || isCancelled ? "text-rose-600" : isDispensed ? "text-amber-600" : "text-slate-600"}`} />
          <h2 className={`text-xl font-semibold ${isExpired || isCancelled ? "text-rose-900" : isDispensed ? "text-amber-900" : "text-slate-900"}`}>
            {isExpired ? "Prescription Expired" : isCancelled ? "Prescription Cancelled" : isDispensed ? "Already Dispensed" : "QR Not Valid"}
          </h2>
        </div>
        
        <p className="text-sm font-medium mb-6">
          {isExpired ? "This prescription has expired and cannot be dispensed." 
          : isCancelled ? "This prescription is no longer valid and must not be dispensed." 
          : isDispensed ? "This prescription was previously dispensed and cannot be used again." 
          : "This is not a valid active MediSync prescription QR. Ask the patient to display their current prescription QR."}
        </p>

        {isDispensed && value.dispensedAt && (
          <div className="bg-white/60 p-4 rounded-xl mb-6">
            <p className="text-sm font-medium">Dispensed: {formatAppointmentTime(value.dispensedAt)}</p>
            {value.pharmacyName && <p className="text-sm mt-1">Pharmacy: {value.pharmacyName}</p>}
          </div>
        )}

        <Button onClick={onScanAnother}>Scan Another Prescription</Button>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard className="border-emerald-200 border-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-4 mb-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="size-6" />
            <span className="text-xl font-bold">Prescription Verified ✓</span>
          </div>
          <StatusBadge tone="success">Ready to Dispense</StatusBadge>
        </div>
        <p className="text-sm text-emerald-800 font-medium mb-6">This prescription is valid and ready to dispense.</p>
        
        <div className="grid gap-y-4 gap-x-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Patient</p>
            <p className="font-medium text-slate-900">{value.patientName || "Unknown"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Doctor</p>
            <p className="font-medium text-slate-900">{formatDoctorName(value.doctorName || "")}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Issued</p>
            <p className="font-medium text-slate-900">{value.issuedAt ? formatAppointmentTime(value.issuedAt) : "Unknown"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Valid Until</p>
            <p className="font-medium text-slate-900">{value.validUntil ? formatAppointmentTime(value.validUntil) : "Unknown"}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Medicines">
        <div className="space-y-4">
          {value.items.map((item, idx) => (
            <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">
                {item.medicineName} {item.strength ? `· ${item.strength}` : ""}
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {item.quantity && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Quantity</p>
                    <p className="text-sm font-semibold text-slate-900">{item.quantity}</p>
                  </div>
                )}
                {item.dosage && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Dosage</p>
                    <p className="text-sm font-semibold text-slate-900">{item.dosage}</p>
                  </div>
                )}
                {item.frequency && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Frequency</p>
                    <p className="text-sm font-semibold text-slate-900">{item.frequency}</p>
                  </div>
                )}
                {item.duration && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Duration</p>
                    <p className="text-sm font-semibold text-slate-900">{item.duration}</p>
                  </div>
                )}
                {item.medicineForm && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Form</p>
                    <p className="text-sm font-medium text-slate-800">{item.medicineForm}</p>
                  </div>
                )}
                {item.route && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Route</p>
                    <p className="text-sm font-medium text-slate-800">{item.route}</p>
                  </div>
                )}
              </div>
              
              {item.instructions && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-medium mb-1">Instructions</p>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{item.instructions}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {value.generalInstructions && (
          <div className="mt-6 bg-slate-50 rounded-xl p-5 border border-slate-100">
            <h4 className="font-semibold text-slate-900 mb-2">General Instructions</h4>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{value.generalInstructions}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Dispensing Note (Optional)
          </label>
          <textarea
            className="w-full min-h-24 resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm focus-visible:outline-teal-600"
            value={note}
            onChange={(e) => onNote(e.target.value)}
            placeholder="Add any internal dispensing notes..."
          />
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="secondary" onClick={onScanAnother} disabled={busy}>Scan Another</Button>
          <Button onClick={onDispense} disabled={busy}>Dispense Prescription</Button>
        </div>
      </SectionCard>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute roles={["PHARMACIST"]}>
      <Content />
    </ProtectedRoute>
  );
}


"use client";

import type { Html5Qrcode } from "html5-qrcode";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { FormAlert } from "@/components/auth-card";
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

const readerId = "medisync-pharmacist-qr-reader";

function Content() {
  const { session } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanHandledRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualPayload, setManualPayload] = useState("");
  const [activePayload, setActivePayload] = useState<string | null>(null);
  const [verification, setVerification] =
    useState<PharmacyPrescriptionVerification | null>(null);
  const [success, setSuccess] = useState<DispensePrescriptionResult | null>(
    null,
  );
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
            : "The prescription QR could not be verified.",
        );
      } finally {
        setBusy(null);
      }
    },
    [session],
  );

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "Camera scanning is unavailable in this browser. Use the manual QR entry below.",
      );
      return;
    }
    await stopCamera();
    setError(null);
    setSuccess(null);
    setVerification(null);
    setActivePayload(null);
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
      setError(
        "Camera permission was denied or no usable camera was found. Use manual QR entry instead.",
      );
    }
  }, [stopCamera, verifyPayload]);

  useEffect(
    () => () => {
      void stopCamera();
    },
    [stopCamera],
  );

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

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading
        eyebrow="Secure pharmacy workflow"
        title="Scan prescription"
        description="Scan the patient’s one-time QR. The payload is sent only in an authenticated POST body and is never saved in browser storage."
        backHref="/pharmacist/dashboard"
      />
      <div className="mt-7 space-y-3">
        {error ? <FormAlert message={error} /> : null}
      </div>

      {success ? (
        <section className="mt-7 rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-emerald-950">
          <p className="text-xs font-bold uppercase tracking-widest">
            Dispensing complete
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Prescription Dispensed Successfully
          </h2>
          <p className="mt-4">
            Dispensed: {formatAppointmentTime(success.dispensedAt)}
          </p>
          <p className="mt-1">Pharmacy: {success.pharmacyName}</p>
          <p className="mt-4 text-sm">This prescription QR is now invalid.</p>
          <button
            className="mt-5 rounded-xl border border-emerald-700 px-4 py-2 text-sm font-semibold"
            onClick={() => setSuccess(null)}
          >
            Scan another prescription
          </button>
        </section>
      ) : null}

      {!success ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Camera scanner</h2>
            <p className="mt-2 text-sm text-slate-600">
              Camera access requires HTTPS or localhost.
            </p>
            <div
              id={readerId}
              className="mt-5 min-h-56 overflow-hidden rounded-2xl bg-slate-950"
            />
            <div className="mt-4 flex gap-3">
              <button
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                disabled={cameraActive || busy !== null}
                onClick={() => void startCamera()}
              >
                {cameraActive ? "Camera active" : "Start camera"}
              </button>
              {cameraActive ? (
                <button
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
                  onClick={() => void stopCamera()}
                >
                  Stop camera
                </button>
              ) : null}
            </div>
          </section>
          <form
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={submitManual}
          >
            <h2 className="text-xl font-semibold">Manual QR entry</h2>
            <p className="mt-2 text-sm text-slate-600">
              Development fallback when a camera is unavailable. The value
              remains only in this page&apos;s memory.
            </p>
            <label className="mt-5 block text-sm font-semibold">
              Paste QR payload
              <textarea
                className="mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
                maxLength={128}
                value={manualPayload}
                onChange={(event) => setManualPayload(event.target.value)}
                placeholder="MEDISYNC:RX:..."
              />
            </label>
            <button
              className="mt-4 rounded-xl border border-teal-700 px-5 py-3 text-sm font-semibold text-teal-800 disabled:opacity-50"
              disabled={busy !== null || !manualPayload.trim()}
              type="submit"
            >
              {busy === "verify" ? "Verifying..." : "Verify prescription"}
            </button>
          </form>
        </div>
      ) : null}

      {verification ? (
        <VerificationResult
          value={verification}
          note={note}
          busy={busy !== null}
          onNote={setNote}
          onDispense={() => setConfirming(true)}
        />
      ) : null}

      {confirming ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm dispensing"
        >
          <section className="max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
            <h2 className="text-2xl font-semibold">Confirm Dispensing</h2>
            <p className="mt-4 leading-7 text-slate-700">
              I confirm that all medicines listed in this prescription are being
              dispensed. Partial dispensing is not supported.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
                disabled={busy !== null}
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                disabled={busy !== null}
                onClick={() => void dispense()}
              >
                {busy === "dispense" ? "Dispensing..." : "Confirm Dispense"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function VerificationResult({
  value,
  note,
  busy,
  onNote,
  onDispense,
}: {
  value: PharmacyPrescriptionVerification;
  note: string;
  busy: boolean;
  onNote: (value: string) => void;
  onDispense: () => void;
}) {
  if (!value.dispensingEligible) {
    const titles: Record<PharmacyPrescriptionVerification["status"], string> = {
      VERIFIED: "Prescription Verified",
      ALREADY_DISPENSED: "Prescription Already Dispensed",
      EXPIRED: "Prescription Expired",
      CANCELLED: "Prescription Cancelled",
      QR_NO_LONGER_VALID: "QR No Longer Valid",
    };
    return (
      <section className="mt-7 rounded-3xl border border-amber-200 bg-amber-50 p-7 text-amber-950">
        <h2 className="text-2xl font-semibold">{titles[value.status]}</h2>
        <p className="mt-3">{value.message}</p>
        {value.dispensedAt ? (
          <p className="mt-3 text-sm">
            Dispensed {formatAppointmentTime(value.dispensedAt)}
            {value.pharmacyName ? ` at ${value.pharmacyName}` : ""}.
          </p>
        ) : null}
      </section>
    );
  }
  return (
    <section className="mt-7 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
        Prescription verified
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Detail label="Patient" value={value.patientName} />
        <Detail label="Doctor" value={value.doctorName} />
        <Detail
          label="Doctor registration"
          value={value.doctorRegistrationNumber}
        />
        <Detail label="Specialization" value={value.doctorSpecialization} />
        <Detail label="Hospital" value={value.affiliatedHospital} />
        <Detail
          label="Issued"
          value={value.issuedAt ? formatAppointmentTime(value.issuedAt) : null}
        />
        <Detail
          label="Valid until"
          value={
            value.validUntil ? formatAppointmentTime(value.validUntil) : null
          }
        />
      </div>
      <h3 className="mt-7 text-xl font-semibold">Medicines</h3>
      <div className="mt-4 space-y-4">
        {value.items.map((item) => (
          <article className="rounded-2xl bg-slate-50 p-5" key={item.position}>
            <h4 className="font-semibold">
              {item.medicineName}
              {item.strength ? ` · ${item.strength}` : ""}
            </h4>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <Detail label="Form" value={item.medicineForm} />
              <Detail label="Dosage" value={item.dosage} />
              <Detail label="Frequency" value={item.frequency} />
              <Detail label="Duration" value={item.duration} />
              <Detail label="Quantity" value={item.quantity} />
              <Detail label="Route" value={item.route} />
            </dl>
            {item.instructions ? (
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                {item.instructions}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      {value.generalInstructions ? (
        <div className="mt-6 rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold">General instructions</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
            {value.generalInstructions}
          </p>
        </div>
      ) : null}
      <label className="mt-6 block text-sm font-semibold">
        Optional dispensing note
        <textarea
          className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-300 px-4 py-3"
          maxLength={1000}
          value={note}
          onChange={(event) => onNote(event.target.value)}
        />
      </label>
      <button
        className="mt-5 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
        disabled={busy}
        onClick={onDispense}
      >
        Dispense Prescription
      </button>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-900">{value || "Not provided"}</dd>
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

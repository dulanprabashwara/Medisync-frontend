"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import {
  InlineError,
  PortalHeading,
  formatAppointmentTime,
} from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import {
  getPharmacistDispensation,
  getPharmacistDispensations,
} from "@/lib/api";
import type {
  DispensationHistoryDetail,
  DispensationHistorySummary,
} from "@/types/pharmacy";

function Content() {
  const { session } = useAuth();
  const [items, setItems] = useState<DispensationHistorySummary[]>([]);
  const [selected, setSelected] = useState<DispensationHistoryDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setItems(
        (await getPharmacistDispensations(session.access_token, 0, 50)).content,
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Dispensing history could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function open(item: DispensationHistorySummary) {
    if (!session) return;
    setError(null);
    try {
      setSelected(
        await getPharmacistDispensation(session.access_token, item.id),
      );
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : "The dispensing record could not be loaded.",
      );
    }
  }

  if (loading) return <LoadingPanel label="Loading dispensing history..." />;
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading
        eyebrow="Pharmacy records"
        title="Dispensing history"
        description="Only prescriptions dispensed by your professional account appear here."
        backHref="/pharmacist/dashboard"
      />
      <div className="mt-7">
        <InlineError message={error} />
      </div>
      <section className="mt-8 space-y-4">
        {items.length === 0 ? (
          <p className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
            No prescriptions have been dispensed through this account.
          </p>
        ) : (
          items.map((item) => (
            <button
              className="block w-full rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:border-teal-300"
              key={item.id}
              onClick={() => void open(item)}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <h2 className="text-lg font-semibold">{item.patientName}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.doctorName} · {item.medicineCount} medicine
                    {item.medicineCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-sm text-slate-600 sm:text-right">
                  <p>{formatAppointmentTime(item.dispensedAt)}</p>
                  <p>{item.pharmacyName}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </section>
      {selected ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
                  Dispensing record
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {selected.patientName}
                </h2>
              </div>
              <button
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <HistoryDetail label="Doctor" value={selected.doctorName} />
              <HistoryDetail
                label="Dispensed"
                value={formatAppointmentTime(selected.dispensedAt)}
              />
              <HistoryDetail label="Pharmacy" value={selected.pharmacyName} />
              <HistoryDetail
                label="Professional registration"
                value={selected.pharmacistRegistrationNumber}
              />
              <HistoryDetail
                label="Issued"
                value={formatAppointmentTime(selected.issuedAt)}
              />
              <HistoryDetail
                label="Valid until"
                value={formatAppointmentTime(selected.validUntil)}
              />
            </dl>
            <h3 className="mt-7 text-xl font-semibold">Medicines dispensed</h3>
            <div className="mt-4 space-y-3">
              {selected.items.map((item) => (
                <article
                  className="rounded-2xl bg-slate-50 p-5"
                  key={item.position}
                >
                  <h4 className="font-semibold">
                    {item.medicineName}
                    {item.strength ? ` · ${item.strength}` : ""}
                  </h4>
                  <p className="mt-2 text-sm text-slate-700">
                    {item.dosage} · {item.frequency} · {item.duration}
                    {item.quantity ? ` · Quantity ${item.quantity}` : ""}
                  </p>
                </article>
              ))}
            </div>
            {selected.dispensingNote ? (
              <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold">Dispensing note</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {selected.dispensingNote}
                </p>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}

function HistoryDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value}</dd>
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

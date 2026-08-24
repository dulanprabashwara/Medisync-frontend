"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import {
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
import { Dialog } from "@/components/ui/dialog";
import { SectionCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { formatDoctorName } from "@/lib/formatters";
import { FileText, ClipboardList } from "lucide-react";

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

  // Effect to automatically open if "id" is in query string (from dashboard link)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id && items.length > 0 && !selected) {
      const item = items.find(i => i.id === id);
      if (item) void open(item);
    }
  }, [items, selected]);

  if (loading) return <LoadingPanel label="Loading dispensing history..." />;

  return (
    <main className="mx-auto max-w-5xl">
      <PortalHeading
        eyebrow=""
        title="Dispensing History"
        description="Review prescriptions dispensed by your verified professional account."
        backHref="/pharmacist/dashboard"
      />

      <div className="space-y-6">
        {error ? <Alert tone="error">{error}</Alert> : null}

        <SectionCard title="Recent Dispensations">
          {items.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No prescriptions dispensed"
              description="Records of prescriptions you dispense will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <button
                  className="w-full py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0 text-left hover:bg-slate-50 transition-colors rounded-xl px-2 -mx-2"
                  key={item.id}
                  onClick={() => void open(item)}
                >
                  <div className="flex gap-4 items-start">
                    <div className="hidden sm:flex mt-1 size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.patientName}</h3>
                      <div className="mt-1 text-sm text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{formatDoctorName(item.doctorName)}</span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span>{item.medicineCount} medicine{item.medicineCount === 1 ? "" : "s"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 sm:text-right">
                    <p className="font-medium text-slate-900">{formatAppointmentTime(item.dispensedAt)}</p>
                    <p className="mt-1">{item.pharmacyName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Dispensing Record"
        className="max-w-3xl"
      >
        {selected && (
          <div className="space-y-8 mt-2 text-slate-900">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <HistoryDetail label="Patient" value={selected.patientName} />
              <HistoryDetail label="Doctor" value={formatDoctorName(selected.doctorName)} />
              <HistoryDetail
                label="Dispensed"
                value={formatAppointmentTime(selected.dispensedAt)}
              />
              <HistoryDetail label="Pharmacy" value={selected.pharmacyName} />
              <HistoryDetail
                label="Pharmacist Registration"
                value={selected.pharmacistRegistrationNumber}
              />
              <HistoryDetail
                label="Issued"
                value={formatAppointmentTime(selected.issuedAt)}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Medicines Dispensed</h3>
              <div className="space-y-3">
                {selected.items.map((item) => (
                  <article
                    className="rounded-2xl border border-slate-200 p-4"
                    key={item.position}
                  >
                    <h4 className="font-semibold text-slate-900">
                      {item.medicineName}
                      {item.strength ? ` · ${item.strength}` : ""}
                    </h4>
                    <p className="mt-2 text-sm text-slate-600">
                      {[
                        item.dosage,
                        item.frequency,
                        item.duration,
                        item.quantity ? `Qty: ${item.quantity}` : null,
                      ].filter(Boolean).join(" · ")}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {selected.dispensingNote ? (
              <div>
                <h3 className="text-lg font-semibold mb-3">Dispensing Note</h3>
                <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 text-sm whitespace-pre-wrap text-slate-800">
                  {selected.dispensingNote}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Dialog>
    </main>
  );
}

function HistoryDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 font-medium">{value}</dd>
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

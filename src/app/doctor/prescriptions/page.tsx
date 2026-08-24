"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import {
  InlineError,
  PortalHeading,
  formatAppointmentTime,
} from "@/components/portal-ui";
import { PrescriptionStatusBadge } from "@/components/prescription-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { getDoctorPrescriptions } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { FileSignature, FileText, History } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { DoctorPrescription } from "@/types/prescriptions";

type Tab = "drafts" | "issued" | "history";

function Content() {
  const { session } = useAuth();
  const [items, setItems] = useState<DoctorPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("drafts");

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setItems(
        (await getDoctorPrescriptions(session.access_token, 0, 50)).content,
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Prescriptions could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const groups = useMemo(() => {
    const asc = (a: DoctorPrescription, b: DoctorPrescription) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    const desc = (a: DoctorPrescription, b: DoctorPrescription) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    return {
      drafts: items.filter((p) => p.status === "DRAFT").sort(desc),
      issued: items
        .filter((p) => p.status === "ISSUED" && p.dispensingStatus !== "DISPENSED" && !p.expired)
        .sort(desc),
      history: items
        .filter((p) => p.status === "CANCELLED" || p.dispensingStatus === "DISPENSED" || p.expired)
        .sort(desc),
    };
  }, [items]);

  if (loading) return <LoadingPanel label="Loading prescriptions..." />;

  return (
    <main className="mx-auto max-w-5xl">
      <PortalHeading
        eyebrow="Doctor Portal"
        title="Prescriptions"
        description="Manage prescription drafts and issued prescriptions."
        backHref="/doctor/dashboard"
      />
      <div className="mt-7">
        <InlineError message={error} />
      </div>

      <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 mb-8 max-w-100">
        <button
          onClick={() => setActiveTab("drafts")}
          className={`w-full rounded-lg py-2 text-sm font-medium leading-5 ${
            activeTab === "drafts"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
          }`}
        >
          Drafts
          {groups.drafts.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {groups.drafts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("issued")}
          className={`w-full rounded-lg py-2 text-sm font-medium leading-5 ${
            activeTab === "issued"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
          }`}
        >
          Issued
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`w-full rounded-lg py-2 text-sm font-medium leading-5 ${
            activeTab === "history"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
          }`}
        >
          History
        </button>
      </div>

      <section className="space-y-4">
        {activeTab === "drafts" && groups.drafts.length === 0 && (
          <EmptyState
            icon={FileSignature}
            title="No draft prescriptions"
            description="You don't have any prescription drafts. Drafts are created during a consultation."
          />
        )}
        {activeTab === "drafts" &&
          groups.drafts.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-950">
                    {item.patientName}
                  </h2>
                  <PrescriptionStatusBadge
                    status={item.status}
                    expired={item.expired}
                    dispensingStatus={item.dispensingStatus}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {formatAppointmentTime(item.consultationScheduledStart)} ·{" "}
                  {item.items.length} medicine{item.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="shrink-0 mt-2 sm:mt-0">
                <Link
                  className={buttonVariants()}
                  href={`/doctor/prescriptions/${item.id}`}
                >
                  Continue Editing
                </Link>
              </div>
            </div>
          ))}

        {activeTab === "issued" && groups.issued.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No issued prescriptions"
            description="You haven't issued any active prescriptions recently."
          />
        )}
        {activeTab === "issued" &&
          groups.issued.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-teal-100 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-950">
                    {item.patientName}
                  </h2>
                  <PrescriptionStatusBadge
                    status={item.status}
                    expired={item.expired}
                    dispensingStatus={item.dispensingStatus}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Issued: {item.issuedAt ? formatAppointmentTime(item.issuedAt) : formatAppointmentTime(item.createdAt)} ·{" "}
                  {item.items.length} medicine{item.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="shrink-0 mt-2 sm:mt-0">
                <Link
                  className={buttonVariants("secondary")}
                  href={`/doctor/prescriptions/${item.id}`}
                >
                  View Prescription
                </Link>
              </div>
            </div>
          ))}

        {activeTab === "history" && groups.history.length === 0 && (
          <EmptyState
            icon={History}
            title="No prescription history"
            description="You don't have any past prescriptions (cancelled or dispensed) yet."
          />
        )}
        {activeTab === "history" &&
          groups.history.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-700">
                    {item.patientName}
                  </h2>
                  <PrescriptionStatusBadge
                    status={item.status}
                    expired={item.expired}
                    dispensingStatus={item.dispensingStatus}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {formatAppointmentTime(item.consultationScheduledStart)} ·{" "}
                  {item.items.length} medicine{item.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="shrink-0 mt-2 sm:mt-0">
                <Link
                  className={buttonVariants("secondary")}
                  href={`/doctor/prescriptions/${item.id}`}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <ProtectedRoute roles={["DOCTOR"]}>
      <Content />
    </ProtectedRoute>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
import type { DoctorPrescription } from "@/types/prescriptions";

function Content() {
  const { session } = useAuth();
  const [items, setItems] = useState<DoctorPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  if (loading) return <LoadingPanel label="Loading prescriptions..." />;
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading
        eyebrow="Digital prescriptions"
        title="Prescriptions"
        description="Review drafts, issued prescriptions, and dispensing status."
        backHref="/doctor/dashboard"
      />
      <div className="mt-7">
        <InlineError message={error} />
      </div>
      <section className="mt-8 space-y-4">
        {items.length === 0 ? (
          <p className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
            No prescriptions yet. Open a consultation to create one.
          </p>
        ) : (
          items.map((item) => (
            <Link
              className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-teal-300"
              href={`/doctor/prescriptions/${item.id}`}
              key={item.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {item.patientName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatAppointmentTime(item.consultationScheduledStart)} ·{" "}
                    {item.items.length} medicine
                    {item.items.length === 1 ? "" : "s"}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.dispensingStatus === "DISPENSED"
                      ? "Dispensed"
                      : "Not dispensed"}
                  </p>
                </div>
                <PrescriptionStatusBadge
                  status={item.status}
                  expired={item.expired}
                  dispensingStatus={item.dispensingStatus}
                />
              </div>
            </Link>
          ))
        )}
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

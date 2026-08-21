"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { InlineError, PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { PrescriptionStatusBadge } from "@/components/prescription-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { getPatientPrescriptions } from "@/lib/api";
import type { PatientPrescriptionSummary } from "@/types/prescriptions";

function Content() {
  const { session } = useAuth(); const [items, setItems] = useState<PatientPrescriptionSummary[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { if (!session) return; setLoading(true); setError(null); try { setItems((await getPatientPrescriptions(session.access_token, 0, 50)).content); } catch (e) { setError(e instanceof Error ? e.message : "Prescriptions could not be loaded."); } finally { setLoading(false); } }, [session]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  if (loading) return <LoadingPanel label="Loading your prescriptions..." />;
  return <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14"><PortalHeading eyebrow="Your care" title="Digital prescriptions" description="View prescriptions issued by your doctors and their current status." backHref="/patient/dashboard" />
    <div className="mt-7"><InlineError message={error} /></div><section className="mt-8 space-y-4">{items.length === 0 ? <p className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">You do not have any issued prescriptions yet.</p> : items.map((item) => <Link className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-teal-300" href={`/patient/prescriptions/${item.id}`} key={item.id}><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-slate-950">{item.doctorName}</h2><p className="mt-1 text-sm text-slate-600">Issued {formatAppointmentTime(item.issuedAt)} · {item.specializationName}</p><p className="mt-1 text-sm text-slate-500">{item.status === "CANCELLED" ? "Medicine details unavailable" : `${item.medicineCount} medicine${item.medicineCount === 1 ? "" : "s"}`} · {item.hospitalName}</p></div><PrescriptionStatusBadge status={item.status} expired={item.expired} /></div></Link>)}</section>
  </main>;
}
export default function Page() { return <ProtectedRoute roles={["PATIENT"]}><Content /></ProtectedRoute>; }

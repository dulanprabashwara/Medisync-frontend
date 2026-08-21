"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PrescriptionStatusBadge } from "@/components/prescription-ui";
import { createPrescriptionDraft, getConsultationPrescriptions } from "@/lib/api";
import type { ConsultationStatus } from "@/types/consultations";
import type { DoctorPrescription } from "@/types/prescriptions";

export function DoctorConsultationPrescriptions({ accessToken, consultationId, consultationStatus }: { accessToken: string; consultationId: string; consultationStatus: ConsultationStatus }) {
  const router = useRouter();
  const [items, setItems] = useState<DoctorPrescription[]>([]); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setItems(await getConsultationPrescriptions(accessToken, consultationId)); } catch (e) { setError(e instanceof Error ? e.message : "Prescriptions could not be loaded."); } }, [accessToken, consultationId]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  async function create() { setBusy(true); setError(null); try { const value = await createPrescriptionDraft(accessToken, consultationId); router.push(`/doctor/prescriptions/${value.id}`); } catch (e) { setError(e instanceof Error ? e.message : "A draft could not be created."); setBusy(false); } }
  return <section className="mt-8 rounded-3xl border border-teal-200 bg-teal-50 p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Digital prescriptions</p><h2 className="mt-2 text-2xl font-semibold text-teal-950">Prescription history</h2></div>{consultationStatus !== "CANCELLED" ? <button className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={busy} onClick={() => void create()}>{busy ? "Opening..." : items.some((x) => x.status === "DRAFT") ? "Continue draft" : "Create prescription"}</button> : null}</div>{error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}<div className="mt-5 space-y-3">{items.length === 0 ? <p className="text-sm text-teal-900">No prescriptions have been created for this consultation.</p> : items.map((item) => <Link className="flex items-center justify-between rounded-2xl bg-white p-4" href={`/doctor/prescriptions/${item.id}`} key={item.id}><span className="font-semibold text-slate-900">{item.items.length} medicine{item.items.length === 1 ? "" : "s"}</span><PrescriptionStatusBadge status={item.status} expired={item.expired} /></Link>)}</div></section>;
}

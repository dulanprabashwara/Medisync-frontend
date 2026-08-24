"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { QrCode, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading, formatAppointmentTime } from "@/components/portal-ui";

import { SectionCard, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getPharmacistProfessionalProfile, getPharmacistDispensations } from "@/lib/api";
import type { PharmacistProfessionalProfile } from "@/types/user";
import type { DispensationHistoryPage } from "@/types/pharmacy";
import { formatDoctorName } from "@/lib/formatters";

function PharmacistDashboardContent() {
  const { profile, session } = useAuth();
  const [professional, setProfessional] = useState<PharmacistProfessionalProfile | null>(null);
  const [historyPage, setHistoryPage] = useState<DispensationHistoryPage | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const prof = await getPharmacistProfessionalProfile(session.access_token);
      setProfessional(prof);

      if (prof.pharmacyAccessAllowed) {
        try {
          const history = await getPharmacistDispensations(session.access_token, 0, 5);
          setHistoryPage(history);
        } catch (e) {
          setHistoryError(e instanceof Error ? e.message : "Failed to load recent dispensing history.");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (loading) return <LoadingPanel label="Loading pharmacist dashboard..." />;

  const verified = professional?.pharmacyAccessAllowed === true;
  const pending = professional?.verificationStatus === "PENDING" || (professional?.submitted && !professional?.pharmacyAccessAllowed);
  const rejected = professional?.verificationStatus === "REJECTED";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PortalHeading
        eyebrow=""
        backHref=""
        title={`Welcome back, ${profile?.firstName ?? "Pharmacist"}`}
        description="Verify and dispense MediSync prescriptions securely."
        action={
          verified ? (
            <Link href="/pharmacist/scan" className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:pointer-events-none bg-teal-700 text-white hover:bg-teal-800 px-4 py-2.5 shrink-0">
              <QrCode className="size-5" />
              Scan Prescription
            </Link>
          ) : null
        }
      />

      {/* Verification Status Banner */}
      {!verified && (
        <section>
          {rejected ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                  <AlertCircle className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-rose-950">Verification requires attention</h3>
                  <p className="mt-1 text-sm text-rose-700 max-w-xl">
                    Review the rejection reason and update your professional information.
                  </p>
                </div>
              </div>
              <Link href="/pharmacist/profile" className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:pointer-events-none border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 px-4 py-2.5">
                Review Profile
              </Link>
            </div>
          ) : pending ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <RefreshCw className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-950">Professional verification pending</h3>
                  <p className="mt-1 text-sm text-amber-700 max-w-xl">
                    Your professional information is currently under review. Prescription verification and dispensing will become available after approval.
                  </p>
                </div>
              </div>
              <Link href="/pharmacist/profile" className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:pointer-events-none border border-amber-300 bg-white text-amber-800 hover:bg-amber-50 px-4 py-2.5">
                View Profile
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <FileText className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Professional profile required</h3>
                  <p className="mt-1 text-sm text-slate-600 max-w-xl">
                    Complete your pharmacy credentials and submit them for administrator review to enable dispensing.
                  </p>
                </div>
              </div>
              <Link href="/pharmacist/profile" className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:pointer-events-none bg-teal-700 text-white hover:bg-teal-800 px-4 py-2.5">
                Complete Profile
              </Link>
            </div>
          )}
        </section>
      )}

      {verified && (
        <>
          <div className="flex items-center gap-2 px-1">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Verified Pharmacist</span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total Dispensed"
              value={historyPage?.totalElements ?? 0}
              icon={FileText}
            />
          </div>

          <SectionCard title="Recent Dispensing">
            {historyError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
                <h3 className="font-semibold text-rose-900">Unable to load recent history</h3>
                <p className="mt-1 text-sm text-rose-700">{historyError}</p>
              </div>
            ) : !historyPage || historyPage.content.length === 0 ? (
              <EmptyState
                icon={QrCode}
                title="No prescriptions dispensed yet"
                description="Scan a patient's MediSync prescription QR to begin."
                action={
                  <Link href="/pharmacist/scan" className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:pointer-events-none bg-teal-700 text-white hover:bg-teal-800 px-4 py-2.5">
                    Scan Prescription
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {historyPage.content.map((record) => (
                  <div key={record.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="font-medium text-slate-900">{record.patientName}</h4>
                      <div className="mt-1 text-sm text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{formatDoctorName(record.doctorName)}</span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span>Dispensed {formatAppointmentTime(record.dispensedAt)}</span>
                      </div>
                    </div>
                    <Link href={`/pharmacist/dispensing-history?id=${record.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:pointer-events-none border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 px-4 py-2.5">
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}

export default function PharmacistDashboardPage() {
  return (
    <ProtectedRoute roles={["PHARMACIST"]}>
      <PharmacistDashboardContent />
    </ProtectedRoute>
  );
}


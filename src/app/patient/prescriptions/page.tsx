"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, AlertCircle, Ban } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { SectionCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPatientPrescriptions } from "@/lib/api";
import { formatDoctorName } from "@/lib/formatters";
import type { PatientPrescriptionSummary } from "@/types/prescriptions";

type FilterType = "ALL" | "ACTIVE" | "DISPENSED" | "CANCELLED";

export default function PatientPrescriptionsPage() {
  const { session } = useAuth();
  const [items, setItems] = useState<PatientPrescriptionSummary[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const page = await getPatientPrescriptions(session.access_token, 0, 50);
      setItems(page.content);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Prescriptions could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filteredItems = items.filter(item => {
    if (filter === "ALL") return true;
    if (filter === "CANCELLED") return item.status === "CANCELLED";
    if (filter === "DISPENSED") return item.dispensingStatus === "DISPENSED";
    if (filter === "ACTIVE") return item.status === "ISSUED" && item.dispensingStatus === "NOT_DISPENSED" && !item.expired;
    return true;
  });

  if (loading) {
    return (
      <ProtectedRoute roles={["PATIENT"]}>
        <LoadingPanel label="Loading your prescriptions..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["PATIENT"]}>
      <div>
        <PortalHeading 
          eyebrow="Patient Care" 
          title="Prescriptions" 
          description="View prescriptions issued through your online consultations." 
          backHref="/patient/dashboard" 
        />
        
        {error && <Alert tone="error" className="mb-6">{error}</Alert>}

        <div className="mb-8 border-b border-slate-200 overflow-x-auto hide-scrollbar">
          <nav className="-mb-px flex gap-6 min-w-max" aria-label="Tabs">
            {[
              { id: "ALL", label: "All" },
              { id: "ACTIVE", label: "Active" },
              { id: "DISPENSED", label: "Dispensed" },
              { id: "CANCELLED", label: "Cancelled" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as FilterType)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold transition-colors
                  ${filter === tab.id ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"}
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={filter === "ALL" ? "No prescriptions yet" : `No ${filter.toLowerCase()} prescriptions`}
            description={filter === "ALL" ? "Prescriptions issued during your consultations will appear here." : `You do not have any prescriptions matching this filter.`}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <SectionCard key={item.id} className="flex flex-col h-full hover:border-teal-300 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{formatDoctorName(item.doctorName)}</h2>
                    <p className="text-sm text-slate-600">{formatAppointmentTime(item.issuedAt)}</p>
                  </div>
                  <StatusBadge tone={
                    item.status === "CANCELLED" ? "error" :
                    item.dispensingStatus === "DISPENSED" ? "neutral" :
                    item.expired ? "warning" : "success"
                  }>
                    {item.status === "CANCELLED" ? "Cancelled" :
                     item.dispensingStatus === "DISPENSED" ? "Dispensed" :
                     item.expired ? "Expired" : "Issued"}
                  </StatusBadge>
                </div>

                <div className="flex-1 space-y-4 text-sm">
                  {item.status === "CANCELLED" ? (
                    <div className="flex items-center gap-2 text-rose-700 bg-rose-50 p-3 rounded-lg">
                      <Ban className="size-4 shrink-0" />
                      <span className="font-medium">Prescription Cancelled</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-slate-700 font-medium bg-slate-50 p-3 rounded-lg flex items-center justify-between">
                        <span>{item.medicineCount} medicine{item.medicineCount === 1 ? "" : "s"}</span>
                        <span className="text-slate-500 font-normal">Valid until {formatAppointmentTime(item.validUntil)}</span>
                      </div>
                      
                      {item.dispensingStatus === "DISPENSED" ? (
                        <div className="flex items-start gap-2 text-emerald-700">
                          <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Dispensed {formatAppointmentTime(item.dispensedAt!)}</p>
                            {item.dispensingPharmacy && <p className="text-xs mt-0.5 opacity-80">{item.dispensingPharmacy}</p>}
                          </div>
                        </div>
                      ) : !item.expired && item.doctorFeeStatus === "AWAITING_CONFIRMATION" ? (
                        <div className="flex items-center gap-2 text-amber-700">
                          <AlertCircle className="size-4 shrink-0" />
                          <span className="font-medium">QR pending payment</span>
                        </div>
                      ) : !item.expired ? (
                        <div className="flex items-center gap-2 text-teal-700">
                          <FileText className="size-4 shrink-0" />
                          <span className="font-medium">QR available</span>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/patient/prescriptions/${item.id}`}>
                      View Prescription
                    </Link>
                  </Button>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

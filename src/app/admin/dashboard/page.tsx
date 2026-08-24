"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading } from "@/components/portal-ui";
import { SectionCard, StatCard } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  getAdminAnalyticsSummary,
  getPendingDoctors,
  getPendingPharmacists,
  getAdminAuditEvents,
} from "@/lib/api";
import type {
  AnalyticsSummary,
  AdminDoctorReview,
  AdminPharmacistReview,
  AuditEvent,
} from "@/types/admin";
import type { AdminPharmacistReview as PharmacistReviewFromUser, AdminDoctorReview as DoctorReviewFromUser } from "@/types/user";

export default function AdminDashboardPage() {
  const { session, profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [pendingDoctors, setPendingDoctors] = useState<DoctorReviewFromUser[]>([]);
  const [pendingPharmacists, setPendingPharmacists] = useState<PharmacistReviewFromUser[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditEvent[]>([]);

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const [
        analyticsData,
        doctorsData,
        pharmacistsData,
        auditsData
      ] = await Promise.all([
        getAdminAnalyticsSummary(session.access_token),
        getPendingDoctors(session.access_token),
        getPendingPharmacists(session.access_token),
        getAdminAuditEvents(session.access_token, { size: 5 })
      ]);
      setAnalytics(analyticsData);
      setPendingDoctors(doctorsData);
      setPendingPharmacists(pharmacistsData);
      setRecentAudits(auditsData.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingPanel label="Loading administration dashboard..." />;
  }

  const totalPending = pendingDoctors.length + pendingPharmacists.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <PortalHeading
        eyebrow="OVERVIEW"
        title="Admin Dashboard"
        description="Monitor MediSync operations, verification activity, and account status."
      />

      {error ? (
        <Alert tone="error" title="Data Load Error">
          <p>{error}</p>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => void loadData()}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      {/* 5A.3 Needs Your Attention */}
      {(totalPending > 0) ? (
        <SectionCard title="Needs Your Attention" className="border-amber-200 bg-amber-50/30">
          <div className="grid gap-4 sm:grid-cols-2">
            {pendingDoctors.length > 0 && (
              <div className="p-4 rounded-xl border border-amber-200 bg-white shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{pendingDoctors.length} Doctor verification requests pending</p>
                  <p className="text-sm text-slate-600 mt-1">Doctors are waiting for professional registration review.</p>
                </div>
                <Link href="/admin/verification">
                  <Button variant="primary" className="bg-amber-600 hover:bg-amber-700 whitespace-nowrap">
                    Review Doctors
                  </Button>
                </Link>
              </div>
            )}
            
            {pendingPharmacists.length > 0 && (
              <div className="p-4 rounded-xl border border-amber-200 bg-white shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{pendingPharmacists.length} Pharmacist verification requests pending</p>
                  <p className="text-sm text-slate-600 mt-1">Pharmacists are waiting for professional registration review.</p>
                </div>
                <Link href="/admin/verification">
                  <Button variant="primary" className="bg-amber-600 hover:bg-amber-700 whitespace-nowrap">
                    Review Pharmacists
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </SectionCard>
      ) : (
        <Alert tone="success" title="All caught up!">
          <p>There are no pending verification requests or account alerts requiring immediate attention.</p>
        </Alert>
      )}

      {/* 5A.4 Summary Metrics */}
      {analytics && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value={Object.values(analytics.usersByRole || {}).reduce((a, b) => a + b, 0)}
          />
          <StatCard
            label="Patients"
            value={analytics.usersByRole?.['PATIENT'] || 0}
          />
          <StatCard
            label="Doctors"
            value={analytics.usersByRole?.['DOCTOR'] || 0}
          />
          <StatCard
            label="Pharmacists"
            value={analytics.usersByRole?.['PHARMACIST'] || 0}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 5A.5 Verification Summary */}
        <SectionCard title="Verification Summary">
          <dl className="grid gap-6 sm:grid-cols-2 mb-6">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Doctors</dt>
              <dd className="text-2xl font-bold text-slate-900">
                Pending: {pendingDoctors.length}
              </dd>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Pharmacists</dt>
              <dd className="text-2xl font-bold text-slate-900">
                Pending: {pendingPharmacists.length}
              </dd>
            </div>
          </dl>
          <Link href="/admin/verification">
            <Button variant="secondary">Review Verification Requests</Button>
          </Link>
        </SectionCard>

        {/* 5A.6 Recent Administrative Activity */}
        <SectionCard title="Recent Administrative Activity">
          {recentAudits.length > 0 ? (
            <div className="space-y-4 mb-6">
              {recentAudits.map(audit => (
                <div key={audit.id} className="flex gap-4 items-start text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">
                      {audit.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-slate-500">
                      Target: {audit.targetType} {audit.targetId} • {new Date(audit.occurredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 mb-6">No recent administrative activity recorded.</p>
          )}
          <Link href="/admin/audit">
            <Button variant="secondary">View All Audit Logs</Button>
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}

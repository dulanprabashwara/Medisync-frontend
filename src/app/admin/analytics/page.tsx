"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading } from "@/components/portal-ui";
import { SectionCard, StatCard } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import {
  getAdminAnalyticsActivity,
  getAdminAnalyticsSummary,
  getAdminAnalyticsTimeseries,
} from "@/lib/api";
import type {
  ActivityRanking,
  ActivityResponse,
  AnalyticsPoint,
  AnalyticsSummary,
} from "@/types/admin";

type Range = 7 | 30 | 90;

function AnalyticsContent() {
  const { session } = useAuth();
  const [range, setRange] = useState<Range>(30);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [points, setPoints] = useState<AnalyticsPoint[]>([]);
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        getAdminAnalyticsSummary(session.access_token),
        getAdminAnalyticsTimeseries(session.access_token, range),
        getAdminAnalyticsActivity(session.access_token, range),
      ]);

      const [summaryResult, pointsResult, activityResult] = results;

      if (summaryResult.status === "fulfilled") setSummary(summaryResult.value);
      else setSummary(null);

      if (pointsResult.status === "fulfilled") setPoints(pointsResult.value);
      else setPoints([]);

      if (activityResult.status === "fulfilled")
        setActivity(activityResult.value);
      else setActivity(null);

      if (results.every((r) => r.status === "rejected")) {
        setError(
          summaryResult.status === "rejected" &&
            summaryResult.reason instanceof Error
            ? summaryResult.reason.message
            : "Analytics could not be loaded.",
        );
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Analytics could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [range, session]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading
        eyebrow="Administration"
        title="Operational analytics"
        description="Database-aggregated platform usage and workflow activity. No clinical message content is included."
        backHref="/admin/dashboard"
      />
      <div className="mt-7 flex flex-wrap gap-2">
        {([7, 30, 90] as Range[]).map((days) => (
          <button
            key={days}
            onClick={() => setRange(days)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${range === days ? "bg-teal-700 text-white" : "border bg-white"}`}
          >
            {days} days
          </button>
        ))}
      </div>
      <div className="mt-6">
        {error ? <p className="text-rose-600 text-sm font-semibold bg-rose-50 p-3 rounded-lg border border-rose-200">{error}</p> : null}
      </div>
      {loading && !summary ? (
        <LoadingPanel label="Aggregating analytics…" />
      ) : summary ? (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Patients" value={summary.usersByRole.PATIENT ?? 0} />
            <StatCard label="Doctors" value={summary.usersByRole.DOCTOR ?? 0} />
            <StatCard
              label="Pharmacists"
              value={summary.usersByRole.PHARMACIST ?? 0}
            />
            <StatCard
              label="Active users"
              value={summary.usersByStatus.ACTIVE ?? 0}
            />
            <StatCard
              label="Banned users"
              value={summary.usersByStatus.BANNED ?? 0}
            />
            <StatCard
              label="Verified doctors"
              value={summary.professionalVerification.DOCTOR_VERIFIED ?? 0}
            />
            <StatCard
              label="Verified pharmacists"
              value={summary.professionalVerification.PHARMACIST_VERIFIED ?? 0}
            />
            <StatCard
              label="Pending verification"
              value={
                (summary.professionalVerification.DOCTOR_PENDING ?? 0) +
                (summary.professionalVerification.PHARMACIST_PENDING ?? 0)
              }
            />
            <StatCard
              label="Consultations requested"
              value={summary.appointmentsByStatus.REQUESTED ?? 0}
            />
            <StatCard
              label="Consultations completed"
              value={summary.consultationsByStatus.COMPLETED ?? 0}
            />
            <StatCard
              label="Prescriptions issued"
              value={summary.prescriptionsByStatus.ISSUED ?? 0}
            />
            <StatCard
              label="Prescriptions dispensed"
              value={summary.totalDispensations}
            />
            <StatCard label="Messages sent" value={summary.totalChatMessages} />
            <StatCard
              label="Private chat images"
              value={summary.totalChatImages}
            />
          </section>
          <SectionCard title="Daily platform activity" description="New users, consultations, prescriptions, dispensations, and messages over the selected UTC date range." className="mt-6">
            <TrendChart points={points} />
          </SectionCard>
          <section className="mt-6 grid gap-5 lg:grid-cols-3">
            <Breakdown title="Users by role" values={summary.usersByRole} />
            <Breakdown
              title="Consultations"
              values={summary.consultationsByStatus}
            />
            <Breakdown
              title="Doctor fee status"
              values={summary.doctorFeesByStatus}
            />
            <Breakdown
              title="Appointments"
              values={summary.appointmentsByStatus}
            />
            <Breakdown
              title="Prescriptions"
              values={summary.prescriptionsByStatus}
            />
            <Breakdown
              title="Professional verification"
              values={summary.professionalVerification}
            />
          </section>
          {activity ? (
            <section className="mt-6 grid gap-5 lg:grid-cols-3">
              <Ranking title="Busiest doctors" rows={activity.busiestDoctors} />
              <Ranking
                title="Most active patients"
                rows={activity.mostActivePatients}
              />
              <Ranking
                title="Busiest pharmacists"
                rows={activity.busiestPharmacists}
              />
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}


function Breakdown({
  title,
  values,
}: {
  title: string;
  values: Record<string, number>;
}) {
  const max = Math.max(...Object.values(values), 1);
  return (
    <SectionCard title={title}>
      <div className="space-y-3">
        {Object.entries(values).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between gap-3 text-sm">
              <span>{key.replaceAll("_", " ")}</span>
              <strong>{value}</strong>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-600"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {Object.keys(values).length === 0 ? (
          <p className="text-sm text-slate-500">No activity recorded.</p>
        ) : null}
      </div>
    </SectionCard>
  );
}

function TrendChart({ points }: { points: AnalyticsPoint[] }) {
  const series = [
    ["newUsers", "New users", "#0f766e"],
    ["consultations", "Consultations", "#2563eb"],
    ["prescriptions", "Prescriptions", "#f59e0b"],
    ["dispensations", "Dispensations", "#7c3aed"],
    ["chatMessages", "Messages", "#e11d48"],
  ] as const;
  const max = Math.max(
    ...points.flatMap((point) => series.map(([key]) => point[key])),
    1,
  );
  const width = 900;
  const height = 240;
  const inset = 22;
  const path = (key: (typeof series)[number][0]) =>
    points
      .map((point, index) => {
        const x =
          points.length <= 1
            ? inset
            : inset + index * ((width - inset * 2) / (points.length - 1));
        const y = height - inset - (point[key] / max) * (height - inset * 2);
        return `${x},${y}`;
      })
      .join(" ");
  return (
    <div className="mt-5 overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-162.5"
        role="img"
        aria-label="Daily users, consultations, prescriptions, dispensations, and messages line chart"
      >
        <line
          x1={inset}
          x2={width - inset}
          y1={height - inset}
          y2={height - inset}
          stroke="#cbd5e1"
        />
        {series.map(([key, label, color]) => (
          <polyline
            key={key}
            aria-label={label}
            points={path(key)}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-4 text-sm">
        {series.map(([key, label, color]) => (
          <span key={key} className="font-semibold" style={{ color }}>
            ● {label}
          </span>
        ))}
        <span className="ml-auto text-slate-500">
          {points[0]?.date} – {points.at(-1)?.date}
        </span>
      </div>
    </div>
  );
}

function Ranking({ title, rows }: { title: string; rows: ActivityRanking[] }) {
  return (
    <SectionCard title={title}>
      <ol className="space-y-3">
        {rows.map((row, index) => (
          <li
            key={row.userId}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-sm">
              <strong className="mr-2 text-slate-400">{index + 1}</strong>
              {row.displayName}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
              {row.activityCount}
            </span>
          </li>
        ))}
        {rows.length === 0 ? (
          <li className="text-sm text-slate-500">No activity recorded.</li>
        ) : null}
      </ol>
    </SectionCard>
  );
}
export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AdminNavigation } from "@/components/admin-navigation";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { InlineError, PortalHeading } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { getAdminAuditEvents, type AuditFilters } from "@/lib/api";
import type { AuditEvent } from "@/types/admin";

function AuditContent() {
  const { session } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [draft, setDraft] = useState<AuditFilters>({ page: 0, size: 50 });
  const [filters, setFilters] = useState<AuditFilters>({ page: 0, size: 50 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const page = await getAdminAuditEvents(session.access_token, filters);
      setEvents(page.content);
      setTotal(page.totalElements);
      setTotalPages(page.totalPages);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Audit events could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters, session]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  function search(event: FormEvent) {
    event.preventDefault();
    setFilters({
      ...draft,
      from: draft.from
        ? new Date(`${draft.from}T00:00:00`).toISOString()
        : undefined,
      to: draft.to
        ? new Date(`${draft.to}T23:59:59.999`).toISOString()
        : undefined,
      page: 0,
      size: 50,
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading
        eyebrow="Administration"
        title="Audit log"
        description="Append-only records for security-sensitive and clinical workflow mutations."
        backHref="/admin/dashboard"
      />
      <AdminNavigation />
      <form
        onSubmit={search}
        className="mt-7 grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4"
      >
        <input
          placeholder="Action, e.g. USER_BANNED"
          value={draft.action ?? ""}
          onChange={(event) =>
            setDraft({ ...draft, action: event.target.value || undefined })
          }
          className="rounded-xl border px-4 py-3"
        />
        <select
          aria-label="Actor role"
          value={draft.actorRole ?? ""}
          onChange={(event) =>
            setDraft({
              ...draft,
              actorRole: (event.target.value ||
                undefined) as AuditFilters["actorRole"],
            })
          }
          className="rounded-xl border px-4 py-3"
        >
          <option value="">All actor roles</option>
          <option>PATIENT</option>
          <option>DOCTOR</option>
          <option>PHARMACIST</option>
          <option>ADMIN</option>
        </select>
        <input
          placeholder="Actor user UUID"
          value={draft.actorUserId ?? ""}
          onChange={(event) =>
            setDraft({ ...draft, actorUserId: event.target.value || undefined })
          }
          className="rounded-xl border px-4 py-3"
        />
        <input
          placeholder="Target user UUID"
          value={draft.targetUserId ?? ""}
          onChange={(event) =>
            setDraft({
              ...draft,
              targetUserId: event.target.value || undefined,
            })
          }
          className="rounded-xl border px-4 py-3"
        />
        <input
          placeholder="Target type"
          value={draft.targetType ?? ""}
          onChange={(event) =>
            setDraft({ ...draft, targetType: event.target.value || undefined })
          }
          className="rounded-xl border px-4 py-3"
        />
        <label className="text-sm text-slate-600">
          From
          <input
            type="date"
            value={draft.from ?? ""}
            onChange={(event) =>
              setDraft({ ...draft, from: event.target.value || undefined })
            }
            className="mt-1 w-full rounded-xl border px-4 py-3 text-slate-950"
          />
        </label>
        <label className="text-sm text-slate-600">
          To
          <input
            type="date"
            value={draft.to ?? ""}
            onChange={(event) =>
              setDraft({ ...draft, to: event.target.value || undefined })
            }
            className="mt-1 w-full rounded-xl border px-4 py-3 text-slate-950"
          />
        </label>
        <button className="self-end rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white">
          Filter events
        </button>
      </form>
      <div className="mt-6">
        <InlineError message={error} />
      </div>
      {loading ? (
        <LoadingPanel label="Loading audit events…" />
      ) : (
        <section className="mt-5 space-y-3">
          <p className="text-sm text-slate-500">{total} matching events</p>
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-950">
                    {event.action}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {event.actorRole ?? "SYSTEM"} ·{" "}
                    {event.actorUserId ?? "No actor"}
                  </p>
                </div>
                <time className="text-sm text-slate-500">
                  {new Date(event.occurredAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-3 text-sm text-slate-700">
                Target: {event.targetType ?? "—"} {event.targetId ?? ""}
              </p>
              {Object.keys(event.metadata).length ? (
                <dl className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs"
                    >
                      <dt className="inline font-semibold">{key}: </dt>
                      <dd className="inline">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </article>
          ))}
          {events.length === 0 ? (
            <p className="rounded-2xl bg-white p-8 text-center text-slate-500">
              No audit events match these filters.
            </p>
          ) : null}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
            <button
              className="rounded-lg border px-4 py-2 disabled:opacity-40"
              disabled={(filters.page ?? 0) === 0}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: Math.max(0, (current.page ?? 0) - 1),
                }))
              }
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {(filters.page ?? 0) + 1} of {Math.max(totalPages, 1)}
            </span>
            <button
              className="rounded-lg border px-4 py-2 disabled:opacity-40"
              disabled={(filters.page ?? 0) + 1 >= totalPages}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: (current.page ?? 0) + 1,
                }))
              }
            >
              Next
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
export default function AdminAuditPage() {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <AuditContent />
    </ProtectedRoute>
  );
}

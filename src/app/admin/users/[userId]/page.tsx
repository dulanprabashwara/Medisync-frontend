"use client";
/* eslint-disable @next/next/no-img-element -- private signed URLs are short-lived and cannot use a stable Next image host. */

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { InlineError, PortalHeading } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import {
  banAdminUser,
  getAdminUser,
  unbanAdminUser,
  deleteAdminUser,
} from "@/lib/api";
import type { AdminUserDetail } from "@/types/admin";

function UserDetailContent() {
  const { userId } = useParams<{ userId: string }>();
  const { session } = useAuth();
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setError(null);
    try {
      setDetail(await getAdminUser(session.access_token, userId));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "User details could not be loaded.",
      );
    }
  }, [session, userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function ban() {
    if (
      !session ||
      reason.trim().length < 3 ||
      !window.confirm("Restrict this account immediately?")
    )
      return;
    setBusy(true);
    setError(null);
    try {
      setDetail(
        await banAdminUser(session.access_token, userId, reason.trim()),
      );
      setReason("");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "The account could not be restricted.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function unban() {
    if (
      !session ||
      !window.confirm("Restore this account to its pre-ban status?")
    )
      return;
    setBusy(true);
    setError(null);
    try {
      setDetail(await unbanAdminUser(session.access_token, userId));
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "The account could not be restored.",
      );
    } finally {
      setBusy(false);
    }
  }

  const [deleteReason, setDeleteReason] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function deleteAccount() {
    if (
      !session ||
      deleteReason.trim().length < 3 ||
      !window.confirm(
        "Permanently delete this account? This will anonymize their profile but retain healthcare workflows.",
      )
    )
      return;
    setDeleteBusy(true);
    setError(null);
    try {
      setDetail(
        await deleteAdminUser(
          session.access_token,
          userId,
          deleteReason.trim(),
        ),
      );
      setDeleteReason("");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "The account could not be deleted.",
      );
    } finally {
      setDeleteBusy(false);
    }
  }

  if (!detail && !error) return <LoadingPanel label="Loading user details…" />;
  const user = detail?.user;
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading
        eyebrow="Administration"
        title={user ? `${user.firstName} ${user.lastName}` : "User details"}
        description="Operational profile, activity counts, and account restriction history."
        backHref="/admin/users"
      />
      <div className="mt-6">
        <InlineError message={error} />
      </div>
      {detail && user ? (
        <>
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-teal-100 text-xl font-bold text-teal-900">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.firstName.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user.email}</h2>
                  <p className="mt-1 text-slate-500">
                    {user.role} · {user.status}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Created {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
            <dl className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(detail.roleProfile).map(([key, value]) => (
                <Data key={key} label={label(key)} value={String(value)} />
              ))}
              <Data
                label="Last recorded activity"
                value={new Date(user.lastRecordedActivityAt).toLocaleString()}
              />
            </dl>
          </section>
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Operational counts</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {Object.entries(detail.operationalCounts).map(([key, value]) => (
                <div key={key} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{label(key)}</p>
                  <p className="mt-1 text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {user.role !== "ADMIN" ? (
            <section
              className={`mt-6 rounded-3xl border p-6 ${user.status === "BANNED" ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
            >
              <h2 className="text-xl font-semibold">Account access</h2>
              {user.status === "BANNED" ? (
                <>
                  <p className="mt-2 text-sm">
                    This account is restricted from every normal business
                    endpoint.
                  </p>
                  <button
                    disabled={busy}
                    onClick={() => void unban()}
                    className="mt-4 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy ? "Restoring…" : "Unban account"}
                  </button>
                </>
              ) : (
                <>
                  <label className="mt-4 block text-sm font-semibold">
                    Restriction reason
                    <textarea
                      value={reason}
                      maxLength={1000}
                      onChange={(event) => setReason(event.target.value)}
                      className="mt-2 min-h-24 w-full rounded-xl border border-rose-200 bg-white px-4 py-3"
                    />
                  </label>
                  <button
                    disabled={busy || reason.trim().length < 3}
                    onClick={() => void ban()}
                    className="mt-4 rounded-xl bg-rose-800 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy ? "Restricting…" : "Ban account"}
                  </button>
                </>
              )}
            </section>
          ) : null}
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Ban history</h2>
            {detail.banHistory.length ? (
              <div className="mt-4 space-y-3">
                {detail.banHistory.map((ban) => (
                  <article key={ban.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold">
                      {ban.unbannedAt
                        ? "Restriction ended"
                        : "Active restriction"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                      {ban.reason}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Banned {new Date(ban.bannedAt).toLocaleString()} ·
                      previous status {ban.previousStatus}
                      {ban.unbannedAt
                        ? ` · restored ${new Date(ban.unbannedAt).toLocaleString()}`
                        : ""}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-slate-500">No ban history.</p>
            )}
          </section>
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Recent safe activity</h2>
            <p className="mt-1 text-sm text-slate-500">
              Operational event names only; no clinical, message, receipt, or
              medicine content.
            </p>
            {detail.recentActivity.length ? (
              <div className="mt-4 divide-y divide-slate-100">
                {detail.recentActivity.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <span className="font-medium">
                      {event.action.replaceAll("_", " ")}
                    </span>
                    <time className="text-sm text-slate-500">
                      {new Date(event.occurredAt).toLocaleString()}
                    </time>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-slate-500">
                No safe activity has been recorded yet.
              </p>
            )}
          </section>

          {user.role !== "ADMIN" && user.status !== "DELETED" ? (
            <section className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
                Danger Zone
              </p>
              <h2 className="mt-2 text-xl font-semibold text-rose-950">
                Delete Account
              </h2>
              <p className="mt-1 text-sm text-rose-900">
                Permanently delete and anonymize this account. Healthcare
                history is retained. This cannot be undone.
              </p>
              <label className="mt-4 block text-sm font-semibold text-rose-950">
                Deletion reason
                <textarea
                  value={deleteReason}
                  maxLength={1000}
                  onChange={(event) => setDeleteReason(event.target.value)}
                  className="mt-2 min-h-24 w-full rounded-xl border border-rose-200 bg-white px-4 py-3"
                />
              </label>
              <button
                disabled={deleteBusy || deleteReason.trim().length < 3}
                onClick={() => void deleteAccount()}
                className="mt-4 rounded-xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-rose-800"
              >
                {deleteBusy ? "Deleting…" : "Delete account"}
              </button>
            </section>
          ) : null}

          {detail.deletionMetadata ? (
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Deletion Information</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Data
                  label="Deleted at"
                  value={new Date(
                    detail.deletionMetadata.deletedAt as string,
                  ).toLocaleString()}
                />
                <Data
                  label="Deleted by"
                  value={String(detail.deletionMetadata.deletedByUserId)}
                />
                <Data
                  label="Source"
                  value={String(detail.deletionMetadata.deletionSource)}
                />
              </dl>
              <div className="mt-4">
                <dt className="text-sm text-slate-500">Reason</dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {String(detail.deletionMetadata.deletionReason)}
                </dd>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}

function Data({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
function label(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (text) => text.toUpperCase());
}
export default function AdminUserDetailPage() {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <UserDetailContent />
    </ProtectedRoute>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element -- private signed URLs are short-lived and cannot use a stable Next image host. */

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AdminNavigation } from "@/components/admin-navigation";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { InlineError, PortalHeading } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import {
  getAdminDepartments,
  getAdminDoctors,
  getAdminHospitals,
  getAdminSpecializations,
  getAdminUsers,
  type AdminUserFilters,
} from "@/lib/api";
import type { AdminUserSummary } from "@/types/admin";
import type {
  AccountStatus,
  AdminDepartment,
  AdminHospital,
  AdminSpecialization,
  UserRole,
  VerificationStatus,
} from "@/types/user";

function UsersContent() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [filters, setFilters] = useState<AdminUserFilters>({ page: 0, size: 20 });
  const [query, setQuery] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [hospitals, setHospitals] = useState<AdminHospital[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [specializations, setSpecializations] = useState<AdminSpecialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const page = filters.role === "DOCTOR"
        ? await getAdminDoctors(session.access_token, filters)
        : await getAdminUsers(session.access_token, filters);
      setUsers(page.content);
      setTotal(page.totalElements);
      setTotalPages(page.totalPages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Users could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters, session]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("role") !== "DOCTOR") return;
    const timer = window.setTimeout(() => setFilters((current) => ({
        ...current,
        role: "DOCTOR",
        hospitalId: params.get("hospitalId") || undefined,
        departmentId: params.get("departmentId") || undefined,
        specializationId: params.get("specializationId") || undefined,
        page: 0,
      })), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    void Promise.all([
      getAdminHospitals(session.access_token),
      getAdminDepartments(session.access_token),
      getAdminSpecializations(session.access_token),
    ]).then(([nextHospitals, nextDepartments, nextSpecializations]) => {
      if (!active) return;
      setHospitals(nextHospitals);
      setDepartments(nextDepartments);
      setSpecializations(nextSpecializations);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [session]);

  function search(event: FormEvent) {
    event.preventDefault();
    setFilters((current) => ({ ...current, q: query.trim() || undefined, page: 0 }));
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading eyebrow="Administration" title="User management"
        description="Search accounts, review operational status, and manage auditable account restrictions."
        backHref="/admin/dashboard" />
      <AdminNavigation />
      <form onSubmit={search} className="mt-7 grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-5">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or email"
          className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2" />
        <FilterSelect value={filters.role ?? ""} label="All roles" values={["PATIENT", "DOCTOR", "PHARMACIST", "ADMIN"]}
          onChange={(value) => setFilters((current) => ({ ...current, role: (value || undefined) as UserRole | undefined, verificationStatus: value === "DOCTOR" || value === "PHARMACIST" ? current.verificationStatus : undefined, hospitalId: value === "DOCTOR" ? current.hospitalId : undefined, departmentId: value === "DOCTOR" ? current.departmentId : undefined, specializationId: value === "DOCTOR" ? current.specializationId : undefined, page: 0 }))} />
        <FilterSelect value={filters.status ?? ""} label="All account statuses" values={["ACTIVE", "PENDING_VERIFICATION", "SUSPENDED", "DISABLED", "BANNED"]}
          onChange={(value) => setFilters((current) => ({ ...current, status: (value || undefined) as AccountStatus | undefined, page: 0 }))} />
        <button className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white">Search</button>
        {filters.role === "DOCTOR" || filters.role === "PHARMACIST" ? <FilterSelect value={filters.verificationStatus ?? ""} label="All professional verification" values={["PENDING", "VERIFIED", "REJECTED"]}
          onChange={(value) => setFilters((current) => ({ ...current, verificationStatus: (value || undefined) as VerificationStatus | undefined, page: 0 }))} /> : null}
        {filters.role === "DOCTOR" ? <>
          <NamedFilter value={filters.hospitalId ?? ""} label="All hospitals" values={hospitals.map((item) => [item.id, item.name])}
            onChange={(value) => setFilters((current) => ({ ...current, hospitalId: value || undefined, departmentId: undefined, page: 0 }))} />
          <NamedFilter value={filters.departmentId ?? ""} label="All departments"
            values={departments.filter((item) => !filters.hospitalId || item.hospitalId === filters.hospitalId).map((item) => [item.id, `${item.name} · ${item.hospitalName}`])}
            onChange={(value) => setFilters((current) => ({ ...current, departmentId: value || undefined, page: 0 }))} />
          <NamedFilter value={filters.specializationId ?? ""} label="All specializations" values={specializations.map((item) => [item.id, item.name])}
            onChange={(value) => setFilters((current) => ({ ...current, specializationId: value || undefined, page: 0 }))} />
        </> : null}
      </form>
      <div className="mt-6"><InlineError message={error} /></div>
      {loading ? <LoadingPanel label="Loading users…" /> : (
        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 text-sm text-slate-600">{total} account{total === 1 ? "" : "s"}</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Verification</th><th className="p-4">Professional profile</th><th className="p-4">Created</th><th className="p-4">Last activity</th><th className="p-4"></th></tr></thead>
              <tbody>{users.map((user) => <tr key={user.id} className="border-t border-slate-100">
                <td className="p-4"><div className="flex items-center gap-3"><Avatar user={user} /><div><p className="font-semibold text-slate-950">{user.firstName} {user.lastName}</p><p className="text-slate-500">{user.email}</p></div></div></td>
                <td className="p-4">{user.role}</td><td className="p-4"><Status value={user.status} /></td>
                <td className="p-4">{user.verificationStatus ?? "—"}</td><td className="p-4"><Professional user={user} /></td>
                <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td><td className="p-4">{new Date(user.lastRecordedActivityAt).toLocaleString()}</td>
                <td className="p-4"><Link className="font-semibold text-teal-700" href={`/admin/users/${user.id}`}>View details</Link></td>
              </tr>)}</tbody>
            </table>
          </div>
          {users.length === 0 ? <p className="p-8 text-center text-slate-500">No users match these filters.</p> : null}
          <div className="flex items-center justify-between border-t border-slate-200 p-4">
            <button className="rounded-lg border px-4 py-2 disabled:opacity-40" disabled={(filters.page ?? 0) === 0} onClick={() => setFilters((current) => ({ ...current, page: Math.max(0, (current.page ?? 0) - 1) }))}>Previous</button>
            <span className="text-sm text-slate-500">Page {(filters.page ?? 0) + 1} of {Math.max(totalPages, 1)}</span>
            <button className="rounded-lg border px-4 py-2 disabled:opacity-40" disabled={(filters.page ?? 0) + 1 >= totalPages} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 0) + 1 }))}>Next</button>
          </div>
        </section>
      )}
    </main>
  );
}

function FilterSelect({ value, label, values, onChange }: { value: string; label: string; values: string[]; onChange: (value: string) => void }) {
  return <select className="rounded-xl border border-slate-300 px-4 py-3" value={value} onChange={(event) => onChange(event.target.value)}><option value="">{label}</option>{values.map((item) => <option key={item}>{item}</option>)}</select>;
}

function NamedFilter({ value, label, values, onChange }: { value: string; label: string; values: [string, string][]; onChange: (value: string) => void }) {
  return <select className="rounded-xl border border-slate-300 px-4 py-3" value={value} onChange={(event) => onChange(event.target.value)}><option value="">{label}</option>{values.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>;
}

function Professional({ user }: { user: AdminUserSummary }) {
  if (user.role === "DOCTOR") return <span>{[user.hospitalName, user.departmentName, user.specializationName].filter(Boolean).join(" · ") || "—"}</span>;
  if (user.role === "PHARMACIST") return <span>{user.pharmacyName || "—"}</span>;
  return <span>—</span>;
}

function Avatar({ user }: { user: AdminUserSummary }) {
  return <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-teal-100 font-bold text-teal-900">{user.profileImageUrl ? <img src={user.profileImageUrl} alt="" className="h-full w-full object-cover" /> : user.firstName.charAt(0)}</div>;
}

function Status({ value }: { value: AccountStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${value === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : value === "BANNED" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-900"}`}>{value}</span>;
}

export default function AdminUsersPage() { return <ProtectedRoute roles={["ADMIN"]}><UsersContent /></ProtectedRoute>; }

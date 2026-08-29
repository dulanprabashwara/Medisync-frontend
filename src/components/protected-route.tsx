"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { LoadingPanel } from "./loading-panel";
import { StatusPanel } from "./status-panel";
import {
  dashboardPath,
  professionalProfilePath,
  requiresProfessionalVerification,
  type UserRole,
} from "@/types/user";

export function ProtectedRoute({
  roles,
  children,
}: {
  roles: UserRole[];
  children: ReactNode;
}) {
  const { session, profile, loading, error, refreshProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || error) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (!profile) {
      router.replace("/onboarding");
    } else if (profile.status === "DELETED") {
      router.replace("/account-deleted");
    } else if (profile.status === "BANNED") {
      router.replace("/account-restricted");
    } else if (
      requiresProfessionalVerification(profile) &&
      pathname !== professionalProfilePath(profile.role)
    ) {
      router.replace(professionalProfilePath(profile.role)!);
    } else if (!roles.includes(profile.role)) {
      router.replace(dashboardPath(profile.role));
    }
  }, [error, loading, pathname, profile, roles, router, session]);

  if (loading) return <LoadingPanel label="Checking your secure session…" />;
  if (error) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-950">
            We could not open your portal
          </h1>
          <p className="mt-3 text-slate-600">{error}</p>
          <button
            className="mt-6 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white"
            onClick={() => void refreshProfile()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }
  if (
    !session ||
    !profile ||
    profile.status === "DELETED" ||
    profile.status === "BANNED" ||
    (requiresProfessionalVerification(profile) &&
      pathname !== professionalProfilePath(profile.role)) ||
    !roles.includes(profile.role)
  ) {
    return <LoadingPanel label="Taking you to the right place…" />;
  }
  if (profile.status === "SUSPENDED" || profile.status === "DISABLED") {
    return (
      <StatusPanel
        title="Account access unavailable"
        message="This MediSync account is not currently active. Contact an administrator if you believe this is an error."
      />
    );
  }
  return children;
}

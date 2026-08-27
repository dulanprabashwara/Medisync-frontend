"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyAccountStatus } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import type { AccountStatusDetails } from "@/types/user";

export default function AccountRestrictedPage() {
  const { session, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [details, setDetails] = useState<AccountStatusDetails | null>(null);

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
    if (profile && profile.status !== "BANNED")
      router.replace(`/${profile.role.toLowerCase()}/dashboard`);
  }, [loading, profile, router, session]);

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    void getMyAccountStatus(session.access_token)
      .then(setDetails)
      .catch(() =>
        setDetails({
          status: "BANNED",
          restrictionReason: null,
          restrictedAt: null,
        }),
      );
    return () => controller.abort();
  }, [session]);

  if (loading) return <LoadingPanel label="Checking account status…" />;
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">
          Account restricted
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Your MediSync access has been restricted
        </h1>
        <p className="mt-4 text-slate-600">
          You cannot use patient, doctor, pharmacist, or administration features
          while this restriction is active.
        </p>
        <div className="mt-6 rounded-2xl bg-rose-50 p-5 text-rose-950">
          <p className="text-sm font-semibold">Administrator reason</p>
          <p className="mt-2">
            {details?.restrictionReason || "No additional reason is available."}
          </p>
          {details?.restrictedAt ? (
            <p className="mt-2 text-sm text-rose-700">
              Restricted {new Date(details.restrictedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Contact a MediSync administrator if you believe this was a mistake.
        </p>
        <button
          type="button"
          onClick={() => void signOut("/")}
          className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Sign out
        </button>
      </section>
    </main>
  );
}

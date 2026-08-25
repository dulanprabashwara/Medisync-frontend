"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./auth-provider";
import { dashboardPath } from "@/types/user";
import { MediSyncBrand } from "@/components/branding/medisync-brand";

export function SiteHeader() {
  const { session, profile, signOut } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    await signOut();
    router.replace("/login");
    router.refresh();
    setBusy(false);
  }

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <MediSyncBrand />
        <nav className="flex items-center gap-2" aria-label="Main navigation">
          {session && profile ? (
            <>
              <Link
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                href={dashboardPath(profile.role)}
              >
                Dashboard
              </Link>
              <button
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                disabled={busy}
                onClick={handleLogout}
              >
                {busy ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                href="/register"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

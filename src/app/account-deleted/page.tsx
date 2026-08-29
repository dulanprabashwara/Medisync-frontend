"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";

export default function AccountDeletedPage() {
  const { session, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  async function leaveDeletedAccount() {
    setBusy(true);
    try {
      await signOut("/register");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Account Deleted"
      title="We're sorry to see you go"
      description="Your MediSync account has been permanently deleted. Any active healthcare records remain securely archived as required by law."
      footer={{
        text: "Ready to return?",
        label: "Create a new account",
        href: "/register",
      }}
    >
      <div className="mt-6 flex items-center justify-center">
        {session ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void leaveDeletedAccount()}
            className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {busy ? "Signing out…" : "Sign out and create a new account"}
          </button>
        ) : (
          <Link
            href="/login"
            className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Return to login
          </Link>
        )}
      </div>
    </AuthCard>
  );
}

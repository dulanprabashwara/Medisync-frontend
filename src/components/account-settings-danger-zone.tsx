"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { FormAlert } from "./auth-card";

export function AccountSettingsDangerZone() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!session) return;
    if (
      !window.confirm(
        "Are you absolutely sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/users/me`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!response.ok) {
        let msg = "Failed to delete account.";
        try {
          const body = await response.json();
          msg = body.message || msg;
        } catch {}
        throw new Error(msg);
      }

      await signOut();
      router.push("/account-deleted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Account deletion failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
          Danger Zone
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Delete Account
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Permanently delete your account and personal information. Your
          healthcare history (such as past appointments) will remain securely
          archived for medical record compliance.
        </p>
      </div>
      {error && (
        <div className="mb-4">
          <FormAlert message={error} />
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={handleDelete}
        className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
      >
        {busy ? "Deleting..." : "Delete my account"}
      </button>
    </section>
  );
}

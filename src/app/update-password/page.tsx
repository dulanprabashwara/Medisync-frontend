"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  AuthCard,
  FormAlert,
  inputClassName,
  primaryButtonClassName,
} from "@/components/auth-card";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (password.length < 8)
      return setMessage("Use a password with at least 8 characters.");
    if (password !== confirmPassword)
      return setMessage("The passwords do not match.");
    setBusy(true);
    try {
      const { error } = await getSupabaseBrowserClient().auth.updateUser({
        password,
      });
      if (error) throw error;
      router.replace("/login");
    } catch (updateError) {
      setMessage(
        updateError instanceof Error
          ? updateError.message
          : "Your password could not be updated.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Use at least 8 characters and keep your password private."
    >
      {message ? <FormAlert message={message} /> : null}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            New password
          </label>
          <input
            id="password"
            className={inputClassName}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            aria-invalid={message ? "true" : undefined}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            className={inputClassName}
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            aria-invalid={message ? "true" : undefined}
          />
        </div>
        <button
          className={primaryButtonClassName}
          disabled={busy}
          type="submit"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthCard>
  );
}

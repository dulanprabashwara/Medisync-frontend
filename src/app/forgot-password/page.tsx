"use client";

import { useState, type FormEvent } from "react";
import {
  AuthCard,
  FormAlert,
  inputClassName,
  primaryButtonClassName,
} from "@/components/auth-card";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const { error } =
        await getSupabaseBrowserClient().auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
          },
        );
      if (error) throw error;
      setIsError(false);
      setMessage(
        "If an account exists for that address, Supabase will send password reset instructions.",
      );
    } catch (resetError) {
      setIsError(true);
      setMessage(
        resetError instanceof Error
          ? resetError.message
          : "The reset request failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Reset your password"
      description="We will send a secure recovery link to your email address."
      footer={{
        text: "Remembered it?",
        label: "Return to sign in",
        href: "/login",
      }}
    >
      {message ? <FormAlert message={message} success={!isError} /> : null}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            className={inputClassName}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            aria-invalid={isError ? "true" : undefined}
          />
        </div>
        <button
          className={primaryButtonClassName}
          disabled={busy}
          type="submit"
        >
          {busy ? "Sending link…" : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
}

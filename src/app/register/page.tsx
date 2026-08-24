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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!email.trim()) return setErrorMessage("Enter a valid email address.");
    if (password.length < 8)
      return setErrorMessage("Use a password with at least 8 characters.");
    if (password !== confirmPassword)
      return setErrorMessage("The passwords do not match.");

    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });
      if (error) throw error;
      if (data.session) {
        router.replace("/onboarding");
        router.refresh();
      } else {
        setSuccessMessage(
          "Check your email to confirm your account, then sign in to complete your MediSync profile.",
        );
      }
    } catch (registrationError) {
      setErrorMessage(
        registrationError instanceof Error
          ? registrationError.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Create an account"
      title="Start with a secure identity"
      description="Registration creates your Supabase Auth account. You will choose a MediSync role after signing in."
      footer={{ text: "Already registered?", label: "Sign in", href: "/login" }}
    >
      {errorMessage ? <FormAlert message={errorMessage} /> : null}
      {successMessage ? <FormAlert message={successMessage} success /> : null}
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
            aria-invalid={errorMessage ? "true" : undefined}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            className={inputClassName}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            aria-invalid={errorMessage ? "true" : undefined}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            className={inputClassName}
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            aria-invalid={errorMessage ? "true" : undefined}
          />
        </div>
        <button
          className={primaryButtonClassName}
          disabled={busy || Boolean(successMessage)}
          type="submit"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  AuthCard,
  FormAlert,
  inputClassName,
  primaryButtonClassName,
} from "@/components/auth-card";
import { ApiError, getMyProfile } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAuth } from "@/components/auth-provider";
import { dashboardPath } from "@/types/user";

export default function LoginPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (!email.trim() || !password) {
      setMessage("Enter your email address and password.");
      return;
    }

    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (!data.session)
        throw new Error("A session could not be created. Please try again.");

      try {
        const profile = await refreshProfile();
        if (profile) {
          router.replace(dashboardPath(profile.role));
        } else {
          router.replace("/onboarding");
        }
      } catch (profileError) {
        throw profileError;
      }
    } catch (loginError) {
      setMessage(
        loginError instanceof Error
          ? loginError.message
          : "Sign in failed. Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Secure sign in"
      title="Welcome back"
      description="Sign in to continue to your MediSync portal."
      footer={{
        text: "New to MediSync?",
        label: "Create an account",
        href: "/register",
      }}
    >
      {message ? <FormAlert message={message} /> : null}
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
            placeholder="you@example.com"
            required
            aria-invalid={message ? "true" : undefined}
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
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            aria-invalid={message ? "true" : undefined}
          />
        </div>
        <div className="text-right">
          <Link
            className="text-sm font-semibold text-teal-700 hover:text-teal-800"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <button
          className={primaryButtonClassName}
          disabled={busy}
          type="submit"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}

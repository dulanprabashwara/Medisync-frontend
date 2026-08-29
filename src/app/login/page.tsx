"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  AuthCard,
  FormAlert,
  inputClassName,
  primaryButtonClassName,
} from "@/components/auth-card";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAuth } from "@/components/auth-provider";
import { portalEntryPath } from "@/types/user";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { session, profile, loading, refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session && profile) {
      router.replace(portalEntryPath(profile));
    }
  }, [loading, profile, router, session]);

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

      const userProfile = await refreshProfile();
      if (userProfile) {
        router.replace(portalEntryPath(userProfile));
      } else {
        router.replace("/onboarding");
      }
    } catch (loginError) {
      setMessage(
        loginError instanceof Error
          ? loginError.message
          : "Sign in failed. Check your details and try again.",
      );
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
          <div className="relative">
            <input
              id="password"
              className={`${inputClassName} pr-12`}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              aria-invalid={message ? "true" : undefined}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
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

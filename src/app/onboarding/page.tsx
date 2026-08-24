"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  FormAlert,
  inputClassName,
  primaryButtonClassName,
} from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { ApiError, completeOnboarding } from "@/lib/api";
import { dashboardPath, type OnboardingInput } from "@/types/user";

const roleOptions: Array<{
  value: OnboardingInput["role"];
  label: string;
  description: string;
}> = [
  {
    value: "PATIENT",
    label: "Patient",
    description: "Access your personal care portal.",
  },
  {
    value: "DOCTOR",
    label: "Doctor",
    description: "Professional access begins after verification.",
  },
  {
    value: "PHARMACIST",
    label: "Pharmacist",
    description: "Pharmacy access begins after verification.",
  },
];

export default function OnboardingPage() {
  const {
    session,
    profile,
    loading,
    error: authError,
    refreshProfile,
  } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<OnboardingInput>({
    firstName: "",
    lastName: "",
    phone: "",
    role: "PATIENT",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loading || authError) return;
    if (!session) router.replace("/login");
    else if (profile) router.replace(dashboardPath(profile.role));
  }, [authError, loading, profile, router, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFieldErrors({});
    if (!session) return router.replace("/login");
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setMessage("Enter your first and last name.");
      return;
    }

    setBusy(true);
    try {
      const created = await completeOnboarding(session.access_token, {
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
      });
      await refreshProfile();
      router.replace(dashboardPath(created.role));
      router.refresh();
    } catch (onboardingError) {
      if (onboardingError instanceof ApiError) {
        setFieldErrors(onboardingError.fieldErrors);
        setMessage(onboardingError.message);
        if (onboardingError.status === 401) {
          setMessage("Your session expired. Sign in again to continue.");
        }
      } else {
        setMessage(
          onboardingError instanceof Error
            ? onboardingError.message
            : "Onboarding could not be completed.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingPanel label="Preparing your profile…" />;
  if (!session || profile)
    return <LoadingPanel label="Taking you to the right place…" />;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
          One last step
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Create your MediSync profile
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          Your role is stored and enforced by the MediSync API. Doctor and
          pharmacist accounts require later verification.
        </p>
        <form className="mt-9 space-y-7" onSubmit={handleSubmit} noValidate>
          {authError ? <FormAlert message={authError} /> : null}
          {message ? <FormAlert message={message} /> : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              First name
              <input
                className={inputClassName}
                value={form.firstName}
                onChange={(event) =>
                  setForm({ ...form, firstName: event.target.value })
                }
                autoComplete="given-name"
                maxLength={100}
                required
              />
              {fieldErrors.firstName ? (
                <span className="mt-1 block text-xs text-rose-700">
                  {fieldErrors.firstName}
                </span>
              ) : null}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Last name
              <input
                className={inputClassName}
                value={form.lastName}
                onChange={(event) =>
                  setForm({ ...form, lastName: event.target.value })
                }
                autoComplete="family-name"
                maxLength={100}
                required
              />
              {fieldErrors.lastName ? (
                <span className="mt-1 block text-xs text-rose-700">
                  {fieldErrors.lastName}
                </span>
              ) : null}
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Phone number{" "}
            <span className="font-normal text-slate-400">(optional)</span>
            <input
              className={inputClassName}
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              autoComplete="tel"
              maxLength={30}
              placeholder="0712345678"
            />
            {fieldErrors.phone ? (
              <span className="mt-1 block text-xs text-rose-700">
                {fieldErrors.phone}
              </span>
            ) : null}
          </label>
          <fieldset>
            <legend className="text-sm font-semibold text-slate-800">
              Account type
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {roleOptions.map((option) => (
                <label
                  className={`cursor-pointer rounded-2xl border p-4 ${form.role === option.value ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/10" : "border-slate-200 hover:border-slate-300"}`}
                  key={option.value}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={form.role === option.value}
                    onChange={() => setForm({ ...form, role: option.value })}
                  />
                  <span className="block font-semibold text-slate-900">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <button
            className={primaryButtonClassName}
            disabled={busy}
            type="submit"
          >
            {busy ? "Creating profile…" : "Complete onboarding"}
          </button>
        </form>
      </div>
    </main>
  );
}

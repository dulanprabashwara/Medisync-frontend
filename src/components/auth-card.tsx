import Link from "next/link";
import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: { text: string; label: string; href: string };
}) {
  return (
    <main className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-center lg:justify-end px-4 py-4 sm:px-6 lg:px-12 overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Left Side: Doctor Character Illustration & Background Virus Shadow */}
      <div className="hidden lg:flex absolute left-0 xl:left-6 top-1/2 -translate-y-[54%] items-center justify-center pointer-events-none z-0">
        {/* Virus Shadow Graphic in Background of Doctor */}
        <img
          src="/landing/virus-green.png"
          alt="Virus Shadow"
          className="absolute top-12 xl:top-16 -right-24 xl:-right-32 w-80 xl:w-[420px] object-contain opacity-25 filter blur-[1px] -z-10 transform scale-105 pointer-events-none"
        />
        {/* Doctor Character */}
        <img
          src="/landing/doctor-side.png"
          alt="MediSync Doctor"
          className="w-[420px] xl:w-[480px] max-h-[82vh] object-contain drop-shadow-2xl z-10 relative"
        />
      </div>

      {/* Right Side: Auth Form Card */}
      <section className="relative z-10 w-full max-w-md lg:mr-8 xl:mr-16 rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-7 sm:p-8 shadow-2xl shadow-slate-900/10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
          {eyebrow}
        </p>
        <h1 className="mt-2.5 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-2 text-sm sm:text-base leading-6 text-slate-600">{description}</p>
        <div className="mt-6">{children}</div>
        {footer ? (
          <p className="mt-6 text-center text-sm text-slate-600">
            {footer.text}{" "}
            <Link
              className="font-semibold text-teal-700 hover:text-teal-800"
              href={footer.href}
            >
              {footer.label}
            </Link>
          </p>
        ) : null}
      </section>
    </main>
  );
}

export const inputClassName =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

export const primaryButtonClassName =
  "w-full rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60";

export function FormAlert({
  message,
  success = false,
}: {
  message: string;
  success?: boolean;
}) {
  return (
    <div className="mb-5">
      <Alert tone={success ? "success" : "error"}>{message}</Alert>
    </div>
  );
}

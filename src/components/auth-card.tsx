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
    <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl place-items-center px-6 py-12 lg:px-8">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-3 leading-7 text-slate-600">{description}</p>
        <div className="mt-8">{children}</div>
        {footer ? (
          <p className="mt-7 text-center text-sm text-slate-600">
            {footer.text}{" "}
            <Link className="font-semibold text-teal-700 hover:text-teal-800" href={footer.href}>
              {footer.label}
            </Link>
          </p>
        ) : null}
      </section>
    </main>
  );
}

export const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

export const primaryButtonClassName =
  "w-full rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60";

export function FormAlert({ message, success = false }: { message: string; success?: boolean }) {
  return (
    <div className="mb-5">
      <Alert tone={success ? "success" : "error"}>{message}</Alert>
    </div>
  );
}

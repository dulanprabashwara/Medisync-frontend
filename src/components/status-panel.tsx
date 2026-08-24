import Link from "next/link";

export function StatusPanel({
  title,
  message,
  actionLabel,
  actionHref,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-xl text-teal-700">
          +
        </span>
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-3 leading-7 text-slate-600">{message}</p>
        {actionHref && actionLabel ? (
          <Link
            className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        ) : null}
      </section>
    </main>
  );
}

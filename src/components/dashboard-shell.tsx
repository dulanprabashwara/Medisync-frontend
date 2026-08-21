import type { UserRole } from "@/types/user";
import Link from "next/link";

interface ModuleCard {
  title: string;
  description: string;
  phase: string;
  href?: string;
}

export function DashboardShell({
  role,
  portalName,
  welcome,
  intro,
  modules,
  pendingMessage,
  noticeTitle = "Verification pending",
}: {
  role: UserRole;
  portalName: string;
  welcome: string;
  intro: string;
  modules: ModuleCard[];
  pendingMessage?: string;
  noticeTitle?: string;
}) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{portalName}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{welcome}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">{intro}</p>
      </div>

      {pendingMessage ? (
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950" role="status">
          <p className="font-semibold">{noticeTitle}</p>
          <p className="mt-1 text-sm leading-6 text-amber-900">{pendingMessage}</p>
        </section>
      ) : null}

      <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={`${role.toLowerCase()} portal modules`}>
        {modules.map((module) => {
          const content = (
            <>
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-10 place-items-center rounded-xl bg-teal-50 font-bold text-teal-700">+</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">{module.phase}</span>
            </div>
            <h2 className="mt-8 text-lg font-semibold text-slate-950">{module.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
            </>
          );
          return module.href ? (
            <Link className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-teal-300 hover:shadow-md" href={module.href} key={module.title}>{content}</Link>
          ) : (
            <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={module.title}>{content}</article>
          );
        })}
      </section>
    </main>
  );
}

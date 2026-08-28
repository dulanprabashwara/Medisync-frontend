"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { navigationByRole, getActiveRoute } from "@/lib/navigation";
import { MediSyncBrand } from "@/components/branding/medisync-brand";

export function Sidebar() {
  const { profile } = useAuth();
  const pathname = usePathname();

  if (!profile) return null;

  const groups = navigationByRole[profile.role];
  const activeHref = getActiveRoute(pathname, profile.role);
  const workspaceLabels = {
    PATIENT: "Personal care workspace",
    DOCTOR: "Clinical workspace",
    PHARMACIST: "Dispensing workspace",
    ADMIN: "Governance workspace",
  } as const;

  return (
    <aside className="portal-sidebar hidden lg:flex w-[272px] flex-col border-r border-slate-200/80 bg-white/95 h-screen sticky top-0 print:hidden shadow-[8px_0_30px_rgba(15,23,42,0.025)]">
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-slate-100">
        <MediSyncBrand href={`/${profile.role.toLowerCase()}/dashboard`} />
      </div>

      <div className="mx-4 mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[var(--portal-accent)] shadow-[0_0_0_4px_var(--portal-accent-soft)]" />
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--portal-accent)]">
            {profile.role.toLowerCase()}
          </p>
        </div>
        <p className="mt-1.5 text-sm font-medium text-slate-700">
          {workspaceLabels[profile.role]}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7 hide-scrollbar">
        {groups.map((group) => (
          <div key={group.name}>
            <h3
              id={`nav-group-${group.name.replace(/\s+/g, "-")}`}
              className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-2.5"
            >
              {group.name}
            </h3>
            <nav
              aria-labelledby={`nav-group-${group.name.replace(/\s+/g, "-")}`}
              className="space-y-1.5"
            >
              {group.items.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--portal-accent-soft)] text-[var(--portal-accent-strong)] shadow-[inset_0_0_0_1px_var(--portal-accent-faint)]"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950 hover:translate-x-0.5"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -left-1 h-6 w-1 rounded-full bg-[var(--portal-accent)]" />
                    )}
                    <span
                      className={`flex size-8 items-center justify-center rounded-lg transition-colors ${isActive ? "bg-white/80" : "bg-slate-100/70 group-hover:bg-white"}`}
                    >
                      <item.icon
                        className={`size-[18px] shrink-0 ${
                          isActive
                            ? "text-[var(--portal-accent)]"
                            : "text-slate-400 group-hover:text-slate-700"
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="m-4 mt-0 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </span>
        <div>
          <p className="text-xs font-semibold text-slate-700">Secure session</p>
          <p className="text-[11px] text-slate-400">Protected workspace</p>
        </div>
      </div>
    </aside>
  );
}

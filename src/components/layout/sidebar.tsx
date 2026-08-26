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

  return (
    <div className="hidden lg:flex w-[248px] flex-col border-r border-slate-200 bg-white h-screen sticky top-0 print:hidden">
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-slate-200/60">
        <MediSyncBrand href={`/${profile.role.toLowerCase()}/dashboard`} />
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {groups.map((group) => (
          <div key={group.name}>
            <h3 id={`nav-group-${group.name.replace(/\s+/g, '-')}`} className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {group.name}
            </h3>
            <nav aria-labelledby={`nav-group-${group.name.replace(/\s+/g, '-')}`} className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-teal-50 text-teal-800"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <item.icon
                      className={`size-5 shrink-0 ${
                        isActive
                          ? "text-teal-700"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}

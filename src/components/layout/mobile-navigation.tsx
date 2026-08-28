"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { navigationByRole, getActiveRoute } from "@/lib/navigation";
import { MediSyncBrand } from "@/components/branding/medisync-brand";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      document.body.style.overflow = "hidden";
      dialog.showModal();
    } else {
      document.body.style.overflow = "";
      dialog.close();
    }
  }, [open]);

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
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="size-6" />
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label="Mobile navigation"
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
        className="m-0 h-full w-[min(88vw,360px)] max-w-sm max-h-none bg-white p-0 backdrop:bg-slate-950/35 backdrop:backdrop-blur-sm open:flex flex-col border-r border-slate-200 shadow-2xl"
      >
        <div className="flex h-18 shrink-0 items-center justify-between px-5 border-b border-slate-100">
          <MediSyncBrand
            size="compact"
            href={`/${profile.role.toLowerCase()}/dashboard`}
          />
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mx-4 mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--portal-accent)]" />
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
                id={`mobile-nav-group-${group.name.replace(/\s+/g, "-")}`}
                className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-2.5"
              >
                {group.name}
              </h3>
              <nav
                aria-labelledby={`mobile-nav-group-${group.name.replace(/\s+/g, "-")}`}
                className="space-y-1.5"
              >
                {group.items.map((item) => {
                  const isActive = activeHref === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-[var(--portal-accent-soft)] text-[var(--portal-accent-strong)]"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute -left-1 h-6 w-1 rounded-full bg-[var(--portal-accent)]" />
                      )}
                      <span
                        className={`flex size-8 items-center justify-center rounded-lg ${isActive ? "bg-white/80" : "bg-slate-100"}`}
                      >
                        <item.icon
                          className={`size-[18px] shrink-0 ${
                            isActive
                              ? "text-[var(--portal-accent)]"
                              : "text-slate-400 group-hover:text-slate-600"
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
      </dialog>
    </>
  );
}

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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
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
        className="m-0 h-full w-full max-w-sm max-h-none bg-white p-0 backdrop:bg-slate-950/20 backdrop:backdrop-blur-sm open:flex flex-col border-r border-slate-200"
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-200/60">
          <MediSyncBrand size="compact" />
          <button
            onClick={() => setOpen(false)}
            className="p-2 -mr-2 rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {groups.map((group) => (
            <div key={group.name}>
              <h3 id={`mobile-nav-group-${group.name.replace(/\s+/g, '-')}`} className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {group.name}
              </h3>
              <nav aria-labelledby={`mobile-nav-group-${group.name.replace(/\s+/g, '-')}`} className="space-y-1">
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
      </dialog>
    </>
  );
}

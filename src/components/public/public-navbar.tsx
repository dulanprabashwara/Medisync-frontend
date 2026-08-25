"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { dashboardPath } from "@/types/user";
import { Menu, X } from "lucide-react";
import { MediSyncBrand } from "@/components/branding/medisync-brand";

const LINKS = [
  { name: "Home", href: "/" },
  { name: "Guides", href: "/guides" },
  { name: "Features", href: "/features" },
  { name: "FAQ", href: "/#faq" },
  { name: "About", href: "/about" },
];

export function PublicNavbar() {
  const { session, profile } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // effect removed

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <MediSyncBrand />
        
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href === "/#faq" && pathname === "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 text-teal-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {session && profile ? (
            <Link
              className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              href={dashboardPath(profile.role)}
            >
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                href="/login"
              >
                Sign In
              </Link>
              <Link
                className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 shadow-sm"
                href="/register"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700"
          onClick={() => setMobileMenuOpen(true)}
          aria-expanded={mobileMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-5 py-6 sm:max-w-sm sm:ring-1 sm:ring-slate-900/10">
            <div className="flex items-center justify-between">
              <MediSyncBrand />
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-slate-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="size-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-slate-500/10">
                <div className="space-y-2 py-6">
                  {LINKS.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6 flex flex-col gap-3">
                  {session && profile ? (
                    <Link
                      className="rounded-xl bg-teal-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-teal-800"
                      href={dashboardPath(profile.role)}
                    >
                      Open Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        href="/login"
                      >
                        Sign In
                      </Link>
                      <Link
                        className="rounded-xl bg-teal-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-teal-800 shadow-sm"
                        href="/register"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

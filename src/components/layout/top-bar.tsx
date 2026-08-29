"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { MobileNavigation } from "./mobile-navigation";
import { MediSyncBrand } from "@/components/branding/medisync-brand";
import { formatDoctorName } from "@/lib/formatters";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { getActiveRoute, navigationByRole } from "@/lib/navigation";
import { usePathname } from "next/navigation";
import { portalEntryPath, requiresProfessionalVerification } from "@/types/user";

function roleLabel(role: string) {
  switch (role) {
    case "PATIENT":
      return "Patient";
    case "DOCTOR":
      return "Doctor";
    case "PHARMACIST":
      return "Pharmacist";
    case "ADMIN":
      return "Administrator";
    default:
      return role;
  }
}

export function TopBar() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function handleLogout() {
    setBusy(true);
    await signOut("/");
  }

  if (!profile) return null;

  const getProfileLink = () => {
    switch (profile.role) {
      case "PATIENT":
        return "/patient/profile";
      case "PHARMACIST":
        return "/pharmacist/profile";
      case "ADMIN":
        return "/admin/profile";
      case "DOCTOR":
        return "/doctor/profile";
      default:
        return null;
    }
  };

  const profileLink = getProfileLink();
  const activeHref = getActiveRoute(pathname, profile.role);
  const activeItem = navigationByRole[profile.role]
    .flatMap((group) => group.items)
    .find((item) => item.href === activeHref);

  return (
    <header className="sticky top-0 z-30 flex h-18 shrink-0 items-center gap-x-4 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl px-4 shadow-[0_1px_12px_rgba(15,23,42,0.04)] sm:gap-x-6 sm:px-6 lg:px-8 print:hidden">
      <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileNavigation />
          <MediSyncBrand size="compact" href={portalEntryPath(profile)} />
        </div>

        <div className="hidden lg:block min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--portal-accent)]">
            {roleLabel(profile.role)} workspace
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
            {activeItem?.name ?? "MediSync portal"}
          </p>
        </div>

        <div className="flex flex-1 justify-end items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
          {!requiresProfessionalVerification(profile) ? (
            <NotificationBell viewAllRoute={`/${profile.role.toLowerCase()}/notifications`} />
          ) : null}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-x-3 rounded-2xl border border-transparent p-1.5 pr-2 text-sm font-semibold leading-6 text-slate-950 hover:border-slate-200 hover:bg-white hover:shadow-sm transition-all"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--portal-accent-soft)] text-[var(--portal-accent-strong)] font-bold uppercase overflow-hidden ring-1 ring-black/5">
                {profile.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Next Image optimization breaks expiring private signed URLs.
                  <img
                    src={profile.profileImageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  profile.firstName?.charAt(0) || "U"
                )}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span
                  className="ml-2 text-sm font-medium leading-6 text-slate-700"
                  aria-hidden="true"
                >
                  {profile.role === "DOCTOR"
                    ? formatDoctorName(profile.firstName || "")
                    : profile.firstName}
                </span>
                <ChevronDown
                  className={`ml-2 size-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-200/80 bg-white py-2 shadow-[0_20px_50px_rgba(15,23,42,0.14)] focus:outline-none">
                <div className="mx-2 rounded-xl bg-[var(--portal-accent-faint)] px-3 py-3">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {profile.role === "DOCTOR"
                      ? formatDoctorName(`${profile.firstName || ""} ${profile.lastName || ""}`.trim())
                      : `${profile.firstName} ${profile.lastName}`.trim()}
                  </p>
                  <p className="text-xs text-[var(--portal-accent)] truncate mt-0.5 font-semibold">
                    {roleLabel(profile.role)}
                  </p>
                </div>

                <div className="px-2 pt-2">
                  {profileLink && (
                    <Link
                      href={profileLink}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="size-4 text-slate-400" />
                      Your Profile
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={busy}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                  >
                    <LogOut className="size-4 text-slate-400" />
                    {busy ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { MobileNavigation } from "./mobile-navigation";
import { MediSyncBrand } from "@/components/branding/medisync-brand";
import { formatDoctorName } from "@/lib/formatters";

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
  const router = useRouter();
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
    await signOut();
    router.replace("/login");
    router.refresh();
    setBusy(false);
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

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200/80 bg-white/90 backdrop-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileNavigation />
          <MediSyncBrand size="compact" href={`/${profile.role.toLowerCase()}/dashboard`} />
        </div>

        <div className="flex flex-1 justify-end items-center gap-x-4 lg:gap-x-6">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-x-3 rounded-xl p-1.5 text-sm font-semibold leading-6 text-slate-950 hover:bg-slate-50 transition-colors"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex size-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-bold uppercase overflow-hidden">
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
                  className="ml-2 size-4 text-slate-400"
                  aria-hidden="true"
                />
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-2xl bg-white py-2 shadow-lg ring-1 ring-slate-950/5 focus:outline-none">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {profile.role === "DOCTOR"
                      ? formatDoctorName(`${profile.firstName || ""} ${profile.lastName || ""}`.trim())
                      : `${profile.firstName} ${profile.lastName}`.trim()}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {roleLabel(profile.role)}
                  </p>
                </div>

                <div className="py-1">
                  {profileLink && (
                    <Link
                      href={profileLink}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
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
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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

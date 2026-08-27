"use client";

import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { PublicNavbar } from "@/components/public/public-navbar";
import { PublicFooter } from "@/components/public/public-footer";
import { usePathname, useRouter } from "next/navigation";
import { NotificationProvider } from "@/components/notifications/notification-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (profile && pathname === "/") {
      router.replace(`/${profile.role.toLowerCase()}/dashboard`);
    }
  }, [profile, pathname, router]);

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/onboarding";

  // Show nothing while auth resolves on non-auth pages or while redirecting from root
  if ((loading && !isAuthPage) || (profile && pathname === "/")) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  // If not authenticated or onboarding (no profile), show public layout
  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-teal-700 focus:shadow-md font-semibold">Skip to main content</a>
        <PublicNavbar />
        <main id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>{children}</main>
        {!isAuthPage && <PublicFooter />}
      </div>
    );
  }

  const isConsultationRoom = pathname?.includes("/consultations/");

  return (
    <NotificationProvider>
      <div className="flex h-screen overflow-hidden">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-teal-700 focus:shadow-md font-semibold">Skip to main content</a>
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 h-screen">
          <TopBar />
          <main id="main-content" tabIndex={-1} className={`flex-1 relative outline-none ${isConsultationRoom ? "overflow-hidden" : "overflow-y-auto pb-10"}`}>
            <div className={isConsultationRoom ? "h-full flex flex-col" : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8"}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}

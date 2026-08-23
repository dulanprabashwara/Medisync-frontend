"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { SiteHeader } from "@/components/site-header";

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();

  // Show nothing while auth resolves
  if (loading) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  // If not authenticated or onboarding (no profile), show public layout
  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="flex-1 pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

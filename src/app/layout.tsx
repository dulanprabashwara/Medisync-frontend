import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediSync | Connected care, built around people",
  description: "A secure foundation for digital healthcare and remote patient management.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="bg-slate-50 font-sans text-slate-950 antialiased selection:bg-teal-100 selection:text-teal-900">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}

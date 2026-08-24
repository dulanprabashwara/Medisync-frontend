"use client";

import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

export default function AccountDeletedPage() {
  return (
    <AuthCard
      eyebrow="Account Deleted"
      title="We're sorry to see you go"
      description="Your MediSync account has been permanently deleted. Any active healthcare records remain securely archived as required by law."
      footer={{
        text: "Ready to return?",
        label: "Create a new account",
        href: "/register",
      }}
    >
      <div className="mt-6 flex items-center justify-center">
        <Link
          href="/login"
          className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Return to login
        </Link>
      </div>
    </AuthCard>
  );
}

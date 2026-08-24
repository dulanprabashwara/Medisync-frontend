"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { LoadingPanel } from "@/components/loading-panel";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { getPharmacistProfessionalProfile } from "@/lib/api";
import type { PharmacistProfessionalProfile } from "@/types/user";

function PharmacistDashboardContent() {
  const { profile, session } = useAuth();
  const [professional, setProfessional] =
    useState<PharmacistProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      setProfessional(
        await getPharmacistProfessionalProfile(session.access_token),
      );
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (loading) return <LoadingPanel label="Loading the pharmacy portal..." />;

  const verified = professional?.pharmacyAccessAllowed === true;
  const modules = verified
    ? [
        {
          title: "Scan prescription",
          description:
            "Scan and securely verify a patient's one-time prescription QR.",
          phase: "Available",
          href: "/pharmacist/scan",
        },
        {
          title: "Dispensing history",
          description:
            "Review prescriptions dispensed through your verified professional account.",
          phase: "Available",
          href: "/pharmacist/dispensing-history",
        },
        {
          title: "Professional profile",
          description:
            "Review your verified registration and pharmacy information.",
          phase: "Verified",
          href: "/pharmacist/profile",
        },
      ]
    : [
        {
          title: "Professional profile",
          description:
            "Complete your pharmacy credentials and submit them for administrator review.",
          phase: "Required",
          href: "/pharmacist/profile",
        },
      ];

  const rejected = professional?.verificationStatus === "REJECTED";
  const notice = verified
    ? undefined
    : rejected
      ? professional.verificationRejectionReason ||
        "Your submission was rejected. Update your profile and submit it again."
      : professional?.submitted
        ? "Your professional profile is awaiting administrator review. Scanner and dispensing access remain locked."
        : "Complete and submit your professional profile before using prescription verification or dispensing.";

  return (
    <DashboardShell
      role="PHARMACIST"
      portalName="MediSync Pharmacy Portal"
      welcome={`Welcome, ${profile?.firstName ?? "Pharmacist"}`}
      intro="Verify digital prescriptions, dispense them once, and maintain an accountable dispensing history."
      pendingMessage={notice}
      noticeTitle={
        rejected
          ? "Verification rejected"
          : "Professional verification required"
      }
      modules={modules}
    />
  );
}

export default function PharmacistDashboardPage() {
  return (
    <ProtectedRoute roles={["PHARMACIST"]}>
      <PharmacistDashboardContent />
    </ProtectedRoute>
  );
}

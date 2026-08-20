"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";

const pharmacyModules = [
  { title: "Scan prescription", description: "Secure QR scanning is reserved for the prescription phase.", phase: "Planned" },
  { title: "Prescription verification", description: "Verification will expose only the information needed for safe dispensing.", phase: "Planned" },
  { title: "Dispensing history", description: "A controlled dispensing record will be introduced in a later phase.", phase: "Planned" },
];

function PharmacistDashboardContent() {
  const { profile } = useAuth();
  return <DashboardShell role="PHARMACIST" portalName="MediSync Pharmacy Portal" welcome={`Welcome, ${profile?.firstName ?? "Pharmacist"}`} intro="Your pharmacy workspace is ready for future verified prescription services." pendingMessage="Your pharmacist account is awaiting verification. Pharmacy features will become available after verification." modules={pharmacyModules} />;
}

export default function PharmacistDashboardPage() {
  return <ProtectedRoute roles={["PHARMACIST"]}><PharmacistDashboardContent /></ProtectedRoute>;
}

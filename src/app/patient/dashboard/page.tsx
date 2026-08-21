"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";

const patientModules = [
  { title: "Find a Doctor", description: "Search verified doctors and request an available online consultation time.", phase: "Available", href: "/patient/doctors" },
  { title: "Online Consultations", description: "Track consultation requests, confirmations, declined requests, and cancellations.", phase: "Available", href: "/patient/appointments" },
  { title: "Prescriptions", description: "View issued digital prescriptions, medication instructions, and secure QR codes.", phase: "Available", href: "/patient/prescriptions" },
  { title: "Doctor Chat", description: "Secure chat will be available for confirmed consultation relationships in a later phase.", phase: "Planned" },
];

function PatientDashboardContent() {
  const { profile } = useAuth();
  return <DashboardShell role="PATIENT" portalName="MediSync Patient Portal" welcome={`Welcome, ${profile?.firstName ?? "Patient"}`} intro="Find verified doctors and manage your scheduled online consultations from one secure workspace." modules={patientModules} />;
}

export default function PatientDashboardPage() {
  return <ProtectedRoute roles={["PATIENT"]}><PatientDashboardContent /></ProtectedRoute>;
}

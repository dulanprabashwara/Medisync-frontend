"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";

const patientModules = [
  { title: "Find a Doctor", description: "Search verified doctors and request an available appointment slot.", phase: "Available", href: "/patient/doctors" },
  { title: "Appointments", description: "Track requests, confirmations, rejection reasons, and cancellations.", phase: "Available", href: "/patient/appointments" },
  { title: "Prescriptions", description: "Your digital prescriptions will appear here in a later phase.", phase: "Planned" },
  { title: "Messages", description: "Secure care-team conversations are planned for a later phase.", phase: "Planned" },
  { title: "Remote monitoring", description: "Share doctor-requested readings from home in a later phase.", phase: "Planned" },
];

function PatientDashboardContent() {
  const { profile } = useAuth();
  return <DashboardShell role="PATIENT" portalName="MediSync Patient Portal" welcome={`Welcome, ${profile?.firstName ?? "Patient"}`} intro="Your secure care workspace is ready. New healthcare services will be added in clearly separated phases." modules={patientModules} />;
}

export default function PatientDashboardPage() {
  return <ProtectedRoute roles={["PATIENT"]}><PatientDashboardContent /></ProtectedRoute>;
}

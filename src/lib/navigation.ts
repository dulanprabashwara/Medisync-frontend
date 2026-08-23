import {
  LayoutDashboard,
  Search,
  MessageSquare,
  FileText,
  User,
  Calendar,
  Clock,
  ScanLine,
  History,
  Users,
  ShieldAlert,
  BarChart3,
} from "lucide-react";
import type { UserRole } from "@/types/user";

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export interface NavigationGroup {
  name: string;
  items: NavigationItem[];
}

const patientNavigation: NavigationGroup[] = [
  {
    name: "Overview",
    items: [{ name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard }],
  },
  {
    name: "Care",
    items: [
      { name: "Find a Doctor", href: "/patient/doctors", icon: Search },
      { name: "Consultations", href: "/patient/appointments", icon: MessageSquare }, // The prompt mentioned patient consultations list is currently at /appointments
      { name: "Prescriptions", href: "/patient/prescriptions", icon: FileText },
    ],
  },
  {
    name: "Account",
    items: [{ name: "Profile", href: "/patient/profile", icon: User }],
  },
];

const doctorNavigation: NavigationGroup[] = [
  {
    name: "Overview",
    items: [{ name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard }],
  },
  {
    name: "Care",
    items: [
      { name: "Consultations", href: "/doctor/appointments", icon: Calendar },
      { name: "Availability", href: "/doctor/availability", icon: Clock },
      { name: "Prescriptions", href: "/doctor/prescriptions", icon: FileText },
    ],
  },
];

const pharmacistNavigation: NavigationGroup[] = [
  {
    name: "Overview",
    items: [{ name: "Dashboard", href: "/pharmacist/dashboard", icon: LayoutDashboard }],
  },
  {
    name: "Pharmacy",
    items: [
      { name: "Scan Prescription", href: "/pharmacist/scan", icon: ScanLine },
      { name: "Dispensing History", href: "/pharmacist/dispensing-history", icon: History },
    ],
  },
  {
    name: "Account",
    items: [{ name: "Profile", href: "/pharmacist/profile", icon: User }],
  },
];

const adminNavigation: NavigationGroup[] = [
  {
    name: "Overview",
    items: [{ name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    name: "Management",
    items: [{ name: "Users", href: "/admin/users", icon: Users }],
  },
  {
    name: "Monitoring",
    items: [
      { name: "Audit Log", href: "/admin/audit", icon: ShieldAlert },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    name: "Account",
    items: [{ name: "Profile", href: "/admin/profile", icon: User }],
  },
];

export const navigationByRole: Record<UserRole, NavigationGroup[]> = {
  PATIENT: patientNavigation,
  DOCTOR: doctorNavigation,
  PHARMACIST: pharmacistNavigation,
  ADMIN: adminNavigation,
};

export function getActiveRoute(pathname: string, role: UserRole) {
  const groups = navigationByRole[role];
  let activeHref = "";
  
  for (const group of groups) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        // Find the longest match
        if (item.href.length > activeHref.length) {
          activeHref = item.href;
        }
      }
    }
  }
  return activeHref;
}

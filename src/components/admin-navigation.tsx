"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/admin/dashboard", "Verification & reference data"],
  ["/admin/users", "Users"],
  ["/admin/audit-logs", "Audit log"],
  ["/admin/analytics", "Analytics"],
  ["/admin/profile", "Profile"],
] as const;

export function AdminNavigation() {
  const pathname = usePathname();
  return (
    <nav
      className="mt-7 flex flex-wrap gap-2"
      aria-label="Admin portal navigation"
    >
      {links.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href)) ? "bg-teal-700 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

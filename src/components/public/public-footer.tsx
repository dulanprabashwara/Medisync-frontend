import Link from "next/link";
import { MediSyncBrand } from "@/components/branding/medisync-brand";
import { ShieldCheck, Video, MessageSquare, QrCode, Heart, Activity } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 lg:px-8 lg:pt-20">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Brand & Mission Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <MediSyncBrand />
            </div>
            
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              MediSync connects Patients, verified Doctors, and Pharmacists in one unified digital ecosystem featuring HD Video Consultations, real-time messaging, and secure QR dispensing.
            </p>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs text-slate-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Healthcare Network Active</span>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:pl-8">
            
            {/* Column 1: Platform */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Platform Features
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/features" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                    <Video className="size-3.5 text-teal-400" /> HD Video Calls
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                    <MessageSquare className="size-3.5 text-teal-400" /> Real-Time Chat
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                    <Activity className="size-3.5 text-teal-400" /> Digital Prescriptions
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                    <QrCode className="size-3.5 text-teal-400" /> Secure QR Dispensing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: User Roles */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Role Guides
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/guides#patient" className="hover:text-teal-400 transition-colors">
                    Patient Care Guide
                  </Link>
                </li>
                <li>
                  <Link href="/guides#doctor" className="hover:text-teal-400 transition-colors">
                    Doctor Workspace Guide
                  </Link>
                </li>
                <li>
                  <Link href="/guides#pharmacist" className="hover:text-teal-400 transition-colors">
                    Pharmacist Guide
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-teal-400 transition-colors">
                    About MediSync
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Account & Support */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Account & Support
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/login" className="hover:text-teal-400 transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-teal-400 transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:text-teal-400 transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Trust & Copyright Bar */}
        <div className="mt-16 border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} MediSync Digital Healthcare Platform. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="size-4 text-teal-400" /> Verified Doctors
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Heart className="size-3.5 text-red-400" /> Patient-Centered Care
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}

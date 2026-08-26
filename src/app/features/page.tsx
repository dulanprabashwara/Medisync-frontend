import Link from "next/link";
import {
  Users,
  HeartHandshake,
  Pill,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Video,
  MessageSquare,
  QrCode,
  Sparkles,
  Lock,
  Calendar,
  FileSpreadsheet,
  Clock,
  Send,
  Eye,
  Check,
  Zap,
} from "lucide-react";

export const metadata = {
  title: "MediSync Features — Connected Healthcare Workflows",
  description:
    "Explore HD Video Consultations, Real-Time Chat, Digital Prescriptions, and QR Pharmacy Dispensing on MediSync.",
};

export default function FeaturesPage() {
  return (
    <main className="flex-1 bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 via-slate-50/50 to-white py-16 lg:py-24 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#0b6e61] uppercase">
              <Sparkles className="size-3.5 text-teal-600" /> Platform Capabilities
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.12]">
              Connected tools for modern healthcare
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed">
              MediSync coordinates the digital journey between Patients, Doctors, and Pharmacists, ensuring every step of consultation and prescription fulfillment is clear, connected, and secure.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Sections Wrapper */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 space-y-32">
        
        {/* 1. FOR PATIENTS */}
        <section id="patient-features" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2.5 rounded-xl bg-teal-50 px-3.5 py-2 text-sm font-bold text-teal-800 border border-teal-200/60">
              <Users className="size-5 text-teal-700" />
              <span>For Patients</span>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Seamless care, from booking to medicine pickup
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              Patients receive a stress-free digital experience with verified doctor search, real-time consultation messaging, HD video calls, and paperless prescription management.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <FeatureItem title="HD Video Consultations" description="Face-to-face appointments directly in your browser" />
              <FeatureItem title="Real-Time Doctor Chat" description="Instant text & photo messaging during active care" />
              <FeatureItem title="Verified Doctor Search" description="Filter by specialty, availability, and rating" />
              <FeatureItem title="Symptom Submission" description="Provide history before your consultation starts" />
              <FeatureItem title="Digital QR Tokens" description="Scan at any partner pharmacy for instant pickup" />
              <FeatureItem title="Prescription History" description="Access past digital records anytime" />
            </ul>
          </div>

          {/* Interactive UI Mockup Card: Patient Experience */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                  <span className="text-xs font-mono text-slate-400 ml-2">patient-workspace.medisync</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Consultation
                </span>
              </div>

              {/* Video Call Mock Window */}
              <div className="relative h-44 rounded-2xl bg-slate-800 border border-slate-700/80 overflow-hidden flex items-center justify-center">
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg text-xs flex items-center gap-2 border border-slate-700">
                  <Video className="size-3.5 text-teal-400" />
                  <span>Dr. Aruni Perera (General Practitioner)</span>
                </div>
                <div className="text-center space-y-2">
                  <div className="size-12 rounded-full bg-teal-600/30 border border-teal-400/40 flex items-center justify-center mx-auto text-teal-300">
                    <Video className="size-6" />
                  </div>
                  <p className="text-xs text-slate-400">HD Video Stream Active (Encrypted)</p>
                </div>
              </div>

              {/* Chat Message Snippet Mock */}
              <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-teal-300 font-semibold">
                    <MessageSquare className="size-3.5" /> Consultation Chat
                  </span>
                  <span>10:42 AM</span>
                </div>
                <div className="bg-teal-950/70 border border-teal-800/50 rounded-xl p-3 text-xs text-slate-200">
                  <p className="font-medium text-teal-300 mb-1">Dr. Aruni Perera:</p>
                  &quot;I have reviewed your symptoms and issued a digital prescription. Present your QR code at the pharmacy.&quot;
                </div>
              </div>

              {/* QR Code Bar Mock */}
              <div className="flex items-center justify-between rounded-xl bg-slate-800 p-3.5 border border-slate-700">
                <div className="flex items-center gap-3">
                  <QrCode className="size-7 text-teal-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-100">Prescription Token Ready</p>
                    <p className="text-[11px] text-slate-400">Valid for 1-time pharmacy scan</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-teal-400 bg-teal-950 px-3 py-1.5 rounded-lg border border-teal-800">
                  View QR
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. FOR DOCTORS */}
        <section id="doctor-features" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Interactive UI Mockup Card: Doctor Workspace */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <HeartHandshake className="size-5 text-teal-400" />
                  <span className="text-sm font-bold text-slate-100">Doctor Practice Console</span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                  Verified Practitioner
                </span>
              </div>

              {/* Schedule Slots Mock */}
              <div className="rounded-2xl bg-slate-800/90 p-4 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-semibold text-teal-300">
                    <Calendar className="size-3.5" /> Availability Slots
                  </span>
                  <span className="text-slate-400">Today&apos;s Appointments</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-teal-950/80 border border-teal-800 text-teal-200 flex items-center justify-between">
                    <span>09:00 AM - Booked</span>
                    <Check className="size-3.5 text-teal-400" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-between">
                    <span>10:30 AM - Open</span>
                    <Clock className="size-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Prescription Builder Mock */}
              <div className="rounded-2xl bg-slate-800/90 p-4 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-semibold text-teal-300">
                    <FileSpreadsheet className="size-3.5" /> Digital Prescription Builder
                  </span>
                  <span className="text-slate-400">1 Item Added</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700/80 text-xs text-slate-300 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Amoxicillin 500mg</p>
                    <p className="text-[11px] text-slate-400">1 capsule every 8 hours • 7 days</p>
                  </div>
                  <span className="text-[11px] bg-teal-900/60 text-teal-300 px-2 py-1 rounded border border-teal-700">
                    Structured
                  </span>
                </div>
              </div>

              {/* Private Clinical Notes Mock */}
              <div className="rounded-xl bg-amber-950/40 border border-amber-800/50 p-3 text-xs text-amber-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lock className="size-3.5 text-amber-400" /> Private Clinical Notes (Doctor Only)
                </span>
                <span className="text-[10px] text-amber-400 uppercase font-mono">Encrypted</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2.5 rounded-xl bg-teal-50 px-3.5 py-2 text-sm font-bold text-teal-800 border border-teal-200/60">
              <HeartHandshake className="size-5 text-teal-700" />
              <span>For Doctors</span>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              An empowered virtual clinic workspace
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              Doctors gain total control over their consultation schedules, patient records, live communication channels, and structured digital prescribing.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <FeatureItem title="Availability Management" description="Create and modify open consultation time slots easily" />
              <FeatureItem title="Consultation Requests" description="Review patient symptoms before confirming bookings" />
              <FeatureItem title="HD Video & Live Chat" description="Conduct smooth online telehealth consultations" />
              <FeatureItem title="Private Clinical Notes" description="Keep notes completely hidden from patients & third parties" />
              <FeatureItem title="Digital Prescribing" description="Draft structured, tamper-proof prescriptions instantly" />
              <FeatureItem title="Payment Verification" description="Confirm patient payment slips securely" />
            </ul>
          </div>
        </section>

        {/* 3. FOR PHARMACISTS */}
        <section id="pharmacist-features" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2.5 rounded-xl bg-teal-50 px-3.5 py-2 text-sm font-bold text-teal-800 border border-teal-200/60">
              <Pill className="size-5 text-teal-700" />
              <span>For Pharmacists</span>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Zero-error, single-scan prescription fulfillment
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              Pharmacists use quick QR scanning to access authentic doctor prescriptions, eliminating lost papers, illegible handwriting, and double-dispensing risks.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <FeatureItem title="Instant QR Scanner" description="Scan patient phone screen or enter manual token" />
              <FeatureItem title="Safe Dispensing View" description="View only doctor instructions & medicine list" />
              <FeatureItem title="One-Click Dispense" description="Void QR code permanently upon medicine issuance" />
              <FeatureItem title="Dispensing Log" description="Maintain a searchable audit record of fulfilled orders" />
              <FeatureItem title="Verified Pharmacy Identity" description="Operate under a verified professional account" />
              <FeatureItem title="Duplicate Prevention" description="Real-time check stops re-dispensing of used QR codes" />
            </ul>
          </div>

          {/* Interactive UI Mockup Card: Pharmacist Dispensing */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Pill className="size-5 text-teal-400" />
                  <span className="text-sm font-bold text-slate-100">Pharmacy Dispensing Module</span>
                </div>
                <span className="text-xs text-emerald-400 font-mono bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded-md">
                  QR Verified
                </span>
              </div>

              {/* QR Scanner Frame Mock */}
              <div className="relative rounded-2xl bg-slate-800/90 p-5 border border-slate-700 text-center space-y-3">
                <div className="size-16 rounded-2xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center mx-auto text-teal-400">
                  <QrCode className="size-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">QR Token Verified</p>
                  <p className="text-[11px] text-slate-400 font-mono">RX-84920-MEDISYNC</p>
                </div>
              </div>

              {/* Dispense Actions Mock */}
              <div className="rounded-2xl bg-slate-800/90 p-4 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-slate-200">Prescription Details</span>
                  <span className="text-teal-400">Ready to Dispense</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80 text-xs text-slate-300">
                  <p className="font-medium text-white">Paracetamol 500mg (Qty: 20)</p>
                  <p className="text-[11px] text-slate-400">Take 2 tablets after meals as needed</p>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-[#0b6e61] text-xs font-bold text-white shadow-md hover:bg-[#095b50] flex items-center justify-center gap-2">
                  <Check className="size-4" /> Mark Whole Prescription as Dispensed
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. PLATFORM GOVERNANCE & SECURITY */}
        <section id="platform-features" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Interactive UI Mockup Card: Governance */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5 text-teal-400" />
                  <span className="text-sm font-bold text-slate-100">Security & Governance Stack</span>
                </div>
                <span className="text-xs text-teal-400 font-mono bg-teal-950 px-2.5 py-1 rounded-md border border-teal-800">
                  AIP-160 Compliant
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Lock className="size-4 text-teal-400" />
                    <div>
                      <p className="font-bold text-slate-200">Strict Role Partitioning</p>
                      <p className="text-[11px] text-slate-400">Server-enforced authorization bounds</p>
                    </div>
                  </div>
                  <Check className="size-4 text-emerald-400" />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Eye className="size-4 text-teal-400" />
                    <div>
                      <p className="font-bold text-slate-200">Transient Media Encryption</p>
                      <p className="text-[11px] text-slate-400">Chat attachments expire automatically</p>
                    </div>
                  </div>
                  <Check className="size-4 text-emerald-400" />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="size-4 text-teal-400" />
                    <div>
                      <p className="font-bold text-slate-200">Manual Admin Verification</p>
                      <p className="text-[11px] text-slate-400">Doctors & Pharmacists verified before activation</p>
                    </div>
                  </div>
                  <Check className="size-4 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2.5 rounded-xl bg-teal-50 px-3.5 py-2 text-sm font-bold text-teal-800 border border-teal-200/60">
              <ShieldCheck className="size-5 text-teal-700" />
              <span>Platform & Governance</span>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Enterprise-grade security & privacy
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              MediSync enforces strict access control policies, credential verification, transient media security, and user data rights across the platform.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <FeatureItem title="Role-Based Access" description="Strict boundaries isolate patient, doctor, & pharmacy data" />
              <FeatureItem title="Admin Verification" description="Account activation requires verification by admins" />
              <FeatureItem title="Protected Media" description="Chat images secured via expiring transient access links" />
              <FeatureItem title="Self-Service Deletion" description="Users can anonymize or delete their accounts anytime" />
              <FeatureItem title="System Audit Logs" description="Track system events without exposing private clinical notes" />
              <FeatureItem title="Master Data Control" description="Admins manage specialties, medications, and system settings" />
            </ul>
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-10 sm:p-16 text-center text-white shadow-2xl overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to experience these features?
              </h2>
              <p className="text-slate-300 text-base sm:text-lg">
                Create your account on MediSync and get started in minutes.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-[#0b6e61] px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-[#095b50] transition-all"
                >
                  Get Started
                </Link>
                <Link
                  href="/guides"
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-base font-medium text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  Read Guides <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <CheckCircle2 className="size-4 text-teal-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-slate-900">{title}</span>
        <span className="text-slate-600 block text-xs mt-0.5">{description}</span>
      </div>
    </li>
  );
}

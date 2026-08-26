import Link from "next/link";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  Video,
  MessageSquare,
  FileText,
  QrCode,
  HeartHandshake,
  Pill,
  Sparkles,
  Lock,
  Compass,
} from "lucide-react";

export const metadata = {
  title: "About MediSync | Connected Digital Healthcare",
  description:
    "Learn how MediSync unifies Patients, Doctors, and Pharmacists in one seamless healthcare ecosystem featuring HD Video Consultations and secure QR dispensing.",
};

export default function AboutPage() {
  return (
    <main className="flex-1 bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-slate-50/50 to-white pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#0b6e61] uppercase">
              <Sparkles className="size-3.5 text-teal-600" /> Connected Healthcare Platform
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
              Reimagining healthcare, from consultation to pharmacy.
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              MediSync bridges the gap between patient care, doctor consultations, and pharmacy dispensing through one secure, unified digital workflow.
            </p>
          </div>

          {/* Quick Highlight Stats */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6 max-w-5xl mx-auto">
            <StatCard
              icon={Users}
              number="3 Roles"
              label="Patients, Doctors & Pharmacists"
            />
            <StatCard
              icon={Video}
              number="HD Video"
              label="Face-to-Face Appointments"
            />
            <StatCard
              icon={FileText}
              number="100% Digital"
              label="Paperless Prescriptions"
            />
            <StatCard
              icon={QrCode}
              number="Instant QR"
              label="Secure Pharmacy Dispensing"
            />
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="py-20 sm:py-28 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-700">
              Why MediSync Exists
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Eliminating friction in healthcare delivery
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-stretch">
            {/* The Problem */}
            <div className="rounded-3xl bg-slate-50 p-8 sm:p-10 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-rose-100 px-3.5 py-1.5 text-xs font-bold text-rose-800 mb-6">
                  <AlertCircle className="size-4 text-rose-600" /> The Traditional Challenge
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Fragmented Healthcare Care Loops
                </h3>
                <p className="text-slate-600 leading-relaxed text-base mb-6">
                  Traditional telemedicine often relies on disconnected channels: booking on one platform, consulting via third-party video apps, losing paper prescriptions, manually sharing bank receipts, and struggling with pharmacy verification.
                </p>
              </div>

              <ul className="space-y-3 border-t border-slate-200/60 pt-6 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="size-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  Lost or illegible paper prescriptions
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="size-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  No verification mechanism for pharmacy dispensing
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="size-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  Disconnected communication and payment handoffs
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-10 text-white border border-slate-800 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all">
              <div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-teal-500/20 border border-teal-500/30 px-3.5 py-1.5 text-xs font-bold text-teal-300 mb-6">
                  <CheckCircle2 className="size-4 text-teal-400" /> The MediSync Solution
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  One Unified Digital Ecosystem
                </h3>
                <p className="text-slate-300 leading-relaxed text-base mb-6">
                  MediSync integrates every step into a seamless workspace. From finding a verified doctor, joining an HD video consultation, chatting in real-time, receiving a digital prescription, to scanning a secure QR code at the pharmacy.
                </p>
              </div>

              <ul className="space-y-3 border-t border-slate-800 pt-6 text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" />
                  Integrated HD Video & Real-Time Patient Chat
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" />
                  Tamper-proof digital prescription with QR tokens
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" />
                  Verified Doctor & Pharmacist role workflows
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Role Architecture Grid (Who It Serves) */}
      <section className="bg-slate-900 py-20 sm:py-28 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-400">
              Target Ecosystem
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight">
              Designed for every healthcare participant
            </p>
            <p className="text-slate-400 text-base">
              Each user role receives a purpose-built workspace tailored to their specific healthcare needs.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Patient */}
            <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-8 flex flex-col hover:border-teal-500/50 hover:bg-slate-800 transition-all">
              <div className="size-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6">
                <Users className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Patients</h3>
              <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-6">
                Easily discover verified doctors, book consultation slots, participate in live HD video calls, share symptom photos via chat, and receive secure prescription QR codes.
              </p>
              <Link
                href="/guides#patient"
                className="text-xs font-semibold uppercase tracking-wider text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                Patient Guide <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* Doctor */}
            <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-8 flex flex-col hover:border-teal-500/50 hover:bg-slate-800 transition-all">
              <div className="size-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6">
                <HeartHandshake className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Doctors</h3>
              <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-6">
                Manage availability schedules, host HD video consultations, maintain private internal clinical notes, issue structured digital prescriptions, and confirm payments.
              </p>
              <Link
                href="/guides#doctor"
                className="text-xs font-semibold uppercase tracking-wider text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                Doctor Guide <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* Pharmacist */}
            <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-8 flex flex-col hover:border-teal-500/50 hover:bg-slate-800 transition-all">
              <div className="size-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6">
                <Pill className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Pharmacists</h3>
              <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-6">
                Scan patient QR codes to inspect verified medication details, confirm whole-prescription dispensing, and prevent duplicate dispensing with real-time audit records.
              </p>
              <Link
                href="/guides#pharmacist"
                className="text-xs font-semibold uppercase tracking-wider text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                Pharmacist Guide <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Principles & Values */}
      <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-700">
              Core Principles
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Our Product Philosophy
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <PhilosophyCard
              icon={Compass}
              title="Clarity & Ease"
              description="Medical interfaces should never feel overwhelming. We prioritize high contrast, crisp typography, and intuitive navigation."
            />
            <PhilosophyCard
              icon={Lock}
              title="Strict Privacy"
              description="Role boundaries ensure sensitive clinical notes remain private to doctors, while patients only share necessary details."
            />
            <PhilosophyCard
              icon={Zap}
              title="Real-Time Speed"
              description="Live video streams, instant chat messaging, and quick QR scanning remove delays from the patient care lifecycle."
            />
            <PhilosophyCard
              icon={ShieldCheck}
              title="Account Verification"
              description="Administrators manually verify Doctor and Pharmacist credentials before profiles become active in the directory."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-10 sm:p-16 text-center text-white shadow-2xl overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to experience connected healthcare?
              </h2>
              <p className="text-slate-300 text-base sm:text-lg">
                Join MediSync today and experience a modern, streamlined consultation and prescription workflow.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-[#0b6e61] px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-[#095b50] transition-all"
                >
                  Create Account
                </Link>
                <Link
                  href="/features"
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-base font-medium text-slate-200 hover:bg-slate-800 transition-all"
                >
                  Explore Features
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon: Icon,
  number,
  label,
}: {
  icon: React.ElementType;
  number: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
      <div className="size-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 mb-3">
        <Icon className="size-5" />
      </div>
      <span className="text-xl sm:text-2xl font-bold text-slate-900">{number}</span>
      <span className="text-xs text-slate-500 mt-1">{label}</span>
    </div>
  );
}

function PhilosophyCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200/80 flex flex-col hover:shadow-md transition-all">
      <div className="mb-5 size-10 flex items-center justify-center rounded-xl bg-teal-600 text-white">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

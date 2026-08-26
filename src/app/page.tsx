import Link from "next/link";
import { FaqAccordion } from "@/components/public/faq-accordion";
import {
  ChevronRight,
  FileText,
  QrCode,
  BadgeCheck,
  ShieldCheck,
  Pill,
  ArrowRight,
  Activity,
  Users,
  HeartHandshake,
  CheckCircle2,
  Video,
  MessageSquare,
  Sparkles,
  Lock,
  Calendar,
  Check,
} from "lucide-react";

export const metadata = {
  title: "MediSync | Connected Digital Healthcare",
  description:
    "MediSync connects Patients, verified Doctors, and Pharmacists through one secure digital healthcare workflow with HD Video Consultations and Real-Time Chat.",
};

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      <HeroSection />
      <ValueStrip />
      <WhatIsMediSync />
      <HowItWorks />
      <RolesSection />
      <FeaturesSection />
      <ConsultationJourney />
      <PrescriptionToPharmacy />
      <PrivacySection />
      <GuidesPreview />
      <FaqSection />
      <FinalCta />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-slate-50 via-slate-50/50 to-white pt-12 pb-16 lg:pt-20 lg:pb-28 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-4 py-1.5 text-xs font-bold tracking-wider text-[#0b6e61] uppercase shadow-xs">
              <Sparkles className="size-4 text-teal-600 animate-pulse" /> Live HD Video & Real-Time Chat
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Healthcare,<br />
              connected from<br />
              consultation to<br />
              <span className="text-[#0b6e61]">pharmacy.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
              Seamlessly connecting Patients, Doctors, and Pharmacists in one unified, secure ecosystem featuring HD Video Consultations, real-time messaging, and paperless QR prescriptions.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-[#0b6e61] px-7 py-4 text-base font-semibold text-white shadow-md hover:bg-[#095b50] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-300 bg-white px-7 py-4 text-base font-medium text-slate-800 hover:bg-slate-50 hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Column: Doctor & Virus Graphics */}
          <div className="lg:col-span-6 relative flex justify-center items-center mt-6 lg:mt-0">
            {/* Soft Radial Glow */}
            <div className="absolute w-87.5 h-87.5 sm:w-112.5 sm:h-112.5 bg-teal-200/40 rounded-full blur-3xl -z-10" />

            <div className="relative flex items-center justify-center w-full max-w-lg">
              {/* Doctor Character */}
              <img
                src="/landing/doctor-front.png"
                alt="MediSync Doctor"
                className="w-full max-w-md object-contain z-10 relative drop-shadow-xl hover:scale-[1.01] transition-transform duration-500"
              />

              {/* Pixel Divider Accent */}
              <img
                src="/landing/pixel-divider.png"
                alt="Pixel Accent"
                className="absolute top-12 right-16 sm:right-24 w-20 sm:w-28 object-contain z-0 pointer-events-none opacity-90"
              />

              {/* Green Virus 3D Sphere */}
              <img
                src="/landing/virus-green.png"
                alt="Virus Graphic"
                className="absolute -top-6 -right-12 sm:-right-20 lg:-right-24 w-40 sm:w-52 object-contain z-20 pointer-events-none drop-shadow-2xl"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function ValueStrip() {
  return (
    <section className="border-b border-slate-200/80 bg-white py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 sm:gap-x-6 text-center sm:text-left">
          <div className="group flex flex-col sm:flex-row items-center gap-3 p-2 rounded-xl hover:bg-teal-50/50 transition-colors">
            <BadgeCheck className="size-8 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-sm font-bold text-slate-900">Verified Doctors</span>
          </div>
          <div className="group flex flex-col sm:flex-row items-center gap-3 p-2 rounded-xl hover:bg-teal-50/50 transition-colors">
            <Video className="size-8 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-sm font-bold text-slate-900">HD Video Calls</span>
          </div>
          <div className="group flex flex-col sm:flex-row items-center gap-3 p-2 rounded-xl hover:bg-teal-50/50 transition-colors">
            <MessageSquare className="size-8 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-sm font-bold text-slate-900">Real-Time Chat</span>
          </div>
          <div className="group flex flex-col sm:flex-row items-center gap-3 p-2 rounded-xl hover:bg-teal-50/50 transition-colors">
            <FileText className="size-8 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-sm font-bold text-slate-900">Digital Prescriptions</span>
          </div>
          <div className="group flex flex-col sm:flex-row items-center gap-3 p-2 rounded-xl hover:bg-teal-50/50 transition-colors">
            <QrCode className="size-8 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-sm font-bold text-slate-900">Secure QR Dispensing</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatIsMediSync() {
  return (
    <section className="bg-slate-50/60 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-4 py-1.5 text-xs font-bold text-[#0b6e61] uppercase tracking-wider">
            Connected Care Paradigm
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Bringing Patients, Doctors, and Pharmacists together
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-slate-600 pt-2">
            MediSync eliminates fragmented healthcare steps. From finding verified specialists and attending face-to-face HD Video consultations to sharing symptom images, receiving digital prescriptions, and presenting single-use QR tokens at the pharmacy—everything operates in one encrypted ecosystem.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      name: "1. Find a Doctor",
      description: "Browse verified Doctor profiles by specialty and qualification.",
    },
    {
      name: "2. Request Consultation",
      description: "Choose an open time slot and submit your initial symptom notes.",
    },
    {
      name: "3. HD Video & Chat",
      description: "Join a face-to-face video session and exchange messages in real-time.",
    },
    {
      name: "4. Receive Prescription",
      description: "Your Doctor drafts a structured digital prescription attached to your file.",
    },
    {
      name: "5. Complete Fee Payment",
      description: "Upload your receipt in Chat for quick Doctor confirmation.",
    },
    {
      name: "6. Generate Prescription QR",
      description: "Unlock a single-use QR token once payment is confirmed or zero-fee.",
    },
    {
      name: "7. Visit Pharmacy",
      description: "Present the QR code on your phone screen to any partner Pharmacist.",
    },
    {
      name: "8. Medicine Dispensed",
      description: "Pharmacist scans the QR code to safely dispense and void the token.",
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How MediSync Works
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">A simple 8-step journey from booking to medicine pickup</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.name}
              className="group rounded-2xl bg-slate-50/70 border border-slate-200/70 p-6 hover:-translate-y-1 hover:border-teal-400 hover:bg-white hover:shadow-xl transition-all duration-300 space-y-3"
            >
              <div className="size-9 rounded-xl bg-[#0b6e61] text-white font-bold text-sm flex items-center justify-center shadow-md group-hover:bg-teal-600 group-hover:scale-110 transition-all">
                {index + 1}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                {step.name.split(". ")[1]}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  return (
    <section className="bg-slate-950 py-20 sm:py-28 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for every part of the care journey
          </h2>
          <p className="text-slate-400 text-base">Tailored workspaces for Patients, Doctors, and Pharmacists</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Patient Card */}
          <div className="group rounded-3xl border border-slate-800 bg-slate-900/90 p-8 flex flex-col justify-between space-y-6 shadow-xl hover:-translate-y-2 hover:border-teal-500 hover:shadow-2xl hover:shadow-teal-950/50 transition-all duration-300">
            <div className="space-y-4">
              <div className="size-14 rounded-2xl bg-teal-500/10 border border-teal-400/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                <Users className="size-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">Patients</h3>
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Find verified Doctors
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Book consultation slots
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Join live HD Video calls
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Real-time Chat & symptom sharing
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Receive digital prescriptions
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Generate prescription QR
                </li>
              </ul>
            </div>
            <Link
              href="/guides#patient"
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-400 group-hover:text-teal-300 group-hover:translate-x-1 transition-all pt-2"
            >
              Explore Patient Guide <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Doctor Card */}
          <div className="group rounded-3xl border border-slate-800 bg-slate-900/90 p-8 flex flex-col justify-between space-y-6 shadow-xl hover:-translate-y-2 hover:border-teal-500 hover:shadow-2xl hover:shadow-teal-950/50 transition-all duration-300">
            <div className="space-y-4">
              <div className="size-14 rounded-2xl bg-teal-500/10 border border-teal-400/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                <HeartHandshake className="size-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">Doctors</h3>
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Manage availability
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Host HD Video consultations
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Real-time Chat with Patients
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Maintain private clinical notes
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Create digital prescriptions
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Confirm consultation payments
                </li>
              </ul>
            </div>
            <Link
              href="/guides#doctor"
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-400 group-hover:text-teal-300 group-hover:translate-x-1 transition-all pt-2"
            >
              Explore Doctor Guide <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Pharmacist Card */}
          <div className="group rounded-3xl border border-slate-800 bg-slate-900/90 p-8 flex flex-col justify-between space-y-6 shadow-xl hover:-translate-y-2 hover:border-teal-500 hover:shadow-2xl hover:shadow-teal-950/50 transition-all duration-300">
            <div className="space-y-4">
              <div className="size-14 rounded-2xl bg-teal-500/10 border border-teal-400/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                <Pill className="size-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">Pharmacists</h3>
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Instant QR scanner
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Safe dispensing view
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> One-click prescription voiding
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Dispensing audit logs
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-teal-400 shrink-0" /> Duplicate code protection
                </li>
              </ul>
            </div>
            <Link
              href="/guides#pharmacist"
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-400 group-hover:text-teal-300 group-hover:translate-x-1 transition-all pt-2"
            >
              Explore Pharmacist Guide <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      name: "Verified Doctor Discovery",
      icon: Activity,
      description: "Patients browse active Doctors verified by platform administrators.",
    },
    {
      name: "Appointment Scheduling",
      icon: Calendar,
      description: "Available consultation slots are securely reserved upon request.",
    },
    {
      name: "HD Video Consultations",
      icon: Video,
      description: "High-definition face-to-face video sessions built into the workspace.",
    },
    {
      name: "Real-Time Patient Chat",
      icon: MessageSquare,
      description: "Exchange instant text messages, symptom details, and payment slips.",
    },
    {
      name: "Private Clinical Notes",
      icon: Lock,
      description: "Doctors maintain encrypted internal notes invisible to patients.",
    },
    {
      name: "Digital Prescriptions",
      icon: FileText,
      description: "Structured digital prescriptions attached directly to the appointment.",
    },
    {
      name: "Payment Confirmation",
      icon: Check,
      description: "Doctors set transparent fees and confirm receipt directly in chat.",
    },
    {
      name: "Secure Prescription QR",
      icon: QrCode,
      description: "Single-use QR code generated for safe pharmacy dispensing.",
    },
  ];

  return (
    <section className="bg-slate-50/60 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything needed for connected telehealth
          </h2>
          <p className="text-slate-600 text-base">Engineered for security, privacy, and clinical efficiency</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 hover:-translate-y-1 hover:border-teal-400 hover:shadow-xl transition-all duration-300 space-y-3"
              >
                <div className="size-11 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 group-hover:bg-[#0b6e61] group-hover:text-white transition-colors duration-300">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  {feature.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ConsultationJourney() {
  return (
    <section className="bg-white py-20 sm:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-16 lg:items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-4 py-1.5 text-xs font-bold text-[#0b6e61] uppercase tracking-wider">
              Unified Telehealth Workspace
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Your consultation, all in one place
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              The Consultation Workspace combines interactive HD Video Calls, real-time Patient-Doctor Chat, private doctor clinical notes, and digital prescription generation inside a single secure browser window.
            </p>
            <div className="pt-2">
              <Link
                href="/features"
                className="inline-flex items-center gap-2 text-base font-bold text-teal-700 hover:text-teal-800 hover:translate-x-1 transition-all"
              >
                Explore Full Feature Breakdown <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>

          {/* Consultation Mock Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-2xl border border-slate-800 space-y-4 hover:shadow-teal-900/20 hover:border-teal-500/50 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-slate-200">Live HD Video Session</span>
                </div>
                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md">Encrypted</span>
              </div>

              {/* Chat Message Snippets */}
              <div className="space-y-3 text-sm">
                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700/80 text-slate-200">
                  <span className="font-semibold text-teal-300 block mb-1">Patient:</span>
                  &quot;Doctor, I have uploaded my symptoms and joined the video session.&quot;
                </div>
                <div className="bg-teal-950/80 p-3.5 rounded-xl border border-teal-800/60 text-slate-200">
                  <span className="font-semibold text-teal-300 block mb-1">Dr. Aruni Perera:</span>
                  &quot;Welcome! I can see you clearly on video. I have drafted your prescription below.&quot;
                </div>
              </div>

              {/* Prescription Attachment Preview */}
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="size-6 text-teal-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">Digital Prescription Issued</p>
                    <p className="text-xs text-slate-400">Includes prescribed medicines & QR token</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-400 bg-teal-950 px-3 py-1.5 rounded-lg border border-teal-800">
                  Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function PrescriptionToPharmacy() {
  return (
    <section className="bg-slate-50/60 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From prescription to pharmacy — safely connected
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            MediSync&apos;s QR workflow ensures digital prescriptions are safely transferred to verified Pharmacists.
          </p>
        </div>

        <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <WorkflowStep number={1} title="Doctor Issues RX" description="Drafted during video consultation" />
          <WorkflowStep number={2} title="Payment Confirmed" description="Receipt verified by Doctor" />
          <WorkflowStep number={3} title="Patient Gets QR" description="Single-use token unlocked" />
          <WorkflowStep number={4} title="Pharmacist Scans" description="QR code read by device camera" />
          <WorkflowStep number={5} title="Medicine Dispensed" description="Token voided permanently" />
        </div>
      </div>
    </section>
  );
}

function WorkflowStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="group rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm hover:-translate-y-1.5 hover:border-teal-400 hover:shadow-xl transition-all duration-300 space-y-3 flex flex-col items-center justify-center">
      <div className="size-11 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-base font-extrabold flex items-center justify-center group-hover:bg-[#0b6e61] group-hover:text-white transition-colors">
        {number}
      </div>
      <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">{title}</h4>
      <p className="text-sm text-slate-600 leading-normal">{description}</p>
    </div>
  );
}

function PrivacySection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Designed with strict privacy boundaries
          </h2>
          <p className="text-slate-600 text-base">
            Server-enforced authorization ensures users only access data relevant to their role.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 hover:-translate-y-1 hover:border-teal-400 hover:bg-white hover:shadow-xl transition-all duration-300 space-y-3">
            <Users className="size-7 text-teal-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 text-base">Patients</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Access strictly their own healthcare records, consultations, and prescriptions.
            </p>
          </div>
          <div className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 hover:-translate-y-1 hover:border-teal-400 hover:bg-white hover:shadow-xl transition-all duration-300 space-y-3">
            <HeartHandshake className="size-7 text-teal-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 text-base">Doctors</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Manage assigned patients, conduct appointments, and write private clinical notes.
            </p>
          </div>
          <div className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 hover:-translate-y-1 hover:border-teal-400 hover:bg-white hover:shadow-xl transition-all duration-300 space-y-3">
            <Pill className="size-7 text-teal-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 text-base">Pharmacists</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Receive only medicine dispensing details. No consultation chat or doctor notes.
            </p>
          </div>
          <div className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 hover:-translate-y-1 hover:border-teal-400 hover:bg-white hover:shadow-xl transition-all duration-300 space-y-3">
            <ShieldCheck className="size-7 text-teal-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 text-base">Administrators</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Manage user account verification and system logs without viewing clinical notes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function GuidesPreview() {
  return (
    <section className="bg-slate-50/60 py-20 sm:py-24 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Need help getting started?
            </h2>
            <p className="text-sm text-slate-500 mt-1">Detailed documentation for all user roles</p>
          </div>
          <Link
            href="/guides"
            className="font-bold text-sm text-teal-700 hover:text-teal-800 flex items-center gap-1.5"
          >
            View All Guides <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="group rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:border-teal-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">Patient Guide</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Step-by-step instructions for booking appointments, joining HD video calls, and generating prescription QR codes.
              </p>
            </div>
            <Link href="/guides#patient" className="text-sm font-bold text-teal-700 group-hover:text-teal-800 group-hover:translate-x-1 transition-all flex items-center gap-1">
              Read Patient Guide <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="group rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:border-teal-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">Doctor Guide</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Learn how to submit registration details, configure availability slots, host telehealth calls, and write prescriptions.
              </p>
            </div>
            <Link href="/guides#doctor" className="text-sm font-bold text-teal-700 group-hover:text-teal-800 group-hover:translate-x-1 transition-all flex items-center gap-1">
              Read Doctor Guide <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="group rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:border-teal-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">Pharmacist Guide</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Instructions on QR scanning, manual code entry fallbacks, safe prescription viewing, and dispensing confirmation.
              </p>
            </div>
            <Link href="/guides#pharmacist" className="text-sm font-bold text-teal-700 group-hover:text-teal-800 group-hover:translate-x-1 transition-all flex items-center gap-1">
              Read Pharmacist Guide <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="bg-white py-20 sm:py-24 scroll-mt-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-center mb-12">
          Frequently Asked Questions
        </h2>
        <FaqAccordion />
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-20 sm:py-24 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative rounded-3xl bg-linear-to-r from-slate-900 via-teal-950 to-slate-900 p-10 sm:p-16 text-center text-white shadow-2xl overflow-hidden hover:shadow-teal-950/40 transition-shadow">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Ready to experience connected healthcare?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Join thousands of Patients, Doctors, and Pharmacists using MediSync.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-[#0b6e61] px-7 py-4 text-base font-semibold text-white shadow-md hover:bg-[#095b50] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-7 py-4 text-base font-medium text-slate-200 hover:bg-slate-800 hover:border-slate-500 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
              >
                Sign In <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

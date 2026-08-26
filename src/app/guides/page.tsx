import Link from "next/link";
import {
  Users,
  HeartHandshake,
  Pill,
  Sparkles,
  ArrowRight,
  Video,
  MessageSquare,
  QrCode,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

export const metadata = {
  title: "MediSync Guides — Patient, Doctor & Pharmacist User Manuals",
  description:
    "Step-by-step user guides for Patients, Doctors, and Pharmacists on MediSync. Learn how to book consultations, host HD Video calls, and scan prescription QR codes.",
};

export default function GuidesPage() {
  return (
    <main className="flex-1 bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 via-slate-50/50 to-white py-16 lg:py-24 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#0b6e61] uppercase">
              <Sparkles className="size-3.5 text-teal-600" /> Interactive Documentation
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.12]">
              MediSync User Guides
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed">
              Step-by-step instructions for Patients, Doctors, and Pharmacists to navigate the connected digital healthcare experience.
            </p>

            {/* Role Jump Pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#patient"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-2 text-xs font-semibold text-slate-800 hover:border-teal-500 hover:text-teal-700 transition-all"
              >
                <Users className="size-4 text-teal-600" /> Patient Guide
              </a>
              <a
                href="#doctor"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-2 text-xs font-semibold text-slate-800 hover:border-teal-500 hover:text-teal-700 transition-all"
              >
                <HeartHandshake className="size-4 text-teal-600" /> Doctor Guide
              </a>
              <a
                href="#pharmacist"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-2 text-xs font-semibold text-slate-800 hover:border-teal-500 hover:text-teal-700 transition-all"
              >
                <Pill className="size-4 text-teal-600" /> Pharmacist Guide
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Content Wrapper */}
      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 sm:py-24 space-y-24">
        
        {/* 1. PATIENT GUIDE */}
        <section id="patient" className="scroll-mt-24">
          <div className="rounded-3xl bg-white p-8 sm:p-12 border border-slate-200/80 shadow-md space-y-10">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700">
                  <Users className="size-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Patient Care Manual</h2>
                  <p className="text-xs text-slate-500">Everything you need to book consultations and receive medications</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full self-start sm:self-auto">
                12 Steps
              </span>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-6">
              <GuideStep number={1} title="Create your Patient account">
                Visit the registration page, select the <strong>Patient</strong> role, and complete your profile.
              </GuideStep>
              <GuideStep number={2} title="Find a verified Doctor">
                Use the <strong>Find Doctors</strong> directory to filter active practitioners by specialty, hospital, or department.
              </GuideStep>
              <GuideStep number={3} title="Choose an available slot & book">
                Select your preferred Doctor, review open availability times, and click <strong>Book Slot</strong>.
              </GuideStep>
              <GuideStep number={4} title="Describe your symptoms">
                Provide a summary of your health concern so the Doctor can prepare ahead of the session.
              </GuideStep>
              <GuideStep number={5} title="Track appointment status">
                Your request remains in your <strong>Consultations</strong> dashboard as <em>Pending</em> until accepted by the Doctor.
              </GuideStep>
              <GuideStep number={6} title="Join HD Video Call" badge="Core Feature">
                At appointment time, open your consultation and click <strong className="text-teal-700">Join Video Call</strong> to begin a face-to-face stream.
              </GuideStep>
              <GuideStep number={7} title="Use Real-Time Chat & Share Files" badge="Core Feature">
                Exchange text messages, upload symptom photos, or send payment receipts directly inside the consultation room.
              </GuideStep>
              <GuideStep number={8} title="Receive a Digital Prescription">
                Your Doctor will issue a structured prescription that attaches automatically to your consultation file.
              </GuideStep>
              <GuideStep number={9} title="Fulfill payment requirement">
                Follow payment instructions (e.g. bank transfer) and upload your payment slip in the Chat for Doctor confirmation.
              </GuideStep>
              <GuideStep number={10} title="Generate your Prescription QR Token">
                Once payment is confirmed, click <strong className="text-teal-700">Generate QR</strong> to create your single-use pharmacy token.
              </GuideStep>
              <GuideStep number={11} title="Present QR to Pharmacist">
                Visit any verified pharmacy and present your QR code for instant, paperless dispensing.
              </GuideStep>
              <GuideStep number={12} title="Account Management & Privacy">
                Update personal details in Settings or safely delete your account when no active consultations exist.
              </GuideStep>
            </div>

            {/* Pro Tip Box */}
            <div className="rounded-2xl bg-teal-50/80 border border-teal-200/80 p-5 flex items-start gap-3.5 text-xs text-teal-900">
              <Lightbulb className="size-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-1">Pro Tip for Patients:</strong>
                Ensure your browser allows microphone and camera permissions before joining your HD Video Call. If camera access is blocked, you can still use the Real-Time Consultation Chat!
              </div>
            </div>

          </div>
        </section>

        {/* 2. DOCTOR GUIDE */}
        <section id="doctor" className="scroll-mt-24">
          <div className="rounded-3xl bg-white p-8 sm:p-12 border border-slate-200/80 shadow-md space-y-10">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700">
                  <HeartHandshake className="size-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Doctor Practice Manual</h2>
                  <p className="text-xs text-slate-500">Managing schedules, telehealth calls, and issuing digital prescriptions</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full self-start sm:self-auto">
                11 Steps
              </span>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-6">
              <GuideStep number={1} title="Create your Doctor account">
                Register on MediSync and select the <strong>Doctor</strong> role.
              </GuideStep>
              <GuideStep number={2} title="Provide professional credentials">
                Enter your Medical Registration Number, medical qualifications, primary hospital, and optional bank account info.
              </GuideStep>
              <GuideStep number={3} title="Await Admin Verification">
                An Administrator will manually review your credentials before activating your public profile.
              </GuideStep>
              <GuideStep number={4} title="Configure open availability">
                Use the <strong>Availability</strong> calendar tab to publish available consultation time slots.
              </GuideStep>
              <GuideStep number={5} title="Review incoming requests">
                Review pending Patient booking requests along with their submitted symptom notes.
              </GuideStep>
              <GuideStep number={6} title="Host HD Video Session" badge="Core Feature">
                Launch the consultation console to start an interactive face-to-face HD video call with the patient.
              </GuideStep>
              <GuideStep number={7} title="Chat & Private Clinical Notes" badge="Core Feature">
                Communicate via real-time chat while taking confidential observations in the <strong>Clinical Notes</strong> pane.
              </GuideStep>
              <GuideStep number={8} title="Issue Digital Prescription">
                Use the prescription generator to select medications, dosage instructions, and duration.
              </GuideStep>
              <GuideStep number={9} title="Set Consultation Fee">
                Specify transparent fees for your consultation (set to 0 for free consultations).
              </GuideStep>
              <GuideStep number={10} title="Verify Payment & Unlock QR">
                Review uploaded patient payment slips in Chat, then click <strong className="text-teal-700">Confirm Payment Received</strong>.
              </GuideStep>
              <GuideStep number={11} title="Complete Consultation">
                Mark the consultation as <strong>Completed</strong> to finalize clinical records.
              </GuideStep>
            </div>

            {/* Pro Tip Box */}
            <div className="rounded-2xl bg-slate-900 text-white p-5 flex items-start gap-3.5 text-xs border border-slate-800">
              <Lightbulb className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-300 block mb-1">Clinical Note Privacy:</strong>
                Notes entered into the Doctor Clinical Notes tab are strictly encrypted and invisible to Patients and Pharmacists.
              </div>
            </div>

          </div>
        </section>

        {/* 3. PHARMACIST GUIDE */}
        <section id="pharmacist" className="scroll-mt-24">
          <div className="rounded-3xl bg-white p-8 sm:p-12 border border-slate-200/80 shadow-md space-y-10">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700">
                  <Pill className="size-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Pharmacist Dispensing Manual</h2>
                  <p className="text-xs text-slate-500">Scanning patient QR tokens and recording fulfilled prescriptions</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full self-start sm:self-auto">
                8 Steps
              </span>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-6">
              <GuideStep number={1} title="Register Pharmacist Account">
                Create an account and choose the <strong>Pharmacist</strong> role.
              </GuideStep>
              <GuideStep number={2} title="Submit Registration Credentials">
                Provide your Professional Registration Number, pharmacy name, and location for Admin approval.
              </GuideStep>
              <GuideStep number={3} title="Open Prescription Scanner">
                Navigate to <strong>Scan Prescription</strong> on your dashboard.
              </GuideStep>
              <GuideStep number={4} title="Scan Patient QR Code" badge="Core Feature">
                Point your device camera at the patient&apos;s phone screen to instantly read their digital prescription token.
              </GuideStep>
              <GuideStep number={5} title="Manual Token Entry Fallback">
                If camera access is limited, type the raw QR token string into the manual input box.
              </GuideStep>
              <GuideStep number={6} title="Inspect Verified Prescription">
                Review doctor instructions, dosage details, and medication list on the secure dispensing screen.
              </GuideStep>
              <GuideStep number={7} title="Mark as Dispensed">
                Once medicines are packed, click <strong className="text-teal-700">Mark as Dispensed</strong> to void the QR and prevent re-use.
              </GuideStep>
              <GuideStep number={8} title="Review Dispensing Audit History">
                Access your <strong>Dispensing History</strong> log to view all previously fulfilled prescriptions.
              </GuideStep>
            </div>

          </div>
        </section>

      </div>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-10 sm:p-16 text-center text-white shadow-2xl overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Need more help or support?
              </h2>
              <p className="text-slate-300 text-base sm:text-lg">
                Explore our Frequently Asked Questions or jump straight to creating your account.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-[#0b6e61] px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-[#095b50] transition-all"
                >
                  Get Started
                </Link>
                <Link
                  href="/#faq"
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-base font-medium text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  Read FAQ <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function GuideStep({
  number,
  title,
  children,
  badge,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="flex gap-4 items-start p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0b6e61] text-sm font-bold text-white shadow-sm mt-0.5">
        {number}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {badge && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

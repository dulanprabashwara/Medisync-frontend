import Link from "next/link";
import { ChevronRight, FileText, QrCode, BadgeCheck, ShieldCheck, Pill, ArrowRight, Activity, Users, HeartHandshake, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "MediSync | Connected Digital Healthcare",
  description: "MediSync connects Patients, verified Doctors and Pharmacists through one secure digital healthcare workflow.",
};

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
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
    <section className="relative overflow-hidden bg-slate-50 pt-16 md:pt-24 lg:pt-32 pb-16">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-teal-200 to-teal-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Healthcare, connected from consultation to prescription.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            MediSync connects Patients, verified Doctors, and Pharmacists through one secure digital healthcare workflow â€” from finding a Doctor and consulting online to receiving a prescription and safely dispensing it using a QR code.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              Get Started
            </Link>
            <Link href="/features" className="text-sm font-semibold leading-6 text-slate-900 group">
              See How It Works <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">â†’</span>
            </Link>
          </div>
          <div className="mt-6">
            <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900">
              Already have an account? Sign In
            </Link>
          </div>
        </div>

        <div className="mt-16 flow-root sm:mt-24">
          <div className="-m-2 rounded-2xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-3xl lg:p-4">
            <div className="relative overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/10">
              <div className="flex h-12 items-center gap-4 border-b border-slate-200 bg-slate-50 px-4">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-slate-300" />
                  <div className="size-3 rounded-full bg-slate-300" />
                  <div className="size-3 rounded-full bg-slate-300" />
                </div>
                <div className="flex-1 rounded-md bg-white px-3 py-1.5 text-center text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
                  medisync.app / consultation
                </div>
              </div>
              <div className="p-6 sm:p-10 bg-slate-50">
                <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm border border-slate-200 flex gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">MP</div>
                      <div>
                        <h3 className="font-semibold text-slate-950">Dr. Maya Perera</h3>
                        <p className="text-xs text-slate-500">General Medicine</p>
                      </div>
                      <div className="ml-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        In Progress
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <p className="text-sm text-slate-600">Patient: &quot;I&apos;ve been experiencing a mild fever and cough for the last two days.&quot;</p>
                    </div>
                    <div className="rounded-xl bg-teal-50 p-4 border border-teal-100">
                      <p className="text-sm text-teal-800">Dr. Perera: &quot;Thank you for the details. I will issue a prescription for rest and some basic medication to ease the symptoms.&quot;</p>
                    </div>
                  </div>
                  <div className="hidden sm:block w-72 space-y-4">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="text-sm font-semibold text-slate-950 flex items-center gap-2"><FileText className="size-4 text-slate-400" /> Digital Prescription</h4>
                      <p className="mt-2 text-xs text-slate-500">Issued just now</p>
                      <button className="mt-3 w-full rounded-lg bg-teal-50 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100">View Prescription</button>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="text-sm font-semibold text-slate-950 flex items-center gap-2"><QrCode className="size-4 text-slate-400" /> Pharmacy QR</h4>
                      <div className="mt-3 flex justify-center">
                        <div className="size-24 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                          <QrCode className="size-8 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueStrip() {
  return (
    <section className="border-y border-slate-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-x-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <BadgeCheck className="size-6 text-teal-600" />
            <span className="text-sm font-medium text-slate-900">Verified Professionals</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <ShieldCheck className="size-6 text-teal-600" />
            <span className="text-sm font-medium text-slate-900">Private Consultations</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <FileText className="size-6 text-teal-600" />
            <span className="text-sm font-medium text-slate-900">Digital Prescriptions</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <QrCode className="size-6 text-teal-600" />
            <span className="text-sm font-medium text-slate-900">Secure QR Dispensing</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatIsMediSync() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-teal-700">One connected healthcare journey</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Bringing Patients, Doctors, and Pharmacists together.
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            MediSync reduces the fragmented steps between finding care, having a consultation, receiving a prescription, confirming payment, and dispensing medicine at the pharmacy. It all happens securely in one place.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { name: '1. Find a Doctor', description: 'Browse active, verified Doctors by professional information.' },
    { name: '2. Request a Consultation', description: 'Choose an available time and describe your symptoms.' },
    { name: '3. Consult Online', description: 'Communicate securely with your Doctor during the consultation.' },
    { name: '4. Receive a Prescription', description: 'Your Doctor can issue a structured digital prescription when medically appropriate.' },
    { name: '5. Complete Payment', description: 'If a consultation fee applies, follow instructions and share the receipt.' },
    { name: '6. Generate QR', description: 'After payment confirmation (or immediately if free), generate your prescription QR.' },
    { name: '7. Visit Pharmacist', description: 'Present the QR code to a verified Pharmacist in person.' },
    { name: '8. Medicine Dispensed', description: 'The Pharmacist securely verifies and records the dispensing.' },
  ];

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-center mb-16">How MediSync Works</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.name} className="relative pl-9">
                <div className="absolute left-0 top-1 size-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs">
                  {index + 1}
                </div>
                <h3 className="text-base font-semibold leading-7 text-slate-900">{step.name.split('. ')[1]}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  return (
    <section className="bg-slate-900 py-20 sm:py-24 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for every part of the care journey</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 flex flex-col">
            <Users className="size-10 text-teal-400 mb-6" />
            <h3 className="text-xl font-bold mb-4">Patients</h3>
            <ul className="space-y-3 text-sm text-slate-300 flex-1 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Find verified Doctors</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Book consultations</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Share symptoms & Chat</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Receive digital prescriptions</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Generate prescription QR</li>
            </ul>
            <Link href="/guides#patient" className="text-teal-400 font-medium hover:text-teal-300 flex items-center gap-1">Explore Patient Guide <ArrowRight className="size-4" /></Link>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 flex flex-col">
            <HeartHandshake className="size-10 text-teal-400 mb-6" />
            <h3 className="text-xl font-bold mb-4">Doctors</h3>
            <ul className="space-y-3 text-sm text-slate-300 flex-1 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Manage availability</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Review requests & Consult</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Maintain private clinical notes</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Create digital prescriptions</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Confirm consultation payments</li>
            </ul>
            <Link href="/guides#doctor" className="text-teal-400 font-medium hover:text-teal-300 flex items-center gap-1">Explore Doctor Guide <ArrowRight className="size-4" /></Link>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 flex flex-col">
            <Pill className="size-10 text-teal-400 mb-6" />
            <h3 className="text-xl font-bold mb-4">Pharmacists</h3>
            <ul className="space-y-3 text-sm text-slate-300 flex-1 mb-8">
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Verify prescription QR</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Review authorized medicine</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> Confirm whole-prescription dispensing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-500" /> View dispensing history</li>
            </ul>
            <Link href="/guides#pharmacist" className="text-teal-400 font-medium hover:text-teal-300 flex items-center gap-1">Explore Pharmacist Guide <ArrowRight className="size-4" /></Link>
          </div>
        </div>
        <p className="text-center text-slate-400 text-sm mt-12">
          MediSync administrators support professional verification and system governance behind the scenes.
        </p>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { name: 'Verified Doctor Discovery', description: 'Patients can browse a directory of Doctors who have undergone professional verification.' },
    { name: 'Appointment Scheduling', description: 'Available consultation times are safely reserved when a Patient requests a booking.' },
    { name: 'Secure Consultation Chat', description: 'Communicate securely during an active consultation without leaving the platform.' },
    { name: 'Private Clinical Notes', description: 'Doctors can maintain private internal notes on consultations that remain completely hidden from Patients.' },
    { name: 'Digital Prescriptions', description: 'Doctors easily structure and issue clear, digital prescriptions that attach directly to the consultation.' },
    { name: 'Consultation Payment Confirmation', description: 'Doctors set transparent fees and can securely confirm payment receipt directly in the workspace.' },
    { name: 'Secure Prescription QR', description: 'Patients receive an opaque, securely generated QR token representing their valid prescription.' },
    { name: 'Verified Pharmacist Dispensing', description: 'Verified Pharmacists scan the QR to safely dispense medication, completing the healthcare loop.' },
  ];

  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything needed for a connected consultation</h2>
        </div>
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-4 md:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.name} className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow">
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-teal-600">
                  <Activity className="size-6 text-white" />
                </div>
                <h3 className="text-base font-semibold leading-7 text-slate-900">{feature.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ConsultationJourney() {
  return (
    <section className="bg-white py-20 sm:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your consultation, all in one place</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              The Consultation Workspace brings together everything required for a successful online appointment. Patients share symptoms, Doctors maintain private clinical notes, and both parties communicate through Secure Chat. Prescriptions and payment status are always visible and up to date right where you need them.
            </p>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-slate-50 p-6 sm:p-8 ring-1 ring-slate-200 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/4 rounded bg-slate-200" />
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="flex items-start gap-4 flex-row-reverse">
                  <div className="size-10 rounded-full bg-teal-200 shrink-0" />
                  <div className="flex-1 space-y-2 flex flex-col items-end">
                    <div className="h-4 w-1/4 rounded bg-teal-100" />
                    <div className="h-3 w-2/3 rounded bg-teal-50" />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="size-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Digital Prescription Attached</span>
                  </div>
                  <div className="h-2 w-full rounded bg-slate-100" />
                </div>
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
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">From prescription to pharmacy â€” safely connected</h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            MediSync&apos;s secure QR workflow ensures that digital prescriptions are safely transferred to verified Pharmacists for dispensing.
          </p>
        </div>

        <div className="mx-auto max-w-4xl relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />
          <div className="space-y-8 md:space-y-0 relative">

            <div className="md:grid md:grid-cols-2 md:gap-8 items-center md:pb-12">
              <div className="md:text-right pr-0 md:pr-8">
                <h4 className="text-lg font-bold text-slate-900">1. Doctor issues prescription</h4>
                <p className="mt-2 text-sm text-slate-600">During or after the consultation, the Doctor writes and issues a structured digital prescription.</p>
              </div>
              <div className="hidden md:flex justify-center absolute left-1/2 -translate-x-1/2 mt-1">
                <div className="size-4 rounded-full bg-teal-600 ring-4 ring-slate-50" />
              </div>
              <div className="hidden md:block pl-8"></div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8 items-center md:pb-12">
              <div className="hidden md:block pr-8"></div>
              <div className="hidden md:flex justify-center absolute left-1/2 -translate-x-1/2 mt-1">
                <div className="size-4 rounded-full bg-teal-600 ring-4 ring-slate-50" />
              </div>
              <div className="pl-0 md:pl-8 mt-6 md:mt-0">
                <h4 className="text-lg font-bold text-slate-900">2. Payment confirmation</h4>
                <p className="mt-2 text-sm text-slate-600">If required, the Patient completes payment and the Doctor confirms receipt.</p>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8 items-center md:pb-12">
              <div className="md:text-right pr-0 md:pr-8 mt-6 md:mt-0">
                <h4 className="text-lg font-bold text-slate-900">3. Patient generates QR</h4>
                <p className="mt-2 text-sm text-slate-600">The Patient generates a secure QR token representing their prescription.</p>
              </div>
              <div className="hidden md:flex justify-center absolute left-1/2 -translate-x-1/2 mt-1">
                <div className="size-4 rounded-full bg-teal-600 ring-4 ring-slate-50" />
              </div>
              <div className="hidden md:block pl-8"></div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8 items-center md:pb-12">
              <div className="hidden md:block pr-8"></div>
              <div className="hidden md:flex justify-center absolute left-1/2 -translate-x-1/2 mt-1">
                <div className="size-4 rounded-full bg-teal-600 ring-4 ring-slate-50" />
              </div>
              <div className="pl-0 md:pl-8 mt-6 md:mt-0">
                <h4 className="text-lg font-bold text-slate-900">4. Verified Pharmacist scans</h4>
                <p className="mt-2 text-sm text-slate-600">The Patient visits a verified Pharmacist who scans the QR to retrieve dispensing instructions safely.</p>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
              <div className="md:text-right pr-0 md:pr-8 mt-6 md:mt-0">
                <h4 className="text-lg font-bold text-slate-900">5. Prescription dispensed</h4>
                <p className="mt-2 text-sm text-slate-600">The Pharmacist dispenses the medicine. The QR is securely marked as dispensed and cannot be reused.</p>
              </div>
              <div className="hidden md:flex justify-center absolute left-1/2 -translate-x-1/2 mt-1">
                <div className="size-4 rounded-full bg-teal-600 ring-4 ring-slate-50" />
              </div>
              <div className="hidden md:block pl-8"></div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Designed with privacy boundaries in mind</h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            MediSync uses strict role-based access to ensure everyone sees only what they absolutely need to see.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><Users className="size-5 text-teal-600" /> Patients</h3>
            <p className="mt-4 text-sm text-slate-600">See strictly their own healthcare journey, consultations, and prescriptions.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><HeartHandshake className="size-5 text-teal-600" /> Doctors</h3>
            <p className="mt-4 text-sm text-slate-600">Access information required to care for their assigned Patients and keep private clinical notes.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><Pill className="size-5 text-teal-600" /> Pharmacists</h3>
            <p className="mt-4 text-sm text-slate-600">Receive only the information necessary to verify and dispense a prescription. No chat or clinical notes.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><ShieldCheck className="size-5 text-teal-600" /> Administrators</h3>
            <p className="mt-4 text-sm text-slate-600">Manage professional verification and system governance rather than ordinary clinical conversations.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function GuidesPreview() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Need help getting started?</h2>
          <Link href="/guides" className="mt-4 md:mt-0 font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1">
            View All Guides <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Patient Guide</h3>
            <p className="text-sm text-slate-600 flex-1 mb-6">How to find a Doctor, request a consultation, communicate with your Doctor and receive medicine.</p>
            <Link href="/guides#patient" className="text-teal-700 font-medium text-sm">Read Patient Guide &rarr;</Link>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Doctor Guide</h3>
            <p className="text-sm text-slate-600 flex-1 mb-6">How to complete professional verification, manage availability, conduct consultations and issue prescriptions.</p>
            <Link href="/guides#doctor" className="text-teal-700 font-medium text-sm">Read Doctor Guide &rarr;</Link>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Pharmacist Guide</h3>
            <p className="text-sm text-slate-600 flex-1 mb-6">How professional verification, prescription scanning and dispensing work.</p>
            <Link href="/guides#pharmacist" className="text-teal-700 font-medium text-sm">Read Pharmacist Guide &rarr;</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    { question: "What is MediSync?", answer: "MediSync is a secure digital healthcare platform connecting Patients, verified Doctors, and Pharmacists in a streamlined workflow." },
    { question: "Who can use MediSync?", answer: "Patients looking for online consultations, verified Doctors providing care, and verified Pharmacists dispensing medication." },
    { question: "How do I find a Doctor?", answer: "Patients can search the directory of professionally verified Doctors, filtering by specialization, department, and hospital." },
    { question: "Can I book consultations online?", answer: "Yes. Patients can request bookings for a Doctor's available time slots. The Doctor reviews and accepts the request." },
    { question: "How does the consultation work?", answer: "Once accepted and scheduled, Patients and Doctors use a secure online chat workspace to discuss symptoms and treatment." },
    { question: "How do prescriptions work?", answer: "Doctors can write structured digital prescriptions during the consultation, which are instantly available to the Patient." },
    { question: "Why do I need a QR code?", answer: "The QR code securely transfers your prescription details to a Pharmacist without needing paper, ensuring it hasn't been altered." },
    { question: "When can I generate my prescription QR?", answer: "You can generate your QR code once the Doctor issues the prescription and confirms receipt of payment (if a fee applies)." },
    { question: "What if my consultation has no fee?", answer: "If the Doctor sets the fee to zero, no payment confirmation is required, and you can generate the QR immediately after issuance." },
    { question: "How does a Pharmacist verify my prescription?", answer: "A verified Pharmacist uses the MediSync scanner to scan your QR code, viewing exactly the medicines and instructions needed for dispensing." },
    { question: "Can the same QR be used more than once?", answer: "No. Once a Pharmacist confirms the prescription is dispensed, the QR code cannot be reused." },
    { question: "Can Pharmacists see my consultation chat?", answer: "Absolutely not. Pharmacists only see the medicines, instructions, and basic details necessary to dispense safely." },
    { question: "Can Administrators see private clinical notes?", answer: "No. Private clinical notes are visible exclusively to the Doctor who wrote them." },
    { question: "How are Doctors and Pharmacists verified?", answer: "Administrators manually review professional registration and credentials submitted during onboarding before granting verified status." },
    { question: "Can I cancel a consultation?", answer: "Yes, you can cancel a consultation if it meets the platform's cancellation eligibility rules (e.g. before it is completed or paid)." },
    { question: "Can I delete my MediSync account?", answer: "Yes. Eligible accounts can be self-deleted, which anonymizes personal data while preserving necessary medical history for connected professionals." }
  ];

  return (
    <section id="faq" className="bg-white py-20 sm:py-24 scroll-mt-18">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-center mb-16">Frequently Asked Questions</h2>
        <div className="divide-y divide-slate-200">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group py-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 rounded-md">
                {faq.question}
                <span className="ml-6 flex h-7 items-center">
                  <ChevronRight className="size-5 text-slate-400 group-open:rotate-90 transition-transform" />
                </span>
              </summary>
              <p className="mt-4 pr-12 text-slate-600 leading-7">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-teal-700 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to get started with MediSync?</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-teal-100">
          Create your account and connect with the right healthcare workflow for your role.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/register"
            className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-teal-800 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Get Started
          </Link>
          <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-teal-50">
            Sign In <span aria-hidden="true">â†’</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

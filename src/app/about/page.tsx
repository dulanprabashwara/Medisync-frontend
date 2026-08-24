import Link from "next/link";
import { ArrowRight, AlertCircle, RefreshCw, Users, ShieldCheck, Zap } from "lucide-react";

export const metadata = {
  title: "About MediSync",
  description: "Learn about MediSync's mission to connect the digital healthcare journey.",
};

export default function AboutPage() {
  return (
    <main className="flex-1 bg-white">
      {/* Hero */}
      <section className="bg-slate-50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">Connecting the healthcare journey</h1>
            <p className="mt-6 text-xl leading-8 text-slate-600">
              MediSync is an online platform that reduces the fragmentation between patient consultations, prescriptions, and medicine dispensing through one connected digital workflow.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Problem */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-100 rounded-lg"><AlertCircle className="size-6 text-rose-700" /></div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">The Problem</h2>
              </div>
              <p className="text-lg leading-8 text-slate-600">
                Healthcare interactions often become fragmented. A patient might book an appointment on one system, consult via a separate video app, receive a paper prescription that can be easily lost or misread, pay through an external transfer, and finally visit a pharmacy where verification is difficult. This disconnected process creates friction, reduces privacy, and increases the chance of errors.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-100 rounded-lg"><RefreshCw className="size-6 text-teal-700" /></div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Our Approach</h2>
              </div>
              <p className="text-lg leading-8 text-slate-600">
                MediSync brings these disconnected steps into a single, role-aware platform. We provide a cohesive workflow that connects verified professionals and patients. From the moment a patient searches for a doctor to the moment a pharmacist dispenses their medication using a secure QR code, MediSync ensures the journey is clear, connected, and safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It Serves & Governance */}
      <section className="bg-slate-900 py-20 sm:py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-900/50 rounded-lg border border-teal-800"><Users className="size-6 text-teal-400" /></div>
                <h2 className="text-3xl font-bold tracking-tight">Who it serves</h2>
              </div>
              <ul className="space-y-6 text-slate-300">
                <li>
                  <strong className="text-white block text-lg mb-1">Patients</strong>
                  Seeking convenient, secure online consultations and a reliable way to receive and fulfill prescriptions.
                </li>
                <li>
                  <strong className="text-white block text-lg mb-1">Doctors</strong>
                  Looking for a professional workspace to manage appointments, consult online, take private notes, and issue digital prescriptions seamlessly.
                </li>
                <li>
                  <strong className="text-white block text-lg mb-1">Pharmacists</strong>
                  Needing a safe, verifiable method to review digital prescriptions and ensure they are dispensed only once.
                </li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-900/50 rounded-lg border border-teal-800"><ShieldCheck className="size-6 text-teal-400" /></div>
                <h2 className="text-3xl font-bold tracking-tight">Governance & Trust</h2>
              </div>
              <p className="text-lg leading-8 text-slate-300 mb-6">
                A connected healthcare system requires absolute trust. MediSync is built on strict governance principles:
              </p>
              <ul className="space-y-4 text-slate-300 list-disc pl-5">
                <li><strong>Professional verification:</strong> Doctors and Pharmacists must be manually verified by Administrators before they can practice on the platform.</li>
                <li><strong>Role boundaries:</strong> Every user role is strictly partitioned. Doctors cannot see other doctors&apos; private notes, and Pharmacists only see dispensing instructions.</li>
                <li><strong>Controlled access:</strong> Application roles are enforced at the server level, ensuring data cannot be accessed by unauthorized accounts.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Product Philosophy */}
      <section className="py-20 sm:py-24 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Product Philosophy</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <PhilosophyCard title="Clarity" description="Healthcare interfaces should never be confusing. We design for high readability and straightforward navigation." />
            <PhilosophyCard title="Privacy" description="Only the necessary information is shared. Private notes remain private. Patient data is heavily protected." />
            <PhilosophyCard title="Usability" description="Workflows are designed to be accessible and easy to understand for people of all technical skill levels." />
            <PhilosophyCard title="Reliable workflows" description="Every step, from booking to dispensing, is built to be robust and dependable, preventing dropped handoffs." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Experience MediSync</h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              Get Started
            </Link>
            <Link href="/features" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Explore Features
            </Link>
            <Link href="/guides" className="text-sm font-semibold leading-6 text-teal-700 hover:text-teal-800 flex items-center gap-1 ml-2">
              Read Guides <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function PhilosophyCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-teal-100">
        <Zap className="size-5 text-teal-700" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-6">{description}</p>
    </div>
  );
}

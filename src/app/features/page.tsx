import Link from "next/link";
import { Users, HeartHandshake, Pill, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "MediSync Features — Connected Healthcare Workflows",
  description: "Explore the features that connect Patients, Doctors, and Pharmacists on MediSync.",
};

export default function FeaturesPage() {
  return (
    <main className="flex-1 bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-24">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Healthcare workflows, connected</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            MediSync coordinates the digital journey between Patients, Doctors and Pharmacists, ensuring every step of the healthcare process is secure and efficiently connected.
          </p>
        </div>

        <div className="space-y-32">
          {/* For Patients */}
          <section className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-100 rounded-lg"><Users className="size-6 text-teal-700" /></div>
                <h2 className="text-2xl font-bold text-slate-900">For Patients</h2>
              </div>
              <ul className="space-y-4">
                <FeatureItem title="Verified Doctor discovery" description="Browse a directory of actively practicing Doctors who have undergone professional verification." />
                <FeatureItem title="Availability browsing" description="View available time slots for your chosen Doctor directly on their profile." />
                <FeatureItem title="Consultation booking" description="Easily request a booking for an available slot." />
                <FeatureItem title="Symptoms submission" description="Provide a brief description of your symptoms prior to the consultation." />
                <FeatureItem title="Secure Chat" description="Communicate securely with your Doctor via real-time text and images." />
                <FeatureItem title="Digital prescriptions" description="Receive structured prescriptions directly within your consultation workspace." />
                <FeatureItem title="Payment status" description="Clearly view consultation fees and upload receipts for Doctor confirmation." />
                <FeatureItem title="QR generation" description="Generate a secure QR token representing your valid prescription for dispensing." />
                <FeatureItem title="Prescription history" description="Access a log of your past consultations and dispensed prescriptions." />
              </ul>
            </div>
            <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm ring-1 ring-slate-200">
              <div className="space-y-4">
                <div className="h-10 w-full bg-slate-100 rounded-lg border border-slate-200 flex items-center px-4 gap-3">
                  <div className="size-4 rounded-full bg-slate-300" />
                  <div className="h-4 w-1/3 bg-slate-200 rounded" />
                </div>
                <div className="h-24 w-full bg-teal-50 rounded-lg border border-teal-100 p-4">
                  <div className="h-4 w-1/4 bg-teal-200 rounded mb-3" />
                  <div className="h-3 w-3/4 bg-teal-100 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-teal-100 rounded" />
                </div>
                <div className="h-32 w-full bg-slate-50 rounded-lg border border-slate-200 p-4 flex flex-col items-center justify-center">
                  <div className="size-16 border-2 border-dashed border-slate-300 rounded bg-slate-100" />
                  <div className="mt-3 h-3 w-1/4 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </section>

          {/* For Doctors */}
          <section className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-100 rounded-lg"><HeartHandshake className="size-6 text-teal-700" /></div>
                <h2 className="text-2xl font-bold text-slate-900">For Doctors</h2>
              </div>
              <ul className="space-y-4">
                <FeatureItem title="Professional verification" description="Securely submit credentials to ensure only qualified professionals provide care." />
                <FeatureItem title="Availability management" description="Create and manage open consultation slots seamlessly." />
                <FeatureItem title="Consultation request management" description="Review, accept, or reject incoming patient requests based on your schedule." />
                <FeatureItem title="Online consultation workspace" description="A unified interface to chat with patients, review symptoms, and manage the appointment." />
                <FeatureItem title="Private clinical notes" description="Keep secure, private internal notes that remain completely hidden from patients." />
                <FeatureItem title="Structured prescriptions" description="Draft and issue clear, digital prescriptions attached to the patient's record." />
                <FeatureItem title="Consultation fees" description="Set transparent consultation fees applicable to your services." />
                <FeatureItem title="Manual payment confirmation" description="Review patient-provided receipts and securely unlock their prescription QR." />
              </ul>
            </div>
            <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm ring-1 ring-slate-200">
              <div className="space-y-4">
                <div className="h-10 w-1/3 bg-slate-100 rounded border border-slate-200" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-slate-50 rounded-lg border border-slate-200 p-3">
                    <div className="h-3 w-1/2 bg-slate-200 rounded mb-2" />
                    <div className="h-2 w-3/4 bg-slate-100 rounded" />
                  </div>
                  <div className="h-20 bg-slate-50 rounded-lg border border-slate-200 p-3">
                    <div className="h-3 w-1/2 bg-slate-200 rounded mb-2" />
                    <div className="h-2 w-3/4 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-32 w-full bg-amber-50 rounded-lg border border-amber-100 p-4">
                  <div className="h-4 w-1/4 bg-amber-200 rounded mb-3" />
                  <div className="h-3 w-full bg-amber-100 rounded mb-2" />
                  <div className="h-3 w-5/6 bg-amber-100 rounded" />
                </div>
              </div>
            </div>
          </section>

          {/* For Pharmacists */}
          <section className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-100 rounded-lg"><Pill className="size-6 text-teal-700" /></div>
                <h2 className="text-2xl font-bold text-slate-900">For Pharmacists</h2>
              </div>
              <ul className="space-y-4">
                <FeatureItem title="Professional verification" description="Verified onboarding ensures trust across the dispensing network." />
                <FeatureItem title="QR verification" description="Scan a patient's QR code or manually enter the token to retrieve prescription details." />
                <FeatureItem title="Safe prescription view" description="Access only the information necessary to verify and dispense a prescription safely." />
                <FeatureItem title="Whole-prescription dispensing" description="Mark a prescription as fully dispensed, permanently voiding the QR to prevent reuse." />
                <FeatureItem title="Dispensing history" description="Maintain a clear record of all prescriptions successfully dispensed." />
              </ul>
            </div>
            <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm ring-1 ring-slate-200">
              <div className="space-y-4">
                <div className="h-12 w-full bg-slate-800 rounded-lg flex items-center justify-center gap-2">
                  <div className="size-5 rounded border-2 border-white" />
                  <div className="h-4 w-24 bg-slate-600 rounded" />
                </div>
                <div className="h-40 w-full bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="h-4 w-1/3 bg-slate-200 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-8 w-full bg-white rounded border border-slate-100 flex items-center px-3 gap-2">
                      <div className="size-3 rounded-full bg-teal-400" />
                      <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                    <div className="h-8 w-full bg-white rounded border border-slate-100 flex items-center px-3 gap-2">
                      <div className="size-3 rounded-full bg-teal-400" />
                      <div className="h-3 w-2/3 bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Platform */}
          <section className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-100 rounded-lg"><ShieldCheck className="size-6 text-teal-700" /></div>
                <h2 className="text-2xl font-bold text-slate-900">Platform</h2>
              </div>
              <ul className="space-y-4">
                <FeatureItem title="Role-based access" description="Securely partitioned interfaces ensure users only access workflows appropriate for their role." />
                <FeatureItem title="Professional verification" description="Administrative governance ensures Doctors and Pharmacists are credentialed." />
                <FeatureItem title="Private media" description="Sensitive images uploaded in chat are protected via transient signed URLs, expiring shortly after access." />
                <FeatureItem title="Account status management" description="Administrators can review and manage user access to maintain platform safety." />
                <FeatureItem title="Account deletion/anonymization" description="Users can self-delete their accounts, prioritizing data privacy and safety." />
                <FeatureItem title="Operational Admin governance" description="Admins manage system master data and audit logs without exposing private clinical communications." />
              </ul>
            </div>
            <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm ring-1 ring-slate-200">
               <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 w-full bg-slate-50 rounded-lg border border-slate-100 flex items-center px-4 justify-between">
                    <div className="h-3 w-1/3 bg-slate-200 rounded" />
                    <div className="h-4 w-12 bg-slate-300 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-32 rounded-3xl bg-teal-700 px-6 py-16 text-center sm:px-12 flex flex-col items-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to experience connected care?</h2>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-teal-800 shadow-sm hover:bg-slate-50"
            >
              Get Started
            </Link>
            <Link href="/guides" className="text-sm font-semibold leading-6 text-white hover:text-teal-50 flex items-center gap-1">
              Explore Guides <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex gap-3">
      <CheckCircle2 className="size-5 text-teal-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-slate-900">{title}</span>
        <span className="text-slate-600"> — {description}</span>
      </div>
    </li>
  );
}

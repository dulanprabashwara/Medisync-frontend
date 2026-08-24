

export const metadata = {
  title: "MediSync Guides — Patient, Doctor & Pharmacist Help",
  description: "Step-by-step guidance for Patients, Doctors and Pharmacists on using MediSync.",
};

export default function GuidesPage() {
  return (
    <main className="flex-1 bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">MediSync Guides</h1>
          <p className="mt-4 text-lg text-slate-600">Step-by-step guidance for Patients, Doctors and Pharmacists.</p>
        </div>

        <div className="flex flex-col gap-16">
          {/* Patient Guide */}
          <section id="patient" className="scroll-mt-24">
            <div className="rounded-2xl bg-white p-8 sm:p-12 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Patient Guide</h2>
              <div className="space-y-8 text-slate-700">
                <GuideStep number={1} title="Create your Patient account">
                  Visit the registration page, select the <strong>Patient</strong> role, and complete your basic profile information.
                </GuideStep>
                <GuideStep number={2} title="Find a verified Doctor">
                  Use the <strong>Find Doctors</strong> tab to browse active, verified Doctors. You can search by specialization, hospital, or department.
                </GuideStep>
                <GuideStep number={3} title="Choose an available consultation">
                  Select a Doctor and view their available slots. Click <strong>Book Slot</strong> to request an appointment.
                </GuideStep>
                <GuideStep number={4} title="Submit symptoms">
                  Provide a brief description of your symptoms so the Doctor understands your condition before the consultation begins.
                </GuideStep>
                <GuideStep number={5} title="Track your request">
                  Your request will appear in your <strong>Consultations</strong> tab as <em>Pending</em> until the Doctor accepts it.
                </GuideStep>
                <GuideStep number={6} title="Join your online consultation">
                  At the scheduled time, open the accepted consultation. Once the Doctor starts the session, you can communicate in real time.
                </GuideStep>
                <GuideStep number={7} title="Use consultation Chat">
                  Exchange text and images securely with your Doctor within the consultation workspace.
                </GuideStep>
                <GuideStep number={8} title="Receive a prescription">
                  If medically appropriate, the Doctor will issue a digital prescription, which will appear attached to your consultation.
                </GuideStep>
                <GuideStep number={9} title="Complete payment if required">
                  If the Doctor has set a consultation fee, follow their instructions (usually a bank transfer) and upload the receipt in the Chat. The Doctor will then confirm the payment.
                </GuideStep>
                <GuideStep number={10} title="Generate your prescription QR">
                  Once payment is confirmed (or immediately if the fee is zero), click <strong>Generate QR</strong> to secure your prescription for the pharmacy.
                </GuideStep>
                <GuideStep number={11} title="Present QR to Pharmacist">
                  Visit a verified Pharmacist in person and present your QR code for scanning. They will safely dispense your medication.
                </GuideStep>
                <GuideStep number={12} title="Manage your profile & account">
                  Update your contact details in your profile settings. You can also permanently delete your account if needed, provided you have no active consultations.
                </GuideStep>
              </div>
            </div>
          </section>

          {/* Doctor Guide */}
          <section id="doctor" className="scroll-mt-24">
            <div className="rounded-2xl bg-white p-8 sm:p-12 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Doctor Guide</h2>
              <div className="space-y-8 text-slate-700">
                <GuideStep number={1} title="Create a Doctor account">
                  Register and select the <strong>Doctor</strong> role.
                </GuideStep>
                <GuideStep number={2} title="Complete professional information">
                  Provide your SLMC Registration Number, qualifications, current hospital, and optionally your bank account details for patient payments.
                </GuideStep>
                <GuideStep number={3} title="Wait for verification">
                  An Administrator must manually verify your credentials before your profile becomes active and visible to Patients.
                </GuideStep>
                <GuideStep number={4} title="Manage availability">
                  Use the <strong>Availability</strong> tab to create open consultation slots for specific dates and times.
                </GuideStep>
                <GuideStep number={5} title="Review consultation requests">
                  In your <strong>Consultations</strong> tab, review pending requests from Patients. You can accept or reject them based on your schedule.
                </GuideStep>
                <GuideStep number={6} title="Conduct consultations">
                  Open an accepted consultation and start the session to begin communicating securely with the Patient.
                </GuideStep>
                <GuideStep number={7} title="Use private clinical notes">
                  Use the <strong>Clinical Notes</strong> section to maintain private observations. These are never visible to the Patient.
                </GuideStep>
                <GuideStep number={8} title="Issue prescription">
                  Use the <strong>Create Prescription</strong> tool to draft and issue a structured digital prescription directly attached to the consultation.
                </GuideStep>
                <GuideStep number={9} title="Set consultation fee">
                  Before confirming the appointment or during the session, ensure your consultation fee is accurately set. Set to 0 if the service is free.
                </GuideStep>
                <GuideStep number={10} title="Confirm payment">
                  Review the Patient&apos;s payment receipt in the Chat. If correct, click <strong>Confirm Payment Received</strong> to unlock their prescription QR.
                </GuideStep>
                <GuideStep number={11} title="Complete consultation">
                  Once all care is provided, mark the consultation as <strong>Completed</strong> to finalize the appointment.
                </GuideStep>
              </div>
            </div>
          </section>

          {/* Pharmacist Guide */}
          <section id="pharmacist" className="scroll-mt-24">
            <div className="rounded-2xl bg-white p-8 sm:p-12 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Pharmacist Guide</h2>
              <div className="space-y-8 text-slate-700">
                <GuideStep number={1} title="Create Pharmacist account">
                  Register and select the <strong>Pharmacist</strong> role.
                </GuideStep>
                <GuideStep number={2} title="Complete professional verification">
                  Provide your SLMC Registration Number, pharmacy name, and contact details. An Administrator will verify your account.
                </GuideStep>
                <GuideStep number={3} title="Open Scan Prescription">
                  Navigate to the <strong>Scan Prescription</strong> tab in your dashboard.
                </GuideStep>
                <GuideStep number={4} title="Scan Patient QR">
                  Use your device camera to scan the secure QR code presented by the Patient.
                </GuideStep>
                <GuideStep number={5} title="Use manual QR entry if camera is unavailable">
                  If scanning fails, you can enter the raw QR token string manually using the text input option.
                </GuideStep>
                <GuideStep number={6} title="Review verified prescription">
                  The system will display only dispensing-relevant information: Patient details, Doctor details, and the list of prescribed medicines with instructions.
                </GuideStep>
                <GuideStep number={7} title="Confirm dispensing">
                  Once you have prepared the medication, click <strong>Mark as Dispensed</strong>. This permanently voids the QR code to prevent reuse.
                </GuideStep>
                <GuideStep number={8} title="View dispensing history">
                  Access your <strong>Dispensing History</strong> to review all prescriptions you have fulfilled on the platform.
                </GuideStep>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function GuideStep({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6">{children}</p>
      </div>
    </div>
  );
}

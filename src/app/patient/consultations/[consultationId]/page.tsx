"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ConsultationCancellationPanel } from "@/components/consultation-cancellation-panel";
import { ConsultationChat } from "@/components/consultation-chat";
import { LoadingPanel } from "@/components/loading-panel";
import { ConsultationStatusBadge, InlineError, PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { useConsultationEvents } from "@/hooks/use-consultation-events";
import {
  getPatientConsultation,
  getPatientConsultationMessages,
  sendPatientConsultationMessage,
} from "@/lib/api";
import { mergeConsultationMessages } from "@/lib/consultation-messages";
import type { ConsultationDetails, ConsultationEvent, ConsultationMessage } from "@/types/consultations";

function PatientConsultationContent() {
  const { consultationId } = useParams<{ consultationId: string }>();
  const { session } = useAuth();
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reconcile = useCallback(async () => {
    if (!session || !consultationId) return;
    try {
      const [details, history] = await Promise.all([
        getPatientConsultation(session.access_token, consultationId),
        getPatientConsultationMessages(session.access_token, consultationId),
      ]);
      setConsultation(details);
      setMessages((current) => mergeConsultationMessages(current, history.content));
    } catch (reconcileError) {
      setError(reconcileError instanceof Error ? reconcileError.message : "The consultation could not be refreshed.");
    }
  }, [consultationId, session]);

  const handleEvent = useCallback((event: ConsultationEvent) => {
    if (event.eventType === "NEW_MESSAGE" && event.message) {
      setMessages((current) => mergeConsultationMessages(current, [event.message!]));
    }
    if (event.eventType === "CONSULTATION_STATUS_CHANGED" && event.status) {
      setConsultation((current) => current ? {
        ...current,
        status: event.status!,
        chatEnabled: event.status !== "CANCELLED",
      } : current);
      void reconcile();
    }
    if (event.eventType === "PAYMENT_STATUS_CHANGED") {
      void reconcile();
    }
  }, [reconcile]);

  const liveStatus = useConsultationEvents(consultationId, handleEvent, reconcile);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      await reconcile();
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reconcile]);

  async function send(content: string, images: File[]) {
    if (!session) throw new Error("Your authentication session has expired.");
    setSending(true);
    try {
      const message = await sendPatientConsultationMessage(
        session.access_token,
        consultationId,
        content,
        images,
      );
      setMessages((current) => mergeConsultationMessages(current, [message]));
    } finally {
      setSending(false);
    }
  }

  if (loading && !consultation) return <LoadingPanel label="Loading your online consultation..." />;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading eyebrow="Online consultation" title={consultation?.doctorName ?? "Consultation room"}
        backHref="/patient/appointments" backLabel="Back to online consultations"
        description="Your authenticated consultation room and persistent care conversation." />
      <div className="mt-7"><InlineError message={error} /></div>

      {consultation ? (
        <>
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="font-semibold text-teal-700">{consultation.specializationName}</p>
                <p className="mt-1 text-sm text-slate-600">Affiliated hospital: {consultation.hospitalName}</p>
              </div>
              <ConsultationStatusBadge status={consultation.status} />
            </div>
            <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Scheduled" value={formatAppointmentTime(consultation.scheduledStart)} />
              <Detail label="Department" value={consultation.departmentName} />
              <Detail label="Reason for consultation" value={consultation.symptoms.reasonForVisit} />
              <Detail label="Submitted symptoms" value={consultation.symptoms.symptoms} />
              <Detail label="Symptom duration" value={consultation.symptoms.symptomDuration} />
              <Detail label="Additional notes" value={consultation.symptoms.additionalNotes} />
            </dl>
          </section>

          {consultation.paymentSummaries.map((summary) => (
            <div key={summary.prescriptionId} className={`mt-8 overflow-hidden rounded-2xl border shadow-sm ${summary.doctorPaymentStatus === "CONFIRMED" || summary.doctorFeeAmount === 0 ? "border-emerald-200 bg-white" : "border-slate-200 bg-white"}`}>
              <div className={`border-b px-6 py-4 ${summary.doctorPaymentStatus === "CONFIRMED" || summary.doctorFeeAmount === 0 ? "border-emerald-100 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}>
                <h3 className="font-semibold text-slate-900">
                  Prescription Issued
                </h3>
              </div>
              <div className="p-6">
                {summary.doctorFeeAmount > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-slate-500">Consultation Fee</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">{summary.doctorFeeCurrency} {Number(summary.doctorFeeAmount).toFixed(2)}</p>
                    </div>

                    {summary.doctorPaymentStatus !== "CONFIRMED" ? (
                      <div>
                        <p className="font-semibold text-slate-900 mb-2">Payment Details</p>
                        <div className="grid gap-1.5 text-sm text-slate-600">
                          <div className="grid grid-cols-[130px_1fr]"><span className="font-medium text-slate-500">Account Holder:</span> <span>{summary.doctorBankAccountHolder || "N/A"}</span></div>
                          <div className="grid grid-cols-[130px_1fr]"><span className="font-medium text-slate-500">Bank:</span> <span>{summary.doctorBankName || "N/A"}</span></div>
                          <div className="grid grid-cols-[130px_1fr]"><span className="font-medium text-slate-500">Branch:</span> <span>{summary.doctorBankBranch || "N/A"}</span></div>
                          <div className="grid grid-cols-[130px_1fr]"><span className="font-medium text-slate-500">Account Number:</span> <span>{summary.doctorBankAccountNumber || "N/A"}</span></div>
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${summary.doctorPaymentStatus === "CONFIRMED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        Status: {summary.doctorPaymentStatus === "CONFIRMED" ? "Payment Confirmed" : "Awaiting Doctor Confirmation"}
                      </span>
                      {summary.doctorPaymentStatus === "CONFIRMED" && (
                        <p className="mt-2 text-sm text-slate-600">You can now access your prescription.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">Your doctor has issued a prescription with no consultation fee required. You can now access your prescription.</p>
                )}
              </div>
            </div>
          ))}

          {consultation.status === "CANCELLED" ? (
            <ConsultationCancellationPanel
              appointmentStatus={consultation.appointmentStatus}
              cancellationReason={consultation.cancellationReason}
              viewer="PATIENT"
            />
          ) : null}

          <div className="mt-8">
            <ConsultationChat messages={messages} currentSender="PATIENT"
              consultationStatus={consultation.status} liveStatus={liveStatus}
              sending={sending} onSend={send} />
          </div>
        </>
      ) : null}
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return <div><dt className="font-medium text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-slate-950">{value || "Not provided"}</dd></div>;
}

export default function PatientConsultationPage() {
  return <ProtectedRoute roles={["PATIENT"]}><PatientConsultationContent /></ProtectedRoute>;
}

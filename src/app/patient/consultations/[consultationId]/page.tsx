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

          {consultation.paymentSummary && consultation.paymentSummary.doctorFeeAmount > 0 ? (
            <section className={`mt-8 rounded-3xl border p-6 shadow-sm sm:p-8 ${consultation.paymentSummary.doctorPaymentStatus === "CONFIRMED" ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Consultation Fee</p>
              <h2 className="mt-2 text-3xl font-semibold">{consultation.paymentSummary.doctorFeeCurrency} {Number(consultation.paymentSummary.doctorFeeAmount).toFixed(2)}</h2>
              <p className="mt-3 text-sm">
                {consultation.paymentSummary.doctorPaymentStatus === "CONFIRMED"
                  ? `Payment confirmed${consultation.paymentSummary.paymentConfirmedAt ? ` ${new Date(consultation.paymentSummary.paymentConfirmedAt).toLocaleString()}` : ""}. You can now access your prescription.`
                  : "Awaiting doctor's manual confirmation. Your prescription remains locked until the doctor confirms receipt of the fee."}
              </p>
            </section>
          ) : null}

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

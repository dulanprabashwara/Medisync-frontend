"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Info, Receipt } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ConsultationCancellationPanel } from "@/components/consultation-cancellation-panel";
import { ConsultationChat } from "@/components/consultation-chat";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { SectionCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useConsultationEvents } from "@/hooks/use-consultation-events";
import {
  getPatientConsultation,
  getPatientConsultationMessages,
  sendPatientConsultationMessage,
} from "@/lib/api";
import { mergeConsultationMessages } from "@/lib/consultation-messages";
import type { ConsultationDetails, ConsultationEvent, ConsultationMessage } from "@/types/consultations";

export default function PatientConsultationPage() {
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

  if (loading && !consultation) {
    return (
      <ProtectedRoute roles={["PATIENT"]}>
        <LoadingPanel label="Loading your online consultation..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["PATIENT"]}>
      <div className="flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)]">
        <div className="shrink-0 mb-6">
          <PortalHeading 
            eyebrow="Workspace" 
            title={consultation?.doctorName ?? "Consultation Room"}
            backHref="/patient/appointments" 
            backLabel="Back to consultations"
            description="Your authenticated consultation room and persistent care conversation." 
          />
          {error && <Alert tone="error">{error}</Alert>}
        </div>

        {consultation && (
          <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
            {/* Mobile order: right rail first, then chat */}
            <div className="lg:order-2 lg:col-span-1 space-y-6 overflow-y-auto pr-2">
              <SectionCard>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-semibold text-slate-950 text-lg">{consultation.doctorName}</h2>
                    <p className="text-teal-700 text-sm font-medium">{consultation.specializationName}</p>
                  </div>
                </div>
                
                <dl className="grid gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500 mb-1">Status</dt>
                    <dd>
                      <StatusBadge tone={
                        consultation.status === "SCHEDULED" ? "success" : 
                        consultation.status === "IN_PROGRESS" ? "info" : 
                        consultation.status === "COMPLETED" ? "neutral" : "error"
                      }>
                        {consultation.status === "SCHEDULED" ? "Scheduled" :
                         consultation.status === "IN_PROGRESS" ? "In Progress" :
                         consultation.status === "COMPLETED" ? "Completed" : "Cancelled"}
                      </StatusBadge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-1">Scheduled Date & Time</dt>
                    <dd className="font-medium text-slate-900">{formatAppointmentTime(consultation.scheduledStart)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-1">Hospital</dt>
                    <dd className="font-medium text-slate-900">{consultation.hospitalName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-1">Reason for visit</dt>
                    <dd className="font-medium text-slate-900">{consultation.symptoms.reasonForVisit}</dd>
                  </div>
                </dl>
              </SectionCard>

              {consultation.status === "SCHEDULED" && (
                <Alert tone="success" icon={Info}>
                  Your consultation is scheduled. You can message your doctor here if needed.
                </Alert>
              )}
              {consultation.status === "IN_PROGRESS" && (
                <Alert tone="info" icon={Info}>
                  Consultation in progress.
                </Alert>
              )}
              {consultation.status === "COMPLETED" && (
                <Alert tone="neutral" icon={Info}>
                  Consultation completed. You can continue using this chat for related questions.
                </Alert>
              )}

              {consultation.paymentSummaries.map((summary) => (
                <SectionCard key={summary.prescriptionId} className={`
                  ${summary.doctorPaymentStatus === "CONFIRMED" || summary.doctorFeeAmount === 0 
                    ? "border-emerald-200" 
                    : "border-amber-200"}
                `}>
                  <div className="flex items-center gap-2 mb-4 text-slate-900 font-semibold">
                    <Receipt className="size-5" />
                    Prescription Issued
                  </div>

                  {summary.doctorFeeAmount > 0 ? (
                    <div className="space-y-5">
                      <div>
                        <p className="text-sm text-slate-500">Consultation Fee</p>
                        <p className="mt-1 text-xl font-semibold text-slate-900">{summary.doctorFeeCurrency} {Number(summary.doctorFeeAmount).toFixed(2)}</p>
                      </div>

                      {summary.doctorPaymentStatus !== "CONFIRMED" ? (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="font-semibold text-slate-900 mb-3 text-sm">Payment Details</p>
                          <div className="space-y-2 text-sm text-slate-600">
                            <div className="grid grid-cols-[110px_1fr]"><span className="font-medium text-slate-500">Account Holder:</span> <span>{summary.doctorBankAccountHolder || "N/A"}</span></div>
                            <div className="grid grid-cols-[110px_1fr]"><span className="font-medium text-slate-500">Bank:</span> <span>{summary.doctorBankName || "N/A"}</span></div>
                            <div className="grid grid-cols-[110px_1fr]"><span className="font-medium text-slate-500">Branch:</span> <span>{summary.doctorBankBranch || "N/A"}</span></div>
                            <div className="grid grid-cols-[110px_1fr]"><span className="font-medium text-slate-500">Account Number:</span> <span>{summary.doctorBankAccountNumber || "N/A"}</span></div>
                          </div>
                        </div>
                      ) : null}

                      <div className="pt-2">
                        <StatusBadge tone={summary.doctorPaymentStatus === "CONFIRMED" ? "success" : "warning"} className="w-full justify-center text-sm py-1.5">
                          {summary.doctorPaymentStatus === "CONFIRMED" ? "Payment Confirmed" : "Awaiting Doctor Confirmation"}
                        </StatusBadge>
                        
                        {summary.doctorPaymentStatus === "CONFIRMED" ? (
                          <div className="mt-4">
                            <Button asChild className="w-full">
                              <Link href={`/patient/prescriptions/${summary.prescriptionId}`}>
                                View Prescription
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-amber-700 font-medium text-center bg-amber-50 rounded-lg p-2 border border-amber-100">
                            After making the payment, send your receipt through this consultation chat.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">No consultation payment is required.</p>
                      <Button asChild className="w-full">
                        <Link href={`/patient/prescriptions/${summary.prescriptionId}`}>
                          View Prescription
                        </Link>
                      </Button>
                    </div>
                  )}
                </SectionCard>
              ))}

              {consultation.status === "CANCELLED" && (
                <ConsultationCancellationPanel
                  appointmentStatus={consultation.appointmentStatus}
                  cancellationReason={consultation.cancellationReason}
                  viewer="PATIENT"
                />
              )}
            </div>

            <div className="lg:order-1 lg:col-span-2 min-h-125 flex flex-col pb-8 lg:pb-0">
              <ConsultationChat 
                messages={messages} 
                currentSender="PATIENT"
                consultationStatus={consultation.status} 
                liveStatus={liveStatus}
                sending={sending} 
                onSend={send} 
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

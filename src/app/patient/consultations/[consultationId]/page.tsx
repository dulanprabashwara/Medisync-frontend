"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Info, Receipt, PanelRight } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ConsultationCancellationPanel } from "@/components/consultation-cancellation-panel";
import { ConsultationChat } from "@/components/consultation-chat";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading, formatAppointmentRange } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { SectionCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { VideoRoom, PatientVideoButton } from "@/components/video-room";
import { useNotifications } from "@/components/notifications/notification-provider";
import { useConsultationEvents } from "@/hooks/use-consultation-events";
import {
  getPatientConsultation,
  getPatientConsultationMessages,
  sendPatientConsultationMessage,
  deletePatientConsultationMessage,
  patientJoinVideo,
  getPatientVideoStatus,
  notifyPaymentSent,
} from "@/lib/api";
import toast from "react-hot-toast";
import type { VideoTokenResponse } from "@/lib/api";
import { mergeConsultationMessages } from "@/lib/consultation-messages";
import { formatDoctorName } from "@/lib/formatters";
import type {
  ConsultationDetails,
  ConsultationEvent,
  ConsultationMessage,
} from "@/types/consultations";

export default function PatientConsultationPage() {
  const { consultationId } = useParams<{ consultationId: string }>();
  const { session } = useAuth();
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(
    null,
  );
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Desktop sidebar state
  const [detailsOpen, setDetailsOpen] = useState(true);

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Video state
  const [videoActive, setVideoActive] = useState(false);
  const [videoToken, setVideoToken] = useState<VideoTokenResponse | null>(null);
  const [videoBusy, setVideoBusy] = useState(false);
  const [notifyingPayment, setNotifyingPayment] = useState(false);
  const { latestNotifications } = useNotifications();

  const reconcile = useCallback(async () => {
    if (!session || !consultationId) return;
    try {
      const [details, history] = await Promise.all([
        getPatientConsultation(session.access_token, consultationId),
        getPatientConsultationMessages(session.access_token, consultationId),
      ]);
      setConsultation(details);
      setMessages((current) =>
        mergeConsultationMessages(current, history.content),
      );
    } catch (reconcileError) {
      setError(
        reconcileError instanceof Error
          ? reconcileError.message
          : "The consultation could not be refreshed.",
      );
    }
  }, [consultationId, session]);

  const handleEvent = useCallback(
    (event: ConsultationEvent) => {
      if (event.eventType === "NEW_MESSAGE" && event.message) {
        setMessages((current) =>
          mergeConsultationMessages(current, [event.message!]),
        );
      }
      if (event.eventType === "CONSULTATION_STATUS_CHANGED" && event.status) {
        setConsultation((current) =>
          current
            ? {
                ...current,
                status: event.status!,
                chatEnabled: event.status !== "CANCELLED",
              }
            : current,
        );
        void reconcile();
      }
      if (event.eventType === "PAYMENT_STATUS_CHANGED") {
        void reconcile();
      }
      if (event.eventType === "MESSAGE_DELETED" && event.message) {
        setMessages((current) =>
          current.map((msg) =>
            msg.messageId === event.message!.messageId ? event.message! : msg,
          ),
        );
      }
    },
    [reconcile],
  );

  const liveStatus = useConsultationEvents(
    consultationId,
    handleEvent,
    reconcile,
  );

  const handleNotifyPaymentSent = async () => {
    if (!session || !consultationId) return;
    setNotifyingPayment(true);
    try {
      await notifyPaymentSent(session.access_token, consultationId);
      toast.success("Doctor has been notified that your payment was sent.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to notify doctor.",
      );
    } finally {
      setNotifyingPayment(false);
    }
  };

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

  async function handleDelete(messageId: string) {
    if (!session) throw new Error("Your authentication session has expired.");
    await deletePatientConsultationMessage(
      session.access_token,
      consultationId,
      messageId,
    );
  }

  // ── Video handlers ──────────────────────────────────────────────────

  async function handleJoinVideo() {
    if (!session) return;
    setVideoBusy(true);
    try {
      const tokenResp = await patientJoinVideo(
        session.access_token,
        consultationId,
      );
      setVideoToken(tokenResp);
    } catch (videoError) {
      setError(
        videoError instanceof Error
          ? videoError.message
          : "Could not join the video call.",
      );
    } finally {
      setVideoBusy(false);
    }
  }

  function handleLeaveVideo() {
    setVideoToken(null);
  }

  // Fetch video status once on load to reflect current state
  useEffect(() => {
    if (!session || !consultationId || consultation?.status !== "IN_PROGRESS") {
      return;
    }
    async function fetchVideoStatus() {
      try {
        const status = await getPatientVideoStatus(
          session!.access_token,
          consultationId,
        );
        setVideoActive(status.active);
      } catch {
        /* ignore */
      }
    }
    void fetchVideoStatus();
  }, [session, consultationId, consultation?.status]);

  // Listen to the realtime notification for VIDEO_CALL_STARTED
  useEffect(() => {
    if (!session || !consultationId || consultation?.status !== "IN_PROGRESS") {
      return;
    }
    const hasNewVideoStart = latestNotifications.some(
      (n) =>
        n.type === "VIDEO_CALL_STARTED" &&
        !n.read &&
        n.entityId === consultationId,
    );
    if (hasNewVideoStart) {
      async function fetchVideoStatus() {
        try {
          const status = await getPatientVideoStatus(
            session!.access_token,
            consultationId,
          );
          setVideoActive(status.active);
        } catch {
          /* ignore */
        }
      }
      void fetchVideoStatus();
    }
  }, [latestNotifications, session, consultationId, consultation?.status]);

  if (loading && !consultation) {
    return (
      <ProtectedRoute roles={["PATIENT"]}>
        <LoadingPanel label="Loading your online consultation..." />
      </ProtectedRoute>
    );
  }

  const detailsContent = consultation && (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-slate-950 text-lg">
              {formatDoctorName(consultation.doctorName)}
            </h2>
            <p className="text-teal-700 text-sm font-medium">
              {consultation.specializationName}
            </p>
          </div>
        </div>

        <dl className="grid gap-4 text-sm">
          <div>
            <dt className="text-slate-500 mb-1">Status</dt>
            <dd>
              <StatusBadge
                tone={
                  consultation.status === "SCHEDULED"
                    ? "success"
                    : consultation.status === "IN_PROGRESS"
                      ? "info"
                      : consultation.status === "COMPLETED"
                        ? "neutral"
                        : "error"
                }
              >
                {consultation.status === "SCHEDULED"
                  ? "Scheduled"
                  : consultation.status === "IN_PROGRESS"
                    ? "In Progress"
                    : consultation.status === "COMPLETED"
                      ? "Completed"
                      : "Cancelled"}
              </StatusBadge>
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 mb-1">Scheduled Date & Time</dt>
            <dd className="font-medium text-slate-900">
              {formatAppointmentRange(
                consultation.scheduledStart,
                consultation.scheduledEnd,
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 mb-1">Doctor phone</dt>
            <dd className="font-medium text-slate-900">
              {consultation.doctorPhone ? (
                <a
                  className="text-teal-700 hover:text-teal-900"
                  href={`tel:${consultation.doctorPhone}`}
                >
                  {consultation.doctorPhone}
                </a>
              ) : (
                "Not provided"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 mb-1">Hospital</dt>
            <dd className="font-medium text-slate-900">
              {consultation.hospitalName}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 mb-1">Reason for visit</dt>
            <dd className="font-medium text-slate-900">
              {consultation.symptoms.reasonForVisit}
            </dd>
          </div>
        </dl>
      </SectionCard>

      {consultation.status === "SCHEDULED" && (
        <Alert tone="success" icon={Info}>
          Your consultation is scheduled. You can message your doctor here if
          needed.
        </Alert>
      )}
      {consultation.status === "IN_PROGRESS" && (
        <Alert tone="info" icon={Info}>
          Consultation in progress.
        </Alert>
      )}

      {/* Video Call Section */}
      {(consultation.status === "IN_PROGRESS" ||
        consultation.status === "SCHEDULED") && (
        <SectionCard className="border-teal-200 bg-linear-to-br from-teal-50 to-emerald-50">
          <h3 className="font-semibold text-teal-900 mb-3">
            Video Consultation
          </h3>
          <PatientVideoButton
            consultationStatus={consultation.status}
            videoActive={videoActive}
            busy={videoBusy ? "video" : null}
            scheduledStart={consultation.scheduledStart}
            onJoin={() => void handleJoinVideo()}
          />
        </SectionCard>
      )}
      {consultation.status === "COMPLETED" && (
        <Alert tone="neutral" icon={Info}>
          Consultation completed. You can continue using this chat for related
          questions.
        </Alert>
      )}

      {consultation.paymentSummaries.map((summary) => (
        <SectionCard
          key={summary.prescriptionId}
          className={`
          ${
            summary.doctorPaymentStatus === "CONFIRMED" ||
            summary.doctorFeeAmount === 0
              ? "border-emerald-200"
              : "border-amber-200"
          }
        `}
        >
          <div className="flex items-center gap-2 mb-4 text-slate-900 font-semibold">
            <Receipt className="size-5" />
            Prescription Issued
          </div>

          {summary.doctorFeeAmount > 0 ? (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-slate-500">Consultation Fee</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {summary.doctorFeeCurrency}{" "}
                  {Number(summary.doctorFeeAmount).toFixed(2)}
                </p>
              </div>

              {summary.doctorPaymentStatus !== "CONFIRMED" ? (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="font-semibold text-slate-900 mb-3 text-sm">
                    Payment Details
                  </p>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="grid grid-cols-[110px_1fr]">
                      <span className="font-medium text-slate-500">
                        Account Holder:
                      </span>{" "}
                      <span>{summary.doctorBankAccountHolder || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-[110px_1fr]">
                      <span className="font-medium text-slate-500">Bank:</span>{" "}
                      <span>{summary.doctorBankName || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-[110px_1fr]">
                      <span className="font-medium text-slate-500">
                        Branch:
                      </span>{" "}
                      <span>{summary.doctorBankBranch || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-[110px_1fr]">
                      <span className="font-medium text-slate-500">
                        Account Number:
                      </span>{" "}
                      <span>{summary.doctorBankAccountNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="pt-2">
                <StatusBadge
                  tone={
                    summary.doctorPaymentStatus === "CONFIRMED"
                      ? "success"
                      : "warning"
                  }
                  className="w-full justify-center text-sm py-1.5"
                >
                  {summary.doctorPaymentStatus === "CONFIRMED"
                    ? "Payment Confirmed"
                    : "Awaiting Doctor Confirmation"}
                </StatusBadge>

                {summary.doctorPaymentStatus === "CONFIRMED" ? (
                  <div className="mt-4">
                    <Link
                      href={`/patient/prescriptions/${summary.prescriptionId}`}
                      className={`${buttonVariants("primary")} w-full`}
                    >
                      View Prescription
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 bg-amber-50 rounded-xl p-3 border border-amber-100 space-y-3">
                    <p className="text-xs text-amber-700 font-medium text-center">
                      After making the payment, send your receipt through this
                      consultation chat.
                    </p>
                    <button
                      onClick={handleNotifyPaymentSent}
                      disabled={notifyingPayment}
                      className="w-full text-xs py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                    >
                      {notifyingPayment
                        ? "Notifying..."
                        : "Notify Doctor that Payment is Sent"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                No consultation payment is required.
              </p>
              <Link
                href={`/patient/prescriptions/${summary.prescriptionId}`}
                className={`${buttonVariants("primary")} w-full`}
              >
                View Prescription
              </Link>
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
  );

  return (
    <ProtectedRoute roles={["PATIENT"]}>
      <div className="flex flex-col h-full pt-6 sm:pt-8">
        <div className="shrink-0 px-4 sm:px-6 lg:px-8">
          <PortalHeading
            eyebrow="Online Consultation"
            className="mb-6"
            title={
              consultation
                ? formatDoctorName(consultation.doctorName)
                : "Consultation Room"
            }
            backHref="/patient/appointments"
            backLabel="Back to consultations"
            description="Chat with your doctor and review consultation details."
            action={
              consultation ? (
                <div className="w-full sm:w-auto">
                  {/* Desktop Details Toggle */}
                  <Button
                    variant="secondary"
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    className="hidden lg:flex"
                    aria-expanded={detailsOpen}
                    aria-controls="consultation-details-sidebar"
                  >
                    <PanelRight className="size-4 mr-2" />
                    {detailsOpen ? "Hide Details" : "Show Details"}
                  </Button>

                  {/* Mobile Details Toggle */}
                  <Button
                    variant="secondary"
                    onClick={() => setMobileDrawerOpen(true)}
                    className="lg:hidden w-full sm:w-auto"
                    aria-expanded={mobileDrawerOpen}
                  >
                    <Info className="size-4 mr-2" />
                    View Details
                  </Button>
                </div>
              ) : null
            }
          />
        </div>
        {error && (
          <Alert tone="error" className="mb-6 shrink-0 mx-4 sm:mx-6 lg:mx-8">
            {error}
          </Alert>
        )}

        {consultation && (
          <div className="flex-1 flex gap-6 min-h-0 overflow-hidden relative px-4 sm:px-6 lg:px-8 bg-white lg:bg-transparent">
            {/* Main Chat Area */}
            <div
              className={`flex-1 flex flex-col min-h-0 transition-all duration-200 overflow-hidden`}
            >
              <ConsultationChat
                messages={messages}
                currentSender="PATIENT"
                consultationStatus={consultation.status}
                liveStatus={liveStatus}
                sending={sending}
                onSend={send}
                onDelete={handleDelete}
              />
            </div>

            {/* Desktop Right Sidebar */}
            <div
              id="consultation-details-sidebar"
              className={`hidden lg:block shrink-0 transition-all duration-200 overflow-y-auto hide-scrollbar h-full ${
                detailsOpen ? "w-90 opacity-100 mr-0" : "w-0 opacity-0 -mr-6"
              }`}
            >
              <div className="w-90 pr-2">{detailsContent}</div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer (Dialog) */}
      <Dialog
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Consultation Details"
        className="max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col w-full sm:w-[90vw]"
      >
        <div className="mt-2 flex-1 overflow-y-auto hide-scrollbar">
          {detailsContent}
        </div>
      </Dialog>

      {/* Video Room Overlay */}
      {videoToken && (
        <VideoRoom
          token={videoToken.token}
          serverUrl={videoToken.serverUrl}
          onLeave={handleLeaveVideo}
        />
      )}
    </ProtectedRoute>
  );
}

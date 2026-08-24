"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ConsultationCancellationPanel } from "@/components/consultation-cancellation-panel";
import { ConsultationChat } from "@/components/consultation-chat";
import { DoctorConsultationPrescriptions } from "@/components/doctor-consultation-prescriptions";
import { LoadingPanel } from "@/components/loading-panel";
import {
  ConsultationStatusBadge,
  InlineError,
  formatAppointmentTime,
} from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { useConsultationEvents } from "@/hooks/use-consultation-events";
import {
  completeDoctorConsultation,
  confirmPrescriptionPayment,
  getDoctorClinicalNote,
  getDoctorConsultation,
  getDoctorConsultationMessages,
  sendDoctorConsultationMessage,
  startDoctorConsultation,
  updateDoctorClinicalNote,
  deleteDoctorConsultationMessage,
} from "@/lib/api";
import { mergeConsultationMessages } from "@/lib/consultation-messages";
import type {
  ClinicalNote,
  ConsultationDetails,
  ConsultationEvent,
  ConsultationMessage,
} from "@/types/consultations";
import { ChevronLeft } from "lucide-react";

type WorkspaceTab = "info" | "note" | "prescription";

function DoctorConsultationContent() {
  const router = useRouter();
  const { consultationId } = useParams<{ consultationId: string }>();
  const { session } = useAuth();
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(
    null,
  );
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [clinicalNote, setClinicalNote] = useState<ClinicalNote | null>(null);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("info");

  const reconcile = useCallback(async () => {
    if (!session || !consultationId) return;
    try {
      const [details, history] = await Promise.all([
        getDoctorConsultation(session.access_token, consultationId),
        getDoctorConsultationMessages(session.access_token, consultationId),
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
            msg.messageId === event.message!.messageId ? event.message! : msg
          )
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

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!session || !consultationId) return;
      setLoading(true);
      setError(null);
      try {
        const [details, history, note] = await Promise.all([
          getDoctorConsultation(session.access_token, consultationId),
          getDoctorConsultationMessages(session.access_token, consultationId),
          getDoctorClinicalNote(session.access_token, consultationId),
        ]);
        setConsultation(details);
        setMessages(history.content);
        setClinicalNote(note);
        setNoteText(note.noteText);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "The consultation room could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [consultationId, session]);

  async function send(content: string, images: File[]) {
    if (!session) throw new Error("Your authentication session has expired.");
    setSending(true);
    try {
      const created = await sendDoctorConsultationMessage(
        session.access_token,
        consultationId,
        content,
        images,
      );
      setMessages((current) => mergeConsultationMessages(current, [created]));
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(messageId: string) {
    if (!session) throw new Error("Your authentication session has expired.");
    await deleteDoctorConsultationMessage(session.access_token, consultationId, messageId);
  }

  async function start() {
    if (!session) return;
    setBusy("start");
    setError(null);
    setMessage(null);
    try {
      setConsultation(
        await startDoctorConsultation(session.access_token, consultationId),
      );
      setMessage("The consultation is now in progress.");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "The consultation could not be started.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function complete() {
    if (!session) return;
    const confirmed = window.confirm(
      "Completing this consultation will finalize the current clinical note. The chat will remain available.",
    );
    if (!confirmed) return;
    setBusy("complete");
    setError(null);
    setMessage(null);
    try {
      if (noteText !== (clinicalNote?.noteText ?? "")) {
        const saved = await updateDoctorClinicalNote(
          session.access_token,
          consultationId,
          noteText,
        );
        setClinicalNote(saved);
        setNoteText(saved.noteText);
      }
      const completed = await completeDoctorConsultation(
        session.access_token,
        consultationId,
      );
      setConsultation(completed);
      setClinicalNote((current) =>
        current ? { ...current, finalized: true } : current,
      );
      setMessage(
        "The consultation is complete. Messaging remains available for related questions.",
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "The consultation could not be completed.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function saveNote() {
    if (!session) return;
    setBusy("note");
    setError(null);
    setMessage(null);
    try {
      const saved = await updateDoctorClinicalNote(
        session.access_token,
        consultationId,
        noteText,
      );
      setClinicalNote(saved);
      setNoteText(saved.noteText);
      setMessage("Private clinical note saved.");
    } catch (noteError) {
      setError(
        noteError instanceof Error
          ? noteError.message
          : "The clinical note could not be saved.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function confirmPayment(prescriptionId: string) {
    if (!session || !consultation?.paymentSummaries) return;
    const confirmed = window.confirm(
      "Confirm that you received this consultation fee? This action is recorded in the audit log.",
    );
    if (!confirmed) return;
    setBusy("payment-" + prescriptionId);
    setError(null);
    setMessage(null);
    try {
      await confirmPrescriptionPayment(session.access_token, prescriptionId);
      setMessage(
        "Consultation fee confirmed. The patient can now generate the prescription QR.",
      );
      await reconcile();
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Payment could not be confirmed.",
      );
    } finally {
      setBusy(null);
    }
  }

  if (loading && !consultation)
    return <LoadingPanel label="Loading the online consultation..." />;
    
  const noteReadOnly =
    consultation?.status === "COMPLETED" ||
    consultation?.status === "CANCELLED";

  if (!consultation) {
    return (
      <main className="flex h-full items-center justify-center bg-slate-50">
        <div className="max-w-md rounded-2xl bg-white p-6 shadow-sm text-center">
          <InlineError message={error || "Consultation not found."} />
          <button onClick={() => router.push("/doctor/appointments")} className="mt-4 text-teal-700 hover:underline">
            Go back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full flex-col lg:flex-row bg-slate-50 overflow-hidden">
      {/* Left Pane: Chat */}
      <div className="flex h-1/2 w-full flex-col bg-white lg:h-full lg:w-3/5">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 shadow-sm z-10 shrink-0">
          <button
            onClick={() => router.push("/doctor/appointments")}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Back to online consultations"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-slate-950 line-clamp-1">
              Patient: {consultation.patientName}
            </h1>
            <p className="text-xs text-slate-500 line-clamp-1">
              {consultation.specializationName} · Scheduled {formatAppointmentTime(consultation.scheduledStart)}
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <ConsultationChat
            messages={messages}
            currentSender="DOCTOR"
            consultationStatus={consultation.status}
            liveStatus={liveStatus}
            sending={sending}
            onSend={send}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Right Pane: Workspace Tools */}
      <div className="flex h-1/2 w-full flex-col border-t border-slate-200 bg-slate-50 lg:h-full lg:w-2/5 lg:border-l lg:border-t-0 shadow-[-4px_0_12px_rgba(0,0,0,0.02)] z-20">
        <div className="flex border-b border-slate-200 bg-white px-2 pt-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setWorkspaceTab("info")}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${workspaceTab === "info" ? "border-teal-700 text-teal-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
          >
            Info
          </button>
          <button
            onClick={() => setWorkspaceTab("note")}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${workspaceTab === "note" ? "border-amber-700 text-amber-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
          >
            Clinical Note
          </button>
          <button
            onClick={() => setWorkspaceTab("prescription")}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${workspaceTab === "prescription" ? "border-teal-700 text-teal-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
          >
            Prescription
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
          {error && workspaceTab === "info" && <InlineError message={error} />}
          {message && workspaceTab === "info" && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-sm">
              {message}
            </div>
          )}

          {workspaceTab === "info" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Consultation Status</h2>
                  <ConsultationStatusBadge status={consultation.status} />
                </div>
                
                <div className="flex flex-col gap-3">
                  {consultation.status === "SCHEDULED" ? (
                    <button
                      className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60 transition-colors"
                      disabled={busy !== null}
                      onClick={() => void start()}
                    >
                      {busy === "start" ? "Starting..." : "Start Consultation"}
                    </button>
                  ) : null}
                  {consultation.status === "IN_PROGRESS" ? (
                    <button
                      className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors"
                      disabled={busy !== null}
                      onClick={() => void complete()}
                    >
                      {busy === "complete"
                        ? "Completing..."
                        : "Complete Consultation"}
                    </button>
                  ) : null}
                  {consultation.status === "COMPLETED" ? (
                    <p className="text-sm font-medium text-emerald-700">
                      Consultation completed
                    </p>
                  ) : null}
                  {consultation.status === "CANCELLED" ? (
                    <p className="text-sm font-medium text-slate-600">
                      Consultation cancelled
                    </p>
                  ) : null}
                </div>
              </section>

              {consultation.status === "CANCELLED" ? (
                <ConsultationCancellationPanel
                  appointmentStatus={consultation.appointmentStatus}
                  cancellationReason={consultation.cancellationReason}
                  viewer="DOCTOR"
                />
              ) : null}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-4">Patient Information</h2>
                <dl className="space-y-4 text-sm">
                  <Detail
                    label="Reason for consultation"
                    value={consultation.symptoms.reasonForVisit}
                  />
                  <Detail
                    label="Submitted symptoms"
                    value={consultation.symptoms.symptoms}
                  />
                  <Detail
                    label="Symptom duration"
                    value={consultation.symptoms.symptomDuration}
                  />
                  <Detail
                    label="Additional notes"
                    value={consultation.symptoms.additionalNotes}
                  />
                </dl>
              </section>

              {consultation.paymentSummaries.map((summary) => (
                <section
                  key={summary.prescriptionId}
                  className={`overflow-hidden rounded-2xl border shadow-sm ${summary.doctorPaymentStatus === "CONFIRMED" || summary.doctorFeeAmount === 0 ? "border-emerald-200 bg-white" : "border-slate-200 bg-white"}`}
                >
                  <div
                    className={`border-b px-5 py-3 ${summary.doctorPaymentStatus === "CONFIRMED" || summary.doctorFeeAmount === 0 ? "border-emerald-100 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}
                  >
                    <h3 className="font-semibold text-slate-900">
                      Prescription Issued
                    </h3>
                  </div>
                  <div className="p-5">
                    {summary.doctorFeeAmount > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-500">Consultation Fee</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">
                            {summary.doctorFeeCurrency}{" "}
                            {Number(summary.doctorFeeAmount).toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${summary.doctorPaymentStatus === "CONFIRMED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                          >
                            {summary.doctorPaymentStatus === "CONFIRMED"
                              ? "Payment Confirmed"
                              : "Awaiting Confirmation"}
                          </span>
                          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                            {summary.doctorPaymentStatus === "CONFIRMED"
                              ? `Payment confirmed${summary.paymentConfirmedAt ? ` ${new Date(summary.paymentConfirmedAt).toLocaleString()}` : ""}. The patient's prescription QR is unlocked.`
                              : "Awaiting your manual confirmation. The patient's prescription QR remains locked until payment is confirmed."}
                          </p>
                        </div>

                        {summary.doctorPaymentStatus === "AWAITING_CONFIRMATION" &&
                        (consultation.status === "IN_PROGRESS" ||
                          consultation.status === "COMPLETED") ? (
                          <button
                            type="button"
                            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            disabled={busy !== null}
                            onClick={() =>
                              void confirmPayment(summary.prescriptionId)
                            }
                          >
                            {busy === "payment-" + summary.prescriptionId
                              ? "Confirming…"
                              : "Confirm Payment Received"}
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">
                        You have issued a prescription with no consultation fee
                        required.
                      </p>
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}

          {workspaceTab === "note" && (
            <section
              className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm h-full flex flex-col"
              aria-labelledby="clinical-note-heading"
            >
              <div className="shrink-0 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">
                  Doctor only
                </p>
                <h2
                  className="mt-1 text-lg font-semibold text-amber-950"
                  id="clinical-note-heading"
                >
                  Private Clinical Note
                </h2>
                <p className="mt-1 text-sm text-amber-900/80 leading-relaxed">
                  Visible only to you. Not included in patient chat.
                </p>
              </div>
              <div className="flex-1 flex flex-col min-h-75">
                <textarea
                  className="flex-1 w-full resize-none rounded-xl border border-amber-300 bg-white/80 px-4 py-3 text-sm text-slate-950 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 disabled:bg-amber-100/50 disabled:text-slate-500 transition-all placeholder:text-amber-900/40"
                  disabled={noteReadOnly || busy !== null}
                  id="clinical-note"
                  maxLength={20000}
                  onChange={(event) => setNoteText(event.target.value)}
                  value={noteText}
                  placeholder="Type your clinical observations here..."
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <span className="text-xs font-medium text-amber-800/70">
                    {noteText.length}/20000 chars<br className="sm:hidden" />
                    <span className="hidden sm:inline"> · </span>
                    {clinicalNote?.updatedAt
                      ? `Saved ${new Date(clinicalNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : "Unsaved"}
                  </span>
                  {!noteReadOnly ? (
                    <button
                      className="rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60 transition-colors shadow-sm"
                      disabled={busy !== null}
                      onClick={() => void saveNote()}
                    >
                      {busy === "note" ? "Saving..." : "Save Note"}
                    </button>
                  ) : (
                    <span className="text-sm font-semibold text-amber-900">
                      Note is locked.
                    </span>
                  )}
                </div>
              </div>
              {consultation.status === "IN_PROGRESS" ? (
                <div className="mt-5 shrink-0 rounded-xl bg-amber-100/50 px-4 py-3 text-xs font-medium leading-relaxed text-amber-900/80 border border-amber-200/50">
                  Completing this consultation will lock this note permanently.
                </div>
              ) : null}
            </section>
          )}

          {workspaceTab === "prescription" && session && consultationId && (
            <div className="pb-8">
               <DoctorConsultationPrescriptions
                 accessToken={session.access_token}
                 consultationId={typeof consultationId === 'string' ? consultationId : consultationId[0]}
                 consultationStatus={consultation.status}
               />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900 leading-relaxed">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export default function DoctorConsultationPage() {
  return (
    <ProtectedRoute roles={["DOCTOR"]}>
      <DoctorConsultationContent />
    </ProtectedRoute>
  );
}

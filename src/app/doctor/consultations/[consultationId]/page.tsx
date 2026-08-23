"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ConsultationCancellationPanel } from "@/components/consultation-cancellation-panel";
import { ConsultationChat } from "@/components/consultation-chat";
import { DoctorConsultationPrescriptions } from "@/components/doctor-consultation-prescriptions";
import { LoadingPanel } from "@/components/loading-panel";
import { ConsultationStatusBadge, InlineError, PortalHeading, formatAppointmentTime } from "@/components/portal-ui";
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
} from "@/lib/api";
import { mergeConsultationMessages } from "@/lib/consultation-messages";
import type { ClinicalNote, ConsultationDetails, ConsultationEvent, ConsultationMessage } from "@/types/consultations";

function DoctorConsultationContent() {
  const { consultationId } = useParams<{ consultationId: string }>();
  const { session } = useAuth();
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [clinicalNote, setClinicalNote] = useState<ClinicalNote | null>(null);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reconcile = useCallback(async () => {
    if (!session || !consultationId) return;
    try {
      const [details, history] = await Promise.all([
        getDoctorConsultation(session.access_token, consultationId),
        getDoctorConsultationMessages(session.access_token, consultationId),
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
        setError(loadError instanceof Error ? loadError.message : "The consultation room could not be loaded.");
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

  async function start() {
    if (!session) return;
    setBusy("start");
    setError(null);
    setMessage(null);
    try {
      setConsultation(await startDoctorConsultation(session.access_token, consultationId));
      setMessage("The consultation is now in progress.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The consultation could not be started.");
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
        const saved = await updateDoctorClinicalNote(session.access_token, consultationId, noteText);
        setClinicalNote(saved);
        setNoteText(saved.noteText);
      }
      const completed = await completeDoctorConsultation(session.access_token, consultationId);
      setConsultation(completed);
      setClinicalNote((current) => current ? { ...current, finalized: true } : current);
      setMessage("The consultation is complete. Messaging remains available for related questions.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The consultation could not be completed.");
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
      const saved = await updateDoctorClinicalNote(session.access_token, consultationId, noteText);
      setClinicalNote(saved);
      setNoteText(saved.noteText);
      setMessage("Private clinical note saved.");
    } catch (noteError) {
      setError(noteError instanceof Error ? noteError.message : "The clinical note could not be saved.");
    } finally {
      setBusy(null);
    }
  }

  async function confirmPayment(prescriptionId: string) {
    if (!session || !consultation?.paymentSummaries) return;
    const confirmed = window.confirm("Confirm that you received this consultation fee? This action is recorded in the audit log.");
    if (!confirmed) return;
    setBusy("payment-" + prescriptionId);
    setError(null);
    setMessage(null);
    try {
      await confirmPrescriptionPayment(session.access_token, prescriptionId);
      setMessage("Consultation fee confirmed. The patient can now generate the prescription QR.");
      await reconcile();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Payment could not be confirmed.");
    } finally {
      setBusy(null);
    }
  }

  if (loading && !consultation) return <LoadingPanel label="Loading the online consultation..." />;
  const noteReadOnly = consultation?.status === "COMPLETED" || consultation?.status === "CANCELLED";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading eyebrow="Online consultation" title={consultation ? `Patient: ${consultation.patientName}` : "Consultation room"}
        backHref="/doctor/appointments" backLabel="Back to online consultations"
        description="Manage this consultation lifecycle, authenticated chat, and your private clinical documentation." />
      <div className="mt-7 space-y-3">
        <InlineError message={error} />
        {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900" role="status">{message}</div> : null}
      </div>

      {consultation ? (
        <>
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-sm text-slate-600">Scheduled {formatAppointmentTime(consultation.scheduledStart)}</p>
                <p className="mt-1 text-sm text-slate-600">{consultation.specializationName} · {consultation.departmentName}</p>
              </div>
              <ConsultationStatusBadge status={consultation.status} />
            </div>
            <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Reason for consultation" value={consultation.symptoms.reasonForVisit} />
              <Detail label="Submitted symptoms" value={consultation.symptoms.symptoms} />
              <Detail label="Symptom duration" value={consultation.symptoms.symptomDuration} />
              <Detail label="Additional notes" value={consultation.symptoms.additionalNotes} />
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              {consultation.status === "SCHEDULED" ? (
                <button className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                  disabled={busy !== null} onClick={() => void start()}>
                  {busy === "start" ? "Starting..." : "Start Consultation"}
                </button>
              ) : null}
              {consultation.status === "IN_PROGRESS" ? (
                <button className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  disabled={busy !== null} onClick={() => void complete()}>
                  {busy === "complete" ? "Completing..." : "Complete Consultation"}
                </button>
              ) : null}
              {consultation.status === "COMPLETED" ? <p className="text-sm font-semibold text-emerald-700">Consultation completed</p> : null}
              {consultation.status === "CANCELLED" ? <p className="text-sm font-semibold text-slate-600">Consultation cancelled</p> : null}
            </div>
          </section>

          {consultation.status === "CANCELLED" ? (
            <ConsultationCancellationPanel
              appointmentStatus={consultation.appointmentStatus}
              cancellationReason={consultation.cancellationReason}
              viewer="DOCTOR"
            />
          ) : null}

          <div className="mt-8">
            <ConsultationChat messages={messages} currentSender="DOCTOR"
              consultationStatus={consultation.status} liveStatus={liveStatus}
              sending={sending} onSend={send} />
          </div>

          {session ? <DoctorConsultationPrescriptions accessToken={session.access_token} consultationId={consultationId} consultationStatus={consultation.status} /> : null}

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

                    <div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${summary.doctorPaymentStatus === "CONFIRMED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        Status: {summary.doctorPaymentStatus === "CONFIRMED" ? "Payment Confirmed" : "Awaiting Your Confirmation"}
                      </span>
                      <p className="mt-2 text-sm text-slate-600">
                        {summary.doctorPaymentStatus === "CONFIRMED"
                          ? `Payment confirmed${summary.paymentConfirmedAt ? ` ${new Date(summary.paymentConfirmedAt).toLocaleString()}` : ""}. The patient's prescription QR is unlocked.`
                          : "Awaiting your manual confirmation. The patient's prescription QR remains locked until payment is confirmed."}
                      </p>
                    </div>

                    {summary.doctorPaymentStatus === "AWAITING_CONFIRMATION" && (consultation.status === "IN_PROGRESS" || consultation.status === "COMPLETED") ? (
                      <button type="button" className="rounded-xl bg-amber-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-950 disabled:opacity-50"
                        disabled={busy !== null} onClick={() => void confirmPayment(summary.prescriptionId)}>
                        {busy === "payment-" + summary.prescriptionId ? "Confirming…" : "Confirm Payment Received"}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">You have issued a prescription with no consultation fee required.</p>
                )}
              </div>
            </div>
          ))}

          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8" aria-labelledby="clinical-note-heading">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Doctor only</p>
            <h2 className="mt-2 text-2xl font-semibold text-amber-950" id="clinical-note-heading">Private Clinical Note</h2>
            <p className="mt-2 text-sm text-amber-900">Visible only to you as the assigned doctor. It is never included in patient chat or patient consultation responses.</p>
            <label className="mt-5 block text-sm font-medium text-amber-950" htmlFor="clinical-note">Clinical documentation</label>
            <textarea className="mt-2 min-h-48 w-full resize-y rounded-xl border border-amber-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-600/10 disabled:bg-amber-100"
              disabled={noteReadOnly || busy !== null} id="clinical-note" maxLength={20000}
              onChange={(event) => setNoteText(event.target.value)} value={noteText} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-amber-800">{noteText.length}/20000 · {clinicalNote?.updatedAt ? `Last saved ${new Date(clinicalNote.updatedAt).toLocaleString()}` : "Not saved yet"}</span>
              {!noteReadOnly ? (
                <button className="rounded-xl bg-amber-800 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60"
                  disabled={busy !== null} onClick={() => void saveNote()}>
                  {busy === "note" ? "Saving..." : "Save Note"}
                </button>
              ) : <span className="text-sm font-semibold text-amber-900">Clinical note is read-only.</span>}
            </div>
            {consultation.status === "IN_PROGRESS" ? (
              <p className="mt-5 rounded-2xl bg-white/70 p-4 text-sm text-amber-950">
                Completing this consultation will finalize the current clinical note. The chat will remain available.
              </p>
            ) : null}
          </section>
        </>
      ) : null}
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return <div><dt className="font-medium text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-slate-950">{value || "Not provided"}</dd></div>;
}

export default function DoctorConsultationPage() {
  return <ProtectedRoute roles={["DOCTOR"]}><DoctorConsultationContent /></ProtectedRoute>;
}

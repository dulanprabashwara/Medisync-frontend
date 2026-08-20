"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { InlineError } from "@/components/portal-ui";
import type { LiveConnectionStatus } from "@/hooks/use-consultation-events";
import type { ConsultationMessage, ConsultationSenderType, ConsultationStatus } from "@/types/consultations";

const MAX_MESSAGE_LENGTH = 4000;

export function ConsultationChat({
  messages,
  currentSender,
  consultationStatus,
  liveStatus,
  sending,
  onSend,
}: {
  messages: ConsultationMessage[];
  currentSender: ConsultationSenderType;
  consultationStatus: ConsultationStatus;
  liveStatus: LiveConnectionStatus;
  sending: boolean;
  onSend: (content: string) => Promise<void>;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const readOnly = consultationStatus === "CANCELLED";

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const message = content.trim();
    if (!message) {
      setError("Enter a message before sending.");
      return;
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      setError("Messages must not exceed 4000 characters.");
      return;
    }
    setError(null);
    try {
      await onSend(message);
      setContent("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "The message could not be sent.");
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!sending && !readOnly) void submit();
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="consultation-chat-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Authenticated care relationship</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950" id="consultation-chat-heading">Secure Consultation Chat</h2>
          <p className="mt-2 text-sm text-slate-600">Text messages are stored with this online consultation.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${liveStatus === "connected" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`} role="status">
          {liveStatus === "connected" ? "Live updates connected" : "Live updates disconnected · reconnecting"}
        </span>
      </div>

      {consultationStatus === "CANCELLED" ? (
        <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
          This online consultation was cancelled. Message history is read-only.
        </div>
      ) : consultationStatus === "COMPLETED" ? (
        <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
          This consultation is complete. You may continue this conversation for related questions.
        </div>
      ) : null}

      <div className="mt-6 max-h-[32rem] space-y-4 overflow-y-auto rounded-2xl bg-slate-50 p-4" aria-live="polite">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No messages yet. Start the consultation conversation when you are ready.</p>
        ) : messages.map((message) => {
          const mine = message.senderType === currentSender;
          return (
            <article className={`flex ${mine ? "justify-end" : "justify-start"}`} key={message.messageId}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${mine ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-900"}`}>
                <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${mine ? "text-teal-100" : "text-slate-500"}`}>
                  <span className="font-semibold">{mine ? "You" : message.senderDisplayName}</span>
                  <time dateTime={message.sentAt}>{new Date(message.sentAt).toLocaleString()}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
              </div>
            </article>
          );
        })}
      </div>

      <form className="mt-5" onSubmit={submit}>
        <InlineError message={error} />
        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="consultation-message">
          Message
        </label>
        <textarea
          className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-100"
          disabled={readOnly || sending}
          id="consultation-message"
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={readOnly ? "Messaging is disabled for this cancelled consultation." : "Write a plain-text message. Enter sends; Shift+Enter adds a new line."}
          value={content}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">{content.length}/{MAX_MESSAGE_LENGTH}</span>
          <button className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            disabled={readOnly || sending || !content.trim()} type="submit">
            {sending ? "Sending..." : "Send message"}
          </button>
        </div>
      </form>
    </section>
  );
}

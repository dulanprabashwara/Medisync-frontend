"use client";
/* eslint-disable @next/next/no-img-element -- private signed URLs and local previews are intentionally rendered directly. */

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { InlineError } from "@/components/portal-ui";
import type { LiveConnectionStatus } from "@/hooks/use-consultation-events";
import type {
  ConsultationMessage,
  ConsultationSenderType,
  ConsultationStatus,
} from "@/types/consultations";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface SelectedImage {
  file: File;
  previewUrl: string;
}

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
  onSend: (content: string, images: File[]) => Promise<void>;
}) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<SelectedImage[]>([]);
  const readOnly = consultationStatus === "CANCELLED";

  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl)), []);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const message = content.trim();
    if (!message && images.length === 0) {
      setError("Enter a message or attach an image before sending.");
      return;
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      setError("Messages must not exceed 4000 characters.");
      return;
    }
    setError(null);
    try {
      await onSend(message, images.map((image) => image.file));
      setContent("");
      setImages((current) => {
        current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        return [];
      });
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "The message could not be sent.",
      );
    }
  }

  function chooseImages(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (images.length + selected.length > MAX_IMAGES) {
      setError(`Attach no more than ${MAX_IMAGES} images to one message.`);
      return;
    }
    if (selected.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type))) {
      setError("Only JPEG, PNG, and WebP chat images are supported.");
      return;
    }
    if (selected.some((file) => file.size > MAX_IMAGE_BYTES)) {
      setError("Each chat image must be 5 MB or smaller.");
      return;
    }
    setError(null);
    setImages((current) => [
      ...current,
      ...selected.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
  }

  function removeImage(index: number) {
    setImages((current) => {
      const target = current[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((_, position) => position !== index);
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!sending && !readOnly) void submit();
    }
  }

  return (
    <section
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby="consultation-chat-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
            Authenticated care relationship
          </p>
          <h2
            className="mt-2 text-2xl font-semibold text-slate-950"
            id="consultation-chat-heading"
          >
            Secure Consultation Chat
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Messages and images are stored privately with this online consultation.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${liveStatus === "connected" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}
          role="status"
        >
          {liveStatus === "connected"
            ? "Live updates connected"
            : "Live updates disconnected · reconnecting"}
        </span>
      </div>

      {consultationStatus === "CANCELLED" ? (
        <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
          This consultation has been cancelled. Message history is available,
          but new messages cannot be sent.
        </div>
      ) : consultationStatus === "COMPLETED" ? (
        <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
          This consultation is complete. You may continue this conversation for
          related questions.
        </div>
      ) : null}

      <div
        className="mt-6 max-h-[32rem] space-y-4 overflow-y-auto rounded-2xl bg-slate-50 p-4"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No messages yet. Start the consultation conversation when you are
            ready.
          </p>
        ) : (
          messages.map((message) => {
            const mine = message.senderType === currentSender;
            return (
              <article
                className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
                key={message.messageId}
              >
                {!mine ? (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                    {message.senderProfileImageUrl
                      ? <img src={message.senderProfileImageUrl} alt="" className="h-full w-full object-cover" />
                      : message.senderDisplayName.charAt(0)}
                  </div>
                ) : null}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${mine ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-900"}`}
                >
                  <div
                    className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${mine ? "text-teal-100" : "text-slate-500"}`}
                  >
                    <span className="font-semibold">
                      {mine ? "You" : message.senderDisplayName}
                    </span>
                    <time dateTime={message.sentAt}>
                      {new Date(message.sentAt).toLocaleString()}
                    </time>
                  </div>
                  {message.content ? (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
                  ) : null}
                  {message.attachments?.length ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {message.attachments.map((attachment) => attachment.signedUrl ? (
                        <button key={attachment.id} type="button" onClick={() => setOpenImage(attachment.signedUrl)}
                          className="overflow-hidden rounded-xl border border-white/30 bg-slate-100">
                          <img src={attachment.signedUrl} alt={attachment.originalFilename || "Consultation attachment"}
                            className="h-32 w-full object-cover" />
                        </button>
                      ) : (
                        <div key={attachment.id} className="rounded-xl bg-slate-200 p-4 text-xs text-slate-600">Image link unavailable</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>

      <form className="mt-5" onSubmit={submit}>
        <InlineError message={error} />
        <label
          className="mt-4 block text-sm font-medium text-slate-700"
          htmlFor="consultation-message"
        >
          Message
        </label>
        <textarea
          className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-100"
          disabled={readOnly || sending}
          id="consultation-message"
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            readOnly
              ? "Messaging is disabled for this cancelled consultation."
              : "Write a plain-text message. Enter sends; Shift+Enter adds a new line."
          }
          value={content}
        />
        {images.length ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div key={`${image.file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-200">
                <img src={image.previewUrl} alt="Selected attachment preview" className="h-24 w-full object-cover" />
                <button type="button" onClick={() => removeImage(index)} aria-label="Remove image"
                  className="absolute right-1 top-1 rounded-full bg-slate-950/80 px-2 py-1 text-xs font-bold text-white">×</button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {content.length}/{MAX_MESSAGE_LENGTH}
          </span>
          <div className="flex flex-wrap gap-2">
            <input ref={imageInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={chooseImages} />
            <button type="button" disabled={readOnly || sending || images.length >= MAX_IMAGES}
              onClick={() => imageInputRef.current?.click()}
              className="rounded-xl border border-teal-700 px-4 py-3 text-sm font-semibold text-teal-800 disabled:opacity-50">
              Add images ({images.length}/{MAX_IMAGES})
            </button>
            <button
              className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              disabled={readOnly || sending || (!content.trim() && images.length === 0)}
              type="submit"
            >
              {sending ? "Sending..." : "Send message"}
            </button>
          </div>
        </div>
      </form>
      {openImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6" role="dialog" aria-modal="true"
          onClick={() => setOpenImage(null)}>
          <button type="button" className="absolute right-6 top-6 rounded-full bg-white px-4 py-2 font-bold text-slate-950"
            onClick={() => setOpenImage(null)}>Close</button>
          <img src={openImage} alt="Consultation attachment preview" className="max-h-full max-w-full rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()} />
        </div>
      ) : null}
    </section>
  );
}

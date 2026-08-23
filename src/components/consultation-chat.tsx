"use client";
/* eslint-disable @next/next/no-img-element -- private signed URLs and local previews are intentionally rendered directly. */

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/forms";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const readOnly = consultationStatus === "CANCELLED";

  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl)), []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const message = content.trim();
    if (!message && images.length === 0) {
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
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 min-h-[500px]">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="font-semibold text-slate-900">Consultation Chat</h2>
        <div className="flex items-center gap-2">
          <div className={`size-2 rounded-full ${liveStatus === "connected" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
          <span className="text-xs font-medium text-slate-600">
            {liveStatus === "connected" ? "Connected" : "Reconnecting..."}
          </span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-6 bg-slate-50/30"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-3 opacity-80 py-10">
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="size-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="max-w-xs text-sm">No messages yet. You can start the conversation when you&apos;re ready.</p>
          </div>
        ) : (
          messages.map((message) => {
            const mine = message.senderType === currentSender;
            const formattedTime = new Date(message.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            
            return (
              <div
                key={message.messageId}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${mine ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {!mine && (
                  <div className="size-8 shrink-0 rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-center overflow-hidden">
                    {message.senderProfileImageUrl
                      ? <img src={message.senderProfileImageUrl} alt="" className="size-full object-cover" />
                      : message.senderDisplayName.charAt(0)}
                  </div>
                )}
                
                <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-slate-500">{mine ? "You" : message.senderDisplayName}</span>
                    <span className="text-[10px] text-slate-400">{formattedTime}</span>
                  </div>
                  
                  <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words
                    ${mine 
                      ? "bg-teal-600 text-white rounded-tr-sm" 
                      : "bg-slate-100 text-slate-900 rounded-tl-sm border border-slate-200"
                    }`}
                  >
                    {message.content}
                    
                    {message.attachments?.length ? (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {message.attachments.map((attachment) => attachment.signedUrl ? (
                          <button key={attachment.id} type="button" onClick={() => setOpenImage(attachment.signedUrl)}
                            className="overflow-hidden rounded-lg border border-black/10 relative group bg-black/5 aspect-square">
                            <img src={attachment.signedUrl} alt={attachment.originalFilename || "Attachment"}
                              className="size-full object-cover" />
                          </button>
                        ) : (
                          <div key={attachment.id} className="rounded-lg bg-black/5 p-4 text-[10px] text-slate-500 flex items-center justify-center text-center">Unavailable</div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        {error && <Alert tone="error" className="mb-4">{error}</Alert>}
        
        {readOnly ? (
          <div className="py-3 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-500 text-center">
            This consultation has been cancelled. Messaging is no longer available.
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            {images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <div key={`${image.file.name}-${index}`} className="relative size-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={image.previewUrl} alt="Preview" className="size-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} aria-label="Remove image"
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="size-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2 items-end">
              <input ref={imageInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp"
                className="hidden" onChange={chooseImages} />
              
              <Button 
                type="button" 
                variant="secondary" 
                className="shrink-0 size-11 p-0 rounded-full"
                disabled={sending || images.length >= MAX_IMAGES}
                onClick={() => imageInputRef.current?.click()}
                aria-label="Add image"
              >
                <ImageIcon className="size-5 text-slate-500" />
              </Button>
              
              <div className="flex-1 relative">
                <Textarea
                  className="min-h-11 max-h-32 resize-none py-3 pr-12 rounded-2xl bg-slate-50"
                  disabled={sending}
                  maxLength={MAX_MESSAGE_LENGTH}
                  onChange={(event) => setContent(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  value={content}
                  rows={1}
                />
              </div>
              
              <Button 
                type="submit" 
                className="shrink-0 size-11 p-0 rounded-full bg-teal-600 hover:bg-teal-700 text-white"
                disabled={sending || (!content.trim() && images.length === 0)}
                aria-label="Send message"
              >
                <Send className="size-5 ml-0.5" />
              </Button>
            </div>
          </form>
        )}
      </div>

      {openImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 sm:p-8" role="dialog" aria-modal="true"
          onClick={() => setOpenImage(null)}>
          <button type="button" className="absolute right-4 top-4 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition-colors"
            onClick={() => setOpenImage(null)}>
            <X className="size-6" />
          </button>
          <img src={openImage} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

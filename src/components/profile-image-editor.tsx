"use client";
/* eslint-disable @next/next/no-img-element -- private signed URLs and local previews are intentionally rendered directly. */

import { useEffect, useRef, useState } from "react";
import { removeMyProfileImage, uploadMyProfileImage } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function ProfileImageEditor({ compact = false }: { compact?: boolean }) {
  const { session, profile, refreshProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageUrl = previewUrl || profile?.profileImageUrl;
  const initials = `${profile?.firstName?.[0] ?? "M"}${profile?.lastName?.[0] ?? ""}`.toUpperCase();

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function choose(file: File | undefined) {
    if (!file || !session) return;
    setError(null);
    if (!allowedTypes.has(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photos must be 5 MB or smaller.");
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return localUrl;
    });
    setBusy(true);
    try {
      await uploadMyProfileImage(session.access_token, file);
      await refreshProfile();
      setPreviewUrl(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The profile photo could not be uploaded.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    if (!session || !profile?.profileImageUrl) return;
    setBusy(true);
    setError(null);
    try {
      await removeMyProfileImage(session.access_token);
      await refreshProfile();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "The profile photo could not be removed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={compact ? "flex items-center gap-4" : "mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"}>
      <div className={compact ? "flex items-center gap-4" : "flex flex-wrap items-center gap-5"}>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-100 text-xl font-bold text-teal-900 ring-4 ring-white shadow">
          {imageUrl ? <img src={imageUrl} alt={`${profile?.firstName ?? "User"} profile`} className="h-full w-full object-cover" /> : initials}
        </div>
        <div>
          {!compact ? <h2 className="text-lg font-semibold text-slate-950">Profile photo</h2> : null}
          {!compact ? <p className="mt-1 text-sm text-slate-500">JPEG, PNG, or WebP. Maximum 5 MB.</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => inputRef.current?.click()}
              className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Updating…" : imageUrl ? "Replace photo" : "Add photo"}
            </button>
            {profile?.profileImageUrl ? (
              <button type="button" disabled={busy} onClick={() => void remove()}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(event) => void choose(event.target.files?.[0])} />
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
    </section>
  );
}

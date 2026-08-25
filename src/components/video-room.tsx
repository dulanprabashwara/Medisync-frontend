"use client";

import { useCallback, useState } from "react";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { Video, VideoOff, X } from "lucide-react";

interface VideoRoomProps {
  token: string;
  serverUrl: string;
  onLeave: () => void;
}

/**
 * Full-screen LiveKit video room overlay.
 * Renders the LiveKit VideoConference composite component with
 * custom styling that matches the MediSync design system.
 *
 * No clinical data, PII, or chat content is sent through this component.
 */
export function VideoRoom({ token, serverUrl, onLeave }: VideoRoomProps) {
  const [hasLeft, setHasLeft] = useState(false);

  const handleDisconnected = useCallback(() => {
    setHasLeft(true);
    onLeave();
  }, [onLeave]);

  if (hasLeft) return null;

  return (
    <div className="fixed inset-0 z-100 bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <Video className="size-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              MediSync Video Consultation
            </h2>
            <p className="text-[11px] text-slate-400">
              Secure · No recording
            </p>
          </div>
        </div>
        <button
          onClick={handleDisconnected}
          className="flex items-center gap-1.5 rounded-lg bg-rose-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 transition-colors"
          aria-label="Leave video call"
        >
          <X className="size-3.5" />
          Leave
        </button>
      </div>

      {/* LiveKit Video Area */}
      <div className="flex-1 min-h-0 [--lk-theme-color:var(--color-teal-600)]">
        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          video={true}
          audio={true}
          onDisconnected={handleDisconnected}
          style={{ height: "100%" }}
          data-lk-theme="default"
        >
          <MinimalVideoInterface />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}

/**
 * Minimal LiveKit interface replacing VideoConference to strictly
 * disable chat and screen sharing.
 */
function MinimalVideoInterface() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.Microphone, withPlaceholder: true },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="flex-1 min-h-0">
        <GridLayout tracks={tracks} style={{ height: "100%" }}>
          <ParticipantTile />
        </GridLayout>
      </div>
      <ControlBar controls={{ microphone: true, camera: true, screenShare: false, chat: false }} />
    </div>
  );
}

/**
 * Button used by the Doctor to start or rejoin a video call.
 */
export function DoctorVideoButton({
  consultationStatus,
  videoActive,
  busy,
  onStart,
  onRejoin,
}: {
  consultationStatus: string;
  videoActive: boolean;
  busy: string | null;
  onStart: () => void;
  onRejoin: () => void;
}) {
  if (consultationStatus !== "IN_PROGRESS") return null;

  return (
    <div className="flex gap-2">
      {videoActive ? (
        <button
          onClick={onRejoin}
          disabled={busy !== null}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60 transition-colors"
        >
          <Video className="size-4" />
          {busy === "video" ? "Connecting..." : "Rejoin Video Call"}
        </button>
      ) : (
        <button
          onClick={onStart}
          disabled={busy !== null}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-sm hover:shadow-md"
        >
          <Video className="size-4" />
          {busy === "video" ? "Starting..." : "Start Video Call"}
        </button>
      )}
    </div>
  );
}

/**
 * Button used by the Patient to join a video call started by the doctor.
 */
export function PatientVideoButton({
  consultationStatus,
  videoActive,
  busy,
  onJoin,
}: {
  consultationStatus: string;
  videoActive: boolean;
  busy: string | null;
  onJoin: () => void;
}) {
  if (consultationStatus !== "IN_PROGRESS") return null;

  if (!videoActive) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <VideoOff className="size-4 shrink-0 text-slate-400" />
        <span>No active video call. Waiting for doctor to start...</span>
      </div>
    );
  }

  return (
    <button
      onClick={onJoin}
      disabled={busy !== null}
      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-sm hover:shadow-md animate-pulse hover:animate-none"
    >
      <Video className="size-4" />
      {busy === "video" ? "Connecting..." : "Join Video Call"}
    </button>
  );
}

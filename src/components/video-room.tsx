"use client";

import { useCallback, useState } from "react";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  PreJoin,
  type LocalUserChoices,
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
  const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined);

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

      {/* LiveKit Video Area or PreJoin */}
      <div className="flex-1 min-h-0 [--lk-theme-color:var(--color-teal-600)] bg-slate-950 flex items-center justify-center">
        {!preJoinChoices ? (
          <div className="max-w-2xl w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Ready to join?</h3>
              <p className="text-slate-400 text-sm">Check your camera and microphone settings before joining the consultation.</p>
            </div>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl">
              <PreJoin
                onSubmit={(values) => setPreJoinChoices(values)}
                onError={(err) => console.error("PreJoin error:", err)}
              />
            </div>
          </div>
        ) : (
          <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            video={preJoinChoices.videoEnabled}
            audio={preJoinChoices.audioEnabled}
            onDisconnected={handleDisconnected}
            style={{ height: "100%", width: "100%" }}
            data-lk-theme="default"
          >
            <MinimalVideoInterface />
            <RoomAudioRenderer />
          </LiveKitRoom>
        )}
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
  scheduledStart,
  onStart,
  onRejoin,
}: {
  consultationStatus: string;
  videoActive: boolean;
  busy: string | null;
  scheduledStart?: string;
  onStart: () => void;
  onRejoin: () => void;
}) {
  if (consultationStatus === "COMPLETED" || consultationStatus === "CANCELLED") return null;

  const now = new Date();
  const scheduledTime = scheduledStart ? new Date(scheduledStart) : now;
  const isBeforeScheduled = now < scheduledTime && consultationStatus === "SCHEDULED";

  if (isBeforeScheduled) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-teal-800">
          You can start the video consultation once the scheduled time arrives.
        </p>
        <button
          disabled
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed"
        >
          <VideoOff className="size-4" />
          Start Video Consultation
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {videoActive ? (
        <button
          onClick={onRejoin}
          disabled={busy !== null}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60 transition-colors"
        >
          <Video className="size-4" />
          {busy === "video" ? "Connecting..." : "Rejoin Video Consultation"}
        </button>
      ) : (
        <button
          onClick={onStart}
          disabled={busy !== null}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-sm hover:shadow-md"
        >
          <Video className="size-4" />
          {busy === "video" ? "Starting..." : "Start Video Consultation"}
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
  scheduledStart,
  onJoin,
}: {
  consultationStatus: string;
  videoActive: boolean;
  busy: string | null;
  scheduledStart?: string;
  onJoin: () => void;
}) {
  if (consultationStatus === "COMPLETED" || consultationStatus === "CANCELLED") return null;

  const now = new Date();
  const scheduledTime = scheduledStart ? new Date(scheduledStart) : now;
  const isBeforeScheduled = now < scheduledTime && consultationStatus === "SCHEDULED";

  if (isBeforeScheduled) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-800">
          Scheduled for {scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <VideoOff className="size-4 shrink-0 text-slate-400" />
          <span>The Doctor will start the video consultation at the scheduled time.</span>
        </div>
      </div>
    );
  }

  if (!videoActive) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-amber-700">Waiting for Doctor</p>
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <VideoOff className="size-4 shrink-0 text-slate-400" />
          <span>The Doctor has not started the video consultation yet.</span>
        </div>
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
      {busy === "video" ? "Connecting..." : "Join Video Consultation"}
    </button>
  );
}

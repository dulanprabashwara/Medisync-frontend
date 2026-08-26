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
  VideoConference,
  type LocalUserChoices,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { Video, VideoOff, X } from "lucide-react";
import { MediSyncBrand } from "@/components/branding/medisync-brand";
import toast from "react-hot-toast";

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
    <>
      <style>{`
        /* Hide the username input in PreJoin but keep the Join button visible */
        .medisync-prejoin .lk-username-container input {
          display: none !important;
        }
        .medisync-prejoin .lk-username-container {
          display: flex;
          justify-content: center;
          margin-top: 0.5rem;
        }
        .medisync-prejoin .lk-username-container button {
          width: 100%;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
        }
        
        /* Custom LiveKit Theme Overrides for MediSync */
        .lk-room-container {
          --lk-bg: #f8fafc; /* slate-50 - softer background */
          --lk-control-bg: #ffffff; /* white */
          --lk-control-hover-bg: #f1f5f9; /* slate-100 */
          --lk-control-active-bg: #0d9488; /* teal-600 */
          --lk-control-active-hover-bg: #0f766e; /* teal-700 */
          --lk-control-fg: #000000; /* black for inactive text/icons */
          --lk-control-active-fg: #ffffff; /* white for active text/icons */
          --lk-fg: #0f172a; /* slate-900 */
          --lk-border-color: #000000; /* black borders */
          --lk-accent-color: #0d9488; /* teal-600 */
          --lk-danger: #ef4444; /* red-500 */
          --lk-border-radius: 12px;
        }
        
        /* Participant Tile Enhancements */
        .lk-participant-tile {
          background-color: #e2e8f0 !important; /* slate-200 */
          border: 1px solid #cbd5e1 !important; /* slate-300 */
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05) !important;
        }
        
        /* Fix the empty video placeholder */
        .lk-participant-placeholder {
          background-color: #e2e8f0 !important;
          color: #94a3b8 !important;
        }
        
        /* Make button icons thicker and more visible */
        .lk-button, .lk-button-group {
          font-weight: 500;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1) !important;
        }
        
        .lk-button > svg {
          stroke-width: 2.5px;
        }
        
        /* Add explicitly black borders to standalone control buttons */
        .lk-button {
          border: 1px solid #000000 !important;
        }
        
        /* For button groups (like Camera/Mic with dropdowns), put the border on the group */
        .lk-button-group {
          border: 1px solid #000000 !important;
          border-radius: var(--lk-border-radius) !important;
          overflow: hidden !important;
        }
        
        /* Remove borders, radius, and shadow from buttons inside groups to let the group handle it */
        .lk-button-group .lk-button {
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        
        /* Add only the vertical separator between the main button and the dropdown chevron */
        .lk-button-group .lk-button:not(:first-child) {
          border-left: 1px solid #000000 !important;
        }
        
        /* Make the control bar look more like MediSync */
        .lk-control-bar {
          border-top: 1px solid var(--lk-border-color);
          padding: 1rem;
        }
        
        /* Style the chat window */
        .lk-chat {
          background-color: var(--lk-control-bg);
          border-left: 1px solid var(--lk-border-color);
        }
      `}</style>
      <div className="fixed inset-0 z-100 bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <MediSyncBrand size="compact" />
          <div className="hidden sm:block h-5 w-px bg-slate-300" />
          <h2 className="hidden sm:block text-sm font-semibold text-slate-900">
            Live Consultation
          </h2>
        </div>
      </div>

      {/* LiveKit Video Area or PreJoin */}
      <div className="flex-1 min-h-0 [--lk-theme-color:var(--color-teal-600)] bg-slate-50 flex items-center justify-center">
        {!preJoinChoices ? (
          <div className="max-w-2xl w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to join?</h3>
              <p className="text-slate-500 text-sm">Check your camera and microphone settings before joining the consultation.</p>
            </div>
            <div 
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xl medisync-prejoin"
              data-lk-theme="default"
            >
              <PreJoin
                onSubmit={(values) => setPreJoinChoices(values)}
                onError={(err) => console.error("PreJoin error:", err)}
                defaults={{
                  username: "MediSync User",
                  videoEnabled: true,
                  audioEnabled: true,
                }}
              />
            </div>
          </div>
        ) : (
          <LiveKitRoom
            token={token}
            serverUrl={serverUrl?.trim()}
            video={preJoinChoices.videoEnabled ? (preJoinChoices.videoDeviceId ? { deviceId: preJoinChoices.videoDeviceId } : true) : false}
            audio={preJoinChoices.audioEnabled ? (preJoinChoices.audioDeviceId ? { deviceId: preJoinChoices.audioDeviceId } : true) : false}
            onDisconnected={handleDisconnected}
            onError={(e) => toast.error("Connection Error: " + e.message)}

            onMediaDeviceFailure={(e) => {
              console.error("Media device failure:", e);
              toast.error("Could not access camera/microphone. Please ensure you have granted browser permissions and no other app is using them.", { duration: 6000 });
            }}
            style={{ height: "100%", width: "100%" }}
            data-lk-theme="default"
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        )}
      </div>
    </div>
    </>
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

  const isScheduled = consultationStatus === "SCHEDULED";

  if (isScheduled) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-teal-800">
          Click "Start Consultation" in the Info tab to begin this session and enable video.
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

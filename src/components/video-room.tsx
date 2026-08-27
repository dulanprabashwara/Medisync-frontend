"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
  type LocalUserChoices,
} from "@livekit/components-react";
import "@livekit/components-styles";
import {
  AlertCircle,
  Camera,
  CameraOff,
  ChevronDown,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  RefreshCw,
  Video,
  VideoOff,
} from "lucide-react";
import toast from "react-hot-toast";

interface VideoRoomProps {
  token: string;
  serverUrl: string;
  onLeave: () => void;
}

function mediaErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "Camera or microphone access is blocked. Allow access in your browser site settings, then try again.";
    }
    if (error.name === "NotFoundError") {
      return "No camera or microphone was found. Connect a device and try again.";
    }
    if (error.name === "NotReadableError") {
      return "Your camera or microphone is being used by another application. Close it there and try again.";
    }
  }
  return "The camera and microphone preview could not be started. Check your browser permissions and try again.";
}

function mediaTrackErrorMessage(kind: "camera" | "microphone", error: unknown) {
  const deviceName = kind === "camera" ? "camera" : "microphone";
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return `${kind === "camera" ? "Camera" : "Microphone"} access is blocked in your browser site settings.`;
    }
    if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
      return `The selected ${deviceName} is unavailable. Choose another device or reconnect it.`;
    }
    if (error.name === "NotReadableError" || error.name === "AbortError") {
      return `The ${deviceName} is being used by another application.`;
    }
  }
  return `The ${deviceName} could not be started.`;
}

function DevicePreview({
  onSubmit,
}: {
  onSubmit: (choices: LocalUserChoices) => void;
}) {
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoDeviceRef = useRef("");
  const audioDeviceRef = useRef("");
  const videoEnabledRef = useRef(true);
  const audioEnabledRef = useRef(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceId] = useState("");
  const [audioDeviceId, setAudioDeviceId] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [previewBusy, setPreviewBusy] = useState(true);
  const [previewReady, setPreviewReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [microphoneReady, setMicrophoneReady] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const stopPreview = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoElementRef.current) videoElementRef.current.srcObject = null;
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    setVideoDevices(devices.filter((device) => device.kind === "videoinput"));
    setAudioDevices(devices.filter((device) => device.kind === "audioinput"));
  }, []);

  const startPreview = useCallback(
    async (requestedVideoId = videoDeviceRef.current, requestedAudioId = audioDeviceRef.current) => {
      setPreviewBusy(true);
      setPreviewReady(false);
      setCameraReady(false);
      setMicrophoneReady(false);
      setPreviewError(null);
      stopPreview();

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Media devices are not supported by this browser.");
        }

        const [videoResult, audioResult] = await Promise.allSettled([
          navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: requestedVideoId && requestedVideoId !== "default" ? { exact: requestedVideoId } : undefined,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          }),
          navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
              deviceId: requestedAudioId && requestedAudioId !== "default" ? { exact: requestedAudioId } : undefined,
              echoCancellation: true,
              noiseSuppression: true,
            },
          }),
        ]);

        const tracks = [
          ...(videoResult.status === "fulfilled" ? videoResult.value.getVideoTracks() : []),
          ...(audioResult.status === "fulfilled" ? audioResult.value.getAudioTracks() : []),
        ];
        const stream = new MediaStream(tracks);

        if (tracks.length === 0) {
          const failure = videoResult.status === "rejected" ? videoResult.reason : audioResult.status === "rejected" ? audioResult.reason : undefined;
          throw failure ?? new Error("No media tracks were created.");
        }

        stream.getVideoTracks().forEach((track) => {
          track.enabled = videoEnabledRef.current;
        });
        stream.getAudioTracks().forEach((track) => {
          track.enabled = audioEnabledRef.current;
        });

        streamRef.current = stream;
        if (videoElementRef.current) {
          videoElementRef.current.srcObject = stream;
          await videoElementRef.current.play().catch(() => undefined);
        }

        const activeVideoId = stream.getVideoTracks()[0]?.getSettings().deviceId ?? requestedVideoId;
        const activeAudioId = stream.getAudioTracks()[0]?.getSettings().deviceId ?? requestedAudioId;
        videoDeviceRef.current = activeVideoId;
        audioDeviceRef.current = activeAudioId;
        setVideoDeviceId(activeVideoId);
        setAudioDeviceId(activeAudioId);
        setPreviewReady(true);
        setCameraReady(videoResult.status === "fulfilled");
        setMicrophoneReady(audioResult.status === "fulfilled");
        await refreshDevices();

        const deviceErrors: string[] = [];
        if (videoResult.status === "rejected") deviceErrors.push(mediaTrackErrorMessage("camera", videoResult.reason));
        if (audioResult.status === "rejected") deviceErrors.push(mediaTrackErrorMessage("microphone", audioResult.reason));
        setPreviewError(deviceErrors.length > 0 ? deviceErrors.join(" ") : null);
      } catch (error) {
        setPreviewReady(false);
        setCameraReady(false);
        setMicrophoneReady(false);
        setPreviewError(mediaErrorMessage(error));
        await refreshDevices().catch(() => undefined);
      } finally {
        setPreviewBusy(false);
      }
    },
    [refreshDevices, stopPreview],
  );

  useEffect(() => {
    const previewTimer = window.setTimeout(() => void startPreview(), 0);
    const handleDeviceChange = () => void refreshDevices();
    navigator.mediaDevices?.addEventListener?.("devicechange", handleDeviceChange);
    return () => {
      window.clearTimeout(previewTimer);
      navigator.mediaDevices?.removeEventListener?.("devicechange", handleDeviceChange);
      stopPreview();
    };
  }, [refreshDevices, startPreview, stopPreview]);

  function toggleVideo() {
    const nextEnabled = !videoEnabledRef.current;
    videoEnabledRef.current = nextEnabled;
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    setVideoEnabled(nextEnabled);
  }

  function toggleAudio() {
    const nextEnabled = !audioEnabledRef.current;
    audioEnabledRef.current = nextEnabled;
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    setAudioEnabled(nextEnabled);
  }

  function joinRoom() {
    const choices: LocalUserChoices = {
      username: "MediSync User",
      videoEnabled: videoEnabled && cameraReady,
      audioEnabled: audioEnabled && microphoneReady,
      videoDeviceId: videoDeviceId || "default",
      audioDeviceId: audioDeviceId || "default",
    };
    stopPreview();
    onSubmit(choices);
  }

  return (
    <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] lg:grid-cols-[1.35fr_0.9fr]">
      <div className="relative flex min-h-72 items-center justify-center overflow-hidden bg-slate-950 sm:min-h-96">
        <video
          ref={videoElementRef}
          autoPlay
          muted
          playsInline
          className={`size-full object-cover transition-opacity ${videoEnabled && cameraReady ? "opacity-100" : "opacity-0"}`}
        />
        {(previewBusy || !videoEnabled || !cameraReady) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 px-6 text-center text-white">
            {previewBusy ? (
              <RefreshCw className="mb-3 size-8 animate-spin text-teal-300" />
            ) : (
              <CameraOff className="mb-3 size-10 text-slate-400" />
            )}
            <p className="text-sm font-semibold">
              {previewBusy ? "Starting camera preview…" : !cameraReady ? "Camera preview unavailable" : "Camera is turned off"}
            </p>
          </div>
        )}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          <span className={`size-2 rounded-full ${cameraReady ? "bg-emerald-400" : "bg-rose-400"}`} />
          Device preview
        </div>
      </div>

      <div className="flex flex-col p-5 sm:p-7">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">Device check</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Ready to join?</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">Preview your camera and choose the devices you want to use.</p>
        </div>

        {previewError && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
            <div className="flex gap-2.5">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <div>
                <p>{previewError}</p>
                <button
                  type="button"
                  onClick={() => void startPreview()}
                  className="mt-2 inline-flex items-center gap-1.5 font-bold text-rose-800 hover:text-rose-950"
                >
                  <RefreshCw className="size-3.5" /> Try again
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="video-device" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Camera</label>
            <div className="flex gap-2">
              <button type="button" onClick={toggleVideo} disabled={!cameraReady} className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${videoEnabled ? "border-teal-200 bg-teal-50 text-teal-700" : "border-slate-200 bg-slate-100 text-slate-500"}`} aria-label={videoEnabled ? "Turn camera off" : "Turn camera on"}>
                {videoEnabled ? <Camera className="size-5" /> : <CameraOff className="size-5" />}
              </button>
              <div className="relative min-w-0 flex-1">
                <select
                  id="video-device"
                  value={videoDeviceId}
                  disabled={previewBusy || videoDevices.length === 0}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    videoDeviceRef.current = nextId;
                    setVideoDeviceId(nextId);
                    void startPreview(nextId, audioDeviceRef.current);
                  }}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white pl-3 pr-9 text-sm text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {videoDevices.length === 0 && <option value="">No camera available</option>}
                  {videoDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="audio-device" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Microphone</label>
            <div className="flex gap-2">
              <button type="button" onClick={toggleAudio} disabled={!microphoneReady} className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${audioEnabled ? "border-teal-200 bg-teal-50 text-teal-700" : "border-slate-200 bg-slate-100 text-slate-500"}`} aria-label={audioEnabled ? "Mute microphone" : "Unmute microphone"}>
                {audioEnabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
              </button>
              <div className="relative min-w-0 flex-1">
                <select
                  id="audio-device"
                  value={audioDeviceId}
                  disabled={previewBusy || audioDevices.length === 0}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    audioDeviceRef.current = nextId;
                    setAudioDeviceId(nextId);
                    void startPreview(videoDeviceRef.current, nextId);
                  }}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white pl-3 pr-9 text-sm text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {audioDevices.length === 0 && <option value="">No microphone available</option>}
                  {audioDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${index + 1}`}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={joinRoom}
          disabled={previewBusy || !previewReady}
          className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white shadow-lg shadow-teal-700/15 transition-all hover:-translate-y-0.5 hover:bg-teal-800 disabled:pointer-events-none disabled:opacity-50"
        >
          <Video className="size-4" /> Join consultation
        </button>
      </div>
    </div>
  );
}

/**
 * Full-screen LiveKit video room overlay.
 * Renders the LiveKit VideoConference composite component with
 * custom styling that matches the MediSync design system.
 *
 * No clinical data, PII, or chat content is sent through this component.
 */
export function VideoRoom({ token, serverUrl, onLeave }: VideoRoomProps) {
  const roomOverlayRef = useRef<HTMLDivElement>(null);
  const [hasLeft, setHasLeft] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === roomOverlayRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await roomOverlayRef.current?.requestFullscreen();
      }
    } catch {
      toast.error("Fullscreen could not be opened by this browser.");
    }
  }, []);

  const handleDisconnected = useCallback(() => {
    setHasLeft(true);
    onLeave();
  }, [onLeave]);

  if (hasLeft) return null;

  return (
    <>
      <style>{`
        /* Custom LiveKit Theme Overrides for MediSync */
        .lk-room-container {
          --lk-bg: #f8fafc; /* slate-50 - softer background */
          --lk-bg2: #ffffff;
          --lk-bg3: #f1f5f9;
          --lk-bg4: #e2e8f0;
          --lk-bg5: #cbd5e1;
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
        
        /* Device menus are positioned outside their button groups, so they must not be clipped. */
        .lk-button-group {
          border: 1px solid #000000 !important;
          border-radius: var(--lk-border-radius) !important;
          overflow: visible !important;
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

        .lk-device-menu {
          z-index: 50 !important;
          color: #0f172a !important;
          background: #ffffff !important;
          border-color: #cbd5e1 !important;
        }

        .lk-device-menu .lk-button {
          color: #0f172a !important;
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

        /* The package close icon has a fixed white fill; make it visible on our white chat header. */
        .lk-chat-header .lk-close-button {
          display: inline-flex !important;
          width: 2.75rem;
          height: 2.75rem;
          align-items: center;
          justify-content: center;
          color: #0f172a !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 0.75rem;
        }

        .lk-chat-header .lk-close-button svg path {
          fill: #0f172a !important;
        }
      `}</style>
      <div ref={roomOverlayRef} className="fixed inset-0 z-100 bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 bg-white/90 backdrop-blur-sm border-b border-slate-200 shrink-0">
        <h2 className="text-sm font-semibold text-slate-900">Live Consultation</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void toggleFullscreen()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50" aria-label={isFullscreen ? "Exit fullscreen" : "Open fullscreen"}>
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</span>
          </button>
          {!preJoinChoices && (
            <button type="button" onClick={handleDisconnected} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              Return to consultation
            </button>
          )}
        </div>
      </div>

      {/* LiveKit Video Area or PreJoin */}
      <div className="flex-1 min-h-0 [--lk-theme-color:var(--color-teal-600)] bg-slate-50 flex items-center justify-center">
        {!preJoinChoices ? (
          <div className="max-w-5xl w-full p-4 sm:p-6 lg:p-8">
            <DevicePreview onSubmit={setPreJoinChoices} />
          </div>
        ) : (
          <LiveKitRoom
            token={token}
            serverUrl={serverUrl?.trim()}
            video={preJoinChoices.videoEnabled ? (preJoinChoices.videoDeviceId && preJoinChoices.videoDeviceId !== "default" ? { deviceId: preJoinChoices.videoDeviceId } : true) : false}
            audio={preJoinChoices.audioEnabled ? (preJoinChoices.audioDeviceId && preJoinChoices.audioDeviceId !== "default" ? { deviceId: preJoinChoices.audioDeviceId } : true) : false}
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
          Click &quot;Start Consultation&quot; in the Info tab to begin this session and enable video.
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

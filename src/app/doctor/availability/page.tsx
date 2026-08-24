"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { inputClassName } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import {
  PortalHeading,
  InlineError,
  StateBadge,
  formatAppointmentTime,
} from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import {
  createDoctorAvailability,
  deactivateDoctorAvailability,
  getDoctorAvailability,
  setDoctorSlotBlocked,
} from "@/lib/api";
import { SectionCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import type { AvailabilityWindow } from "@/types/appointments";

const durations = [15, 20, 30, 45, 60];

function DoctorAvailabilityContent() {
  const { session } = useAuth();
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState("");
  const [startsAt, setStartsAt] = useState("09:00");
  const [endsAt, setEndsAt] = useState("12:00");
  const [duration, setDuration] = useState(30);
  const [timeZone, setTimeZone] = useState("Asia/Colombo");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setWindows(await getDoctorAvailability(session.access_token));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Availability could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTimeZone(
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Colombo",
      );
      setNow(Date.now());
      void load();
    }, 0);
    const minuteTimer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(minuteTimer);
    };
  }, [load]);

  const previewCount = useMemo(() => {
    if (!date || !startsAt || !endsAt) return 0;
    const start = new Date(`${date}T${startsAt}`);
    const end = new Date(`${date}T${endsAt}`);
    const minutes = (end.getTime() - start.getTime()) / 60_000;
    return minutes > 0 ? Math.floor(minutes / duration) : 0;
  }, [date, duration, endsAt, startsAt]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!session || !date) return;
    setBusy("create");
    setError(null);
    setMessage(null);
    const start = new Date(`${date}T${startsAt}`);
    const end = new Date(`${date}T${endsAt}`);
    if (start.getTime() <= Date.now()) {
      setError("Availability must start in the future.");
      setBusy(null);
      return;
    }
    if (end.getTime() <= start.getTime()) {
      setError("Availability end must be after its start.");
      setBusy(null);
      return;
    }
    try {
      await createDoctorAvailability(session.access_token, {
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        slotDurationMinutes: duration,
        timeZone,
      });
      setMessage(
        `${previewCount} online consultation time${previewCount === 1 ? "" : "s"} created.`,
      );
      setIsDialogOpen(false);
      await load();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Availability could not be created.",
      );
    } finally {
      setBusy(null);
    }
  }

  const visibleWindows = windows
    .filter((availability) => new Date(availability.endsAt).getTime() > now)
    .map((availability) => ({
      ...availability,
      slots: availability.slots.filter(
        (slot) => new Date(slot.startsAt).getTime() > now,
      ),
    }));

  async function toggleSlot(slotId: string, block: boolean) {
    if (!session) return;
    setBusy(slotId);
    setError(null);
    try {
      await setDoctorSlotBlocked(session.access_token, slotId, block);
      await load();
    } catch (slotError) {
      setError(
        slotError instanceof Error
          ? slotError.message
          : "The consultation time could not be updated.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function deactivate(windowId: string) {
    if (!session) return;
    setBusy(windowId);
    setError(null);
    try {
      await deactivateDoctorAvailability(session.access_token, windowId);
      setMessage(
        "The consultation availability window was deactivated. Its open times are now unavailable.",
      );
      await load();
    } catch (deactivateError) {
      setError(
        deactivateError instanceof Error
          ? deactivateError.message
          : "Availability could not be deactivated.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PortalHeading
        eyebrow="Doctor Portal"
        title="Consultation Availability"
        backHref="/doctor/dashboard"
        description="Publish future availability windows to allow patients to book online consultations with you."
        action={
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Add Availability
          </Button>
        }
      />

      {(error || message) && (
        <div className="mt-7 space-y-3">
          {error && <InlineError message={error} />}
          {message ? (
            <div
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900"
              role="status"
            >
              {message}
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-950 mb-5">
          Your Upcoming Availability
        </h2>
        {loading ? (
          <LoadingPanel label="Loading availability..." />
        ) : visibleWindows.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming availability"
            description="You have not created any future availability blocks yet."
            action={
              <Button onClick={() => setIsDialogOpen(true)} className="mt-4 gap-2">
                <Plus className="size-4" />
                Add Availability
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {visibleWindows.map((availability) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                key={availability.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 bg-slate-50">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-950">
                        {formatAppointmentTime(availability.startsAt)}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${availability.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}
                      >
                        {availability.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="mt-1.5 flex items-center text-sm text-slate-600 gap-2">
                      <Clock className="size-4 shrink-0" />
                      Until {formatAppointmentTime(availability.endsAt)} · {availability.slotDurationMinutes}-minute slots
                    </p>
                  </div>
                  {availability.active &&
                  new Date(availability.endsAt).getTime() > now ? (
                    <button
                      className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60 transition-colors"
                      disabled={busy !== null}
                      onClick={() => void deactivate(availability.id)}
                    >
                      {busy === availability.id
                        ? "Deactivating..."
                        : "Deactivate Block"}
                    </button>
                  ) : null}
                </div>
                <div className="p-5">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {availability.slots.map((slot) => (
                      <div
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                        key={slot.id}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(slot.startsAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" – "}
                            {new Date(slot.endsAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <div className="mt-1">
                            <StateBadge status={slot.status} />
                          </div>
                        </div>
                        {availability.active &&
                        new Date(slot.startsAt).getTime() > now &&
                        (slot.status === "AVAILABLE" ||
                          slot.status === "BLOCKED") ? (
                          <button
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors"
                            disabled={busy !== null}
                            onClick={() =>
                              void toggleSlot(
                                slot.id,
                                slot.status === "AVAILABLE",
                              )
                            }
                          >
                            {busy === slot.id
                              ? "..."
                              : slot.status === "AVAILABLE"
                                ? "Block"
                                : "Unblock"}
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create Availability"
        description={`Times are interpreted in ${timeZone}.`}
      >
        <form className="space-y-5" onSubmit={create}>
          <label className="block text-sm font-medium text-slate-700">
            Date
            <input
              className={`${inputClassName} mt-2 bg-slate-50 border-slate-200 focus:bg-white`}
              min={new Date().toLocaleDateString("en-CA")}
              required
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-slate-700">
              Start time
              <input
                className={`${inputClassName} mt-2 bg-slate-50 border-slate-200 focus:bg-white`}
                required
                type="time"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              End time
              <input
                className={`${inputClassName} mt-2 bg-slate-50 border-slate-200 focus:bg-white`}
                required
                type="time"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Consultation duration
            <select
              className={`${inputClassName} mt-2 bg-slate-50 border-slate-200 focus:bg-white`}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            >
              {durations.map((value) => (
                <option key={value} value={value}>
                  {value} minutes
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
            <p className="text-sm font-medium text-teal-900">
              Preview: {previewCount} consultation time
              {previewCount === 1 ? "" : "s"} will be generated.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={busy !== null}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy !== null || previewCount < 1}>
              {busy === "create" ? "Creating..." : "Create Availability"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default function DoctorAvailabilityPage() {
  return (
    <ProtectedRoute roles={["DOCTOR"]}>
      <DoctorAvailabilityContent />
    </ProtectedRoute>
  );
}


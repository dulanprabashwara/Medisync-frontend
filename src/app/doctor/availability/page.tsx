"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { inputClassName } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading, InlineError, StateBadge, formatAppointmentTime } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import {
  createDoctorAvailability,
  deactivateDoctorAvailability,
  getDoctorAvailability,
  setDoctorSlotBlocked,
} from "@/lib/api";
import type { AvailabilityWindow } from "@/types/appointments";

const durations = [15, 20, 30, 45, 60];

function DoctorAvailabilityContent() {
  const { session } = useAuth();
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
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
      setError(loadError instanceof Error ? loadError.message : "Availability could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Colombo");
      setNow(Date.now());
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
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
    try {
      await createDoctorAvailability(session.access_token, {
        startsAt: new Date(`${date}T${startsAt}`).toISOString(),
        endsAt: new Date(`${date}T${endsAt}`).toISOString(),
        slotDurationMinutes: duration,
        timeZone,
      });
      setMessage(`${previewCount} appointment slot${previewCount === 1 ? "" : "s"} created.`);
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Availability could not be created.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleSlot(slotId: string, block: boolean) {
    if (!session) return;
    setBusy(slotId);
    setError(null);
    try {
      await setDoctorSlotBlocked(session.access_token, slotId, block);
      await load();
    } catch (slotError) {
      setError(slotError instanceof Error ? slotError.message : "The slot could not be updated.");
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
      setMessage("The availability window was deactivated. Its open slots are now blocked.");
      await load();
    } catch (deactivateError) {
      setError(deactivateError instanceof Error ? deactivateError.message : "Availability could not be deactivated.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading eyebrow="Doctor scheduling" title="Availability" backHref="/doctor/dashboard"
        description="Publish specific future windows. MediSync generates the actual appointment slots patients can request." />

      <div className="mt-7 space-y-3">
        <InlineError message={error} />
        {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900" role="status">{message}</div> : null}
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-slate-950">Create an availability window</h2>
        <p className="mt-2 text-sm text-slate-600">Times are interpreted in {timeZone} and stored with their absolute timezone.</p>
        <form className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4" onSubmit={create}>
          <label className="text-sm font-medium text-slate-700">Date
            <input className={inputClassName} min={new Date().toISOString().slice(0, 10)} required type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="text-sm font-medium text-slate-700">Start time
            <input className={inputClassName} required type="time" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          </label>
          <label className="text-sm font-medium text-slate-700">End time
            <input className={inputClassName} required type="time" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
          </label>
          <label className="text-sm font-medium text-slate-700">Appointment duration
            <select className={inputClassName} value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
              {durations.map((value) => <option key={value} value={value}>{value} minutes</option>)}
            </select>
          </label>
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-teal-50 p-4 md:col-span-2 lg:col-span-4">
            <p className="text-sm font-medium text-teal-900">Preview: {previewCount} complete slot{previewCount === 1 ? "" : "s"} will be generated.</p>
            <button className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              disabled={busy !== null || previewCount < 1} type="submit">
              {busy === "create" ? "Creating..." : "Create availability"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10" aria-labelledby="availability-list-heading">
        <h2 className="text-2xl font-semibold text-slate-950" id="availability-list-heading">Your availability windows</h2>
        {loading ? <LoadingPanel label="Loading availability..." /> : windows.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">You have not created any availability yet.</div>
        ) : (
          <div className="mt-5 space-y-5">
            {windows.map((availability) => (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" key={availability.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-950">{formatAppointmentTime(availability.startsAt)}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${availability.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{availability.active ? "ACTIVE" : "INACTIVE"}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Until {formatAppointmentTime(availability.endsAt)} · {availability.slotDurationMinutes}-minute slots · {availability.timeZone}</p>
                  </div>
                  {availability.active && new Date(availability.endsAt).getTime() > now ? (
                    <button className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                      disabled={busy !== null} onClick={() => void deactivate(availability.id)}>
                      {busy === availability.id ? "Deactivating..." : "Deactivate"}
                    </button>
                  ) : null}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {availability.slots.map((slot) => (
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4" key={slot.id}>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{new Date(slot.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–{new Date(slot.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        <div className="mt-2"><StateBadge status={slot.status} /></div>
                      </div>
                      {availability.active && new Date(slot.startsAt).getTime() > now && (slot.status === "AVAILABLE" || slot.status === "BLOCKED") ? (
                        <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          disabled={busy !== null} onClick={() => void toggleSlot(slot.id, slot.status === "AVAILABLE")}>
                          {busy === slot.id ? "Updating..." : slot.status === "AVAILABLE" ? "Block" : "Unblock"}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function DoctorAvailabilityPage() {
  return <ProtectedRoute roles={["DOCTOR"]}><DoctorAvailabilityContent /></ProtectedRoute>;
}

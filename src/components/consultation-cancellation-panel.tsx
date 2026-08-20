import type { AppointmentStatus } from "@/types/appointments";

export function ConsultationCancellationPanel({
  appointmentStatus,
  cancellationReason,
  viewer,
}: {
  appointmentStatus: AppointmentStatus;
  cancellationReason: string | null;
  viewer: "PATIENT" | "DOCTOR";
}) {
  const cancelledBy = cancelledByLabel(appointmentStatus, viewer);
  const reason = cancellationReason?.trim() || "No cancellation reason was provided.";

  return (
    <section className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm sm:p-8" aria-labelledby="consultation-cancelled-heading">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">Consultation status</p>
      <h2 className="mt-2 text-2xl font-semibold text-rose-950" id="consultation-cancelled-heading">
        Consultation Cancelled
      </h2>
      <dl className="mt-5 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-rose-700">Cancelled by</dt>
          <dd className="mt-1 font-semibold text-rose-950">{cancelledBy}</dd>
        </div>
        <div>
          <dt className="font-medium text-rose-700">Reason</dt>
          <dd className="mt-1 whitespace-pre-wrap text-rose-950">{reason}</dd>
        </div>
      </dl>
    </section>
  );
}

function cancelledByLabel(appointmentStatus: AppointmentStatus, viewer: "PATIENT" | "DOCTOR") {
  if (appointmentStatus === "CANCELLED_BY_PATIENT") {
    return viewer === "PATIENT" ? "You" : "Patient";
  }
  if (appointmentStatus === "CANCELLED_BY_DOCTOR") {
    return viewer === "DOCTOR" ? "You" : "Doctor";
  }
  return "Not available";
}

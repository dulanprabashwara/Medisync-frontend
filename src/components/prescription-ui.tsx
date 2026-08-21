import { QRCodeSVG } from "qrcode.react";
import type { DispensingStatus, PrescriptionItem, PrescriptionStatus } from "@/types/prescriptions";

export function PrescriptionStatusBadge({ status, expired = false, dispensingStatus = "NOT_DISPENSED" }: { status: PrescriptionStatus; expired?: boolean; dispensingStatus?: DispensingStatus }) {
  const dispensed = status === "ISSUED" && dispensingStatus === "DISPENSED";
  const label = status === "CANCELLED" ? "Cancelled" : dispensed ? "Dispensed" : expired ? "Expired" : status === "ISSUED" ? "Active" : "Draft";
  const tone = status === "CANCELLED" ? "bg-rose-100 text-rose-800" : dispensed ? "bg-sky-100 text-sky-800" : expired ? "bg-amber-100 text-amber-900" : status === "ISSUED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{label}</span>;
}

export function PrescriptionItemsView({ items }: { items: PrescriptionItem[] }) {
  return <div className="space-y-3">{items.map((item) => <article className="rounded-2xl border border-slate-200 p-5" key={item.id}>
    <h3 className="font-semibold text-slate-950">{item.position}. {item.medicineName}{item.strength ? ` · ${item.strength}` : ""}</h3>
    <p className="mt-2 text-sm text-slate-700">{[item.medicineForm, item.dosage, item.frequency, item.duration, item.route].filter(Boolean).join(" · ")}</p>
    {item.quantity ? <p className="mt-1 text-sm text-slate-600">Quantity: {item.quantity}</p> : null}
    {item.instructions ? <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.instructions}</p> : null}
  </article>)}</div>;
}

export function PrescriptionQr({ payload }: { payload: string }) {
  return <div className="inline-block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="Prescription QR code">
    <QRCodeSVG value={payload} size={224} level="H" marginSize={2} title="MediSync prescription QR code" />
  </div>;
}

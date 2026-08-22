export type PrescriptionStatus = "DRAFT" | "ISSUED" | "CANCELLED";
export type DispensingStatus = "NOT_DISPENSED" | "DISPENSED";
export type DoctorFeeStatus = "NOT_REQUIRED" | "AWAITING_CONFIRMATION" | "CONFIRMED";

export interface PrescriptionItem {
  id: string;
  position: number;
  medicineName: string;
  strength: string | null;
  medicineForm: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string | null;
  route: string | null;
  instructions: string | null;
}

export type PrescriptionItemInput = Omit<PrescriptionItem, "id" | "position">;

export interface DoctorPrescription {
  id: string; consultationId: string; consultationStatus: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"; status: PrescriptionStatus; patientName: string;
  doctorName: string; medicalRegistrationNumber: string; hospitalName: string;
  departmentName: string; specializationName: string; consultationScheduledStart: string;
  validityDays: number; generalInstructions: string | null;
  doctorFeeAmount: number; doctorFeeCurrency: string; doctorFeeStatus: DoctorFeeStatus;
  doctorFeeConfirmedAt: string | null; items: PrescriptionItem[];
  issuedAt: string | null; validUntil: string | null; expired: boolean;
  dispensingStatus: DispensingStatus; dispensedAt: string | null; dispensingPharmacy: string | null;
  cancelledAt: string | null; cancellationReason: string | null; createdAt: string; updatedAt: string;
}

export interface PatientPrescriptionSummary {
  id: string; consultationId: string; doctorName: string; specializationName: string;
  hospitalName: string; issuedAt: string; validUntil: string; status: Exclude<PrescriptionStatus, "DRAFT">;
  expired: boolean; dispensingStatus: DispensingStatus; dispensedAt: string | null;
  doctorFeeAmount: number; doctorFeeCurrency: string; doctorFeeStatus: DoctorFeeStatus;
  dispensingPharmacy: string | null; medicineCount: number;
}

export interface PatientPrescriptionDetail extends Omit<DoctorPrescription,
  "validityDays" | "createdAt" | "updatedAt" | "consultationStatus"> {
  qrGenerationAllowed: boolean;
}

export interface PrescriptionQrResponse {
  qrPayload: string;
  expiresAt: string;
}

export interface PrescriptionDraftInput {
  validityDays: number;
  generalInstructions: string;
  doctorFeeAmount: number;
  items: PrescriptionItemInput[];
}

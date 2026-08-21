import type { PageResponse } from "@/types/appointments";

export type PharmacyVerificationStatus =
  | "VERIFIED"
  | "ALREADY_DISPENSED"
  | "EXPIRED"
  | "CANCELLED"
  | "QR_NO_LONGER_VALID";

export interface DispensingPrescriptionItem {
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

export interface PharmacyPrescriptionVerification {
  status: PharmacyVerificationStatus;
  message: string;
  dispensingEligible: boolean;
  patientName: string | null;
  doctorName: string | null;
  doctorRegistrationNumber: string | null;
  doctorSpecialization: string | null;
  affiliatedHospital: string | null;
  issuedAt: string | null;
  validUntil: string | null;
  items: DispensingPrescriptionItem[];
  generalInstructions: string | null;
  dispensedAt: string | null;
  pharmacyName: string | null;
}

export interface DispensePrescriptionResult {
  status: "DISPENSED";
  dispensedAt: string;
  pharmacyName: string;
}

export interface DispensationHistorySummary {
  id: string;
  dispensedAt: string;
  patientName: string;
  doctorName: string;
  pharmacyName: string;
  medicineCount: number;
}

export interface DispensationHistoryDetail {
  id: string;
  dispensedAt: string;
  patientName: string;
  doctorName: string;
  pharmacyName: string;
  pharmacistRegistrationNumber: string;
  dispensingNote: string | null;
  issuedAt: string;
  validUntil: string;
  items: DispensingPrescriptionItem[];
  generalInstructions: string | null;
}

export type DispensationHistoryPage = PageResponse<DispensationHistorySummary>;

import type { AppointmentStatus, AppointmentSymptoms, PageResponse } from "@/types/appointments";
import type { DoctorFeeStatus, DispensingStatus, PrescriptionStatus } from "@/types/prescriptions";

export type ConsultationStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ConsultationSenderType = "PATIENT" | "DOCTOR";
export type ConsultationEventType = "NEW_MESSAGE" | "CONSULTATION_STATUS_CHANGED" | "PAYMENT_STATUS_CHANGED";

export interface ConsultationPaymentSummary {
  prescriptionId: string;
  prescriptionStatus: PrescriptionStatus;
  doctorFeeAmount: number;
  doctorFeeCurrency: string;
  doctorPaymentStatus: DoctorFeeStatus;
  paymentConfirmedAt: string | null;
  qrGenerationAllowed: boolean;
  dispensingStatus: DispensingStatus;
  doctorBankAccountHolder: string | null;
  doctorBankName: string | null;
  doctorBankBranch: string | null;
  doctorBankAccountNumber: string | null;
}

export interface ConsultationDetails {
  id: string;
  appointmentId: string;
  status: ConsultationStatus;
  appointmentStatus: AppointmentStatus;
  cancellationReason: string | null;
  patientName: string;
  doctorName: string;
  hospitalName: string;
  departmentName: string;
  specializationName: string;
  scheduledStart: string;
  scheduledEnd: string;
  symptoms: AppointmentSymptoms;
  chatEnabled: boolean;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  paymentSummary: ConsultationPaymentSummary | null;
}

export interface ConsultationMessage {
  messageId: string;
  consultationId: string;
  senderType: ConsultationSenderType;
  senderDisplayName: string;
  senderProfileImageUrl: string | null;
  content: string | null;
  attachments: ConsultationMessageAttachment[];
  sentAt: string;
}

export interface ConsultationMessageAttachment {
  id: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  originalFilename: string | null;
  byteSize: number;
  position: number;
  signedUrl: string | null;
}

export interface ConsultationEvent {
  eventType: ConsultationEventType;
  consultationId: string;
  message: ConsultationMessage | null;
  status: ConsultationStatus | null;
}

export interface ClinicalNote {
  consultationId: string;
  noteText: string;
  finalized: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export type ConsultationMessagePage = PageResponse<ConsultationMessage>;

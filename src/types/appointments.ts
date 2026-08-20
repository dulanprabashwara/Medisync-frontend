export type SlotStatus = "AVAILABLE" | "RESERVED" | "BOOKED" | "BLOCKED";

export type AppointmentStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED_BY_PATIENT"
  | "CANCELLED_BY_DOCTOR";

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AppointmentSlot {
  id: string;
  availabilityWindowId: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  status: SlotStatus;
}

export interface AvailabilityWindow {
  id: string;
  startsAt: string;
  endsAt: string;
  slotDurationMinutes: number;
  timeZone: string;
  active: boolean;
  createdAt: string;
  slots: AppointmentSlot[];
}

export interface CreateAvailabilityInput {
  startsAt: string;
  endsAt: string;
  slotDurationMinutes: number;
  timeZone: string;
}

export interface DoctorSummary {
  doctorProfileId: string;
  displayName: string;
  hospitalId: string;
  hospitalName: string;
  departmentId: string;
  departmentName: string;
  specializationId: string;
  specializationName: string;
  qualifications: string;
  yearsOfExperience: number;
  bioSummary: string | null;
  verified: boolean;
}

export interface DoctorDetails extends Omit<DoctorSummary, "bioSummary"> {
  bio: string | null;
}

export interface AppointmentSymptoms {
  reasonForVisit: string;
  symptoms: string;
  symptomDuration: string | null;
  additionalNotes: string | null;
}

export interface Appointment {
  id: string;
  slotId: string;
  patientName: string;
  doctorName: string;
  hospitalName: string;
  departmentName: string;
  specializationName: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: AppointmentStatus;
  symptoms: AppointmentSymptoms;
  doctorRejectionReason: string | null;
  cancellationReason: string | null;
  createdAt: string;
  confirmedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  consultationId: string | null;
  consultationStatus: import("@/types/consultations").ConsultationStatus | null;
  chatEnabled: boolean;
}

export interface CreateAppointmentInput {
  slotId: string;
  reasonForVisit: string;
  symptoms: string;
  symptomDuration: string;
  additionalNotes: string;
}

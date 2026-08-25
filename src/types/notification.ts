export type NotificationType =
  | "APPOINTMENT_ACCEPTED"
  | "APPOINTMENT_REJECTED"
  | "CONSULTATION_CANCELLED"
  | "CONSULTATION_STARTED"
  | "NEW_CHAT_MESSAGE"
  | "NEW_CHAT_ATTACHMENT"
  | "PRESCRIPTION_ISSUED"
  | "PRESCRIPTION_CANCELLED"
  | "PAYMENT_CONFIRMED"
  | "PRESCRIPTION_DISPENSED"
  | "NEW_APPOINTMENT_REQUEST"
  | "PATIENT_CANCELLED_APPOINTMENT"
  | "VERIFICATION_APPROVED"
  | "VERIFICATION_REJECTED"
  | "DOCTOR_VERIFICATION_SUBMITTED"
  | "DOCTOR_VERIFICATION_RESUBMITTED"
  | "PHARMACIST_VERIFICATION_SUBMITTED"
  | "PHARMACIST_VERIFICATION_RESUBMITTED"
  | "VIDEO_CALL_STARTED";

export interface NotificationDTO {
  id: string;
  recipientUserId: string;
  actorUserId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  read: boolean;
  readAt?: string | null;
  dedupeKey?: string | null;
  createdAt: string;
}

export interface NotificationPage {
  content: NotificationDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

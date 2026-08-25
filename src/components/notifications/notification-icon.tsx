import React from "react";
import {
  CalendarCheck,
  CalendarX,
  Stethoscope,
  MessageSquare,
  FileText,
  FileX,
  CircleCheck,
  PackageCheck,
  CalendarPlus,
  BadgeCheck,
  ShieldAlert,
  UserCheck,
  ClipboardCheck,
  Bell,
  LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/types/notification";

export function getNotificationIcon(type: NotificationType): LucideIcon {
  switch (type) {
    case "APPOINTMENT_ACCEPTED":
      return CalendarCheck;
    case "APPOINTMENT_REJECTED":
    case "CONSULTATION_CANCELLED":
    case "PATIENT_CANCELLED_APPOINTMENT":
      return CalendarX;
    case "CONSULTATION_STARTED":
      return Stethoscope;
    case "NEW_CHAT_MESSAGE":
    case "NEW_CHAT_ATTACHMENT":
      return MessageSquare;
    case "PRESCRIPTION_ISSUED":
      return FileText;
    case "PRESCRIPTION_CANCELLED":
      return FileX;
    case "PAYMENT_CONFIRMED":
      return CircleCheck;
    case "PRESCRIPTION_DISPENSED":
      return PackageCheck;
    case "NEW_APPOINTMENT_REQUEST":
      return CalendarPlus;
    case "VERIFICATION_APPROVED":
      return BadgeCheck;
    case "VERIFICATION_REJECTED":
      return ShieldAlert;
    case "DOCTOR_VERIFICATION_SUBMITTED":
    case "DOCTOR_VERIFICATION_RESUBMITTED":
      return UserCheck;
    case "PHARMACIST_VERIFICATION_SUBMITTED":
    case "PHARMACIST_VERIFICATION_RESUBMITTED":
      return ClipboardCheck;
    default:
      return Bell;
  }
}

export function NotificationIcon({ type, className }: { type: NotificationType; className?: string }) {
  return React.createElement(getNotificationIcon(type), { className, "aria-hidden": "true" });
}

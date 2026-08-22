import type { AccountStatus, UserRole, VerificationStatus } from "@/types/user";

export interface AdminUserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  status: AccountStatus;
  verificationStatus: VerificationStatus | null;
  professionalRegistrationNumber: string | null;
  hospitalName: string | null;
  departmentName: string | null;
  specializationName: string | null;
  pharmacyName: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastRecordedActivityAt: string;
}

export interface AdminBanHistory {
  id: string;
  reason: string;
  previousStatus: AccountStatus;
  bannedBy: string;
  bannedAt: string;
  unbannedBy: string | null;
  unbannedAt: string | null;
}

export interface AdminUserDetail {
  user: AdminUserSummary;
  roleProfile: Record<string, string | number | boolean>;
  operationalCounts: Record<string, number>;
  banHistory: AdminBanHistory[];
  recentActivity: AuditEvent[];
}

export interface AuditEvent {
  id: string;
  occurredAt: string;
  actorUserId: string | null;
  actorRole: UserRole | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, string | number | boolean | null>;
}

export interface AnalyticsSummary {
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
  professionalVerification: Record<string, number>;
  appointmentsByStatus: Record<string, number>;
  consultationsByStatus: Record<string, number>;
  prescriptionsByStatus: Record<string, number>;
  doctorFeesByStatus: Record<string, number>;
  totalDispensations: number;
  totalChatMessages: number;
  totalChatImages: number;
}

export interface AnalyticsPoint {
  date: string;
  newUsers: number;
  appointments: number;
  consultations: number;
  prescriptions: number;
  dispensations: number;
  chatMessages: number;
}

export interface ActivityRanking {
  userId: string;
  displayName: string;
  activityCount: number;
}

export interface ActivityResponse {
  busiestDoctors: ActivityRanking[];
  mostActivePatients: ActivityRanking[];
  busiestPharmacists: ActivityRanking[];
}

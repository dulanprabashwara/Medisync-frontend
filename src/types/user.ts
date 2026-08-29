export type UserRole = "PATIENT" | "DOCTOR" | "PHARMACIST" | "ADMIN";

export type AccountStatus =
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "SUSPENDED"
  | "DISABLED"
  | "BANNED"
  | "DELETED";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface MediSyncProfile {
  id: string;
  authUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  status: AccountStatus;
  professionalVerificationStatus: VerificationStatus | null;
  profileImageUrl: string | null;
  profileImageUpdatedAt: string | null;
}

export interface AccountStatusDetails {
  status: AccountStatus;
  restrictionReason: string | null;
  restrictedAt: string | null;
}

export interface OnboardingInput {
  firstName: string;
  lastName: string;
  phone: string;
  role: Exclude<UserRole, "ADMIN">;
}

export interface HospitalReference {
  id: string;
  name: string;
  city: string | null;
}

export interface DepartmentReference {
  id: string;
  hospitalId: string;
  name: string;
}

export interface SpecializationReference {
  id: string;
  name: string;
  description: string | null;
}

export interface DoctorProfessionalProfile {
  id: string;
  medicalRegistrationNumber: string | null;
  hospitalId: string | null;
  hospitalName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  specializationId: string | null;
  specializationName: string | null;
  qualifications: string | null;
  yearsOfExperience: number | null;
  bio: string | null;
  verificationStatus: VerificationStatus;
  verificationRejectionReason: string | null;
  submittedForVerificationAt: string | null;
  verifiedAt: string | null;
  profileComplete: boolean;
  submitted: boolean;
  editable: boolean;
  bankAccountHolder: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccountNumber: string | null;
}

export interface DoctorProfileInput {
  medicalRegistrationNumber: string;
  hospitalId: string | null;
  departmentId: string | null;
  specializationId: string | null;
  qualifications: string;
  yearsOfExperience: number | null;
  bio: string;
  bankAccountHolder: string;
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
}

export interface AdminHospital {
  id: string;
  name: string;
  addressLine: string | null;
  city: string | null;
  phone: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  doctorCount: number;
}

export interface AdminDepartment {
  id: string;
  hospitalId: string;
  hospitalName: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  doctorCount: number;
}

export interface AdminSpecialization {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  doctorCount: number;
}

export interface AdminDoctorReview {
  doctorId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  medicalRegistrationNumber: string;
  hospitalId: string;
  hospitalName: string;
  departmentId: string;
  departmentName: string;
  specializationId: string;
  specializationName: string;
  qualifications: string;
  yearsOfExperience: number;
  bio: string | null;
  verificationStatus: VerificationStatus;
  verificationRejectionReason: string | null;
  submittedForVerificationAt: string;
  verifiedAt: string | null;
}

export interface PharmacistProfessionalProfile {
  id: string;
  professionalRegistrationNumber: string | null;
  pharmacyName: string | null;
  pharmacyRegistrationNumber: string | null;
  pharmacyAddress: string | null;
  qualifications: string | null;
  verificationStatus: VerificationStatus;
  verificationRejectionReason: string | null;
  submittedForVerificationAt: string | null;
  verifiedAt: string | null;
  profileComplete: boolean;
  submitted: boolean;
  editable: boolean;
  pharmacyAccessAllowed: boolean;
}

export interface PharmacistProfileInput {
  professionalRegistrationNumber: string;
  pharmacyName: string;
  pharmacyRegistrationNumber: string;
  pharmacyAddress: string;
  qualifications: string;
}

export interface AdminPharmacistReview {
  pharmacistId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  professionalRegistrationNumber: string;
  pharmacyName: string;
  pharmacyRegistrationNumber: string | null;
  pharmacyAddress: string;
  qualifications: string | null;
  verificationStatus: VerificationStatus;
  verificationRejectionReason: string | null;
  submittedForVerificationAt: string;
  verifiedAt: string | null;
}

export const dashboardPath = (role: UserRole): string =>
  `/${role.toLowerCase()}/dashboard`;

export const professionalProfilePath = (role: UserRole): string | null => {
  if (role === "DOCTOR") return "/doctor/profile";
  if (role === "PHARMACIST") return "/pharmacist/profile";
  return null;
};

export const requiresProfessionalVerification = (
  profile: Pick<
    MediSyncProfile,
    "role" | "status" | "professionalVerificationStatus"
  >,
): boolean =>
  (profile.role === "DOCTOR" || profile.role === "PHARMACIST") &&
  (profile.status === "PENDING_VERIFICATION" ||
    profile.professionalVerificationStatus !== "VERIFIED");

export const portalEntryPath = (
  profile: Pick<
    MediSyncProfile,
    "role" | "status" | "professionalVerificationStatus"
  >,
): string => {
  if (profile.status === "DELETED") return "/account-deleted";
  if (profile.status === "BANNED") return "/account-restricted";
  return requiresProfessionalVerification(profile)
    ? (professionalProfilePath(profile.role) ?? dashboardPath(profile.role))
    : dashboardPath(profile.role);
};

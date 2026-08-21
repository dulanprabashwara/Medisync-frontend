export type UserRole = "PATIENT" | "DOCTOR" | "PHARMACIST" | "ADMIN";

export type AccountStatus =
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "SUSPENDED"
  | "DISABLED";

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
}

export interface DoctorProfileInput {
  medicalRegistrationNumber: string;
  hospitalId: string | null;
  departmentId: string | null;
  specializationId: string | null;
  qualifications: string;
  yearsOfExperience: number | null;
  bio: string;
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
}

export interface AdminDepartment {
  id: string;
  hospitalId: string;
  hospitalName: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSpecialization {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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

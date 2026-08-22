import type {
  AdminDepartment,
  AdminDoctorReview,
  AdminPharmacistReview,
  AdminHospital,
  AdminSpecialization,
  DepartmentReference,
  DoctorProfessionalProfile,
  DoctorProfileInput,
  HospitalReference,
  MediSyncProfile,
  OnboardingInput,
  PharmacistProfessionalProfile,
  PharmacistProfileInput,
  SpecializationReference,
  AccountStatusDetails,
} from "@/types/user";
import type {
  Appointment,
  AppointmentSlot,
  AppointmentStatus,
  AvailabilityWindow,
  CreateAppointmentInput,
  CreateAvailabilityInput,
  DoctorDetails,
  DoctorSummary,
  PageResponse,
} from "@/types/appointments";
import type {
  ClinicalNote,
  ConsultationDetails,
  ConsultationMessage,
  ConsultationMessagePage,
} from "@/types/consultations";
import type {
  DoctorPrescription,
  PatientPrescriptionDetail,
  PatientPrescriptionSummary,
  PrescriptionDraftInput,
  PrescriptionQrResponse,
} from "@/types/prescriptions";
import type {
  DispensationHistoryDetail,
  DispensationHistoryPage,
  DispensePrescriptionResult,
  PharmacyPrescriptionVerification,
} from "@/types/pharmacy";
import type {
  ActivityResponse,
  AdminUserDetail,
  AdminUserSummary,
  AnalyticsPoint,
  AnalyticsSummary,
  AuditEvent,
} from "@/types/admin";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AccountStatus, UserRole, VerificationStatus } from "@/types/user";

interface ApiErrorBody {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
).replace(/\/$/, "");

let latestAccessToken: string | null = null;

export function setLatestApiAccessToken(accessToken: string | null) {
  latestAccessToken = accessToken;
}

export function getConsultationWebSocketUrl() {
  const url = new URL(apiBaseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}/ws`;
  url.search = "";
  url.hash = "";
  return url.toString();
}

async function apiRequest<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
  authenticationRetry = true,
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  const abortFromCaller = () => controller.abort();
  init.signal?.addEventListener("abort", abortFromCaller, { once: true });
  try {
    const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${latestAccessToken || accessToken}`,
        ...(init.body && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      cache: "no-store",
    });

    if (response.status === 401 && authenticationRetry) {
      const { data, error } = await getSupabaseBrowserClient().auth.refreshSession();
      if (!error && data.session?.access_token) {
        setLatestApiAccessToken(data.session.access_token);
        return apiRequest<T>(path, data.session.access_token, init, false);
      }
    }
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody | T;
    if (!response.ok) {
      const errorBody = body as ApiErrorBody;
      throw new ApiError(
        response.status,
        errorBody.error || "REQUEST_FAILED",
        errorBody.message || "The request could not be completed.",
        errorBody.fieldErrors,
      );
    }
    return body as T;
  } catch (requestError) {
    if (requestError instanceof ApiError) throw requestError;
    throw new ApiError(
      0,
      controller.signal.aborted ? "REQUEST_TIMEOUT" : "BACKEND_UNAVAILABLE",
      controller.signal.aborted
        ? "The MediSync API did not respond in time. Check that the backend is running, then try again."
        : "The MediSync API is unavailable. Check that the backend is running.",
    );
  } finally {
    window.clearTimeout(timeout);
    init.signal?.removeEventListener("abort", abortFromCaller);
  }
}

export const getMyProfile = (accessToken: string) =>
  apiRequest<MediSyncProfile>("/api/users/me", accessToken);

export const getMyAccountStatus = (accessToken: string) =>
  apiRequest<AccountStatusDetails>("/api/users/me/account-status", accessToken);

export const uploadMyProfileImage = (accessToken: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<MediSyncProfile>("/api/users/me/profile-image", accessToken, {
    method: "POST",
    body: form,
  });
};

export const removeMyProfileImage = (accessToken: string) =>
  apiRequest<MediSyncProfile>("/api/users/me/profile-image", accessToken, { method: "DELETE" });

export const completeOnboarding = (
  accessToken: string,
  input: OnboardingInput,
) =>
  apiRequest<MediSyncProfile>("/api/users/onboarding", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getDoctorProfile = (accessToken: string) =>
  apiRequest<DoctorProfessionalProfile>("/api/doctor/profile", accessToken);

export const updateDoctorProfile = (accessToken: string, input: DoctorProfileInput) =>
  apiRequest<DoctorProfessionalProfile>("/api/doctor/profile", accessToken, {
    method: "PUT",
    body: JSON.stringify(input),
  });

export const submitDoctorVerification = (accessToken: string) =>
  apiRequest<DoctorProfessionalProfile>(
    "/api/doctor/profile/submit-verification",
    accessToken,
    { method: "POST" },
  );

export const getReferenceHospitals = (accessToken: string) =>
  apiRequest<HospitalReference[]>("/api/reference/hospitals", accessToken);

export const getReferenceDepartments = (accessToken: string, hospitalId: string) =>
  apiRequest<DepartmentReference[]>(
    `/api/reference/hospitals/${hospitalId}/departments`,
    accessToken,
  );

export const getReferenceSpecializations = (accessToken: string) =>
  apiRequest<SpecializationReference[]>("/api/reference/specializations", accessToken);

export const getAdminHospitals = (accessToken: string) =>
  apiRequest<AdminHospital[]>("/api/admin/hospitals", accessToken);

export const createAdminHospital = (
  accessToken: string,
  input: Omit<AdminHospital, "id" | "createdAt" | "updatedAt" | "doctorCount">,
) => apiRequest<AdminHospital>("/api/admin/hospitals", accessToken, {
  method: "POST",
  body: JSON.stringify(input),
});

export const updateAdminHospital = (
  accessToken: string,
  hospital: Omit<AdminHospital, "createdAt" | "updatedAt" | "doctorCount">,
) => apiRequest<AdminHospital>(`/api/admin/hospitals/${hospital.id}`, accessToken, {
  method: "PUT",
  body: JSON.stringify(hospital),
});

export const getAdminDepartments = (accessToken: string) =>
  apiRequest<AdminDepartment[]>("/api/admin/departments", accessToken);

export const createAdminDepartment = (
  accessToken: string,
  input: Pick<AdminDepartment, "hospitalId" | "name" | "active">,
) => apiRequest<AdminDepartment>("/api/admin/departments", accessToken, {
  method: "POST",
  body: JSON.stringify(input),
});

export const updateAdminDepartment = (
  accessToken: string,
  department: Pick<AdminDepartment, "id" | "hospitalId" | "name" | "active">,
) => apiRequest<AdminDepartment>(`/api/admin/departments/${department.id}`, accessToken, {
  method: "PUT",
  body: JSON.stringify(department),
});

export const getAdminSpecializations = (accessToken: string) =>
  apiRequest<AdminSpecialization[]>("/api/admin/specializations", accessToken);

export const createAdminSpecialization = (
  accessToken: string,
  input: Pick<AdminSpecialization, "name" | "description" | "active">,
) => apiRequest<AdminSpecialization>("/api/admin/specializations", accessToken, {
  method: "POST",
  body: JSON.stringify(input),
});

export const updateAdminSpecialization = (
  accessToken: string,
  specialization: Pick<AdminSpecialization, "id" | "name" | "description" | "active">,
) => apiRequest<AdminSpecialization>(
  `/api/admin/specializations/${specialization.id}`,
  accessToken,
  { method: "PUT", body: JSON.stringify(specialization) },
);

export const getPendingDoctors = (accessToken: string) =>
  apiRequest<AdminDoctorReview[]>("/api/admin/doctors/pending", accessToken);

export const verifyDoctor = (accessToken: string, doctorId: string) =>
  apiRequest<AdminDoctorReview>(`/api/admin/doctors/${doctorId}/verify`, accessToken, {
    method: "POST",
  });

export const rejectDoctor = (accessToken: string, doctorId: string, reason: string) =>
  apiRequest<AdminDoctorReview>(`/api/admin/doctors/${doctorId}/reject`, accessToken, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const getPharmacistProfessionalProfile = (accessToken: string) =>
  apiRequest<PharmacistProfessionalProfile>("/api/pharmacist/professional-profile", accessToken);

export const updatePharmacistProfessionalProfile = (
  accessToken: string,
  input: PharmacistProfileInput,
) => apiRequest<PharmacistProfessionalProfile>("/api/pharmacist/professional-profile", accessToken, {
  method: "PUT",
  body: JSON.stringify(input),
});

export const submitPharmacistVerification = (accessToken: string) =>
  apiRequest<PharmacistProfessionalProfile>(
    "/api/pharmacist/professional-profile/submit-verification",
    accessToken,
    { method: "POST" },
  );

export const getPendingPharmacists = (accessToken: string) =>
  apiRequest<AdminPharmacistReview[]>("/api/admin/pharmacists/pending", accessToken);

export const verifyPharmacist = (accessToken: string, pharmacistId: string) =>
  apiRequest<AdminPharmacistReview>(`/api/admin/pharmacists/${pharmacistId}/verify`, accessToken, {
    method: "POST",
  });

export const rejectPharmacist = (accessToken: string, pharmacistId: string, reason: string) =>
  apiRequest<AdminPharmacistReview>(`/api/admin/pharmacists/${pharmacistId}/reject`, accessToken, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const getDoctorAvailability = (accessToken: string) =>
  apiRequest<AvailabilityWindow[]>("/api/doctor/availability", accessToken);

export const createDoctorAvailability = (accessToken: string, input: CreateAvailabilityInput) =>
  apiRequest<AvailabilityWindow>("/api/doctor/availability", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const deactivateDoctorAvailability = (accessToken: string, windowId: string) =>
  apiRequest<AvailabilityWindow>(`/api/doctor/availability/${windowId}/deactivate`, accessToken, {
    method: "PATCH",
  });

export const setDoctorSlotBlocked = (accessToken: string, slotId: string, blocked: boolean) =>
  apiRequest<AppointmentSlot>(
    `/api/doctor/availability/slots/${slotId}/${blocked ? "block" : "unblock"}`,
    accessToken,
    { method: "POST" },
  );

export interface DoctorSearchFilters {
  q?: string;
  hospitalId?: string;
  departmentId?: string;
  specializationId?: string;
  page?: number;
  size?: number;
}

export const searchPatientDoctors = (accessToken: string, filters: DoctorSearchFilters) => {
  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  if (filters.hospitalId) query.set("hospitalId", filters.hospitalId);
  if (filters.departmentId) query.set("departmentId", filters.departmentId);
  if (filters.specializationId) query.set("specializationId", filters.specializationId);
  query.set("page", String(filters.page ?? 0));
  query.set("size", String(filters.size ?? 10));
  return apiRequest<PageResponse<DoctorSummary>>(`/api/patient/doctors?${query}`, accessToken);
};

export const getPatientDoctor = (accessToken: string, doctorId: string) =>
  apiRequest<DoctorDetails>(`/api/patient/doctors/${doctorId}`, accessToken);

export const getPatientDoctorSlots = (
  accessToken: string,
  doctorId: string,
  from: string,
  to: string,
) => apiRequest<AppointmentSlot[]>(
  `/api/patient/doctors/${doctorId}/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  accessToken,
);

export const createPatientAppointment = (accessToken: string, input: CreateAppointmentInput) =>
  apiRequest<Appointment>("/api/patient/appointments", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getPatientAppointments = (accessToken: string, page = 0, size = 50) =>
  apiRequest<PageResponse<Appointment>>(
    `/api/patient/appointments?page=${page}&size=${size}`,
    accessToken,
  );

export const cancelPatientAppointment = (accessToken: string, appointmentId: string, reason: string) =>
  apiRequest<Appointment>(`/api/patient/appointments/${appointmentId}/cancel`, accessToken, {
    method: "POST",
    body: JSON.stringify({ reason: reason || null }),
  });

export const getDoctorAppointments = (
  accessToken: string,
  status?: AppointmentStatus,
  page = 0,
  size = 50,
) => {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) query.set("status", status);
  return apiRequest<PageResponse<Appointment>>(`/api/doctor/appointments?${query}`, accessToken);
};

export const acceptDoctorAppointment = (accessToken: string, appointmentId: string) =>
  apiRequest<Appointment>(`/api/doctor/appointments/${appointmentId}/accept`, accessToken, {
    method: "POST",
  });

export const rejectDoctorAppointment = (accessToken: string, appointmentId: string, reason: string) =>
  apiRequest<Appointment>(`/api/doctor/appointments/${appointmentId}/reject`, accessToken, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const cancelDoctorAppointment = (accessToken: string, appointmentId: string, reason: string) =>
  apiRequest<Appointment>(`/api/doctor/appointments/${appointmentId}/cancel`, accessToken, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const getPatientConsultation = (accessToken: string, consultationId: string) =>
  apiRequest<ConsultationDetails>(`/api/patient/consultations/${consultationId}`, accessToken);

export const getPatientConsultationMessages = (
  accessToken: string,
  consultationId: string,
  page = 0,
  size = 100,
) => apiRequest<ConsultationMessagePage>(
  `/api/patient/consultations/${consultationId}/messages?page=${page}&size=${size}`,
  accessToken,
);

export const sendPatientConsultationMessage = (
  accessToken: string,
  consultationId: string,
  content: string,
  images: File[] = [],
) => sendConsultationMessage("patient", accessToken, consultationId, content, images);

export const getDoctorConsultation = (accessToken: string, consultationId: string) =>
  apiRequest<ConsultationDetails>(`/api/doctor/consultations/${consultationId}`, accessToken);

export const getDoctorConsultationMessages = (
  accessToken: string,
  consultationId: string,
  page = 0,
  size = 100,
) => apiRequest<ConsultationMessagePage>(
  `/api/doctor/consultations/${consultationId}/messages?page=${page}&size=${size}`,
  accessToken,
);

export const sendDoctorConsultationMessage = (
  accessToken: string,
  consultationId: string,
  content: string,
  images: File[] = [],
) => sendConsultationMessage("doctor", accessToken, consultationId, content, images);

function sendConsultationMessage(
  role: "patient" | "doctor",
  accessToken: string,
  consultationId: string,
  content: string,
  images: File[],
) {
  const path = `/api/${role}/consultations/${consultationId}/messages`;
  if (images.length === 0) {
    return apiRequest<ConsultationMessage>(path, accessToken, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }
  const form = new FormData();
  if (content.trim()) form.append("content", content.trim());
  images.forEach((image) => form.append("images", image));
  return apiRequest<ConsultationMessage>(path, accessToken, { method: "POST", body: form });
}

export const startDoctorConsultation = (accessToken: string, consultationId: string) =>
  apiRequest<ConsultationDetails>(`/api/doctor/consultations/${consultationId}/start`, accessToken, {
    method: "POST",
  });

export const completeDoctorConsultation = (accessToken: string, consultationId: string) =>
  apiRequest<ConsultationDetails>(`/api/doctor/consultations/${consultationId}/complete`, accessToken, {
    method: "POST",
  });

export const getDoctorClinicalNote = (accessToken: string, consultationId: string) =>
  apiRequest<ClinicalNote>(`/api/doctor/consultations/${consultationId}/clinical-note`, accessToken);

export const updateDoctorClinicalNote = (
  accessToken: string,
  consultationId: string,
  noteText: string,
) => apiRequest<ClinicalNote>(
  `/api/doctor/consultations/${consultationId}/clinical-note`,
  accessToken,
  { method: "PUT", body: JSON.stringify({ noteText }) },
);

export const getDoctorPrescriptions = (accessToken: string, page = 0, size = 20) =>
  apiRequest<PageResponse<DoctorPrescription>>(`/api/doctor/prescriptions?page=${page}&size=${size}`, accessToken);

export const getDoctorPrescription = (accessToken: string, id: string) =>
  apiRequest<DoctorPrescription>(`/api/doctor/prescriptions/${id}`, accessToken);

export const getConsultationPrescriptions = (accessToken: string, consultationId: string) =>
  apiRequest<DoctorPrescription[]>(`/api/doctor/consultations/${consultationId}/prescriptions`, accessToken);

export const createPrescriptionDraft = (accessToken: string, consultationId: string) =>
  apiRequest<DoctorPrescription>(`/api/doctor/consultations/${consultationId}/prescriptions`, accessToken, { method: "POST" });

export const updatePrescriptionDraft = (accessToken: string, id: string, input: PrescriptionDraftInput) =>
  apiRequest<DoctorPrescription>(`/api/doctor/prescriptions/${id}`, accessToken, { method: "PUT", body: JSON.stringify(input) });

export const issuePrescription = (accessToken: string, id: string) =>
  apiRequest<DoctorPrescription>(`/api/doctor/prescriptions/${id}/issue`, accessToken, { method: "POST" });

export const confirmPrescriptionPayment = (accessToken: string, id: string) =>
  apiRequest<DoctorPrescription>(`/api/doctor/prescriptions/${id}/confirm-payment`, accessToken, {
    method: "POST",
  });

export const cancelPrescription = (accessToken: string, id: string, reason: string) =>
  apiRequest<DoctorPrescription>(`/api/doctor/prescriptions/${id}/cancel`, accessToken, { method: "POST", body: JSON.stringify({ reason }) });

export const discardPrescriptionDraft = (accessToken: string, id: string) =>
  apiRequest<void>(`/api/doctor/prescriptions/${id}`, accessToken, { method: "DELETE" });

export const getPatientPrescriptions = (accessToken: string, page = 0, size = 20) =>
  apiRequest<PageResponse<PatientPrescriptionSummary>>(`/api/patient/prescriptions?page=${page}&size=${size}`, accessToken);

export const getPatientPrescription = (accessToken: string, id: string) =>
  apiRequest<PatientPrescriptionDetail>(`/api/patient/prescriptions/${id}`, accessToken);

export const generatePatientPrescriptionQr = (accessToken: string, id: string) =>
  apiRequest<PrescriptionQrResponse>(`/api/patient/prescriptions/${id}/qr`, accessToken, { method: "POST" });

export const verifyPharmacistPrescription = (accessToken: string, qrPayload: string) =>
  apiRequest<PharmacyPrescriptionVerification>("/api/pharmacist/prescriptions/verify", accessToken, {
    method: "POST",
    body: JSON.stringify({ qrPayload }),
  });

export const dispensePharmacistPrescription = (
  accessToken: string,
  qrPayload: string,
  note: string,
) => apiRequest<DispensePrescriptionResult>("/api/pharmacist/prescriptions/dispense", accessToken, {
  method: "POST",
  body: JSON.stringify({ qrPayload, note: note.trim() || null }),
});

export const getPharmacistDispensations = (accessToken: string, page = 0, size = 20) =>
  apiRequest<DispensationHistoryPage>(`/api/pharmacist/dispensations?page=${page}&size=${size}`, accessToken);

export const getPharmacistDispensation = (accessToken: string, id: string) =>
  apiRequest<DispensationHistoryDetail>(`/api/pharmacist/dispensations/${id}`, accessToken);

export interface AdminUserFilters {
  q?: string;
  role?: UserRole;
  status?: AccountStatus;
  verificationStatus?: VerificationStatus;
  hospitalId?: string;
  departmentId?: string;
  specializationId?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  size?: number;
}

export const getAdminUsers = (accessToken: string, filters: AdminUserFilters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  query.set("page", String(filters.page ?? 0));
  query.set("size", String(filters.size ?? 20));
  return apiRequest<PageResponse<AdminUserSummary>>(`/api/admin/users?${query}`, accessToken);
};

export const getAdminDoctors = (accessToken: string, filters: Omit<AdminUserFilters, "role"> = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (key !== "role" && value !== undefined && value !== "") query.set(key, String(value));
  });
  query.set("page", String(filters.page ?? 0));
  query.set("size", String(filters.size ?? 20));
  return apiRequest<PageResponse<AdminUserSummary>>(`/api/admin/doctors?${query}`, accessToken);
};

export const getAdminUser = (accessToken: string, userId: string) =>
  apiRequest<AdminUserDetail>(`/api/admin/users/${userId}`, accessToken);

export const banAdminUser = (accessToken: string, userId: string, reason: string) =>
  apiRequest<AdminUserDetail>(`/api/admin/users/${userId}/ban`, accessToken, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const unbanAdminUser = (accessToken: string, userId: string) =>
  apiRequest<AdminUserDetail>(`/api/admin/users/${userId}/unban`, accessToken, { method: "POST" });

export interface AuditFilters {
  action?: string;
  actorUserId?: string;
  actorRole?: UserRole;
  targetType?: string;
  targetId?: string;
  targetUserId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const getAdminAuditEvents = (accessToken: string, filters: AuditFilters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  query.set("page", String(filters.page ?? 0));
  query.set("size", String(filters.size ?? 50));
  return apiRequest<PageResponse<AuditEvent>>(`/api/admin/audit-logs?${query}`, accessToken);
};

export const getAdminAnalyticsSummary = (accessToken: string) =>
  apiRequest<AnalyticsSummary>("/api/admin/analytics/summary", accessToken);

export const getAdminAnalyticsTimeseries = (accessToken: string, days: 7 | 30 | 90) =>
  apiRequest<AnalyticsPoint[]>(`/api/admin/analytics/timeseries?days=${days}`, accessToken);

export const getAdminAnalyticsActivity = (accessToken: string, days: 7 | 30 | 90) =>
  apiRequest<ActivityResponse>(`/api/admin/analytics/user-activity?days=${days}`, accessToken);

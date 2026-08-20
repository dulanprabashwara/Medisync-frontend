import type {
  AdminDepartment,
  AdminDoctorReview,
  AdminHospital,
  AdminSpecialization,
  DepartmentReference,
  DoctorProfessionalProfile,
  DoctorProfileInput,
  HospitalReference,
  MediSyncProfile,
  OnboardingInput,
  SpecializationReference,
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
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      0,
      "BACKEND_UNAVAILABLE",
      "The MediSync API is unavailable. Check that the backend is running.",
    );
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
}

export const getMyProfile = (accessToken: string) =>
  apiRequest<MediSyncProfile>("/api/users/me", accessToken);

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
  input: Omit<AdminHospital, "id" | "createdAt" | "updatedAt">,
) => apiRequest<AdminHospital>("/api/admin/hospitals", accessToken, {
  method: "POST",
  body: JSON.stringify(input),
});

export const updateAdminHospital = (
  accessToken: string,
  hospital: Omit<AdminHospital, "createdAt" | "updatedAt">,
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
) => apiRequest<ConsultationMessage>(
  `/api/patient/consultations/${consultationId}/messages`,
  accessToken,
  { method: "POST", body: JSON.stringify({ content }) },
);

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
) => apiRequest<ConsultationMessage>(
  `/api/doctor/consultations/${consultationId}/messages`,
  accessToken,
  { method: "POST", body: JSON.stringify({ content }) },
);

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

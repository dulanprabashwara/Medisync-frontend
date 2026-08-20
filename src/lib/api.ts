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

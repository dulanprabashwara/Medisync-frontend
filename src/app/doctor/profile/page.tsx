"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalHeading } from "@/components/portal-ui";
import { ProfileImageEditor } from "@/components/profile-image-editor";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { AccountSettingsDangerZone } from "@/components/account-settings-danger-zone";
import { SectionCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/forms";
import { Alert } from "@/components/ui/alert";
import { LoadingPanel } from "@/components/loading-panel";
import {
  getDoctorProfile,
  getReferenceDepartments,
  getReferenceHospitals,
  getReferenceSpecializations,
  submitDoctorVerification,
  updateDoctorProfile,
  updatePatientProfile as updateMyProfile,
} from "@/lib/api";
import type {
  DepartmentReference,
  DoctorProfessionalProfile,
  DoctorProfileInput,
  HospitalReference,
  SpecializationReference,
} from "@/types/user";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

function DoctorProfileContent() {
  const { profile: user, session, refreshProfile } = useAuth();

  // Personal Info State
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);

  // Professional Info State
  const [doctor, setDoctor] = useState<DoctorProfessionalProfile | null>(null);
  const [hospitals, setHospitals] = useState<HospitalReference[]>([]);
  const [departments, setDepartments] = useState<DepartmentReference[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationReference[]>([]);
  
  const emptyForm: DoctorProfileInput = {
    medicalRegistrationNumber: "", hospitalId: null, departmentId: null, specializationId: null,
    qualifications: "", yearsOfExperience: null, bio: "",
    bankAccountHolder: "", bankName: "", bankBranch: "", bankAccountNumber: "",
  };
  
  const [form, setForm] = useState<DoctorProfileInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [busy, setBusy] = useState<"save" | "submit" | null>(null);
  const [professionalError, setProfessionalError] = useState<string | null>(null);

  const applyProfile = useCallback((value: DoctorProfessionalProfile) => {
    setDoctor(value);
    setForm({
      medicalRegistrationNumber: value.medicalRegistrationNumber ?? "",
      hospitalId: value.hospitalId,
      departmentId: value.departmentId,
      specializationId: value.specializationId,
      qualifications: value.qualifications ?? "",
      yearsOfExperience: value.yearsOfExperience,
      bio: value.bio ?? "",
      bankAccountHolder: value.bankAccountHolder ?? "",
      bankName: value.bankName ?? "",
      bankBranch: value.bankBranch ?? "",
      bankAccountNumber: value.bankAccountNumber ?? "",
    });
  }, []);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setProfessionalError(null);
    try {
      const [profileValue, hospitalValues, specializationValues] = await Promise.all([
        getDoctorProfile(session.access_token),
        getReferenceHospitals(session.access_token),
        getReferenceSpecializations(session.access_token),
      ]);
      applyProfile(profileValue);
      setHospitals(hospitalValues);
      setSpecializations(specializationValues);
      setDepartments(
        profileValue.hospitalId
          ? await getReferenceDepartments(session.access_token, profileValue.hospitalId)
          : []
      );
    } catch (loadError) {
      setProfessionalError(loadError instanceof Error ? loadError.message : "The professional profile could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [applyProfile, session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  // Personal Info Handlers
  async function handleSavePersonal(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setIsSavingPersonal(true);
    setPersonalError(null);
    try {
      await updateMyProfile(session.access_token, { firstName, lastName, phone: phone || null });
      await refreshProfile();
      setIsEditingPersonal(false);
      toast.success("Personal information updated.");
    } catch (err) {
      setPersonalError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSavingPersonal(false);
    }
  }

  function handleCancelPersonal() {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setPhone(user?.phone ?? "");
    setIsEditingPersonal(false);
    setPersonalError(null);
  }

  // Professional Info Handlers
  async function chooseHospital(hospitalId: string) {
    setForm((current) => ({ ...current, hospitalId: hospitalId || null, departmentId: null }));
    setDepartments([]);
    if (!session || !hospitalId) return;
    setDepartmentsLoading(true);
    try {
      setDepartments(await getReferenceDepartments(session.access_token, hospitalId));
    } catch (departmentError) {
      setProfessionalError(departmentError instanceof Error ? departmentError.message : "Departments could not be loaded.");
    } finally {
      setDepartmentsLoading(false);
    }
  }

  async function saveProfessional(event?: React.FormEvent) {
    event?.preventDefault();
    if (!session) return;
    setBusy("save");
    setProfessionalError(null);
    try {
      applyProfile(await updateDoctorProfile(session.access_token, form));
      toast.success("Profile changes saved.");
    } catch (saveError) {
      setProfessionalError(saveError instanceof Error ? saveError.message : "The profile could not be saved.");
    } finally {
      setBusy(null);
    }
  }

  async function submitVerification() {
    if (!session) return;
    if (
      !form.medicalRegistrationNumber.trim() || !form.hospitalId || !form.departmentId ||
      !form.specializationId || !form.qualifications.trim() || form.yearsOfExperience === null
    ) {
      setProfessionalError("Complete every required professional field before submitting.");
      return;
    }
    setBusy("submit");
    setProfessionalError(null);
    try {
      await updateDoctorProfile(session.access_token, form);
      applyProfile(await submitDoctorVerification(session.access_token));
      await refreshProfile();
      toast.success("Professional profile submitted for administrator approval.");
    } catch (submitError) {
      setProfessionalError(submitError instanceof Error ? submitError.message : "The profile could not be submitted.");
    } finally {
      setBusy(null);
    }
  }

  if (loading || !doctor) return <LoadingPanel label="Loading your professional profile..." />;

  const verified = doctor.verificationStatus === "VERIFIED";
  const pending = doctor.submitted && doctor.verificationStatus === "PENDING";
  const rejected = doctor.verificationStatus === "REJECTED";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PortalHeading
        eyebrow="DOCTOR ACCOUNT"
        title="Profile"
        description="Manage your personal, professional and payment information."
        backHref="/doctor/dashboard"
      />

      <div className="space-y-8">
        
        {/* 1. Personal Information */}
        <SectionCard title="Personal Information">
          {personalError && <Alert tone="error" className="mb-6">{personalError}</Alert>}
          
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <div className="w-full md:w-56 shrink-0">
              <ProfileImageEditor compact />
            </div>
            
            <div className="flex-1 min-w-0">
              {isEditingPersonal ? (
                <form onSubmit={handleSavePersonal} className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
                  </div>
                  <div className="col-span-full flex items-center gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="ghost" onClick={handleCancelPersonal} disabled={isSavingPersonal}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSavingPersonal}>
                      {isSavingPersonal ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-slate-500">First Name</p>
                      <p className="mt-1 text-slate-900 font-medium">{user?.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Last Name</p>
                      <p className="mt-1 text-slate-900 font-medium">{user?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Phone</p>
                      <p className="mt-1 text-slate-900 font-medium">{user?.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button variant="secondary" onClick={() => setIsEditingPersonal(true)}>
                      Edit Personal Information
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* 2. Professional Information */}
        <SectionCard title="Professional Information">
          {professionalError && <Alert tone="error" className="mb-6">{professionalError}</Alert>}

          <form onSubmit={saveProfessional} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="medRegNum">Medical Registration Number <span className="text-rose-600">*</span></Label>
                <Input
                  id="medRegNum"
                  maxLength={100}
                  value={form.medicalRegistrationNumber}
                  disabled={verified || doctor.submitted}
                  onChange={(e) => setForm({ ...form, medicalRegistrationNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExp">Years of Experience <span className="text-rose-600">*</span></Label>
                <Input
                  id="yearsExp"
                  type="number"
                  min={0}
                  value={form.yearsOfExperience ?? ""}
                  disabled={verified || doctor.submitted}
                  onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value === "" ? null : Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital">Affiliated Hospital <span className="text-rose-600">*</span></Label>
                <select
                  id="hospital"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:bg-slate-50 disabled:text-slate-500"
                  value={form.hospitalId ?? ""}
                  onChange={(e) => void chooseHospital(e.target.value)}
                  disabled={verified || doctor.submitted}
                  required
                >
                  <option value="">Select affiliated hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}{hospital.city ? ` - ${hospital.city}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department <span className="text-rose-600">*</span></Label>
                <select
                  id="department"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={verified || doctor.submitted || !form.hospitalId || departmentsLoading}
                  value={form.departmentId ?? ""}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value || null })}
                  required
                >
                  <option value="">{departmentsLoading ? "Loading departments..." : "Select department"}</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization <span className="text-rose-600">*</span></Label>
                <select
                  id="specialization"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:bg-slate-50 disabled:text-slate-500"
                  value={form.specializationId ?? ""}
                  disabled={verified || doctor.submitted}
                  onChange={(e) => setForm({ ...form, specializationId: e.target.value || null })}
                  required
                >
                  <option value="">Select specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications <span className="text-rose-600">*</span></Label>
                <Input
                  id="qualifications"
                  maxLength={500}
                  placeholder="MBBS, MD"
                  disabled={verified || doctor.submitted}
                  value={form.qualifications}
                  onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <textarea
                id="bio"
                className="w-full min-h-24 resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                maxLength={2000}
                disabled={doctor.submitted}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
              <Button type="submit" variant="secondary" disabled={busy !== null || doctor.submitted}>
                {busy === "save" ? "Saving..." : "Save Professional Information"}
              </Button>
              {!verified && !doctor.submitted ? (
                <Button type="button" onClick={() => void submitVerification()} disabled={busy !== null}>
                  {busy === "submit"
                    ? "Submitting..."
                    : rejected
                      ? "Save and resubmit for verification"
                      : "Save and submit for verification"}
                </Button>
              ) : null}
            </div>
          </form>
        </SectionCard>

        {/* 3. Verification */}
        <SectionCard title="Professional Verification">
          {verified ? (
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Verified ✓</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Your professional profile has been approved. Sensitive identity fields are now locked.
                </p>
              </div>
            </div>
          ) : rejected ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-rose-100 p-2 text-rose-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Verification Requires Attention</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-semibold">Reason:</span> {doctor.verificationRejectionReason}
                  </p>
                </div>
              </div>
              <Button onClick={submitVerification} disabled={busy !== null} className="w-fit">
                {busy === "submit" ? "Submitting..." : "Edit & Resubmit"}
              </Button>
            </div>
          ) : pending ? (
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Pending Verification</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Your profile has been submitted and is waiting for administrator approval.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-slate-100 p-2 text-slate-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Not Submitted</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Complete your professional profile and submit it for verification.
                  </p>
                </div>
              </div>
              <Button 
                onClick={submitVerification} 
                disabled={busy !== null || hospitals.length === 0 || specializations.length === 0}
                className="w-fit"
              >
                {busy === "submit" ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          )}
        </SectionCard>

        {/* 4. Payment Information */}
        <SectionCard title="Payment Information">
          {!form.bankAccountNumber && !form.bankName ? (
            <Alert tone="warning" className="mb-6">
              <div className="font-semibold text-amber-900">Not configured</div>
              <p className="text-amber-800">Add payment information before issuing paid prescriptions.</p>
            </Alert>
          ) : (
            <Alert tone="success" className="mb-6">
              Configured ✓
            </Alert>
          )}

          <form onSubmit={saveProfessional} className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bankAccountHolder">Account Holder Name</Label>
              <Input
                id="bankAccountHolder"
                maxLength={200}
                value={form.bankAccountHolder}
                onChange={(e) => setForm({ ...form, bankAccountHolder: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                maxLength={100}
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankBranch">Branch</Label>
              <Input
                id="bankBranch"
                maxLength={100}
                value={form.bankBranch}
                onChange={(e) => setForm({ ...form, bankBranch: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccountNumber">Account Number</Label>
              <Input
                id="bankAccountNumber"
                maxLength={50}
                value={form.bankAccountNumber}
                onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
              />
            </div>
            <div className="col-span-full pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" disabled={busy !== null} variant="secondary">
                {busy === "save" ? "Saving..." : "Save Payment Information"}
              </Button>
            </div>
          </form>
        </SectionCard>

        {/* 5. Account Information */}
        <SectionCard title="Account Information">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Email</p>
              <p className="mt-1 text-slate-900 font-medium">{user?.email}</p>
              <p className="mt-1 text-xs text-slate-400">Read only</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Role</p>
              <p className="mt-1 text-slate-900 font-medium">Doctor</p>
              <p className="mt-1 text-xs text-slate-400">Read only</p>
            </div>
          </div>
        </SectionCard>

        {/* 6. Danger Zone */}
        <AccountSettingsDangerZone />
      </div>
    </div>
  );
}

export default function DoctorProfilePage() {
  return (
    <ProtectedRoute roles={["DOCTOR"]}>
      <DoctorProfileContent />
    </ProtectedRoute>
  );
}


"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FormAlert, inputClassName } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { ProtectedRoute } from "@/components/protected-route";
import {
  getDoctorProfile,
  getReferenceDepartments,
  getReferenceHospitals,
  getReferenceSpecializations,
  submitDoctorVerification,
  updateDoctorProfile,
} from "@/lib/api";
import type {
  DepartmentReference,
  DoctorProfessionalProfile,
  DoctorProfileInput,
  HospitalReference,
  SpecializationReference,
} from "@/types/user";

const emptyForm: DoctorProfileInput = {
  medicalRegistrationNumber: "",
  hospitalId: null,
  departmentId: null,
  specializationId: null,
  qualifications: "",
  yearsOfExperience: null,
  bio: "",
};

const futureModules = [
  { title: "Consultation Availability", phase: "Available", href: "/doctor/availability" },
  { title: "Online Consultations", phase: "Available", href: "/doctor/appointments" },
  { title: "Patient Chat", phase: "Later phase" },
  { title: "Prescriptions", phase: "Later phase" },
];

function DoctorDashboardContent() {
  const { session, profile: user } = useAuth();
  const [doctor, setDoctor] = useState<DoctorProfessionalProfile | null>(null);
  const [hospitals, setHospitals] = useState<HospitalReference[]>([]);
  const [departments, setDepartments] = useState<DepartmentReference[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationReference[]>([]);
  const [form, setForm] = useState<DoctorProfileInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [busy, setBusy] = useState<"save" | "submit" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    });
  }, []);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const [profileValue, hospitalValues, specializationValues] = await Promise.all([
        getDoctorProfile(session.access_token),
        getReferenceHospitals(session.access_token),
        getReferenceSpecializations(session.access_token),
      ]);
      applyProfile(profileValue);
      setHospitals(hospitalValues);
      setSpecializations(specializationValues);
      setDepartments(profileValue.hospitalId
        ? await getReferenceDepartments(session.access_token, profileValue.hospitalId)
        : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The professional profile could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [applyProfile, session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function chooseHospital(hospitalId: string) {
    setForm((current) => ({ ...current, hospitalId: hospitalId || null, departmentId: null }));
    setDepartments([]);
    if (!session || !hospitalId) return;
    setDepartmentsLoading(true);
    try {
      setDepartments(await getReferenceDepartments(session.access_token, hospitalId));
    } catch (departmentError) {
      setError(departmentError instanceof Error ? departmentError.message : "Departments could not be loaded.");
    } finally {
      setDepartmentsLoading(false);
    }
  }

  async function save(event?: FormEvent) {
    event?.preventDefault();
    if (!session) return;
    setBusy("save");
    setError(null);
    setMessage(null);
    try {
      applyProfile(await updateDoctorProfile(session.access_token, form));
      setMessage("Professional profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The profile could not be saved.");
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (!session) return;
    if (!form.medicalRegistrationNumber.trim() || !form.hospitalId || !form.departmentId
      || !form.specializationId || !form.qualifications.trim() || form.yearsOfExperience === null) {
      setError("Complete every required professional field before submitting.");
      return;
    }
    setBusy("submit");
    setError(null);
    setMessage(null);
    try {
      await updateDoctorProfile(session.access_token, form);
      applyProfile(await submitDoctorVerification(session.access_token));
      setMessage("Your professional profile has been submitted for verification.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The profile could not be submitted.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <LoadingPanel label="Loading your professional profile..." />;
  if (!doctor) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <FormAlert message={error ?? "Your professional profile could not be loaded."} />
        <button className="mt-5 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white" onClick={() => void load()}>
          Try again
        </button>
      </main>
    );
  }

  const verified = doctor.verificationStatus === "VERIFIED";
  const rejected = doctor.verificationStatus === "REJECTED";

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">MediSync Doctor Portal</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        Welcome, Dr. {user?.lastName ?? "Doctor"}
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-600">
        Complete and submit your professional identity for administrator verification.
      </p>

      <div className="mt-7 space-y-3">
        {error ? <FormAlert message={error} /> : null}
        {message ? <FormAlert message={message} success /> : null}
      </div>

      {verified ? (
        <section className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Verified doctor</p>
          <h2 className="mt-2 text-2xl font-semibold text-emerald-950">Professional verification complete</h2>
          <p className="mt-2 text-emerald-900">Your MediSync doctor account is active. Sensitive identity fields are now locked.</p>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <ProfileDetail label="Registration" value={doctor.medicalRegistrationNumber} />
            <ProfileDetail label="Affiliated Hospital" value={doctor.hospitalName} />
            <ProfileDetail label="Department" value={doctor.departmentName} />
            <ProfileDetail label="Specialization" value={doctor.specializationName} />
            <ProfileDetail label="Qualifications" value={doctor.qualifications} />
            <ProfileDetail label="Experience" value={`${doctor.yearsOfExperience ?? 0} years`} />
          </dl>
        </section>
      ) : doctor.submitted ? (
        <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Verification pending</p>
          <h2 className="mt-2 text-2xl font-semibold text-amber-950">Your professional profile has been submitted</h2>
          <p className="mt-2 text-amber-900">An active MediSync administrator must review it before clinical features become available.</p>
          {doctor.submittedForVerificationAt ? (
            <p className="mt-4 text-sm text-amber-800">Submitted {new Date(doctor.submittedForVerificationAt).toLocaleString()}</p>
          ) : null}
        </section>
      ) : (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {rejected ? (
            <div className="mb-7 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-950">
              <p className="font-semibold">Verification requires changes</p>
              <p className="mt-2 text-sm leading-6"><span className="font-semibold">Reason:</span> {doctor.verificationRejectionReason}</p>
              <p className="mt-2 text-sm">Update the profile and resubmit it when ready.</p>
            </div>
          ) : (
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Professional profile incomplete</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Complete your professional profile</h2>
            </div>
          )}

          {hospitals.length === 0 || specializations.length === 0 ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              An administrator must add an active hospital, department, and specialization before this profile can be submitted.
            </div>
          ) : null}

          <form className="space-y-6" onSubmit={save}>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Medical registration number" required>
                <input className={inputClassName} maxLength={100} value={form.medicalRegistrationNumber}
                  onChange={(event) => setForm({ ...form, medicalRegistrationNumber: event.target.value })} />
              </Field>
              <Field label="Years of experience" required>
                <input className={inputClassName} type="number" min={0} value={form.yearsOfExperience ?? ""}
                  onChange={(event) => setForm({ ...form, yearsOfExperience: event.target.value === "" ? null : Number(event.target.value) })} />
              </Field>
              <Field label="Affiliated hospital" required>
                <select className={inputClassName} value={form.hospitalId ?? ""} onChange={(event) => void chooseHospital(event.target.value)}>
                  <option value="">Select affiliated hospital</option>
                  {hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}{hospital.city ? ` - ${hospital.city}` : ""}</option>)}
                </select>
              </Field>
              <Field label="Department" required>
                <select className={inputClassName} disabled={!form.hospitalId || departmentsLoading} value={form.departmentId ?? ""}
                  onChange={(event) => setForm({ ...form, departmentId: event.target.value || null })}>
                  <option value="">{departmentsLoading ? "Loading departments..." : "Select department"}</option>
                  {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                </select>
                {form.hospitalId && !departmentsLoading && departments.length === 0 ? <span className="mt-1 block text-xs text-amber-700">No active departments are configured for this hospital.</span> : null}
              </Field>
              <Field label="Specialization" required>
                <select className={inputClassName} value={form.specializationId ?? ""}
                  onChange={(event) => setForm({ ...form, specializationId: event.target.value || null })}>
                  <option value="">Select specialization</option>
                  {specializations.map((specialization) => <option key={specialization.id} value={specialization.id}>{specialization.name}</option>)}
                </select>
              </Field>
              <Field label="Qualifications" required>
                <input className={inputClassName} maxLength={500} placeholder="MBBS, MD"
                  value={form.qualifications} onChange={(event) => setForm({ ...form, qualifications: event.target.value })} />
              </Field>
            </div>
            <Field label="Professional bio">
              <textarea className={`${inputClassName} min-h-28 resize-y`} maxLength={2000} value={form.bio}
                onChange={(event) => setForm({ ...form, bio: event.target.value })} />
            </Field>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
                disabled={busy !== null} type="submit">
                {busy === "save" ? "Saving..." : "Save profile"}
              </button>
              <button className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                disabled={busy !== null || hospitals.length === 0 || specializations.length === 0}
                onClick={() => void submit()} type="button">
                {busy === "submit" ? "Submitting..." : rejected ? "Resubmit for verification" : "Submit for verification"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Future doctor modules">
        {futureModules.map((module) => {
          const content = <><span className={`text-xs font-bold uppercase tracking-wide ${verified && module.href ? "text-teal-700" : "text-slate-400"}`}>{verified && module.href ? module.phase : module.href ? "Verification required" : module.phase}</span><h2 className="mt-4 font-semibold text-slate-900">{module.title}</h2></>;
          return verified && module.href ? (
            <Link className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-300 hover:shadow-md" href={module.href} key={module.title}>{content}</Link>
          ) : (
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={module.title}>{content}</article>
          );
        })}
      </section>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}{required ? <span className="text-rose-600"> *</span> : null}
      {children}
    </label>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string | null }) {
  return <div><dt className="font-medium text-emerald-700">{label}</dt><dd className="mt-1 text-emerald-950">{value || "Not provided"}</dd></div>;
}

export default function DoctorDashboardPage() {
  return <ProtectedRoute roles={["DOCTOR"]}><DoctorDashboardContent /></ProtectedRoute>;
}

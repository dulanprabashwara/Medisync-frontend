"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { inputClassName } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { InlineError, PortalHeading } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import {
  getReferenceDepartments,
  getReferenceHospitals,
  getReferenceSpecializations,
  searchPatientDoctors,
} from "@/lib/api";
import type { DoctorSummary, PageResponse } from "@/types/appointments";
import type { DepartmentReference, HospitalReference, SpecializationReference } from "@/types/user";

function PatientDoctorSearchContent() {
  const { session } = useAuth();
  const [hospitals, setHospitals] = useState<HospitalReference[]>([]);
  const [departments, setDepartments] = useState<DepartmentReference[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationReference[]>([]);
  const [q, setQ] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [specializationId, setSpecializationId] = useState("");
  const [results, setResults] = useState<PageResponse<DoctorSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const token = session.access_token;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const [hospitalValues, specializationValues, doctorValues] = await Promise.all([
          getReferenceHospitals(token),
          getReferenceSpecializations(token),
          searchPatientDoctors(token, { page: 0, size: 10 }),
        ]);
        setHospitals(hospitalValues);
        setSpecializations(specializationValues);
        setResults(doctorValues);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Doctors could not be loaded.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [session]);

  async function chooseHospital(nextHospitalId: string) {
    setHospitalId(nextHospitalId);
    setDepartmentId("");
    setDepartments([]);
    if (!session || !nextHospitalId) return;
    setDepartmentsLoading(true);
    setError(null);
    try {
      setDepartments(await getReferenceDepartments(session.access_token, nextHospitalId));
    } catch (departmentError) {
      setError(departmentError instanceof Error ? departmentError.message : "Departments could not be loaded.");
    } finally {
      setDepartmentsLoading(false);
    }
  }

  async function search(page = 0) {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchPatientDoctors(session.access_token, {
        q: q.trim() || undefined,
        hospitalId: hospitalId || undefined,
        departmentId: departmentId || undefined,
        specializationId: specializationId || undefined,
        page,
        size: 10,
      }));
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "The doctor search could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void search(0);
  }

  async function clearFilters() {
    setQ("");
    setHospitalId("");
    setDepartmentId("");
    setSpecializationId("");
    setDepartments([]);
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchPatientDoctors(session.access_token, { page: 0, size: 10 }));
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "The doctor search could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <PortalHeading eyebrow="Patient care" title="Find a doctor" backHref="/patient/dashboard"
        description="Search MediSync's active, administrator-verified doctors and choose an available online consultation time." />

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-5" onSubmit={submit}>
          <label className="text-sm font-medium text-slate-700 lg:col-span-2">Doctor name
            <input className={inputClassName} placeholder="Search by name" value={q} onChange={(event) => setQ(event.target.value)} />
          </label>
          <label className="text-sm font-medium text-slate-700">Affiliated hospital
            <select className={inputClassName} value={hospitalId} onChange={(event) => void chooseHospital(event.target.value)}>
              <option value="">All hospitals</option>
              {hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Department
            <select className={inputClassName} disabled={!hospitalId || departmentsLoading} value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
              <option value="">{departmentsLoading ? "Loading..." : "All departments"}</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Specialization
            <select className={inputClassName} value={specializationId} onChange={(event) => setSpecializationId(event.target.value)}>
              <option value="">All specializations</option>
              {specializations.map((specialization) => <option key={specialization.id} value={specialization.id}>{specialization.name}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2 lg:col-span-5">
            <button className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60" disabled={loading} type="submit">
              {loading ? "Searching..." : "Search doctors"}
            </button>
            <button className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60" disabled={loading} type="button"
              onClick={() => void clearFilters()}>
              Clear filters
            </button>
          </div>
        </form>
      </section>

      <div className="mt-7"><InlineError message={error} /></div>
      {loading && !results ? <LoadingPanel label="Finding verified doctors..." /> : results?.content.length === 0 ? (
        <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No doctors match your current filters.</div>
      ) : (
        <section className="mt-7 grid gap-5 md:grid-cols-2" aria-label="Doctor search results">
          {results?.content.map((doctor) => (
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" key={doctor.doctorProfileId}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{doctor.displayName}</h2>
                  <p className="mt-1 font-medium text-teal-700">{doctor.specializationName}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">VERIFIED</span>
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Affiliated hospital</dt><dd className="mt-1 font-medium text-slate-900">{doctor.hospitalName}</dd></div>
                <div><dt className="text-slate-500">Department</dt><dd className="mt-1 font-medium text-slate-900">{doctor.departmentName}</dd></div>
                <div><dt className="text-slate-500">Qualifications</dt><dd className="mt-1 font-medium text-slate-900">{doctor.qualifications}</dd></div>
                <div><dt className="text-slate-500">Experience</dt><dd className="mt-1 font-medium text-slate-900">{doctor.yearsOfExperience} years</dd></div>
              </dl>
              {doctor.bioSummary ? <p className="mt-5 text-sm leading-6 text-slate-600">{doctor.bioSummary}</p> : null}
              <Link className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800" href={`/patient/doctors/${doctor.doctorProfileId}`}>
                View profile and consultation times
              </Link>
            </article>
          ))}
        </section>
      )}

      {results && results.totalPages > 1 ? (
        <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Doctor search pages">
          <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40" disabled={results.first || loading} onClick={() => void search(results.page - 1)}>Previous</button>
          <span className="text-sm text-slate-600">Page {results.page + 1} of {results.totalPages}</span>
          <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40" disabled={results.last || loading} onClick={() => void search(results.page + 1)}>Next</button>
        </nav>
      ) : null}
    </main>
  );
}

export default function PatientDoctorsPage() {
  return <ProtectedRoute roles={["PATIENT"]}><PatientDoctorSearchContent /></ProtectedRoute>;
}

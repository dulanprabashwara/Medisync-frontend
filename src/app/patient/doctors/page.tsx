"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Filter, Search } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { DoctorCard } from "@/components/patient/doctor-card";
import { SearchInput } from "@/components/ui/search-input";
import { Select, Label } from "@/components/ui/forms";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import {
  getReferenceDepartments,
  getReferenceHospitals,
  getReferenceSpecializations,
  searchPatientDoctors,
} from "@/lib/api";
import type { DoctorSummary, PageResponse } from "@/types/appointments";
import type {
  DepartmentReference,
  HospitalReference,
  SpecializationReference,
} from "@/types/user";

function PatientDoctorSearchContent() {
  const { session } = useAuth();
  const [hospitals, setHospitals] = useState<HospitalReference[]>([]);
  const [departments, setDepartments] = useState<DepartmentReference[]>([]);
  const [specializations, setSpecializations] = useState<
    SpecializationReference[]
  >([]);

  const [q, setQ] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [specializationId, setSpecializationId] = useState("");

  const [results, setResults] = useState<PageResponse<DoctorSummary> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (!session) return;
    const token = session.access_token;
    async function init() {
      try {
        const [hospitalValues, specializationValues, doctorValues] =
          await Promise.all([
            getReferenceHospitals(token),
            getReferenceSpecializations(token),
            searchPatientDoctors(token, { page: 0, size: 12 }),
          ]);
        setHospitals(hospitalValues);
        setSpecializations(specializationValues);
        setResults(doctorValues);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Doctors could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [session]);

  async function chooseHospital(nextHospitalId: string) {
    setHospitalId(nextHospitalId);
    setDepartmentId("");
    setDepartments([]);
    if (!session || !nextHospitalId) return;
    setDepartmentsLoading(true);
    try {
      setDepartments(
        await getReferenceDepartments(session.access_token, nextHospitalId),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDepartmentsLoading(false);
    }
  }

  async function search(page = 0) {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setResults(
        await searchPatientDoctors(session.access_token, {
          q: q.trim() || undefined,
          hospitalId: hospitalId || undefined,
          departmentId: departmentId || undefined,
          specializationId: specializationId || undefined,
          page,
          size: 12,
        }),
      );
      setMobileFiltersOpen(false);
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : "The doctor search could not be completed.",
      );
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
      setResults(
        await searchPatientDoctors(session.access_token, { page: 0, size: 12 }),
      );
      setMobileFiltersOpen(false);
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : "The doctor search could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }

  const activeFilterCount =
    (hospitalId ? 1 : 0) + (departmentId ? 1 : 0) + (specializationId ? 1 : 0);

  const filterFields = (
    <>
      <div className="space-y-1">
        <Label htmlFor="hospitalId">Hospital</Label>
        <Select
          id="hospitalId"
          value={hospitalId}
          onChange={(e) => chooseHospital(e.target.value)}
        >
          <option value="">All hospitals</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="departmentId">Department</Label>
        <Select
          id="departmentId"
          disabled={!hospitalId || departmentsLoading}
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
        >
          <option value="">
            {departmentsLoading ? "Loading..." : "All departments"}
          </option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="specializationId">Specialization</Label>
        <Select
          id="specializationId"
          value={specializationId}
          onChange={(e) => setSpecializationId(e.target.value)}
        >
          <option value="">All specializations</option>
          {specializations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
    </>
  );

  return (
    <div className="space-y-8">
      <PortalHeading
        eyebrow="Patient Care"
        title="Find a Doctor"
        backHref="/patient/dashboard"
        description="Search verified doctors and request an online consultation."
      />

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <SearchInput
              value={q}
              onChange={setQ}
              onClear={() => {
                setQ("");
                if (!activeFilterCount) search(0);
              }}
              placeholder="Search by doctor name..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              className="lg:hidden shrink-0"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Filter className="size-4" />
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-800">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="hidden lg:flex shrink-0 w-32"
            >
              Search
            </Button>
          </div>

          <div className="hidden lg:grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            {filterFields}
          </div>

          {activeFilterCount > 0 && (
            <div className="hidden lg:flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                disabled={loading}
              >
                Clear filters
              </Button>
            </div>
          )}
        </form>
      </div>

      <Dialog
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filters"
      >
        <div className="space-y-5 mt-2">
          {filterFields}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={clearFilters}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              onClick={() => search(0)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Dialog>

      <div className="mt-8">
        {error && !results ? (
          <Alert tone="error" className="mb-6">
            <p>{error}</p>
            <Button variant="secondary" className="mt-4" onClick={() => search(0)}>
              Retry
            </Button>
          </Alert>
        ) : loading && !results ? (
          <LoadingPanel label="Finding verified doctors..." />
        ) : results?.content.length === 0 ? (
          <>
            {error && (
              <Alert tone="error" className="mb-6">
                {error}
              </Alert>
            )}
            <EmptyState
              icon={Search}
              title="No doctors match your filters"
              description="Try changing your search criteria or clearing filters."
              action={
                <Button onClick={clearFilters} variant="secondary">
                  Clear Filters
                </Button>
              }
            />
          </>
        ) : results ? (
          <>
            {error && (
              <Alert tone="error" className="mb-6">
                {error}
              </Alert>
            )}
            <div className="mb-4 text-sm text-slate-500 font-medium">
              {results.totalElements === 0
                ? "No doctors found"
                : `${results.totalElements} doctor${results.totalElements === 1 ? "" : "s"} found`}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.content.map((doctor) => (
                <DoctorCard
                  key={doctor.doctorProfileId}
                  doctor={doctor}
                  viewMode="detail"
                />
              ))}
            </div>
            {results.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={results.page}
                  totalPages={results.totalPages}
                  onPageChange={search}
                />
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function PatientDoctorsPage() {
  return (
    <ProtectedRoute roles={["PATIENT"]}>
      <PatientDoctorSearchContent />
    </ProtectedRoute>
  );
}


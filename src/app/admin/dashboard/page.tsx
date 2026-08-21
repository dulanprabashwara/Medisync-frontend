"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { FormAlert, inputClassName } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { ProtectedRoute } from "@/components/protected-route";
import {
  createAdminDepartment,
  createAdminHospital,
  createAdminSpecialization,
  getAdminDepartments,
  getAdminHospitals,
  getAdminSpecializations,
  getPendingDoctors,
  getPendingPharmacists,
  rejectDoctor,
  rejectPharmacist,
  updateAdminDepartment,
  updateAdminHospital,
  updateAdminSpecialization,
  verifyDoctor,
  verifyPharmacist,
} from "@/lib/api";
import type {
  AdminDepartment,
  AdminDoctorReview,
  AdminPharmacistReview,
  AdminHospital,
  AdminSpecialization,
} from "@/types/user";

type AdminTab = "doctors" | "pharmacists" | "hospitals" | "departments" | "specializations";

const emptyHospital = { id: "", name: "", addressLine: "", city: "", phone: "", active: true };
const emptyDepartment = { id: "", hospitalId: "", name: "", active: true };
const emptySpecialization = { id: "", name: "", description: "", active: true };

function AdminDashboardContent() {
  const { session, profile } = useAuth();
  const [tab, setTab] = useState<AdminTab>("doctors");
  const [hospitals, setHospitals] = useState<AdminHospital[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [specializations, setSpecializations] = useState<AdminSpecialization[]>([]);
  const [doctors, setDoctors] = useState<AdminDoctorReview[]>([]);
  const [pharmacists, setPharmacists] = useState<AdminPharmacistReview[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctorReview | null>(null);
  const [selectedPharmacist, setSelectedPharmacist] = useState<AdminPharmacistReview | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [hospitalForm, setHospitalForm] = useState(emptyHospital);
  const [departmentForm, setDepartmentForm] = useState(emptyDepartment);
  const [specializationForm, setSpecializationForm] = useState(emptySpecialization);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async (showLoader = true) => {
    if (!session) return;
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const [hospitalValues, departmentValues, specializationValues, doctorValues, pharmacistValues] = await Promise.all([
        getAdminHospitals(session.access_token),
        getAdminDepartments(session.access_token),
        getAdminSpecializations(session.access_token),
        getPendingDoctors(session.access_token),
        getPendingPharmacists(session.access_token),
      ]);
      setHospitals(hospitalValues);
      setDepartments(departmentValues);
      setSpecializations(specializationValues);
      setDoctors(doctorValues);
      setPharmacists(pharmacistValues);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Administration data could not be loaded.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function runAction(key: string, success: string, action: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    setMessage(null);
    try {
      await action();
      await load(false);
      setMessage(success);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The operation could not be completed.");
    } finally {
      setBusy(null);
    }
  }

  async function saveHospital(event: FormEvent) {
    event.preventDefault();
    if (!session || !hospitalForm.name.trim()) return;
    await runAction("hospital-save", hospitalForm.id ? "Hospital updated." : "Hospital created.", async () => {
      const input = {
        name: hospitalForm.name.trim(),
        addressLine: hospitalForm.addressLine.trim() || null,
        city: hospitalForm.city.trim() || null,
        phone: hospitalForm.phone.trim() || null,
        active: hospitalForm.active,
      };
      if (hospitalForm.id) {
        await updateAdminHospital(session.access_token, { id: hospitalForm.id, ...input });
      } else {
        await createAdminHospital(session.access_token, input);
      }
      setHospitalForm(emptyHospital);
    });
  }

  async function saveDepartment(event: FormEvent) {
    event.preventDefault();
    if (!session || !departmentForm.hospitalId || !departmentForm.name.trim()) return;
    await runAction("department-save", departmentForm.id ? "Department updated." : "Department created.", async () => {
      const input = {
        hospitalId: departmentForm.hospitalId,
        name: departmentForm.name.trim(),
        active: departmentForm.active,
      };
      if (departmentForm.id) {
        await updateAdminDepartment(session.access_token, { id: departmentForm.id, ...input });
      } else {
        await createAdminDepartment(session.access_token, input);
      }
      setDepartmentForm(emptyDepartment);
    });
  }

  async function saveSpecialization(event: FormEvent) {
    event.preventDefault();
    if (!session || !specializationForm.name.trim()) return;
    await runAction("specialization-save", specializationForm.id ? "Specialization updated." : "Specialization created.", async () => {
      const input = {
        name: specializationForm.name.trim(),
        description: specializationForm.description.trim() || null,
        active: specializationForm.active,
      };
      if (specializationForm.id) {
        await updateAdminSpecialization(session.access_token, { id: specializationForm.id, ...input });
      } else {
        await createAdminSpecialization(session.access_token, input);
      }
      setSpecializationForm(emptySpecialization);
    });
  }

  async function toggleHospital(hospital: AdminHospital) {
    if (!session) return;
    await runAction(`hospital-${hospital.id}`, `Hospital ${hospital.active ? "deactivated" : "activated"}.`, () =>
      updateAdminHospital(session.access_token, {
        id: hospital.id,
        name: hospital.name,
        addressLine: hospital.addressLine,
        city: hospital.city,
        phone: hospital.phone,
        active: !hospital.active,
      }));
  }

  async function toggleDepartment(department: AdminDepartment) {
    if (!session) return;
    await runAction(`department-${department.id}`, `Department ${department.active ? "deactivated" : "activated"}.`, () =>
      updateAdminDepartment(session.access_token, {
        id: department.id,
        hospitalId: department.hospitalId,
        name: department.name,
        active: !department.active,
      }));
  }

  async function toggleSpecialization(specialization: AdminSpecialization) {
    if (!session) return;
    await runAction(`specialization-${specialization.id}`, `Specialization ${specialization.active ? "deactivated" : "activated"}.`, () =>
      updateAdminSpecialization(session.access_token, {
        id: specialization.id,
        name: specialization.name,
        description: specialization.description,
        active: !specialization.active,
      }));
  }

  async function approveDoctor(doctor: AdminDoctorReview) {
    if (!session || !window.confirm(`Approve Dr. ${doctor.firstName} ${doctor.lastName}?`)) return;
    await runAction(`doctor-${doctor.doctorId}`, "Doctor verified and activated.", async () => {
      await verifyDoctor(session.access_token, doctor.doctorId);
      setSelectedDoctor(null);
    });
  }

  async function rejectSelectedDoctor() {
    if (!session || !selectedDoctor) return;
    if (!rejectionReason.trim()) {
      setError("Enter a rejection reason.");
      return;
    }
    if (!window.confirm(`Reject Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}'s submission?`)) return;
    await runAction(`doctor-${selectedDoctor.doctorId}`, "Doctor submission rejected with feedback.", async () => {
      await rejectDoctor(session.access_token, selectedDoctor.doctorId, rejectionReason.trim());
      setSelectedDoctor(null);
      setRejectionReason("");
    });
  }

  async function approvePharmacist(pharmacist: AdminPharmacistReview) {
    if (!session || !window.confirm(`Approve ${pharmacist.firstName} ${pharmacist.lastName} as a verified pharmacist?`)) return;
    await runAction(`pharmacist-${pharmacist.pharmacistId}`, "Pharmacist verified and activated.", async () => {
      await verifyPharmacist(session.access_token, pharmacist.pharmacistId);
      setSelectedPharmacist(null);
    });
  }

  async function rejectSelectedPharmacist() {
    if (!session || !selectedPharmacist) return;
    if (!rejectionReason.trim()) {
      setError("Enter a rejection reason.");
      return;
    }
    if (!window.confirm(`Reject ${selectedPharmacist.firstName} ${selectedPharmacist.lastName}'s submission?`)) return;
    await runAction(`pharmacist-${selectedPharmacist.pharmacistId}`, "Pharmacist submission rejected with feedback.", async () => {
      await rejectPharmacist(session.access_token, selectedPharmacist.pharmacistId, rejectionReason.trim());
      setSelectedPharmacist(null);
      setRejectionReason("");
    });
  }

  if (loading) return <LoadingPanel label="Loading the administration portal..." />;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">MediSync Administration</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        Welcome, {profile?.firstName ?? "Administrator"}
      </h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Manage trusted reference data and review submitted doctor and pharmacist professional profiles.
      </p>

      <div className="mt-7 space-y-3">
        {error ? <FormAlert message={error} /> : null}
        {message ? <FormAlert message={message} success /> : null}
      </div>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Administration sections">
        <TabButton active={tab === "doctors"} onClick={() => setTab("doctors")}>Pending doctors ({doctors.length})</TabButton>
        <TabButton active={tab === "pharmacists"} onClick={() => setTab("pharmacists")}>Pending pharmacists ({pharmacists.length})</TabButton>
        <TabButton active={tab === "hospitals"} onClick={() => setTab("hospitals")}>Hospitals</TabButton>
        <TabButton active={tab === "departments"} onClick={() => setTab("departments")}>Departments</TabButton>
        <TabButton active={tab === "specializations"} onClick={() => setTab("specializations")}>Specializations</TabButton>
      </nav>

      {tab === "doctors" ? (
        <section className="mt-7">
          <SectionHeading title="Pending doctors" description="Only complete, submitted profiles appear in this review queue." />
          {doctors.length === 0 ? (
            <EmptyState message="No doctors are currently awaiting verification." />
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {doctors.map((doctor) => (
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={doctor.doctorId}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">Dr. {doctor.firstName} {doctor.lastName}</h2>
                      <p className="mt-1 text-sm text-slate-600">{doctor.medicalRegistrationNumber}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Pending</span>
                  </div>
                  <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                    <ReviewDetail label="Hospital" value={doctor.hospitalName} />
                    <ReviewDetail label="Department" value={doctor.departmentName} />
                    <ReviewDetail label="Specialization" value={doctor.specializationName} />
                    <ReviewDetail label="Submitted" value={new Date(doctor.submittedForVerificationAt).toLocaleString()} />
                  </dl>
                  <button className="mt-5 rounded-xl border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                    onClick={() => { setSelectedDoctor(doctor); setRejectionReason(""); }}>
                    Review profile
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {tab === "pharmacists" ? (
        <section className="mt-7">
          <SectionHeading title="Pending pharmacists" description="Review submitted professional registration and pharmacy information." />
          {pharmacists.length === 0 ? <EmptyState message="No pharmacists are currently awaiting verification." /> : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {pharmacists.map((pharmacist) => <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={pharmacist.pharmacistId}>
                <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-slate-950">{pharmacist.firstName} {pharmacist.lastName}</h2><p className="mt-1 text-sm text-slate-600">{pharmacist.professionalRegistrationNumber}</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Pending</span></div>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><ReviewDetail label="Pharmacy" value={pharmacist.pharmacyName} /><ReviewDetail label="Pharmacy registration" value={pharmacist.pharmacyRegistrationNumber || "Not provided"} /><ReviewDetail label="Submitted" value={new Date(pharmacist.submittedForVerificationAt).toLocaleString()} /></dl>
                <button className="mt-5 rounded-xl border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50" onClick={() => { setSelectedPharmacist(pharmacist); setRejectionReason(""); }}>Review profile</button>
              </article>)}
            </div>
          )}
        </section>
      ) : null}

      {tab === "hospitals" ? (
        <MasterSection title="Hospitals" description="Create real hospital records and deactivate entries without deleting references."
          form={<HospitalForm value={hospitalForm} busy={busy === "hospital-save"} onChange={setHospitalForm} onSubmit={saveHospital} onCancel={() => setHospitalForm(emptyHospital)} />}>
          {hospitals.length === 0 ? <EmptyState message="No hospitals have been added yet." /> : hospitals.map((hospital) => (
            <MasterRow key={hospital.id} title={hospital.name} subtitle={[hospital.city, hospital.addressLine].filter(Boolean).join(" - ") || "No location provided"}
              active={hospital.active} busy={busy === `hospital-${hospital.id}`}
              onEdit={() => setHospitalForm({ id: hospital.id, name: hospital.name, addressLine: hospital.addressLine ?? "", city: hospital.city ?? "", phone: hospital.phone ?? "", active: hospital.active })}
              onToggle={() => void toggleHospital(hospital)} />
          ))}
        </MasterSection>
      ) : null}

      {tab === "departments" ? (
        <MasterSection title="Departments" description="Every department belongs to exactly one hospital."
          form={<DepartmentForm value={departmentForm} hospitals={hospitals} busy={busy === "department-save"} onChange={setDepartmentForm} onSubmit={saveDepartment} onCancel={() => setDepartmentForm(emptyDepartment)} />}>
          {departments.length === 0 ? <EmptyState message="No departments have been configured yet." /> : departments.map((department) => (
            <MasterRow key={department.id} title={department.name} subtitle={department.hospitalName} active={department.active}
              busy={busy === `department-${department.id}`}
              onEdit={() => setDepartmentForm({ id: department.id, hospitalId: department.hospitalId, name: department.name, active: department.active })}
              onToggle={() => void toggleDepartment(department)} />
          ))}
        </MasterSection>
      ) : null}

      {tab === "specializations" ? (
        <MasterSection title="Specializations" description="These database-backed choices appear in doctor professional profiles."
          form={<SpecializationForm value={specializationForm} busy={busy === "specialization-save"} onChange={setSpecializationForm} onSubmit={saveSpecialization} onCancel={() => setSpecializationForm(emptySpecialization)} />}>
          {specializations.length === 0 ? <EmptyState message="No specializations have been added yet." /> : specializations.map((specialization) => (
            <MasterRow key={specialization.id} title={specialization.name} subtitle={specialization.description || "No description"}
              active={specialization.active} busy={busy === `specialization-${specialization.id}`}
              onEdit={() => setSpecializationForm({ id: specialization.id, name: specialization.name, description: specialization.description ?? "", active: specialization.active })}
              onToggle={() => void toggleSpecialization(specialization)} />
          ))}
        </MasterSection>
      ) : null}

      {selectedDoctor ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Doctor verification review">
          <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Doctor review</p><h2 className="mt-2 text-2xl font-semibold">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h2></div>
              <button className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100" onClick={() => setSelectedDoctor(null)}>Close</button>
            </div>
            <dl className="mt-7 grid gap-5 sm:grid-cols-2">
              <ReviewDetail label="Email" value={selectedDoctor.email} />
              <ReviewDetail label="Phone" value={selectedDoctor.phone || "Not provided"} />
              <ReviewDetail label="Medical registration" value={selectedDoctor.medicalRegistrationNumber} />
              <ReviewDetail label="Years of experience" value={`${selectedDoctor.yearsOfExperience} years`} />
              <ReviewDetail label="Hospital" value={selectedDoctor.hospitalName} />
              <ReviewDetail label="Department" value={selectedDoctor.departmentName} />
              <ReviewDetail label="Specialization" value={selectedDoctor.specializationName} />
              <ReviewDetail label="Qualifications" value={selectedDoctor.qualifications} />
            </dl>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Bio</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedDoctor.bio || "No bio provided."}</p></div>
            <label className="mt-6 block text-sm font-semibold text-slate-700">Rejection reason
              <textarea className={`${inputClassName} min-h-24 resize-y`} maxLength={1000} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Required only when rejecting" />
            </label>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy !== null} onClick={() => void approveDoctor(selectedDoctor)}>{busy ? "Processing..." : "Approve doctor"}</button>
              <button className="rounded-xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy !== null} onClick={() => void rejectSelectedDoctor()}>{busy ? "Processing..." : "Reject with reason"}</button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedPharmacist ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Pharmacist verification review">
          <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Pharmacist review</p><h2 className="mt-2 text-2xl font-semibold">{selectedPharmacist.firstName} {selectedPharmacist.lastName}</h2></div><button className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100" onClick={() => setSelectedPharmacist(null)}>Close</button></div>
            <dl className="mt-7 grid gap-5 sm:grid-cols-2"><ReviewDetail label="Email" value={selectedPharmacist.email} /><ReviewDetail label="Phone" value={selectedPharmacist.phone || "Not provided"} /><ReviewDetail label="Professional registration" value={selectedPharmacist.professionalRegistrationNumber} /><ReviewDetail label="Pharmacy" value={selectedPharmacist.pharmacyName} /><ReviewDetail label="Pharmacy registration" value={selectedPharmacist.pharmacyRegistrationNumber || "Not provided"} /><ReviewDetail label="Qualifications" value={selectedPharmacist.qualifications || "Not provided"} /></dl>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Pharmacy address</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedPharmacist.pharmacyAddress}</p></div>
            <label className="mt-6 block text-sm font-semibold text-slate-700">Rejection reason<textarea className={`${inputClassName} min-h-24 resize-y`} maxLength={1000} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Required only when rejecting" /></label>
            <div className="mt-6 flex flex-wrap gap-3"><button className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy !== null} onClick={() => void approvePharmacist(selectedPharmacist)}>{busy ? "Processing..." : "Approve pharmacist"}</button><button className="rounded-xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy !== null} onClick={() => void rejectSelectedPharmacist()}>{busy ? "Processing..." : "Reject with reason"}</button></div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${active ? "bg-teal-700 text-white" : "border border-slate-300 bg-white text-slate-700"}`} onClick={onClick}>{children}</button>;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return <div><h2 className="text-2xl font-semibold text-slate-950">{title}</h2><p className="mt-2 text-slate-600">{description}</p></div>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">{message}</div>;
}

function MasterSection({ title, description, form, children }: { title: string; description: string; form: ReactNode; children: ReactNode }) {
  return <section className="mt-7 grid gap-7 lg:grid-cols-[22rem_1fr]"><div><SectionHeading title={title} description={description} />{form}</div><div className="space-y-3">{children}</div></section>;
}

function MasterRow({ title, subtitle, active, busy, onEdit, onToggle }: { title: string; subtitle: string; active: boolean; busy: boolean; onEdit: () => void; onToggle: () => void }) {
  return <article className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><h3 className="font-semibold text-slate-950">{title}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{active ? "Active" : "Inactive"}</span></div><p className="mt-1 text-sm text-slate-600">{subtitle}</p></div><div className="flex gap-2"><button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700" onClick={onEdit}>Edit</button><button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60" disabled={busy} onClick={onToggle}>{busy ? "Saving..." : active ? "Deactivate" : "Activate"}</button></div></article>;
}

function ReviewDetail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd></div>;
}

type HospitalFormValue = typeof emptyHospital;
function HospitalForm({ value, busy, onChange, onSubmit, onCancel }: { value: HospitalFormValue; busy: boolean; onChange: (value: HospitalFormValue) => void; onSubmit: (event: FormEvent) => void; onCancel: () => void }) {
  return <form className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={onSubmit}><h3 className="font-semibold">{value.id ? "Edit hospital" : "Add hospital"}</h3><input className={inputClassName} placeholder="Hospital name" required maxLength={200} value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} /><input className={inputClassName} placeholder="Address" maxLength={255} value={value.addressLine} onChange={(event) => onChange({ ...value, addressLine: event.target.value })} /><input className={inputClassName} placeholder="City" maxLength={100} value={value.city} onChange={(event) => onChange({ ...value, city: event.target.value })} /><input className={inputClassName} placeholder="Phone" maxLength={30} value={value.phone} onChange={(event) => onChange({ ...value, phone: event.target.value })} /><ActiveCheckbox checked={value.active} onChange={(active) => onChange({ ...value, active })} /><FormButtons busy={busy} editing={Boolean(value.id)} onCancel={onCancel} /></form>;
}

type DepartmentFormValue = typeof emptyDepartment;
function DepartmentForm({ value, hospitals, busy, onChange, onSubmit, onCancel }: { value: DepartmentFormValue; hospitals: AdminHospital[]; busy: boolean; onChange: (value: DepartmentFormValue) => void; onSubmit: (event: FormEvent) => void; onCancel: () => void }) {
  return <form className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={onSubmit}><h3 className="font-semibold">{value.id ? "Edit department" : "Add department"}</h3><select className={inputClassName} required value={value.hospitalId} onChange={(event) => onChange({ ...value, hospitalId: event.target.value })}><option value="">Select hospital</option>{hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}{hospital.active ? "" : " (inactive)"}</option>)}</select><input className={inputClassName} placeholder="Department name" required maxLength={150} value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} /><ActiveCheckbox checked={value.active} onChange={(active) => onChange({ ...value, active })} /><FormButtons busy={busy} editing={Boolean(value.id)} onCancel={onCancel} /></form>;
}

type SpecializationFormValue = typeof emptySpecialization;
function SpecializationForm({ value, busy, onChange, onSubmit, onCancel }: { value: SpecializationFormValue; busy: boolean; onChange: (value: SpecializationFormValue) => void; onSubmit: (event: FormEvent) => void; onCancel: () => void }) {
  return <form className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={onSubmit}><h3 className="font-semibold">{value.id ? "Edit specialization" : "Add specialization"}</h3><input className={inputClassName} placeholder="Specialization name" required maxLength={150} value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} /><textarea className={`${inputClassName} min-h-24 resize-y`} placeholder="Description" maxLength={2000} value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} /><ActiveCheckbox checked={value.active} onChange={(active) => onChange({ ...value, active })} /><FormButtons busy={busy} editing={Boolean(value.id)} onCancel={onCancel} /></form>;
}

function ActiveCheckbox({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />Active</label>;
}

function FormButtons({ busy, editing, onCancel }: { busy: boolean; editing: boolean; onCancel: () => void }) {
  return <div className="flex gap-2"><button className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" disabled={busy} type="submit">{busy ? "Saving..." : editing ? "Update" : "Create"}</button>{editing ? <button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold" onClick={onCancel} type="button">Cancel</button> : null}</div>;
}

export default function AdminDashboardPage() {
  return <ProtectedRoute roles={["ADMIN"]}><AdminDashboardContent /></ProtectedRoute>;
}

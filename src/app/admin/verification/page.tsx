"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading } from "@/components/portal-ui";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/auth-card";
import {
  getPendingDoctors,
  getPendingPharmacists,
  rejectDoctor,
  rejectPharmacist,
  verifyDoctor,
  verifyPharmacist,
} from "@/lib/api";
import type { AdminDoctorReview, AdminPharmacistReview } from "@/types/user";
import toast from "react-hot-toast";

type Tab = "doctors" | "pharmacists";

const reviewBackdropClassName =
  "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/20 p-4 backdrop-blur-[2px] sm:p-8";
const reviewPanelClassName =
  "mx-auto flex max-h-[90vh] w-full max-w-3xl flex-col rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.14)] ring-1 ring-white/70 sm:p-8";

function ReviewDetail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col border-b border-slate-100 pb-3">
      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{value || <span className="text-slate-400 italic">Not provided</span>}</dd>
    </div>
  );
}

export default function ProfessionalVerificationPage() {
  const { session } = useAuth();
  
  const [tab, setTab] = useState<Tab>("doctors");
  const [doctors, setDoctors] = useState<AdminDoctorReview[]>([]);
  const [pharmacists, setPharmacists] = useState<AdminPharmacistReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctorReview | null>(null);
  const [selectedPharmacist, setSelectedPharmacist] = useState<AdminPharmacistReview | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const load = useCallback(async (showLoader = true) => {
    if (!session) return;
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const [doctorValues, pharmacistValues] = await Promise.all([
        getPendingDoctors(session.access_token),
        getPendingPharmacists(session.access_token),
      ]);
      setDoctors(doctorValues);
      setPharmacists(pharmacistValues);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Verification data could not be loaded.");
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
    try {
      await action();
      await load(false);
      toast.success(success);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The operation could not be completed.");
    } finally {
      setBusy(null);
    }
  }

  async function approveDoctor(doctor: AdminDoctorReview) {
    if (!session) return;
    await runAction(`doctor-${doctor.doctorId}`, "Doctor verified successfully.", async () => {
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
    await runAction(`doctor-${selectedDoctor.doctorId}`, "Doctor submission rejected with feedback.", async () => {
      await rejectDoctor(session.access_token, selectedDoctor.doctorId, rejectionReason.trim());
      setSelectedDoctor(null);
      setRejectionReason("");
    });
  }

  async function approvePharmacist(pharmacist: AdminPharmacistReview) {
    if (!session) return;
    await runAction(`pharmacist-${pharmacist.pharmacistId}`, "Pharmacist verified successfully.", async () => {
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
    await runAction(`pharmacist-${selectedPharmacist.pharmacistId}`, "Pharmacist submission rejected with feedback.", async () => {
      await rejectPharmacist(session.access_token, selectedPharmacist.pharmacistId, rejectionReason.trim());
      setSelectedPharmacist(null);
      setRejectionReason("");
    });
  }

  if (loading) return <LoadingPanel label="Loading professional verification queue..." />;

  return (
    <div className="space-y-8">
      <PortalHeading
        eyebrow="MANAGEMENT"
        title="Professional Verification"
        description="Review Doctor and Pharmacist professional registrations."
        backHref="/admin/dashboard"
      />

      <div className="flex gap-4 border-b border-slate-200">
        <button
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "doctors" ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
          onClick={() => setTab("doctors")}
        >
          Doctors {doctors.length > 0 && <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{doctors.length}</span>}
        </button>
        <button
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "pharmacists" ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
          onClick={() => setTab("pharmacists")}
        >
          Pharmacists {pharmacists.length > 0 && <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{pharmacists.length}</span>}
        </button>
      </div>

      {error && !selectedDoctor && !selectedPharmacist ? <Alert tone="error">{error}</Alert> : null}

      {tab === "doctors" && (
        <div className="space-y-6">
          {doctors.length === 0 ? (
            <EmptyState title="No doctors are currently pending verification." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {doctors.map((doctor) => (
                <article key={doctor.doctorId} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">Dr. {doctor.firstName} {doctor.lastName}</h2>
                      <p className="text-sm text-slate-500 mt-1">Medical Registration: {doctor.medicalRegistrationNumber}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 uppercase tracking-wide">
                      Pending Verification
                    </span>
                  </div>
                  <dl className="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2 grow mb-6">
                    <ReviewDetail label="Hospital" value={doctor.hospitalName} />
                    <ReviewDetail label="Department" value={doctor.departmentName} />
                    <ReviewDetail label="Specialization" value={doctor.specializationName} />
                    <ReviewDetail label="Submitted" value={new Date(doctor.submittedForVerificationAt).toLocaleDateString()} />
                  </dl>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto self-start"
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setRejectionReason("");
                      setError(null);
                    }}
                  >
                    Review
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "pharmacists" && (
        <div className="space-y-6">
          {pharmacists.length === 0 ? (
            <EmptyState title="No pharmacists are currently pending verification." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {pharmacists.map((pharmacist) => (
                <article key={pharmacist.pharmacistId} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">{pharmacist.firstName} {pharmacist.lastName}</h2>
                      <p className="text-sm text-slate-500 mt-1">Pharmacist Registration: {pharmacist.professionalRegistrationNumber}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 uppercase tracking-wide">
                      Pending Verification
                    </span>
                  </div>
                  <dl className="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2 grow mb-6">
                    <ReviewDetail label="Pharmacy" value={pharmacist.pharmacyName} />
                    <ReviewDetail label="Pharmacy Reg" value={pharmacist.pharmacyRegistrationNumber} />
                    <ReviewDetail label="Submitted" value={new Date(pharmacist.submittedForVerificationAt).toLocaleDateString()} />
                  </dl>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto self-start"
                    onClick={() => {
                      setSelectedPharmacist(pharmacist);
                      setRejectionReason("");
                      setError(null);
                    }}
                  >
                    Review
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Doctor Review Dialog */}
      {selectedDoctor && (
        <div className={reviewBackdropClassName}>
          <div className={reviewPanelClassName}>
            <div className="flex items-start justify-between gap-4 shrink-0 border-b border-slate-100 pb-5 mb-5">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Verify Doctor?</h2>
                <p className="mt-2 text-sm text-slate-500">You are confirming that the submitted professional information has been reviewed and approved.</p>
              </div>
            </div>
            
            <div className="overflow-y-auto grow pr-2 space-y-8">
              {error && <Alert tone="error">{error}</Alert>}
              
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Identity Summary</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ReviewDetail label="Doctor" value={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`} />
                  <ReviewDetail label="Email" value={selectedDoctor.email} />
                  <ReviewDetail label="Phone" value={selectedDoctor.phone} />
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Information</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ReviewDetail label="Medical Registration" value={selectedDoctor.medicalRegistrationNumber} />
                  <ReviewDetail label="Years of Experience" value={selectedDoctor.yearsOfExperience?.toString()} />
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Hospital / Department / Specialization</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ReviewDetail label="Hospital" value={selectedDoctor.hospitalName} />
                  <ReviewDetail label="Department" value={selectedDoctor.departmentName} />
                  <ReviewDetail label="Specialization" value={selectedDoctor.specializationName} />
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Qualifications / Experience</h3>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Qualifications</p>
                  <p className="whitespace-pre-wrap text-sm text-slate-600">{selectedDoctor.qualifications || "Not provided"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 mt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Bio</p>
                  <p className="whitespace-pre-wrap text-sm text-slate-600">{selectedDoctor.bio || "Not provided"}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <label className="block text-sm font-semibold text-slate-900">
                  Reject Doctor verification?
                  <p className="text-slate-500 font-normal mt-1 mb-3">Provide a clear reason so the Doctor can correct their professional information.</p>
                  <textarea
                    className={`${inputClassName} min-h-24 resize-none`}
                    maxLength={1000}
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Reason"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap-reverse sm:flex-nowrap justify-between gap-3 shrink-0 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedDoctor(null)} disabled={busy !== null}>
                Cancel
              </Button>
              <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
                <Button 
                  variant="danger"
                  className="w-full sm:w-auto"
                  onClick={() => void rejectSelectedDoctor()} 
                  disabled={busy !== null}
                >
                  {busy === `doctor-${selectedDoctor.doctorId}` && rejectionReason ? "Rejecting..." : "Reject Verification"}
                </Button>
                <Button 
                  variant="primary"
                  className="w-full sm:w-auto"
                  onClick={() => void approveDoctor(selectedDoctor)} 
                  disabled={busy !== null}
                >
                  {busy === `doctor-${selectedDoctor.doctorId}` && !rejectionReason ? "Verifying..." : "Verify Doctor"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pharmacist Review Dialog */}
      {selectedPharmacist && (
        <div className={reviewBackdropClassName}>
          <div className={reviewPanelClassName}>
            <div className="flex items-start justify-between gap-4 shrink-0 border-b border-slate-100 pb-5 mb-5">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Verify Pharmacist?</h2>
                <p className="mt-2 text-sm text-slate-500">You are confirming that the submitted professional information has been reviewed and approved.</p>
              </div>
            </div>
            
            <div className="overflow-y-auto grow pr-2 space-y-8">
              {error && <Alert tone="error">{error}</Alert>}
              
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Identity Summary</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ReviewDetail label="Pharmacist" value={`${selectedPharmacist.firstName} ${selectedPharmacist.lastName}`} />
                  <ReviewDetail label="Email" value={selectedPharmacist.email} />
                  <ReviewDetail label="Phone" value={selectedPharmacist.phone} />
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Information</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ReviewDetail label="Pharmacist Registration" value={selectedPharmacist.professionalRegistrationNumber} />
                  <ReviewDetail label="Pharmacy" value={selectedPharmacist.pharmacyName} />
                  <ReviewDetail label="Pharmacy Registration" value={selectedPharmacist.pharmacyRegistrationNumber} />
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Qualifications / Details</h3>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Qualifications</p>
                  <p className="whitespace-pre-wrap text-sm text-slate-600">{selectedPharmacist.qualifications || "Not provided"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 mt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Pharmacy Address</p>
                  <p className="whitespace-pre-wrap text-sm text-slate-600">{selectedPharmacist.pharmacyAddress || "Not provided"}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <label className="block text-sm font-semibold text-slate-900">
                  Reject Pharmacist verification?
                  <p className="text-slate-500 font-normal mt-1 mb-3">Provide a clear reason so the Pharmacist can correct their professional information.</p>
                  <textarea
                    className={`${inputClassName} min-h-24 resize-none`}
                    maxLength={1000}
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Reason"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap-reverse sm:flex-nowrap justify-between gap-3 shrink-0 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedPharmacist(null)} disabled={busy !== null}>
                Cancel
              </Button>
              <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
                <Button 
                  variant="danger"
                  className="w-full sm:w-auto"
                  onClick={() => void rejectSelectedPharmacist()} 
                  disabled={busy !== null}
                >
                  {busy === `pharmacist-${selectedPharmacist.pharmacistId}` && rejectionReason ? "Rejecting..." : "Reject Verification"}
                </Button>
                <Button 
                  variant="primary"
                  className="w-full sm:w-auto"
                  onClick={() => void approvePharmacist(selectedPharmacist)} 
                  disabled={busy !== null}
                >
                  {busy === `pharmacist-${selectedPharmacist.pharmacistId}` && !rejectionReason ? "Verifying..." : "Verify Pharmacist"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


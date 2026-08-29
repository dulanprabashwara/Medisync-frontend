"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading } from "@/components/portal-ui";
import { SectionCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/forms";
import {
  createAdminSpecialization,
  getAdminDepartments,
  getAdminHospitals,
  getAdminSpecializations,
  updateAdminSpecialization,
} from "@/lib/api";
import type { AdminDepartment, AdminHospital, AdminSpecialization } from "@/types/user";
import toast from "react-hot-toast";

const emptySpecialization = {
  id: "",
  hospitalId: "",
  departmentId: "",
  name: "",
  description: "",
  active: true,
};

export default function SpecializationsPage() {
  const { session } = useAuth();
  
  const [specializations, setSpecializations] = useState<AdminSpecialization[]>([]);
  const [hospitals, setHospitals] = useState<AdminHospital[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState(emptySpecialization);
  
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (showLoader = true) => {
    if (!session) return;
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const [specializationValues, hospitalValues, departmentValues] = await Promise.all([
        getAdminSpecializations(session.access_token),
        getAdminHospitals(session.access_token),
        getAdminDepartments(session.access_token),
      ]);
      setSpecializations(specializationValues);
      setHospitals(hospitalValues);
      setDepartments(departmentValues);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Specializations could not be loaded.");
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

  async function saveSpecialization(event: FormEvent) {
    event.preventDefault();
    if (!session || !form.hospitalId || !form.departmentId || !form.name.trim()) return;
    
    await runAction(
      "save",
      form.id ? "Specialization updated." : "Specialization created.",
      async () => {
        const input = {
          hospitalId: form.hospitalId,
          departmentId: form.departmentId,
          name: form.name.trim(),
          description: form.description.trim() || null,
          active: form.active,
        };
        if (form.id) {
          await updateAdminSpecialization(session.access_token, { id: form.id, ...input });
        } else {
          await createAdminSpecialization(session.access_token, input);
        }
        setFormVisible(false);
        setForm(emptySpecialization);
      }
    );
  }

  async function toggleSpecialization(specialization: AdminSpecialization) {
    if (!session) return;
    if (!specialization.hospitalId || !specialization.departmentId) {
      setError("Assign this legacy specialization to a hospital and department before changing its status.");
      return;
    }
    if (!window.confirm(`${specialization.active ? "Deactivate" : "Activate"} specialization ${specialization.name}?`)) return;
    
    await runAction(
      `toggle-${specialization.id}`,
      `Specialization ${specialization.active ? "deactivated" : "activated"}.`,
      () => updateAdminSpecialization(session.access_token, {
        id: specialization.id,
        hospitalId: specialization.hospitalId,
        departmentId: specialization.departmentId,
        name: specialization.name,
        description: specialization.description,
        active: !specialization.active,
      })
    );
  }

  if (loading) return <LoadingPanel label="Loading specializations..." />;

  return (
    <div className="space-y-8">
      <PortalHeading
        eyebrow="SYSTEM DATA"
        title="Specializations"
        description="Manage medical specializations available in Doctor profiles."
      />

      {error && !formVisible && <Alert tone="error">{error}</Alert>}

      <div className="flex justify-end mb-4">
        {!formVisible && (
          <Button onClick={() => {
            setForm(emptySpecialization);
            setFormVisible(true);
            setError(null);
          }}>
            Add Specialization
          </Button>
        )}
      </div>

      {formVisible && (
        <SectionCard title={form.id ? "Edit Specialization" : "Add Specialization"} className="mb-8">
          {error && <Alert tone="error" className="mb-4">{error}</Alert>}
          <form onSubmit={saveSpecialization} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="specialization-hospital">Hospital *</Label>
                <Select
                  id="specialization-hospital"
                  required
                  value={form.hospitalId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      hospitalId: event.target.value,
                      departmentId: "",
                    })
                  }
                >
                  <option value="">Select a hospital...</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization-department">Department *</Label>
                <Select
                  id="specialization-department"
                  required
                  disabled={!form.hospitalId}
                  value={form.departmentId}
                  onChange={(event) => setForm({ ...form, departmentId: event.target.value })}
                >
                  <option value="">
                    {form.hospitalId ? "Select a department..." : "Select a hospital first"}
                  </option>
                  {departments
                    .filter((department) => department.hospitalId === form.hospitalId)
                    .map((department) => (
                      <option key={department.id} value={department.id}>{department.name}</option>
                    ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization-name">Specialization Name *</Label>
                <Input
                  id="specialization-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Cardiology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization-description">Description</Label>
                <Textarea
                  id="specialization-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description of the specialization"
                  className="min-h-25 resize-none"
                />
              </div>
              <div className="flex items-center gap-2 mt-2 sm:col-span-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                />
                <Label htmlFor="active" className="mb-0">Active (available for selection)</Label>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
              <Button type="button" variant="secondary" onClick={() => setFormVisible(false)} disabled={busy !== null}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy !== null || !form.hospitalId || !form.departmentId || !form.name.trim()}
              >
                {busy === "save" ? "Saving..." : form.id ? "Save Changes" : "Add Specialization"}
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      <div className="grid gap-4">
        {specializations.length === 0 ? (
          <EmptyState title="No specializations have been added yet." />
        ) : (
          specializations.map((specialization) => (
            <div key={specialization.id} className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-900 text-lg">{specialization.name}</h3>
                  {!specialization.active && (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-medium">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{specialization.description || "No description provided"}</p>
                <p className="mt-2 text-sm font-medium text-teal-700">
                  {specialization.hospitalName && specialization.departmentName
                    ? `${specialization.hospitalName} · ${specialization.departmentName}`
                    : "Legacy global specialization · assign it before new doctors can select it"}
                </p>
                <p className="text-xs text-slate-400 mt-2">{specialization.doctorCount || 0} affiliated doctors</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    setForm({
                      id: specialization.id,
                      hospitalId: specialization.hospitalId ?? "",
                      departmentId: specialization.departmentId ?? "",
                      name: specialization.name,
                      description: specialization.description ?? "",
                      active: specialization.active,
                    });
                    setFormVisible(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={busy !== null}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  className="flex-1 sm:flex-none"
                  onClick={() => void toggleSpecialization(specialization)}
                  disabled={busy !== null}
                >
                  {busy === `toggle-${specialization.id}` ? "Processing..." : specialization.active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



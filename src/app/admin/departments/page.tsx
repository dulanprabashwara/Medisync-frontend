"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading } from "@/components/portal-ui";
import { SectionCard } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/forms";
import {
  createAdminDepartment,
  getAdminDepartments,
  getAdminHospitals,
  updateAdminDepartment,
} from "@/lib/api";
import type { AdminDepartment, AdminHospital } from "@/types/user";

const emptyDepartment = { id: "", hospitalId: "", name: "", active: true };

export default function DepartmentsPage() {
  const { session } = useAuth();
  
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [hospitals, setHospitals] = useState<AdminHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState(emptyDepartment);
  
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async (showLoader = true) => {
    if (!session) return;
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const [departmentsData, hospitalsData] = await Promise.all([
        getAdminDepartments(session.access_token),
        getAdminHospitals(session.access_token)
      ]);
      setDepartments(departmentsData);
      setHospitals(hospitalsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Departments could not be loaded.");
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

  async function saveDepartment(event: FormEvent) {
    event.preventDefault();
    if (!session || !form.hospitalId || !form.name.trim()) return;
    
    await runAction(
      "save",
      form.id ? "Department updated." : "Department created.",
      async () => {
        const input = {
          hospitalId: form.hospitalId,
          name: form.name.trim(),
          active: form.active,
        };
        if (form.id) {
          await updateAdminDepartment(session.access_token, { id: form.id, ...input });
        } else {
          await createAdminDepartment(session.access_token, input);
        }
        setFormVisible(false);
        setForm(emptyDepartment);
      }
    );
  }

  async function toggleDepartment(department: AdminDepartment) {
    if (!session) return;
    if (!window.confirm(`${department.active ? "Deactivate" : "Activate"} department ${department.name}?`)) return;
    
    await runAction(
      `toggle-${department.id}`,
      `Department ${department.active ? "deactivated" : "activated"}.`,
      () => updateAdminDepartment(session.access_token, {
        id: department.id,
        hospitalId: department.hospitalId,
        name: department.name,
        active: !department.active,
      })
    );
  }

  if (loading) return <LoadingPanel label="Loading departments..." />;

  return (
    <div className="space-y-8">
      <PortalHeading
        eyebrow="SYSTEM DATA"
        title="Departments"
        description="Manage medical departments available in Doctor profiles."
      />

      {error && !formVisible && <Alert tone="error">{error}</Alert>}
      {message && !formVisible && <Alert tone="success">{message}</Alert>}

      <div className="flex justify-end mb-4">
        {!formVisible && (
          <Button onClick={() => {
            setForm(emptyDepartment);
            setFormVisible(true);
            setError(null);
            setMessage(null);
          }}>
            Add Department
          </Button>
        )}
      </div>

      {formVisible && (
        <SectionCard title={form.id ? "Edit Department" : "Add Department"} className="mb-8">
          {error && <Alert tone="error" className="mb-4">{error}</Alert>}
          <form onSubmit={saveDepartment} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Hospital *</Label>
                <Select
                  required
                  value={form.hospitalId}
                  onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
                >
                  <option value="" disabled>Select a hospital...</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Department Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Cardiology"
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2 mt-2">
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
              <Button type="submit" disabled={busy !== null || !form.hospitalId || !form.name.trim()}>
                {busy === "save" ? "Saving..." : form.id ? "Save Changes" : "Add Department"}
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      <div className="grid gap-4">
        {departments.length === 0 ? (
          <EmptyState message="No departments have been added yet." />
        ) : (
          departments.map((department) => (
            <div key={department.id} className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-900 text-lg">{department.name}</h3>
                  {!department.active && (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-medium">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{department.hospitalName}</p>
                <p className="text-xs text-slate-400 mt-2">{department.doctorCount || 0} affiliated doctors</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    setForm({
                      id: department.id,
                      hospitalId: department.hospitalId,
                      name: department.name,
                      active: department.active,
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
                  onClick={() => void toggleDepartment(department)}
                  disabled={busy !== null}
                >
                  {busy === `toggle-${department.id}` ? "Processing..." : department.active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



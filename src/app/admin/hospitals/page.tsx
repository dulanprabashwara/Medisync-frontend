"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading } from "@/components/portal-ui";
import { SectionCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/forms";
import {
  createAdminHospital,
  getAdminHospitals,
  updateAdminHospital,
} from "@/lib/api";
import type { AdminHospital } from "@/types/user";

const emptyHospital = {
  id: "",
  name: "",
  addressLine: "",
  city: "",
  phone: "",
  active: true,
};

export default function HospitalsPage() {
  const { session } = useAuth();
  
  const [hospitals, setHospitals] = useState<AdminHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState(emptyHospital);
  
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async (showLoader = true) => {
    if (!session) return;
    if (showLoader) setLoading(true);
    setError(null);
    try {
      setHospitals(await getAdminHospitals(session.access_token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hospitals could not be loaded.");
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
    if (!session || !form.name.trim()) return;
    
    await runAction(
      "save",
      form.id ? "Hospital updated." : "Hospital created.",
      async () => {
        const input = {
          name: form.name.trim(),
          addressLine: form.addressLine.trim() || null,
          city: form.city.trim() || null,
          phone: form.phone.trim() || null,
          active: form.active,
        };
        if (form.id) {
          await updateAdminHospital(session.access_token, { id: form.id, ...input });
        } else {
          await createAdminHospital(session.access_token, input);
        }
        setFormVisible(false);
        setForm(emptyHospital);
      }
    );
  }

  async function toggleHospital(hospital: AdminHospital) {
    if (!session) return;
    if (!window.confirm(`${hospital.active ? "Deactivate" : "Activate"} hospital ${hospital.name}?`)) return;
    
    await runAction(
      `toggle-${hospital.id}`,
      `Hospital ${hospital.active ? "deactivated" : "activated"}.`,
      () => updateAdminHospital(session.access_token, {
        id: hospital.id,
        name: hospital.name,
        addressLine: hospital.addressLine,
        city: hospital.city,
        phone: hospital.phone,
        active: !hospital.active,
      })
    );
  }

  if (loading) return <LoadingPanel label="Loading hospitals..." />;

  return (
    <div className="space-y-8">
      <PortalHeading
        eyebrow="SYSTEM DATA"
        title="Hospitals"
        description="Manage hospitals available for Doctor professional affiliation."
      />

      {error && !formVisible && <Alert tone="error">{error}</Alert>}
      {message && !formVisible && <Alert tone="success">{message}</Alert>}

      <div className="flex justify-end mb-4">
        {!formVisible && (
          <Button onClick={() => {
            setForm(emptyHospital);
            setFormVisible(true);
            setError(null);
            setMessage(null);
          }}>
            Add Hospital
          </Button>
        )}
      </div>

      {formVisible && (
        <SectionCard title={form.id ? "Edit Hospital" : "Add Hospital"} className="mb-8">
          {error && <Alert tone="error" className="mb-4">{error}</Alert>}
          <form onSubmit={saveHospital} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Hospital Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Teaching Hospital Kandy"
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g., Kandy"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Contact number"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Address Line</Label>
                <Input
                  value={form.addressLine}
                  onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                  placeholder="Street address"
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
              <Button type="submit" disabled={busy !== null}>
                {busy === "save" ? "Saving..." : form.id ? "Save Changes" : "Add Hospital"}
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      <div className="grid gap-4">
        {hospitals.length === 0 ? (
          <EmptyState title="No hospitals have been added yet." />
        ) : (
          hospitals.map((hospital) => (
            <div key={hospital.id} className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-900 text-lg">{hospital.name}</h3>
                  {!hospital.active && (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-medium">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {[hospital.city, hospital.addressLine].filter(Boolean).join(" - ") || "No location provided"}
                </p>
                {hospital.phone && <p className="text-sm text-slate-500">{hospital.phone}</p>}
                <p className="text-xs text-slate-400 mt-2">{hospital.doctorCount || 0} affiliated doctors</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    setForm({
                      id: hospital.id,
                      name: hospital.name,
                      addressLine: hospital.addressLine ?? "",
                      city: hospital.city ?? "",
                      phone: hospital.phone ?? "",
                      active: hospital.active,
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
                  onClick={() => void toggleHospital(hospital)}
                  disabled={busy !== null}
                >
                  {busy === `toggle-${hospital.id}` ? "Processing..." : hospital.active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



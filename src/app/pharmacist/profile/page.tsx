"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FormAlert } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { LoadingPanel } from "@/components/loading-panel";
import { PortalHeading } from "@/components/portal-ui";
import { ProtectedRoute } from "@/components/protected-route";
import { ProfileImageEditor } from "@/components/profile-image-editor";
import { AccountSettingsDangerZone } from "@/components/account-settings-danger-zone";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  getPharmacistProfessionalProfile,
  submitPharmacistVerification,
  updatePharmacistProfessionalProfile,
  updatePatientProfile,
} from "@/lib/api";
import { SectionCard } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/forms";
import type {
  PharmacistProfessionalProfile,
  PharmacistProfileInput,
} from "@/types/user";
import toast from "react-hot-toast";

const emptyForm: PharmacistProfileInput = {
  professionalRegistrationNumber: "",
  pharmacyName: "",
  pharmacyRegistrationNumber: "",
  pharmacyAddress: "",
  qualifications: "",
};

const draftStoragePrefix = "medisync:pharmacist-profile-draft:";
const draftFields: (keyof PharmacistProfileInput)[] = [
  "professionalRegistrationNumber",
  "pharmacyName",
  "pharmacyRegistrationNumber",
  "pharmacyAddress",
  "qualifications",
];

function profileForm(
  profile: PharmacistProfessionalProfile,
): PharmacistProfileInput {
  return {
    professionalRegistrationNumber:
      profile.professionalRegistrationNumber ?? "",
    pharmacyName: profile.pharmacyName ?? "",
    pharmacyRegistrationNumber: profile.pharmacyRegistrationNumber ?? "",
    pharmacyAddress: profile.pharmacyAddress ?? "",
    qualifications: profile.qualifications ?? "",
  };
}

function draftKey(userId: string) {
  return `${draftStoragePrefix}${userId}`;
}

function readDraft(userId: string): PharmacistProfileInput | null {
  try {
    const stored = window.sessionStorage.getItem(draftKey(userId));
    if (!stored) return null;
    const candidate = JSON.parse(stored) as Partial<
      Record<keyof PharmacistProfileInput, unknown>
    >;
    if (draftFields.some((field) => typeof candidate[field] !== "string")) {
      window.sessionStorage.removeItem(draftKey(userId));
      return null;
    }
    return Object.fromEntries(
      draftFields.map((field) => [field, candidate[field]]),
    ) as unknown as PharmacistProfileInput;
  } catch {
    return null;
  }
}

function writeDraft(userId: string, draft: PharmacistProfileInput) {
  try {
    window.sessionStorage.setItem(draftKey(userId), JSON.stringify(draft));
  } catch {
    // The form still works if browser storage is unavailable.
  }
}

function clearDraft(userId: string) {
  try {
    window.sessionStorage.removeItem(draftKey(userId));
  } catch {
    // The server remains the source of truth after a successful save.
  }
}

function Content() {
  const { session } = useAuth();
  const [value, setValue] = useState<PharmacistProfessionalProfile | null>(
    null,
  );
  const [form, setForm] = useState<PharmacistProfileInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const apply = useCallback((next: PharmacistProfessionalProfile) => {
    setValue(next);
    setForm(profileForm(next));
  }, []);

  const load = useCallback(async () => {
    if (!session) return;
    const storedDraft = readDraft(session.user.id);
    if (storedDraft) setForm(storedDraft);
    setDraftAvailable(storedDraft !== null);
    setDraftRestored(false);
    setLoading(true);
    try {
      const next = await getPharmacistProfessionalProfile(session.access_token);
      setValue(next);
      if (storedDraft && next.editable) {
        setForm(storedDraft);
        setDraftRestored(true);
      } else {
        setForm(profileForm(next));
        setDraftAvailable(false);
        if (!next.editable) clearDraft(session.user.id);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The professional profile could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [session]);

  function updateField(field: keyof PharmacistProfileInput, text: string) {
    if (!session) return;
    setForm((current) => {
      const next = { ...current, [field]: text };
      writeDraft(session.user.id, next);
      return next;
    });
    setDraftAvailable(true);
    setDraftRestored(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!session || !value?.editable) return;
    setBusy("save");
    setError(null);
    try {
      const next = await updatePharmacistProfessionalProfile(
        session.access_token,
        form,
      );
      clearDraft(session.user.id);
      setDraftAvailable(false);
      setDraftRestored(false);
      apply(next);
      toast.success("Professional profile saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The profile could not be saved.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (
      !session ||
      !value?.editable ||
      !window.confirm(
        "Submit this professional profile for administrator verification?",
      )
    )
      return;
    setBusy("submit");
    setError(null);
    try {
      await updatePharmacistProfessionalProfile(session.access_token, form);
      const next = await submitPharmacistVerification(session.access_token);
      clearDraft(session.user.id);
      setDraftAvailable(false);
      setDraftRestored(false);
      apply(next);
      toast.success("Profile submitted for administrator approval.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The profile could not be submitted.",
      );
    } finally {
      setBusy(null);
    }
  }

  if (loading && !draftAvailable)
    return <LoadingPanel label="Loading your professional profile..." />;
  const verified = value?.pharmacyAccessAllowed === true;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PortalHeading
        eyebrow=""
        title="Professional Profile"
        description="Administrator verification is required before prescription scanning or dispensing."
        backHref="/pharmacist/dashboard"
      />
      <div className="space-y-8">
        <PersonalInformationCard />
        <AccountInformationCard />
        
        <SectionCard title="Professional Profile">
          <div className="space-y-3">
        {error ? <FormAlert message={error} /> : null}
      </div>
      {value?.verificationStatus === "REJECTED" ? (
        <Alert tone="error" title="Verification rejected">
          <p className="whitespace-pre-wrap">{value.verificationRejectionReason}</p>
          <p className="mt-1">Correct the profile and submit it again.</p>
        </Alert>
      ) : null}
      {value?.submitted ? (
        <Alert tone="warning" title="Awaiting administrator review">
          <p>
            Submitted{" "}
            {value.submittedForVerificationAt
              ? new Date(value.submittedForVerificationAt).toLocaleString()
              : "recently"}
            . Professional fields are locked during review.
          </p>
        </Alert>
      ) : null}
      {verified ? (
        <Alert tone="success" title="Verified pharmacist">
          <p>Your account may securely verify and dispense eligible prescriptions.</p>
        </Alert>
      ) : null}
      <form
        className="mt-7 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        onSubmit={save}
      >
        {loading && draftAvailable ? (
          <Alert tone="info">
            Your unsaved changes were restored. Checking your current
            verification status...
          </Alert>
        ) : null}
        {!loading && value?.editable && draftAvailable ? (
          <Alert tone="warning">
            {draftRestored
              ? "Your unsaved changes were restored for this browser tab."
              : "Unsaved changes are being kept while this browser tab remains open."}
          </Alert>
        ) : null}
        <ProfileField
          label="Professional registration number"
          required
          maxLength={100}
          disabled={!value?.editable}
          value={form.professionalRegistrationNumber}
          onChange={(text) =>
            updateField("professionalRegistrationNumber", text)
          }
        />
        <ProfileField
          label="Pharmacy name"
          required
          maxLength={200}
          disabled={!value?.editable}
          value={form.pharmacyName}
          onChange={(text) => updateField("pharmacyName", text)}
        />
        <ProfileField
          label="Pharmacy registration number"
          maxLength={100}
          disabled={!value?.editable}
          value={form.pharmacyRegistrationNumber}
          onChange={(text) => updateField("pharmacyRegistrationNumber", text)}
        />
        <div className="space-y-2">
          <Label>
            Pharmacy address <span className="text-rose-600">*</span>
          </Label>
          <Textarea
            className="min-h-28 resize-none"
            required
            maxLength={500}
            disabled={!value?.editable}
            value={form.pharmacyAddress}
            onChange={(event) =>
              updateField("pharmacyAddress", event.target.value)
            }
          />
        </div>
        <ProfileField
          label="Qualifications"
          maxLength={500}
          disabled={!value?.editable}
          value={form.qualifications}
          onChange={(text) => updateField("qualifications", text)}
        />
        {value?.editable ? (
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              disabled={busy !== null}
              type="submit"
              loading={busy === "save"}
            >
              Save profile
            </Button>
            <Button
              disabled={busy !== null}
              type="button"
              onClick={() => void submit()}
              loading={busy === "submit"}
            >
              Save and submit for verification
            </Button>
          </div>
        ) : null}
      </form>
      </SectionCard>
      
      <AccountSettingsDangerZone />
      </div>
    </div>
  );
}

function ProfileField({
  label,
  required = false,
  maxLength,
  disabled,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  maxLength: number;
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </Label>
      <Input
        required={required}
        maxLength={maxLength}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function PersonalInformationCard() {
  const { profile, session, refreshProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updatePatientProfile(session.access_token, {
        firstName,
        lastName,
        phone: phone || null,
      });
      await refreshProfile();
      setSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setFirstName(profile?.firstName ?? "");
    setLastName(profile?.lastName ?? "");
    setPhone(profile?.phone ?? "");
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  }

  return (
    <SectionCard title="Personal Information">
      {error && (
        <Alert tone="error" className="mb-6">
          {error}
        </Alert>
      )}
      {success && (
        <Alert tone="success" className="mb-6">
          Profile updated successfully.
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="w-full md:w-56 shrink-0">
          <ProfileImageEditor compact />
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <form onSubmit={handleSave} className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <dl className="grid gap-6 sm:grid-cols-2 text-sm mb-6">
                <div>
                  <dt className="text-slate-500 font-medium mb-1">First Name</dt>
                  <dd className="font-medium text-slate-950">{profile?.firstName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium mb-1">Last Name</dt>
                  <dd className="font-medium text-slate-950">{profile?.lastName}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500 font-medium mb-1">Phone Number</dt>
                  <dd className="font-medium text-slate-950">
                    {profile?.phone || <span className="text-slate-400 italic">Not provided</span>}
                  </dd>
                </div>
              </dl>
              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Edit Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function AccountInformationCard() {
  const { profile } = useAuth();
  
  return (
    <SectionCard title="Account Information">
      <dl className="grid gap-6 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-slate-500 font-medium mb-1">Email</dt>
          <dd className="font-medium text-slate-950">{profile?.email}</dd>
        </div>
        <div>
          <dt className="text-slate-500 font-medium mb-1">Role</dt>
          <dd className="font-medium text-slate-950 capitalize">
            {profile?.role.toLowerCase()}
          </dd>
        </div>
      </dl>
    </SectionCard>
  );
}

export default function Page() {
  return (
    <ProtectedRoute roles={["PHARMACIST"]}>
      <Content />
    </ProtectedRoute>
  );
}


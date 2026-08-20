# MediSync Web

Next.js App Router frontend for MediSync through Phase 2B. Supabase Auth handles credentials and sessions. The Spring Boot API remains the source of truth for roles, account status, doctor verification, availability, appointment slots, appointment transitions, and patient-submitted symptoms.

## Requirements

- Node.js 20.9 or newer
- npm
- The MediSync API running at `http://localhost:8080` by default
- The Supabase publishable/anon key for the configured project

## Configuration

Copy `.env.example` to `.env.local` and provide the publishable key:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key (required for authentication) |
| `NEXT_PUBLIC_API_BASE_URL` | Spring Boot API base URL |

Only browser-safe values use the `NEXT_PUBLIC_` prefix. Never add database credentials or a Supabase service-role key to the frontend.

## Install and run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Authentication setup

In Supabase Auth, enable email/password authentication and configure the local site/redirect URLs, including:

```text
http://localhost:3000/auth/callback
```

Registration creates only a Supabase Auth account. Once authenticated, the frontend calls `GET /api/users/me` with the Supabase access token. A missing application profile routes the user to `/onboarding`; the backend creates and returns the trusted role, and the frontend routes to the matching protected dashboard.

Public onboarding offers Patient, Doctor, and Pharmacist only. There is no public Admin choice or Admin registration endpoint.

Phase 2A adds an administrator portal for hospital, department, specialization, and doctor-verification management. Pending doctors complete a database-backed professional profile, submit it for review, and become active only after an administrator approves it.

## Phase 2B pages

| Route | Purpose |
| --- | --- |
| `/doctor/availability` | Create date-based windows, inspect generated slots, block/unblock open slots, and safely deactivate windows |
| `/doctor/appointments` | Review assigned symptoms and accept, reject, or doctor-cancel appointments |
| `/patient/doctors` | Search ACTIVE VERIFIED doctors by name and professional reference filters |
| `/patient/doctors/[doctorId]` | View a patient-safe profile, select an AVAILABLE future slot, and submit symptoms |
| `/patient/appointments` | View own pending, confirmed, rejected, and cancelled appointments and cancel eligible appointments |

All calls use the centralized authenticated API client. The booking UI sends `slotId` plus the symptom form only; it never treats browser-supplied doctor or schedule values as authoritative. Loading, empty, validation, conflict, and duplicate-submission states are represented on each workflow page.

## Quality checks

```powershell
npm run lint
npm run typecheck
npm run build
```

The app can be built without a real anon key. Authentication screens then show a clear configuration error until `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supplied in `.env.local`.

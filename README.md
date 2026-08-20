# MediSync Web

Next.js App Router frontend for MediSync through Phase 2B. MediSync is an online patient-care platform that helps patients find verified doctors, request scheduled online consultations, and avoid unnecessary hospital visits. Supabase Auth handles credentials and sessions. The Spring Boot API remains the source of truth for roles, account status, doctor verification, availability, appointment slots, appointment transitions, and patient-submitted symptoms.

The frontend presents Phase 2 bookings as online consultations. Internal TypeScript names, backend routes, database records, and statuses retain the established `appointment` terminology.

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

## Phase 2B online consultation pages

| Route | Purpose |
| --- | --- |
| `/doctor/availability` | Create online consultation availability, inspect generated times, block/unblock open times, and safely deactivate windows |
| `/doctor/appointments` | Review consultation requests and accept, decline, or doctor-cancel online consultations |
| `/patient/doctors` | Search ACTIVE VERIFIED doctors by name and professional reference filters |
| `/patient/doctors/[doctorId]` | View a patient-safe profile, select an AVAILABLE future online consultation time, and submit symptoms |
| `/patient/appointments` | View pending, confirmed, declined, and cancelled online consultations and cancel eligible consultations |

All calls use the centralized authenticated API client. The booking UI sends `slotId` plus the symptom form only; it never treats browser-supplied doctor or schedule values as authoritative. Loading, empty, validation, conflict, and duplicate-submission states are represented on each workflow page.

## Product roadmap

- Phase 1: authentication, roles, and security (complete)
- Phase 2A: reference data, professional profiles, and administrator verification (complete)
- Phase 2B: availability, doctor discovery, online consultation booking, symptom submission, and booking transitions (complete)
- Phase 3: online consultation session, secure doctor-patient chat, clinical notes, and consultation status (future)
- Phase 4: digital prescriptions, patient prescription view, and QR support (future)
- Phase 5: pharmacist scanning, prescription verification, and dispensing (future)

Secure chat is planned only for a patient and doctor with a confirmed consultation relationship. It is not implemented in Phase 2B. Remote monitoring and formal follow-up scheduling are outside the core roadmap.

## Quality checks

```powershell
npm run lint
npm run typecheck
npm run build
```

The app can be built without a real anon key. Authentication screens then show a clear configuration error until `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supplied in `.env.local`.

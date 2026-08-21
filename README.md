# MediSync Web

Next.js App Router frontend for MediSync through Phase 4. MediSync is an online patient-care platform that helps patients find verified doctors, request scheduled online consultations, communicate within confirmed care relationships, and avoid unnecessary hospital visits. Supabase Auth handles credentials and sessions. The Spring Boot API remains the source of truth for roles, account status, doctor verification, scheduling, consultation lifecycle, persistent messages, clinical notes, and digital prescriptions.

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

## Phase 3 online consultation pages

| Route | Purpose |
| --- | --- |
| `/patient/consultations/[consultationId]` | Patient-safe details, lifecycle status, persistent history, and consultation-scoped chat |
| `/doctor/consultations/[consultationId]` | Lifecycle controls, consultation chat, symptoms, and the assigned doctor's private clinical note |

The patient and doctor appointment lists expose consultation links and the `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, or `CANCELLED` status after an appointment is confirmed. The doctor may start and complete the session. Completed chat remains available for related communication; cancelled chat retains its history but is read-only. Patient screens never request or render clinical-note data.

Messages are saved through authenticated REST before they appear as durable history. A single STOMP client for the open consultation subscribes to `/user/queue/consultation-events` for live message and status delivery. Before every initial connection or reconnect, the client retrieves the latest Supabase session and puts its access token in the STOMP `Authorization` header, never in the WebSocket URL. On connection it reloads REST details and history, deduplicating by message ID, so missed live events do not cause data loss.

## Phase 4 digital prescription pages

| Route | Purpose |
| --- | --- |
| `/doctor/prescriptions` | Doctor prescription and draft history |
| `/doctor/prescriptions/[prescriptionId]` | Structured draft editor, issue confirmation, immutable details, and cancellation |
| `/patient/prescriptions` | Patient list of issued and cancelled prescriptions |
| `/patient/prescriptions/[prescriptionId]` | Medication details, status, print view, and active QR rendering |

The doctor consultation room exposes prescription history and a create/continue-draft action. Patient list responses contain no QR material. Detail pages render the opaque server payload with `qrcode.react` but never display its raw token. Cancelled and expired prescriptions do not render a usable QR. Pharmacist scanning and verification remain Phase 5 placeholders.

## Product roadmap

- Phase 1: authentication, roles, and security (complete)
- Phase 2A: reference data, professional profiles, and administrator verification (complete)
- Phase 2B: availability, doctor discovery, online consultation booking, symptom submission, and booking transitions (complete)
- Phase 3: online consultation session, secure doctor-patient chat, private clinical notes, and consultation status (complete)
- Phase 4: digital prescriptions, patient prescription view, and QR support (current)
- Phase 5: pharmacist scanning, prescription verification, and dispensing (future)

Remote monitoring and formal follow-up scheduling are outside the core roadmap.

## Quality checks

```powershell
npm run lint
npm run typecheck
npm run build
```

The app can be built without a real anon key. Authentication screens then show a clear configuration error until `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supplied in `.env.local`.

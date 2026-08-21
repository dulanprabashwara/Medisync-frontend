# MediSync Web

Next.js App Router frontend for the complete MediSync core workflow through Phase 5. Patients can move from verified-doctor discovery and consultation to a secure digital prescription; verified pharmacists can scan, verify, and dispense it exactly once. Supabase Auth handles credentials and sessions. The Spring Boot API remains the source of truth for role/account status, professional verification, scheduling, consultations, prescriptions, token hashing, and dispensing.

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
| `/doctor/prescriptions/[prescriptionId]` | Lifecycle-aware draft editor, explicit draft discard, issue confirmation, immutable details, and cancellation |
| `/patient/prescriptions` | Patient list of issued and cancelled prescriptions |
| `/patient/prescriptions/[prescriptionId]` | Medication details, status, print view, and on-demand secure QR generation |

The doctor consultation room exposes prescription history and a create/continue-draft action only while the consultation is scheduled or in progress. Issuance is shown only in progress. Completed consultations keep existing prescriptions viewable and chat writable, but hide prescribing controls; a legacy completed draft is read-only and can only be discarded.

Patient list responses contain no QR material. An eligible detail page provides a **Generate QR** action; the raw opaque payload exists only in browser component state for that response, disappears on refresh, and regeneration invalidates the earlier QR. Cancelled prescription screens show status, date, and reason without medicine items, general instructions, QR controls, or an internal prescription UUID. All prescription UUIDs remain routing details only and are not rendered as labels.

Availability forms reject obvious past starts before submission. Doctor and patient scheduling screens remove elapsed windows/slots on a lightweight one-minute clock refresh, while the backend remains authoritative for future and lead-time checks.

## Phase 5 pharmacist and dispensing pages

| Route | Purpose |
| --- | --- |
| `/pharmacist/profile` | Complete, submit, correct, and review pharmacist professional verification status |
| `/pharmacist/scan` | Browser-camera QR scanning, manual development fallback, safe prescription review, and explicit dispensing confirmation |
| `/pharmacist/dispensing-history` | Newest-first owned dispensing history with immutable medication detail |
| `/admin/dashboard` | Adds pending pharmacist review, approval, and rejection alongside doctor verification |

The scanner dynamically imports `html5-qrcode` only in the browser, prefers the rear camera, stops camera resources after detection/unmount, and suppresses duplicate detections. The raw payload remains only in React component state, is sent in an authenticated POST body, and is cleared after successful dispensing. It is never placed in a URL, browser storage, cookie, or console log. Manual paste provides the same backend verification path without persisting the value.

Patient prescription pages derive **Active**, **Dispensed**, **Expired**, and **Cancelled** display state. Dispensed details show date/pharmacy and remove QR generation. Doctor lists/details show fulfillment status and remove cancellation after dispensing. Pharmacist screens never request symptoms, consultation chat, or private clinical notes.

```text
Patient generates QR → verified pharmacist scans → authenticated Spring Boot POST
→ SHA-256 token lookup → safe medicine review → explicit confirmation
→ single dispensing record + QR revocation → patient/doctor Dispensed status
```

## Product roadmap

- Phase 1: authentication, roles, and security (complete)
- Phase 2A: reference data, professional profiles, and administrator verification (complete)
- Phase 2B: availability, doctor discovery, online consultation booking, symptom submission, and booking transitions (complete)
- Phase 3: online consultation session, secure doctor-patient chat, private clinical notes, and consultation status (complete)
- Phase 4: digital prescriptions, patient prescription view, and hashed on-demand QR support (complete)
- Phase 5: pharmacist verification, QR scanning and verification, dispensing, reuse prevention, and dispensing history (complete)

**MEDISYNC CORE PROJECT COMPLETE** after authenticated browser acceptance succeeds.

Remote monitoring and formal follow-up scheduling are outside the core roadmap.

## Quality checks

```powershell
npm run lint
npm run typecheck
npm run build
```

The app can be built without a real anon key. Authentication screens then show a clear configuration error until `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supplied in `.env.local`.

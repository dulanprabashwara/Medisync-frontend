# MediSync Web

Next.js App Router frontend for MediSync Phase 2A. Supabase Auth handles registration, email confirmation, login, password recovery, session persistence, and logout. The Spring Boot API remains the source of truth for MediSync profiles, roles, account status, healthcare reference data, and doctor verification.

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

## Quality checks

```powershell
npm run lint
npm run typecheck
npm run build
```

The app can be built without a real anon key. Authentication screens then show a clear configuration error until `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supplied in `.env.local`.

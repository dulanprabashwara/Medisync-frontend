# MediSync Frontend

MediSync is a full-stack digital healthcare management platform that connects Patients, verified Doctors, Pharmacists, and Administrators through a secure end-to-end workflow. 

The frontend is a modern Next.js 16 (App Router) application written in TypeScript and styled with Tailwind CSS v4. It delivers role-specific portals for Patients, Doctors, Pharmacists, and Administrators, featuring realtime Patient–Doctor messaging, secure LiveKit WebRTC video consultations, digital prescription token generation (with printable PDF sheet support), external payment confirmation management, camera-based QR pharmacy scanning, and real-time notification popups.

---

## Technology Stack

| Category | Technology / Library | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.3.1` | React framework for SSR, static page generation, and optimized client routing |
| **Language** | TypeScript | `6.0.3` | Type-safe application development across components, hooks, and API clients |
| **UI Library** | React & React DOM | `19.2.8` | Core component framework with modern hooks and state management |
| **Styling** | Tailwind CSS | `4.3.3` | Utility-first CSS framework with modern color tokens, grid, and flex layouts |
| **Typography & Icons** | Geist & Lucide React | `1.7.2` / `1.33.0` | Custom variable typography and high-fidelity interface icons |
| **Authentication** | `@supabase/supabase-js` / `@supabase/ssr` | `2.112.3` / `0.12.4` | Browser session management, JWT authentication, and OAuth/Email auth flow |
| **Realtime WebSockets** | `@stomp/stompjs` | `7.2.1` | STOMP client over WebSockets for live consultation messaging and notifications |
| **Video Consultation** | `@livekit/components-react` / `livekit-client` | `2.9.24` / `2.22.0` | High-definition WebRTC video/audio streaming components |
| **QR Code Generation** | `qrcode.react` | `4.2.0` | Client-side vector SVG rendering of single-use prescription QR tokens |
| **QR Code Scanning** | `html5-qrcode` | `2.3.8` | Device camera stream scanning and barcode processing for Pharmacists |
| **UI Notifications** | `react-hot-toast` | `2.6.0` | Non-blocking realtime toast alerts for appointment and prescription events |

---

## Design System & Theme Specifications

```yaml
name: MediSync Premium Healthcare
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3e4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#00577d'
  on-tertiary: '#ffffff'
  tertiary-container: '#0070a0'
  on-tertiary-container: '#d8edff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  hero:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  gutter: 24px
  margin: 32px
```

### Brand & Style Guidelines

The design system is engineered for professional, enterprise-grade healthcare environments. It prioritizes clarity, technical precision, and a sense of calm reliability. The style is **Corporate / Modern**, leaning into high-end technical aesthetics that bridge the gap between clinical efficiency and software-driven innovation.

The target audience includes clinicians, hospital administrators, and healthcare operators who require a distraction-free, high-performance interface. The visual language conveys trust through a light-slate foundation, technical typography, and a refined use of the teal primary palette. It avoids the clinical coldness of legacy systems while rejecting the ephemeral trends of consumer apps.

### Colors & Palette Allocation

The palette is centered on a deep, authoritative Primary Teal (`#0F766E`), reflecting the brand's medical-technical fusion. This design system utilizes a structured light mode where the canvas is a soft Slate-50/100 (`#F8FAFC`) to reduce eye strain over long shifts, while interactive surfaces are pure white to provide maximum contrast.

Semantic colors are tuned for high-stress environments:
- **Success:** Emerald tones for positive vitals or completed records.
- **Warning:** Amber for cautionary notes or pending alerts.
- **Danger:** Rose for critical health markers or emergency actions.
- **Info:** Slate or primary teal for general system feedback.

Borders utilize a subtle Slate-200 to define layout structure without adding visual noise.

### Typography System

This design system employs a dual-font strategy to balance technical precision with readability:

- **Geist**: Used for headlines, data labels, and UI controls. Its monospaced-influenced proportions ensure that technical values and medical metrics are legible and perfectly aligned.
- **Hanken Grotesk**: Used for body copy and long-form medical records. Its humanist qualities provide a refined, premium reading experience that minimizes cognitive load during data-heavy workflows.

Hierarchy is strictly enforced: 32px page titles establish clear entry points, while 22px section headers organize complex dashboards.

### Layout & Spacing Grid

The design system follows a strict 4px base grid to ensure vertical rhythm across dense healthcare dashboards. 

The layout philosophy uses a **Fluid Grid** for internal management screens, allowing clinical data to expand as needed, and a **Fixed Grid** (max-width 1440px) for administrative portals. 

- **Desktop:** 12-column grid, 24px gutters, 32px side margins.
- **Tablet:** 8-column grid, 16px gutters, 24px side margins.
- **Mobile:** 4-column grid, 12px gutters, 16px side margins. 

Dense information clusters (like lab results) utilize the `sm` (8px) and `md` (12px) increments, while structural separation between modules uses `xl` (24px) and above.

### Elevation & Depth Layering

To maintain a serious and technical tone, this design system rejects heavy shadows in favor of **Tonal Layers** and **Low-contrast Outlines**.

Hierarchy is established through surface stacking:
- **Level 0 (Background):** Light Slate-50/100 (`#F8FAFC`).
- **Level 1 (Cards/Surfaces):** Pure white (`#FFFFFF`) with a 1px Slate-200 border.
- **Level 2 (Popovers/Modals):** Pure white with a subtle, ultra-diffused shadow (10% opacity Slate-400) to distinguish it from the background without feeling "floaty."

Interactive elements like buttons appear flat, only gaining a slight tonal shift or inner glow on hover to signal interactivity.

### Shape & Radius Rules

The shape language balances modern software aesthetics with an approachable feel:

- **Large Containers (Cards):** 16px radius (`rounded-lg`) creates a soft, modern frame for medical data.
- **Interactive Controls (Buttons):** 12px radius ensures buttons feel tactile and distinct from inputs.
- **Utility Elements (Inputs/Chips):** 10px radius for inputs and 4px for small status indicators.

### Component Design Specifications

#### Buttons
- **Primary:** Solid Teal (`#0F766E`) with white Geist Medium text. 12px radius.
- **Secondary:** White background with Teal border and text.
- **Ghost:** No border, Teal text. Used for less frequent actions like "Cancel."

#### Input Fields
- 10px radius. Slate-200 border. Hanken Grotesk 16px text.
- On focus: 2px Primary Teal border with a soft teal outer glow (2px).

#### Cards
- 16px radius. Pure white background. 1px Slate-200 border. 
- Headers within cards use Geist 16px SemiBold and are separated by a subtle horizontal rule.

#### Status Chips
- Pill-shaped (fully rounded).
- Light-tinted backgrounds (e.g., Success Emerald-50) with high-contrast text (Emerald-900).

#### Data Tables
- Header row: Slate-50 background, Geist 12px Bold text, all-caps.
- Rows: 1px Slate-100 bottom border. Hanken Grotesk 14px or 16px text.
- Alternate row striping is discouraged to keep the UI clean; hover states are used instead.

#### Navigational Sidebar
- Persistent on desktop. Pure white or Slate-50.
- Icons: 20px Stroke-based (1.5px weight) in Teal or Slate-500.

---

## Key Features

- **Role-Based Healthcare Portals**: Dedicated, isolated workspaces for Patients, Doctors, Pharmacists, and Administrators.
- **Doctor Discovery & Filtering**: Search active, verified medical practitioners by specialty, hospital, department, or doctor name.
- **Appointment Slot Reservation**: Book online video consultations with real-time slot availability, minimum lead-time validation, and symptom intake submission.
- **Doctor-Controlled LiveKit Video Consultations**: Secure, room-isolated WebRTC video calls initiated by Doctors only after scheduled consultation times.
- **Realtime Patient–Doctor Chat**: Persistent consultation-scoped messaging supporting up to four private image/receipt attachments per message.
- **Digital Prescriptions**: Structured medication drafting, issuance, and PDF rendering by verified medical professionals.
- **Printable Prescription PDF**: Print physical paper prescriptions containing embedded QR codes for presentation at traditional pharmacy counters.
- **Single-Use QR Tokens**: On-demand 256-bit cryptographically secure QR code generation for digital or printed presentation.
- **Pharmacist Camera QR Scanner**: Camera-integrated barcode verification and single-click whole-prescription dispensing.
- **External Payment Confirmation Flow**: Manual payment guidance and Doctor-managed payment verification for positive-fee consultations/prescriptions.
- **Realtime STOMP Notification System**: Live header notification bell with unread badge counters and pop-up toasts for critical clinical events.
- **Administrative Governance**: Professional doctor/pharmacist license verification, account access governance, append-only audit logging, and platform analytics.

---

## Role Capabilities Matrix

| Capability | Patient | Doctor | Pharmacist | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Search Verified Doctors & View Slots | ✓ | — | — | — |
| Book Consultation & Submit Symptoms | ✓ | — | — | — |
| Accept / Reject / Cancel Booking | — | ✓ | — | — |
| Start LiveKit Video Consultation | — | ✓ | — | — |
| Join LiveKit Video Consultation | ✓ (if active) | ✓ | — | — |
| Consultation Chat & Image Attachment | ✓ | ✓ | — | — |
| Write Private Clinical Notes | — | ✓ | — | — |
| Issue Digital Prescription | — | ✓ | — | — |
| Confirm External Payment Receipt | — | ✓ | — | — |
| Generate QR Code & Print PDF Sheet | ✓ | — | — | — |
| Camera Scan & Verify QR Token | — | — | ✓ | — |
| Dispense Whole Prescription | — | — | ✓ | — |
| Verify Doctor / Pharmacist Licenses | — | — | — | ✓ |
| View System Analytics & Audit Logs | — | — | — | ✓ |

---

## End-to-End Healthcare Workflow

```
Patient Registration & Onboarding
       │
       ▼
Doctor Discovery (Search by Specialty / Department)
       │
       ▼
Select Available Time Slot & Submit Symptom Form
       │
       ▼
Doctor Accepts Appointment Request
       │
       ▼
Scheduled Consultation Time Arrives
       │
       ▼
Doctor Starts LiveKit Video Call ──► Patient Receives Realtime Notification & Joins
       │
       ▼
Patient & Doctor Consult via WebRTC Video & Persistent Chat
       │
       ▼
Doctor Drafts & Issues Digital Prescription
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
 Fee Required (Positive Fee)         Zero-Fee Consultation
       │                                 │
 Patient Uploads Payment Receipt         │
       │                                 │
 Doctor Confirms Payment Receipt         │
       │                                 │
       └────────────────┬────────────────┘
                        │
                        ▼
    Patient Generates Secure QR Code / Prints PDF Sheet
                        │
                        ▼
 Patient Presents Mobile Phone Screen OR Printed PDF Sheet to Pharmacist
                        │
                        ▼
 Verified Pharmacist Scans QR Code via Camera Scanner
                        │
                        ▼
 Spring Boot API Validates Token Hash & Displays Safe Medication Details
                        │
                        ▼
 Pharmacist Dispenses Prescription (Single-Use Token Voided Permanently)
```

---

## Mermaid Workflow Diagram

```mermaid
flowchart TD
    A[Patient searches verified Doctors] --> B[Selects slot & submits symptoms]
    B --> C[Doctor reviews appointment request]
    C -->|Reject| D[Appointment Closed]
    C -->|Accept| E[Appointment Scheduled]
    
    E --> F[Scheduled time arrives]
    F --> G[Doctor starts LiveKit video call]
    G --> H[Patient receives STOMP notification]
    H --> I[Patient joins LiveKit WebRTC call]
    
    I --> J[Consultation & persistent chat]
    J --> K[Doctor drafts & issues digital prescription]
    
    K --> L{Fee required?}
    L -->|Yes| M[Patient sends payment receipt via Chat]
    M --> N[Doctor confirms payment]
    N --> O[QR Code unlocked]
    L -->|No / Zero-Fee| O
    
    O --> P[Patient views QR on phone OR prints paper PDF]
    P --> Q[Verified Pharmacist scans QR via camera]
    Q --> R[Backend validates token hash & displays medication]
    R --> S[Pharmacist dispenses prescription]
    S --> T[QR token invalidated / Double-dispensing blocked]
```

---

## System Architecture

```mermaid
flowchart LR
    subgraph Browser["User Browser (Client)"]
        UI[Next.js App Shell & React Components]
    end

    subgraph External["External Services"]
        AUTH[Supabase Auth - Identity & JWT]
        LK[LiveKit Cloud - WebRTC Media]
    end

    subgraph Backend["MediSync Backend"]
        API[Spring Boot REST API]
        STOMP[Spring STOMP WebSocket Server]
        DB[(PostgreSQL Database)]
    end

    UI <-->|Authentication & JWT Session| AUTH
    UI -->|Bearer JWT REST Requests| API
    UI <-->|STOMP WebSockets - Chat & Notifications| STOMP
    UI <-->|WebRTC Video / Audio Streams| LK
    
    API -->|Validate JWT via JWKS| AUTH
    API -->|Pessimistic Lock & SQL Transactions| DB
    STOMP -->|Transaction-Bound Event Dispatch| UI
    API -->|Issue Short-Lived Video Tokens| UI
    API -->|Server-Side Room Operations| LK
```

---

## Sequence Diagram

```mermaid
sequenceDiagram
    actor P as Patient
    participant FE as Next.js Frontend
    participant BE as Spring Boot API
    participant DB as PostgreSQL DB
    actor D as Doctor
    participant LK as LiveKit Cloud
    actor PH as Pharmacist

    P->>FE: Book consultation slot
    FE->>BE: POST /api/patient/appointments
    BE->>DB: Atomic slot reservation (PESSIMISTIC_WRITE)
    
    D->>BE: Accept appointment
    BE->>DB: Update status to CONFIRMED
    BE-->>P: Send STOMP notification
    
    D->>BE: POST /api/doctor/consultations/{id}/start
    BE->>DB: Create ACTIVE video session
    BE->>BE: Generate short-lived LiveKit token
    BE-->>D: Return Doctor LiveKit Token
    BE-->>P: Push VIDEO_CALL_STARTED notification
    
    D->>LK: Join video room as Host
    
    P->>BE: GET /api/patient/consultations/{id}
    BE-->>P: Return Patient LiveKit Token
    P->>LK: Join video room as Participant
    
    D->>BE: POST /api/doctor/prescriptions/{id}/issue
    BE->>DB: Save immutable prescription
    BE-->>P: Push PRESCRIPTION_ISSUED notification
    
    P->>FE: Click Generate QR Code
    FE->>BE: POST /api/patient/prescriptions/{id}/qr
    BE->>DB: Store SHA-256 token hash & return raw token
    FE->>FE: Render QR SVG & display Print PDF button
    
    PH->>FE: Scan QR via device camera
    FE->>BE: POST /api/pharmacist/prescriptions/verify (body: qrPayload)
    BE->>DB: SHA-256 lookup & return medication details
    
    PH->>BE: POST /api/pharmacist/prescriptions/dispense
    BE->>DB: Lock prescription & insert single dispensation record
    BE-->>P: Push DISPENSED notification
    BE-->>PH: Return successful dispensation confirmation
```

---

## LiveKit Video Consultation Architecture

- **WebRTC Cloud Infrastructure**: Audio and video media flows directly between user browsers and LiveKit Cloud via encrypted WebRTC connections.
- **Backend-Only Security**: LiveKit API keys and secrets remain strictly on the Spring Boot backend server; they are never exposed to client-side code.
- **Doctor Access Control**: Only the assigned Doctor can start a video session, and only after the scheduled appointment start time.
- **Patient Join Permission**: Patients cannot create or start video calls. A Patient receives a short-lived token to join only after the Doctor has started the video room.
- **Opaque Identifiers**: Room names and identity tokens use non-PII opaque identifiers.
- **Independent Messaging**: LiveKit native chat is disabled. Consultation communication takes place through MediSync's persistent, database-backed chat system.
- **No Video Recording**: In accordance with medical privacy guidelines, video sessions are live-only and are neither recorded nor stored.

---

## Real-Time Communication Architecture

MediSync uses a STOMP-over-WebSocket protocol (`/ws`) for instant interactive messaging and system notifications.

1. **Consultation Chat**: 
   - Patient and Doctor subscribe to `/user/queue/consultation-events`.
   - Message delivery is transaction-bound: messages are saved to PostgreSQL via REST API before STOMP events are dispatched, ensuring zero message loss.
   - Image and receipt attachments use short-lived pre-signed URLs generated by the API.
2. **System Notifications**:
   - Authenticated clients subscribe to `/user/queue/notifications`.
   - real-time notifications update the top navigation bar Bell badge and trigger interactive pop-up toasts via `react-hot-toast`.
   - Unread counts and notification state are persisted in PostgreSQL, enabling offline users to view unread notifications upon logging in.

```mermaid
sequenceDiagram
    participant Business as Backend Business Logic
    participant DB as PostgreSQL Database
    participant Event as Spring Event Publisher
    participant WS as STOMP WebSocket Server
    participant Toast as Frontend (React-Hot-Toast)

    Business->>DB: Save notification entity
    DB-->>Business: Transaction committed
    Business->>Event: Publish notification event (AFTER_COMMIT)
    Event->>WS: Dispatch to user destination
    WS-->>Toast: Receive STOMP frame
    Toast->>Toast: Increment unread counter & show notification toast
```

---

## Digital Prescription & QR Workflow

1. **Prescription Issuance**: Verified Doctors create structured digital prescriptions containing medication names, dosages, frequencies, durations, and special instructions.
2. **Printable PDF & Digital QR**: Patients can access their issued prescription in two formats:
   - **Digital QR Code**: Generated on-demand as a 256-bit cryptographically random token rendered into a clean QR barcode using `qrcode.react`.
   - **Printable PDF Sheet**: A clean, printable document layout including prescription details and the embedded QR code for presentation at traditional pharmacies.
3. **Token Hash Security**: The raw QR payload exists only in memory during the session. PostgreSQL stores only the SHA-256 hash of the token.
4. **Single-Use Dispensing**: Scanning the QR code at a partner pharmacy invokes the backend verification endpoint. Once dispensed, the single-use token is voided permanently, preventing re-dispensing or QR reuse.

---

## External Payment Workflow

MediSync provides a transparent external payment verification flow for positive-fee consultations:

1. **Payment Instructions**: The Doctor sets the consultation/prescription fee and provides payment guidance (e.g., bank transfer details).
2. **Receipt Submission**: The Patient completes payment externally and uploads the receipt image directly within the consultation chat.
3. **Doctor Confirmation**: The assigned Doctor reviews the receipt and clicks **Confirm Payment** (`POST /api/doctor/prescriptions/{id}/confirm-payment`).
4. **QR Unlocking**: Upon payment confirmation, the prescription status updates and the **Generate QR Code** and **Print PDF** buttons are unlocked for the Patient.
5. **Zero-Fee Exception**: Prescriptions marked with a zero fee automatically bypass payment confirmation and are instantly eligible for QR generation.

---

## Complete Application Screens & Route Directory

### Public & Authentication Routes
| Route | Screen / Purpose |
| :--- | :--- |
| `/` | Modernized MediSync Homepage (Hero, Features, Workflows, FAQ Accordion) |
| `/about` | Platform mission, clinical standards, trust pillars, and team values |
| `/features` | Core feature showcase for Patients, Doctors, Pharmacists, and Administrators |
| `/guides` | Step-by-step user manuals and workflow guides |
| `/login` | User login screen supporting Supabase Email/Password authentication |
| `/register` | User account registration |
| `/onboarding` | Role selection (Patient, Doctor, Pharmacist) and profile initialization |

### Patient Workspace (`/patient/*`)
| Route | Screen / Purpose |
| :--- | :--- |
| `/patient/dashboard` | Care summary, upcoming appointments, and quick action cards |
| `/patient/doctors` | Search verified Doctors with specialty and hospital filters |
| `/patient/doctors/[doctorId]` | View Doctor profile, select available time slots, and submit symptoms |
| `/patient/appointments` | List of requested, confirmed, and past consultation bookings |
| `/patient/consultations/[id]` | Consultation workspace: LiveKit video room, real-time chat, and history |
| `/patient/prescriptions` | Issued digital prescriptions and dispensing status |
| `/patient/prescriptions/[id]` | Prescription detail view, QR code generator, and printable PDF view |
| `/patient/notifications` | Persistent notification history and unread message center |
| `/patient/profile` | Personal profile management and phone number updates |

### Doctor Workspace (`/doctor/*`)
| Route | Screen / Purpose |
| :--- | :--- |
| `/doctor/dashboard` | Clinical overview, daily schedule, and urgent patient requests |
| `/doctor/availability` | Create date-based availability windows, block/unblock time slots |
| `/doctor/appointments` | Review pending consultation requests (Accept, Reject, Cancel) |
| `/doctor/consultations/[id]` | Clinical workspace: Video controls, chat, symptom intake, and private notes |
| `/doctor/prescriptions` | Digital prescription history and active draft manager |
| `/doctor/prescriptions/[id]` | Prescription editor, medication item builder, and issue confirmation |
| `/doctor/notifications` | Real-time appointment and payment notifications |
| `/doctor/profile` | Professional verification profile, license details, and status review |

### Pharmacist Workspace (`/pharmacist/*`)
| Route | Screen / Purpose |
| :--- | :--- |
| `/pharmacist/dashboard` | Pharmacy operational dashboard and dispensing statistics |
| `/pharmacist/scan` | Live camera QR code scanner, payload verification, and dispensing confirmation |
| `/pharmacist/dispensing-history` | Audit log of past dispensations executed by the pharmacist |
| `/pharmacist/notifications` | Account status and platform notifications |
| `/pharmacist/profile` | Pharmacy license submission and verification status management |

### Administrator Workspace (`/admin/*`)
| Route | Screen / Purpose |
| :--- | :--- |
| `/admin/dashboard` | Governance dashboard, pending verifications, and system health metrics |
| `/admin/users` | User directory with account status controls (Ban / Unban) |
| `/admin/verifications` | Professional verification queue for Doctor and Pharmacist applications |
| `/admin/hospitals` | Master directory of affiliated hospitals and clinical institutions |
| `/admin/departments` | Master directory of medical departments |
| `/admin/specializations` | Master directory of medical specialties |
| `/admin/analytics` | Platform utilization metrics, consultation trends, and user activity |
| `/admin/audit-logs` | Filterable append-only system audit log |

---

## Project Structure

```text
d:/MediSync/frontend/
├── public/                     # Static public assets and branding graphics
├── src/
│   ├── app/                    # Next.js 16 App Router pages and layouts
│   │   ├── (auth)/             # Authentication routes (login, register, onboarding)
│   │   ├── about/              # About MediSync page
│   │   ├── admin/              # Administrator portal pages
│   │   ├── doctor/             # Doctor clinical portal pages
│   │   ├── features/           # Platform features overview page
│   │   ├── guides/             # End-to-end user manuals page
│   │   ├── patient/            # Patient care portal pages
│   │   ├── pharmacist/         # Pharmacist dispensing portal pages
│   │   ├── globals.css         # Tailwind CSS v4 design tokens and global styles
│   │   ├── layout.tsx          # Root application layout wrapper
│   │   └── page.tsx            # Modernized public homepage
│   ├── components/             # Reusable UI components
│   │   ├── auth-card.tsx       # Standardized authentication container styles
│   │   ├── auth-provider.tsx   # React Auth context and Supabase session listener
│   │   ├── faq-accordion.tsx   # Smooth height-animated light-box FAQ accordion
│   │   ├── loading-panel.tsx   # Animated loading indicators
│   │   ├── layout/             # App shell, top navigation bar, and sidebar
│   │   ├── notifications/      # Realtime notification context, bell, and toast UI
│   │   └── public/             # Navbar, footer, and marketing components
│   ├── hooks/                  # Custom React hooks (STOMP WebSocket, media queries)
│   ├── lib/                    # API client, Supabase browser client, and utils
│   └── types/                  # TypeScript domain interfaces and DTO declarations
├── .env.example                # Safe environment variable configuration template
├── package.json                # Frontend dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler configuration
└── next.config.ts              # Next.js runtime configuration
```

---

## Environment Variables

Create `.env.local` in `D:\MediSync\frontend\` using the template below. **Do not include actual production secrets.**

```env
# Supabase Authentication (Client-Safe Public Keys)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend Spring Boot API Endpoint
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

> **Security Note**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Database credentials, LiveKit API secrets, and Supabase service-role keys must **never** be placed in the frontend configuration.

---

## Installation & Running Locally

### Prerequisites
- **Node.js**: v20.9.0 or newer
- **npm**: v10.0.0 or newer
- **MediSync API**: Running locally on `http://localhost:8080` (or configured API URL)

### 1. Clone & Install
```powershell
cd D:\MediSync\frontend
npm install
```

### 2. Configure Environment
```powershell
copy .env.example .env.local
```
Fill in your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 3. Start Development Server
```powershell
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Quality Commands

```powershell
# Run ESLint validation
npm run lint

# Run TypeScript type check
npm run typecheck

# Execute Next.js production build verification
npm run build
```

---

## Security & Privacy Safeguards

- **JWT Session Tokens**: Authenticated requests attach Supabase Bearer tokens in the `Authorization` header.
- **Client-Side Authorization Enforcement**: Route middleware and component checks restrict portal access to matching verified roles (`PATIENT`, `DOCTOR`, `PHARMACIST`, `ADMIN`).
- **Memory-Only QR Token Storage**: Raw prescription QR token payloads exist solely in component state during active display and are cleared immediately after rendering or dispensing.
- **Transient Media Links**: Consultation chat attachments and profile photos use short-lived pre-signed URLs; raw storage buckets remain private.
- **Admin Clinical Privacy**: System administrators can manage user accounts and verifications but have no access to clinical consultation notes, patient–doctor chat messages, or prescription QR secrets.

---

## Companion Backend Repository

The backend source code is located in the companion repository:  
📁 [`D:\MediSync\backend`](../backend/README.md) — Spring Boot 3.5 API with PostgreSQL, STOMP WebSockets, and LiveKit Java Server SDK.

---

## License & Project Context

MediSync was designed and built as a full-stack digital healthcare platform for modern remote healthcare delivery. All core features including professional verification, video consultations, persistent chat, digital prescribing, external payment confirmation, and single-use QR dispensing are implemented.

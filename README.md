# MaintainIQ

**AI-powered QR maintenance & asset history platform** — scan, report, triage, and resolve equipment issues in seconds.

MaintainIQ turns every physical asset into a smart, trackable node. Stick a QR label on a machine, and anyone — employee, contractor, or customer — can scan it and report a problem without logging in. Our Gemini-powered AI instantly triages the report, prioritizes it, suggests a fix, and routes it to the right technician. Every action is recorded in an immutable, asset-centric history timeline.

> Built for the hackathon as a production-quality, demo-ready SaaS.

---

## ✨ Key Features

- **Public QR reporting** — Anyone can scan a QR code and file an issue with no account. Public reporters are attributed safely to a system user; no internal data is exposed.
- **AI triage (Gemini)** — Every new issue is auto-analyzed for priority, category, suggested resolution, estimated downtime, and a recurring-pattern warning. A confidence score keeps humans in the loop.
- **Asset-centric history** — A chronological, filterable timeline of every status change, maintenance event, and issue across an asset's lifetime.
- **Role-based access control (RBAC)** — `SUPERVISOR`, `TECHNICIAN`, `ADMINISTRATOR`, `VIEWER` with server-side enforcement. Asset CRUD is admin-only; maintenance and issue workflows follow least-privilege.
- **Technician workload & priority analytics** — Live dashboard with operational health, open/critical issues, resolved-today, upcoming services, and priority distribution.
- **QR label printing** — Generate a print-ready asset label with organization, asset name, code, QR, and scan instructions (download / copy / print).
- **Full maintenance lifecycle** — Schedule, track, and close maintenance records linked to assets and issues.
- **Search & filters** — Cross-entity search across assets and issues with category, location, status, priority, and date filters.
- **Notifications** — Per-user in-app notifications for assignments and status changes.

## 🧱 Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Auth:** Clerk (middleware-protected routes, RBAC via `requireRole`)
- **Database:** PostgreSQL (Neon) via Prisma 7 + `PrismaPg` driver adapter
- **AI:** Google Gemini (`gemini-2.0-flash`) for issue triage
- **UI:** Tailwind CSS + Base UI (Dropdown/Select/Dialog), lucide-react icons
- **Validation:** Zod + `react-hook-form`

## 🗂️ Project Structure

```
app/
  (authenticated)/        # Protected app: dashboard, assets, issues, maintenance,
                          # history, search, settings, notifications
  public/asset/[code]     # Public QR landing page (read-only asset info)
  public/report/[code]    # Public issue reporting (no login required)
  api/
    qr/[id]               # Dynamic QR code generation (SVG)
    issues/public         # Public issue submission endpoint
    assets/search         # Auth-gated asset autocomplete
    categories            # Auth-gated category list
    ai/triage             # Gemini triage endpoint
components/                # UI, forms, dashboard widgets, shared pieces
actions/                  # Server Actions (assets, issues, maintenance, settings, notifications)
lib/                      # db (Prisma), auth (Clerk + RBAC), ai (Gemini)
prisma/                   # schema.prisma
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- A PostgreSQL database (Neon recommended) with a `DATABASE_URL`
- Clerk API keys
- A Google Gemini API key

### Environment variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Google Gemini
GEMINI_API_KEY="..."

# Public base URL (used for QR links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Install & run

```bash
npm install
npx prisma generate
npx prisma db push      # sync schema to your database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo / role switching

The **Settings → Role** panel lets you switch your own role (`SUPERVISOR`, `TECHNICIAN`, `ADMINISTRATOR`, `VIEWER`) so you can experience RBAC from every perspective. Use **Settings → Management** to create categories and locations that power the issue/asset forms.

### Demo Credentials

A seeded administrator account is available for instant testing:

| Field    | Value                   |
| -------- | ----------------------- |
| Email    | `demo@maintainiq.app`   |
| Password | `MaintainIQ123!`        |
| Role     | `ADMINISTRATOR`         |

Sign in, create an asset, print its QR label, then scan it (or open the public link) to file a guest issue — no login required.

> Note: AI triage requires a valid `GEMINI_API_KEY`. Without it the app stays fully functional and AI calls return a clear "service not configured" message.

## 🧩 Architecture

```
Browser ──► Next.js App Router (Server Components + Server Actions)
              │
              ├─ Clerk (auth, RBAC via requireRole / getAuthUser)
              ├─ Prisma 7 + PrismaPg adapter ──► PostgreSQL (Neon)
              ├─ Gemini (app/api/ai/triage) ──► structured issue diagnostics
              └─ Local storage abstraction (lib/storage.ts) ──► /public/uploads

Public flow:  QR scan ──► /public/asset/[code] ──► /public/report/[code]
              └─► app/api/issues/public ──► system reporter + Issue + history
```

Key conventions:
- **Server-side authorization** — every privileged mutation calls `requireRole(...)`. UI gating is defensive only.
- **Audit trail** — `HistoryEntry` records every status change, assignment, and maintenance event with the actor.
- **Public safety** — public pages expose only safe fields (status, condition, service dates, generic activity). Serial numbers, costs, and user PII are never returned.

## 🔌 API Reference

| Method | Route                     | Auth        | Purpose                                 |
| ------ | ------------------------- | ----------- | --------------------------------------- |
| GET    | `/api/qr/[id]`            | Public      | Render the asset QR code (SVG)          |
| POST   | `/api/issues/public`      | Public      | Create an issue from a QR scan (no login) |
| GET    | `/api/assets/search?q=`   | Signed in   | Asset autocomplete for issue forms      |
| GET    | `/api/categories`         | Signed in   | Category list for dropdowns             |
| POST   | `/api/ai/triage`          | Signed in   | Gemini-structured issue triage          |
| POST   | `/api/upload`             | Signed in   | Validate + store evidence image, returns `Attachment` |

All routes return JSON and use conventional HTTP status codes; the AI route degrades gracefully (503/429/502/504) when the key is missing or rate-limited.

## 🎬 Suggested Demo Flow

1. **Sign in** → land on the dashboard with live operational metrics.
2. **Create an asset** (`/assets/new`) and **print its QR label** from the asset detail page.
3. **Scan the QR** (or visit the public link) → file an issue as a guest on `/public/report/[code]` — no login.
4. **Watch AI triage** the issue on creation: priority, suggested resolution, estimated downtime, and a recurring-pattern warning.
5. **Assign a technician** and **transition** the issue through its lifecycle; see it reflected in the asset **history timeline**.
6. **Create maintenance** from a resolved issue and view the full maintenance record.
7. **Switch roles** in Settings to show least-privilege enforcement (e.g., a `VIEWER` cannot edit assets).

## 🔒 Security Notes

- Public QR routes never expose internal records — they return only safe, asset-level public info.
- All privileged mutations use server-side `requireRole` checks; client UI gating is defensive only.
- Public reporters are stored against a dedicated `system:public-reporter` user, keeping the audit trail intact without leaking accounts.

## 🛠️ Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the dev server                 |
| `npm run build`    | Production build (type-checks too)   |
| `npm run start`    | Run the production build             |
| `npm run lint`     | Lint the codebase                    |
| `npx prisma studio`| Inspect the database                 |

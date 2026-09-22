# SaaS Dashboard

A production-ready client & admin dashboard for an early-stage SaaS product,
built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** and
**PostgreSQL** — fully self-hosted, with a custom authentication layer. The
whole stack runs in **Docker Compose**.

> **Status:** Stage 1 complete — project setup, authentication and database.
> Stages 2 (client/admin panel features) and 3 (testing, deploy, polish) follow.

---

## Table of contents

- [Features (Stage 1)](#features-stage-1)
- [Tech stack](#tech-stack)
- [Architecture overview](#architecture-overview)
- [Project structure](#project-structure)
- [Quick start (Docker)](#quick-start-docker)
- [Local development (without Docker)](#local-development-without-docker)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Authentication & authorization](#authentication--authorization)
- [Route map](#route-map)
- [Deployment](#deployment)
- [Scripts reference](#scripts-reference)
- [Roadmap](#roadmap)

---

## Features (Stage 1)

- **Authentication** (custom, self-hosted)
  - Email/password **registration** (server-side validation, bcrypt hashing)
  - **Sign in / sign out** (signed JWT session in an HTTP-only cookie)
  - **Password reset** via single-use, time-limited tokens
- **Authorization**
  - Role-based access control (`client` / `admin`)
  - **Protected routes** enforced in middleware **and** on the server
  - Automatic redirects for unauthenticated / unauthorised users
- **Client dashboard**
  - Account summary and profile view
  - Basic activity history
- **Admin area** (route + role guard reserved; full features in Stage 2)
- **UX**
  - Responsive layout (mobile-first, desktop-friendly)
  - Reusable, typed React components
  - Loading, error and empty states
  - Accessible form fields (labels, `aria-*`, focus rings, skip link)
- **Database**
  - Versioned SQL schema applied automatically in Docker
  - Enforced constraints, indexes and updated-at triggers

---

## Tech stack

| Layer           | Choice                                      |
| --------------- | ------------------------------------------- |
| Framework       | Next.js 14 (App Router, Server Actions)     |
| Language        | TypeScript (strict)                         |
| UI              | React 18 + Tailwind CSS                     |
| Database        | PostgreSQL 16 (`pg` driver)                 |
| Auth            | Custom JWT sessions (`jose`) + `bcryptjs`   |
| Validation      | Zod (shared client + server schemas)        |
| Containerisation| Docker + Docker Compose                     |
| Version control | Git / GitHub                                |

---

## Architecture overview

The app follows a **layered** structure so concerns stay separated:

```
┌──────────────────────────────────────────────────────────────┐
│  app/  (Routing & rendering)                                 │
│  RSC pages, Server Actions, REST route handlers (/api)        │
├──────────────────────────────────────────────────────────────┤
│  components/  (Presentation)                                 │
│  Reusable UI + feature components ("use client" where needed) │
├──────────────────────────────────────────────────────────────┤
│  lib/  (Domain & infrastructure)                             │
│  auth (session/password), db (queries), env, validation, utils│
└──────────────────────────────────────────────────────────────┘
        │                              │
        ▼                              ▼
   JWT session cookie           PostgreSQL (pg pool)
```

**Key decisions**

- **Server-first.** Pages are React Server Components by default; data access
  happens on the server via the `pg` connection pool. No DB credentials ever
  reach the browser.
- **Defense in depth.** Route protection happens in `middleware.ts` *and* in
  server-side guards (`requireUser` / `requireAdmin`). Middleware verifies the
  JWT (Edge-safe); the server guard is the authoritative check.
- **Edge-safe session.** `lib/auth/session.ts` uses only `jose`, so middleware
  can verify tokens without Node-only APIs. Node-only helpers (reset tokens,
  bcrypt) live in separate modules (`lib/auth/tokens.ts`, `lib/auth/password.ts`).
- **Data-access layer.** All SQL lives in `lib/db/*` behind typed functions,
  using parameterised queries (no string-built SQL).
- **Validation once.** Zod schemas in `lib/validation` are reused by both the
  form and the Server Action / API route, so the server never trusts the client.
- **Lazy env validation.** `lib/env.ts` validates on first use, not at import
  time, so builds don't require secrets during static analysis.

---

## Project structure

```
.
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Auth route group (public)
│   │   │   ├── actions.ts          # Server Actions: signup/in/out/reset
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── admin/                  # Admin area (role-guarded)
│   │   ├── api/auth/               # REST auth endpoints
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── forgot-password/route.ts
│   │   │   └── reset-password/route.ts
│   │   ├── dashboard/              # Client dashboard (auth-guarded)
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Public landing
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── auth/                   # Auth forms (client components)
│   │   ├── dashboard/              # App header, etc.
│   │   └── ui/                     # Primitives: Button, Input, Alert, ...
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── session.ts          # JWT create/verify (Edge-safe)
│   │   │   ├── password.ts         # bcrypt hash/verify (server-only)
│   │   │   └── tokens.ts           # reset tokens (server-only)
│   │   ├── db/
│   │   │   ├── users.ts            # profile + credential queries
│   │   │   ├── activity.ts         # activity log queries
│   │   │   └── password-reset.ts   # reset-token persistence
│   │   ├── db.ts                   # pg pool + query helpers
│   │   ├── auth.ts                 # Server guards (requireUser/Admin)
│   │   ├── env.ts                  # Validated environment config
│   │   ├── form-state.ts           # Shared Server Action state types
│   │   ├── utils.ts
│   │   └── validation/auth.ts      # Zod schemas
│   ├── types/database.types.ts     # DB row types
│   └── middleware.ts               # Route protection (Edge)
├── db/init/                        # SQL applied on first DB start
│   ├── 001_schema.sql
│   └── 002_seed.sql
├── scripts/
│   ├── migrate.ts                  # Apply schema to an existing DB
│   └── seed.ts                     # Apply demo data
├── Dockerfile                      # Multi-stage production image
├── docker-compose.yml              # db + app
└── docs/
    ├── database.md
    └── technical-report.md
```

---

## Quick start (Docker)

**Prerequisites:** Docker Desktop (or Docker Engine + Compose v2).

```bash
# Build and start the whole stack (database + app)
docker compose up --build

# Then open http://localhost:3000
```

That's it — the database schema and demo data are applied automatically on the
first run.

### Demo accounts

| Email                | Password    | Role   |
| -------------------- | ----------- | ------ |
| `admin@example.com`  | `Admin1234` | admin  |
| `client@example.com` | `Client1234`| client |

> These are **development** credentials from `db/init/002_seed.sql`. Never ship
> them to production.

### Common Docker commands

```bash
docker compose up --build      # start (rebuild images)
docker compose up -d           # start in the background
docker compose logs -f app     # tail app logs
docker compose down            # stop
docker compose down -v         # stop AND wipe the database volume
```

> **Re-running the schema/seed:** the SQL in `db/init/` only runs on the *first*
> initialisation of an empty data directory. After changing it, run
> `docker compose down -v && docker compose up --build`.

---

## Local development (without Docker)

You can also run the app on the host against the Dockerised database.

```bash
npm install

# Start only the database
docker compose up -d db

# Point the app at it
cp .env.example .env.local       # if present, otherwise create it (see below)
npm run dev                      # http://localhost:3000
```

`.env.local` for local development:

```dotenv
DATABASE_URL=postgresql://app:app_password@localhost:5432/saas_dashboard
JWT_SECRET=dev-secret-please-change-in-prod-at-least-32-chars-long
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Environment variables

| Variable               | Scope  | Description                                                       |
| ---------------------- | ------ | ----------------------------------------------------------------- |
| `DATABASE_URL`         | Server | PostgreSQL connection string                                       |
| `JWT_SECRET`           | Server | Secret for signing session JWTs — **≥ 32 characters**             |
| `NEXT_PUBLIC_SITE_URL` | Public | Base URL, used for links/redirects (e.g. password-reset URL)      |

In Docker Compose these are set in `docker-compose.yml`. For any real
deployment, override `JWT_SECRET` (and the DB credentials) via your platform's
secret store or a `.env` file.

> **Note:** `.env.example` is referenced above, but if it is not present simply
> create `.env.local` with the three variables shown in the previous section.

---

## Database

See **[docs/database.md](docs/database.md)** for the full schema, ER diagram,
migration workflow and reference.

Tables:

| Table                   | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `profiles`              | User accounts + credentials (bcrypt hashes) + role |
| `activity_logs`         | Basic user activity history                        |
| `password_reset_tokens` | Single-use, hashed, time-limited reset tokens      |

Apply schema changes to an existing database:

```bash
npm run db:migrate   # applies every db/init/*.sql in order
npm run db:seed      # applies the demo data
```

---

## Authentication & authorization

- **Passwords** are hashed with bcrypt (cost 12); plaintext is never stored.
- **Sessions** are signed JWTs (`HS256`) stored in an HTTP-only, SameSite=Lax
  cookie, valid for 7 days. The token carries the user id and role.
- **Sign up / sign in** issue the session cookie; **sign out** clears it.
- **Password reset:** `/api/auth/forgot-password` creates a single-use token
  (only its SHA-256 hash is stored). The link lands on
  `/reset-password?token=…`, which validates and consumes the token.
- **Protected routes:**
  - `/dashboard/*` → any authenticated user
  - `/admin/*` → authenticated user with `role = admin`

### REST auth endpoints

| Method | Path                          | Purpose                     |
| ------ | ----------------------------- | --------------------------- |
| POST   | `/api/auth/register`          | Create account + sign in    |
| POST   | `/api/auth/login`             | Sign in                     |
| POST   | `/api/auth/logout`            | Sign out                    |
| POST   | `/api/auth/forgot-password`   | Request a reset link        |
| POST   | `/api/auth/reset-password`    | Complete a password reset   |

---

## Route map

| Route                | Access        | Purpose                              |
| -------------------- | ------------- | ------------------------------------ |
| `/`                  | Public        | Landing page                         |
| `/login`             | Public        | Sign in                              |
| `/register`          | Public        | Create account                       |
| `/forgot-password`   | Public        | Request reset link                   |
| `/reset-password`    | Public (token)| Set a new password                   |
| `/dashboard`         | Authenticated | Client dashboard                     |
| `/dashboard/profile` | Authenticated | Profile view                         |
| `/admin`             | Admin         | Admin area (features land in Stage 2)|

---

## Deployment

The `Dockerfile` produces a small, non-root, standalone Next.js image. Any
container host works (AWS ECS/Fargate, Fly.io, Render, a VPS, ...).

1. Build and push the image:
   ```bash
   docker build -t your-registry/saas-dashboard:latest .
   docker push your-registry/saas-dashboard:latest
   ```
2. Provide `DATABASE_URL`, `JWT_SECRET` and `NEXT_PUBLIC_SITE_URL` as
   environment variables/secrets.
3. Point the app at a managed PostgreSQL instance.
4. Run the container exposing port `3000` behind a TLS-terminating proxy.

> For a managed database, apply the schema with `npm run db:migrate` (set
> `DATABASE_URL` to the managed instance) before first start.

---

## Scripts reference

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the dev server                          |
| `npm run build`     | Production build (standalone output)          |
| `npm run start`     | Run the production build                      |
| `npm run lint`      | ESLint                                        |
| `npm run typecheck` | TypeScript type-check (`tsc --noEmit`)        |
| `npm run format`    | Prettier                                      |
| `npm run db:migrate`| Apply `db/init/*.sql` to `DATABASE_URL`       |
| `npm run db:seed`   | Apply demo data                               |

---

## Roadmap

- **Stage 1 (done):** setup, authentication, database. ✅
- **Stage 2:** client panel (profile editing, full activity), admin panel
  (user list, search/filter, detail view, editing, aggregate stats).
- **Stage 3:** testing, deployment hardening, documentation polish, final
  delivery.

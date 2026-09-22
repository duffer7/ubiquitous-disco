# SaaS Dashboard

A production-ready client & admin dashboard for an early-stage SaaS product,
built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** and
**Supabase** (PostgreSQL + Auth).

> **Status:** Stage 1 complete — project setup, authentication and database.
> Stages 2 (client/admin panel features) and 3 (testing, deploy, polish) follow.

---

## Table of contents

- [Features (Stage 1)](#features-stage-1)
- [Tech stack](#tech-stack)
- [Architecture overview](#architecture-overview)
- [Project structure](#project-structure)
- [Getting started (local development)](#getting-started-local-development)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Install dependencies](#2-install-dependencies)
  - [3. Configure environment variables](#3-configure-environment-variables)
  - [4. Set up the database](#4-set-up-the-database)
  - [5. Create your first (admin) user](#5-create-your-first-admin-user)
  - [6. Run the app](#6-run-the-app)
- [Database](#database)
- [Authentication & authorization](#authentication--authorization)
- [Route map](#route-map)
- [Deployment](#deployment)
- [Scripts reference](#scripts-reference)
- [Roadmap](#roadmap)

---

## Features (Stage 1)

- **Authentication**
  - Email/password **registration** (with server-side validation)
  - **Sign in / sign out**
  - **Password reset** via email link (forgot → email → set new password)
  - **Email confirmation** flow (optional, configurable in Supabase)
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
  - Versioned SQL migrations with Row Level Security
  - Auto-created profiles via database trigger
  - Privilege-escalation guard on the `role` column

---

## Tech stack

| Layer         | Choice                                    |
| ------------- | ----------------------------------------- |
| Framework     | Next.js 14 (App Router, Server Actions)   |
| Language      | TypeScript (strict)                       |
| UI            | React 18 + Tailwind CSS                   |
| Database      | PostgreSQL via Supabase                   |
| Auth          | Supabase Auth (`@supabase/ssr`)           |
| Validation    | Zod (shared client + server schemas)      |
| Deployment    | Vercel (recommended) or AWS                |
| Version control | Git / GitHub                            |

---

## Architecture overview

The app follows a **layered** structure so that concerns stay separated and a
new developer can navigate it quickly:

```
┌──────────────────────────────────────────────────────────────┐
│  app/  (Routing & rendering)                                 │
│  RSC pages, Server Actions, route handlers                   │
├──────────────────────────────────────────────────────────────┤
│  components/  (Presentation)                                 │
│  Reusable UI + feature components ("use client" only where    │
│  interactivity is required)                                  │
├──────────────────────────────────────────────────────────────┤
│  lib/  (Domain & infrastructure)                             │
│  auth guards, Supabase clients, env config, validation, utils │
└──────────────────────────────────────────────────────────────┘
        │                              │
        ▼                              ▼
   Supabase Auth                 Supabase Postgres
                                   (RLS policies)
```

**Key decisions**

- **Server-first.** Pages are React Server Components by default; the Supabase
  session lives in HTTP-only cookies, so tokens are never exposed to JS.
- **Defense in depth.** Route protection happens in `middleware.ts` *and* in
  server-side guards (`requireUser` / `requireAdmin`). Middleware is a fast UX
  layer; the server guard is the real boundary. RLS is the final backstop.
- **Three Supabase clients**, each with a narrow purpose:
  - `client.ts` — browser, anon key (RLS applies)
  - `server.ts` — request-scoped, cookie-based (RLS applies)
  - `admin.ts` — service role, server-only, bypasses RLS (trusted code only)
- **Validation once.** Zod schemas in `lib/validation` are reused by both the
  form and the Server Action, so the server never trusts the client.
- **Lazy env validation.** `lib/env.ts` validates on first use, not at import
  time, so builds don't require secrets to be present during static analysis.

---

## Project structure

```
.
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Auth route group (public)
│   │   │   ├── actions.ts          # Server Actions: signup/in/out/reset
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── admin/                  # Admin area (role-guarded)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   │   ├── callback/route.ts   # Email confirm / password reset callback
│   │   │   └── signout/route.ts    # POST sign-out
│   │   ├── dashboard/              # Client dashboard (auth-guarded)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Public landing
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── auth/                   # Auth forms (client components)
│   │   ├── dashboard/              # App header, etc.
│   │   └── ui/                     # Primitives: Button, Input, Alert, ...
│   ├── lib/
│   │   ├── auth.ts                 # Server-side guards (requireUser/Admin)
│   │   ├── env.ts                  # Validated environment config
│   │   ├── form-state.ts           # Shared Server Action state types
│   │   ├── utils.ts                # cn(), formatDate(), initials()
│   │   ├── validation/auth.ts      # Zod schemas
│   │   └── supabase/               # client / server / middleware / admin
│   ├── types/database.types.ts     # DB types (regenerate with npm run gen:types)
│   └── middleware.ts               # Route protection + session refresh
├── supabase/
│   ├── config.toml                 # Local Supabase config
│   ├── migrations/                 # Versioned SQL migrations
│   └── seed.sql                    # Local dev seed data
├── docs/                           # Database & architecture docs
├── .env.example                    # Environment template (copy to .env.local)
├── package.json
└── README.md
```

---

## Getting started (local development)

### 1. Prerequisites

- **Node.js ≥ 18.18** (see `engines` in `package.json`)
- **npm** (or pnpm/yarn — swap commands accordingly)
- **Docker Desktop** — required by the Supabase CLI for local development
- **(Optional)** the [Supabase CLI](https://supabase.com/docs/guides/cli) — it
  is also installed locally as a dev dependency, so `npx supabase ...` works.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the template and fill in your values:

```bash
cp .env.example .env.local
```

| Variable                        | Scope   | Description                                              |
| ------------------------------- | ------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public  | Your Supabase project URL                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public  | Supabase **anon** key (safe in the browser, RLS-guarded) |
| `NEXT_PUBLIC_SITE_URL`          | Public  | Base URL, used for auth email redirects                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Secret  | Service role key — **server only**, bypasses RLS         |

> **Two ways to get these values**
>
> - **Local Supabase** (recommended for development): run `npm run db:start`
>   and the CLI prints the local URL and keys. Use those.
> - **Hosted Supabase**: create a project at
>   [supabase.com](https://supabase.com), then read the values from
>   **Project Settings → API**.

Never commit `.env.local` — it is already git-ignored.

### 4. Set up the database

**Option A — Local (Docker):**

```bash
npm run db:start     # start local Postgres + Auth + Studio
npm run db:reset     # apply migrations + seed
```

Studio is then available at http://localhost:54323, and auth emails are
captured by Inbucket at http://localhost:54324.

**Option B — Hosted Supabase:**

```bash
npx supabase link --project-ref <your-project-ref>
npm run db:push      # apply migrations to the hosted database
```

### 5. Create your first (admin) user

1. Start the app and go to `/register` to create an account.
2. Promote it to admin (local DB example):

   ```bash
   # Local
   npx supabase db execute --local \
     --sql "update public.profiles set role='admin' where email='you@example.com';"
   ```

   Or run the same SQL in the **SQL editor** of the hosted dashboard.

### 6. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

---

## Database

See **[docs/database.md](docs/database.md)** for the full schema, ER diagram,
migration workflow and RLS policy reference.

Quick summary of the tables:

| Table           | Purpose                                              |
| --------------- | ---------------------------------------------------- |
| `profiles`      | App user data, 1:1 with `auth.users`; holds `role`   |
| `activity_logs` | Basic user activity history                          |

---

## Authentication & authorization

- **Session storage:** Supabase cookies managed by `@supabase/ssr`. The
  middleware refreshes the session on every request so users are never logged
  out mid-session.
- **Sign up:** `signUpAction` → Supabase Auth → trigger creates a `profiles`
  row automatically.
- **Sign in:** `signInAction` → on success redirects to the requested page
  (validated against open redirects).
- **Password reset:** `forgotPasswordAction` sends an email whose link points
  to `/auth/callback?next=/reset-password`; the callback exchanges the code for
  a session, then `/reset-password` lets the user set a new password.
- **Protected routes:**
  - `/dashboard/*` → any authenticated user
  - `/admin/*` → authenticated user with `role = admin`

---

## Route map

| Route                | Access        | Purpose                              |
| -------------------- | ------------- | ------------------------------------ |
| `/`                  | Public        | Landing page                         |
| `/login`             | Public        | Sign in                              |
| `/register`          | Public        | Create account                       |
| `/forgot-password`   | Public        | Request reset link                   |
| `/reset-password`    | Recovery sess.| Set a new password                   |
| `/auth/callback`     | Public        | Email confirmation / recovery code   |
| `/auth/signout`      | POST          | Sign out                             |
| `/dashboard`         | Authenticated | Client dashboard                     |
| `/dashboard/profile` | Authenticated | Profile view                         |
| `/admin`             | Admin         | Admin area (features land in Stage 2)|

---

## Deployment

Recommended target: **Vercel** (zero-config for Next.js). Any Node host also
works (AWS, Render, Fly.io, ...).

### Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add the environment variables from the table above in
   **Project → Settings → Environment Variables**. Set
   `NEXT_PUBLIC_SITE_URL` to your production URL (e.g.
   `https://your-app.vercel.app`).
4. Deploy.

### Supabase (production)

1. Create a hosted Supabase project.
2. Apply migrations: `npx supabase link --project-ref <ref> && npm run db:push`.
3. In **Authentication → URL Configuration**, add your production URL to
   *Site URL* and *Redirect URLs* (include `/auth/callback`).

### AWS (alternative)

Deploy as a container or via the [OpenNext](https://opennext.js.org/) adapter
to Lambda + CloudFront. The environment variable requirements are identical.

---

## Scripts reference

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the dev server                          |
| `npm run build`     | Production build                              |
| `npm run start`     | Run the production build                      |
| `npm run lint`      | ESLint                                        |
| `npm run typecheck` | TypeScript type-check (`tsc --noEmit`)        |
| `npm run format`    | Prettier                                      |
| `npm run db:start`  | Start local Supabase                          |
| `npm run db:stop`   | Stop local Supabase                           |
| `npm run db:reset`  | Reset local DB (re-run migrations + seed)     |
| `npm run db:push`   | Push migrations to a linked hosted project    |
| `npm run gen:types` | Regenerate `src/types/database.types.ts`      |

---

## Roadmap

- **Stage 1 (done):** setup, authentication, database. ✅
- **Stage 2:** client panel (profile editing, full activity), admin panel
  (user list, search/filter, detail view, editing, aggregate stats).
- **Stage 3:** testing, deployment hardening, documentation polish, final
  delivery.

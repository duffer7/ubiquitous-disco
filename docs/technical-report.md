# Technical Report — Stage 1

**Project:** SaaS Dashboard (client & admin panel)
**Scope:** Stage 1 — project setup, authentication, database
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase
(PostgreSQL + Auth) · Zod
**Status:** ✅ Complete — builds, type-checks and lints cleanly.

---

## 1. Objectives & what was delivered

Stage 1 laid the foundation for the whole product. The goal was a clean,
typed, production-ready skeleton with a real authentication system and a
properly designed database — not a throwaway prototype.

Delivered:

| Area                    | Status | Notes                                                       |
| ----------------------- | :----: | ----------------------------------------------------------- |
| Project setup           |   ✅   | Next.js App Router, TS strict, Tailwind, ESLint, Prettier   |
| Database schema         |   ✅   | Versioned migrations, RLS, triggers, seed data              |
| Registration            |   ✅   | Server-validated, auto-creates a profile                    |
| Login / logout          |   ✅   | Cookie sessions, safe redirects                             |
| Password reset          |   ✅   | Email link → callback → set new password                    |
| Protected routes        |   ✅   | Middleware + server guards + RLS (defense in depth)         |
| Roles (client / admin)  |   ✅   | Enum column, privilege-escalation guard, admin route gate   |
| Client dashboard (base) |   ✅   | Account summary, profile view, activity history             |
| UI/UX                   |   ✅   | Responsive, reusable components, loading/error/empty states |
| Documentation           |   ✅   | README + this report + database docs                        |

---

## 2. Architecture

The app is organised in three layers:

```
Routing & rendering   →  src/app/          (RSC pages, Server Actions, handlers)
Presentation          →  src/components/    (UI primitives + feature components)
Domain & infra        →  src/lib/          (auth guards, Supabase, env, validation)
```

### 2.1 Rendering model

Pages are **React Server Components** by default. Data fetching (profiles,
activity) happens on the server, so no database credentials or auth tokens ever
reach the browser. Client components (`"use client"`) are used only where
interactivity is required — the auth forms and a couple of small primitives.

### 2.2 Supabase client strategy

Three separate clients, each with a single responsibility:

| Client            | File                      | Key        | Where it runs          |
| ----------------- | ------------------------- | ---------- | ---------------------- |
| Browser           | `lib/supabase/client.ts`  | anon       | Client Components      |
| Server (request)  | `lib/supabase/server.ts`  | anon       | RSC / Actions / Routes |
| Admin (trusted)   | `lib/supabase/admin.ts`   | service    | Server-only code       |

The admin client is marked `import "server-only"`, so importing it from client
code is a **build-time error**. The service role key never leaves the server.

### 2.3 Authentication flow

- Sessions are stored in **HTTP-only cookies** managed by `@supabase/ssr`.
- `middleware.ts` refreshes the session on every request, so users are never
  logged out mid-session.
- Email confirmation and password-recovery links both hit
  `/auth/callback`, which exchanges the one-time `code` for a session before
  redirecting to the intended page.

### 2.4 Defense in depth (three layers)

Authorization is never trusted to a single mechanism:

1. **Middleware** — fast redirects for unauthenticated / non-admin users (UX).
2. **Server guards** — `requireUser()` / `requireAdmin()` in `lib/auth.ts`
   enforce access at render time; this is the authoritative check.
3. **Row Level Security** — the database itself only returns rows a user may
   see, even if application code is bypassed.

Middleware is explicitly treated as a *convenience* layer, not the security
boundary.

---

## 3. Key technical decisions & rationale

| Decision | Rationale |
| --- | --- |
| **Supabase for auth + DB** | Battle-tested auth (hashing, email flows, sessions) and Postgres with RLS out of the box — far less custom security code than rolling our own JWT auth. |
| **App Router + Server Actions** | Colocated data mutations, fewer client bundles, progressive enhancement. |
| **Zod schemas shared client/server** | One source of truth for validation; the server never trusts the client. |
| **Lazy env validation (`lib/env.ts`)** | Importing env must not throw during the build's static-analysis phase; validation runs on first use with a clear error message. |
| **`form-state.ts` separate from `actions.ts`** | Next.js only allows `async` exports from `"use server"` files; shared types/constants live in a plain module. |
| **Lazy DB types (`database.types.ts`)** | Hand-written for bootstrap, regenerated from the live schema via `npm run gen:types` to stay in sync. |
| **`bigint` identity for logs, `uuid` for profiles** | Profiles mirror `auth.users` (uuid); high-volume logs benefit from a compact sequential key. |
| **Privilege-escalation trigger** | Guarantees users cannot self-promote to admin, even via a direct API call allowed by the RLS update policy. |

---

## 4. Database design

Two tables, fully documented in [`docs/database.md`](database.md):

- **`profiles`** — 1:1 with `auth.users`, holds the `role` and custom fields.
  Created automatically by the `handle_new_user` trigger on signup.
- **`activity_logs`** — basic per-user activity history.

Design highlights:

- **RLS on every table**, with `SECURITY DEFINER` helpers (`is_admin()`) to
  avoid policy recursion.
- **Grants follow least privilege**: authenticated users get only
  `select`/`update` where policies allow; admin writes use the service role.
- **Automatic `updated_at`** via trigger — no reliance on app code.

---

## 5. Security considerations

- Passwords are handled entirely by Supabase Auth (bcrypt); the app never sees
  or stores them.
- Service role key is server-only, guarded by `server-only` import.
- **Open-redirect protection** on post-login and callback redirects (only
  same-origin relative paths allowed).
- **Generic auth error messages** ("Invalid email or password") to avoid
  leaking which emails are registered.
- **Constant reset response** — the forgot-password flow returns the same
  message whether or not the account exists.
- `aria-*` attributes, focus rings and a skip link for accessibility.

---

## 6. Verification performed

| Check                         | Command             | Result |
| ----------------------------- | ------------------- | :----: |
| Production build              | `npm run build`     |  ✅ 13 routes, 0 errors |
| Type safety                   | `npm run typecheck` | ✅ 0 errors |
| Linting                       | `npm run lint`      | ✅ 0 warnings/errors |

---

## 7. Known limitations / deferred to later stages

These are intentional scope boundaries for Stage 1:

- **Admin panel features** (user list, search/filter, detail view, editing,
  aggregate stats) — the route + role guard exist; features land in Stage 2.
- **Profile editing** on the client dashboard — Stage 2.
- **Automated tests** (unit / e2e) — Stage 3.
- **Rate limiting** on auth endpoints — recommended for Stage 3 hardening
  (can be added via middleware or Supabase settings).
- **Activity logging of real events** — the table and read path exist; write
  hooks for concrete events are added alongside Stage 2 features.
- **`activity_logs` seeding** relies on at least one profile existing (seed is
  a no-op otherwise).

---

## 8. How a new developer continues

1. Read `README.md` → run the app locally in ~5 minutes.
2. Read `docs/database.md` → understand the schema and RLS.
3. Follow the layered structure: new pages in `app/`, components in
   `components/`, logic in `lib/`.
4. Add migrations with `npx supabase migration new <name>`, then
   `npm run db:reset` and `npm run gen:types`.

The codebase is intentionally small, consistently formatted (Prettier) and
strictly typed so that Stage 2 can build on it without refactoring.

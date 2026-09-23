# Technical Report — Stage 1

**Project:** Orbit — Customer Operations Platform (client & admin panel) — **self-hosted**
**Scope:** Stage 1 — project setup, authentication, database
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL ·
Custom JWT auth (jose + bcryptjs) · Zod · Docker Compose
**Status:** ✅ Complete — builds, type-checks and lints cleanly, and runs
end-to-end in Docker.

---

## 1. Objectives & what was delivered

Stage 1 laid the foundation for the whole product: a clean, typed,
production-ready skeleton with real authentication and a properly designed
database, all running in Docker.

| Area                    | Status | Notes                                                       |
| ----------------------- | :----: | ----------------------------------------------------------- |
| Project setup           |   ✅   | Next.js App Router, TS strict, Tailwind, ESLint, Prettier   |
| Containerisation        |   ✅   | Dockerfile (multi-stage) + docker-compose (db + app)        |
| Database schema         |   ✅   | Versioned SQL, constraints, indexes, triggers, seed data    |
| Registration            |   ✅   | Server-validated, bcrypt hashing                            |
| Login / logout          |   ✅   | JWT session cookie, safe redirects                          |
| Password reset          |   ✅   | Single-use, hashed, time-limited tokens                     |
| Protected routes        |   ✅   | Middleware (Edge) + server guards                           |
| Roles (client / admin)  |   ✅   | Enum role, admin route gate                                 |
| Client dashboard (base) |   ✅   | Account summary, profile view, activity history             |
| UI/UX                   |   ✅   | Responsive, reusable components, loading/error/empty states |
| Documentation           |   ✅   | README + this report + database docs                        |

---

## 2. Architecture

Three layers:

```
Routing & rendering   →  src/app/          (RSC pages, Server Actions, /api routes)
Presentation          →  src/components/    (UI primitives + feature components)
Domain & infra        →  src/lib/          (auth, db, env, validation, utils)
```

### 2.1 Rendering model

Pages are **React Server Components** by default. Data access happens on the
server through a `pg` connection pool; no DB credentials or tokens ever reach
the browser. Client components (`"use client"`) are used only where
interactivity is required — the auth forms and a few small primitives.

### 2.2 Authentication design

A **custom, self-hosted** auth layer replaces the earlier Supabase dependency:

- **Password hashing:** bcrypt (cost 12), per-password salt.
- **Sessions:** signed JWT (`HS256`, via `jose`) stored in an HTTP-only,
  SameSite=Lax cookie (7-day expiry). The token carries `sub` (user id) and
  `role`, so authorization needs no extra DB round-trip.
- **Password reset:** a random URL-safe token is emailed; only its SHA-256
  hash is stored. Tokens are single-use (`used_at`) and expire after 60 min.

Two entry points share the same domain logic:

| Entry point       | Used by                                   |
| ----------------- | ----------------------------------------- |
| Server Actions    | The HTML forms (`useFormState`)           |
| REST routes `/api`| Programmatic / external callers, tests    |

Both funnel into `lib/auth/*` and `lib/db/*`, so behaviour is identical.

### 2.3 Edge vs Node runtime

Middleware runs on the **Edge runtime**, which cannot use `pg` or `node:crypto`.
The session module was therefore split:

- `lib/auth/session.ts` — JWT sign/verify only (Edge-safe; no Node APIs).
- `lib/auth/tokens.ts` — reset-token generation (uses `node:crypto`).
- `lib/auth/password.ts` — bcrypt (Node only).

Middleware verifies the JWT only; the authoritative check (and any DB access)
happens server-side in `lib/auth.ts`.

### 2.4 Defense in depth (two layers + DB constraints)

1. **Middleware** — verifies the JWT and redirects unauthenticated /
   non-admin users (fast UX layer).
2. **Server guards** — `requireUser()` / `requireAdmin()` enforce access at
   render time; this is the authoritative check.
3. **Database** — `not null`, `unique`, `check`-style enum and foreign keys
   with `on delete cascade` guarantee data integrity at the storage layer.

---

## 3. Key technical decisions & rationale

| Decision | Rationale |
| --- | --- |
| **Custom JWT auth over Supabase Auth** | Removes a heavy multi-service dependency; keeps the stack small (Postgres + app) and fully in Docker. Full control over the credential and reset flows. |
| **bcrypt (cost 12)** | Battle-tested, dependency-light; adequate for Stage 1. Argon2id is an upgrade path. |
| **jose for JWTs** | Edge-compatible, so middleware can verify sessions without Node APIs. |
| **Hash-only reset tokens** | A DB leak cannot be turned into account takeover; tokens are also single-use and time-limited. |
| **`pg` pool with shared global** | One pool per process; cached on `globalThis` so dev hot-reload doesn't exhaust connections. |
| **Parameterised queries only** | All access goes through `lib/db/*` using `$n` placeholders — no SQL injection surface. |
| **Lazy env validation** | `next build` succeeds without secrets; runtime fails fast with a clear message. |
| **Multi-stage Docker + standalone output** | Small, non-root runtime image containing only what's needed to run. |
| **`db/init/*.sql` for schema** | Zero-friction Docker bootstrap (auto-applied) plus a `db:migrate` script for managed DBs. |

---

## 4. Database design

Three tables, documented in [`docs/database.md`](database.md):

- **`profiles`** — accounts + bcrypt credentials + `role`.
- **`activity_logs`** — per-user activity history (FK cascade).
- **`password_reset_tokens`** — hashed, single-use, time-limited tokens.

Highlights: `citext` for case-insensitive emails, enum-typed `role`,
`updated_at` trigger, and indexes supporting role filtering and recent-activity
reads.

---

## 5. Security considerations

- Passwords are never stored or logged in plaintext; only bcrypt hashes.
- Session and reset tokens are stored in HTTP-only cookies / hashed in DB.
- **Open-redirect protection** on post-login redirects (relative paths only).
- **Generic auth errors** ("Invalid email or password") avoid leaking which
  emails are registered; forgot-password always returns the same message.
- Reset tokens are single-use and expire; replay is rejected.
- The app container runs as a **non-root** user.
- `aria-*` attributes, focus rings and a skip link for accessibility.

---

## 6. Verification performed

| Check                              | Command / Action            | Result |
| ---------------------------------- | --------------------------- | :----: |
| Production build                   | `npm run build`             | ✅ 18 routes, 0 errors |
| Type safety                        | `npm run typecheck`         | ✅ 0 errors |
| Linting                            | `npm run lint`              | ✅ 0 warnings/errors |
| Docker stack up                    | `docker compose up --build` | ✅ db healthy, app ready |
| Schema + seed applied              | `psql` inspection           | ✅ 3 tables, demo users |
| Register via API                   | `POST /api/auth/register`   | ✅ 201 + session cookie |
| Login (correct/wrong password)     | `POST /api/auth/login`      | ✅ 200 / 401 |
| Protected route (with/without auth)| `GET /dashboard`            | ✅ 200 / 307 → /login |
| Admin route (admin / client)       | `GET /admin`                | ✅ 200 / 307 → forbidden |
| Password reset + replay            | `POST /api/auth/reset-password` | ✅ 200, new login works, replay 400 |
| Logout clears cookie               | `POST /api/auth/logout`     | ✅ 200, `Max-Age=0` |

---

## 7. Known limitations / deferred to later stages

- **Admin panel features** (user list, search/filter, detail view, editing,
  aggregate stats) — route + role guard exist; features land in Stage 2.
- **Profile editing** on the client dashboard — Stage 2.
- **Email delivery** for password reset is not wired to a provider yet; in
  development the reset link is surfaced in the response (production must send
  email). Planned for Stage 3.
- **Automated tests** (unit / e2e) — Stage 3.
- **Rate limiting** on auth endpoints — recommended for Stage 3 hardening.
- **Session revocation** is not implemented (stateless JWT). Rotation or a
  denylist can be added if needed.

---

## 8. How a new developer continues

1. Read `README.md` → run `docker compose up --build` and open the app.
2. Read `docs/database.md` → understand the schema and data-access layer.
3. Follow the layered structure: pages in `app/`, components in `components/`,
   logic in `lib/`.
4. Add schema changes as new numbered files in `db/init/`, then run
   `npm run db:migrate` (or `docker compose down -v` for a clean rebuild).

The codebase is small, consistently formatted (Prettier) and strictly typed so
Stage 2 can build on it without refactoring.

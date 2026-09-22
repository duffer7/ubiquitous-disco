# Database Documentation

This document describes the PostgreSQL schema, the migration workflow and the
data-access conventions used by the application.

> Unlike a Supabase setup, this project uses **plain PostgreSQL** with a custom
> auth layer. Authorization is enforced in application code (server guards) and
> backed by database constraints — there is no Row Level Security.

- [Entity relationship diagram](#entity-relationship-diagram)
- [Tables](#tables)
- [Enums](#enums)
- [Triggers & functions](#triggers--functions)
- [Migration workflow](#migration-workflow)
- [Data-access layer](#data-access-layer)
- [Common operations](#common-operations)

---

## Entity relationship diagram

```
        ┌──────────────────────┐
        │       profiles        │
        │──────────────────────│
        │ id            uuid PK │◄──────────────┐
        │ email     citext UNIQ │               │
        │ password_hash text    │               │
        │ full_name     text    │               │ 1
        │ company       text    │               │
        │ avatar_url    text    │               │
        │ role      user_role   │               │
        │ phone         text    │               │
        │ created_at timestamptz│               │
        │ updated_at timestamptz│               │
        └──────────────────────┘               │
                    ▲                           │
                    │ 1                         │ N
      ┌─────────────┴────────────┐   ┌──────────┴────────────┐
      │   password_reset_tokens  │   │     activity_logs      │
      │──────────────────────────│   │───────────────────────│
      │ id            uuid PK    │   │ id      bigint PK      │
      │ user_id       uuid FK ───┼───┘ user_id uuid FK        │
      │ token_hash    text UNIQ  │     action  text           │
      │ expires_at    timestamptz│     metadata jsonb         │
      │ used_at       timestamptz│     ip_address inet        │
      │ created_at    timestamptz│     created_at timestamptz │
      └──────────────────────────┘   └───────────────────────┘
```

---

## Tables

### `profiles`

The single source of truth for user accounts **and** credentials. Passwords are
stored only as bcrypt hashes.

| Column          | Type          | Constraints                        | Notes                            |
| --------------- | ------------- | ---------------------------------- | -------------------------------- |
| `id`            | `uuid`        | PK, default `gen_random_uuid()`    |                                  |
| `email`         | `citext`      | not null, unique                   | Case-insensitive                 |
| `password_hash` | `text`        | not null                           | bcrypt hash; never exposed       |
| `full_name`     | `text`        | nullable                           |                                  |
| `company`       | `text`        | nullable                           |                                  |
| `avatar_url`    | `text`        | nullable                           |                                  |
| `role`          | `user_role`   | not null, default `'client'`       | Authorization role               |
| `phone`         | `text`        | nullable                           |                                  |
| `created_at`    | `timestamptz` | not null, default `now()`          |                                  |
| `updated_at`    | `timestamptz` | not null, default `now()`          | Auto-updated by trigger          |

**Indexes:** unique on `email` (implicit), `profiles_role_idx` on `(role)`.

### `activity_logs`

Basic per-user activity history shown on the dashboard.

| Column       | Type          | Constraints                                 | Notes                        |
| ------------ | ------------- | ------------------------------------------- | ---------------------------- |
| `id`         | `bigint`      | PK, identity                                |                              |
| `user_id`    | `uuid`        | not null, FK → `profiles(id)` cascade       |                              |
| `action`     | `text`        | not null                                    | e.g. `auth.signed_in`        |
| `metadata`   | `jsonb`       | not null, default `'{}'`                    | Structured context           |
| `ip_address` | `inet`        | nullable                                    |                              |
| `created_at` | `timestamptz` | not null, default `now()`                   |                              |

**Indexes:** `activity_logs_user_id_idx` on `(user_id, created_at desc)`.

### `password_reset_tokens`

Single-use, time-limited password reset tokens. **Only the SHA-256 hash** of a
token is stored, so a database leak does not expose usable links.

| Column       | Type          | Constraints                             | Notes                       |
| ------------ | ------------- | --------------------------------------- | --------------------------- |
| `id`         | `uuid`        | PK, default `gen_random_uuid()`         |                             |
| `user_id`    | `uuid`        | not null, FK → `profiles(id)` cascade   |                             |
| `token_hash` | `text`        | not null, unique                        | SHA-256 of the raw token    |
| `expires_at` | `timestamptz` | not null                                | Default TTL: 60 minutes     |
| `used_at`    | `timestamptz` | nullable                                | Set when consumed           |
| `created_at` | `timestamptz` | not null, default `now()`               |                             |

---

## Enums

### `user_role`

```
'client' | 'admin'
```

Used to constrain the `role` column to known values.

---

## Triggers & functions

| Object                    | Type     | Purpose                                        |
| ------------------------- | -------- | ---------------------------------------------- |
| `set_updated_at()`        | function | Sets `updated_at = now()` on row update.       |
| `profiles_set_updated_at` | trigger  | BEFORE UPDATE on `profiles`.                   |

---

## Migration workflow

The schema is defined by SQL files in **`db/init/`**, applied in filename order:

1. `001_schema.sql` — extensions, enum, tables, trigger, indexes.
2. `002_seed.sql` — idempotent development seed data.

### Applying migrations

- **Docker:** files in `db/init/` are mounted into the Postgres container's
  `/docker-entrypoint-initdb.d` and run automatically on **first** start of an
  empty data volume. To re-apply after changing them:
  ```bash
  docker compose down -v && docker compose up --build
  ```
- **Existing database (local or managed):**
  ```bash
  npm run db:migrate   # applies every db/init/*.sql against DATABASE_URL
  npm run db:seed      # applies the demo data
  ```

### Creating a new migration

Add a new numbered file, e.g. `db/init/003_add_something.sql`, written to be
idempotent (`if not exists` / `do $$ ... $$`), then run `npm run db:migrate`.

---

## Data-access layer

All SQL lives in `src/lib/db/` behind typed functions — application code never
builds queries by hand:

| Module                      | Responsibility                          |
| --------------------------- | --------------------------------------- |
| `lib/db.ts`                 | Pool, `query`, `queryOne`, transactions |
| `lib/db/users.ts`           | Profiles, credentials, password updates |
| `lib/db/activity.ts`        | Activity log reads                      |
| `lib/db/password-reset.ts`  | Reset-token create/verify/consume       |

Queries are always **parameterised** (`$1`, `$2`, …) to prevent SQL injection.

---

## Common operations

**Promote a user to admin**

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

**Log an activity event**

```sql
insert into activity_logs (user_id, action, metadata)
values ('<uuid>', 'profile.updated', '{"field":"company"}'::jsonb);
```

**Count users by role**

```sql
select role, count(*) from profiles group by role;
```

**Inspect with psql (Docker)**

```bash
docker compose exec db psql -U app -d saas_dashboard
```

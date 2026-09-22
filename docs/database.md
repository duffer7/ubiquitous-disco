# Database Documentation

This document describes the PostgreSQL schema, the migration workflow and the
Row Level Security (RLS) model used by the application.

- [Entity relationship diagram](#entity-relationship-diagram)
- [Tables](#tables)
  - [`profiles`](#profiles)
  - [`activity_logs`](#activity_logs)
- [Enums](#enums)
- [Triggers & functions](#triggers--functions)
- [Row Level Security](#row-level-security)
- [Migration workflow](#migration-workflow)
- [Common operations](#common-operations)

---

## Entity relationship diagram

```
        auth.users                (managed by Supabase Auth)
            │ 1
            │
            │ 1   (created by trigger on_auth_user_created)
        ┌───▼──────────────┐
        │     profiles      │
        │───────────────────│
        │ id        uuid PK │◄──────┐
        │ email     text    │       │
        │ full_name text    │       │ 1
        │ company   text    │       │
        │ avatar_url text   │       │
        │ role      enum    │       │
        │ phone     text    │       │
        │ created_at tstz   │       │
        │ updated_at tstz   │       │
        └───────────────────┘       │
                                    │ N
        ┌──────────────────────┐    │
        │    activity_logs      │    │
        │──────────────────────│    │
        │ id         bigint PK  │    │
        │ user_id    uuid  FK ──┼────┘
        │ action     text       │
        │ metadata   jsonb      │
        │ ip_address inet       │
        │ created_at tstz       │
        └──────────────────────┘
```

---

## Tables

### `profiles`

App-level user data, kept **1:1** with `auth.users`. We deliberately do **not**
store data in `auth.users` (owned by Supabase) and never modify it from app
code — all custom fields live here.

| Column       | Type          | Constraints                              | Notes                              |
| ------------ | ------------- | ---------------------------------------- | ---------------------------------- |
| `id`         | `uuid`        | PK, FK → `auth.users(id)` `on delete cascade` | Immutable                      |
| `email`      | `text`        | not null                                 | Mirrored from `auth.users`         |
| `full_name`  | `text`        | nullable                                 |                                    |
| `company`    | `text`        | nullable                                 |                                    |
| `avatar_url` | `text`        | nullable                                 |                                    |
| `role`       | `user_role`   | not null, default `'client'`             | Authz role; guarded by a trigger   |
| `phone`      | `text`        | nullable                                 |                                    |
| `created_at` | `timestamptz` | not null, default `now()`                |                                    |
| `updated_at` | `timestamptz` | not null, default `now()`                | Auto-updated by trigger            |

**Indexes**

- `profiles_role_idx` on `(role)` — admin filtering.
- `profiles_email_idx` on `(lower(email))` — case-insensitive search.

### `activity_logs`

Basic activity history surfaced on the client dashboard.

| Column       | Type          | Constraints                                   | Notes                         |
| ------------ | ------------- | --------------------------------------------- | ----------------------------- |
| `id`         | `bigint`      | PK, `generated always as identity`            |                               |
| `user_id`    | `uuid`        | not null, FK → `profiles(id)` `on delete cascade` |                            |
| `action`     | `text`        | not null                                      | e.g. `auth.signed_in`         |
| `metadata`   | `jsonb`       | not null, default `'{}'`                      | Arbitrary structured context  |
| `ip_address` | `inet`        | nullable                                      |                               |
| `created_at` | `timestamptz` | not null, default `now()`                     |                               |

**Indexes**

- `activity_logs_user_id_idx` on `(user_id, created_at desc)`.

---

## Enums

### `user_role`

```
'client' | 'admin'
```

Used for strict typing and to prevent arbitrary role strings.

---

## Triggers & functions

| Object                           | Type     | Purpose                                                             |
| -------------------------------- | -------- | ------------------------------------------------------------------- |
| `set_updated_at()`               | function | Sets `updated_at = now()` on row update.                            |
| `profiles_set_updated_at`        | trigger  | BEFORE UPDATE on `profiles`.                                        |
| `handle_new_user()`              | function | `SECURITY DEFINER`; inserts a `profiles` row for each new auth user.|
| `on_auth_user_created`           | trigger  | AFTER INSERT on `auth.users`.                                       |
| `is_admin()`                     | function | `SECURITY DEFINER`; returns whether `auth.uid()` is an admin.       |
| `prevent_privilege_escalation()` | function | Blocks non-admins from changing `role` or `id`.                     |
| `profiles_prevent_privilege_escalation` | trigger | BEFORE UPDATE on `profiles`.                             |

> **Why `SECURITY DEFINER`?** Policies on `profiles` need to know the current
> user's role. Reading `profiles` from within a policy on `profiles` would
> recurse, so `is_admin()` runs with elevated privileges and a fixed
> `search_path`.

---

## Row Level Security

RLS is **enabled on every table**. Even if the public anon key leaks, a user
can only ever read/write rows they are allowed to.

| Table           | Operation | Policy                          | Rule                                  |
| --------------- | --------- | ------------------------------- | ------------------------------------- |
| `profiles`      | SELECT    | `profiles_select_self_or_admin` | own row, or any row if admin          |
| `profiles`      | UPDATE    | `profiles_update_self_or_admin` | own row, or any row if admin          |
| `profiles`      | INSERT    | `profiles_insert_admin`         | admins only (signup uses a trigger)   |
| `profiles`      | DELETE    | `profiles_delete_admin`         | admins only                           |
| `activity_logs` | SELECT    | `activity_logs_select_self_or_admin` | own logs, or all logs if admin   |

Inserts into `activity_logs` are performed by trusted server code using the
service role (which bypasses RLS), so no insert policy is exposed to clients.

**Extra guard:** the `prevent_privilege_escalation` trigger prevents a regular
user from promoting themselves to `admin` by editing their own profile.

---

## Migration workflow

Migrations live in `supabase/migrations/` and are applied **in filename order**.
The filename convention is:

```
<timestamp>_<description>.sql
```

Current migrations:

1. `20240101000000_init_schema.sql` — tables, enums, triggers, indexes.
2. `20240101000001_rls_policies.sql` — RLS enablement, policies, grants.

### Local development

```bash
npm run db:start   # start local Postgres/Auth/Studio (Docker required)
npm run db:reset   # drop, recreate, re-run all migrations + seed
```

### Creating a new migration

```bash
npx supabase migration new add_foo
# edit the generated file in supabase/migrations/
npm run db:reset   # verify it applies cleanly from scratch
```

### Applying to a hosted project

```bash
npx supabase link --project-ref <your-project-ref>
npm run db:push
```

### Regenerating TypeScript types

After any schema change, regenerate the DB types so the app stays type-safe:

```bash
npm run gen:types
```

---

## Common operations

**Promote a user to admin**

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

**Log an activity event (server-side, service role)**

```sql
insert into public.activity_logs (user_id, action, metadata)
values ('<uuid>', 'profile.updated', '{"field":"company"}'::jsonb);
```

**Count users by role**

```sql
select role, count(*) from public.profiles group by role;
```

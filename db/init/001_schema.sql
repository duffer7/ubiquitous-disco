-- ============================================================================
-- 001_schema.sql — initial schema for the SaaS dashboard (self-hosted Postgres)
-- Applied automatically by the postgres container on first start (see
-- docker-compose.yml → /docker-entrypoint-initdb.d). Also runnable manually.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- Enum: application roles
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('client', 'admin');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Table: profiles
-- The single source of truth for user accounts *and* credentials. Passwords
-- are stored only as bcrypt hashes.
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id            uuid primary key default gen_random_uuid(),
  email         citext not null unique,
  password_hash text not null,
  full_name     text,
  company       text,
  avatar_url    text,
  role          user_role not null default 'client',
  phone         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table profiles is 'User accounts and credentials (bcrypt password hashes).';
comment on column profiles.role is 'Authorization role used for protected routes.';

create index if not exists profiles_role_idx on profiles (role);

-- ---------------------------------------------------------------------------
-- Function: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: activity_logs
-- ---------------------------------------------------------------------------
create table if not exists activity_logs (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references profiles (id) on delete cascade,
  action     text not null,
  metadata   jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_user_id_idx
  on activity_logs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Table: password_reset_tokens
-- Stores only the SHA-256 hash of a reset token. Tokens are single-use and
-- time-limited.
-- ---------------------------------------------------------------------------
create table if not exists password_reset_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_tokens_user_id_idx
  on password_reset_tokens (user_id);

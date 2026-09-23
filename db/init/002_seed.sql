-- ============================================================================
-- 002_seed.sql — development seed data (idempotent)
-- Runs after 001_schema.sql on first container start.
--
-- Creates two demo accounts with known passwords so you can sign in
-- immediately. Passwords below are bcrypt hashes of:
--   admin@example.com  → "Admin1234"
--   client@example.com → "Client1234"
--
-- IMPORTANT: these are DEV credentials — never use them in production.
-- ============================================================================

insert into profiles (email, password_hash, full_name, company, role)
values
  (
    'admin@example.com',
    '$2a$12$dXggbAh3K5LFEhTZJTENBeklMBZCymxAbDDo1BP6tLSt3TZWjgTYm',
    'Ada Admin',
    'Orbit HQ',
    'admin'
  ),
  (
    'client@example.com',
    '$2a$12$4myjrscauMlgN6qyUEOFf.uTx2cYUrUJcWKImXsegDJBdxouwA3e.',
    'Sarah Connor',
    'Cyberdyne',
    'client'
  )
on conflict (email) do nothing;

-- A few activity rows for the demo client so the dashboard isn't empty.
insert into activity_logs (user_id, action, metadata)
select id, 'account.created', '{"source":"seed"}'::jsonb
from profiles where email = 'client@example.com'
  and not exists (
    select 1 from activity_logs al
    join profiles p on p.id = al.user_id
    where p.email = 'client@example.com'
  );

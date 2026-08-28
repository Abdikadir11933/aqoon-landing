-- Links an operators row to a real Supabase Auth account (email+password),
-- so operator identity can be server-verified instead of client-asserted.
-- Additive only; the existing shared-password + picker flow keeps working
-- untouched for anyone who hasn't signed up yet.
-- See docs/decisions/0002-two-operator-os-interview-and-data-foundation.md.

alter table public.operators
  add column if not exists email text,
  add column if not exists auth_user_id uuid references auth.users(id);

create unique index if not exists operators_email_unique_idx
  on public.operators (lower(email)) where email is not null;
create unique index if not exists operators_auth_user_id_unique_idx
  on public.operators (auth_user_id) where auth_user_id is not null;

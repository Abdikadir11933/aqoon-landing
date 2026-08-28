-- Two-operator OS foundation: operator identity scaffold, consent columns,
-- interview schema versioning, and call history (replacing single-value overwrite).
-- Purely additive: no existing column/table/function is altered or dropped.
-- RLS enabled with no policies on new tables, matching existing family-CRM tables
-- (access is via service-role Edge Functions only, same as today).
-- See docs/decisions/0002-two-operator-os-interview-and-data-foundation.md.

create table if not exists public.operators (
  id uuid primary key default gen_random_uuid(),
  display_name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.operators enable row level security;

insert into public.operators (display_name) values ('Abducadir'), ('Mustafe')
  on conflict (display_name) do nothing;

alter table public.family_leads
  add column if not exists assigned_operator_id uuid references public.operators(id),
  add column if not exists last_actor_id uuid references public.operators(id),
  add column if not exists consent_relevant_updates_ok boolean,
  add column if not exists consent_outcome_followup_ok boolean,
  add column if not exists consent_recorded_at timestamptz;

alter table public.family_interviews
  add column if not exists interview_schema_version text,
  add column if not exists operator_id uuid references public.operators(id);

alter table public.sales_opportunities
  add column if not exists owner_operator_id uuid references public.operators(id);

alter table public.ops_events
  add column if not exists operator_id uuid references public.operators(id);

create table if not exists public.family_call_log (
  id uuid primary key default gen_random_uuid(),
  family_lead_id uuid not null references public.family_leads(id) on delete cascade,
  operator_id uuid references public.operators(id),
  outcome text not null check (outcome in ('reached','no_answer','call_later')),
  next_follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.family_call_log enable row level security;
create index if not exists family_call_log_lead_idx on public.family_call_log (family_lead_id, created_at desc);

-- Preserve existing single-value call history as the first log row per lead
-- instead of letting it disappear silently once family_call_log becomes primary.
insert into public.family_call_log (family_lead_id, outcome, next_follow_up_at, notes, created_at)
select id, last_call_outcome, next_follow_up_at,
  'Backfilled from family_leads.last_call_outcome during two-operator foundation migration (operator unknown - no attribution existed before this change).',
  coalesce(last_call_at, updated_at)
from public.family_leads
where last_call_outcome is not null;

-- Deliberate later contacts (research call, options call, follow-up,
-- official update, outcome check) distinct from the single upserted
-- first-interview record in family_interviews. RLS enabled with no
-- policies, service-role Edge Function access only (family-case-lifecycle-admin).
-- Recovered from the live schema on 2026-08-29.

create table if not exists public.family_case_interactions (
  id uuid primary key default gen_random_uuid(),
  family_lead_id uuid not null references public.family_leads(id) on delete cascade,
  case_plan_id uuid references public.family_case_plans(id) on delete set null,
  operator_id uuid references public.operators(id) on delete set null,
  interaction_type text not null check (interaction_type in ('first_interview','research','options_call','follow_up_call','official_update','outcome_check')),
  summary text not null check (char_length(summary) between 1 and 6000),
  structured_data jsonb not null default '{}'::jsonb check (jsonb_typeof(structured_data) = 'object'),
  next_action text,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.family_case_interactions enable row level security;
create index if not exists family_case_interactions_lead_time_idx on public.family_case_interactions (family_lead_id, created_at desc);
create index if not exists family_case_interactions_plan_time_idx on public.family_case_interactions (case_plan_id, created_at desc) where case_plan_id is not null;

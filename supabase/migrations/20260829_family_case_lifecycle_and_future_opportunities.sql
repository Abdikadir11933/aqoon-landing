-- Case-plan lifecycle: separates "waiting on an authority/provider decision"
-- (plan_status awaiting_outcome, event official_action_started) from "the
-- authority/provider responded" (event official_response_received), and
-- gives cases an explicit close-without-resolution outcome (closed_unresolved)
-- distinct from a positive resolution (resolved). Also adds permission-gated
-- future household opportunities (a later need surfaced for the same
-- family, contacted only with recorded consent).
-- RLS enabled with no policies, matching every other family-CRM table:
-- access is via service-role Edge Functions only (family-case-lifecycle-admin).
-- Recovered from the live schema on 2026-08-29 after this and four other
-- migrations were applied directly and never committed to this repo.

create table if not exists public.family_case_plans (
  id uuid primary key default gen_random_uuid(),
  family_lead_id uuid not null references public.family_leads(id) on delete cascade,
  match_run_id uuid references public.family_match_runs(id) on delete set null,
  owner_operator_id uuid references public.operators(id) on delete set null,
  title text not null check (char_length(title) between 1 and 240),
  official_decision_maker text,
  selected_option jsonb not null default '{}'::jsonb check (jsonb_typeof(selected_option) = 'object'),
  plan_status text not null default 'research' check (plan_status in ('research','options_ready','action_in_progress','awaiting_outcome','persistence_check','resolved','closed_unresolved')),
  next_action text,
  next_follow_up_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.family_case_plans enable row level security;

create table if not exists public.family_case_events (
  id uuid primary key default gen_random_uuid(),
  family_lead_id uuid not null references public.family_leads(id) on delete cascade,
  case_plan_id uuid references public.family_case_plans(id) on delete cascade,
  operator_id uuid references public.operators(id) on delete set null,
  event_type text not null check (event_type in ('interview_completed','research_completed','options_presented','plan_selected','official_action_started','official_response_received','persistence_confirmed','case_resolved','case_closed_unresolved','follow_up_attempted')),
  event_data jsonb not null default '{}'::jsonb check (jsonb_typeof(event_data) = 'object'),
  note text check (note is null or char_length(note) <= 4000),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.family_case_events enable row level security;

create table if not exists public.family_future_opportunities (
  id uuid primary key default gen_random_uuid(),
  family_lead_id uuid not null references public.family_leads(id) on delete cascade,
  case_plan_id uuid references public.family_case_plans(id) on delete set null,
  owner_operator_id uuid references public.operators(id) on delete set null,
  household_scope text not null check (household_scope in ('adult','child','household')),
  need_domain text not null,
  signal_label text not null check (char_length(signal_label) between 1 and 240),
  signal_source text not null check (signal_source in ('family_requested','operator_observed','lifecycle_rule','service_calendar')),
  trigger_type text not null check (trigger_type in ('age_window','deadline','family_request','operator_follow_up','seasonal','other')),
  earliest_contact_at timestamptz,
  contact_permission_status text not null default 'not_requested' check (contact_permission_status in ('not_requested','granted','declined','not_needed')),
  status text not null default 'watching' check (status in ('watching','ready','offered','accepted','not_interested','expired','closed')),
  note text check (note is null or char_length(note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.family_future_opportunities enable row level security;

-- Recovered structural baseline for AQOON's pre-migration production schema.
--
-- These tables and the public-intake rate limiter existed in Supabase before
-- this repository's migration history began. Their absence made a clean
-- environment impossible to build: later tracked migrations ALTER or
-- reference them before creating them. Definitions were reconciled against
-- production metadata on 2026-09-01. This file contains structure only; no
-- family, operator-auth, programme, or other production records are copied.

create table if not exists public.operators (
  id uuid primary key default gen_random_uuid(),
  display_name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.family_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  city text not null,
  main_need text not null,
  sub_need text not null,
  age_group text,
  tier smallint not null default 2 check (tier in (1, 2)),
  status text not null default 'new' check (status in ('new', 'contacted', 'resolved')),
  contacted_at timestamptz,
  resolved_at timestamptz,
  notes text,
  source text not null default 'caawi',
  lang text not null default 'so',
  legacy_waitlist_id uuid unique,
  analytics_session_id uuid,
  analytics_visitor_id uuid,
  intake_request_id uuid,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  next_follow_up_at timestamptz,
  urgency text not null default 'normal' check (urgency in ('low', 'normal', 'high', 'urgent')),
  interview_status text not null default 'not_started' check (interview_status in ('not_started', 'draft', 'completed')),
  last_interview_at timestamptz,
  journey_stage text not null default 'reach' check (journey_stage in ('reach', 'guide', 'start', 'retention', 'referral', 'resolved')),
  form_version text default 'legacy',
  additional_needs jsonb not null default '[]'::jsonb
);

create unique index if not exists family_leads_intake_request_id_key
  on public.family_leads (intake_request_id) where intake_request_id is not null;
create index if not exists family_leads_created_at_idx on public.family_leads (created_at desc);
create index if not exists family_leads_city_idx on public.family_leads (city);
create index if not exists family_leads_main_need_idx on public.family_leads (main_need);
create index if not exists family_leads_status_idx on public.family_leads (status);
create index if not exists family_leads_analytics_session_idx on public.family_leads (analytics_session_id);
create index if not exists family_leads_follow_up_idx on public.family_leads (next_follow_up_at) where next_follow_up_at is not null;
create index if not exists family_leads_journey_stage_idx on public.family_leads (journey_stage);
create index if not exists family_leads_form_version_created_idx on public.family_leads (form_version, created_at desc);
create index if not exists family_leads_additional_needs_gin on public.family_leads using gin (additional_needs);

create table if not exists public.family_scenarios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  scenario_key text not null unique,
  dimensions jsonb not null default '{}'::jsonb,
  title text,
  main_need text,
  sub_need text,
  city_scope text,
  age_group text,
  tenure_stage text,
  work_status text,
  household_context jsonb not null default '{}'::jsonb,
  verified_answer jsonb not null default '{}'::jsonb,
  official_sources jsonb not null default '[]'::jsonb,
  operator_guidance jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'verified', 'needs_recheck', 'retired')),
  first_verified_at timestamptz,
  last_verified_at timestamptz,
  recheck_after timestamptz,
  times_reused integer not null default 0 check (times_reused >= 0),
  last_reused_at timestamptz,
  notes text
);
create index if not exists family_scenarios_dimensions_gin_idx on public.family_scenarios using gin (dimensions);
create index if not exists family_scenarios_need_idx on public.family_scenarios (main_need, sub_need);
create index if not exists family_scenarios_city_idx on public.family_scenarios (city_scope);
create index if not exists family_scenarios_status_idx on public.family_scenarios (status, recheck_after);

create table if not exists public.family_interviews (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.family_leads(id) on delete cascade,
  interview_type text not null,
  answers jsonb not null default '{}'::jsonb,
  summary text,
  research_prompt text,
  next_follow_up_at timestamptz,
  urgency text not null default 'normal' check (urgency in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'completed' check (status in ('draft', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  next_action text,
  scenario_fingerprint text,
  matched_scenario_id uuid references public.family_scenarios(id) on delete set null,
  scenario_match_status text not null default 'not_checked' check (scenario_match_status in ('not_checked', 'no_match', 'possible_match', 'matched', 'needs_research'))
);
create unique index if not exists family_interviews_lead_type_uidx on public.family_interviews (lead_id, interview_type);
create index if not exists family_interviews_lead_id_created_idx on public.family_interviews (lead_id, created_at desc);
create index if not exists family_interviews_next_follow_up_idx on public.family_interviews (next_follow_up_at) where next_follow_up_at is not null;
create index if not exists family_interviews_status_idx on public.family_interviews (status);
create index if not exists family_interviews_scenario_fingerprint_idx on public.family_interviews (scenario_fingerprint);
create index if not exists family_interviews_matched_scenario_idx on public.family_interviews (matched_scenario_id);

create table if not exists public.family_scenario_research (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.family_scenarios(id) on delete cascade,
  interview_id uuid references public.family_interviews(id) on delete set null,
  created_at timestamptz not null default now(),
  checked_at timestamptz,
  research_status text not null default 'pending' check (research_status in ('pending', 'in_progress', 'completed', 'superseded')),
  research_question text,
  findings jsonb not null default '{}'::jsonb,
  official_sources jsonb not null default '[]'::jsonb,
  changed_canonical_knowledge boolean not null default false,
  notes text
);
create index if not exists family_scenario_research_scenario_idx on public.family_scenario_research (scenario_id, created_at desc);
create index if not exists family_scenario_research_interview_idx on public.family_scenario_research (interview_id);

create table if not exists public.family_funnel_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  event_name text not null,
  path text not null default '/caawi',
  city text,
  main_need text,
  sub_need text,
  age_group text,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  visitor_id uuid,
  event_id uuid,
  screen text,
  device_type text,
  form_version text default 'legacy'
);
create unique index if not exists family_funnel_events_event_id_key
  on public.family_funnel_events (event_id) where event_id is not null;
create index if not exists family_funnel_events_created_at_idx on public.family_funnel_events (created_at desc);
create index if not exists family_funnel_events_event_name_idx on public.family_funnel_events (event_name, created_at desc);
create index if not exists family_funnel_events_session_id_idx on public.family_funnel_events (session_id);
create index if not exists family_funnel_events_visitor_id_idx on public.family_funnel_events (visitor_id);
create index if not exists family_funnel_events_form_version_created_idx on public.family_funnel_events (form_version, created_at desc);

create table if not exists public.family_intake_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  request_id uuid not null unique,
  visitor_id uuid,
  session_id uuid,
  name text not null,
  phone text not null,
  city text,
  main_need text,
  sub_need text,
  age_group text,
  completed boolean not null default false,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  form_version text default 'legacy',
  additional_needs jsonb not null default '[]'::jsonb
);

create table if not exists public.family_intake_rate_limits (
  bucket_start timestamptz not null,
  client_key text not null,
  endpoint text not null,
  attempts integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (bucket_start, client_key, endpoint)
);
create index if not exists family_intake_rate_limits_updated_idx on public.family_intake_rate_limits (updated_at);

create table if not exists public.partner_programs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  organisation text not null,
  city text,
  category text not null,
  audience text,
  pain_match text,
  status text not null default 'active',
  application_status text,
  deadline date,
  source_url text not null,
  source_type text not null default 'official',
  partner_priority smallint not null default 2,
  outreach_status text not null default 'not_contacted',
  notes text,
  last_verified_at timestamptz not null default now(),
  unique (name, organisation, city)
);
create index if not exists partner_programs_category_idx on public.partner_programs (category);
create index if not exists partner_programs_city_idx on public.partner_programs (city);
create index if not exists partner_programs_status_idx on public.partner_programs (status, application_status);

alter table public.operators enable row level security;
alter table public.family_leads enable row level security;
alter table public.family_scenarios enable row level security;
alter table public.family_interviews enable row level security;
alter table public.family_scenario_research enable row level security;
alter table public.family_funnel_events enable row level security;
alter table public.family_intake_contacts enable row level security;
alter table public.family_intake_rate_limits enable row level security;
alter table public.partner_programs enable row level security;

revoke all on table public.operators, public.family_leads, public.family_scenarios,
  public.family_interviews, public.family_scenario_research,
  public.family_funnel_events, public.family_intake_contacts,
  public.family_intake_rate_limits, public.partner_programs
from anon, authenticated;

create or replace function public.take_family_intake_rate_limit(
  p_client_key text,
  p_endpoint text,
  p_limit integer
)
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_bucket timestamptz := date_trunc('hour', now());
  v_attempts integer;
begin
  insert into public.family_intake_rate_limits (
    bucket_start, client_key, endpoint, attempts, updated_at
  ) values (
    v_bucket, p_client_key, p_endpoint, 1, now()
  )
  on conflict (bucket_start, client_key, endpoint)
  do update set
    attempts = public.family_intake_rate_limits.attempts + 1,
    updated_at = now()
  returning attempts into v_attempts;

  return query
    select
      v_attempts <= p_limit,
      greatest(1, extract(epoch from (v_bucket + interval '1 hour' - now()))::integer);
end;
$function$;

revoke all on function public.take_family_intake_rate_limit(text, text, integer)
  from public, anon, authenticated;
grant execute on function public.take_family_intake_rate_limit(text, text, integer)
  to service_role;

-- AQOON Routing Intelligence foundation.
-- Structured verified knowledge is private operational infrastructure.
-- Legacy *_knowledge_chunks tables remain discovery-only and untouched.

create table if not exists public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  publisher text not null,
  authority_level text not null check (authority_level in ('official_primary','provider_primary','aqoon_primary','research_secondary','discovery_only')),
  canonical_url text not null unique check (canonical_url ~ '^https://'),
  title text,
  scope text,
  volatility text not null default 'medium' check (volatility in ('low','medium','high','live')),
  verification_state text not null default 'verification_pending' check (verification_state in ('verified','verification_pending','superseded','retired')),
  last_checked_at timestamptz,
  recheck_after timestamptz,
  checked_by_operator_id uuid references public.operators(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.knowledge_services (
  id uuid primary key default gen_random_uuid(), service_key text not null unique, name_fi text not null, name_so text, authority_name text not null, decision_maker text not null, scope text not null,
  verification_state text not null default 'verification_pending' check (verification_state in ('verified','verification_pending','superseded','retired')),
  source_ids uuid[] not null default '{}', matching_fields jsonb not null default '[]'::jsonb check (jsonb_typeof(matching_fields)='array'),
  aqoon_role jsonb not null default '["explain","navigate","help_prepare"]'::jsonb check (jsonb_typeof(aqoon_role)='array'),
  aqoon_must_not jsonb not null default '["decide_eligibility","guarantee_outcome"]'::jsonb check (jsonb_typeof(aqoon_must_not)='array'),
  last_verified_at timestamptz, recheck_after timestamptz, reviewed_by_operator_id uuid references public.operators(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.knowledge_routes (
  id uuid primary key default gen_random_uuid(), route_key text not null unique, service_id uuid not null references public.knowledge_services(id) on delete cascade, need_domain text not null,
  scope jsonb not null default '{}'::jsonb check (jsonb_typeof(scope)='object'), required_inputs jsonb not null default '[]'::jsonb check (jsonb_typeof(required_inputs)='array'),
  blocking_inputs jsonb not null default '[]'::jsonb check (jsonb_typeof(blocking_inputs)='array'), steps jsonb not null default '[]'::jsonb check (jsonb_typeof(steps)='array'), source_ids uuid[] not null default '{}',
  partner_disclosure_required boolean not null default false, verification_state text not null default 'verification_pending' check (verification_state in ('verified','verification_pending','superseded','retired')),
  volatility text not null default 'medium' check (volatility in ('low','medium','high','live')), last_verified_at timestamptz, recheck_after timestamptz, reviewed_by_operator_id uuid references public.operators(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.knowledge_criteria (
  id uuid primary key default gen_random_uuid(), criterion_key text not null unique, route_id uuid not null references public.knowledge_routes(id) on delete cascade, label text not null,
  criterion_type text not null check (criterion_type in ('required','conditional','exclusion','authority_confirmation')), field_key text not null,
  rule_json jsonb not null default '{}'::jsonb check (jsonb_typeof(rule_json)='object'), source_ids uuid[] not null default '{}',
  verification_state text not null default 'verification_pending' check (verification_state in ('verified','verification_pending','superseded','retired')),
  last_verified_at timestamptz, recheck_after timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.knowledge_verifications (
  id uuid primary key default gen_random_uuid(), entity_type text not null check (entity_type in ('source','service','route','criterion','programme')), entity_id uuid not null,
  outcome text not null check (outcome in ('verified','changed','superseded','retired','verification_failed')), checked_at timestamptz not null default now(),
  checked_by_operator_id uuid references public.operators(id), source_ids uuid[] not null default '{}', notes text
);
create table if not exists public.family_match_runs (
  id uuid primary key default gen_random_uuid(), family_lead_id uuid not null references public.family_leads(id) on delete cascade, interview_id uuid references public.family_interviews(id) on delete set null,
  route_id uuid references public.knowledge_routes(id) on delete set null, operator_id uuid references public.operators(id),
  status text not null default 'draft' check (status in ('draft','needs_facts','needs_verification','ready_for_review','reviewed','closed')),
  match_status text check (match_status in ('confirmed_match','possible_must_confirm','does_not_fit')),
  facts_used jsonb not null default '{}'::jsonb check (jsonb_typeof(facts_used)='object'), missing_fields jsonb not null default '[]'::jsonb check (jsonb_typeof(missing_fields)='array'), conflicting_criteria jsonb not null default '[]'::jsonb check (jsonb_typeof(conflicting_criteria)='array'),
  source_ids uuid[] not null default '{}', recommended_next_action text, reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists knowledge_services_scope_idx on public.knowledge_services(scope, verification_state);
create index if not exists knowledge_routes_service_idx on public.knowledge_routes(service_id, verification_state);
create index if not exists knowledge_routes_domain_idx on public.knowledge_routes(need_domain, verification_state);
create index if not exists knowledge_criteria_route_idx on public.knowledge_criteria(route_id, criterion_type);
create index if not exists knowledge_verifications_entity_idx on public.knowledge_verifications(entity_type, entity_id, checked_at desc);
create index if not exists family_match_runs_lead_idx on public.family_match_runs(family_lead_id, created_at desc);
create index if not exists family_match_runs_status_idx on public.family_match_runs(status, created_at desc);
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_services enable row level security;
alter table public.knowledge_routes enable row level security;
alter table public.knowledge_criteria enable row level security;
alter table public.knowledge_verifications enable row level security;
alter table public.family_match_runs enable row level security;
revoke all on public.knowledge_sources, public.knowledge_services, public.knowledge_routes, public.knowledge_criteria, public.knowledge_verifications, public.family_match_runs from anon, authenticated;

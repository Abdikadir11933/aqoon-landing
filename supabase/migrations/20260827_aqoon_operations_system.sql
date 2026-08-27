-- AQOON private business operations system.
-- Browser clients never access these tables directly. The password-protected
-- ops-admin Edge Function uses the service role on the server.

create table if not exists public.sales_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  contact_name text,
  contact_role text,
  stage text not null default 'lead' check (stage in (
    'lead','contacted','discovery','proposal_sent','decision_review',
    'won','delivery','expansion','closed_lost'
  )),
  health text not null default 'on_track' check (health in ('on_track','waiting','at_risk','blocked')),
  summary text,
  goal text,
  success_definition text,
  completed_steps jsonb not null default '[]'::jsonb check (jsonb_typeof(completed_steps) = 'array'),
  next_steps jsonb not null default '[]'::jsonb check (jsonb_typeof(next_steps) = 'array'),
  next_action text,
  next_action_at timestamptz,
  probability smallint check (probability between 0 and 100),
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stage_changed_at timestamptz not null default now(),
  unique (organization)
);

create table if not exists public.sales_activities (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.sales_opportunities(id) on delete cascade,
  activity_type text not null check (activity_type in ('email','call','meeting','proposal','report','note','task','stage_change')),
  title text not null,
  notes text,
  happened_at timestamptz,
  due_at timestamptz,
  completed_at timestamptz,
  external_key text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.ops_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text not null default 'task' check (event_type in ('call','meeting','deadline','task')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'planned' check (status in ('planned','done','cancelled')),
  notes text,
  opportunity_id uuid references public.sales_opportunities(id) on delete cascade,
  family_lead_id uuid references public.family_leads(id) on delete cascade,
  external_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (opportunity_id is not null or family_lead_id is not null or length(trim(title)) > 0)
);

create index if not exists sales_opportunities_next_action_idx
  on public.sales_opportunities (next_action_at) where stage not in ('closed_lost');
create index if not exists sales_activities_opportunity_idx
  on public.sales_activities (opportunity_id, coalesce(due_at, happened_at) desc);
create index if not exists ops_events_starts_at_idx
  on public.ops_events (starts_at) where status = 'planned';
create index if not exists ops_events_opportunity_idx on public.ops_events (opportunity_id);
create index if not exists ops_events_family_idx on public.ops_events (family_lead_id);

alter table public.sales_opportunities enable row level security;
alter table public.sales_activities enable row level security;
alter table public.ops_events enable row level security;
revoke all on public.sales_opportunities from anon, authenticated;
revoke all on public.sales_activities from anon, authenticated;
revoke all on public.ops_events from anon, authenticated;

-- Business relationship data is intentionally seeded only into the private
-- production database. No contacts, deal notes, or strategy belong in git.

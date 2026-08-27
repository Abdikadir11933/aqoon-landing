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

insert into public.sales_opportunities (
  organization, contact_name, contact_role, stage, health, summary, goal,
  success_definition, completed_steps, next_steps, next_action, next_action_at,
  probability, source
) values
(
  'Norlandia Päiväkodit', null, 'Area Director', 'decision_review', 'waiting',
  'The area director apologized for the delay. Schedule changes and a major tender created extra work. The offer is scheduled for leadership review next week and she will return after that review.',
  'Secure the leadership discussion and agree a clear pilot scope, owner, timeline and success measure.',
  'Leadership meeting held and a concrete pilot or paid next step agreed.',
  '["Offer sent","Miia confirmed the offer will be reviewed by leadership"]'::jsonb,
  '["Allow the promised leadership review to happen","Prepare a short decision-ready pilot recap","Follow up only if no update arrives after the review week"]'::jsonb,
  'Wait for leadership review; send a calm follow-up if no update arrives afterward.',
  '2026-09-07 09:00:00+03', 65, 'Existing relationship / proposal'
),
(
  'Pilke päiväkodit', null, null, 'expansion', 'on_track',
  'Phase 1 is complete. The work proved a trusted acquisition-to-start mechanism and identified application friction, price misunderstanding and the municipal route as the main conversion bottlenecks.',
  'Convert Phase 1 into an always-on annual model covering acquisition, interviews, correct routing, application support, confirmed starts and outcome reporting.',
  'Agreement on priority units, fast availability ownership, commercial success event, reporting cadence and the next paid phase.',
  '["Phase 1 completed","Final report prepared","Approximately 100 family conversations","First child started 17 August 2026","Application and trust bottlenecks documented"]'::jsonb,
  '["Present the final report","Confirm priority units and age-group capacity","Agree who answers availability questions quickly","Define the commercial success event","Propose annual operating model"]'::jsonb,
  'Use the follow-up meeting to agree the next commercial phase and its measurement rules.',
  '2026-08-28 09:00:00+03', 80, 'Completed pilot / expansion'
),
(
  'Vantaan kaupunki – Harrastusten Vantaa', null, null, 'delivery', 'on_track',
  'Research and field delivery are active in Hakunila. Awareness content, flyer outreach and the phone-first intake have created a measurable path into family interviews. The emerging bottleneck is not interest alone: registration bureaucracy, late or missed attendance and parent communication interrupt the path into a stable group.',
  'Map and repair the full awareness → registration → attendance → persistence journey for children in Hakunila.',
  'Families complete the correct registration, children start and continue, and Vantaa receives evidence of where and why the journey breaks.',
  '["One Hakunila flyer outreach day","Three awareness videos published with strong saves and shares","Phone-first contact intake and CRM launched","Two group-leader interviews completed"]'::jsonb,
  '["Continue family interviews, including hobbies","Visit the Hakunila school","Meet a group owner and observe a group","Document the exact registration handoff","Track attendance and persistence, not only clicks or forms"]'::jsonb,
  'Turn the group-leader findings into a registration-support checklist and validate it in the next family interviews.',
  '2026-08-31 09:00:00+03', 90, 'Active municipal project'
)
on conflict (organization) do update set
  contact_name = excluded.contact_name,
  contact_role = excluded.contact_role,
  stage = excluded.stage,
  health = excluded.health,
  summary = excluded.summary,
  goal = excluded.goal,
  success_definition = excluded.success_definition,
  completed_steps = excluded.completed_steps,
  next_steps = excluded.next_steps,
  next_action = excluded.next_action,
  next_action_at = excluded.next_action_at,
  probability = excluded.probability,
  source = excluded.source,
  updated_at = now();

insert into public.sales_activities (opportunity_id, activity_type, title, notes, happened_at, completed_at, external_key)
select id, 'email', 'Area director confirmed leadership review',
  'Review was delayed by schedule changes and a major tender. The offer is planned for leadership handling next week.',
  '2026-08-27 17:12:00+03', '2026-08-27 17:12:00+03', 'norlandia-miia-review-20260827'
from public.sales_opportunities where organization = 'Norlandia Päiväkodit'
on conflict (external_key) do nothing;

insert into public.ops_events (title, event_type, starts_at, status, notes, opportunity_id, external_key)
select 'Pilke final-report follow-up', 'meeting', '2026-08-28 09:00:00+03', 'planned',
  'Time was not stated in the source brief; confirm the actual meeting time in the calendar.', id, 'pilke-followup-20260828'
from public.sales_opportunities where organization = 'Pilke päiväkodit'
on conflict (external_key) do nothing;

insert into public.ops_events (title, event_type, starts_at, status, notes, opportunity_id, external_key)
select 'Norlandia follow-up if no update', 'task', '2026-09-07 09:00:00+03', 'planned',
  'Send only if the area director has not returned after the promised leadership review week.', id, 'norlandia-followup-20260907'
from public.sales_opportunities where organization = 'Norlandia Päiväkodit'
on conflict (external_key) do nothing;

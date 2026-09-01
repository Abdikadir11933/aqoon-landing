-- Make Analytics, Sales demand and operator learning read from controlled,
-- reconciliable dimensions. No family PII is copied into either aggregate.

alter table public.sales_opportunities
  add column if not exists demand_need_domain text,
  add column if not exists demand_timing text,
  add column if not exists demand_interest_state text;

update public.sales_opportunities
set demand_need_domain = case
  when lower(coalesce(demand_need, '')) ~ '(daycare|early.childhood|p[aä]iv[aä]|carruur)' then 'daycare'
  when lower(coalesce(demand_need, '')) ~ '(work|job|shaqo)' then 'work'
  when lower(coalesce(demand_need, '')) ~ '(school|education|waxbarasho)' then 'education'
  when btrim(coalesce(demand_need, '')) <> '' then 'general'
  else null
end
where demand_need_domain is null;

update public.sales_opportunities
set demand_timing = coalesce(demand_timing, 'any'),
    demand_interest_state = coalesce(demand_interest_state, 'stated_or_ready');

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'sales_opportunities_demand_domain_chk') then
    alter table public.sales_opportunities add constraint sales_opportunities_demand_domain_chk
      check (demand_need_domain is null or demand_need_domain in (
        'work','education','school','daycare','hobby','live_programme',
        'service_support','family_finances','housing_debt_family','entrepreneurship','general'
      ));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'sales_opportunities_demand_timing_chk') then
    alter table public.sales_opportunities add constraint sales_opportunities_demand_timing_chk
      check (demand_timing is null or demand_timing in ('any','now','within_6_months','within_12_months','later'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'sales_opportunities_demand_interest_chk') then
    alter table public.sales_opportunities add constraint sales_opportunities_demand_interest_chk
      check (demand_interest_state is null or demand_interest_state in ('stated_need','ready_future','stated_or_ready'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'family_interviews_completed_schema_version_chk') then
    alter table public.family_interviews add constraint family_interviews_completed_schema_version_chk
      check (status <> 'completed' or nullif(btrim(interview_schema_version), '') is not null) not valid;
  end if;
end $$;

create index if not exists sales_opportunities_demand_domain_idx
  on public.sales_opportunities (demand_need_domain, stage)
  where demand_need_domain is not null;

alter table public.knowledge_feedback_signals
  add column if not exists review_note text,
  add column if not exists official_sources_checked boolean not null default false,
  add column if not exists knowledge_change_reference text;

create or replace function public.aqoon_review_route_feedback_signal(
  p_signal_id uuid,
  p_operator_id uuid,
  p_decision text,
  p_review_note text,
  p_official_sources_checked boolean default false,
  p_knowledge_change_reference text default null
)
returns public.knowledge_feedback_signals
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected public.knowledge_feedback_signals%rowtype;
begin
  if p_decision not in ('accepted','dismissed','applied') then
    raise exception 'invalid_feedback_decision' using errcode = '22023';
  end if;
  if nullif(btrim(coalesce(p_review_note, '')), '') is null then
    raise exception 'feedback_review_note_required' using errcode = '22023';
  end if;
  if p_decision in ('accepted','applied') and not coalesce(p_official_sources_checked, false) then
    raise exception 'official_source_check_required' using errcode = '22023';
  end if;
  if p_decision = 'applied' and nullif(btrim(coalesce(p_knowledge_change_reference, '')), '') is null then
    raise exception 'knowledge_change_reference_required' using errcode = '22023';
  end if;

  update public.knowledge_feedback_signals
  set review_status = p_decision,
      review_note = left(btrim(p_review_note), 2000),
      official_sources_checked = coalesce(p_official_sources_checked, false),
      knowledge_change_reference = nullif(left(btrim(coalesce(p_knowledge_change_reference, '')), 500), ''),
      reviewed_by_operator_id = p_operator_id,
      reviewed_at = now(),
      updated_at = now()
  where id = p_signal_id
    and review_status in ('pending_review','accepted')
  returning * into selected;

  if selected.id is null then
    raise exception 'feedback_signal_not_reviewable' using errcode = 'P0002';
  end if;
  return selected;
end;
$$;

revoke all on function public.aqoon_review_route_feedback_signal(uuid, uuid, text, text, boolean, text) from public, anon, authenticated;
grant execute on function public.aqoon_review_route_feedback_signal(uuid, uuid, text, text, boolean, text) to service_role;

-- Automatic fingerprint misses created empty scenario/research rows after every
-- interview. Preserve those rows for audit, but remove them from the learning
-- queue. Only operator-submitted research should become review work.
update public.family_scenario_research
set research_status = 'superseded',
    review_status = 'rejected',
    notes = coalesce(notes, 'Automatically queued fingerprint miss; no operator research or evidence was submitted.'),
    reviewed_at = coalesce(reviewed_at, now())
where research_status = 'pending'
  and review_status = 'pending_review'
  and submitted_by_operator_id is null
  and coalesce(findings, '{}'::jsonb) = '{}'::jsonb
  and coalesce(official_sources, '[]'::jsonb) = '[]'::jsonb;

update public.family_scenarios scenario
set status = 'retired',
    notes = coalesce(notes, 'Retired automatic empty draft; no reviewed reusable knowledge exists.'),
    updated_at = now()
where status = 'draft'
  and not exists (
    select 1 from public.family_scenario_research research
    where research.scenario_id = scenario.id
      and (
        research.submitted_by_operator_id is not null
        or research.research_status = 'completed'
        or coalesce(research.findings, '{}'::jsonb) <> '{}'::jsonb
        or coalesce(research.official_sources, '[]'::jsonb) <> '[]'::jsonb
      )
  );

comment on column public.sales_opportunities.demand_need_domain is
  'Controlled PII-free need domain used to match canonical household demand; demand_need remains legacy display text only.';
comment on function public.aqoon_review_route_feedback_signal(uuid, uuid, text, text, boolean, text) is
  'Human review boundary for PII-minimized route feedback. Accepted/applied feedback requires official-source confirmation and never edits route criteria automatically.';

-- A completed research answer is evidence, not canonical AQOON knowledge.
-- Keep it pending until an authenticated operator explicitly confirms that
-- the cited official sources were checked. Approval and scenario publication
-- happen in one transaction so an interview cannot be marked matched early.

alter table public.family_scenario_research
  add column if not exists review_status text,
  add column if not exists submitted_by_operator_id uuid references public.operators(id) on delete set null,
  add column if not exists reviewed_by_operator_id uuid references public.operators(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

update public.family_scenario_research
set review_status = case
  when research_status = 'completed' and changed_canonical_knowledge then 'approved'
  when research_status = 'superseded' then 'rejected'
  else 'pending_review'
end
where review_status is null;

alter table public.family_scenario_research
  alter column review_status set default 'pending_review',
  alter column review_status set not null;

alter table public.family_scenario_research
  drop constraint if exists family_scenario_research_review_status_check;
alter table public.family_scenario_research
  add constraint family_scenario_research_review_status_check
  check (review_status in ('pending_review', 'approved', 'rejected'));

create unique index if not exists family_scenario_research_one_pending_review_idx
  on public.family_scenario_research (scenario_id, interview_id)
  where review_status = 'pending_review';

create index if not exists family_scenario_research_review_queue_idx
  on public.family_scenario_research (review_status, created_at desc);

alter table public.family_scenario_research enable row level security;
revoke all on public.family_scenario_research from anon, authenticated;

create or replace function public.aqoon_approve_scenario_research(
  p_research_id uuid,
  p_scenario_id uuid,
  p_interview_id uuid,
  p_operator_id uuid,
  p_official_sources_checked boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_research public.family_scenario_research%rowtype;
  selected_scenario public.family_scenarios%rowtype;
  selected_interview public.family_interviews%rowtype;
  proposed_answer jsonb;
  proposed_guidance jsonb;
  proposed_sources jsonb;
  proposed_title text;
  proposed_recheck timestamptz;
  now_at timestamptz := now();
begin
  if p_official_sources_checked is not true then
    raise exception 'official_sources_must_be_checked' using errcode = '22023';
  end if;

  select * into selected_research
  from public.family_scenario_research
  where id = p_research_id
    and scenario_id = p_scenario_id
    and interview_id = p_interview_id
  for update;
  if not found then
    raise exception 'research_not_found' using errcode = 'P0002';
  end if;

  if selected_research.review_status = 'approved' then
    select * into selected_scenario
    from public.family_scenarios where id = p_scenario_id;
    return jsonb_build_object(
      'approved', true,
      'replayed', true,
      'research', to_jsonb(selected_research),
      'scenario', to_jsonb(selected_scenario)
    );
  end if;
  if selected_research.review_status <> 'pending_review'
     or selected_research.research_status <> 'completed' then
    raise exception 'research_not_pending_approval' using errcode = '22023';
  end if;

  select * into selected_scenario
  from public.family_scenarios
  where id = p_scenario_id
  for update;
  if not found then
    raise exception 'scenario_not_found' using errcode = 'P0002';
  end if;

  select * into selected_interview
  from public.family_interviews
  where id = p_interview_id
    and matched_scenario_id = p_scenario_id
  for update;
  if not found then
    raise exception 'interview_scenario_mismatch' using errcode = '22023';
  end if;

  proposed_answer := selected_research.findings -> 'verified_answer';
  proposed_guidance := coalesce(selected_research.findings -> 'operator_guidance', '{}'::jsonb);
  proposed_sources := selected_research.official_sources;
  proposed_title := nullif(btrim(selected_research.findings ->> 'proposed_title'), '');
  begin
    proposed_recheck := (selected_research.findings ->> 'proposed_recheck_after')::timestamptz;
  exception when others then
    proposed_recheck := null;
  end;

  if proposed_answer is null or jsonb_typeof(proposed_answer) <> 'object'
     or proposed_sources is null or jsonb_typeof(proposed_sources) <> 'array'
     or jsonb_array_length(proposed_sources) = 0 then
    raise exception 'invalid_research_evidence' using errcode = '22023';
  end if;
  if proposed_recheck is null or proposed_recheck <= now_at then
    proposed_recheck := now_at + interval '30 days';
  end if;

  update public.family_scenario_research
  set review_status = 'approved',
      changed_canonical_knowledge = true,
      reviewed_by_operator_id = p_operator_id,
      reviewed_at = now_at
  where id = p_research_id
  returning * into selected_research;

  update public.family_scenarios
  set title = coalesce(proposed_title, title),
      verified_answer = proposed_answer,
      official_sources = proposed_sources,
      operator_guidance = proposed_guidance,
      status = 'verified',
      first_verified_at = coalesce(first_verified_at, now_at),
      last_verified_at = now_at,
      recheck_after = proposed_recheck,
      updated_at = now_at
  where id = p_scenario_id
  returning * into selected_scenario;

  update public.family_interviews
  set scenario_match_status = 'matched', updated_at = now_at
  where id = p_interview_id;

  return jsonb_build_object(
    'approved', true,
    'replayed', false,
    'research', to_jsonb(selected_research),
    'scenario', to_jsonb(selected_scenario)
  );
end;
$$;

revoke all on function public.aqoon_approve_scenario_research(uuid, uuid, uuid, uuid, boolean) from public;
revoke all on function public.aqoon_approve_scenario_research(uuid, uuid, uuid, uuid, boolean) from anon;
revoke all on function public.aqoon_approve_scenario_research(uuid, uuid, uuid, uuid, boolean) from authenticated;
grant execute on function public.aqoon_approve_scenario_research(uuid, uuid, uuid, uuid, boolean) to service_role;

comment on column public.family_scenario_research.review_status
  is 'Human review gate. Research does not change canonical scenario knowledge until approved.';
comment on function public.aqoon_approve_scenario_research(uuid, uuid, uuid, uuid, boolean)
  is 'Atomically approves checked research, publishes canonical PII-free scenario knowledge, and marks the interview matched. Service role only.';

-- Store structured operator feedback without copying interview facts, names,
-- phone numbers, free-text notes, or other family PII into the knowledge layer.
-- Feedback is evidence for later human review; it never rewrites eligibility
-- criteria or marks knowledge as verified automatically.

create table if not exists public.knowledge_feedback_signals (
  id uuid primary key default gen_random_uuid(),
  match_run_id uuid not null unique references public.family_match_runs(id) on delete cascade,
  route_id uuid not null references public.knowledge_routes(id) on delete cascade,
  scenario_id uuid references public.family_scenarios(id) on delete set null,
  operator_id uuid references public.operators(id) on delete set null,
  verdict text not null check (verdict in ('does_not_fit')),
  reason_code text not null check (reason_code in (
    'criterion_conflict', 'wrong_need', 'family_preference',
    'provider_unavailable', 'information_outdated', 'duplicate_route', 'other'
  )),
  criterion_fields text[] not null default '{}',
  review_status text not null default 'pending_review' check (review_status in ('pending_review','accepted','dismissed','applied')),
  reviewed_by_operator_id uuid references public.operators(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_feedback_signals_review_queue_idx
  on public.knowledge_feedback_signals (review_status, reason_code, created_at desc);

alter table public.knowledge_feedback_signals enable row level security;
revoke all on public.knowledge_feedback_signals from anon, authenticated;

create or replace function public.aqoon_save_route_review(
  p_lead_id uuid,
  p_operator_id uuid,
  p_route_key text,
  p_match_status text,
  p_facts_used jsonb,
  p_missing_fields jsonb,
  p_conflicting_criteria jsonb,
  p_recommended_next_action text,
  p_reason_code text,
  p_criterion_fields text[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_interview public.family_interviews%rowtype;
  selected_route public.knowledge_routes%rowtype;
  selected_match public.family_match_runs%rowtype;
  saved_feedback public.knowledge_feedback_signals%rowtype;
  now_at timestamptz := now();
begin
  if p_match_status not in ('confirmed_match','possible_must_confirm','does_not_fit') then
    raise exception 'invalid_match_status' using errcode = '22023';
  end if;
  if p_facts_used is null or jsonb_typeof(p_facts_used) <> 'object'
     or p_missing_fields is null or jsonb_typeof(p_missing_fields) <> 'array'
     or p_conflicting_criteria is null or jsonb_typeof(p_conflicting_criteria) <> 'array' then
    raise exception 'invalid_review_payload' using errcode = '22023';
  end if;
  if p_match_status = 'does_not_fit' and coalesce(p_reason_code, '') not in (
    'criterion_conflict', 'wrong_need', 'family_preference',
    'provider_unavailable', 'information_outdated', 'duplicate_route', 'other'
  ) then
    raise exception 'feedback_reason_required' using errcode = '22023';
  end if;
  if cardinality(coalesce(p_criterion_fields, '{}'::text[])) > 30 then
    raise exception 'too_many_criterion_fields' using errcode = '22023';
  end if;

  perform 1 from public.family_leads where id = p_lead_id for update;
  if not found then
    raise exception 'lead_not_found' using errcode = 'P0002';
  end if;

  select * into selected_interview
  from public.family_interviews
  where lead_id = p_lead_id and status = 'completed'
  order by updated_at desc
  limit 1
  for update;
  if not found then
    raise exception 'first_interview_required' using errcode = 'P0002';
  end if;

  select * into selected_route
  from public.knowledge_routes
  where route_key = p_route_key
    and verification_state = 'verified'
    and (recheck_after is null or recheck_after > now_at)
  for update;
  if not found then
    raise exception 'route_not_currently_verified' using errcode = '22023';
  end if;

  select * into selected_match
  from public.family_match_runs
  where family_lead_id = p_lead_id
    and interview_id = selected_interview.id
    and route_id = selected_route.id
  for update;

  if found then
    update public.family_match_runs
    set operator_id = p_operator_id,
        status = 'reviewed',
        match_status = p_match_status,
        facts_used = p_facts_used,
        missing_fields = p_missing_fields,
        conflicting_criteria = p_conflicting_criteria,
        source_ids = selected_route.source_ids,
        recommended_next_action = nullif(btrim(coalesce(p_recommended_next_action, '')), ''),
        reviewed_at = now_at,
        updated_at = now_at
    where id = selected_match.id
    returning * into selected_match;
  else
    insert into public.family_match_runs (
      family_lead_id, interview_id, route_id, operator_id, status,
      match_status, facts_used, missing_fields, conflicting_criteria,
      source_ids, recommended_next_action, reviewed_at, updated_at
    ) values (
      p_lead_id, selected_interview.id, selected_route.id, p_operator_id, 'reviewed',
      p_match_status, p_facts_used, p_missing_fields, p_conflicting_criteria,
      selected_route.source_ids, nullif(btrim(coalesce(p_recommended_next_action, '')), ''), now_at, now_at
    ) returning * into selected_match;
  end if;

  if p_match_status = 'does_not_fit' then
    insert into public.knowledge_feedback_signals (
      match_run_id, route_id, scenario_id, operator_id, verdict,
      reason_code, criterion_fields, review_status, updated_at
    ) values (
      selected_match.id, selected_route.id, selected_interview.matched_scenario_id,
      p_operator_id, 'does_not_fit', p_reason_code,
      coalesce(p_criterion_fields, '{}'::text[]), 'pending_review', now_at
    )
    on conflict (match_run_id) do update
    set route_id = excluded.route_id,
        scenario_id = excluded.scenario_id,
        operator_id = excluded.operator_id,
        reason_code = excluded.reason_code,
        criterion_fields = excluded.criterion_fields,
        review_status = 'pending_review',
        reviewed_by_operator_id = null,
        reviewed_at = null,
        updated_at = now_at
    returning * into saved_feedback;
  end if;

  return jsonb_build_object(
    'match_run', to_jsonb(selected_match),
    'feedback_signal', case when saved_feedback.id is null then null else to_jsonb(saved_feedback) end
  );
end;
$$;

revoke all on function public.aqoon_save_route_review(uuid, uuid, text, text, jsonb, jsonb, jsonb, text, text, text[]) from public;
revoke all on function public.aqoon_save_route_review(uuid, uuid, text, text, jsonb, jsonb, jsonb, text, text, text[]) from anon;
revoke all on function public.aqoon_save_route_review(uuid, uuid, text, text, jsonb, jsonb, jsonb, text, text, text[]) from authenticated;
grant execute on function public.aqoon_save_route_review(uuid, uuid, text, text, jsonb, jsonb, jsonb, text, text, text[]) to service_role;

comment on table public.knowledge_feedback_signals
  is 'PII-minimized operator route feedback awaiting human review; never automatic eligibility or canonical knowledge.';
comment on function public.aqoon_save_route_review(uuid, uuid, text, text, jsonb, jsonb, jsonb, text, text, text[])
  is 'Atomically saves a route review and its structured PII-minimized learning signal. Service role only.';

create or replace function public.aqoon_dismiss_obsolete_route_feedback()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.match_status is distinct from 'does_not_fit' then
    update public.knowledge_feedback_signals
    set review_status = 'dismissed', updated_at = now()
    where match_run_id = new.id and review_status = 'pending_review';
  end if;
  return new;
end;
$$;

drop trigger if exists family_match_runs_dismiss_obsolete_feedback on public.family_match_runs;
create trigger family_match_runs_dismiss_obsolete_feedback
after insert or update of match_status on public.family_match_runs
for each row execute function public.aqoon_dismiss_obsolete_route_feedback();

revoke all on function public.aqoon_dismiss_obsolete_route_feedback() from public, anon, authenticated;

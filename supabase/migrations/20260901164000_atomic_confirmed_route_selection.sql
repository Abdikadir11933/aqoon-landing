-- Confirming a route is one operator decision, so its reviewed match, active
-- plan, audit event and family state must share one transaction. Browser roles
-- cannot call this RPC directly; the lifecycle Edge Function supplies the
-- authenticated operator id through its service-role client.

create unique index if not exists family_match_runs_interview_route_key
  on public.family_match_runs (family_lead_id, interview_id, route_id)
  where interview_id is not null and route_id is not null;

create unique index if not exists family_case_plans_one_active_per_lead_key
  on public.family_case_plans (family_lead_id)
  where plan_status not in ('resolved', 'closed_unresolved');

create or replace function public.aqoon_select_case_route(
  p_lead_id uuid,
  p_operator_id uuid,
  p_route_key text,
  p_facts_used jsonb,
  p_missing_fields jsonb,
  p_conflicting_criteria jsonb,
  p_title text,
  p_selected_option jsonb,
  p_next_action text,
  p_existing_plan_id uuid,
  p_request_id uuid
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
  selected_plan public.family_case_plans%rowtype;
  selected_event public.family_case_events%rowtype;
  replay_event public.family_case_events%rowtype;
  now_at timestamptz := now();
begin
  if p_request_id is null then
    raise exception 'missing_request_id' using errcode = '22023';
  end if;
  if nullif(btrim(coalesce(p_route_key, '')), '') is null then
    raise exception 'missing_route_key' using errcode = '22023';
  end if;
  if nullif(btrim(coalesce(p_title, '')), '') is null then
    raise exception 'missing_title' using errcode = '22023';
  end if;
  if p_facts_used is null or jsonb_typeof(p_facts_used) <> 'object'
     or p_selected_option is null or jsonb_typeof(p_selected_option) <> 'object'
     or p_missing_fields is null or jsonb_typeof(p_missing_fields) <> 'array'
     or p_conflicting_criteria is null or jsonb_typeof(p_conflicting_criteria) <> 'array' then
    raise exception 'invalid_route_selection_payload' using errcode = '22023';
  end if;
  if jsonb_array_length(p_missing_fields) > 0 or jsonb_array_length(p_conflicting_criteria) > 0 then
    raise exception 'confirmed_route_has_unresolved_criteria' using errcode = '22023';
  end if;
  if p_selected_option ->> 'route_key' is distinct from p_route_key then
    raise exception 'selected_option_route_mismatch' using errcode = '22023';
  end if;

  select * into replay_event
  from public.family_case_events
  where request_id = p_request_id;

  if found then
    if replay_event.family_lead_id <> p_lead_id
       or replay_event.event_type <> 'plan_selected'
       or replay_event.event_data ->> 'route_key' is distinct from p_route_key then
      raise exception 'idempotency_key_conflict' using errcode = '23505';
    end if;
    select * into selected_plan
    from public.family_case_plans
    where id = replay_event.case_plan_id;
    select * into selected_match
    from public.family_match_runs
    where id = selected_plan.match_run_id;
    return jsonb_build_object(
      'plan', to_jsonb(selected_plan),
      'match_run', to_jsonb(selected_match),
      'event', to_jsonb(replay_event),
      'replayed', true
    );
  end if;

  -- The family row is the serialization point for two tabs/operators trying
  -- to select a route for the same case at the same time.
  perform 1 from public.family_leads where id = p_lead_id for update;
  if not found then
    raise exception 'lead_not_found' using errcode = 'P0002';
  end if;

  -- A retry can only see the event after waiting for the family lock.
  select * into replay_event
  from public.family_case_events
  where request_id = p_request_id;
  if found then
    select * into selected_plan from public.family_case_plans where id = replay_event.case_plan_id;
    select * into selected_match from public.family_match_runs where id = selected_plan.match_run_id;
    return jsonb_build_object('plan', to_jsonb(selected_plan), 'match_run', to_jsonb(selected_match), 'event', to_jsonb(replay_event), 'replayed', true);
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

  -- Match-preview only offers routes whose route/criterion sources are all
  -- present, verified and current. Recheck the same invariant at commit time.
  if cardinality(selected_route.source_ids) = 0 or exists (
    select 1
    from unnest(selected_route.source_ids) source_id
    left join public.knowledge_sources source on source.id = source_id
    where source.id is null
       or source.verification_state <> 'verified'
       or (source.recheck_after is not null and source.recheck_after <= now_at)
  ) or exists (
    select 1
    from public.knowledge_criteria criterion
    where criterion.route_id = selected_route.id
      and (
        criterion.verification_state <> 'verified'
        or (criterion.recheck_after is not null and criterion.recheck_after <= now_at)
        or exists (
          select 1
          from unnest(criterion.source_ids) source_id
          left join public.knowledge_sources source on source.id = source_id
          where source.id is null
             or source.verification_state <> 'verified'
             or (source.recheck_after is not null and source.recheck_after <= now_at)
        )
      )
  ) then
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
        match_status = 'confirmed_match',
        facts_used = p_facts_used,
        missing_fields = p_missing_fields,
        conflicting_criteria = p_conflicting_criteria,
        source_ids = selected_route.source_ids,
        recommended_next_action = nullif(btrim(coalesce(p_next_action, '')), ''),
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
      'confirmed_match', p_facts_used, p_missing_fields, p_conflicting_criteria,
      selected_route.source_ids, nullif(btrim(coalesce(p_next_action, '')), ''), now_at, now_at
    ) returning * into selected_match;
  end if;

  if p_existing_plan_id is not null then
    select * into selected_plan
    from public.family_case_plans
    where id = p_existing_plan_id and family_lead_id = p_lead_id
    for update;
    if not found then
      raise exception 'plan_not_found' using errcode = 'P0002';
    end if;
  else
    select * into selected_plan
    from public.family_case_plans
    where family_lead_id = p_lead_id
      and plan_status not in ('resolved', 'closed_unresolved')
    order by updated_at desc
    limit 1
    for update;
  end if;

  if found then
    if selected_plan.plan_status <> 'research' then
      raise exception 'plan_not_selectable' using errcode = '40001';
    end if;
    update public.family_case_plans
    set match_run_id = selected_match.id,
        owner_operator_id = p_operator_id,
        title = left(btrim(p_title), 240),
        selected_option = p_selected_option,
        plan_status = 'options_ready',
        next_action = nullif(btrim(coalesce(p_next_action, '')), ''),
        next_follow_up_at = null,
        resolved_at = null,
        updated_at = now_at
    where id = selected_plan.id
    returning * into selected_plan;
  else
    insert into public.family_case_plans (
      family_lead_id, match_run_id, owner_operator_id, title,
      selected_option, plan_status, next_action, updated_at
    ) values (
      p_lead_id, selected_match.id, p_operator_id, left(btrim(p_title), 240),
      p_selected_option, 'options_ready', nullif(btrim(coalesce(p_next_action, '')), ''), now_at
    ) returning * into selected_plan;
  end if;

  insert into public.family_case_events (
    family_lead_id, case_plan_id, operator_id, event_type,
    event_data, occurred_at, request_id
  ) values (
    p_lead_id, selected_plan.id, p_operator_id, 'plan_selected',
    jsonb_build_object('route_key', p_route_key, 'match_run_id', selected_match.id),
    now_at, p_request_id
  ) returning * into selected_event;

  update public.family_leads
  set status = 'contacted',
      journey_stage = 'start',
      resolved_at = null,
      last_actor_id = p_operator_id,
      updated_at = now_at
  where id = p_lead_id;

  return jsonb_build_object(
    'plan', to_jsonb(selected_plan),
    'match_run', to_jsonb(selected_match),
    'event', to_jsonb(selected_event),
    'replayed', false
  );
end;
$$;

revoke all on function public.aqoon_select_case_route(uuid, uuid, text, jsonb, jsonb, jsonb, text, jsonb, text, uuid, uuid) from public;
revoke all on function public.aqoon_select_case_route(uuid, uuid, text, jsonb, jsonb, jsonb, text, jsonb, text, uuid, uuid) from anon;
revoke all on function public.aqoon_select_case_route(uuid, uuid, text, jsonb, jsonb, jsonb, text, jsonb, text, uuid, uuid) from authenticated;
grant execute on function public.aqoon_select_case_route(uuid, uuid, text, jsonb, jsonb, jsonb, text, jsonb, text, uuid, uuid) to service_role;

comment on function public.aqoon_select_case_route(uuid, uuid, text, jsonb, jsonb, jsonb, text, jsonb, text, uuid, uuid)
  is 'Atomically confirms a current verified route, saves its match review, creates or advances the active case plan, writes plan_selected, and synchronizes lead state. Service role only.';

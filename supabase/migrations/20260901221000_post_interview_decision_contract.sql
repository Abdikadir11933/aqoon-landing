-- Make the five-step follow-up an auditable state machine. Family decisions,
-- official actions, waiting dates and research approval must never be bare
-- browser-side status edits.

alter table public.family_case_events
  drop constraint if exists family_case_events_event_type_check;
alter table public.family_case_events
  add constraint family_case_events_event_type_check
  check (event_type = any (array[
    'interview_completed'::text,
    'research_completed'::text,
    'research_route_rejected'::text,
    'options_presented'::text,
    'plan_selected'::text,
    'family_route_agreed'::text,
    'family_decision_pending'::text,
    'family_route_declined'::text,
    'route_reconsidered'::text,
    'official_action_started'::text,
    'official_response_received'::text,
    'persistence_confirmed'::text,
    'case_resolved'::text,
    'case_closed_unresolved'::text,
    'follow_up_attempted'::text
  ]));

create or replace function public.aqoon_transition_case_plan(
  p_lead_id uuid,
  p_plan_id uuid,
  p_operator_id uuid,
  p_expected_status text,
  p_next_status text,
  p_event_type text,
  p_note text default null,
  p_event_data jsonb default '{}'::jsonb,
  p_next_follow_up_at timestamptz default null,
  p_request_id uuid default gen_random_uuid(),
  p_clear_selected_option boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_plan public.family_case_plans%rowtype;
  saved_plan public.family_case_plans%rowtype;
  saved_event public.family_case_events%rowtype;
  existing_event public.family_case_events%rowtype;
  now_at timestamptz := now();
begin
  if p_request_id is null then
    raise exception 'missing_request_id' using errcode = '22023';
  end if;
  if p_event_data is null or jsonb_typeof(p_event_data) <> 'object' then
    raise exception 'invalid_event_data' using errcode = '22023';
  end if;

  select * into existing_event from public.family_case_events where request_id = p_request_id;
  if found then
    if existing_event.family_lead_id <> p_lead_id or existing_event.case_plan_id <> p_plan_id then
      raise exception 'idempotency_key_conflict' using errcode = '23505';
    end if;
    select * into saved_plan from public.family_case_plans where id = p_plan_id;
    return jsonb_build_object('plan', to_jsonb(saved_plan), 'event', to_jsonb(existing_event), 'replayed', true);
  end if;

  select * into current_plan
  from public.family_case_plans
  where id = p_plan_id and family_lead_id = p_lead_id
  for update;
  if not found then raise exception 'plan_not_found' using errcode = 'P0002'; end if;

  select * into existing_event from public.family_case_events where request_id = p_request_id;
  if found then
    return jsonb_build_object('plan', to_jsonb(current_plan), 'event', to_jsonb(existing_event), 'replayed', true);
  end if;
  if current_plan.plan_status <> p_expected_status then
    raise exception 'stale_plan_status' using errcode = '40001';
  end if;

  if not (
    (p_expected_status = 'options_ready' and p_next_status = 'action_in_progress' and p_event_type in ('family_route_agreed','options_presented')) or
    (p_expected_status = 'options_ready' and p_next_status = 'options_ready' and p_event_type = 'family_decision_pending') or
    (p_expected_status = 'options_ready' and p_next_status = 'research' and p_event_type = 'family_route_declined') or
    (p_expected_status = 'action_in_progress' and p_next_status = 'awaiting_outcome' and p_event_type = 'official_action_started') or
    (p_expected_status = 'awaiting_outcome' and p_next_status = 'awaiting_outcome' and p_event_type = 'follow_up_attempted') or
    (p_expected_status = 'awaiting_outcome' and p_next_status = 'persistence_check' and p_event_type = 'official_response_received') or
    (p_expected_status = 'persistence_check' and p_next_status = 'resolved' and p_event_type = 'case_resolved') or
    (p_expected_status = 'persistence_check' and p_next_status = 'closed_unresolved' and p_event_type = 'case_closed_unresolved') or
    (p_expected_status = 'persistence_check' and p_next_status = 'awaiting_outcome' and p_event_type = 'follow_up_attempted') or
    (p_expected_status in ('options_ready','action_in_progress','awaiting_outcome','persistence_check') and p_next_status = 'research' and p_event_type = 'route_reconsidered')
  ) then
    raise exception 'invalid_plan_transition' using errcode = '22023';
  end if;

  if p_event_type in (
    'family_route_agreed','family_decision_pending','family_route_declined',
    'options_presented','official_action_started','official_response_received',
    'follow_up_attempted','case_resolved','case_closed_unresolved'
  ) and nullif(btrim(coalesce(p_note, '')), '') is null then
    raise exception 'transition_note_required' using errcode = '22023';
  end if;
  if p_event_type in ('family_decision_pending','follow_up_attempted')
     and (p_next_follow_up_at is null or p_next_follow_up_at <= now_at) then
    raise exception 'future_follow_up_required' using errcode = '22023';
  end if;

  update public.family_case_plans
  set plan_status = p_next_status,
      next_follow_up_at = case
        when p_next_follow_up_at is not null then p_next_follow_up_at
        when p_next_status in ('research','action_in_progress','persistence_check','resolved','closed_unresolved') then null
        else next_follow_up_at
      end,
      resolved_at = case when p_next_status in ('resolved','closed_unresolved') then now_at else null end,
      selected_option = case when p_clear_selected_option then '{}'::jsonb else selected_option end,
      match_run_id = case when p_clear_selected_option then null else match_run_id end,
      updated_at = now_at
  where id = p_plan_id
  returning * into saved_plan;

  insert into public.family_case_events (
    family_lead_id, case_plan_id, operator_id, event_type, event_data,
    note, occurred_at, request_id
  ) values (
    p_lead_id, p_plan_id, p_operator_id, p_event_type, p_event_data,
    nullif(btrim(coalesce(p_note, '')), ''), now_at, p_request_id
  ) returning * into saved_event;

  update public.family_leads
  set status = case when p_next_status in ('resolved','closed_unresolved') then 'resolved' else 'contacted' end,
      journey_stage = case
        when p_next_status in ('resolved','closed_unresolved') then 'resolved'
        when p_next_status = 'research' then 'guide'
        else 'start'
      end,
      resolved_at = case when p_next_status in ('resolved','closed_unresolved') then now_at else null end,
      next_follow_up_at = case
        when p_next_follow_up_at is not null then p_next_follow_up_at
        when p_next_status in ('research','action_in_progress','persistence_check','resolved','closed_unresolved') then null
        else next_follow_up_at
      end,
      last_actor_id = p_operator_id,
      updated_at = now_at
  where id = p_lead_id;
  if not found then raise exception 'lead_not_found' using errcode = 'P0002'; end if;

  return jsonb_build_object('plan', to_jsonb(saved_plan), 'event', to_jsonb(saved_event), 'replayed', false);
end;
$$;

create or replace function public.aqoon_save_research_evidence(
  p_lead_id uuid,
  p_plan_id uuid,
  p_operator_id uuid,
  p_selected_option jsonb,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_plan public.family_case_plans%rowtype;
  saved_plan public.family_case_plans%rowtype;
  saved_event public.family_case_events%rowtype;
  existing_event public.family_case_events%rowtype;
  now_at timestamptz := now();
begin
  if p_request_id is null then raise exception 'missing_request_id' using errcode='22023'; end if;
  if p_selected_option is null or jsonb_typeof(p_selected_option) <> 'object'
     or not (p_selected_option @> '{"provisional_route":true}'::jsonb)
     or nullif(btrim(coalesce(p_selected_option ->> 'research_answer','')), '') is null then
    raise exception 'research_evidence_required' using errcode='22023';
  end if;
  select * into existing_event from public.family_case_events where request_id=p_request_id;
  if found then
    if existing_event.family_lead_id<>p_lead_id or existing_event.case_plan_id<>p_plan_id then
      raise exception 'idempotency_key_conflict' using errcode='23505';
    end if;
    select * into saved_plan from public.family_case_plans where id=p_plan_id;
    return jsonb_build_object('plan',to_jsonb(saved_plan),'event',to_jsonb(existing_event),'replayed',true);
  end if;
  select * into current_plan from public.family_case_plans
  where id=p_plan_id and family_lead_id=p_lead_id for update;
  if not found then raise exception 'plan_not_found' using errcode='P0002'; end if;
  if current_plan.plan_status<>'research' then raise exception 'plan_not_selectable' using errcode='40001'; end if;
  if coalesce(current_plan.selected_option ->> 'route_key','')<>coalesce(p_selected_option ->> 'route_key','')
     or coalesce(current_plan.selected_option ->> 'route_title',current_plan.title)<>coalesce(p_selected_option ->> 'route_title',current_plan.title) then
    raise exception 'researched_route_mismatch' using errcode='22023';
  end if;
  update public.family_case_plans
  set selected_option=p_selected_option,owner_operator_id=p_operator_id,updated_at=now_at
  where id=p_plan_id returning * into saved_plan;
  insert into public.family_case_events(
    family_lead_id,case_plan_id,operator_id,event_type,event_data,note,occurred_at,request_id
  ) values (
    p_lead_id,p_plan_id,p_operator_id,'research_completed',
    jsonb_build_object('route_key',p_selected_option ->> 'route_key','provisional',true),
    'Focused route research saved.',now_at,p_request_id
  ) returning * into saved_event;
  return jsonb_build_object('plan',to_jsonb(saved_plan),'event',to_jsonb(saved_event),'replayed',false);
end;
$$;

create or replace function public.aqoon_reopen_family_case(
  p_lead_id uuid,
  p_plan_id uuid,
  p_operator_id uuid,
  p_note text,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_plan public.family_case_plans%rowtype;
  saved_lead public.family_leads%rowtype;
  saved_event public.family_case_events%rowtype;
  existing_event public.family_case_events%rowtype;
  now_at timestamptz:=now();
begin
  if p_request_id is null then raise exception 'missing_request_id' using errcode='22023'; end if;
  if nullif(btrim(coalesce(p_note,'')),'') is null then raise exception 'transition_note_required' using errcode='22023'; end if;
  select * into existing_event from public.family_case_events where request_id=p_request_id;
  if found then
    if existing_event.family_lead_id<>p_lead_id or existing_event.case_plan_id<>p_plan_id then
      raise exception 'idempotency_key_conflict' using errcode='23505';
    end if;
    select * into saved_lead from public.family_leads where id=p_lead_id;
    return jsonb_build_object('lead',to_jsonb(saved_lead),'event',to_jsonb(existing_event),'replayed',true);
  end if;
  select * into saved_lead from public.family_leads where id=p_lead_id for update;
  if not found then raise exception 'lead_not_found' using errcode='P0002'; end if;
  select * into selected_plan from public.family_case_plans
  where id=p_plan_id and family_lead_id=p_lead_id for update;
  if not found then raise exception 'plan_not_found' using errcode='P0002'; end if;
  if selected_plan.plan_status not in ('resolved','closed_unresolved') then
    raise exception 'case_not_closed' using errcode='40001';
  end if;
  insert into public.family_case_events(
    family_lead_id,case_plan_id,operator_id,event_type,event_data,note,occurred_at,request_id
  ) values (
    p_lead_id,p_plan_id,p_operator_id,'follow_up_attempted',
    '{"source":"resolved_queue","action":"reopen"}'::jsonb,left(btrim(p_note),4000),now_at,p_request_id
  ) returning * into saved_event;
  update public.family_leads
  set status='contacted',journey_stage='guide',resolved_at=null,next_follow_up_at=null,
      last_actor_id=p_operator_id,updated_at=now_at
  where id=p_lead_id returning * into saved_lead;
  return jsonb_build_object('lead',to_jsonb(saved_lead),'event',to_jsonb(saved_event),'replayed',false);
end;
$$;

create or replace function public.aqoon_approve_researched_route(
  p_lead_id uuid,
  p_plan_id uuid,
  p_operator_id uuid,
  p_selected_option jsonb,
  p_next_action text,
  p_note text,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_plan public.family_case_plans%rowtype;
  saved_plan public.family_case_plans%rowtype;
  saved_event public.family_case_events%rowtype;
  existing_event public.family_case_events%rowtype;
  now_at timestamptz := now();
begin
  if p_request_id is null then raise exception 'missing_request_id' using errcode = '22023'; end if;
  if p_selected_option is null or jsonb_typeof(p_selected_option) <> 'object'
     or not (p_selected_option @> '{"provisional_route":true}'::jsonb)
     or not (p_selected_option @> '{"research_sources_checked":true}'::jsonb)
     or p_selected_option ->> 'research_verdict' not in ('FIT','POSSIBLE')
     or nullif(btrim(coalesce(p_selected_option ->> 'research_answer','')), '') is null
     or nullif(btrim(coalesce(p_selected_option ->> 'operator_decision_note','')), '') is null then
    raise exception 'research_approval_evidence_required' using errcode = '22023';
  end if;
  if nullif(btrim(coalesce(p_note,'')), '') is null then
    raise exception 'transition_note_required' using errcode = '22023';
  end if;

  select * into existing_event from public.family_case_events where request_id = p_request_id;
  if found then
    if existing_event.family_lead_id <> p_lead_id or existing_event.case_plan_id <> p_plan_id then
      raise exception 'idempotency_key_conflict' using errcode = '23505';
    end if;
    select * into saved_plan from public.family_case_plans where id = p_plan_id;
    return jsonb_build_object('plan',to_jsonb(saved_plan),'event',to_jsonb(existing_event),'replayed',true);
  end if;

  perform 1 from public.family_leads where id = p_lead_id for update;
  if not found then raise exception 'lead_not_found' using errcode = 'P0002'; end if;
  select * into current_plan
  from public.family_case_plans
  where id = p_plan_id and family_lead_id = p_lead_id
  for update;
  if not found then raise exception 'plan_not_found' using errcode = 'P0002'; end if;
  if current_plan.plan_status <> 'research' then raise exception 'plan_not_selectable' using errcode = '40001'; end if;
  if coalesce(current_plan.selected_option ->> 'route_key','') <> coalesce(p_selected_option ->> 'route_key','')
     or coalesce(current_plan.selected_option ->> 'route_title',current_plan.title) <> coalesce(p_selected_option ->> 'route_title',current_plan.title) then
    raise exception 'researched_route_mismatch' using errcode = '22023';
  end if;

  update public.family_case_plans
  set owner_operator_id = p_operator_id,
      selected_option = p_selected_option,
      plan_status = 'options_ready',
      next_action = nullif(btrim(coalesce(p_next_action,'')), ''),
      next_follow_up_at = null,
      updated_at = now_at
  where id = p_plan_id
  returning * into saved_plan;

  if saved_plan.match_run_id is not null then
    update public.family_match_runs
    set operator_id = p_operator_id, status = 'reviewed', reviewed_at = now_at, updated_at = now_at
    where id = saved_plan.match_run_id and family_lead_id = p_lead_id;
  end if;

  insert into public.family_case_events (
    family_lead_id,case_plan_id,operator_id,event_type,event_data,note,occurred_at,request_id
  ) values (
    p_lead_id,p_plan_id,p_operator_id,'plan_selected',
    jsonb_build_object(
      'route_key',p_selected_option ->> 'route_key',
      'research_verdict',p_selected_option ->> 'research_verdict',
      'research_based',true,
      'official_sources_checked',true
    ),
    left(btrim(p_note),4000),now_at,p_request_id
  ) returning * into saved_event;

  update public.family_leads
  set status='contacted',journey_stage='start',next_follow_up_at=null,
      resolved_at=null,last_actor_id=p_operator_id,updated_at=now_at
  where id=p_lead_id;

  return jsonb_build_object('plan',to_jsonb(saved_plan),'event',to_jsonb(saved_event),'replayed',false);
end;
$$;

create or replace function public.aqoon_target_case_plan_need()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lead_household uuid;
  lead_primary_need uuid;
  requested_need uuid;
begin
  select household_id,primary_need_id into lead_household,lead_primary_need
  from public.family_leads where id=new.family_lead_id;
  if new.selected_option ? 'family_need_id'
     and (new.selected_option ->> 'family_need_id') ~* '^[0-9a-f-]{36}$' then
    requested_need := (new.selected_option ->> 'family_need_id')::uuid;
  end if;
  new.family_need_id := coalesce(new.family_need_id,requested_need,lead_primary_need);
  if new.family_need_id is not null and not exists (
    select 1 from public.family_needs need
    where need.id=new.family_need_id
      and need.household_id=lead_household
      and need.status <> 'archived'
  ) then
    raise exception 'invalid_plan_need' using errcode='22023';
  end if;
  return new;
end;
$$;

drop trigger if exists family_case_plans_target_need on public.family_case_plans;
create trigger family_case_plans_target_need
before insert or update of family_lead_id,family_need_id,selected_option
on public.family_case_plans
for each row execute function public.aqoon_target_case_plan_need();

revoke all on function public.aqoon_transition_case_plan(uuid,uuid,uuid,text,text,text,text,jsonb,timestamptz,uuid,boolean) from public,anon,authenticated;
grant execute on function public.aqoon_transition_case_plan(uuid,uuid,uuid,text,text,text,text,jsonb,timestamptz,uuid,boolean) to service_role;
revoke all on function public.aqoon_approve_researched_route(uuid,uuid,uuid,jsonb,text,text,uuid) from public,anon,authenticated;
grant execute on function public.aqoon_approve_researched_route(uuid,uuid,uuid,jsonb,text,text,uuid) to service_role;
revoke all on function public.aqoon_save_research_evidence(uuid,uuid,uuid,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.aqoon_save_research_evidence(uuid,uuid,uuid,jsonb,uuid) to service_role;
revoke all on function public.aqoon_reopen_family_case(uuid,uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.aqoon_reopen_family_case(uuid,uuid,uuid,text,uuid) to service_role;
revoke all on function public.aqoon_target_case_plan_need() from public,anon,authenticated;

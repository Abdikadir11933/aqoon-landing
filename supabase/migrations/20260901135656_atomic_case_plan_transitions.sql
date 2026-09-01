-- Keep every guided follow-up action as one retry-safe database transaction.
-- The Edge Function supplies the authenticated operator id; browser roles
-- cannot execute this function directly.

alter table public.family_case_events
  add column if not exists request_id uuid;

create unique index if not exists family_case_events_request_id_key
  on public.family_case_events (request_id)
  where request_id is not null;

alter table public.family_case_events
  drop constraint if exists family_case_events_event_type_check;

alter table public.family_case_events
  add constraint family_case_events_event_type_check
  check (event_type = any (array[
    'interview_completed'::text,
    'research_completed'::text,
    'options_presented'::text,
    'plan_selected'::text,
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

  select * into existing_event
  from public.family_case_events
  where request_id = p_request_id;

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

  if not found then
    raise exception 'plan_not_found' using errcode = 'P0002';
  end if;

  -- A concurrent retry can only see the event after waiting for the plan lock.
  select * into existing_event
  from public.family_case_events
  where request_id = p_request_id;

  if found then
    return jsonb_build_object('plan', to_jsonb(current_plan), 'event', to_jsonb(existing_event), 'replayed', true);
  end if;

  if current_plan.plan_status <> p_expected_status then
    raise exception 'stale_plan_status' using errcode = '40001';
  end if;

  if not (
    (p_expected_status = 'options_ready' and p_next_status = 'action_in_progress' and p_event_type = 'options_presented') or
    (p_expected_status = 'action_in_progress' and p_next_status = 'awaiting_outcome' and p_event_type = 'official_action_started') or
    (p_expected_status = 'awaiting_outcome' and p_next_status = 'persistence_check' and p_event_type = 'official_response_received') or
    (p_expected_status = 'persistence_check' and p_next_status = 'resolved' and p_event_type = 'case_resolved') or
    (p_expected_status = 'persistence_check' and p_next_status = 'closed_unresolved' and p_event_type = 'case_closed_unresolved') or
    (p_expected_status = 'persistence_check' and p_next_status = 'awaiting_outcome' and p_event_type = 'follow_up_attempted') or
    (p_expected_status in ('options_ready', 'action_in_progress', 'awaiting_outcome', 'persistence_check') and p_next_status = 'research' and p_event_type = 'route_reconsidered')
  ) then
    raise exception 'invalid_plan_transition' using errcode = '22023';
  end if;

  if p_event_type in ('official_response_received', 'case_resolved', 'case_closed_unresolved')
     and nullif(btrim(coalesce(p_note, '')), '') is null then
    raise exception 'transition_note_required' using errcode = '22023';
  end if;

  update public.family_case_plans
  set plan_status = p_next_status,
      next_follow_up_at = case
        when p_next_follow_up_at is not null then p_next_follow_up_at
        when p_next_status in ('resolved', 'closed_unresolved') then null
        else next_follow_up_at
      end,
      resolved_at = case when p_next_status in ('resolved', 'closed_unresolved') then now_at else null end,
      selected_option = case when p_clear_selected_option then '{}'::jsonb else selected_option end,
      updated_at = now_at
  where id = p_plan_id
  returning * into saved_plan;

  insert into public.family_case_events (
    family_lead_id,
    case_plan_id,
    operator_id,
    event_type,
    event_data,
    note,
    occurred_at,
    request_id
  ) values (
    p_lead_id,
    p_plan_id,
    p_operator_id,
    p_event_type,
    p_event_data,
    nullif(btrim(coalesce(p_note, '')), ''),
    now_at,
    p_request_id
  ) returning * into saved_event;

  update public.family_leads
  set status = case when p_next_status in ('resolved', 'closed_unresolved') then 'resolved' else 'contacted' end,
      journey_stage = case
        when p_next_status in ('resolved', 'closed_unresolved') then 'resolved'
        when p_next_status = 'research' then 'guide'
        else 'start'
      end,
      resolved_at = case when p_next_status in ('resolved', 'closed_unresolved') then now_at else null end,
      next_follow_up_at = case
        when p_next_follow_up_at is not null then p_next_follow_up_at
        when p_next_status in ('resolved', 'closed_unresolved') then null
        else next_follow_up_at
      end,
      last_actor_id = p_operator_id,
      updated_at = now_at
  where id = p_lead_id;

  if not found then
    raise exception 'lead_not_found' using errcode = 'P0002';
  end if;

  return jsonb_build_object('plan', to_jsonb(saved_plan), 'event', to_jsonb(saved_event), 'replayed', false);
end;
$$;

revoke all on function public.aqoon_transition_case_plan(uuid, uuid, uuid, text, text, text, text, jsonb, timestamptz, uuid, boolean) from public;
revoke all on function public.aqoon_transition_case_plan(uuid, uuid, uuid, text, text, text, text, jsonb, timestamptz, uuid, boolean) from anon;
revoke all on function public.aqoon_transition_case_plan(uuid, uuid, uuid, text, text, text, text, jsonb, timestamptz, uuid, boolean) from authenticated;
grant execute on function public.aqoon_transition_case_plan(uuid, uuid, uuid, text, text, text, text, jsonb, timestamptz, uuid, boolean) to service_role;

comment on function public.aqoon_transition_case_plan(uuid, uuid, uuid, text, text, text, text, jsonb, timestamptz, uuid, boolean)
  is 'Atomically advances one AQOON case plan, writes its audit event, and synchronizes lead state. Service role only.';

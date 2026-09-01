-- A commercial relationship never grants access to a named family. A handoff
-- is a separate, per-family, per-recipient action with explicit disclosure,
-- consent and a minimal declared data scope. Browser roles cannot read or
-- write these rows; the operator Edge Function calls the atomic RPCs.

alter table public.family_case_events drop constraint if exists family_case_events_event_type_check;
alter table public.family_case_events add constraint family_case_events_event_type_check
check (event_type = any (array[
  'interview_completed'::text,'research_completed'::text,'research_route_rejected'::text,
  'options_presented'::text,'plan_selected'::text,'family_route_agreed'::text,
  'family_decision_pending'::text,'family_route_declined'::text,'route_reconsidered'::text,
  'official_action_started'::text,'official_response_received'::text,'persistence_confirmed'::text,
  'case_resolved'::text,'case_closed_unresolved'::text,'follow_up_attempted'::text,
  'partner_handoff_withdrawn'::text
]));

create table if not exists public.family_partner_handoffs (
  id uuid primary key default gen_random_uuid(),
  family_lead_id uuid not null references public.family_leads(id) on delete cascade,
  family_need_id uuid not null references public.family_needs(id) on delete restrict,
  case_plan_id uuid not null references public.family_case_plans(id) on delete cascade,
  sales_opportunity_id uuid not null references public.sales_opportunities(id) on delete restrict,
  operator_id uuid references public.operators(id) on delete set null,
  recipient_organisation text not null check (char_length(recipient_organisation) between 1 and 240),
  disclosure_statement text not null check (char_length(disclosure_statement) between 1 and 2000),
  disclosure_explained_at timestamptz not null,
  consent_status text not null check (consent_status in ('granted','withdrawn')),
  consent_method text not null check (consent_method in ('phone_verbal','in_person_verbal','written','digital')),
  consent_scope text[] not null check (
    cardinality(consent_scope) between 1 and 5
    and consent_scope <@ array['full_name','phone','city','need_summary','application_documents']::text[]
  ),
  consent_recorded_at timestamptz not null,
  handoff_status text not null check (handoff_status in ('sent','partner_accepted','partner_declined','family_withdrew','outcome_confirmed')),
  sent_at timestamptz not null,
  outcome_at timestamptz,
  outcome_note text check (outcome_note is null or char_length(outcome_note) <= 4000),
  request_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists family_partner_handoffs_lead_idx
  on public.family_partner_handoffs (family_lead_id, created_at desc);
create index if not exists family_partner_handoffs_plan_idx
  on public.family_partner_handoffs (case_plan_id, created_at desc);
create index if not exists family_partner_handoffs_sales_idx
  on public.family_partner_handoffs (sales_opportunity_id, handoff_status);

alter table public.family_partner_handoffs enable row level security;
revoke all on table public.family_partner_handoffs from public, anon, authenticated;

create or replace function public.aqoon_start_partner_handoff(
  p_lead_id uuid,
  p_plan_id uuid,
  p_sales_opportunity_id uuid,
  p_operator_id uuid,
  p_disclosure_statement text,
  p_disclosure_explained boolean,
  p_consent_granted boolean,
  p_consent_method text,
  p_consent_scope text[],
  p_note text,
  p_next_follow_up_at timestamptz,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_lead public.family_leads%rowtype;
  selected_plan public.family_case_plans%rowtype;
  selected_need public.family_needs%rowtype;
  selected_route public.knowledge_routes%rowtype;
  selected_opportunity public.sales_opportunities%rowtype;
  saved_handoff public.family_partner_handoffs%rowtype;
  saved_event public.family_case_events%rowtype;
  now_at timestamptz := now();
  route_key_value text;
begin
  if p_request_id is null then raise exception 'missing_request_id' using errcode='22023'; end if;
  select * into saved_handoff from public.family_partner_handoffs where request_id=p_request_id;
  if found then
    if saved_handoff.family_lead_id<>p_lead_id or saved_handoff.case_plan_id<>p_plan_id or saved_handoff.sales_opportunity_id<>p_sales_opportunity_id then
      raise exception 'idempotency_key_conflict' using errcode='23505';
    end if;
    select * into selected_plan from public.family_case_plans where id=p_plan_id;
    select * into saved_event from public.family_case_events where request_id=p_request_id;
    return jsonb_build_object('plan',to_jsonb(selected_plan),'event',to_jsonb(saved_event),'handoff',to_jsonb(saved_handoff),'replayed',true);
  end if;
  if not coalesce(p_disclosure_explained,false) or nullif(btrim(coalesce(p_disclosure_statement,'')),'') is null then
    raise exception 'partner_disclosure_required' using errcode='22023';
  end if;
  if not coalesce(p_consent_granted,false) then raise exception 'partner_handoff_consent_required' using errcode='22023'; end if;
  if p_consent_method not in ('phone_verbal','in_person_verbal','written','digital') then raise exception 'invalid_consent_method' using errcode='22023'; end if;
  if p_consent_scope is null or cardinality(p_consent_scope) not between 1 and 5
     or not (p_consent_scope <@ array['full_name','phone','city','need_summary','application_documents']::text[]) then
    raise exception 'invalid_consent_scope' using errcode='22023';
  end if;
  if nullif(btrim(coalesce(p_note,'')),'') is null then raise exception 'transition_note_required' using errcode='22023'; end if;
  if p_next_follow_up_at is not null and p_next_follow_up_at<=now_at then raise exception 'future_follow_up_required' using errcode='22023'; end if;

  select * into selected_lead from public.family_leads where id=p_lead_id for update;
  if not found then raise exception 'lead_not_found' using errcode='P0002'; end if;
  select * into selected_plan from public.family_case_plans where id=p_plan_id and family_lead_id=p_lead_id for update;
  if not found then raise exception 'plan_not_found' using errcode='P0002'; end if;
  if selected_plan.plan_status<>'action_in_progress' then raise exception 'stale_plan_status' using errcode='40001'; end if;
  if selected_plan.family_need_id is null then raise exception 'plan_need_required' using errcode='22023'; end if;

  select * into selected_need from public.family_needs
  where id=selected_plan.family_need_id and household_id=selected_lead.household_id and status<>'archived'
  for update;
  if not found then raise exception 'invalid_plan_need' using errcode='22023'; end if;
  route_key_value:=nullif(btrim(coalesce(selected_plan.selected_option->>'route_key','')),'');
  if route_key_value is null then raise exception 'selected_route_required' using errcode='22023'; end if;
  select * into selected_route from public.knowledge_routes
  where route_key=route_key_value and verification_state='verified' and (recheck_after is null or recheck_after>now_at)
  for update;
  if not found or selected_route.need_domain<>selected_need.need_domain then raise exception 'route_not_currently_verified' using errcode='22023'; end if;
  if coalesce(cardinality(selected_route.source_ids),0)=0 or exists (
    select 1 from unnest(selected_route.source_ids) source_id
    left join public.knowledge_sources source on source.id=source_id
    where source.id is null or source.verification_state<>'verified' or (source.recheck_after is not null and source.recheck_after<=now_at)
  ) or exists (
    select 1 from public.knowledge_criteria criterion
    where criterion.route_id=selected_route.id and (
      criterion.verification_state<>'verified'
      or (criterion.recheck_after is not null and criterion.recheck_after<=now_at)
      or exists (
        select 1 from unnest(criterion.source_ids) source_id
        left join public.knowledge_sources source on source.id=source_id
        where source.id is null or source.verification_state<>'verified' or (source.recheck_after is not null and source.recheck_after<=now_at)
      )
    )
  ) then raise exception 'route_not_currently_verified' using errcode='22023'; end if;

  select * into selected_opportunity from public.sales_opportunities
  where id=p_sales_opportunity_id and stage in ('won','delivery','expansion')
  for update;
  if not found then raise exception 'partner_not_handoff_enabled' using errcode='22023'; end if;
  if selected_opportunity.demand_need_domain is distinct from selected_need.need_domain then
    raise exception 'partner_need_domain_mismatch' using errcode='22023';
  end if;

  insert into public.family_partner_handoffs(
    family_lead_id,family_need_id,case_plan_id,sales_opportunity_id,operator_id,
    recipient_organisation,disclosure_statement,disclosure_explained_at,
    consent_status,consent_method,consent_scope,consent_recorded_at,
    handoff_status,sent_at,request_id
  ) values (
    p_lead_id,selected_need.id,p_plan_id,p_sales_opportunity_id,p_operator_id,
    left(btrim(selected_opportunity.organization),240),left(btrim(p_disclosure_statement),2000),now_at,
    'granted',p_consent_method,p_consent_scope,now_at,'sent',now_at,p_request_id
  ) returning * into saved_handoff;

  update public.family_case_plans set plan_status='awaiting_outcome',next_follow_up_at=p_next_follow_up_at,updated_at=now_at
  where id=p_plan_id returning * into selected_plan;
  insert into public.family_case_events(
    family_lead_id,case_plan_id,operator_id,event_type,event_data,note,occurred_at,request_id
  ) values (
    p_lead_id,p_plan_id,p_operator_id,'official_action_started',
    jsonb_build_object('action_type','partner_handoff','handoff_id',saved_handoff.id,'sales_opportunity_id',p_sales_opportunity_id,'route_key',route_key_value,'partner_disclosure_required',selected_route.partner_disclosure_required),
    left(btrim(p_note),4000),now_at,p_request_id
  ) returning * into saved_event;
  update public.family_leads set status='contacted',journey_stage='start',next_follow_up_at=p_next_follow_up_at,last_actor_id=p_operator_id,updated_at=now_at
  where id=p_lead_id;
  return jsonb_build_object('plan',to_jsonb(selected_plan),'event',to_jsonb(saved_event),'handoff',to_jsonb(saved_handoff),'replayed',false);
end;
$$;

create or replace function public.aqoon_withdraw_partner_handoff(
  p_lead_id uuid,p_plan_id uuid,p_handoff_id uuid,p_operator_id uuid,p_note text,p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_plan public.family_case_plans%rowtype;
  selected_handoff public.family_partner_handoffs%rowtype;
  saved_event public.family_case_events%rowtype;
  existing_event public.family_case_events%rowtype;
  now_at timestamptz:=now();
begin
  if p_request_id is null then raise exception 'missing_request_id' using errcode='22023'; end if;
  if nullif(btrim(coalesce(p_note,'')),'') is null then raise exception 'transition_note_required' using errcode='22023'; end if;
  select * into existing_event from public.family_case_events where request_id=p_request_id;
  if found then
    if existing_event.family_lead_id<>p_lead_id or existing_event.case_plan_id<>p_plan_id or existing_event.event_type<>'partner_handoff_withdrawn' then
      raise exception 'idempotency_key_conflict' using errcode='23505';
    end if;
    select * into selected_plan from public.family_case_plans where id=p_plan_id;
    select * into selected_handoff from public.family_partner_handoffs where id=p_handoff_id;
    return jsonb_build_object('plan',to_jsonb(selected_plan),'event',to_jsonb(existing_event),'handoff',to_jsonb(selected_handoff),'replayed',true);
  end if;
  perform 1 from public.family_leads where id=p_lead_id for update;
  if not found then raise exception 'lead_not_found' using errcode='P0002'; end if;
  select * into selected_plan from public.family_case_plans where id=p_plan_id and family_lead_id=p_lead_id for update;
  if not found then raise exception 'plan_not_found' using errcode='P0002'; end if;
  if selected_plan.plan_status<>'awaiting_outcome' then raise exception 'stale_plan_status' using errcode='40001'; end if;
  select * into selected_handoff from public.family_partner_handoffs
  where id=p_handoff_id and family_lead_id=p_lead_id and case_plan_id=p_plan_id for update;
  if not found then raise exception 'handoff_not_found' using errcode='P0002'; end if;
  if selected_handoff.consent_status<>'granted' or selected_handoff.handoff_status<>'sent' then raise exception 'handoff_not_withdrawable' using errcode='40001'; end if;
  update public.family_partner_handoffs
  set consent_status='withdrawn',handoff_status='family_withdrew',outcome_at=now_at,outcome_note=left(btrim(p_note),4000),updated_at=now_at
  where id=p_handoff_id returning * into selected_handoff;
  update public.family_case_plans set plan_status='action_in_progress',next_follow_up_at=null,updated_at=now_at
  where id=p_plan_id returning * into selected_plan;
  insert into public.family_case_events(family_lead_id,case_plan_id,operator_id,event_type,event_data,note,occurred_at,request_id)
  values (p_lead_id,p_plan_id,p_operator_id,'partner_handoff_withdrawn',jsonb_build_object('handoff_id',p_handoff_id,'action_type','partner_handoff'),left(btrim(p_note),4000),now_at,p_request_id)
  returning * into saved_event;
  update public.family_leads set status='contacted',journey_stage='start',next_follow_up_at=null,last_actor_id=p_operator_id,updated_at=now_at where id=p_lead_id;
  return jsonb_build_object('plan',to_jsonb(selected_plan),'event',to_jsonb(saved_event),'handoff',to_jsonb(selected_handoff),'replayed',false);
end;
$$;

create or replace function public.aqoon_record_partner_handoff_outcome(
  p_lead_id uuid,
  p_plan_id uuid,
  p_handoff_id uuid,
  p_operator_id uuid,
  p_outcome text,
  p_note text,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_handoff public.family_partner_handoffs%rowtype;
  existing_event_type text;
  transition_result jsonb;
  saved_handoff public.family_partner_handoffs%rowtype;
begin
  if p_request_id is null then raise exception 'missing_request_id' using errcode='22023'; end if;
  if p_outcome not in ('partner_accepted','partner_declined','outcome_confirmed') then raise exception 'invalid_handoff_outcome' using errcode='22023'; end if;
  if nullif(btrim(coalesce(p_note,'')),'') is null then raise exception 'transition_note_required' using errcode='22023'; end if;
  select event_type into existing_event_type from public.family_case_events where request_id=p_request_id;
  if found and existing_event_type<>'official_response_received' then raise exception 'idempotency_key_conflict' using errcode='23505'; end if;
  select * into selected_handoff from public.family_partner_handoffs
  where id=p_handoff_id and family_lead_id=p_lead_id and case_plan_id=p_plan_id for update;
  if not found then raise exception 'handoff_not_found' using errcode='P0002'; end if;
  if selected_handoff.handoff_status not in ('sent','partner_accepted','partner_declined','outcome_confirmed') then
    raise exception 'handoff_not_awaiting_outcome' using errcode='40001';
  end if;
  select public.aqoon_transition_case_plan(
    p_lead_id,p_plan_id,p_operator_id,'awaiting_outcome','persistence_check','official_response_received',
    p_note,jsonb_build_object('action_type','partner_handoff','handoff_id',p_handoff_id,'handoff_outcome',p_outcome),null,p_request_id,false
  ) into transition_result;
  update public.family_partner_handoffs
  set handoff_status=p_outcome,outcome_at=now(),outcome_note=left(btrim(p_note),4000),updated_at=now()
  where id=p_handoff_id returning * into saved_handoff;
  return transition_result || jsonb_build_object('handoff',to_jsonb(saved_handoff));
end;
$$;

revoke all on function public.aqoon_start_partner_handoff(uuid,uuid,uuid,uuid,text,boolean,boolean,text,text[],text,timestamptz,uuid) from public,anon,authenticated;
grant execute on function public.aqoon_start_partner_handoff(uuid,uuid,uuid,uuid,text,boolean,boolean,text,text[],text,timestamptz,uuid) to service_role;
revoke all on function public.aqoon_record_partner_handoff_outcome(uuid,uuid,uuid,uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.aqoon_record_partner_handoff_outcome(uuid,uuid,uuid,uuid,text,text,uuid) to service_role;
revoke all on function public.aqoon_withdraw_partner_handoff(uuid,uuid,uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.aqoon_withdraw_partner_handoff(uuid,uuid,uuid,uuid,text,uuid) to service_role;

comment on table public.family_partner_handoffs is
  'Private, auditable boundary between a family case and a delivery partner. Every named handoff requires recipient-specific disclosure, explicit consent and a minimal declared data scope.';

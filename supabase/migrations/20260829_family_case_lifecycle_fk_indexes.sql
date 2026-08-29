-- Indexes for the case-lifecycle tables' operator/query paths.
-- Recovered from the live schema on 2026-08-29 (see
-- 20260829_family_case_lifecycle_and_future_opportunities.sql).

create index if not exists family_case_plans_lead_status_idx on public.family_case_plans (family_lead_id, plan_status, updated_at desc);
create index if not exists family_case_plans_followup_idx on public.family_case_plans (next_follow_up_at) where next_follow_up_at is not null;
create index if not exists family_case_plans_match_run_idx on public.family_case_plans (match_run_id) where match_run_id is not null;
create index if not exists family_case_plans_owner_idx on public.family_case_plans (owner_operator_id) where owner_operator_id is not null;

create index if not exists family_case_events_lead_time_idx on public.family_case_events (family_lead_id, occurred_at desc);
create index if not exists family_case_events_plan_idx on public.family_case_events (case_plan_id) where case_plan_id is not null;
create index if not exists family_case_events_operator_idx on public.family_case_events (operator_id) where operator_id is not null;

create index if not exists family_future_opportunities_lead_status_idx on public.family_future_opportunities (family_lead_id, status, earliest_contact_at);
create index if not exists family_future_opportunities_ready_idx on public.family_future_opportunities (earliest_contact_at) where status in ('watching','ready');
create index if not exists family_future_opportunities_plan_idx on public.family_future_opportunities (case_plan_id) where case_plan_id is not null;
create index if not exists family_future_opportunities_owner_idx on public.family_future_opportunities (owner_operator_id) where owner_operator_id is not null;

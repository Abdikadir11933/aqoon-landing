-- Covering indexes for the operator-attribution foreign keys added this
-- session (flagged by the Supabase performance advisor as unindexed).
-- Also drops one of two identical duplicate indexes on
-- family_contact_starts.request_id, flagged in the phase-1 audit
-- (docs/qa/current-state-audit-2026-08-28.md) and never cleaned up.
-- See docs/qa/full-repository-audit-2026-08-28.md.

create index if not exists family_leads_assigned_operator_idx on public.family_leads (assigned_operator_id);
create index if not exists family_leads_last_actor_idx on public.family_leads (last_actor_id);
create index if not exists family_interviews_operator_idx on public.family_interviews (operator_id);
create index if not exists sales_opportunities_owner_operator_idx on public.sales_opportunities (owner_operator_id);
create index if not exists sales_activities_operator_idx on public.sales_activities (operator_id);
create index if not exists ops_events_operator_idx on public.ops_events (operator_id);

drop index if exists public.family_contact_starts_request_id_uidx;

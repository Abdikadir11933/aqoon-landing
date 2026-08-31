# Tracker ↔ Supabase data contract

Status: implementation contract verified against the production schema on
2026-08-31. This is a routing and QA reference, not a copy of family data.

## Runtime ownership

The `/tracker` browser calls authenticated/admin Edge Functions. It does not
write directly to Supabase. The Edge Functions validate requests, apply
operator attribution and read/write the tables below.

## Collections

| Tracker capability | Edge Function | Canonical collections |
|---|---|---|
| Family CRM and interviews | `family-leads-admin` | `family_leads`, `family_interviews`, `family_intake_contacts`, `family_funnel_events`, `partner_programs` |
| Incomplete intake follow-up | `family-incomplete-admin` | `family_intake_contacts`, `family_leads`, `family_call_log` |
| Call and case lifecycle | `family-case-lifecycle-admin` | `family_leads`, `family_interviews`, `family_interview_revisions`, `family_case_plans`, `family_case_events`, `family_case_interactions`, `family_future_opportunities`, `family_call_log` |
| Reusable scenario learning | `family-scenario-admin` | `family_leads`, `family_interviews`, `family_scenarios`, `family_scenario_research` |
| Route review and matching | route/admin functions | `knowledge_routes`, `knowledge_sources`, `family_match_runs`, `operators` |
| Sales and agenda | `ops-admin` | `sales_opportunities`, `sales_activities`, `ops_events`, `family_leads`, `operators` |

## Sales rule

The Sales tab treats `sales_opportunities` as the relationship record,
`sales_activities` as its timeline, and `ops_events` as dated work. The family
demand shown beside a relationship is an anonymized aggregate derived from
`family_leads`; names, phone numbers and case notes are never part of that
buyer-facing aggregate.

## Change rule

When adding or renaming a collection or column:

1. update the migration and Edge Function together;
2. update the nearest tracker context and this contract;
3. update the deterministic collection check;
4. verify the live schema, auth/RLS boundary and the tracker response;
5. regenerate the tracker bundle if browser source changed.

Do not create a second table because a plan or old prototype used a different
name. If the live schema and code disagree, stop and resolve the contract
before changing data.

# Supabase operational schema contract

Status: production metadata reconciled on 2026-09-01 for project
`qxracwbsyfibcelasxbs`. This file contains schema names only—no family rows,
operator identifiers, programme records or credentials.

## Boundary and result

The AQOON operating system uses 29 public-schema tables: 25 are named directly
by current Edge Functions, two are embedded matching relations
(`knowledge_services`, `knowledge_criteria`), and `family_households` is the
canonical parent reached through the family graph; `family_interview_needs` is
the trigger-maintained interview/need join. Every one exists in
production, has RLS enabled, has zero `anon`/`authenticated` table grants and
is accessed through an Edge Function after the appropriate public-input or
operator-auth boundary.

Production also contains a separate legacy product surface (`users`,
`interaction_events`, `feedback`, `waiver_acceptances`, `waitlist` and nine
generic/domain knowledge-chunk tables). It is not an AQOON matching input.
`waitlist` remains the intentional public-insert backend for the Pilke page.
The other legacy function/table callers are not proven from this repository,
so changing their grants remains unverified work rather than an assumed-safe
AQOON fix.

## Exact operational columns

| Table | Purpose | Production columns |
|---|---|---|
| `operators` | authenticated operator identity | `id`, `display_name`, `active`, `created_at`, `email`, `auth_user_id` |
| `family_households` | deduplicated household identity without another plaintext phone | `id`, `contact_fingerprint`, `city`, `identity_basis`, `status`, `created_at`, `updated_at` |
| `family_people` | adults, children and dependants in a household | `id`, `household_id`, `role`, `display_label`, `birth_date`, `age_years`, `age_band`, `created_at`, `updated_at` |
| `family_needs` | one canonical present/future need per subject and source position | `id`, `household_id`, `subject_person_id`, `source_lead_id`, `source_position`, `need_domain`, `raw_main_need`, `raw_sub_need`, `age_group`, `timing`, `status`, `source`, `evidence`, `created_at`, `updated_at` |
| `family_leads` | operational case/CRM entry | `id`, `created_at`, `updated_at`, `name`, `phone`, `city`, `main_need`, `sub_need`, `age_group`, `tier`, `status`, `contacted_at`, `resolved_at`, `notes`, `source`, `lang`, `legacy_waitlist_id`, `analytics_session_id`, `analytics_visitor_id`, `intake_request_id`, `referrer_host`, `utm_source`, `utm_medium`, `utm_campaign`, `next_follow_up_at`, `urgency`, `interview_status`, `last_interview_at`, `journey_stage`, `form_version`, `additional_needs`, `last_call_outcome`, `last_call_at`, `assigned_operator_id`, `last_actor_id`, `consent_relevant_updates_ok`, `consent_outcome_followup_ok`, `consent_recorded_at`, `work_diagnostic`, `school_diagnostic`, `programs_diagnostic`, `household_id`, `primary_person_id`, `primary_need_id` |
| `family_intake_contacts` | recoverable partial Caawi intake | `id`, `created_at`, `updated_at`, `request_id`, `visitor_id`, `session_id`, `name`, `phone`, `city`, `main_need`, `sub_need`, `age_group`, `completed`, `referrer_host`, `utm_source`, `utm_medium`, `utm_campaign`, `form_version`, `additional_needs`, `work_diagnostic`, `school_diagnostic`, `programs_diagnostic`, `assigned_operator_id`, `last_call_outcome`, `last_call_at`, `last_call_next_follow_up_at`, `last_call_notes` |
| `family_funnel_events` | anonymous intake funnel events | `id`, `created_at`, `session_id`, `event_name`, `path`, `city`, `main_need`, `sub_need`, `age_group`, `referrer_host`, `utm_source`, `utm_medium`, `utm_campaign`, `visitor_id`, `event_id`, `screen`, `device_type`, `form_version`, `work_diagnostic`, `school_diagnostic`, `programs_diagnostic` |
| `family_intake_rate_limits` | hourly public-intake abuse guard | `bucket_start`, `client_key`, `endpoint`, `attempts`, `updated_at` |
| `family_interviews` | current interview state and decision context | `id`, `lead_id`, `interview_type`, `answers`, `summary`, `research_prompt`, `next_follow_up_at`, `urgency`, `status`, `created_at`, `updated_at`, `next_action`, `scenario_fingerprint`, `matched_scenario_id`, `scenario_match_status`, `interview_schema_version`, `operator_id`, `household_id`, `subject_person_id` |
| `family_interview_revisions` | immutable snapshots before interview edits | `id`, `interview_id`, `lead_id`, `revision_number`, `answers`, `summary`, `research_prompt`, `next_follow_up_at`, `next_action`, `urgency`, `status`, `interview_schema_version`, `operator_id`, `captured_at` |
| `family_interview_needs` | interview-to-need coverage join | `interview_id`, `family_need_id`, `created_at` |
| `family_call_log` | append-only call outcome history | `id`, `family_lead_id`, `operator_id`, `outcome`, `next_follow_up_at`, `notes`, `created_at` |
| `family_case_plans` | selected route and plan state | `id`, `family_lead_id`, `match_run_id`, `owner_operator_id`, `title`, `official_decision_maker`, `selected_option`, `plan_status`, `next_action`, `next_follow_up_at`, `resolved_at`, `created_at`, `updated_at`, `family_need_id` |
| `family_case_events` | atomic lifecycle event ledger | `id`, `family_lead_id`, `case_plan_id`, `operator_id`, `event_type`, `event_data`, `note`, `occurred_at`, `created_at`, `request_id` |
| `family_case_interactions` | operator/family interaction history | `id`, `family_lead_id`, `case_plan_id`, `operator_id`, `interaction_type`, `summary`, `structured_data`, `next_action`, `next_follow_up_at`, `created_at` |
| `family_future_opportunities` | permissioned future-need signals | `id`, `family_lead_id`, `case_plan_id`, `owner_operator_id`, `household_scope`, `need_domain`, `signal_label`, `signal_source`, `trigger_type`, `earliest_contact_at`, `contact_permission_status`, `status`, `note`, `created_at`, `updated_at`, `source_interview_id`, `signal_key`, `family_need_id`, `subject_person_id` |
| `family_partner_handoffs` | explicit-consent named partner disclosure and outcome | `id`, `family_lead_id`, `family_need_id`, `case_plan_id`, `sales_opportunity_id`, `operator_id`, `recipient_organisation`, `disclosure_statement`, `disclosure_explained_at`, `consent_status`, `consent_method`, `consent_scope`, `consent_recorded_at`, `handoff_status`, `sent_at`, `outcome_at`, `outcome_note`, `request_id`, `created_at`, `updated_at` |
| `family_match_runs` | route evaluation facts and operator verdict | `id`, `family_lead_id`, `interview_id`, `route_id`, `operator_id`, `status`, `match_status`, `facts_used`, `missing_fields`, `conflicting_criteria`, `source_ids`, `recommended_next_action`, `reviewed_at`, `created_at`, `updated_at` |
| `family_scenarios` | reusable PII-free scenario knowledge | `id`, `created_at`, `updated_at`, `scenario_key`, `dimensions`, `title`, `main_need`, `sub_need`, `city_scope`, `age_group`, `tenure_stage`, `work_status`, `household_context`, `verified_answer`, `official_sources`, `operator_guidance`, `status`, `first_verified_at`, `last_verified_at`, `recheck_after`, `times_reused`, `last_reused_at`, `notes` |
| `family_scenario_research` | research answer plus human verification state | `id`, `scenario_id`, `interview_id`, `created_at`, `checked_at`, `research_status`, `research_question`, `findings`, `official_sources`, `changed_canonical_knowledge`, `notes`, `review_status`, `submitted_by_operator_id`, `reviewed_by_operator_id`, `reviewed_at` |
| `knowledge_sources` | official source registry and recheck dates | `id`, `source_key`, `publisher`, `authority_level`, `canonical_url`, `title`, `scope`, `volatility`, `verification_state`, `last_checked_at`, `recheck_after`, `checked_by_operator_id`, `notes`, `created_at`, `updated_at` |
| `knowledge_services` | authority/service definition | `id`, `service_key`, `name_fi`, `name_so`, `authority_name`, `decision_maker`, `scope`, `verification_state`, `source_ids`, `matching_fields`, `aqoon_role`, `aqoon_must_not`, `last_verified_at`, `recheck_after`, `reviewed_by_operator_id`, `created_at`, `updated_at` |
| `knowledge_routes` | executable route scope, facts, steps and disclosure rule | `id`, `route_key`, `service_id`, `need_domain`, `scope`, `required_inputs`, `blocking_inputs`, `steps`, `source_ids`, `partner_disclosure_required`, `verification_state`, `volatility`, `last_verified_at`, `recheck_after`, `reviewed_by_operator_id`, `created_at`, `updated_at` |
| `knowledge_criteria` | deterministic required/conditional/exclusion rules | `id`, `criterion_key`, `route_id`, `label`, `criterion_type`, `field_key`, `rule_json`, `source_ids`, `verification_state`, `last_verified_at`, `recheck_after`, `created_at`, `updated_at` |
| `knowledge_feedback_signals` | PII-minimized operator corrections awaiting review | `id`, `match_run_id`, `route_id`, `scenario_id`, `operator_id`, `verdict`, `reason_code`, `criterion_fields`, `review_status`, `reviewed_by_operator_id`, `reviewed_at`, `created_at`, `updated_at`, `review_note`, `official_sources_checked`, `knowledge_change_reference` |
| `partner_programs` | private programme/source registry shown to operators | `id`, `created_at`, `updated_at`, `name`, `organisation`, `city`, `category`, `audience`, `pain_match`, `status`, `application_status`, `deadline`, `source_url`, `source_type`, `partner_priority`, `outreach_status`, `notes`, `last_verified_at` |
| `sales_opportunities` | organisation relationship and controlled demand target | `id`, `organization`, `contact_name`, `contact_role`, `stage`, `health`, `summary`, `goal`, `success_definition`, `completed_steps`, `next_steps`, `next_action`, `next_action_at`, `probability`, `source`, `created_at`, `updated_at`, `stage_changed_at`, `owner_operator_id`, `demand_need`, `demand_city`, `demand_need_domain`, `demand_timing`, `demand_interest_state` |
| `sales_activities` | organisation relationship timeline | `id`, `opportunity_id`, `activity_type`, `title`, `notes`, `happened_at`, `due_at`, `completed_at`, `external_key`, `created_at`, `operator_id` |
| `ops_events` | dated Sales/case work and meetings | `id`, `title`, `event_type`, `starts_at`, `ends_at`, `status`, `notes`, `opportunity_id`, `family_lead_id`, `external_key`, `created_at`, `updated_at`, `operator_id` |

## Relationship rules

- `family_households` owns `family_people` and `family_needs`; a lead points to
  its household, primary person and primary need without replacing intake
  history.
- `family_interviews` belongs to a lead and can identify its subject person;
  revisions cascade with the interview, and interview/need coverage uses
  `family_interview_needs`.
- `family_match_runs` joins a lead/interview to a current `knowledge_route`.
  Routes belong to services; criteria belong to routes; sources are referenced
  by controlled UUID arrays and verified before a confirmed match.
- A case plan belongs to one lead and, where known, one canonical need. Events
  and interactions belong to that plan/lead. Transition-owned events are
  written by service-only atomic RPCs with request-id idempotency.
- Future opportunities retain their source interview, subject and need. They
  are signals, not duplicate leads and not eligibility decisions.
- A partner handoff joins a lead, need and case plan to one eligible Sales
  relationship. `RESTRICT` prevents deleting the disclosed need or partner
  relationship while the audit record exists.
- Sales activities and calendar events belong to organisation relationships;
  family demand reaches Sales only as household-deduplicated aggregate data or
  through an explicit consented handoff.

All production foreign keys for these relations were enumerated during the
reconciliation. There are no missing referenced tables. Nullable historical
links use `SET NULL`; owned history uses `CASCADE`; consented handoff targets
use `RESTRICT`.

## Recovered migration ownership

Production migration history showed that the original creation of eight core
tables, `operators`, and `take_family_intake_rate_limit` predated the SQL files
committed to Git. `20260826000000_recovered_operational_baseline.sql` now owns
that structure for clean environments. `20260901230000_live_schema_reconciliation.sql`
owns three previously untracked incomplete-intake indexes and revokes browser
execution of the internal interview-completion trigger function.

The production reconciliation migrations were applied successfully. The
rate-limit RPC and internal trigger function are executable by `service_role`
and not by `anon` or `authenticated`.

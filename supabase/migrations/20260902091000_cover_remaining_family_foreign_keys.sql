-- Cover every currently unindexed family/knowledge foreign key reported by
-- the Supabase database advisor. These indexes support deletes, operator
-- attribution lookups and route/research joins as the dataset grows.

create index if not exists family_call_log_operator_id_idx
  on public.family_call_log (operator_id);
create index if not exists family_case_interactions_operator_id_idx
  on public.family_case_interactions (operator_id);
create index if not exists family_interview_revisions_operator_id_idx
  on public.family_interview_revisions (operator_id);
create index if not exists family_match_runs_interview_id_idx
  on public.family_match_runs (interview_id);
create index if not exists family_match_runs_operator_id_idx
  on public.family_match_runs (operator_id);
create index if not exists family_match_runs_route_id_idx
  on public.family_match_runs (route_id);
create index if not exists family_scenario_research_reviewed_operator_idx
  on public.family_scenario_research (reviewed_by_operator_id);
create index if not exists family_scenario_research_submitted_operator_idx
  on public.family_scenario_research (submitted_by_operator_id);
create index if not exists knowledge_feedback_signals_operator_id_idx
  on public.knowledge_feedback_signals (operator_id);
create index if not exists knowledge_feedback_signals_reviewed_operator_idx
  on public.knowledge_feedback_signals (reviewed_by_operator_id);
create index if not exists knowledge_feedback_signals_route_id_idx
  on public.knowledge_feedback_signals (route_id);
create index if not exists knowledge_feedback_signals_scenario_id_idx
  on public.knowledge_feedback_signals (scenario_id);
create index if not exists knowledge_routes_reviewed_operator_idx
  on public.knowledge_routes (reviewed_by_operator_id);
create index if not exists knowledge_services_reviewed_operator_idx
  on public.knowledge_services (reviewed_by_operator_id);
create index if not exists knowledge_sources_checked_operator_idx
  on public.knowledge_sources (checked_by_operator_id);
create index if not exists knowledge_verifications_checked_operator_idx
  on public.knowledge_verifications (checked_by_operator_id);

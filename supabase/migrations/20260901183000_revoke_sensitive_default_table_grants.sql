-- RLS already denies browser access to these private/operational tables.
-- Remove PostgREST's broad default table grants as a second boundary so a
-- future policy cannot accidentally expose them. Current application access
-- is through authenticated Edge Functions using service_role.

revoke all on table public.operators from anon, authenticated;
revoke all on table public.family_call_log from anon, authenticated;
revoke all on table public.family_intake_rate_limits from anon, authenticated;
revoke all on table public.family_scenarios from anon, authenticated;
revoke all on table public.family_scenario_research from anon, authenticated;
revoke all on table public.users from anon, authenticated;
revoke all on table public.waiver_acceptances from anon, authenticated;

alter table public.operators enable row level security;
alter table public.family_call_log enable row level security;
alter table public.family_intake_rate_limits enable row level security;
alter table public.family_scenarios enable row level security;
alter table public.family_scenario_research enable row level security;
alter table public.users enable row level security;
alter table public.waiver_acceptances enable row level security;

-- Close metadata drift identified during the one-system production
-- reconciliation. This migration is data-preserving and idempotent.

-- These three indexes existed in production but were absent from Git. They
-- support operator filtering of incomplete intakes after diagnostic columns
-- were introduced.
create index if not exists idx_family_intake_contacts_work_diagnostic
  on public.family_intake_contacts (work_diagnostic);
create index if not exists idx_family_intake_contacts_school_diagnostic
  on public.family_intake_contacts (school_diagnostic);
create index if not exists idx_family_intake_contacts_programs_diagnostic
  on public.family_intake_contacts (programs_diagnostic);

-- Trigger functions are internal implementation details, not browser RPCs.
revoke all on function public.log_completed_interview_case_event()
  from public, anon, authenticated;
grant execute on function public.log_completed_interview_case_event()
  to service_role;

-- Reassert the service-only boundary for every recovered baseline table.
alter table public.operators enable row level security;
alter table public.family_leads enable row level security;
alter table public.family_scenarios enable row level security;
alter table public.family_interviews enable row level security;
alter table public.family_scenario_research enable row level security;
alter table public.family_funnel_events enable row level security;
alter table public.family_intake_contacts enable row level security;
alter table public.family_intake_rate_limits enable row level security;
alter table public.partner_programs enable row level security;

revoke all on table public.operators, public.family_leads, public.family_scenarios,
  public.family_interviews, public.family_scenario_research,
  public.family_funnel_events, public.family_intake_contacts,
  public.family_intake_rate_limits, public.partner_programs
from anon, authenticated;


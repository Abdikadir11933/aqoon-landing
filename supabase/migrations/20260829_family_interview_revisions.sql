-- Interview edit history, separate from the immutable post-intake
-- conversation ledger. A BEFORE UPDATE trigger snapshots the prior row
-- into family_interview_revisions whenever a meaningful field actually
-- changes (a no-op update, e.g. touching only updated_at, snapshots
-- nothing). This never deletes history: restoring an earlier revision
-- (family-interview-history-admin) updates family_interviews, which
-- itself snapshots the version being replaced via this same trigger.
-- RLS enabled with no policies; the trigger function is SECURITY DEFINER
-- so it can insert regardless of caller, but EXECUTE is revoked from
-- anon/authenticated in the following migration so browser roles cannot
-- invoke it directly.
-- Recovered from the live schema on 2026-08-29.

create table if not exists public.family_interview_revisions (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.family_interviews(id) on delete cascade,
  lead_id uuid not null references public.family_leads(id) on delete cascade,
  revision_number integer not null check (revision_number > 0),
  answers jsonb not null default '{}'::jsonb,
  summary text,
  research_prompt text,
  next_follow_up_at timestamptz,
  next_action text,
  urgency text,
  status text,
  interview_schema_version text,
  operator_id uuid references public.operators(id) on delete set null,
  captured_at timestamptz not null default now(),
  unique (interview_id, revision_number)
);
alter table public.family_interview_revisions enable row level security;
create index if not exists family_interview_revisions_lead_captured_idx on public.family_interview_revisions (lead_id, captured_at desc);

create or replace function public.capture_family_interview_revision()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  next_revision integer;
begin
  if old.answers is not distinct from new.answers
     and old.summary is not distinct from new.summary
     and old.research_prompt is not distinct from new.research_prompt
     and old.next_follow_up_at is not distinct from new.next_follow_up_at
     and old.next_action is not distinct from new.next_action
     and old.urgency is not distinct from new.urgency
     and old.status is not distinct from new.status
     and old.interview_schema_version is not distinct from new.interview_schema_version
  then
    return new;
  end if;

  select coalesce(max(revision_number), 0) + 1
    into next_revision
    from public.family_interview_revisions
   where interview_id = old.id;

  insert into public.family_interview_revisions (
    interview_id, lead_id, revision_number, answers, summary, research_prompt,
    next_follow_up_at, next_action, urgency, status, interview_schema_version,
    operator_id, captured_at
  ) values (
    old.id, old.lead_id, next_revision, old.answers, old.summary, old.research_prompt,
    old.next_follow_up_at, old.next_action, old.urgency, old.status,
    old.interview_schema_version, old.operator_id, now()
  );
  return new;
end;
$function$;

drop trigger if exists capture_family_interview_revision_before_update on public.family_interviews;
create trigger capture_family_interview_revision_before_update
  before update on public.family_interviews
  for each row execute function public.capture_family_interview_revision();

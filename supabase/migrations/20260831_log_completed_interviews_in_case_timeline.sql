create or replace function public.log_completed_interview_case_event()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'completed' and (tg_op = 'INSERT' or old.status is distinct from 'completed') then
    if not exists (
      select 1
      from public.family_case_events e
      where e.family_lead_id = new.lead_id
        and e.event_type = 'interview_completed'
        and e.event_data ->> 'interview_id' = new.id::text
    ) then
      insert into public.family_case_events (
        family_lead_id,
        operator_id,
        event_type,
        event_data,
        occurred_at
      ) values (
        new.lead_id,
        new.operator_id,
        'interview_completed',
        jsonb_build_object('interview_id', new.id::text, 'interview_type', new.interview_type),
        coalesce(new.updated_at, now())
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists family_interviews_completed_event_trg on public.family_interviews;
create trigger family_interviews_completed_event_trg
after insert or update of status on public.family_interviews
for each row
execute function public.log_completed_interview_case_event();

insert into public.family_case_events (
  family_lead_id,
  operator_id,
  event_type,
  event_data,
  occurred_at
)
select
  i.lead_id,
  i.operator_id,
  'interview_completed',
  jsonb_build_object('interview_id', i.id::text, 'interview_type', i.interview_type),
  coalesce(i.updated_at, i.created_at, now())
from public.family_interviews i
where i.status = 'completed'
  and not exists (
    select 1
    from public.family_case_events e
    where e.family_lead_id = i.lead_id
      and e.event_type = 'interview_completed'
      and e.event_data ->> 'interview_id' = i.id::text
  );

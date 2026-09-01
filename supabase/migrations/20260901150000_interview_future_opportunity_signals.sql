-- Turn explicit household/future-need interview answers into operational,
-- consent-aware opportunities. These are not eligibility decisions and do
-- not create duplicate family/person records.

alter table public.family_future_opportunities
  add column if not exists source_interview_id uuid references public.family_interviews(id) on delete cascade,
  add column if not exists signal_key text;

create unique index if not exists family_future_opportunities_interview_signal_uidx
  on public.family_future_opportunities (source_interview_id, signal_key)
  where source_interview_id is not null and signal_key is not null;

create or replace function public.family_interview_opportunity_signals(p_answers jsonb)
returns table (
  signal_key text,
  household_scope text,
  need_domain text,
  signal_label text,
  timing text
)
language sql
immutable
set search_path = ''
as $$
  with cross_values as (
    select value
    from jsonb_array_elements_text(
      case jsonb_typeof(coalesce(p_answers, '{}'::jsonb)->'cross_service_needs_all')
        when 'array' then coalesce(p_answers, '{}'::jsonb)->'cross_service_needs_all'
        when 'string' then jsonb_build_array(coalesce(p_answers, '{}'::jsonb)->>'cross_service_needs_all')
        else '[]'::jsonb
      end
    )
  ), caregiver_values as (
    select value
    from jsonb_array_elements_text(
      case jsonb_typeof(coalesce(p_answers, '{}'::jsonb)->'caregiver_future_goal')
        when 'array' then coalesce(p_answers, '{}'::jsonb)->'caregiver_future_goal'
        when 'string' then jsonb_build_array(coalesce(p_answers, '{}'::jsonb)->>'caregiver_future_goal')
        else '[]'::jsonb
      end
    )
  ), raw_signals as (
    select
      case
        when value = 'Work' then 'adult:work'
        when value like 'School / child%' then 'child:school'
        when value = 'Daycare' then 'child:daycare'
        when value in ('Children''s hobbies', 'Children’s hobbies') then 'child:hobby'
        when value = 'Finnish / education' then 'adult:education'
        when value = 'Kela / benefits' then 'household:family_finances'
        when value = 'Programmes / training' then 'adult:live_programme'
        when value = 'Housing' then 'household:housing_debt_family'
        when value = 'Letters / applications' then 'household:service_support'
      end as key,
      'now'::text as timing,
      1 as priority
    from cross_values
    where value <> 'Nothing else now'

    union all

    select
      case
        when value in ('Work now', 'Work within 12 months') then 'adult:work'
        when value in ('Finnish / education now', 'Finnish / education later') then 'adult:education'
        when value = 'Start a business' then 'adult:entrepreneurship'
      end,
      case
        when value in ('Work within 12 months', 'Finnish / education later') then 'within_12_months'
        else 'now'
      end,
      2
    from caregiver_values
    where value not in ('No current goal', 'Not sure')

    union all

    select 'child:hobby',
      case when p_answers->>'child_activity_interest' = 'Maybe later' then 'later' else 'now' end,
      3
    where p_answers->>'child_activity_interest' in ('Yes – wants help now', 'Maybe later')

    union all

    select 'child:daycare',
      case p_answers->>'other_child_daycare_timing'
        when 'Now' then 'now'
        when 'Within 6 months' then 'within_6_months'
        when 'Within 12 months' then 'within_12_months'
        else 'later'
      end,
      3
    where p_answers->>'other_child_daycare_timing' in ('Now', 'Within 6 months', 'Within 12 months', 'Later / when plans change')

    union all

    select 'child:school',
      case when p_answers->>'school_help_possible' = 'Maybe later' then 'later' else 'now' end,
      3
    where p_answers->>'school_help_possible' in ('Yes – now', 'Maybe later')

    union all

    select 'child:hobby',
      case when p_answers->>'vantaa_hobbies_possible_need' = 'Maybe next round' then 'later' else 'now' end,
      3
    where p_answers->>'vantaa_hobbies_possible_need' in ('Yes – wants help now', 'Maybe next round')
  ), mapped as (
    select
      key,
      split_part(key, ':', 1) as scope,
      split_part(key, ':', 2) as domain,
      timing,
      priority
    from raw_signals
    where key is not null
  )
  select distinct on (key)
    'interview:' || key,
    scope,
    domain,
    case domain
      when 'work' then 'Parent / adult work support'
      when 'education' then 'Parent / adult Finnish or education support'
      when 'entrepreneurship' then 'Parent / adult business support'
      when 'daycare' then 'Another child daycare / esiopetus need'
      when 'school' then 'Child school / support need'
      when 'hobby' then 'Child hobby / activity need'
      when 'family_finances' then 'Kela / family-benefit help'
      when 'live_programme' then 'Programme / training interest'
      when 'housing_debt_family' then 'Housing / debt help'
      when 'service_support' then 'Letter / application help'
      else 'Future household need'
    end,
    timing
  from mapped
  order by key, priority, timing;
$$;

revoke all on function public.family_interview_opportunity_signals(jsonb) from public, anon, authenticated;
grant execute on function public.family_interview_opportunity_signals(jsonb) to service_role;

create or replace function public.sync_family_interview_future_opportunities()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  permission text;
begin
  if new.status <> 'completed' then
    return new;
  end if;

  permission := case new.answers->>'relevant_updates_ok'
    when 'Yes' then 'granted'
    when 'No' then 'declined'
    else 'not_requested'
  end;

  insert into public.family_future_opportunities (
    family_lead_id,
    source_interview_id,
    owner_operator_id,
    signal_key,
    household_scope,
    need_domain,
    signal_label,
    signal_source,
    trigger_type,
    earliest_contact_at,
    contact_permission_status,
    status,
    note,
    updated_at
  )
  select
    new.lead_id,
    new.id,
    new.operator_id,
    s.signal_key,
    s.household_scope,
    s.need_domain,
    s.signal_label,
    'family_requested',
    case when s.timing = 'now' then 'family_request' else 'operator_follow_up' end,
    case s.timing
      when 'now' then now()
      when 'within_6_months' then now() + interval '3 months'
      when 'within_12_months' then now() + interval '9 months'
      else null
    end,
    permission,
    case when s.timing = 'now' then 'ready' else 'watching' end,
    'Derived from an explicit first-interview household/future-need answer; verify the need before acting.',
    now()
  from public.family_interview_opportunity_signals(new.answers) s
  on conflict (source_interview_id, signal_key)
    where source_interview_id is not null and signal_key is not null
  do update set
    owner_operator_id = excluded.owner_operator_id,
    household_scope = excluded.household_scope,
    need_domain = excluded.need_domain,
    signal_label = excluded.signal_label,
    trigger_type = excluded.trigger_type,
    earliest_contact_at = excluded.earliest_contact_at,
    contact_permission_status = excluded.contact_permission_status,
    status = case
      when public.family_future_opportunities.status in ('offered', 'accepted', 'closed')
        then public.family_future_opportunities.status
      else excluded.status
    end,
    note = excluded.note,
    updated_at = excluded.updated_at;

  update public.family_future_opportunities opportunity
  set status = 'expired', updated_at = now()
  where opportunity.source_interview_id = new.id
    and opportunity.status in ('watching', 'ready')
    and not exists (
      select 1
      from public.family_interview_opportunity_signals(new.answers) current_signal
      where current_signal.signal_key = opportunity.signal_key
    );

  return new;
end;
$$;

revoke all on function public.sync_family_interview_future_opportunities() from public, anon, authenticated;

drop trigger if exists family_interviews_sync_future_opportunities on public.family_interviews;
create trigger family_interviews_sync_future_opportunities
after insert or update of answers, status on public.family_interviews
for each row execute function public.sync_family_interview_future_opportunities();

comment on column public.family_future_opportunities.source_interview_id is
  'Completed interview that produced this PII-minimised future-demand signal.';
comment on column public.family_future_opportunities.signal_key is
  'Stable per-interview signal identifier used for correction-safe upserts.';

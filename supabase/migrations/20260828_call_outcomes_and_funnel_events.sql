-- Keep first-contact outcomes atomic and align the funnel event contract with
-- the current phone-first multi-need intake.

alter table public.family_leads
  add column if not exists last_call_outcome text,
  add column if not exists last_call_at timestamptz;

alter table public.family_leads
  drop constraint if exists family_leads_last_call_outcome_check;

alter table public.family_leads
  add constraint family_leads_last_call_outcome_check
  check (last_call_outcome is null or last_call_outcome in (
    'reached', 'no_answer', 'call_later'
  ));

alter table public.family_funnel_events
  drop constraint if exists family_funnel_events_event_name_check;

alter table public.family_funnel_events
  add constraint family_funnel_events_event_name_check
  check (event_name in (
    'page_view', 'start', 'contact_view', 'contact_started', 'contact_saved',
    'city_selected', 'need_selected', 'age_selected', 'sub_selected',
    'more_help_view', 'additional_need_started', 'additional_need_added',
    'send_request', 'analytics_consent', 'submit_attempt', 'validation_error',
    'submit_success', 'submit_error'
  ));

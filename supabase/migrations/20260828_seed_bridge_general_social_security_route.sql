-- Seed the first Bridge Finland migration route.
-- This is structured protected routing knowledge, not a benefit calculator.
-- Source checked 2026-08-28; recheck due after 30 days.

with source as (
  insert into public.knowledge_sources (
    source_key, publisher, authority_level, canonical_url, title, scope, volatility,
    verification_state, last_checked_at, recheck_after, notes
  ) values (
    'kela.general-social-security-benefit',
    'Kela',
    'official_primary',
    'https://www.kela.fi/unemployment-general-social-security-benefit',
    'General social security benefit during unemployment',
    'Finland; Kela-paid unemployment support',
    'high',
    'verified',
    now(),
    now() + interval '30 days',
    'Verified against Kela on 2026-08-28. Replaces retired Bridge concepts: basic unemployment allowance and labour-market subsidy. Never use this record to calculate an outcome.'
  )
  on conflict (source_key) do update set
    publisher = excluded.publisher,
    authority_level = excluded.authority_level,
    canonical_url = excluded.canonical_url,
    title = excluded.title,
    scope = excluded.scope,
    volatility = excluded.volatility,
    verification_state = excluded.verification_state,
    last_checked_at = excluded.last_checked_at,
    recheck_after = excluded.recheck_after,
    notes = excluded.notes,
    updated_at = now()
  returning id
),
service as (
  insert into public.knowledge_services (
    service_key, name_fi, name_so, authority_name, decision_maker, scope, verification_state,
    source_ids, matching_fields, last_verified_at, recheck_after
  )
  select
    'service.finland.kela-general-social-security-benefit',
    'Yleistuki työttömälle työnhakijalle',
    'Yleistuki shaqo-doonka',
    'Kela',
    'Kela',
    'Finland; unemployed jobseekers. Employment services determine jobseeker status; Kela decides benefit.',
    'verified',
    array[source.id],
    '["main_status","jobseeker_registration_status","earnings_related_status","current_earned_income","other_income_context","residence_or_coverage_question"]'::jsonb,
    now(),
    now() + interval '30 days'
  from source
  on conflict (service_key) do update set
    name_fi = excluded.name_fi,
    name_so = excluded.name_so,
    authority_name = excluded.authority_name,
    decision_maker = excluded.decision_maker,
    scope = excluded.scope,
    verification_state = excluded.verification_state,
    source_ids = excluded.source_ids,
    matching_fields = excluded.matching_fields,
    last_verified_at = excluded.last_verified_at,
    recheck_after = excluded.recheck_after,
    updated_at = now()
  returning id, source_ids
),
route as (
  insert into public.knowledge_routes (
    route_key, service_id, need_domain, scope, required_inputs, blocking_inputs, steps,
    source_ids, partner_disclosure_required, verification_state, volatility, last_verified_at, recheck_after
  )
  select
    'route.finland.general-social-security-benefit',
    service.id,
    'income_and_unemployment',
    '{"country":"FI","person_type":"unemployed_jobseeker","decision_maker":"Kela"}'::jsonb,
    '["main_status","jobseeker_registration_status","earnings_related_status","current_earned_income","other_income_context"]'::jsonb,
    '["currently_receiving_earnings_related_allowance","not_an_active_jobseeker"]'::jsonb,
    '["Confirm active jobseeker registration with the employment services.","Confirm whether earnings-related unemployment allowance is unavailable or has ended.","Check current Kela guidance and the family facts that affect the route; do not estimate payment.","Explain the official OmaKela application or next official action, then record the operator-reviewed next step."]'::jsonb,
    service.source_ids,
    false,
    'verified',
    'high',
    now(),
    now() + interval '30 days'
  from service
  on conflict (route_key) do update set
    service_id = excluded.service_id,
    need_domain = excluded.need_domain,
    scope = excluded.scope,
    required_inputs = excluded.required_inputs,
    blocking_inputs = excluded.blocking_inputs,
    steps = excluded.steps,
    source_ids = excluded.source_ids,
    partner_disclosure_required = excluded.partner_disclosure_required,
    verification_state = excluded.verification_state,
    volatility = excluded.volatility,
    last_verified_at = excluded.last_verified_at,
    recheck_after = excluded.recheck_after,
    updated_at = now()
  returning id, source_ids
)
insert into public.knowledge_criteria (
  criterion_key, route_id, label, criterion_type, field_key, rule_json, source_ids,
  verification_state, last_verified_at, recheck_after
)
select
  v.criterion_key,
  route.id,
  v.label,
  v.criterion_type,
  v.field_key,
  v.rule_json::jsonb,
  route.source_ids,
  'verified',
  now(),
  now() + interval '30 days'
from route
cross join (
  values
    ('criterion.finland.general-social-security-benefit.active-jobseeker', 'Active jobseeker status must be confirmed', 'required', 'jobseeker_registration_status', '{"expected":"active","operator_note":"Confirm with the employment-services route; do not infer from employment status alone."}'),
    ('criterion.finland.general-social-security-benefit.earnings-related', 'Earnings-related allowance status must be confirmed', 'conditional', 'earnings_related_status', '{"eligible_route_when":["not_eligible","ended"],"operator_note":"If earnings-related allowance is currently paid, use the relevant official route instead."}'),
    ('criterion.finland.general-social-security-benefit.earned-income', 'Current earned income can affect the amount', 'authority_confirmation', 'current_earned_income', '{"operator_note":"Capture only the minimum high-level income context needed for official guidance; AQOON does not calculate the amount."}')
) as v(criterion_key, label, criterion_type, field_key, rule_json)
on conflict (criterion_key) do update set
  route_id = excluded.route_id,
  label = excluded.label,
  criterion_type = excluded.criterion_type,
  field_key = excluded.field_key,
  rule_json = excluded.rule_json,
  source_ids = excluded.source_ids,
  verification_state = excluded.verification_state,
  last_verified_at = excluded.last_verified_at,
  recheck_after = excluded.recheck_after,
  updated_at = now();

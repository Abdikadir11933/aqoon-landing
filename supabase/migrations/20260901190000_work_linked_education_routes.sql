-- Work-led education routes for people whose employment interview uncovers a
-- qualification or training goal. These are navigation routes, not admission,
-- employment, pay, or benefit decisions.

with source_rows(source_key,publisher,canonical_url,title,scope,volatility,recheck_after,notes) as (
  values
    ('src.tyomarkkinatori.workplace-learning','Job Market Finland','https://tyomarkkinatori.fi/henkiloasiakkaat/tietoa-tyoelamasta/koulutus/eri-tavat-opiskella/tyossa-oppiminen','Työssä oppiminen - Eri tavat opiskella','Finland; apprenticeship and workplace learning','medium',now()+interval '30 days','Checked against the current official page on 2026-09-01. Oppisopimus requires an employment relationship, employer/workplace and education-provider arrangements; pay and admission are not AQOON decisions.'),
    ('src.tyomarkkinatori.study-while-unemployed','Job Market Finland','https://tyomarkkinatori.fi/henkiloasiakkaat/tietoa-tyoelamasta/koulutus/eri-tavat-opiskella/opiskelu-tyottomana','Opiskelu työttömänä - Eri tavat opiskella','Finland; unemployed jobseekers considering education','high',now()+interval '30 days','Checked against the current official page on 2026-09-01. Current course availability and the employment authority decision must be checked before studies begin.')
), sources as (
  insert into public.knowledge_sources(source_key,publisher,authority_level,canonical_url,title,scope,volatility,verification_state,last_checked_at,recheck_after,notes)
  select source_key,publisher,'official_primary',canonical_url,title,scope,volatility,'verified',now(),recheck_after,notes from source_rows
  on conflict(source_key) do update set publisher=excluded.publisher,authority_level='official_primary',canonical_url=excluded.canonical_url,title=excluded.title,scope=excluded.scope,volatility=excluded.volatility,verification_state='verified',last_checked_at=now(),recheck_after=excluded.recheck_after,notes=excluded.notes,updated_at=now()
  returning id,source_key,recheck_after
), service_rows(service_key,name_fi,name_so,authority_name,decision_maker,scope,source_key,matching_fields) as (
  values
    ('service.finland.oppisopimus','Oppisopimuskoulutus','Tababar shaqo iyo shahaado (oppisopimus)','Education provider, employer and workplace','Education provider and employer','Finland; paid employment combined with a vocational qualification or qualification unit','src.tyomarkkinatori.workplace-learning','["qualification_status","work_study_route","apprenticeship","apprenticeship_workplace_status","availability","city"]'::jsonb),
    ('service.finland.vocational-labour-market-training','Ammatillinen työvoimakoulutus','Tababar xirfadeed oo shaqo-doon ah','Employment authority and education provider','Employment authority and education provider','Finland; vocational labour-market training for jobseekers; live offering varies','src.tyomarkkinatori.study-while-unemployed','["qualification_status","work_study_route","jobseeker_registration_status","training_schedule","current_training_opening","city"]'::jsonb)
), services as (
  insert into public.knowledge_services(service_key,name_fi,name_so,authority_name,decision_maker,scope,verification_state,source_ids,matching_fields,last_verified_at,recheck_after)
  select sr.service_key,sr.name_fi,sr.name_so,sr.authority_name,sr.decision_maker,sr.scope,'verified',array[s.id],sr.matching_fields,now(),s.recheck_after
  from service_rows sr join sources s using(source_key)
  on conflict(service_key) do update set name_fi=excluded.name_fi,name_so=excluded.name_so,authority_name=excluded.authority_name,decision_maker=excluded.decision_maker,scope=excluded.scope,verification_state='verified',source_ids=excluded.source_ids,matching_fields=excluded.matching_fields,last_verified_at=now(),recheck_after=excluded.recheck_after,updated_at=now()
  returning id,service_key,source_ids,recheck_after
), route_rows(route_key,service_key,required_inputs,steps,volatility) as (
  values
    ('route.finland.oppisopimus','service.finland.oppisopimus','["qualification_status","work_study_route","apprenticeship","apprenticeship_workplace_status","availability","city"]'::jsonb,'["Confirm the target vocational field and whether the person needs a full first qualification or a qualification unit.","Find a suitable employer or current apprenticeship vacancy; an unemployed person normally needs the workplace before the apprenticeship can be arranged.","Contact the relevant education provider or apprenticeship operator with the employer; they confirm admission, the learning plan and workplace suitability.","Confirm working hours, school days, pay under the applicable collective agreement and the family schedule before agreeing the plan."]'::jsonb,'medium'),
    ('route.finland.vocational-labour-market-training','service.finland.vocational-labour-market-training','["qualification_status","work_study_route","jobseeker_registration_status","training_schedule","current_training_opening","city"]'::jsonb,'["Search the current Job Market Finland offering for vocational labour-market training that matches the target field, location, language and schedule.","Check the live course page for admission requirements, application window, start date and provider.","Before studies begin, confirm the route with the employment-services expert; the authority and provider make the selection and support decisions."]'::jsonb,'live')
), routes as (
  insert into public.knowledge_routes(route_key,service_id,need_domain,scope,required_inputs,blocking_inputs,steps,source_ids,verification_state,volatility,last_verified_at,recheck_after)
  select rr.route_key,s.id,'education','{"country":"FI","purpose":"work_linked_qualification"}'::jsonb,rr.required_inputs,'[]'::jsonb,rr.steps,s.source_ids,'verified',rr.volatility,now(),s.recheck_after
  from route_rows rr join services s using(service_key)
  on conflict(route_key) do update set service_id=excluded.service_id,need_domain=excluded.need_domain,scope=excluded.scope,required_inputs=excluded.required_inputs,blocking_inputs=excluded.blocking_inputs,steps=excluded.steps,source_ids=excluded.source_ids,verification_state='verified',volatility=excluded.volatility,last_verified_at=now(),recheck_after=excluded.recheck_after,updated_at=now()
  returning id,route_key,source_ids,recheck_after
), criteria_rows(criterion_key,route_key,label,criterion_type,field_key,rule_json) as (
  values
    ('criterion.finland.oppisopimus.preference','route.finland.oppisopimus','Oppisopimus is selected or included in the comparison','required','work_study_route','{"expected_any":["Oppisopimus (paid work plus qualification)","Compare all suitable routes"]}'::jsonb),
    ('criterion.finland.oppisopimus.interest','route.finland.oppisopimus','Person is open to oppisopimus','required','apprenticeship','{"expected_any":["Yes","Maybe"]}'::jsonb),
    ('criterion.finland.oppisopimus.workplace','route.finland.oppisopimus','Employer and education provider must confirm a suitable apprenticeship arrangement','authority_confirmation','apprenticeship_workplace_status','{"must_confirm":true,"no_aqoon_decision":true}'::jsonb),
    ('criterion.finland.vocational-labour-market-training.preference','route.finland.vocational-labour-market-training','Labour-market training is selected or included in the comparison','required','work_study_route','{"expected_any":["Labour-market training","Compare all suitable routes"]}'::jsonb),
    ('criterion.finland.vocational-labour-market-training.jobseeker','route.finland.vocational-labour-market-training','Active jobseeker status must be confirmed','required','jobseeker_registration_status','{"expected_any":["Yes – active","Registered, active status not sure"]}'::jsonb),
    ('criterion.finland.vocational-labour-market-training.opening','route.finland.vocational-labour-market-training','A current suitable course and its admission criteria must be verified','authority_confirmation','current_training_opening','{"must_confirm":true,"no_aqoon_decision":true}'::jsonb)
)
insert into public.knowledge_criteria(criterion_key,route_id,label,criterion_type,field_key,rule_json,source_ids,verification_state,last_verified_at,recheck_after)
select c.criterion_key,r.id,c.label,c.criterion_type,c.field_key,c.rule_json,r.source_ids,'verified',now(),r.recheck_after
from criteria_rows c join routes r using(route_key)
on conflict(criterion_key) do update set route_id=excluded.route_id,label=excluded.label,criterion_type=excluded.criterion_type,field_key=excluded.field_key,rule_json=excluded.rule_json,source_ids=excluded.source_ids,verification_state='verified',last_verified_at=now(),recheck_after=excluded.recheck_after,updated_at=now();

-- HOKS is a plan for a person who is starting or already in vocational
-- education. Keep it out of broad education discovery until that fact exists.
update public.knowledge_routes
set need_domain='education_current_student',updated_at=now()
where route_key='route.finland.vocational-hoks';

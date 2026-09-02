(function(root){'use strict';
const SCHEMA_VERSION='first-interview-v6';
const groups={
  context:['case_subject','current_situation','immediate_goal','child_stage','household_schedule'],
  household_profile:['primary_contact_parent_caregiver','household_child_count','household_child_ages'],
  core:['client_age','home_municipality'],
  work:['primary_situation','work_search_scope','work_intent','study_path','qualification_status','work_study_route','training_schedule','jobseeker','jobseeker_active','unemployment_duration','employment_plan','integration_plan','right_to_work_known','palkkatuki','availability','start_when','travel_limit','childcare_limit','student_schedule','study_completion','student_benefit_context','current_work_hours','change_reason','work_tryout','apprenticeship','job_search_profile'],
  entrepreneurship:['business_stage','fulltime_started','business_idea','business_plan','business_numbers','starttiraha','business_start','business_help'],
  education:['education_entry_reason','education_barriers','integration_plan','literacy','basic_school','current_study','study_language','study_load','study_travel','study_start','yki_purpose','yki_level'],
  daycare:['care_reason','care_start_urgency','home_municipality','care_goal','care_schedule','application_date','sudden_need','all_guardians','urgent_proof','care_options','cost_priority','support_arrangement'],
  hobby:['activity_goal','activity_cost','grade','school_name','home_municipality','days','hobby_time','other_school','hobby_language','accessibility','registration'],
  school_child:['school_situation','school_decision_needed','grade','home_municipality','born_finland','fin_school_time','school_route','child_finnish','s2','support_tried','support_decision','school_deadline','school_goal'],
  program:['program_reason','program_constraints','jobseeker_active','integration_plan','integration_assessment','residence_status','first_permit_time','finnish_match','literacy','parent_status','kotihoidon_tuki','program_goal','program_time','program_childcare','program_cost','program_travel'],
  service_support:['authority_issue','authority_goal','service_area','case_status','decision_date','response_deadline','support_goal','authority_contacted'],
  general:['issue_context','desired_help','known_service','already_tried'],
  route_input:['child_age_or_birth_date','permanent_vantaa_residence_context','preferred_provider_or_area','preferred_area','income_statement_status','guardian_or_care_responsibility','youngest_child_age','municipal_ece_status','same_child_parental_or_private_daycare_allowance','finland_residence_or_employment_context','desired_start_date','main_status','earnings_related_status','current_earned_income','other_income_context','planned_unemployment_date','household_income_context','hobby_support_need','support_need_description','education_support_need','apprenticeship_workplace_status','current_training_opening'],
  evidence:['aqoon_awareness_before','entry_service_awareness','entry_service_self_navigation','entry_blockers','system_navigation_confidence','digital_application_independence','official_service_connections','employment_plan_status','work_support_awareness','private_daycare_awareness_all','daycare_application_awareness_all','vantaa_hobbies_awareness_all','aqoon_return_intent'],
  future_signal:['household_children','other_children_stages','work_interest_gate','caregiver_future_goal','child_activity_interest','daycare_possible_need_all','daycare_future_reminder','other_child_daycare_timing','school_help_possible','vantaa_hobbies_possible_need','vantaa_hobbies_reminder','cross_service_needs_all'],
  consent:['relevant_updates_ok','outcome_followup_ok'],
  operator_signal:['relationship_close_scope'],
  operator_note:['operator_context_notes','work_tryout_notes','apprenticeship_notes'],
};
const groupPolicy={
  context:{source:'family_answer',purpose:'Identify the person and immediate scenario before route-specific questions.',consumers:['interview_summary','research_brief','operator_follow_up']},
  household_profile:{source:'family_answer',purpose:'Snapshot the explicitly confirmed household basics used to prepare the interview and preserve who was actually discussed.',consumers:['research_brief','interview_revision','household_analysis']},
  core:{source:'family_answer',purpose:'Provide a minimum identity or municipality criterion used across adult routes.',consumers:['route_match','research_brief','case_plan']},
  work:{source:'family_answer',purpose:'Decide work, job-search and work-linked education criteria for the active need.',consumers:['route_match','research_brief','case_plan']},
  entrepreneurship:{source:'family_answer',purpose:'Decide the active entrepreneurship guidance route and its timing gates.',consumers:['route_match','research_brief','case_plan']},
  education:{source:'family_answer',purpose:'Decide the active education route, constraints and provider questions.',consumers:['route_match','research_brief','case_plan']},
  daycare:{source:'family_answer',purpose:'Decide the active daycare or esiopetus route, schedule and timing.',consumers:['route_match','research_brief','case_plan']},
  hobby:{source:'family_answer',purpose:'Decide the active child hobby route, schedule and practical fit.',consumers:['route_match','research_brief','case_plan']},
  school_child:{source:'family_answer',purpose:'Decide the active school-child support process and missing authority facts.',consumers:['route_match','research_brief','case_plan']},
  program:{source:'family_answer',purpose:'Decide the active programme route and participation constraints.',consumers:['route_match','research_brief','case_plan']},
  service_support:{source:'family_answer',purpose:'Identify the responsible authority, case stage and immediate procedural goal.',consumers:['route_match','research_brief','case_plan']},
  general:{source:'family_answer',purpose:'Capture an unclassified active issue until the responsible route is identified.',consumers:['research_brief','operator_follow_up']},
  route_input:{source:'family_answer',purpose:'Resolve a required or blocking fact from a currently verified route.',consumers:['route_match','route_review','case_plan']},
  evidence:{source:'family_answer',purpose:'Measure access, awareness and navigation outcomes without deciding eligibility.',consumers:['evidence_analytics','pilot_reporting']},
  future_signal:{source:'family_answer',purpose:'Record a possible later need without activating matching or a plan.',consumers:['future_opportunity','lead_analytics','operator_follow_up']},
  consent:{source:'family_answer',purpose:'Record purpose-specific permission for relevant updates or outcome follow-up.',consumers:['lead_consent','future_opportunity','operator_follow_up']},
  operator_signal:{source:'operator_observation',purpose:'Control whether this call ends after the active need, adds three evidence questions, or explores a need the family raised.',consumers:['interview_branching','operational_quality']},
  operator_note:{source:'operator_note',purpose:'Preserve operator context verbatim without treating it as a confirmed route fact.',consumers:['research_brief','operator_follow_up','interview_revision']},
};
const fields={};
for(const [group,keys] of Object.entries(groups))for(const key of keys){
  const policy=groupPolicy[group];
  fields[key]=Object.freeze({key,group,...policy,privacy:'private_operational',correction:'reopen_interview_and_resave_with_revision'});
}
fields.main_status=Object.freeze({...fields.main_status,source:'derived',purpose:'Canonical mirror of primary_situation for verified route criteria.'});
const aliases={
  entry_service_awareness:['prior_awareness'],entry_service_self_navigation:['self_navigation'],entry_blockers:['access_barriers'],cross_service_needs_all:['other_needs_discovered'],private_daycare_awareness_all:['private_daycare_awareness'],vantaa_hobbies_awareness_all:['harrastusten_vantaa_awareness'],jobseeker:['jobseeker_active'],
};
function normalizeAnswers(input){
  const answers={...(input&&typeof input==='object'&&!Array.isArray(input)?input:{})};
  for(const [target,sources] of Object.entries(aliases)){if(answers[target]!==undefined)continue;for(const source of sources)if(answers[source]!==undefined){answers[target]=answers[source];break;}}
  if(answers.primary_situation&&!answers.main_status)answers.main_status=answers.primary_situation;
  if(typeof answers.household_child_count==='string'&&/^\d+$/.test(answers.household_child_count.trim()))answers.household_child_count=Number(answers.household_child_count.trim());
  if(typeof answers.household_child_ages==='string'){
    try{const ages=JSON.parse(answers.household_child_ages);if(Array.isArray(ages))answers.household_child_ages=ages}catch{}
  }
  return answers;
}
function researchTopics(routeTopics,answers){
  const topics=[...new Set((routeTopics||[]).filter(Boolean))];
  if(topics.includes('work')&&(answers?.work_search_scope==='Work plus training options'||['Yes','Maybe'].includes(answers?.apprenticeship)))topics.push('education');
  return [...new Set(topics)];
}
function buildSavePayload(input){
  const answers=normalizeAnswers(input.answers),topics=researchTopics(input.routeTopics,answers);
  return {action:'save_interview',lead_id:input.leadId,interview_type:topics.join('+'),interview_schema_version:SCHEMA_VERSION,answers,summary:input.summary||null,research_prompt:input.researchPrompt||null,next_action:input.nextAction?.trim()||null,next_follow_up_at:input.followUp||null,urgency:input.urgency||'normal',status:'completed'};
}
const scenarioBudgets=Object.freeze({
  one_specific_work:10,student_part_time_work:13,unemployed_work:14,work_plus_training:17,
  education:10,daycare:13,hobby:10,school_child:12,program:14,service_support:10,general_or_mixed:16,
});
root.AqoonInterviewContract=Object.freeze({SCHEMA_VERSION,groups:Object.freeze(groups),fields:Object.freeze(fields),aliases:Object.freeze(aliases),scenarioBudgets,normalizeAnswers,researchTopics,buildSavePayload});
})(typeof window!=='undefined'?window:globalThis);

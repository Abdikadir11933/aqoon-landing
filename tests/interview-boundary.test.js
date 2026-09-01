const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('raw intake cannot load the verified-route preview', () => {
  const preview = read('tracker/interview-match-preview.js');
  const intake = read('tracker/incomplete-intake.js');
  assert.match(preview, /if\(!interviewCompleted\(\)\)/);
  assert.match(preview, /once this first interview is saved/);
  assert.doesNotMatch(intake, /match_preview/);
});

test('first interviews only reveal prior context when it actually exists', () => {
  const context = read('tracker/interview-context.js');
  assert.match(context, /if\(!summary&&!prompt&&!nextAction\)\{host\.innerHTML='';host\.classList\.add\('hidden'\);return\}/);
  assert.match(context, /Previous interview & research/);
});

test('interview UI describes topics, not pre-decided routes', () => {
  const interview = read('tracker/interview-match.js');
  assert.match(interview, /Interview topics:/);
  assert.match(interview, /Save first interview & prepare research brief/);
});

test('a call cannot move an unfinished interview into follow-up or resolution', () => {
  const admin = read('supabase/functions/family-leads-admin/index.ts');
  const queue = read('tracker/crm-queue-navigation.js');
  assert.match(admin, /select\("id,status,journey_stage,interview_status"\)/);
  assert.match(admin, /current\.interview_status\s*===\s*"completed"/);
  assert.match(admin, /completed_interview_required/);
  assert.match(queue, /return-to-first-contact/);
  assert.match(queue, /Interview still required/);
});

test('no matching decision (preview or a saved match run) can be produced before a completed first interview', () => {
  const admin = read('supabase/functions/family-leads-admin/index.ts');
  const review = read('supabase/functions/family-route-review-admin/index.ts');
  assert.match(admin, /action\s*===\s*"match_preview"[\s\S]*lead\.interview_status\s*!==\s*"completed"[\s\S]*first_interview_required/);
  assert.match(review, /eq\("status",\s*"completed"\)/);
  assert.match(review, /if \(!interview\) return new Response\(JSON\.stringify\(\{ error: "first_interview_required" \}\)/);
});

test('route preview respects route scope and never uses a route with a stale source', () => {
  const admin = read('supabase/functions/family-leads-admin/index.ts');
  assert.match(admin, /scopeCity\s*=\s*String\(r\.scope\?\.city\s*\|\|\s*r\.scope\?\.municipality\s*\|\|\s*""\)\.toLowerCase\(\)/);
  assert.match(admin, /s\.verification_state\s*===\s*"verified"/);
  assert.match(admin, /new Date\(s\.recheck_after\)\.getTime\(\)\s*>\s*now/);
  assert.match(admin, /evaluateRouteCriteria\(r\.knowledge_criteria\s*\|\|\s*\[\],\s*val\)/);
});

test('route preview does not inject a duplicate question when an equivalent interview fact exists', () => {
  const preview = read('tracker/interview-match-preview.js');
  assert.match(preview, /UI_EQUIVALENTS/);
  assert.match(preview, /preferred_provider_or_area:\['preferred_provider_or_area','preferred_area'\]/);
  assert.match(preview, /equivalents\.some\(k=>questions\.querySelector/);
});

test('follow-up starts with one canonical decision brief', () => {
  const queue = read('tracker/crm-queue-navigation.js');
  assert.match(queue, /renderDecisionBrief\(panelContent, lead\)/);
  assert.match(queue, /className = 'panel-section decision-brief'/);
  assert.match(queue, /family-case-lifecycle-admin/);
  assert.doesNotMatch(queue, /interview-recap-primary/);
});

test('case-plan controls stay hidden until the first interview is completed', () => {
  const lifecycle = read('tracker/case-lifecycle.js');
  assert.match(lifecycle, /lead\?\.interview_status!==['"]completed['"]/);
  assert.match(lifecycle, /\$\(['"]caseLifecycle['"]\)\?\.remove\(\)/);
});

test('work interviews branch around the person situation before asking eligibility questions', () => {
  const interview = read('tracker/interview-match.js');
  assert.match(interview, /case_subject/);
  assert.match(interview, /current_situation/);
  assert.match(interview, /immediate_goal/);
  assert.match(interview, /child_stage/);
  assert.match(interview, /household_schedule/);
  assert.match(interview, /primary_situation/);
  assert.match(interview, /student_schedule/);
  assert.match(interview, /student_benefit_context/);
  assert.match(interview, /current_work_hours/);
  assert.match(interview, /student-studying/);
  assert.match(interview, /setBranch\('jobseeker',situation==='Unemployed \/ seeking work'\)/);
});

test('saved interview summary is plain-language context, not a technical route count', () => {
  const interview = read('tracker/interview-match.js');
  assert.match(interview, /function summary\(a(?:,notes='')?\)/);
  assert.match(interview, /adult situation: '\+a\.primary_situation/);
  assert.match(interview, /summary:summary\(a\)/);
  assert.doesNotMatch(interview, /summary:'Routes: '\+C\.routes/);
});

test('education interviews distinguish entry reason and study barriers', () => {
  const interview = read('tracker/interview-match.js');
  assert.match(interview, /education_entry_reason/);
  assert.match(interview, /education_barriers/);
  assert.match(interview, /Starting first Finnish study/);
  assert.match(interview, /Changing study path/);
  assert.match(interview, /study barriers: '\+\(Array\.isArray\(a\.education_barriers\)/);
});

test('child interviews distinguish care, school and activity scenarios', () => {
  const interview = read('tracker/interview-match.js');
  assert.match(interview, /care_reason/);
  assert.match(interview, /care_start_urgency/);
  assert.match(interview, /school_situation/);
  assert.match(interview, /school_decision_needed/);
  assert.match(interview, /activity_goal/);
});

test('programme, authority and other interviews identify the problem before route research', () => {
  const interview = read('tracker/interview-match.js');
  assert.match(interview, /program_reason/);
  assert.match(interview, /program_constraints/);
  assert.match(interview, /authority_issue/);
  assert.match(interview, /authority_goal/);
  assert.match(interview, /issue_context/);
  assert.match(interview, /desired_help/);
});

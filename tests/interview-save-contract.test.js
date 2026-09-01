const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('completed v5 work interview requires operational and scenario anchors', async () => {
  const { validateCompletedInterview, CURRENT_INTERVIEW_SCHEMA } = await import('../supabase/functions/_shared/interview-save-contract.mjs');
  const base = {
    status: 'completed', schemaVersion: CURRENT_INTERVIEW_SCHEMA, interviewType: 'work',
    nextAction: 'Review matches and call back',
    answers: {
      primary_situation: 'Working', work_search_scope: 'One specific job / pilot / shift',
      work_intent: 'Part-time', right_to_work_known: 'Yes', availability: ['Day'],
      start_when: 'Immediately', travel_limit: '~30 min', childcare_limit: 'None',
    },
  };
  assert.deepEqual(validateCompletedInterview(base), []);
  assert.deepEqual(validateCompletedInterview({ ...base, nextAction: '' }), ['next_action']);
  assert.deepEqual(validateCompletedInterview({ ...base, schemaVersion: null }), ['interview_schema_version']);
});

test('work plus training requires the three decisive training facts', async () => {
  const { validateCompletedInterview, CURRENT_INTERVIEW_SCHEMA } = await import('../supabase/functions/_shared/interview-save-contract.mjs');
  const missing = validateCompletedInterview({
    status: 'completed', schemaVersion: CURRENT_INTERVIEW_SCHEMA, interviewType: 'work+education',
    nextAction: 'Research work-linked education',
    answers: {
      primary_situation: 'Unemployed / seeking work', work_search_scope: 'Work plus training options',
      work_intent: 'Part-time', right_to_work_known: 'Yes', availability: ['Day'],
      start_when: 'Immediately', travel_limit: '~30 min', childcare_limit: 'Daytime only',
      jobseeker_active: 'Yes – active', unemployment_duration: 'Under 3 months',
      employment_plan: 'Yes', palkkatuki: 'Not sure', education_entry_reason: 'Starting first Finnish study',
    },
  });
  assert.deepEqual(missing, ['qualification_status', 'work_study_route', 'training_schedule']);

  const complete = validateCompletedInterview({
    status: 'completed', schemaVersion: CURRENT_INTERVIEW_SCHEMA, interviewType: 'work+education',
    nextAction: 'Research work-linked education',
    answers: {
      primary_situation: 'Unemployed / seeking work', work_search_scope: 'Work plus training options',
      work_intent: 'Part-time', right_to_work_known: 'Yes', availability: ['Day'],
      start_when: 'Immediately', travel_limit: '~30 min', childcare_limit: 'Daytime only',
      jobseeker_active: 'Yes – active', unemployment_duration: 'Under 3 months',
      employment_plan: 'Yes', palkkatuki: 'Not sure',
      qualification_status: 'No Finnish qualification',
      work_study_route: 'Apprenticeship or work-linked study',
      training_schedule: 'Daytime only',
    },
  });
  assert.deepEqual(complete, []);
});

test('a genuine education intake still requires the education anchor', async () => {
  const { validateCompletedInterview, CURRENT_INTERVIEW_SCHEMA } = await import('../supabase/functions/_shared/interview-save-contract.mjs');
  const errors = validateCompletedInterview({
    status: 'completed', schemaVersion: CURRENT_INTERVIEW_SCHEMA, interviewType: 'education',
    nextAction: 'Review education routes', answers: {},
  });
  assert.deepEqual(errors, ['education_entry_reason']);
});

test('drafts remain saveable without pretending to be completed interviews', async () => {
  const { validateCompletedInterview } = await import('../supabase/functions/_shared/interview-save-contract.mjs');
  assert.deepEqual(validateCompletedInterview({ status: 'draft' }), []);
});

test('historical completed interviews are explicitly marked, never mislabeled as v5', () => {
  const migration = read('supabase/migrations/20260901233000_tag_legacy_unversioned_interviews.sql');
  assert.match(migration, /interview_schema_version\s*=\s*'legacy-unversioned'/);
  assert.match(migration, /where status = 'completed'[\s\S]*nullif\(btrim\(interview_schema_version\)/);
  assert.doesNotMatch(migration, /interview_schema_version\s*=\s*'first-interview-v5'/);
  assert.match(migration, /validate constraint family_interviews_completed_schema_version_chk/);
});

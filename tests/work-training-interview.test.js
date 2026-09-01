const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const match = fs.readFileSync(path.join(root, 'tracker/interview-match.js'), 'utf8');
const contract = fs.readFileSync(path.join(root, 'tracker/interview-contract.js'), 'utf8');
const notes = fs.readFileSync(path.join(root, 'tracker/interview-smart-notes.js'), 'utf8');
const restore = fs.readFileSync(path.join(root, 'tracker/interview-answers-restore.js'), 'utf8');
const preview = fs.readFileSync(path.join(root, 'tracker/interview-match-preview.js'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20260901190000_work_linked_education_routes.sql'), 'utf8');

test('work plus training opens a short qualification branch and expands research to education', () => {
  assert.match(match, /qualification_status/);
  assert.match(match, /work_study_route/);
  assert.match(match, /training_schedule/);
  assert.match(match, /setBranch\('work-training',scope==='Work plus training options'\)/);
  assert.match(match, /function researchRoutes/);
  assert.doesNotMatch(contract, /cross_service_needs_all.*topics\.push/);
});

test('operator context is persisted and restored instead of living only in a generated prompt', () => {
  assert.match(match, /answerInput\.operator_context_notes=notes/);
  assert.match(match, /summary\(savedAnswers,notes\)/);
  assert.match(restore, /answers\.operator_context_notes/);
});

test('the complete interview is kept as a short-lived device draft until the database confirms save', () => {
  assert.match(notes, /DRAFT_TTL_MS=7\*24\*60\*60\*1000/);
  assert.match(notes, /function collectFields/);
  assert.match(notes, /canonical:/);
  assert.match(notes, /aqoon:auth-expired/);
  assert.match(notes, /aqoon:interview-saved/);
  assert.match(notes, /localStorage\.removeItem\(key\(\)\)/);
});

test('verified work-linked education routes retain human and authority gates', () => {
  assert.match(migration, /route\.finland\.oppisopimus/);
  assert.match(migration, /route\.finland\.vocational-labour-market-training/);
  assert.match(migration, /authority_confirmation/);
  assert.match(preview, /apprenticeship_workplace_status/);
  assert.match(preview, /current_training_opening/);
});

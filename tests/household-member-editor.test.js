const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('the authenticated list returns canonical households, people and needs together', () => {
  const backend = read('supabase/functions/family-leads-admin/index.ts');
  const app = read('tracker/app.js');
  assert.match(backend, /household_people: peopleResult\.data \|\| \[\]/);
  assert.match(backend, /family_needs: needsResult\.data \|\| \[\]/);
  assert.match(app, /get householdPeople\(\)/);
  assert.match(app, /get familyNeeds\(\)/);
});

test('operators can explicitly create a member and link only a need in the same household', () => {
  const backend = read('supabase/functions/family-leads-admin/index.ts');
  const migration = read('supabase/migrations/20260901210000_household_member_write_rpc.sql');
  assert.match(backend, /action === "save_household_member"/);
  assert.match(backend, /\.rpc\("aqoon_save_household_member"/);
  assert.match(backend, /\["adult", "child", "dependent", "other"\]\.includes\(role\)/);
  assert.match(migration, /where id = p_family_need_id and household_id = household_id_value/);
  assert.match(migration, /subject_person_id = person_row\.id/);
  assert.match(migration, /language plpgsql[\s\S]*security definer[\s\S]*set search_path = ''/);
});

test('age-band hints are never silently converted into people', () => {
  const ui = read('tracker/household-people.js');
  assert.match(ui, /age-band hints are not people/);
  assert.match(ui, /Only create a person when the operator has explicitly identified them/);
  assert.match(ui, /Do not turn a future age-band hint into a child record/);
  assert.doesNotMatch(ui, /family_people.*household_children/);
});

test('the household editor updates local state immediately after a confirmed save', () => {
  const ui = read('tracker/household-people.js');
  const app = read('tracker/app.js');
  assert.match(ui, /patchHouseholdLocal\?\.\(result\.person,result\.need\)/);
  assert.match(app, /function patchHouseholdLocal\(person,need\)/);
});

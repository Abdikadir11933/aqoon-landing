const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('the authenticated list returns canonical households, people and needs together', () => {
  const backend = read('supabase/functions/family-leads-admin/index.ts');
  const app = read('tracker/app.js');
  assert.match(backend, /household_people: peopleResult\.data \|\| \[\]/);
  assert.match(backend, /family_needs: needsResult\.data \|\| \[\]/);
  assert.match(app, /get householdPeople\(\)/);
  assert.match(app, /get familyNeeds\(\)/);
});

test('the contacted person is already included and is never offered as another adult', () => {
  const ui = read('tracker/household-people.js');
  assert.match(ui, /Contact person · included/);
  assert.match(ui, /person you are speaking with is already included/);
  assert.match(ui, /row\.role!==['"]contact['"]&&row\.role!==['"]child['"]/);
  assert.doesNotMatch(ui, /<option value="child">Child<\/option>/);
});

test('the normal family setup is parent gate, child count and one age field per child', () => {
  const ui = read('tracker/household-people.js');
  assert.match(ui, /Is the person you are speaking with a parent or guardian\?/);
  assert.match(ui, /How many children are in this household\?/);
  assert.match(ui, /data-child-age/);
  assert.match(ui, /No name needed/);
  assert.match(ui, /Which child is this request about\?/);
  assert.match(ui, /Add someone else/);
  assert.match(ui, /<span>optional<\/span>/);
  assert.match(ui, /childCountInput\?\.addEventListener\(['"]input['"]/);
  assert.match(ui, /childCountRenderTimer=setTimeout/);
  assert.match(ui, /#householdPeopleCard input,#householdPeopleCard select,#householdPeopleCard button\{min-height:44px\}/);
});

test('child rows use stable ids, batch atomically and update local canonical state', () => {
  const ui = read('tracker/household-people.js');
  assert.match(ui, /crypto\?\.randomUUID/);
  assert.match(ui, /action:'save_family_setup'/);
  assert.match(ui, /person_id:row\.personId\|\|row\.clientId/);
  assert.match(ui, /result\.children\|\|\[\]/);
  assert.match(ui, /patchHouseholdLocal\?\.\(person,null\)/);
  assert.match(ui, /result\.needs\|\|\[\]/);
  assert.match(ui, /patchHouseholdLocal\?\.\(null,\{\.\.\.existing,\.\.\.linkedNeed\}\)/);
});

test('saved children cannot be silently removed by reducing the count', () => {
  const ui = read('tracker/household-people.js');
  assert.match(ui, /Math\.max\(savedCount/);
  assert.match(ui, /Saved children are never removed by changing this number/);
  assert.match(ui, /The number cannot remove children already saved/);
  assert.doesNotMatch(ui, /action:'delete_household/);
  assert.match(ui, /if\(s\.subjectKey&&subjectRowIndex\(s\)<0\)s\.subjectKey=''/);
});

test('parent status stays separate from explicit children and child-led cases still identify a child', () => {
  const ui = read('tracker/household-people.js');
  assert.doesNotMatch(ui, /s\.parent===['"]No['"]\)setChoiceSource\(['"]household_children['"],['"]No children['"]\)/);
  assert.match(ui, /const show=s\.parent===['"]Yes['"]\|\|\(isChildRoute\(\)&&!!s\.parent\)/);
  assert.match(ui, /const requiresChildren=s\.parent===['"]Yes['"]\|\|isChildRoute\(\)/);
  assert.match(ui, /subjectRowIndex\(s\)<0/);
  assert.match(ui, /parent:existingParent,/);
  assert.doesNotMatch(ui, /saved\.length\?['"]Yes['"]/);
});

test('only one active child-domain need can be linked and existing labels are preserved', () => {
  const ui = read('tracker/household-people.js');
  assert.match(ui, /const CHILD_NEED_DOMAINS=\{daycare:['"]daycare['"],school_child:['"]school['"],hobby:['"]hobby['"]\}/);
  assert.match(ui, /need\.source_lead_id===leadId&&need\.status===['"]active['"]&&expected\.has\(need\.need_domain\)/);
  assert.match(ui, /return needs\.length===1\?needs\[0\]:null/);
  assert.match(ui, /display_label:row\.displayLabel\|\|\(['"]Child ['"]\+\(index\+1\)\)/);
  assert.doesNotMatch(ui, /primary_need_id/);
});

test('unknown ages clear stale derived facts instead of inventing absence', () => {
  const ui = read('tracker/household-people.js');
  assert.match(ui, /else setChoiceSource\(['"]household_children['"],\[\]\)/);
  assert.match(ui, /otherRows\.length\?\[\]:['"]No other children['"]/);
  assert.match(ui, /else if\(sourceControl\(['"]youngest_child_age['"]\)\)setInputSource\(['"]youngest_child_age['"],['"]['"]\)/);
  assert.doesNotMatch(ui, /setChoiceSource\(['"]parent_status['"]/);
});

test('explicit child ages may derive legacy answer bands but old hints never create people', () => {
  const ui = read('tracker/household-people.js');
  assert.match(ui, /function childBands\(rows\)/);
  assert.match(ui, /setChoiceSource\('household_children',bands\)/);
  assert.match(ui, /rows:saved\.map/);
  assert.match(ui, /ensureRows\(s,requested\)/);
  assert.doesNotMatch(ui, /family_people.*household_children/);
});

test('age-band derivation handles boundaries without a browser', () => {
  const ui = read('tracker/household-people.js');
  const document = {
    createElement: () => ({ textContent: '' }),
    head: { appendChild() {} },
    querySelector: () => null,
    getElementById: () => null,
    addEventListener() {},
  };
  const window = {
    document,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000000' },
    openInterview() {},
    addEventListener() {},
  };
  const context = {
    window, document, Event: class {},
    MutationObserver: class { observe() {} },
    setTimeout: () => 0, clearTimeout() {}, Uint8Array,
  };
  vm.runInNewContext(ui, context);
  const { ageBand } = window.AqoonHouseholdSetup;
  assert.equal(ageBand(0), 'Under 3');
  assert.equal(ageBand(2), 'Under 3');
  assert.equal(ageBand(3), 'Age 3–6');
  assert.equal(ageBand(6), 'Age 3–6');
  assert.equal(ageBand(7), 'Grades 1–9');
  assert.equal(ageBand(16), 'Older children');
  assert.equal(ageBand(18), 'Adult');
  assert.equal(ageBand(''), null);
});

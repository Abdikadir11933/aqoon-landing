const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('the deep-research answer has a place to land on the case plan instead of only a Copy button', () => {
  const lifecycle = read('tracker/case-lifecycle.js');
  // interview-match.js's prompt() asks the researcher to end their answer
  // with a fenced AQOON_SCENARIO_JSON block. Before this, that answer had
  // nowhere to go except a manually retyped plan title - parseScenarioJson
  // pulls the block out and savePastedResearch stores it on the plan's
  // existing selected_option jsonb column (family-case-lifecycle-admin's
  // save_plan already accepts arbitrary selected_option - no schema change,
  // no Edge Function redeploy needed).
  assert.match(lifecycle, /function parseScenarioJson\(text\)\{/);
  assert.match(lifecycle, /const marker=text\.indexOf\('AQOON_SCENARIO_JSON'\)/);
  // A malformed or missing block must not lose what the operator pasted -
  // it has to fall back to the raw text, never silently discard the paste.
  assert.match(lifecycle, /const parsed=parseScenarioJson\(text\),selected_option=parsed\|\|\{raw:text\}/);
  // Landing a verified answer should move a plan out of bare "research"
  // into "options ready to present" - the label operators already read as
  // "there's something here to show the family".
  assert.match(lifecycle, /const plan_status=plan\.plan_status==='research'\?'options_ready':plan\.plan_status/);
});

test('case-lifecycle.js styles the paste-research and verified-answer panels', () => {
  const lifecycle = read('tracker/case-lifecycle.js');
  assert.match(lifecycle, /\.plan-paste\{/);
  assert.match(lifecycle, /\.verified-answer\{/);
});

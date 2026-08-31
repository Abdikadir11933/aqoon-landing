const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const edgeFunction = fs.readFileSync('supabase/functions/family-incomplete-admin/index.ts', 'utf8');
const queue = fs.readFileSync('tracker/crm-queue-navigation.js', 'utf8');
const callOutcomes = fs.readFileSync('tracker/call-outcomes.js', 'utf8');
const incompleteIntake = fs.readFileSync('tracker/incomplete-intake.js', 'utf8');

test('logging a call outcome on an incomplete intake never creates a family_leads row - the buggy shortcut is gone', () => {
  assert.doesNotMatch(edgeFunction, /action==="create_contact_case"/);
  assert.doesNotMatch(incompleteIntake, /createContactCase/);
  assert.doesNotMatch(queue, /createContactCase/);
});

test('log_call records the outcome on the still-incomplete contact, not on family_leads', () => {
  assert.match(edgeFunction, /action==="log_call"/);
  const block = edgeFunction.slice(edgeFunction.indexOf('action==="log_call"'), edgeFunction.indexOf('action==="complete"'));
  assert.match(block, /family_intake_contacts"\)\.update/);
  assert.doesNotMatch(block, /family_leads"\)\.insert/);
  assert.match(block, /invalid_call_outcome/);
  assert.match(block, /future_follow_up_required/);
});

test('finishing the intake is the only thing that creates/updates family_leads and moves the queue', () => {
  const block = edgeFunction.slice(edgeFunction.indexOf('action==="complete"'));
  assert.match(block, /if\(!id\|\|!city\|\|!main\|\|!sub\)return new Response\(JSON\.stringify\(\{error:"missing_fields"\}/);
  assert.match(block, /family_leads"\)\.insert|family_leads"\)\.update/);
});

test('a call already logged on the intake carries forward into real call history once the intake is finished', () => {
  const block = edgeFunction.slice(edgeFunction.indexOf('action==="complete"'));
  assert.match(block, /if\(contact\.last_call_outcome\)/);
  assert.match(block, /family_call_log"\)\.insert/);
});

test('the incomplete panel logs outcomes through a dedicated intake target, not the leads endpoint', () => {
  assert.match(queue, /data-action="call-incomplete"/);
  assert.match(queue, /logAction = isIncomplete \? 'log-outcome-incomplete' : 'log-outcome'/);
  assert.match(queue, /data-action="\$\{logAction\}"/);
  assert.match(queue, /AqoonCallOutcomes\?\.openForIntake/);
  assert.match(queue, /AqoonCallOutcomes\?\.callLead/);
  assert.match(queue, /AqoonCallOutcomes\?\.openForLead/);
});

test('logging "spoke to them" on an incomplete intake hands off to Finish intake instead of creating a case itself', () => {
  const block = queue.slice(queue.indexOf("action === 'log-outcome-incomplete'"), queue.indexOf("action === 'log-outcome'"));
  assert.doesNotMatch(block, /createContactCase/);
  assert.match(block, /AqoonIncompleteIntake\?\.open\(lead\)/);
});

test('call-outcomes.js routes intake-kind logging to family-incomplete-admin\'s log_call, not record_call_outcome', () => {
  assert.match(callOutcomes, /ACTIONS\s*=\s*\{lead:'record_call_outcome',intake:'log_call'\}/);
  assert.match(callOutcomes, /family-incomplete-admin/);
  assert.match(callOutcomes, /function openForIntake/);
});

test('dialing an incomplete intake never creates a case or advances the queue by itself - only finishing the intake does', () => {
  const callIncompleteBlock = queue.slice(
    queue.indexOf("action === 'call-incomplete'"),
    queue.indexOf("action === 'start-interview'")
  );
  assert.doesNotMatch(callIncompleteBlock, /createContactCase/);
  assert.match(callIncompleteBlock, /AqoonCallOutcomes\?\.callLead\(lead\?\.id/);
});

test('incomplete-intake requests carry the operator auth token', () => {
  assert.match(incompleteIntake, /aqoon_auth_token/);
  assert.match(incompleteIntake, /headers\.Authorization\s*=\s*'Bearer '\s*\+\s*token/);
});

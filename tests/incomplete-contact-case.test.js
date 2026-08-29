const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const edgeFunction = fs.readFileSync('supabase/functions/family-incomplete-admin/index.ts', 'utf8');
const queue = fs.readFileSync('tracker/crm-queue-navigation.js', 'utf8');

test('the first incomplete-intake call creates a minimal contact case without inventing facts', () => {
  assert.match(edgeFunction, /action==="create_contact_case"/);
  assert.match(edgeFunction, /city:clean\(contact\.city,100\)\|\|"Not asked yet"/);
  assert.match(edgeFunction, /main_need:clean\(contact\.main_need,100\)\|\|"Not asked yet"/);
  assert.match(edgeFunction, /sub_need:clean\(contact\.sub_need,300\)\|\|"Not asked yet"/);
  assert.match(edgeFunction, /source:"operator-contact-before-intake"/);
});

test('the incomplete panel offers call outcomes through the shared history workflow', () => {
  assert.match(queue, /data-action="call-incomplete"/);
  assert.match(queue, /logAction = isIncomplete \? 'log-outcome-incomplete' : 'log-outcome'/);
  assert.match(queue, /data-action="\$\{logAction\}"/);
  assert.match(queue, /createContactCase\(lead, operatorId\)/);
  assert.match(queue, /AqoonCallOutcomes\?\.callLead/);
  assert.match(queue, /AqoonCallOutcomes\?\.openForLead/);
});

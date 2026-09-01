const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('successful interview save moves the local case to follow-up without blocking on a full CRM refresh', () => {
  const app = read('tracker/app.js');
  const interview = read('tracker/interview-match.js');
  const queues = read('tracker/crm-queue-navigation.js');

  assert.match(app, /refresh:\(\)=>load\(true\)/);
  assert.match(app, /async function load\(force=false\)/);
  assert.match(interview, /C\.lead\.status='contacted'/);
  assert.match(interview, /C\.lead\.interview_status='completed'/);
  assert.match(interview, /AqoonApp\?\.patchLeadLocal\?\.\(C\.lead\.id/);
  assert.doesNotMatch(interview, /await window\.AqoonApp\?\.refresh\?\.\(\)/);
  assert.match(queues, /addEventListener\('aqoon:interview-saved'/);
  assert.match(queues, /expandedPhase = 'in_progress'/);
});

test('device draft and CRM save states cannot be confused', () => {
  const notes = read('tracker/interview-smart-notes.js');
  const ux = read('tracker/interview-ux-v4.js');

  assert.match(notes, /Draft only: not yet saved in CRM/);
  assert.match(notes, /Unsaved device draft restored\. Press Save interview/);
  assert.match(notes, /Saved in CRM ✓/);
  assert.match(ux, /Saved in CRM ✓/);
});

test('possible routes persist a research draft and require evidence before operator selection', () => {
  const flow = read('tracker/followup-workflow-v2.js');

  assert.match(flow, /provisional_route:true/);
  assert.match(flow, /plan_status:'research'/);
  assert.match(flow, /Copy focused research prompt/);
  assert.match(flow, /Paste the deep-research answer here/);
  assert.match(flow, /Save the research answer before making the final operator choice/);
  assert.match(flow, /Use as plan, confirmations remain/);
  assert.match(flow, /plan_status:'options_ready'/);
  assert.match(flow, /plan\.selected_option\?\.provisional_route\)renderResearch\(plan\)/);
  assert.match(flow, /\['Review','Agree','Action','Result','Outcome'\]/);
});

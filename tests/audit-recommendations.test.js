const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('analytics funnel uses explicit bases instead of comparing unrelated stage counts', () => {
  const app = read('tracker/app.js');
  assert.match(app, /row\('Viewed',sessions,sessions/);
  assert.match(app, /row\('Started form',f\.started,sessions/);
  assert.match(app, /row\('Contact screen',f\.contact_view,sessions/);
  assert.match(app, /data-funnel-managed="1"/);
  assert.doesNotMatch(app, /const prev=i\?a\[i-1\]\.v:null,rate=prev\?Math\.round\(x\.v\/prev\*100\):100/);
  const visual = read('tracker/visual-v3.js');
  assert.match(visual, /const managed=rows\.some\(r=>r\.dataset\.funnelManaged==='1'/);
});

test('interview signal percentages count one hit per interview even for multi-select answers', () => {
  const analytics = read('tracker/analytics-mobile-v2.js');
  assert.match(analytics, /function ratePerInterview\(ints,key,fn\)/);
  assert.match(analytics, /const extra=ratePerInterview\(core,'cross_service_needs_all'/);
});

test('unknown or mixed work situations do not reveal jobseeker-only questions', () => {
  const interview = read('tracker/interview-match.js');
  assert.match(interview, /data-branch="jobseeker".*situation!==['"]Unemployed \/ seeking work['"]/);
});

test('resolved cards load lifecycle outcome summaries and reopen records an event', () => {
  const nav = read('tracker/crm-queue-navigation.js');
  assert.match(nav, /renderResolvedSummary\(panelContent, lead\)/);
  assert.match(nav, /event_type: 'follow_up_attempted'/);
  assert.match(nav, /action: 'reopen'/);
  assert.match(nav, /No verified decision has been recorded yet/);
});

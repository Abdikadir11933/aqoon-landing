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
  assert.match(interview, /setBranch\('jobseeker',situation==='Unemployed \/ seeking work'\)/);
});

test('resolved cards load lifecycle outcome summaries and reopen transactionally', () => {
  const nav = read('tracker/crm-queue-navigation.js');
  assert.match(nav, /renderResolvedSummary\(panelContent, lead\)/);
  assert.match(nav, /AqoonCaseLifecycle\?\.reopenCase\(leadId/);
  assert.match(nav, /No verified decision has been recorded yet/);
  const lifecycle = read('tracker/case-lifecycle.js');
  assert.match(lifecycle, /async function reopenCase\(leadId,note\)/);
  assert.match(lifecycle, /action:'reopen_case'/);
  assert.match(lifecycle, /request_id:crypto\.randomUUID\(\)/);
});

test('reopening a resolved case attaches the case_plan_id the backend requires', () => {
  // The transactional reopen action still needs the closed plan id so its
  // event, CRM lead update and idempotency key share one database operation.
  const lifecycle = read('tracker/case-lifecycle.js');
  assert.match(lifecycle, /action:'reopen_case',lead_id:leadId,case_plan_id:plan\.id/);
  assert.doesNotMatch(read('tracker/crm-queue-navigation.js'), /event_type: 'follow_up_attempted'/);
});
test('cross-service needs reach the follow-up summary instead of a generic alert', () => {
  // hasPendingNeeds used to treat any non-empty cross_service_needs_all
  // array as "needs detected", including an array containing only the
  // explicit negative option ('Nothing else now') - a false positive that
  // pushed a "Log new needs" card for families who confirmed they had none.
  // The card's hint and the click alert also never said which needs were
  // actually found (ADR 0003 defect #15: interview data existed but never
  // reached the follow-up summary).
  const steps = read('tracker/interview-next-steps.js');
  assert.match(steps, /filter\(n=>n!=='Nothing else now'\)/);
  assert.match(steps, /hint:'Confirmed: '\+pendingNeeds\.join\(', '\)/);
  assert.match(steps, /needs:pendingNeeds/);
  assert.match(steps, /function handleAction\(action,lead,needs\)/);
  assert.match(steps, /'Confirmed needs: '\+\(needs&&needs\.length\?needs\.join\(', '\):/);
});

test('the "what changed" recap compares multi-select answers by content, not array identity', () => {
  // buildRecap() compares firstAnswers (from the saved interview) against
  // currentAnswers (freshly scraped from the DOM via scrapeCurrentAnswers()
  // on every toggle) - for any multi-select field those are always two
  // different array objects even when they hold identical choices, so a
  // plain !== flagged every multi-select field as "changed" regardless of
  // whether the operator had touched it.
  const recap = read('tracker/interview-follow-up-recap.js');
  assert.match(recap, /function valuesEqual\(a,b\)\{/);
  assert.match(recap, /if\(!valuesEqual\(first,current\)\)\{/);
  assert.doesNotMatch(recap, /if\(first!==current\)\{/);
});

test('opening an interview never throws from an undeclared variable', () => {
  // scenario-learning.js's window.openInterview wrapper assigned
  // activeLeadId without ever declaring it (no let/const/var) or reading
  // it anywhere in the file. Inside this IIFE's 'use strict', that is a
  // ReferenceError thrown on every single call - live-reproduced by
  // opening the synthetic interview drawer in production. Many other
  // tracker modules also wrap window.openInterview in a decorator chain
  // (case-lifecycle.js, interview-context.js, interview-match.js, ...);
  // any of them calling this one synchronously with no try/catch had
  // their own remaining logic silently skipped by the propagating throw.
  const scenario = read('tracker/scenario-learning.js');
  assert.doesNotMatch(scenario, /[^.\w]activeLeadId\s*=\s*id/);
});

test('the analytics consent dialog can actually be dismissed', () => {
  // analyticsChoice used to carry its layout as an inline style attribute
  // (style="...display:grid..."), which beats any external stylesheet rule
  // without !important - including caawi/app.css's own [hidden]{display:none}.
  // JS toggled the hidden attribute correctly on every click, but the dialog
  // never visually closed: every first-time /caawi visitor got stuck behind
  // an undismissable full-viewport overlay. Fix moves the layout into a real
  // .analytics-choice / .analytics-choice[hidden] CSS pair, the same pattern
  // .leave-modal already uses correctly two lines above it.
  const html = read('caawi/index.html');
  const dialogTag = html.match(/<div class="analytics-choice"[^>]*>/)[0];
  assert.doesNotMatch(dialogTag, /style="/);
  const css = read('caawi/app.css');
  assert.match(css, /\.analytics-choice\{[^}]*display:grid/);
  assert.match(css, /\.analytics-choice\[hidden\]\{display:none\}/);
});

test('completed follow-up queue opens the workspace instead of premature resolution', () => {
  const queue = read('tracker/crm-queue-navigation.js');
  assert.match(queue, /Open research & case plan/);
  assert.doesNotMatch(queue, /data-action="mark-resolved"/);
  assert.match(queue, /className='panel-section follow-up-plan'/);
});

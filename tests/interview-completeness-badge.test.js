const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('interview-match.js exposes a live "answered / total" completeness badge, not just a save-time gate', () => {
  const interview = read('tracker/interview-match.js');
  // missing() already existed but was only ever read inside save() - an
  // operator had no way to see how much of the matching criteria was filled
  // in until they clicked Save and got bounced to the first gap.
  // renderCompleteness() reuses the same missing()/collect() logic so the
  // two can never disagree, and is wired via delegated click/input
  // listeners on the static #questions container so it updates regardless
  // of which script (interview-match.js, universal-proof-questions.js, ...)
  // rendered the field that changed.
  assert.match(interview, /function renderCompleteness\(\)\{/);
  assert.match(interview, /total=host\.querySelectorAll\('\.match-extra\[data-match-required="1"\]:not\(\.hidden\)'\)\.length/);
  assert.match(interview, /total-missing\(collect\(\)\)\.length/);
  assert.match(interview, /\$\('questions'\)\?\.addEventListener\('click',renderCompleteness\)/);
  assert.match(interview, /\$\('questions'\)\?\.addEventListener\('input',renderCompleteness\)/);
  // Must also run once when a lead's fields are first built, not only after
  // the first click/input - otherwise the badge is blank on open.
  assert.match(interview, /\$\('saveInterview'\)\.onclick=save;collapseIfComplete\(lead\);renderCompleteness\(\)/);
});

test('a completed interview collapses into one line so the case plan is not buried below it', () => {
  const interview = read('tracker/interview-match.js');
  const lifecycle = read('tracker/case-lifecycle.js');
  // A returning operator opening an already-completed interview used to see
  // the full live question set (and its Save button, research brief, case
  // plan...) below several screens of answers they had usually already
  // read. A brand-new interview (nothing completed yet) must stay fully
  // expanded - every field still needs filling in, there is nothing to
  // collapse to.
  assert.match(interview, /function collapseIfComplete\(lead\)\{/);
  assert.match(interview, /if\(lead\.interview_status!=='completed'\)/);
  assert.match(interview, /details\.id='interviewQaCollapse'/);
  // When the badge is inside the collapsed <details>, its count moves into
  // the <summary> text instead - a badge prepended inside #questions would
  // be invisible while the details is closed.
  assert.match(interview, /if\(wrap\)\{const summary=wrap\.querySelector\('summary'\)/);
  // The case plan is the reason to collapse the interview at all - it must
  // move above the (now collapsed) question list, not stay buried below the
  // Save button and research brief.
  assert.match(lifecycle, /if\(lead\?\.interview_status==='completed'&&capture\)\{capture\.after\(el\);return el\}/);
});

test('app.css styles .match-completeness with a distinct complete state', () => {
  const css = read('tracker/app.css');
  assert.match(css, /\.match-completeness\{/);
  assert.match(css, /\.match-completeness\.complete\{/);
});

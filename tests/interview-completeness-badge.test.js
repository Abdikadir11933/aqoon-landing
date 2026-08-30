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
  assert.match(interview, /const total=host\.querySelectorAll\('\.match-extra\[data-match-required="1"\]:not\(\.hidden\)'\)\.length/);
  assert.match(interview, /const answered=total-missing\(collect\(\)\)\.length/);
  assert.match(interview, /\$\('questions'\)\?\.addEventListener\('click',renderCompleteness\)/);
  assert.match(interview, /\$\('questions'\)\?\.addEventListener\('input',renderCompleteness\)/);
  // Must also run once when a lead's fields are first built, not only after
  // the first click/input - otherwise the badge is blank on open.
  assert.match(interview, /\$\('saveInterview'\)\.onclick=save;renderCompleteness\(\)/);
});

test('app.css styles .match-completeness with a distinct complete state', () => {
  const css = read('tracker/app.css');
  assert.match(css, /\.match-completeness\{/);
  assert.match(css, /\.match-completeness\.complete\{/);
});

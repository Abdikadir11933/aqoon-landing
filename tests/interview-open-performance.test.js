const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

// Opening an interview used to trigger two full 'list' round-trips
// (interview-match.js's enhance() + interview-answers-restore.js) plus a
// 'programs' round-trip, re-fetching data that was already sitting in
// window.AqoonApp.leads/partials/programs - a real, reported contributor to
// the first-interview form feeling slow to open. These fields are read
// from AqoonApp synchronously instead now; guard against the fetches
// creeping back in.

test('interview-match.js reads the lead/programs already in memory instead of re-fetching them on every open', () => {
  const src = fs.readFileSync('tracker/interview-match.js', 'utf8');
  assert.doesNotMatch(src, /Promise\.all\(\[api\(\{action:'list'\}\),api\(\{action:'programs'\}\)\]\)/);
  assert.match(src, /window\.AqoonApp\?\.leads/);
  assert.match(src, /window\.AqoonApp\?\.programs/);
  assert.match(src, /function enhance\(id\)/); // no longer async
});

test('interview-answers-restore.js reads the lead already in memory instead of re-fetching the full leads list on every open', () => {
  const src = fs.readFileSync('tracker/interview-answers-restore.js', 'utf8');
  assert.doesNotMatch(src, /action:\s*'list'/);
  assert.doesNotMatch(src, /fetch\(/);
  assert.match(src, /window\.AqoonApp\?\.leads/);
});

test('app.js exposes programs on window.AqoonApp so other modules never need their own fetch for it', () => {
  const src = fs.readFileSync('tracker/app.js', 'utf8');
  assert.match(src, /get programs\(\)\{return programs\}/);
});

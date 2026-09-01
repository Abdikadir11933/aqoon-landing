const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase/migrations/20260901150000_interview_future_opportunity_signals.sql'), 'utf8');

test('future-demand signals keep interview provenance and correction-safe identity', () => {
  assert.match(sql, /source_interview_id uuid references public\.family_interviews\(id\) on delete cascade/);
  assert.match(sql, /on conflict \(source_interview_id, signal_key\)/);
  assert.match(sql, /not exists \([\s\S]*family_interview_opportunity_signals\(new\.answers\)/);
  assert.match(sql, /status = 'expired'/);
});

test('future contact permission comes from explicit interview permission', () => {
  assert.match(sql, /new\.answers->>'relevant_updates_ok'/);
  assert.match(sql, /when 'Yes' then 'granted'/);
  assert.match(sql, /when 'No' then 'declined'/);
  assert.match(sql, /else 'not_requested'/);
});

test('household opportunities are signals, never eligibility decisions or duplicate family records', () => {
  assert.match(sql, /family_future_opportunities/);
  assert.doesNotMatch(sql, /insert into public\.family_leads/i);
  assert.match(sql, /verify the need before acting/);
  assert.match(sql, /revoke all on function public\.family_interview_opportunity_signals\(jsonb\) from public, anon, authenticated/);
});

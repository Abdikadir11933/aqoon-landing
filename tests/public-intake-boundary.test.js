const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = path => fs.readFileSync(path, 'utf8');

test('final family intake requires explicit contact permission and a matching phone-first record', () => {
  const source = read('supabase/functions/family-intake-submit/index.ts');
  assert.match(source, /contactConsent=b\.contact_consent===true/);
  assert.match(source, /!contactConsent/);
  assert.match(source, /from\("family_intake_contacts"\)\.select\("id,phone"\)/);
  assert.match(source, /contact_start_required/);
  assert.match(source, /contact_consent_at:consentAt/);
});

test('public funnel analytics is IP-hash rate limited before inserting an event', () => {
  const source = read('supabase/functions/family-funnel-track/index.ts');
  const guard = source.indexOf('p_endpoint:"funnel_track"');
  const insert = source.indexOf('from("family_funnel_events").insert');
  assert.ok(guard > 0, 'funnel tracker must call the shared rate limiter');
  assert.ok(insert > guard, 'rate limiting must happen before the event insert');
  assert.match(source, /p_limit:120/);
});

test('retention helpers and intake consent columns are reproducible from migrations', () => {
  const migration = read('supabase/migrations/20260902090000_family_intake_consent_and_retention_reconciliation.sql');
  assert.match(migration, /family_intake_contacts[\s\S]*contact_consent_at/);
  assert.match(migration, /family_leads[\s\S]*contact_consent_at/);
  for (const fn of ['cleanup_family_intake_data', 'cleanup_old_interaction_events', 'cleanup_pending_erasure_users']) {
    assert.match(migration, new RegExp(`create or replace function public\\.${fn}\\(\\)`));
    assert.match(migration, new RegExp(`grant execute on function public\\.${fn}\\(\\) to service_role`));
  }
});

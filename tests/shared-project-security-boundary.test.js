const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').toLowerCase();

test('shared security-definer helpers pin search paths and hide the event trigger', () => {
  const sql = read('supabase/migrations/20260901235500_harden_shared_security_functions.sql');

  assert.match(sql, /alter function public\.increment_usage\(text, integer, integer, integer\)[\s\S]*set search_path = pg_catalog, public/);
  assert.match(sql, /alter function public\.increment_usage\(text, integer, integer, integer, integer\)[\s\S]*set search_path = pg_catalog, public/);
  assert.match(sql, /revoke all on function public\.rls_auto_enable\(\) from public/);
  assert.match(sql, /revoke all on function public\.rls_auto_enable\(\) from anon, authenticated/);
});

test('verified AqoonPRO RPCs and chunk tables are service-role only', () => {
  const sql = read('supabase/migrations/20260902000500_enforce_service_role_legacy_rpcs.sql');
  const functions = [
    'match_debt_chunks',
    'match_health_chunks',
    'match_kela_chunks',
    'match_labor_chunks',
    'match_lastensuojelu_chunks',
    'match_migri_chunks',
    'match_municipal_chunks',
    'match_oph_chunks',
  ];

  for (const fn of functions) {
    assert.match(sql, new RegExp(`revoke all on function public\\.${fn}\\([\\s\\S]*?from public, anon, authenticated`));
    assert.match(sql, new RegExp(`grant execute on function public\\.${fn}\\([\\s\\S]*?to service_role`));
  }

  assert.match(sql, /revoke all on function public\.increment_usage\(text, integer, integer, integer\)[\s\S]*from public, anon, authenticated/);
  assert.match(sql, /revoke all on function public\.increment_usage\(text, integer, integer, integer, integer\)[\s\S]*from public, anon, authenticated/);
  assert.match(sql, /revoke all on table[\s\S]*public\.knowledge_chunks[\s\S]*public\.debt_knowledge_chunks[\s\S]*from anon, authenticated/);
});

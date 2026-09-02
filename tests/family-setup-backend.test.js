const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const migrationPath = 'supabase/migrations/20260902142724_transactional_family_setup.sql';

test('family setup saves every explicitly supplied child in one database transaction', () => {
  const sql = read(migrationPath);
  assert.match(sql, /create or replace function public\.aqoon_save_family_setup\(\s*p_lead_id uuid,\s*p_children jsonb,\s*p_operator_id uuid\s*\)/);
  assert.match(sql, /jsonb_typeof\(p_children\) <> 'array'/);
  assert.match(sql, /jsonb_array_length\(p_children\) > 20/);
  assert.match(sql, /family_leads[\s\S]*where id = p_lead_id[\s\S]*for update/);
  assert.match(sql, /for child_item in[\s\S]*jsonb_array_elements\(p_children\)/);
  assert.match(sql, /insert into public\.family_people\(\s*id,[\s\S]*person_id_value,[\s\S]*'child'/);
  assert.match(sql, /update public\.family_people[\s\S]*where id = person_id_value/);
  assert.match(sql, /else person_row\.age_years[\s\S]*else person_row\.age_band/);
  assert.match(sql, /update public\.family_leads[\s\S]*last_actor_id = p_operator_id/);
  assert.match(sql, /'children', children_result,[\s\S]*'needs', needs_result/);
});

test('family setup requires stable unique IDs and validates existing child ownership and role', () => {
  const sql = read(migrationPath);
  assert.match(sql, /person_id_value is null[\s\S]*missing_child_person_id/);
  assert.match(sql, /where id = person_id_value\s+for update/);
  assert.match(sql, /if found then[\s\S]*person_row\.household_id <> household_id_value or person_row\.role <> 'child'/);
  assert.match(sql, /else[\s\S]*insert into public\.family_people\(\s*id,/);
  assert.match(sql, /duplicate_child_person_id/);
});

test('family setup validates every exact child age', () => {
  const sql = read(migrationPath);
  assert.match(sql, /age_years_value < 0 or age_years_value > 120/);
  assert.match(sql, /invalid_child_age/);
});

test('only an explicitly selected active need in the same household is linked to that child', () => {
  const sql = read(migrationPath);
  assert.match(sql, /family_need_id_value := nullif\(btrim\(child_item ->> 'family_need_id'\)/);
  assert.match(sql, /set subject_person_id = person_row\.id/);
  assert.match(sql, /where id = family_need_id_value\s+and household_id = household_id_value\s+and status = 'active'/);
  assert.match(sql, /duplicate_family_need_id/);
});

test('omitting a child never deletes or unlinks an existing household record', () => {
  const sql = read(migrationPath);
  assert.doesNotMatch(sql, /delete\s+from\s+public\.family_people/i);
  assert.doesNotMatch(sql, /subject_person_id\s*=\s*null/i);
  assert.match(sql, /Omitted existing children are intentionally left unchanged/);
});

test('family setup RPC is service-role only', () => {
  const sql = read(migrationPath);
  assert.match(sql, /language plpgsql[\s\S]*security definer[\s\S]*set search_path = ''/);
  assert.match(sql, /revoke all on function public\.aqoon_save_family_setup\(uuid, jsonb, uuid\)[\s\S]*from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.aqoon_save_family_setup\(uuid, jsonb, uuid\)[\s\S]*to service_role/);
});

test('authenticated operator action validates and forwards the family setup contract', () => {
  const edge = read('supabase/functions/family-leads-admin/index.ts');
  assert.match(edge, /action === "save_family_setup"/);
  assert.match(edge, /!uuidPattern\.test\(leadId\) \|\| !Array\.isArray\(rawChildren\) \|\| rawChildren\.length > 20/);
  assert.match(edge, /!personId \|\| !uuidPattern\.test\(personId\)/);
  assert.match(edge, /Number\.isInteger\(ageYears\)[\s\S]*ageYears < 0 \|\| ageYears > 120/);
  assert.match(edge, /db\.rpc\("aqoon_save_family_setup", \{[\s\S]*p_lead_id: leadId,[\s\S]*p_children: children,[\s\S]*p_operator_id: jwtOperatorId/);
  assert.doesNotMatch(edge, /const detail = setupResult\.error\.message/);
  assert.match(edge, /return new Response\(JSON\.stringify\(setupResult\.data\)/);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const inventoryPath = path.join(root, 'docs', 'architecture', 'generated-tracker-contract-inventory.json');

test('generated Tracker contract inventory is current', () => {
  const run = spawnSync(process.execPath, ['scripts/generate_tracker_contract_inventory.mjs', '--check'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr || run.stdout);
});

test('inventory covers the exact deployed Tracker script order and backend surface', () => {
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  const html = fs.readFileSync(path.join(root, 'tracker', 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"[^>]*><\/script>/g)].map(match => match[1]);
  assert.deepEqual(inventory.tracker_scripts.map(item => item.src), scripts);
  assert.ok(inventory.summary.tracker_scripts >= 20);
  assert.ok(inventory.summary.edge_functions >= 10);
  assert.ok(inventory.summary.edge_function_tables.includes('family_interviews'));
  assert.ok(inventory.summary.edge_function_tables.includes('family_case_plans'));
  assert.ok(inventory.summary.edge_function_tables.includes('sales_opportunities'));
  assert.ok(inventory.summary.edge_function_embedded_relation_tables.includes('knowledge_criteria'));
  assert.ok(inventory.summary.edge_function_database_surface.includes('knowledge_routes'));
  assert.ok(inventory.summary.frontend_edge_function_slugs.includes('family-leads-admin'));
  assert.ok(inventory.summary.frontend_edge_function_slugs.includes('family-case-lifecycle-admin'));
  const operatorNotes = inventory.answer_key_lineage.find(item => item.key === 'operator_context_notes');
  assert.ok(operatorNotes);
  assert.ok(operatorNotes.tracker_references.includes('tracker/interview-match.js'));
  assert.ok(operatorNotes.tracker_references.includes('tracker/interview-contract.js'));
});

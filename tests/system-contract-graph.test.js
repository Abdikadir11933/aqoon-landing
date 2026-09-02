const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const target = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});
const relative = file => path.relative(root, file).replaceAll(path.sep, '/');
const unique = values => [...new Set(values)].sort();

function edgeActions(source) {
  return new Set(unique([
    ...[...source.matchAll(/action\s*(?:===?|!==?)\s*["']([A-Za-z0-9_-]+)["']/g)].map(match => match[1]),
    ...[...source.matchAll(/\[([^\]]+)\]\.includes\(action\)/g)].flatMap(match => [...match[1].matchAll(/["']([A-Za-z0-9_-]+)["']/g)].map(item => item[1])),
  ]));
}

test('every local JavaScript asset referenced by a deployable HTML page exists and parses', () => {
  const files = walk(root).filter(file => file.endsWith('.html') && !file.includes(`${path.sep}.git${path.sep}`) && !file.includes(`${path.sep}design-ref${path.sep}`));
  const scripts = new Set();
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/g)) {
      const src = match[1].replace(/[?#].*$/, '');
      if (/^(?:https?:)?\/\//.test(src)) continue;
      const target = src.startsWith('/') ? path.join(root, src.slice(1)) : path.resolve(path.dirname(file), src);
      assert.ok(fs.existsSync(target), `${relative(file)} loads missing script ${src}`);
      scripts.add(target);
    }
  }
  assert.ok(scripts.size >= 30, 'expected the complete public and Tracker JavaScript surface');
  for (const file of scripts) {
    const run = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(run.status, 0, `${relative(file)} failed syntax check:\n${run.stderr || run.stdout}`);
  }
});

test('every frontend Supabase Edge Function URL resolves to a repository function', () => {
  const jsFiles = walk(root).filter(file => file.endsWith('.js') || file.endsWith('.mjs'));
  const slugs = unique(jsFiles.flatMap(file => [...fs.readFileSync(file, 'utf8').matchAll(/functions\/v1\/([A-Za-z0-9_-]+)/g)].map(match => match[1])));
  assert.ok(slugs.length >= 8);
  for (const slug of slugs) {
    assert.ok(fs.existsSync(path.join(root, 'supabase', 'functions', slug, 'index.ts')), `frontend calls missing Edge Function ${slug}`);
  }
});

test('every relative Edge Function import resolves inside the repository', () => {
  const entries = walk(path.join(root, 'supabase', 'functions')).filter(file => file.endsWith('.ts') || file.endsWith('.mjs'));
  for (const file of entries) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/(?:from\s+|import\s*)["'](\.{1,2}\/[^"']+)["']/g)) {
      const target = path.resolve(path.dirname(file), match[1]);
      assert.ok(fs.existsSync(target), `${relative(file)} imports missing ${match[1]}`);
    }
  }
});

test('literal frontend endpoint actions are implemented by their target Edge Function', () => {
  const trackerScripts = walk(path.join(root, 'tracker')).filter(file => file.endsWith('.js'));
  let checked = 0;
  for (const file of trackerScripts) {
    const source = fs.readFileSync(file, 'utf8');
    const endpoints = new Map([...source.matchAll(/const\s+([A-Z][A-Z0-9_]*)\s*=\s*["'][^"']*functions\/v1\/([A-Za-z0-9_-]+)["']/g)].map(match => [match[1], match[2]]));
    const calls = [];
    for (const match of source.matchAll(/(?:api|post)\(\s*([A-Z][A-Z0-9_]*)\s*,\s*\{[\s\S]{0,600}?\baction\s*:\s*["']([A-Za-z0-9_-]+)["']/g)) {
      if (endpoints.has(match[1])) calls.push([endpoints.get(match[1]), match[2]]);
    }
    if (endpoints.size === 1) {
      const slug = [...endpoints.values()][0];
      for (const match of source.matchAll(/\bapi\(\s*\{[\s\S]{0,300}?\baction\s*:\s*["']([A-Za-z0-9_-]+)["']/g)) calls.push([slug, match[1]]);
    }
    for (const [slug, action] of calls) {
      const edge = read(`supabase/functions/${slug}/index.ts`);
      assert.ok(edgeActions(edge).has(action), `${relative(file)} calls ${slug}:${action}, but the endpoint does not implement that action`);
      checked += 1;
    }
  }
  assert.ok(checked >= 20, 'expected literal action coverage across the active Tracker API clients');
});

test('every Edge table and RPC is owned by repository migrations', () => {
  const migrationSql = walk(path.join(root, 'supabase', 'migrations')).filter(file => file.endsWith('.sql')).map(file => fs.readFileSync(file, 'utf8')).join('\n');
  const entries = walk(path.join(root, 'supabase', 'functions')).filter(file => file.endsWith('index.ts'));
  for (const file of entries) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\.from\(\s*["']([A-Za-z0-9_]+)["']\s*\)/g)) {
      const table = match[1];
      assert.ok(new RegExp(`create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?(?:public\\.)?${table}\\b`, 'i').test(migrationSql), `${relative(file)} uses unversioned table ${table}`);
    }
    for (const match of source.matchAll(/\.rpc\(\s*["']([A-Za-z0-9_]+)["']/g)) {
      const rpc = match[1];
      assert.ok(new RegExp(`create\\s+(?:or\\s+replace\\s+)?function\\s+(?:public\\.)?${rpc}\\b`, 'i').test(migrationSql), `${relative(file)} calls unversioned RPC ${rpc}`);
    }
  }
});

test('the recovered baseline precedes migrations that reference its tables', () => {
  const files = fs.readdirSync(path.join(root, 'supabase', 'migrations')).filter(file => file.endsWith('.sql')).sort();
  const baseline = files.indexOf('20260826000000_recovered_operational_baseline.sql');
  assert.ok(baseline >= 0, 'recovered operational baseline is missing');
  assert.ok(baseline < files.indexOf('20260827_aqoon_operations_system.sql'));
  assert.ok(baseline < files.indexOf('20260828_aqoon_routing_intelligence_foundation.sql'));
});

test('the deployed Tracker uses one canonical follow-up owner', () => {
  const html = read('tracker/index.html');
  assert.match(html, /followup-workflow-v2\.js\?v=6/);
  assert.doesNotMatch(html, /followup-workflow-v1|followup-workflow\.js/);
  assert.equal((html.match(/followup-workflow-v2\.js/g) || []).length, 1);
});

test('service-role credentials and direct database clients stay out of browser code', () => {
  const browserFiles = [
    ...walk(path.join(root, 'tracker')).filter(file => file.endsWith('.js')),
    ...walk(path.join(root, 'caawi')).filter(file => file.endsWith('.js')),
    ...walk(path.join(root, 'assets')).filter(file => file.endsWith('.js')),
  ];
  for (const file of browserFiles) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /service[_-]?role/i, `${relative(file)} contains a service-role reference`);
    assert.doesNotMatch(source, /createClient\s*\(/, `${relative(file)} creates a direct database client`);
  }
});

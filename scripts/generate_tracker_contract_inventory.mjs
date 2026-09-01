#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const trackerRoot = path.join(root, 'tracker');
const functionsRoot = path.join(root, 'supabase', 'functions');
const migrationsRoot = path.join(root, 'supabase', 'migrations');
const outputPath = path.join(root, 'docs', 'architecture', 'generated-tracker-contract-inventory.json');

const read = file => fs.readFileSync(file, 'utf8');
const unique = values => [...new Set(values.filter(Boolean))].sort();
const matches = (text, regex, group = 1) => unique([...text.matchAll(regex)].map(match => match[group]));
const relative = file => path.relative(root, file).replaceAll(path.sep, '/');

function trackerInventory() {
  const html = read(path.join(trackerRoot, 'index.html'));
  const loadOrder = [...html.matchAll(/<script\s+src="([^"]+)"[^>]*><\/script>/g)]
    .map((match, index) => ({ order: index + 1, src: match[1] }));

  return loadOrder.map(item => {
    const file = path.join(root, item.src.replace(/^\//, '').replace(/\?.*$/, ''));
    const source = read(file);
    return {
      ...item,
      file: relative(file),
      lines: source.split('\n').length,
      edge_functions: matches(source, /functions\/v1\/([A-Za-z0-9_-]+)/g),
      api_actions: matches(source, /\baction\s*:\s*['"]([A-Za-z0-9_-]+)['"]/g),
      window_exports: matches(source, /window\.([A-Za-z0-9_$]+)\s*=/g),
      window_wrappers: unique([
        ...matches(source, /const\s+[A-Za-z0-9_$]+\s*=\s*window\.([A-Za-z0-9_$]+)/g),
        ...(source.includes('window.fetch=') || source.includes('window.fetch =') ? ['fetch'] : []),
      ]),
      listened_events: matches(source, /addEventListener\(\s*['"]([^'"]+)['"]/g),
      dispatched_events: unique([
        ...matches(source, /new\s+CustomEvent\(\s*['"]([^'"]+)['"]/g),
        ...matches(source, /new\s+Event\(\s*['"]([^'"]+)['"]/g),
      ]),
      answer_keys: unique([
        ...matches(source, /data-key=["']([A-Za-z0-9_:-]+)["']/g),
        ...matches(source, /\[['"]([A-Za-z0-9_:-]+)['"],\s*['"][^'"]+['"],\s*['"](?:select|multi|text|number|date)['"]/g),
        ...matches(source, /addCanonical\(\s*['"]([A-Za-z0-9_:-]+)['"]/g),
        ...matches(source, /addChoiceQuestion\([^,]+,\s*['"]([A-Za-z0-9_:-]+)['"]/g),
        ...matches(source, /addTextQuestion\([^,]+,\s*['"]([A-Za-z0-9_:-]+)['"]/g),
        ...matches(source, /(?:answers|ans)\.([A-Za-z][A-Za-z0-9_:-]*)/g),
      ]),
    };
  });
}

function edgeFunctionInventory() {
  return fs.readdirSync(functionsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== '_shared')
    .map(entry => {
      const file = path.join(functionsRoot, entry.name, 'index.ts');
      if (!fs.existsSync(file)) return null;
      const source = read(file);
      const selectClauses = [...source.matchAll(/\.select\(\s*(["'`])([\s\S]*?)\1\s*\)/g)]
        .map(match => match[2]);
      return {
        slug: entry.name,
        file: relative(file),
        lines: source.split('\n').length,
        actions: unique([
          ...matches(source, /action\s*===?\s*['"]([A-Za-z0-9_-]+)['"]/g),
          ...matches(source, /\[\s*['"]([A-Za-z0-9_-]+)['"](?:\s*,\s*['"][A-Za-z0-9_-]+['"])+\s*\]\.includes\(action\)/g),
        ]),
        tables: matches(source, /\.from\(\s*['"]([A-Za-z0-9_]+)['"]\s*\)/g),
        embedded_relation_tables: unique(selectClauses.flatMap(clause =>
          matches(clause, /\b([A-Za-z][A-Za-z0-9_]*)\s*\(/g)
        )),
        rpcs: matches(source, /\.rpc\(\s*['"]([A-Za-z0-9_]+)['"]/g),
        auth_boundary: source.includes('requireOperator(')
          ? 'operator_jwt_or_repository_fallback_contract'
          : source.includes('authenticatedUser(')
            ? 'authenticated_user'
            : 'public_or_self_validated',
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function migrationInventory() {
  const files = fs.readdirSync(migrationsRoot)
    .filter(file => file.endsWith('.sql'))
    .sort();
  const all = files.map(file => ({ file, source: read(path.join(migrationsRoot, file)) }));
  return {
    count: files.length,
    files,
    created_tables: unique(all.flatMap(({ source }) => matches(source, /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([A-Za-z0-9_]+)/gi))),
    altered_tables: unique(all.flatMap(({ source }) => matches(source, /alter\s+table\s+(?:if\s+exists\s+)?(?:public\.)?([A-Za-z0-9_]+)/gi))),
    functions: unique(all.flatMap(({ source }) => matches(source, /create\s+or\s+replace\s+function\s+(?:public\.)?([A-Za-z0-9_]+)/gi))),
    triggers: unique(all.flatMap(({ source }) => matches(source, /create\s+trigger\s+([A-Za-z0-9_]+)/gi))),
  };
}

function answerKeyLineage(tracker, edgeFunctions) {
  const keys = unique(tracker.flatMap(script => script.answer_keys));
  const trackerSources = new Map(tracker.map(script => [script.file, read(path.join(root, script.file))]));
  const edgeSources = new Map(edgeFunctions.map(fn => [fn.file, read(path.join(root, fn.file))]));
  const migrationFiles = fs.readdirSync(migrationsRoot).filter(file => file.endsWith('.sql')).sort();
  const migrationSources = new Map(migrationFiles.map(file => [
    `supabase/migrations/${file}`,
    read(path.join(migrationsRoot, file)),
  ]));
  const containsKey = (source, key) => {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`['"]${escaped}['"]`).test(source) ||
      new RegExp(`\\.${escaped}\\b`).test(source) ||
      source.includes(`->>'${key}'`) || source.includes(`->'${key}'`);
  };
  const usedBy = (sources, key) => [...sources.entries()]
    .filter(([, source]) => containsKey(source, key))
    .map(([file]) => file)
    .sort();
  return keys.map(key => ({
    key,
    declared_by: tracker.filter(script => script.answer_keys.includes(key)).map(script => script.file),
    tracker_references: usedBy(trackerSources, key),
    backend_references: usedBy(edgeSources, key),
    migration_references: usedBy(migrationSources, key),
  }));
}

function build() {
  const tracker = trackerInventory();
  const edgeFunctions = edgeFunctionInventory();
  const answerKeys = answerKeyLineage(tracker, edgeFunctions);
  return {
    generated_by: 'scripts/generate_tracker_contract_inventory.mjs',
    contract_version: 1,
    tracker_entrypoint: 'tracker/index.html',
    summary: {
      tracker_scripts: tracker.length,
      scripts_wrapping_fetch: tracker.filter(script => script.window_wrappers.includes('fetch')).length,
      scripts_wrapping_open_interview: tracker.filter(script => script.window_wrappers.includes('openInterview')).length,
      edge_functions: edgeFunctions.length,
      frontend_edge_function_slugs: unique(tracker.flatMap(script => script.edge_functions)),
      frontend_api_actions: unique(tracker.flatMap(script => script.api_actions)),
      edge_function_tables: unique(edgeFunctions.flatMap(fn => fn.tables)),
      edge_function_embedded_relation_tables: unique(edgeFunctions.flatMap(fn => fn.embedded_relation_tables)),
      edge_function_database_surface: unique(edgeFunctions.flatMap(fn => [
        ...fn.tables,
        ...fn.embedded_relation_tables,
      ])),
      edge_function_rpcs: unique(edgeFunctions.flatMap(fn => fn.rpcs)),
      discovered_answer_keys: answerKeys.length,
      answer_keys_without_backend_or_migration_reference: answerKeys
        .filter(item => !item.backend_references.length && !item.migration_references.length)
        .map(item => item.key),
    },
    tracker_scripts: tracker,
    edge_functions: edgeFunctions,
    answer_key_lineage: answerKeys,
    migrations: migrationInventory(),
  };
}

const rendered = JSON.stringify(build(), null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (!fs.existsSync(outputPath) || read(outputPath) !== rendered) {
    console.error('Tracker contract inventory is stale. Run: node scripts/generate_tracker_contract_inventory.mjs');
    process.exit(1);
  }
  console.log('Tracker contract inventory is current.');
} else {
  fs.writeFileSync(outputPath, rendered);
  console.log(`Wrote ${relative(outputPath)}`);
}

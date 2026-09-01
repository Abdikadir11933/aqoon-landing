const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const evaluator = import(pathToFileURL(path.join(__dirname, '..', 'supabase/functions/_shared/criteria-evaluator.mjs')).href);
const criterion = (field_key, rule_json, criterion_type = 'required') => ({
  label: field_key,
  field_key,
  rule_json,
  criterion_type,
});

test('verified expected values distinguish a fit from a contradiction', async () => {
  const { evaluateCriterion } = await evaluator;
  assert.equal(evaluateCriterion(criterion('city', { expected: 'Vantaa' }), 'Vantaa').outcome, 'met');
  assert.equal(evaluateCriterion(criterion('city', { expected: 'Vantaa' }), 'Espoo').outcome, 'conflict');
});

test('yes/no interview answers are translated for daycare exclusions', async () => {
  const { evaluateCriterion } = await evaluator;
  const noMunicipalCare = criterion('municipal_ece_status', { expected: 'not_attending' });
  const noSameChildAllowance = criterion('same_child_parental_or_private_daycare_allowance', { must_not_be: 'paid_for_same_child' }, 'exclusion');
  assert.equal(evaluateCriterion(noMunicipalCare, 'No').outcome, 'met');
  assert.equal(evaluateCriterion(noMunicipalCare, 'Yes').outcome, 'conflict');
  assert.equal(evaluateCriterion(noSameChildAllowance, 'Yes').outcome, 'conflict');
  assert.equal(evaluateCriterion(noSameChildAllowance, 'No').outcome, 'met');
});

test('authority-owned and must-confirm rules can never be auto-confirmed', async () => {
  const { evaluateCriterion } = await evaluator;
  assert.equal(evaluateCriterion(criterion('provider_availability', { required_confirmation: true }, 'authority_confirmation'), 'Available').outcome, 'needs_confirmation');
  assert.equal(evaluateCriterion(criterion('guardian_or_care_responsibility', { must_confirm: true }), 'Yes').outcome, 'needs_confirmation');
});

test('age rules detect clear conflicts but symbolic rules still require review', async () => {
  const { evaluateCriterion } = await evaluator;
  const now = new Date('2026-09-01T00:00:00Z');
  assert.equal(evaluateCriterion(criterion('youngest_child_age', { expected: 'under_3' }), 'Under 3', now).outcome, 'met');
  assert.equal(evaluateCriterion(criterion('youngest_child_age', { expected: 'under_3' }), '3 or older', now).outcome, 'conflict');
  assert.equal(evaluateCriterion(criterion('child_age_or_birth_date', { must_confirm: 'turning_five_this_year' }), '2021-04-20', now).outcome, 'needs_confirmation');
  assert.equal(evaluateCriterion(criterion('child_age_or_birth_date', { must_confirm: 'turning_five_this_year' }), '2020-04-20', now).outcome, 'conflict');
});

test('missing facts stay missing and vague benefit answers do not become confirmed', async () => {
  const { evaluateCriterion } = await evaluator;
  assert.equal(evaluateCriterion(criterion('child_age', { expected: 'under_17' }), '').outcome, 'missing');
  assert.equal(evaluateCriterion(criterion('earnings_related_status', { eligible_route_when: ['not_eligible', 'ended'] }, 'conditional'), 'No').outcome, 'needs_confirmation');
  assert.equal(evaluateCriterion(criterion('earnings_related_status', { eligible_route_when: ['not_eligible', 'ended'] }, 'conditional'), 'Yes').outcome, 'conflict');
});

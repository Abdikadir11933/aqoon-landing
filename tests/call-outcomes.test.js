const test = require('node:test');
const assert = require('node:assert/strict');
const { noAnswerFollowUp, buildOutcomePayload } = require('../tracker/call-outcomes.js');

const NOW = Date.parse('2026-08-28T08:00:00.000Z');

test('reached records the outcome without scheduling a follow-up', () => {
  assert.deepEqual(buildOutcomePayload('lead-1', 'reached', null, NOW), {
    action: 'record_call_outcome',
    id: 'lead-1',
    call_outcome: 'reached'
  });
});

test('no answer schedules the next attempt exactly 24 hours later', () => {
  assert.equal(noAnswerFollowUp(NOW), '2026-08-29T08:00:00.000Z');
  assert.equal(buildOutcomePayload('lead-1', 'no_answer', null, NOW).next_follow_up_at, '2026-08-29T08:00:00.000Z');
});

test('call later requires and normalizes a future follow-up time', () => {
  const payload = buildOutcomePayload('lead-1', 'call_later', '2026-08-28T12:30:00.000Z', NOW);
  assert.equal(payload.next_follow_up_at, '2026-08-28T12:30:00.000Z');
  assert.throws(() => buildOutcomePayload('lead-1', 'call_later', '2026-08-28T07:59:00.000Z', NOW), /future/);
});

test('unknown outcomes are rejected', () => {
  assert.throws(() => buildOutcomePayload('lead-1', 'maybe', null, NOW), /outcome/);
});

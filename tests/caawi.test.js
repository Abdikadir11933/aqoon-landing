const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../caawi/app.js');

const IDS = {
  requestId: '11111111-1111-4111-8111-111111111111',
  visitor: '22222222-2222-4222-8222-222222222222',
  session: '33333333-3333-4333-8333-333333333333'
};

test('040 Finnish phone is accepted and normalized', () => {
  assert.equal(core.normalizeFinnishPhone('040 123 4567'), '+358401234567');
});

test('+358 Finnish phone is accepted and normalized', () => {
  assert.equal(core.normalizeFinnishPhone('+358 40 123 4567'), '+358401234567');
});

test('bad phone is blocked', () => {
  assert.equal(core.normalizeFinnishPhone('12345'), '');
  assert.equal(core.normalizeFinnishPhone('+1 555 123 4567'), '');
  assert.equal(core.normalizeFinnishPhone('++358401234567'), '');
});

test('successful contact save advances to city', () => {
  assert.equal(core.nextAfterContactSaved(), 'city');
});

test('child route asks age next and then asks about more help', () => {
  assert.equal(core.nextAfterNeed('kids'), 'age');
  assert.deepEqual(core.pathForNeed('kids', false), ['contact','city','need','age','explain','sub','more']);
});

test('work route skips child age and then asks about more help', () => {
  assert.equal(core.nextAfterNeed('work'), 'explain');
  assert.deepEqual(core.pathForNeed('work', false), ['contact','city','need','explain','sub','more']);
  assert.equal(core.nextAfterSubSelected(), 'more');
});

test('additional-help route starts from need and excludes contact/city progress', () => {
  assert.deepEqual(core.pathForNeed('school', true), ['need','explain','sub','more']);
});

test('multi-need payload keeps one primary lead and attaches extra needs', () => {
  const state = { name: 'Test User', phone: '+358401234567' };
  const requests = [
    { main_need: 'Shaqo', sub_need: 'Barnaamij shaqo ama tababar', age_group: null },
    { main_need: 'Waxbarasho', sub_need: 'Baro Finnish ama hel koorso', age_group: null }
  ];
  const payload = core.buildSubmitPayload(state, IDS, { utm_source: 'test' }, 'Vantaa', requests);
  assert.equal(payload.main_need, 'Shaqo');
  assert.equal(payload.sub_need, 'Barnaamij shaqo ama tababar');
  assert.equal(payload.additional_needs.length, 1);
  assert.equal(payload.additional_needs[0].main_need, 'Waxbarasho');
});

test('duplicate categories are collapsed to one request', () => {
  const list = core.normalizeRequests([
    { main_need: 'Shaqo', sub_need: 'A' },
    { main_need: 'Shaqo', sub_need: 'B' },
    { main_need: 'Waxbarasho', sub_need: 'C' }
  ]);
  assert.deepEqual(list, [
    { main_need: 'Shaqo', sub_need: 'A', age_group: null },
    { main_need: 'Waxbarasho', sub_need: 'C', age_group: null }
  ]);
});

test('final selection sends one lead request then confirms', async () => {
  const state = { name: 'Test User', phone: '+358401234567' };
  const payload = core.buildSubmitPayload(state, IDS, {}, 'Vantaa', [
    { main_need: 'Shaqo', sub_need: 'Barnaamij shaqo ama tababar' }
  ]);
  let request;
  const fakeFetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200, json: async () => ({ ok: true, id: 'lead-1' }) };
  };
  const result = await core.postJson(fakeFetch, 'https://example.test/family-intake-submit', payload);
  assert.equal(result.id, 'lead-1');
  assert.equal(request.url, 'https://example.test/family-intake-submit');
  assert.equal(request.options.method, 'POST');
  assert.equal(JSON.parse(request.options.body).request_id, IDS.requestId);
  assert.equal(core.nextAfterSubmitSuccess(), 'confirm');
});

test('back or browser exit warns after the form has started', () => {
  assert.equal(core.shouldWarnOnExit(true, 'contact'), true);
  assert.equal(core.shouldWarnOnExit(true, 'more'), true);
  assert.equal(core.shouldWarnOnExit(true, 'hero'), false);
  assert.equal(core.shouldWarnOnExit(true, 'confirm'), false);
});

test('duplicate final request is blocked while first request is in flight', async () => {
  const gate = core.createSubmitGate();
  let calls = 0;
  let finishFirst;
  const first = core.guardedSubmit(gate, async () => {
    calls += 1;
    await new Promise(resolve => { finishFirst = resolve; });
    return { ok: true, id: 'lead-1' };
  });
  const duplicate = core.guardedSubmit(gate, async () => {
    calls += 1;
    return { ok: true, id: 'lead-2' };
  });
  await Promise.resolve();
  assert.equal(calls, 1);
  const duplicateResult = await duplicate;
  assert.equal(duplicateResult.skipped, true);
  finishFirst();
  const firstResult = await first;
  assert.equal(firstResult.id, 'lead-1');
  assert.equal(calls, 1);
});
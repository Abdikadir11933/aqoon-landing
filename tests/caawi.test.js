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

test('child route asks age next', () => {
  assert.equal(core.nextAfterNeed('kids'), 'age');
  assert.deepEqual(core.pathForNeed('kids'), ['contact','city','need','age','explain','sub']);
});

test('work route skips child age', () => {
  assert.equal(core.nextAfterNeed('work'), 'explain');
  assert.deepEqual(core.pathForNeed('work'), ['contact','city','need','explain','sub']);
});

test('final selection builds and sends a lead creation request then confirms', async () => {
  const state = {
    name: 'Test User',
    phone: '+358401234567',
    age: '',
    subNeed: 'Barnaamij shaqo ama tababar'
  };
  const payload = core.buildSubmitPayload(state, IDS, {utm_source: 'test'}, 'Vantaa', 'Shaqo');
  let request;
  const fakeFetch = async (url, options) => {
    request = {url, options};
    return {ok: true, status: 200, json: async () => ({ok: true, id: 'lead-1'})};
  };

  const result = await core.postJson(fakeFetch, 'https://example.test/family-intake-submit', payload);
  assert.equal(result.id, 'lead-1');
  assert.equal(request.url, 'https://example.test/family-intake-submit');
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), payload);
  assert.equal(payload.request_id, IDS.requestId);
  assert.equal(payload.main_need, 'Shaqo');
  assert.equal(payload.sub_need, 'Barnaamij shaqo ama tababar');
  assert.equal(core.nextAfterSubmitSuccess(), 'confirm');
});

test('back or browser exit warns after the form has started', () => {
  assert.equal(core.shouldWarnOnExit(true, 'contact'), true);
  assert.equal(core.shouldWarnOnExit(true, 'need'), true);
  assert.equal(core.shouldWarnOnExit(true, 'hero'), false);
  assert.equal(core.shouldWarnOnExit(true, 'confirm'), false);
  assert.equal(core.shouldWarnOnExit(false, 'need'), false);
});

test('duplicate final request is blocked while the first request is in flight', async () => {
  const gate = core.createSubmitGate();
  let calls = 0;
  let finishFirst;
  const first = core.guardedSubmit(gate, async () => {
    calls += 1;
    await new Promise(resolve => { finishFirst = resolve; });
    return {ok: true, id: 'lead-1'};
  });
  const duplicate = core.guardedSubmit(gate, async () => {
    calls += 1;
    return {ok: true, id: 'lead-2'};
  });

  await Promise.resolve();
  assert.equal(calls, 1);
  const duplicateResult = await duplicate;
  assert.equal(duplicateResult.skipped, true);
  finishFirst();
  const firstResult = await first;
  assert.equal(firstResult.id, 'lead-1');
  assert.equal(calls, 1);

  const state = {name:'Test User',phone:'+358401234567',age:'under7',subNeed:'Xannaano ama päiväkoti'};
  const firstPayload = core.buildSubmitPayload(state, IDS, {}, 'Vantaa', 'Carruurta');
  const retryPayload = core.buildSubmitPayload(state, IDS, {}, 'Vantaa', 'Carruurta');
  assert.equal(firstPayload.request_id, retryPayload.request_id);
});

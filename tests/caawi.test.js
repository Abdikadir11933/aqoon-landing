const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
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

test('child route asks the child stage before a focused topic', () => {
  assert.equal(core.nextAfterNeed('kids'), 'age');
  assert.deepEqual(core.pathForNeed('kids', false), ['contact','city','need','age','sub','more']);
});

test('work route collects the focused topic with no detailed eligibility question during intake', () => {
  assert.equal(core.nextAfterNeed('work'), 'sub');
  assert.deepEqual(core.pathForNeed('work', false), ['contact','city','need','sub','more']);
  assert.equal(core.nextAfterSubSelected('work'), 'more');
});

test('additional-help route starts from need', () => {
  assert.deepEqual(core.pathForNeed('school', true), ['need','sub','more']);
});

test('other-help route never guesses a benefit category', () => {
  assert.equal(core.nextAfterNeed('other'), 'more');
  assert.deepEqual(core.pathForNeed('other', false), ['contact','city','need','more']);
  assert.equal(core.nextAfterSubSelected('kids'), 'more');
});

test('multi-need payload keeps one primary lead and attaches extra needs', () => {
  const state = { name: 'Test User', phone: '+358401234567' };
  const requests = [
    { main_need: 'Shaqo', sub_need: 'Barnaamij shaqo ama tababar', age_group: null },
    { main_need: 'Waxbarasho', sub_need: 'Baro Finnish ama hel koorso', age_group: null },
    { main_need: 'Wax kale', sub_need: 'Wax aan kor ku qornayn', age_group: null }
  ];
  const payload = core.buildSubmitPayload(state, IDS, { utm_source: 'test' }, 'Vantaa', requests);
  assert.equal(payload.main_need, 'Shaqo');
  assert.equal(payload.sub_need, 'Barnaamij shaqo ama tababar');
  assert.equal(payload.additional_needs.length, 2);
  assert.equal(payload.additional_needs[0].main_need, 'Waxbarasho');
  assert.equal(payload.additional_needs[1].main_need, 'Wax kale');
  assert.equal(payload.form_version, 'phone-first-v2-multineed');
  assert.equal(payload.contact_consent, true);
});

test('up to four distinct help categories can stay in one request', () => {
  const list = core.normalizeRequests([
    { main_need: 'Shaqo', sub_need: 'A' },
    { main_need: 'Waxbarasho', sub_need: 'B' },
    { main_need: 'Carruurta', sub_need: 'C', age_group: 'under7' },
    { main_need: 'Wax kale', sub_need: 'D' }
  ]);
  assert.equal(list.length, 4);
  assert.equal(list[3].main_need, 'Wax kale');
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

test('contact payload is tagged with current form version', () => {
  const state = { name: 'Test User', phone: '+358401234567' };
  const payload = core.buildContactPayload(state, IDS, {}, '');
  assert.equal(payload.form_version, 'phone-first-v2-multineed');
});

test('routing answers are saved without making an eligibility decision', () => {
  const state = { name: 'Test User', phone: '+358401234567' };
  const payload = core.buildSubmitPayload(state, IDS, {}, 'Vantaa', [
    { main_need: 'Shaqo & jid shaqo', sub_need: 'Shaqo raadis' }
  ], { work: 'not_sure', school: 'yes' });
  assert.equal(payload.work_diagnostic, 'not_sure');
  assert.equal(payload.school_diagnostic, 'yes');
  assert.equal(payload.main_need, 'Shaqo & jid shaqo');
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

test('the four public categories use the approved non-leading taxonomy, and never "Barnaamijyo"', () => {
  const html = fs.readFileSync('caawi/index.html', 'utf8');
  const js = fs.readFileSync('caawi/app.js', 'utf8');
  for (const label of ['Shaqo', 'Waxbarasho', 'Carruur iyo skuul', 'Arrin kale']) {
    assert.match(html, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(js, new RegExp("'" + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "'"));
  }
  assert.doesNotMatch(html, /Barnaamijyo/);
  assert.doesNotMatch(js, /Barnaamijyo/);
});

test('the "other" category never names a specific service and stays a neutral catch-all', () => {
  const js = fs.readFileSync('caawi/app.js', 'utf8');
  assert.match(js, /Wax aan kor ku qornayn ama haddii aadan hubin meesha laga bilaabo/);
});

test('the category screen states the intake is not an official decision or an eligibility confirmation', () => {
  const html = fs.readFileSync('caawi/index.html', 'utf8');
  assert.match(html, /Ma aha go.aan rasmi ah, mana xaqiijinayo inaad adeeg ama taageero xaq u leedahay/);
});

test('sending the request requires an explicit consent checkbox, checked before the button is enabled', () => {
  const html = fs.readFileSync('caawi/index.html', 'utf8');
  const js = fs.readFileSync('caawi/app.js', 'utf8');
  assert.match(html, /id="contactConsent"[^>]*type="checkbox"|type="checkbox"[^>]*id="contactConsent"/);
  assert.match(html, /id="sendRequestBtn"[^>]*disabled/);
  assert.match(js, /contactConsent.*checked/);
});

test('analytics acceptance persists the consented visitor id for cross-page continuity', () => {
  const js = fs.readFileSync('caawi/app.js', 'utf8');
  assert.match(js, /analyticsAccept\.onclick=function\(\)\{[^}]*set\('aqoon_visitor_id',ids\.visitor,local\)/);
});

test('family form errors and the leave dialog expose accessible state', () => {
  const html = fs.readFileSync('caawi/index.html', 'utf8');
  const js = fs.readFileSync('caawi/app.js', 'utf8');
  assert.match(html, /id="contactError"[^>]*role="alert"[^>]*aria-live="assertive"/);
  assert.match(html, /id="finishError"[^>]*role="alert"[^>]*aria-live="assertive"/);
  assert.match(html, /id="phone"[^>]*aria-describedby="phoneHelp contactError"[^>]*aria-invalid="false"/);
  assert.match(html, /id="leaveModal"[^>]*aria-describedby="leaveDescription"/);
  assert.match(js, /function trapLeave\(e\)/);
  assert.match(js, /setAttribute\('aria-invalid'/);
});

test('intake never asks a detailed eligibility/status question - that belongs in the first interview', () => {
  const html = fs.readFileSync('caawi/index.html', 'utf8');
  const js = fs.readFileSync('caawi/app.js', 'utf8');
  assert.doesNotMatch(html, /data-screen="qualify"/);
  assert.doesNotMatch(js, /QUALIFY\s*=|renderQualify|data-diagnostic/);
  assert.doesNotMatch(js, /diiwaangashan tahay t.{0,3}ll.{0,3}syyspalvelut/);
  for (const need of ['kids', 'work', 'school', 'other']) {
    assert.ok(!core.pathForNeed(need, false).includes('qualify'), `${need} path must not include a qualify step`);
  }
});

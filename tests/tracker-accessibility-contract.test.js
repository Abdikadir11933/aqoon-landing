const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('tracker/index.html', 'utf8');

test('primary tracker dialogs have accessible names', () => {
  assert.match(html, /id="familyPanel"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="panelFamilyName"/);
  assert.match(html, /id="drawer"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="dName"/);
  assert.match(html, /id="opsDialog"[^>]*role="dialog"[^>]*aria-labelledby="opsDialogTitle"[^>]*aria-describedby="opsDialogHint"/);
});

test('primary dialog action buttons never inherit an accidental submit type', () => {
  for (const id of ['closeFamilyPanel', 'closeDrawer', 'saveInterview', 'copyPrompt']) {
    const tag = html.match(new RegExp(`<button[^>]*id="${id}"[^>]*>`))?.[0] || '';
    assert.match(tag, /type="button"/, `${id} must be an explicit non-submit button`);
  }
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('B2B links and focus use the accessible functional teal', () => {
  const css = read('assets/site.css');
  const brand = read('BRAND.md');

  assert.match(css, /a\{color:#066c68;/);
  assert.match(css, /:focus-visible\{outline:2px solid #066c68;/);
  assert.match(css, /\.b2b-site main a:not\(\.button-link\):not\(\[href\*="cal\.com"\]\)\{color:#066c68!important\}/);
  assert.doesNotMatch(css, /\.b2b-site main a:not\(\.button-link\)\{color:#066c68!important\}/);
  assert.match(css, /\.b2b-site main \.tone-dark a:not\(\.button-link\)\{color:#f8f7f3!important\}/);
  assert.match(brand, /`--link` \| `#066C68`/);
  assert.match(brand, /1100 px leveydestä alaspäin/);
});

test('method page closes with the standard buyer question and contact alternative', () => {
  const html = read('menetelma/index.html');

  assert.doesNotMatch(html, /Vaihdetaan kokemuksia/);
  assert.match(html, /Missä teidän palvelunne polku katkeaa\?/);
  assert.match(html, /Käydään 30 minuutissa läpi palvelunne, kohderyhmänne/);
  assert.match(html, /class="contact-alternative"/);
});

test('case page does not repeat the email alternative in its footer', () => {
  const html = read('tapaus/index.html');
  const alternatives = html.match(/class="contact-alternative"/g) || [];

  assert.equal(alternatives.length, 1);
});

test('custom not-found page is branded, useful, and excluded from indexing', () => {
  const html = read('404.html');

  assert.match(html, /<meta name="robots" content="noindex,follow">/);
  assert.match(html, /<main id="main-content" tabindex="-1">/);
  assert.match(html, /<h1>Sivua ei löytynyt\.<\/h1>/);
  assert.match(html, /href="\/">Palaa etusivulle<\/a>/);
  assert.match(html, /href="\/paketit">Tutustu palveluihin<\/a>/);
  assert.match(html, /mailto:abducadir_abdullahi@aqoon\.live/);
});

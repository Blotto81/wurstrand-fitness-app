'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'modules/uno/uno-rules-data.js'), 'utf8'), context);
const d = context.WRCUnoRules;
const card = id => d.cards.find(c => c.id === id);
assert.equal(d.cards.length, 45);
assert.equal(new Set(d.cards.map(c => c.id)).size, 45);
assert.equal(card('classic-0').points, 20);
assert.equal(card('classic-1').points, 1);
for (const side of ['light', 'dark']) {
  assert.equal(card(`flip-${side}-1`).points, 20);
  for (let n = 2; n <= 9; n++) assert.equal(card(`flip-${side}-${n}`).points, n);
}
assert.equal(card('flip-light-wild').pointSource, 'WRC-Festlegung · 50 Punkte');
assert.ok(d.cards.every(c => c.pointSource), 'Every point value has a source');
const expected = { 'classic-draw2':20,'classic-reverse':20,'classic-skip':20,'classic-wild':50,'classic-wild4':50,
  'flip-light-draw1':20,'flip-light-reverse':20,'flip-light-skip':20,'flip-light-flip':20,'flip-light-wild':50,'flip-light-wild2':50,
  'flip-dark-draw5':70,'flip-dark-reverse':20,'flip-dark-skipall':20,'flip-dark-flip':50,'flip-dark-wild':50,'flip-dark-wildcolor':70 };
for (const [id, points] of Object.entries(expected)) assert.equal(card(id).points, points, id);
for (const v of ['classic', 'flip']) {
  for (const id of ['deal','jump','swap','penalty','stack','end']) assert.ok(d.getRules(v).some(r => r.id === id));
  for (const q of ['Zwischenwerfen','Tauschen','UNO','Strafkarte','Punkte']) assert.ok(d.search(v, q).length, `${v}: ${q}`);
  assert.equal(d.search(v, '   ').length, 0);
  assert.equal(d.search(v, '<script>').length, 0);
  assert.ok(d.getRules(v).find(r => r.id === 'swap').note.includes('leere Hand'));
}
assert.equal(d.search('classic', '+5').length, 0);
assert.equal(d.search('flip', '+4').length, 0);
assert.ok(d.search('classic', '+4').some(r => r.id === 'classic-wild4'));
assert.ok(d.search('flip', '+2').some(r => r.id === 'flip-light-wild2'));
assert.ok(d.search('flip', '+5').some(r => r.id === 'flip-dark-draw5'));
assert.ok(d.search('classic', '0').some(r => r.id === 'classic-0'));
assert.ok(!d.search('classic', '0').some(r => r.id === 'end'), '0 must not match 1000');
assert.ok(d.search('flip', '1').some(r => r.id === 'flip-dark-1'));
assert.ok(d.getRules('flip').find(r => r.id === 'colors').note.includes('erst bis Orange'));
assert.ok(!JSON.stringify(d.getRules('classic')).includes('Flip'));
assert.ok(d.getCards('flip', 'light').every(c => c.side === 'light'));
assert.ok(d.getCards('flip', 'dark').every(c => c.side === 'dark'));
// Gallery retains one model per number/action, never one per color.
for (const [variant, side, specialCount] of [['classic', '', 6], ['flip', 'light', 7], ['flip', 'dark', 7]]) {
  const visible = d.getCards(variant, side);
  assert.equal(visible.length, 15);
  assert.equal(new Set(visible.map(c => c.symbol)).size, 15);
  assert.equal(visible.filter(c => !c.number || c.symbol === String(d.variants[variant].swap)).length, specialCount);
}
assert.equal(d.cards.filter(c => !d.images[c.id]).length, 35);
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
for (const filename of ['uno-rules-data.js','uno-rules.js','uno-rules.css']) {
  assert.ok(index.includes(`modules/uno/${filename}`));
  assert.ok(sw.includes(`modules/uno/${filename}`));
}
for (const filename of ['uno-rules-data.js', 'uno-rules.js']) new vm.Script(fs.readFileSync(path.join(root, 'modules/uno', filename), 'utf8'));
new vm.Script(sw);
for (const match of index.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) if (match[1].trim()) new vm.Script(match[1]);
const photoDir = path.join(root, 'modules/uno/uno-rules-images');
const csv = fs.readFileSync(path.join(photoDir, 'Karten_und_Punkte.csv'), 'utf8').trim().split(/[\r\n]+/).slice(1);
assert.equal(csv.length, 10);
assert.equal(Object.keys(d.images).length, 10);
assert.equal(new Set(Object.values(d.images)).size, 10, 'Each original has one actual card/side');
for (const row of csv) {
  const [filename, points] = row.split(',');
  const id = Object.keys(d.photoCatalog).find(id => d.photoCatalog[id].file === filename);
  assert.ok(id, filename);
  assert.equal(card(id).points, Number(points), filename);
  assert.equal(card(id).pointSource, 'WRC-Kartenübersicht');
  assert.ok(fs.existsSync(path.join(root, d.images[id])));
  assert.ok(sw.includes('./' + d.images[id]), 'Offline image: ' + id);
}
assert.ok(d.images['flip-dark-skipall'].endsWith('richtungswechsel-kreis.png'));
assert.ok(d.images['flip-dark-flip'].endsWith('hell-flip.png'));
assert.ok(!d.images['flip-light-flip'], 'Do not show a dark-side photo on the light side');
assert.equal(d.photoCatalog['flip-dark-wildcolor'].rotation, 90);
console.log('PASS: UNO variants, 45 unique cards, photo mapping and CSV values + house overrides, shared rules, search isolation, asset wiring and syntax.');

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const html = read('index.html');

function pwa({ userAgent = 'Desktop', platform = '', maxTouchPoints = 0, standalone = false, iosStandalone = false } = {}) {
  const events = {}, nodes = [];
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.events = {}; this.attributes = {}; nodes.push(this); }
    setAttribute(k, v) { this.attributes[k] = v; }
    addEventListener(k, fn) { this.events[k] = fn; }
    append(...children) { children.forEach(child => { this.children.push(child); child.parent = this; }); }
    appendChild(child) { this.append(child); }
    remove() { this.parent.children = this.parent.children.filter(child => child !== this); }
  }
  const dashboard = new Element('dashboard');
  dashboard.append(new Element('existing-dashboard-content'));
  const media = { matches: standalone, addEventListener(k, fn) { this.change = fn; } };
  const registrations = [];
  const c = { console, navigator: { userAgent, platform, maxTouchPoints, standalone: iosStandalone,
    serviceWorker: { register: async url => registrations.push(url) } },
    document: { getElementById: id => id === 'dashboard' ? dashboard : null, createElement: tag => new Element(tag) },
    matchMedia: () => media, addEventListener(k, fn) {
      if (k === 'beforeinstallprompt') assert.ok(!events[k], 'single central install listener');
      const prior = events[k]; events[k] = arg => { prior?.(arg); return fn(arg); };
    } };
  c.window = c;
  vm.runInNewContext(read('modules/pwa/pwa.js'), c);
  return { events, dashboard, media, registrations, nodes,
    card: () => dashboard.children.find(n => n.tag === 'aside'),
    button: () => nodes.find(n => n.tag === 'button'),
    help: () => nodes.find(n => n.id === 'wrcInstallHelp') };
}

async function testPwa() {
  for (const options of [{}, { userAgent: 'Android' }, { userAgent: 'iPhone' }, { platform: 'MacIntel', maxTouchPoints: 5 }]) {
    const p = pwa(options);
    p.events.load();
    assert.equal(p.card(), p.dashboard.children.at(-1));
    assert.equal(p.card().className, 'pwa-install-hint');
    assert.equal(p.help().hidden, true);
    await p.button().events.click();
    assert.equal(p.help().hidden, false);
    assert.ok(p.help().textContent.length > 20);
    if (options.userAgent === 'iPhone' || options.platform) assert.match(p.help().textContent, /Safari.*Teilen.*Home-Bildschirm.*Hinzufügen/);
    if (options.userAgent === 'Android') assert.match(p.help().textContent, /Startbildschirm.*falls angeboten/);
    p.events.load();
    assert.equal(p.dashboard.children.filter(n => n.tag === 'aside').length, 1);
  }
  for (const options of [{ standalone: true }, { iosStandalone: true }]) {
    const p = pwa(options); p.events.load(); assert.equal(p.card(), undefined);
  }
  const p = pwa(); p.events.load();
  let prompts = 0, prevented = 0;
  const event = outcome => ({ preventDefault() { prevented++; }, async prompt() { prompts++; }, userChoice: Promise.resolve({ outcome }) });
  p.events.beforeinstallprompt(event('dismissed'));
  assert.equal(prompts, 0, 'never prompt automatically');
  await p.button().events.click();
  assert.equal(prompts, 1); assert.equal(p.button().disabled, false); assert.match(p.help().textContent, /abgebrochen/);
  await p.button().events.click(); assert.equal(prompts, 1, 'consumed event is never reused');
  p.events.beforeinstallprompt({ preventDefault() {}, prompt() { throw Error('Unavailable'); } });
  await p.button().events.click(); assert.equal(p.button().disabled, false); assert.match(p.help().textContent, /nicht verfügbar/);
  p.events.beforeinstallprompt(event('accepted')); await p.button().events.click();
  assert.equal(prompts, 2); assert.equal(prevented, 2); assert.equal(p.card(), undefined);
  p.events.load(); assert.equal(p.card(), undefined);
  const installed = pwa(); installed.events.load(); installed.events.appinstalled(); assert.equal(installed.card(), undefined);
  const mode = pwa(); mode.events.load(); mode.media.matches = true; mode.media.change(); assert.equal(mode.card(), undefined);
  mode.media.matches = false; mode.media.change(); assert.ok(mode.card());
  const early = pwa(); early.events.beforeinstallprompt(event('dismissed')); early.events.load(); assert.ok(early.card());
  assert.match(read('modules/pwa/pwa.js'), /serviceWorker\.register\("\.\/service-worker\.js"\)/);
}

function testBanner() {
  const start = html.indexOf('    function navigateBannerHome(');
  const source = html.slice(start, html.indexOf('    function showTab(', start));
  const calls = [], banner = {};
  const c = { showTab: (...args) => calls.push(args), menuLinkForPanel: id => id, toggleMainMenu: value => assert.equal(value, false), window: { scrollTo() {} } };
  vm.runInNewContext(source, c);
  const event = (type, target, key) => ({ type, target, key, currentTarget: banner, preventDefault() { this.prevented = true; } });
  const plain = { closest: () => banner }, button = { closest: () => ({ tag: 'button' }) };
  for (const origin of ['dashboard', 'analyse', 'ranking', 'dartPanel', 'dartCallerPanel', 'eintragen', 'spieler']) {
    c.navigateBannerHome(event('click', plain));
    assert.equal(calls.at(-1)[0], 'dashboard', origin);
  }
  const before = calls.length;
  c.navigateBannerHome(event('click', button));
  c.navigateBannerHome(event('keydown', button, 'Enter'));
  c.navigateBannerHome(event('keydown', banner, 'Tab'));
  assert.equal(calls.length, before, 'header controls and Tab retain their behavior');
  for (const key of ['Enter', ' ']) { const e = event('keydown', banner, key); c.navigateBannerHome(e); assert.equal(e.prevented, true); }
  assert.equal(calls.length, before + 2);
  assert.match(html, /id="wrcHomeBanner" role="link" tabindex="0" aria-label="Zum WRC-Dashboard"/);
}

async function testFitnessSave() {
  const service = read('entries-service.js');
  const start = service.indexOf('    async function saveEntry()');
  const source = service.slice(start, service.indexOf('    async function deleteEntry(', start));
  const values = { date: '2026-10-03', person: 'Thorsten', steps: '3000', bike: '3', squats: '15', pushups: '9', exercise: '' };
  const expected = { date: values.date, person: values.person, steps: 3000, bike: 3, squats: 15, pushups: 9, exercise: true };
  for (const mode of ['insert', 'edit', 'merge', 'keep-existing', 'error', 'missing-date']) {
    const writes = [], completed = [], old = { ...expected, id: 7, steps: 1000, bike: 2, mood: 'legacy-value' };
    const c = { console: { log() {} }, document: { getElementById: id => ({ value: id === 'date' && mode === 'missing-date' ? '' : values[id], checked: true }) },
      allEntries: ['merge', 'keep-existing'].includes(mode) ? [old] : [], editingId: mode === 'edit' ? 8 : null,
      confirm: () => mode !== 'keep-existing',
      supabaseClient: { from(table) { assert.equal(table, 'entries'); return {
        insert: async payload => { writes.push({ action: 'insert', payload }); return { error: mode === 'error' ? { message: 'mock failure' } : null }; },
        update: payload => ({ eq: async (key, id) => { writes.push({ action: 'update', payload, key, id }); return { error: null }; } })
      }; } }, toast: text => completed.push(text), resetForm: () => completed.push('reset'), loadEntries: async () => completed.push('reload'),
      showTab: id => completed.push(id), menuLinkForPanel: id => id, window: { scrollTo() {} }, requestAnimationFrame: fn => fn(),
      getNewPersonalRecords: () => [], showSaveReward() {}, buildSaveReward() {} };
    vm.createContext(c); vm.runInContext(read('entries-utils.js'), c); vm.runInContext(read('scoring.js'), c); vm.runInContext(source, c);
    const original = JSON.stringify(old); await c.saveEntry();
    assert.equal(JSON.stringify(old), original, 'historic input untouched');
    if (mode === 'missing-date') { assert.equal(writes.length, 0); assert.deepEqual(completed, ['Bitte Datum wählen']); continue; }
    assert.equal(writes.length, 1);
    if (mode === 'error') { assert.equal(completed.length, 1); assert.match(completed[0], /Speichern fehlgeschlagen/); continue; }
    assert.deepEqual(completed, ['reset', 'reload', 'dashboard']);
    if (mode === 'insert') assert.deepEqual(JSON.parse(JSON.stringify(writes[0].payload)), [expected]);
    if (mode === 'edit') { assert.equal(writes[0].id, 8); assert.deepEqual(JSON.parse(JSON.stringify(writes[0].payload)), expected); }
    if (mode === 'merge') { assert.equal(writes[0].id, 7); assert.equal(writes[0].payload.steps, 3000); assert.equal(writes[0].payload.bike, 3); }
    if (mode === 'keep-existing') { assert.equal(writes[0].id, 7); assert.equal(writes[0].payload.steps, 1000); assert.equal(writes[0].payload.bike, 2); }
    assert.equal(c.calcPoints(expected).total, 21);
  }
  assert.doesNotMatch(html + service + read('service-worker.js'), /WRCMood|wrcMoodEntryMount|modules\/mood\//);
  assert.ok(fs.existsSync(path.join(__dirname, '../modules/mood/mood.js')), 'legacy module/data preserved, only unhooked');
}

(async () => {
  await testPwa(); testBanner(); await testFitnessSave();
  for (const file of ['modules/pwa/pwa.js', 'entries-service.js', 'service-worker.js']) new vm.Script(read(file));
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) if (!match[1].includes('src=') && match[2].trim()) new vm.Script(match[2]);
  console.log('PASS: banner/keyboard/controls; PWA native prompt, rejection, retry, fallback, iOS/iPad, standalone; real fitness insert/edit/merge/error without production writes; mood unhooking and syntax.');
})().catch(error => { console.error(error); process.exitCode = 1; });

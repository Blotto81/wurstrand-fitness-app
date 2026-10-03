const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
function audioContext() {
  let draws = [];
  const instances = [];
  class Audio {
    constructor(src) { this.src = src; this.events = {}; instances.push(this); }
    addEventListener(name, fn) { this.events[name] = fn; }
    pause() {}
    play() { return Promise.resolve(); }
  }
  const c = { window: {}, Audio, Math: Object.assign(Object.create(Math), { random: () => draws.shift() ?? .5 }) };
  vm.runInNewContext(read('modules/dart-caller/dart-caller-audio.js').replace(/\}\)\(\);\s*$/, 'window.test={randomSource,turnScores,specialCalls};})();'), c);
  return { ...c.window, instances, draw: values => { draws = values; } };
}
(async () => {
  const c = audioContext(), api = c.WRCDartCallerAudio;
  const callers = ['voigt', 'judith', 'marco', 'niebel', 'gomesch'];
  const pool = callers.map(name => `score-1-${name}-01.wav`), counts = Object.fromEntries(callers.map(name => [name, 0]));
  for (let i = 0; i < 500; i++) {
    c.draw([(i + .5) / 500, 0]);
    counts[callers[pool.indexOf(c.test.randomSource(pool))]]++;
  }
  assert.deepEqual(counts, { voigt: 100, judith: 100, marco: 125, niebel: 125, gomesch: 50 });
  // Every numeric score and special call excludes Gomesch for Marian, including alternate takes.
  for (const playerName of ['Marian', ' MARIAN ']) {
    for (let score = 0; score <= 180; score++) {
      c.draw([.999, .999]); await api.playTurnScore(score, { dartCount: 3, playerName });
      assert.ok(c.instances.every(a => !a.src.includes('-gomesch-')), `Marian score ${score}`);
    }
    for (const event of Object.keys(c.test.specialCalls)) {
      api.stop(); c.draw([.999, .999]); await api.playSpecial(event, { playerName });
      assert.ok(c.instances.every(a => !a.src.includes('-gomesch-')), `Marian special ${event}`);
    }
    api.stop();
    await api.playCricketTurn([], 90, { playerName });
    await api.playCricketTurn(['20'], 90, { playerName });
    assert.ok(c.instances.every(a => !a.src.includes('-gomesch-')), 'Cricket including speech fallback');
  }
  // A delayed bonus belongs to its original thrower even after the caller advances the game.
  const darts = [{ base: 20, multiplier: 3 }, { base: 20, multiplier: 1 }, { base: 0, multiplier: 1 }];
  c.draw([0, 0]); await api.playTurnScore(80, { dartCount: 3, darts, playerName: 'Marian' });
  c.draw([0, .999, .999]); c.instances.at(-1).events.ended();
  assert.match(c.instances.at(-1).src, /bonus-judith-/);
  for (const playerName of ['Thorsten', 'Basti', 'Fabi', 'Gast']) {
    c.draw([.999, .999]); await api.playTurnScore(90, { dartCount: 3, playerName });
    assert.match(c.instances.at(-1).src, /score-90-gomesch-/);
    c.draw([.999, .999]); await api.playSpecial('bust', { playerName });
    assert.match(c.instances.at(-1).src, /special-bust-gomesch-/);
    c.draw([0, 0]); await api.playTurnScore(80, { dartCount: 3, darts, playerName });
    c.draw([0, .999, 0]); c.instances.at(-1).events.ended();
    assert.match(c.instances.at(-1).src, /bonus-gomesch-/);
  }
  // Repeating a score with only Judith/Gomesch must not force Gomesch every other visit.
  const repeated = audioContext();
  repeated.draw([0, 0]); await repeated.WRCDartCallerAudio.playTurnScore(61, { playerName: 'Fabi' });
  repeated.draw([0, 0]); await repeated.WRCDartCallerAudio.playTurnScore(61, { playerName: 'Fabi' });
  assert.ok(repeated.instances.every(a => a.src.includes('-judith-')));
  for (const [event, file] of [['threeFives', 'special-three-fives-fun-01'], ['threeMisses', 'special-three-misses-fun-alf-01']]) {
    api.stop(); await api.playSpecial(event, { playerName: 'Marian' }); assert.ok(c.instances.at(-1).src.includes(file));
  }
  const alf = audioContext(); alf.draw([.999, 0]); await alf.WRCDartCallerAudio.playTurnScore(7, { dartCount: 3, playerName: 'Marian' });
  assert.match(alf.instances.at(-1).src, /score-7-fun-alf-/);
  // Exercise the actual caller's throw and finish paths; no game is saved to a backend.
  const calls = [], mount = { querySelectorAll: () => [], querySelector: () => null, addEventListener() {} };
  const game = { window: { matchMedia: () => ({ matches: true }), setTimeout: () => 1, clearTimeout() {},
    WRCDartCallerAudio: { playSpecial: (event, options) => calls.push({ event, options }), playTurnScore: (score, options) => calls.push({ score, options }) } },
    document: { getElementById: () => mount, addEventListener() {} }, navigator: {}, console, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
  vm.runInNewContext(read('modules/dart-caller/dart-caller.js').replace(/  render\(\);\s*\}\)\(\);\s*$/, 'window.test={addDart,finishTurn,set:s=>state={...freshState(),...s}};})();'), game);
  const t = game.window.test;
  const players = score => [{ name: 'Marian', score, dartsThrown: 0, scoredPoints: 0, highestTurn: 0 }, { name: 'Fabi', score: 501 }];
  t.set({ screen: 'game', turnStartScore: 501, players: players(501) });
  t.addDart(20, 1); t.addDart(20, 1); t.addDart(20, 1); t.finishTurn();
  assert.equal(calls.at(-1).options.playerName, 'Marian'); assert.equal(calls.at(-1).score, 60);
  t.set({ screen: 'game', turnStartScore: 2, players: players(2) }); t.addDart(20, 1);
  assert.equal(calls.at(-1).event, 'bust'); assert.equal(calls.at(-1).options.playerName, 'Marian');
  const cricket = { state: { completed: false, darts: [{ pointsAdded: 60 }], throwers: [{ name: 'Marian' }, { name: 'Fabi' }], currentThrower: 0, turnNumber: 1 },
    turnTimer: null, persist() {}, render() {}, window: { clearTimeout() {}, WRCDartCallerAudio: { playCricketTurn: (closed, points, options) => calls.push({ points, options }) } } };
  cricket.activeThrower = () => cricket.state.throwers[cricket.state.currentThrower];
  vm.runInNewContext(read('modules/dart-caller/dart-cricket.js').split('\n').find(line => line.includes('function finishTurn()')), cricket);
  cricket.finishTurn(); assert.equal(calls.at(-1).options.playerName, 'Marian'); assert.equal(cricket.state.currentThrower, 1);
  for (const name of ['dart-caller-audio.js', 'dart-caller.js', 'dart-cricket.js']) new vm.Script(read('modules/dart-caller/' + name));
  console.log('PASS: half Gomesch weight; no self-calls for Marian across scores, bust, bonuses and Cricket; delayed ownership; other players; repeat-score selection; priority specials, ALF and real caller context.');
})().catch(error => { console.error(error); process.exitCode = 1; });

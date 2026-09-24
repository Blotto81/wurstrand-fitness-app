const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'modules/birthday/member-birthday-data.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function context(date = '2026-09-25', storage = new Map(), hostname = 'localhost') {
  const ctx = { URLSearchParams, Date, console, location: { hostname, search: `?member-birthday=${date}&birthday-player=Fabi` },
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) } };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'scoring.js'), 'utf8') + '\n' + source, ctx);
  return ctx;
}
function extract(name) {
  const start = html.indexOf('    function ' + name + '(');
  assert.ok(start >= 0, name);
  return html.slice(start, html.indexOf('\n    function ', start + 10));
}
(async () => {
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) if (!match[1].includes('src=') && match[2].trim()) new vm.Script(match[2]);
  const storage = new Map(); const c = context('2026-09-25', storage); const D = c.WRCBirthdayData; const G = c.WRCBirthdayGifts;
  assert.equal(D.celebrating().person, 'Fabi'); assert.equal(D.celebrating().age, 50);
  assert.equal(D.celebrating('2026-10-09').age, 50);
  assert.equal(D.celebrating('2027-02-21').age, 45);
  assert.equal(D.celebrating('2031-05-20').age, 50);
  assert.equal(D.celebrating('2027-02-01'), null);
  assert.equal(D.celebrating('2026-09-26'), null);
  assert.equal(D.pending('Fabi', [], '2026-09-24'), null);
  assert.equal(D.pending('Fabi', [], '2026-09-27').year, 2026);
  assert.equal(D.pending('Fabi', [{ player: 'Fabi', birthday_year: 2026 }], '2026-09-27'), null);
  assert.equal(D.pending('Fabi', [{ player: 'Fabi', birthday_year: 2026 }], '2027-09-25').year, 2027);
  assert.equal(D.pending('Thorsten', [], '2026-09-25'), null);
  assert.equal(context('2026-09-25', new Map(), 'wurstrand-fitness-app.vercel.app').WRCBirthdayData.preview, false);
  const entries = [{ person: 'Fabi', date: '2026-09-23', steps: 10000, bike: 5 }, { person: 'Thorsten', date: '2026-09-23', steps: 5000 }];
  const snapshot = JSON.stringify(entries);
  const before = D.lifetime('Fabi', entries, { points: 100, steps: 1000 });
  for (const p of ['Thorsten', 'Marian', 'Basti']) await G.give(p, 'Fabi');
  assert.equal(G.points(), 15); assert.equal(G.points({ person: 'Fabi', key: '2026-09' }), 15);
  assert.equal(G.points({ person: 'Thorsten' }), 0); assert.equal(G.points({ key: '2026-10' }), 0);
  await assert.rejects(G.give('Fabi', 'Fabi'));
  await assert.rejects(G.give('Thorsten', 'Fabi'));
  await assert.rejects(context('2026-09-25', storage).WRCBirthdayGifts.give('Thorsten', 'Fabi'));
  await assert.rejects(context('2026-09-26', storage).WRCBirthdayGifts.give('Thorsten', 'Fabi'));
  assert.equal(context('2026-09-26', storage).WRCBirthdayGifts.points(), 15);
  const after = D.lifetime('Fabi', entries, { points: 100, steps: 1000 });
  assert.equal(after.points - before.points, 15); assert.equal(after.steps, before.steps); assert.equal(after.days, before.days); assert.equal(JSON.stringify(entries), snapshot);
  const m = context('2026-10-09'); for (const p of ['Fabi','Thorsten','Basti']) await m.WRCBirthdayGifts.give(p,'Marian'); assert.equal(m.WRCBirthdayGifts.points({person:'Marian'}),15);
  const t = context('2027-05-20'); for (const p of ['Fabi','Marian','Basti']) await t.WRCBirthdayGifts.give(p,'Thorsten'); assert.equal(t.WRCBirthdayGifts.points(),15);
  await D.markSeen(D.celebrating()); assert.equal(context('2026-09-27',storage).WRCBirthdayData.unseen('Fabi'), null);
  // Real forecast/render functions: gift changes only actual/forecast by +15, not pace or goal.
  let clock = '2026-09-25T12:00:00'; c.Date = class extends Date { constructor(...args) { super(...(args.length ? args : [clock])); } };
  c.people = ['Thorsten','Marian','Basti','Fabi']; c.allEntries = [];
  for (let d=1;d<=23;d++) for (const person of c.people) c.allEntries.push({person,date:`2026-09-${String(d).padStart(2,'0')}`,steps:10000});
  c.monthGoals={'2026-09':1800}; c.HISTORIC_MONTH_POINTS={}; c.key='2026-09';
  c.selectedMonth=()=>c.key; c.monthKeyForAnalysis=()=>c.key; c.getMonthTitle=k=>k;
  const nodes={}; const texts={}; c.document={getElementById:id=>nodes[id]??={style:{},innerHTML:''}}; c.setText=(id,t)=>texts[id]=t;
  c.requestAnimationFrame=f=>f(); c.renderRecordLadder=c.renderDashboardHighlight=c.renderMonthTransition=()=>{};
  c.fmt=(n,d=0)=>Number(n).toFixed(d); c.formatDate=x=>x; c.getLastEntryDate=e=>e.map(r=>r.date).sort().at(-1);
  c.targetCourseChart=null; c.Chart=function(_canvas,config){c.chart=config;this.destroy=()=>{}};
  for(const n of ['monthTotalPoints','getFinishedMonthKeys','buildRecordLadder','getTeamMonthForecast','renderDashboard','renderTargetCourseChart'])vm.runInContext(extract(n),c);
  const f=c.getTeamMonthForecast(c.key); assert.equal(f.currentTotal,935); assert.equal(f.basisTotal,920); assert.equal(f.forecast,1135); assert.equal(f.basisDate,'2026-09-23'); assert.equal(c.monthTotalPoints(c.key),935);
  c.renderDashboard(); c.renderTargetCourseChart(); assert.ok(texts.barText.startsWith('935.0')); assert.equal(texts.goalForecast,'1135 Punkte');
  const [blue,green,yellow]=c.chart.data.datasets; assert.equal(blue.data[24],935); assert.equal(yellow.data.at(-1),1135); assert.equal(green.data.at(-1),1800);
  assert.equal(blue.borderColor,'#38bdf8'); assert.equal(green.borderColor,'#4ade80'); assert.equal(yellow.borderColor,'#fbbf24');
  clock='2026-09-30T12:00:00'; assert.equal(c.getTeamMonthForecast(c.key).forecast,935);
  const letter=JSON.parse(fs.readFileSync(path.join(root,'modules/birthday/fabi-2026.json'),'utf8'));
  assert.equal(letter.paragraphs[0],'Lieber Fabi,'); assert.equal(letter.paragraphs.length,13); assert.ok(letter.paragraphs.at(-1).endsWith('🌭🫘'));
  console.log('PASS: birthdays/ages, annual/catch-up/seen, production preview guard, all givers +15, recipient only, duplicate/reload/self/day-after, immutable fitness, real monthly totals and shared forecast/chart, letter.');
})().catch(e=>{console.error(e);process.exitCode=1;});

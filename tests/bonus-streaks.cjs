const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = { console, Date }; context.window = context;
vm.createContext(context);
vm.runInContext(read('scoring.js') + '\n' + read('modules/bonus-streaks/bonus-streaks-core.js'), context);
const C = context.WRCBonusStreakCore;
const entry = (date, person = 'Marian') => ({ date, person, steps: 3000, bike: 3, exercise: true });
const run = (data, date, player = 'Marian') => C.calculate(data, player, date);
const range = (from, to, player) => { const result=[]; for(let d=from;d<=to;d=C.nextDay(d)) result.push(entry(d, player)); return result; };
const plain = value => JSON.parse(JSON.stringify(value));
let checks = 0;
function test(name, fn) { fn(); checks++; console.log('PASS ' + name); }
test('7 real bonus days unlock exactly the first patch', () => {
  const s = run(range('2026-05-01','2026-05-07'), '2026-05-07');
  assert.equal(s.current,7); assert.equal(s.record,7); assert.equal(s.jokers,2);
  assert.deepEqual(plain(s.patches),[{milestone:7,date:'2026-05-07',seriesStart:'2026-05-01'}]);
});
test('joker +0, running today neither breaks nor consumes', () => {
  const data=range('2026-05-01','2026-05-07');
  const today=run(data,'2026-05-08'); assert.equal(today.current,7); assert.equal(today.jokers,2); assert.equal(today.days.at(-1).status,'open');
  const next=run(data,'2026-05-09'); assert.equal(next.current,7); assert.equal(next.jokers,1); assert.equal(next.days.at(-2).status,'protected');
});
test('monthly credit +2 before resolving the day; bank cap 4', () => {
  const s=run(range('2026-05-01','2026-07-01'),'2026-07-01');
  assert.equal(s.days.find(d=>d.date==='2026-06-01').credit,2);
  assert.equal(s.days.at(-1).credit,0); assert.equal(s.jokers,4);
  const missed=run(range('2026-05-01','2026-05-31'),'2026-06-02');
  assert.equal(missed.days.find(d=>d.date==='2026-06-01').jokers,3);
});
test('third miss breaks, restart 2; idle days do not spend protection', () => {
  const data=range('2026-05-01','2026-05-07');
  const s=run(data,'2026-05-12'); assert.equal(s.current,0); assert.equal(s.jokers,2);
  assert.equal(s.days.find(d=>d.date==='2026-05-10').broke,true);
  assert.equal(s.record,7); assert.equal(s.patches.length,1);
  const restart=run([...data,entry('2026-05-12')],'2026-05-12'); assert.equal(restart.current,1); assert.equal(restart.jokers,2); assert.equal(restart.record,7);
});
test('no sum of separate series; prior patches survive subsequent series', () => {
  const data=[...range('2026-05-01','2026-05-06'),...range('2026-05-11','2026-05-16')];
  assert.equal(run(data,'2026-05-16').patches.length,0);
  const s=run([...range('2026-05-01','2026-05-14'),...range('2026-05-20','2026-05-26')],'2026-05-26');
  assert.equal(s.current,7); assert.equal(s.record,14); assert.deepEqual(plain(s.patches.map(p=>p.milestone)),[7,14]);
});
test('backfill refunds protection and repairs downstream break and record', () => {
  const rows=[...range('2026-05-01','2026-05-07'),entry('2026-05-12')];
  const before=run(rows,'2026-05-12'); assert.equal(before.current,1);
  const after=run([...rows,entry('2026-05-09'),entry('2026-05-10')],'2026-05-12');
  assert.equal(after.current,10); assert.equal(after.jokers,0); assert.equal(after.record,10);
  const noBreak=run([...range('2026-05-01','2026-05-07'),entry('2026-05-08')],'2026-05-09');
  assert.equal(noBreak.jokers,2);
});
test('delete/correct historic bonus replays later balances without mutating data', () => {
  const data=range('2026-05-01','2026-05-14'), snapshot=JSON.stringify(data);
  const corrected=data.map(e=>e.date==='2026-05-05'?{...e,bike:0}:e);
  assert.equal(run(corrected,'2026-05-14').current,13); assert.equal(run(corrected,'2026-05-14').jokers,1);
  const deleted=data.filter(e=>!['2026-05-05','2026-05-06','2026-05-07'].includes(e.date));
  assert.equal(run(deleted,'2026-05-14').current,7); assert.equal(run(deleted,'2026-05-14').jokers,2);
  assert.equal(JSON.stringify(data),snapshot);
});
test('many month/year boundaries, leap day and all 7 milestones', () => {
  const data=range('2026-05-01','2027-05-02'), s=run(data,'2027-05-02');
  assert.equal(s.current,367); assert.equal(s.jokers,4);
  assert.deepEqual(plain(s.patches.map(p=>p.milestone)),[7,14,30,60,100,180,365]);
  assert.equal(C.nextDay('2028-02-28'),'2028-02-29'); assert.equal(C.nextDay('2028-02-29'),'2028-03-01');
  assert.equal(C.nextDay('2026-10-25'),'2026-10-26');
});
test('restart near month end cannot re-credit a past month', () => {
  const rows=[...range('2026-05-01','2026-05-26'),entry('2026-05-31')];
  const may=run(rows,'2026-05-31'); assert.equal(may.jokers,2); assert.equal(may.current,1);
  const june=run([...rows,entry('2026-06-01')],'2026-06-01'); assert.equal(june.jokers,4); assert.equal(june.current,2);
  assert.equal(june.days.filter(d=>d.credit>0).length,2);
});
test('all players independent, arbitrary additional players supported', () => {
  const rows=[...range('2026-05-01','2026-05-07','Thorsten'),entry('2026-05-07','Basti'),...range('2026-05-01','2026-05-04','Fabi'),entry('2026-05-02','Marian'),entry('2026-05-07','Neuer Spieler')];
  assert.equal(run(rows,'2026-05-07','Thorsten').current,7); assert.equal(run(rows,'2026-05-07','Basti').current,1);
  assert.equal(run(rows,'2026-05-07','Fabi').current,4); assert.equal(run(rows,'2026-05-07','Marian').current,0); assert.equal(run(rows,'2026-05-07','Neuer Spieler').current,1);
});
test('backdated unlock and success event; unchanged saves/reload produce none', () => {
  const rows=range('2026-05-01','2026-05-14').filter(e=>e.date!=='2026-05-06');
  const before=run(rows,'2026-05-15'), after=run([...rows,entry('2026-05-06')],'2026-05-15');
  const result=C.achievement(before,after,'2026-05-06'); assert.equal(result.backdated,true); assert.equal(result.count,6); assert.equal(result.patches[0].milestone,14);
  assert.equal(C.achievement(after,after,'2026-05-06'),null);
  assert.deepEqual(plain(run([...rows,entry('2026-05-06')],'2026-05-15')),plain(after));
  assert.equal(C.achievement(before,after,'2026-05-16'),null);
});
test('ignore future, pre-May and invalid dates; order-independent', () => {
  const rows=[entry('2026-04-30'),entry('2026-05-20'),entry('2026-02-30'),...range('2026-05-01','2026-05-07')];
  assert.equal(run(rows,'2026-05-07').current,7);
  assert.deepEqual(plain(run(rows,'2026-05-07')),plain(run([...rows].reverse(),'2026-05-07')));
  assert.equal(run(rows,'2026-04-30').days.length,0); assert.throws(()=>run(rows,'invalid'));
});
test('real existing pre-July/July bonus rules, not copied thresholds', () => {
  const old={person:'Marian',date:'2026-05-01',steps:1000,bike:1,exercise:true};
  assert.equal(run([old],'2026-05-01').current,1);
  assert.equal(run([{...old,date:'2026-07-01'}],'2026-07-01').current,0);
  const unusual=C.calculate([{date:'2026-05-01',person:'Marian'}],'Marian','2026-05-01',()=>({bonus:4})); assert.equal(unusual.current,1);
});
test('duplicate bonus entries cannot increment a day twice', () => {
  assert.equal(run([entry('2026-05-01'),entry('2026-05-01')],'2026-05-01').current,1);
});
test('every daily balance stays 0..4 through random backfills and corrections', () => {
  let seed=73; const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const rows=range('2026-05-01','2028-03-01').filter(()=>random()>.18), s=run(rows,'2028-03-01');
  for(const d of s.days) { assert.ok(d.jokers>=0&&d.jokers<=4); assert.ok(d.current>=0); }
  assert.equal(new Set(s.patches.map(p=>p.milestone)).size,s.patches.length);
  assert.deepEqual(plain(run(rows,'2028-03-01')),plain(s));
});

async function testLoading() {
  const rows=range('2026-05-01','2029-04-30').map((e,id)=>({...e,id}));
  for(const failPage of [-1,1]) {
    let page=0;const sync=[];
    const c={console:{log(){}},allEntries:[{date:'2026-05-01',person:'Cached'}],localStorage:{getItem:()=>null,setItem(){}},cleanLoadedEntries:r=>r,
      renderDashboard(){},renderAll(){},toast(){},WRCBonusPoints:{load:async()=>{}},WRCMemberBirthdays:{onEntriesLoaded(){}},WRCHolidays:{onEntriesLoaded(){}},
      WRCBonusStreaks:{onEntriesLoaded:()=>sync.push('loaded'),onLoadError:()=>sync.push('error')},
      supabaseClient:{from:()=>({select(){return this},order(){return this},async range(a,b){assert.equal(a,page*500);page++;return page-1===failPage?{error:{message:'failed'}}:{data:rows.slice(a,b+1),error:null}}})}};
    vm.createContext(c);vm.runInContext(read('entries-service.js'),c);const success=await c.loadEntries();
    if(failPage<0){assert.equal(success,true);assert.equal(c.allEntries.length,rows.length);assert.ok(page>2);assert.deepEqual(sync,['loaded']);}
    else{assert.equal(success,false);assert.equal(c.allEntries[0].person,'Cached');assert.deepEqual(sync,['error']);}
  }
  console.log('PASS paginated full history and partial-read failure preserves last complete state');
}
async function testSaveHook() {
  const service=read('entries-service.js'), start=service.indexOf('    async function saveEntry()');
  const source=service.slice(start,service.indexOf('    async function deleteEntry(',start));
  for(const mode of ['insert','merge','edit','failed-write','failed-reload','unchanged']) {
    const rows=range('2026-05-01','2026-05-07').filter(e=>e.date!=='2026-05-06');
    if(['merge','edit','unchanged'].includes(mode)) rows.push({...entry('2026-05-06'),id:17,bike:mode==='unchanged'?3:0,exercise:mode==='unchanged'});
    const values={date:'2026-05-06',person:'Marian',steps:3000,bike:3,squats:0,pushups:0};
    const success=[],tasks=[]; let pending;
    const c={console:{log(){}},allEntries:rows,editingId:mode==='edit'?17:null,confirm:()=>true,document:{getElementById:id=>({value:values[id],checked:true})},
      toast(){},resetForm(){},showTab(){},menuLinkForPanel(){},window:{scrollTo(){}},requestAnimationFrame:f=>f(),getNewPersonalRecords:()=>[],showSaveReward(){},buildSaveReward(){},
      WRCBonusStreaks:{state:p=>run(c.allEntries,'2026-05-07',p),afterSave:(before,saved)=>{const s=C.achievement(before,run(c.allEntries,'2026-05-07'),saved.date);if(s)success.push(s);}},
      supabaseClient:{from:()=>({insert:async payload=>{pending=payload[0];return {error:mode==='failed-write'?{message:'failed'}:null}},update:payload=>({eq:async()=>{pending=payload;return {error:null}}})})},
      loadEntries:async()=>{tasks.push('reload');if(mode==='failed-reload')return false;c.allEntries=[...rows.filter(e=>e.date!==pending.date),pending];return true;}};
    vm.createContext(c);vm.runInContext(read('entries-utils.js'),c);vm.runInContext(source,c);await c.saveEntry();
    if(['failed-write','failed-reload','unchanged'].includes(mode))assert.equal(success.length,0,mode);
    else{assert.equal(success.length,1,mode);assert.equal(success[0].patches[0].milestone,7);}
    if(mode==='failed-write')assert.equal(tasks.length,0);
  }
  console.log('PASS real save lifecycle: insert/merge/edit, backdated milestone, unchanged/failed write/failed reload');
}
function integration() {
  const html=read('index.html'),sw=read('service-worker.js');
  for(const name of ['modules/bonus-streaks/bonus-streaks-core.js','modules/bonus-streaks/bonus-streaks.js','entries-service.js','service-worker.js']) new vm.Script(read(name));
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!m[1].includes('src=')&&m[2].trim())new vm.Script(m[2]);
  for(const file of ['bonus-streaks-core.js','bonus-streaks.js','bonus-streaks.css'])assert.ok(sw.includes('./modules/bonus-streaks/'+file));
  assert.match(html,/WRCBonusStreaks\.renderProfile\(player\)/);assert.match(html,/WRCBonusStreaks\.renderPatches\(player\)/);
  assert.match(read('modules/bonus-streaks/bonus-streaks.css'),/prefers-reduced-motion/);
  console.log('PASS main integration, offline assets and JavaScript syntax');
}
function testController() {
  const scheduled=[];
  const c={console,Date:class extends Date{constructor(...args){super(...(args.length?args:['2026-05-08T12:00:00']));}},
    allEntries:range('2026-05-01','2026-05-06'),setInterval(){},setTimeout:(fn,delay)=>scheduled.push({fn,delay}),clearTimeout(){},
    document:{getElementById:()=>null,addEventListener(){}}};
  c.window=c;vm.createContext(c);
  vm.runInContext(read('scoring.js')+read('modules/bonus-streaks/bonus-streaks-core.js')+read('modules/bonus-streaks/bonus-streaks.js'),c);
  const ui=c.WRCBonusStreaks;ui.onEntriesLoaded();
  assert.equal(ui.renderPatches('Marian'),'');assert.equal(scheduled.length,0);
  const before=ui.state('Marian');c.allEntries=[...c.allEntries,entry('2026-05-07')];ui.onEntriesLoaded();
  const patches=ui.renderPatches('Marian');assert.match(patches,/Angefeuert/);assert.doesNotMatch(patches,/Wurstwender|Glutmeister|Feuerhüter|Grilllegende|Flammenkrone|Ewige Glut/);
  assert.equal((patches.match(/data-bs-patch=/g)||[]).length,1);
  assert.equal(scheduled.length,0,'load and retroactive discovery do not celebrate');
  ui.afterSave(before,entry('2026-05-07'));ui.afterSave(before,entry('2026-05-07'));
  assert.equal(scheduled.length,1,'concurrent saves of the same snapshot only celebrate once');
  const markup=ui.renderProfile('Marian');assert.match(markup,/8.5.2026: Heute noch offen/);assert.match(markup,/data-bs-month="-1"[^>]*disabled/);
  assert.doesNotMatch(ui.renderProfile('Basti'),/data-bs-patch=/);
  console.log('PASS UI controller: hidden unearned motifs, read-only reload, duplicate-save suppression, calendar lower bound');
}
(async()=>{await testLoading();await testSaveHook();testController();integration();console.log(`${checks} replay scenarios plus load/save/UI integration passed.`);})().catch(e=>{console.error(e);process.exitCode=1;});

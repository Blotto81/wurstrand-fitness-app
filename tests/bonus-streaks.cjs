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

test('one bonus starts; pause is neutral; today stays open',()=>{
 const rows=[entry('2026-05-01')];assert.equal(run(rows,'2026-05-01').current,1);
 assert.equal(run(rows,'2026-05-02').days.at(-1).status,'open');
 const pause=run(rows,'2026-05-03');assert.equal(pause.current,1);assert.equal(pause.days.at(-2).status,'pause');
 assert.equal(run([...rows,entry('2026-05-03')],'2026-05-03').current,2);
});
test('alternating bonus and single pause days work indefinitely',()=>{
 const rows=range('2026-05-01','2027-06-04').filter((_,i)=>i%2===0),s=run(rows,'2027-06-04');assert.equal(s.current,rows.length);assert.equal(s.record,rows.length);assert.equal(s.patches.find(p=>p.milestone===7).date,'2026-05-13');
});
test('second completed miss ends a series; next bonus starts at one',()=>{
 const rows=range('2026-05-01','2026-05-07');assert.equal(run(rows,'2026-05-09').current,7);
 const end=run(rows,'2026-05-10');assert.equal(end.current,0);assert.equal(end.record,7);assert.equal(end.days.find(d=>d.date==='2026-05-09').broke,true);assert.equal(end.patches.length,1);
 assert.equal(run([...rows,entry('2026-05-10')],'2026-05-10').current,1);
});
test('patches require a single series and persist when that series ends',()=>{
 assert.equal(run([...range('2026-05-01','2026-05-06'),...range('2026-05-09','2026-05-14')],'2026-05-14').patches.length,0);
 const s=run(range('2026-05-01','2026-05-14'),'2026-05-20');assert.equal(s.current,0);assert.equal(s.record,14);assert.deepEqual(plain(s.patches.map(p=>p.milestone)),[7,14]);
});
test('backfill reconnects history; deletion and correction revoke unsupported patches',()=>{
 const rows=range('2026-05-01','2026-05-14'),snapshot=JSON.stringify(rows);
 const gap=rows.filter(e=>!['2026-05-06','2026-05-07'].includes(e.date));assert.equal(run(gap,'2026-05-14').current,7);
 const restored=run([...gap,entry('2026-05-06')],'2026-05-14');assert.equal(restored.current,13);assert.equal(restored.patches.length,1);
 const corrected=rows.map(e=>e.date==='2026-05-05'?{...e,bike:0}:e);assert.equal(run(corrected,'2026-05-14').current,13);assert.equal(run(corrected,'2026-05-14').patches.length,1);assert.equal(JSON.stringify(rows),snapshot);
});
test('all seven patches, month/year boundaries and leap day',()=>{
 const s=run(range('2026-05-01','2027-05-02'),'2027-05-02');assert.equal(s.current,367);assert.deepEqual(plain(s.patches.map(p=>p.milestone)),[7,14,30,60,100,180,365]);
 const rows=[entry('2026-12-31'),entry('2027-01-02')];assert.equal(run(rows,'2027-01-03').current,2);assert.equal(run(rows,'2027-01-05').current,0);
 assert.equal(C.nextDay('2028-02-28'),'2028-02-29');assert.equal(C.nextDay('2028-02-29'),'2028-03-01');assert.equal(C.nextDay('2026-10-25'),'2026-10-26');
});
test('players independent; future, pre-start and invalid entries excluded',()=>{
 const rows=[...range('2026-05-01','2026-05-07','Thorsten'),entry('2026-05-07'),entry('2026-04-30'),entry('2026-05-09'),entry('2026-02-30')];
 assert.equal(run(rows,'2026-05-07','Thorsten').current,7);assert.equal(run(rows,'2026-05-07').current,1);assert.equal(run(rows,'2026-05-07','Basti').current,0);
 assert.deepEqual(plain(run(rows,'2026-05-07')),plain(run([...rows].reverse(),'2026-05-07')));assert.equal(run(rows,'2026-04-30').days.length,0);assert.throws(()=>run(rows,'invalid'));
});
test('historical bonus rules stay authoritative; duplicate dates count once',()=>{
 const old={person:'Marian',date:'2026-05-01',steps:1000,bike:1,exercise:true};assert.equal(run([old],'2026-05-01').current,1);assert.equal(run([{...old,date:'2026-07-01'}],'2026-07-01').current,0);
 assert.equal(C.calculate([{date:'2026-05-01',person:'Marian'}],'Marian','2026-05-01',()=>({bonus:4})).current,1);assert.equal(run([entry('2026-05-01'),entry('2026-05-01')],'2026-05-01').current,1);
});
test('only a newly earned milestone creates an achievement',()=>{
 const rows=range('2026-05-01','2026-05-06'),before=run(rows,'2026-05-07'),after=run([...rows,entry('2026-05-07')],'2026-05-07');assert.equal(C.achievement(before,after,'2026-05-07').patches[0].milestone,7);assert.equal(C.achievement(after,after,'2026-05-07'),null);
 assert.equal(C.achievement(run([],'2026-05-01'),run([entry('2026-05-01')],'2026-05-01'),'2026-05-01'),null);
});
test('no bonus-series joker state or UI remains',()=>{
 for(const name of ['bonus-streaks-core.js','bonus-streaks.js','bonus-streaks.css'])assert.doesNotMatch(read('modules/bonus-streaks/'+name),/joker|shield|bs-calendar|renderEntry/i);
 const state=run(range('2026-05-01','2026-05-10'),'2026-05-13');assert.ok(!('jokers' in state));assert.ok(state.days.every(d=>!('credit' in d)&&!('jokers' in d)));
 assert.doesNotMatch(read('index.html'),/bonusStreakEntry|WRCBonusStreaks\.renderEntry/);
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
 let now='2026-05-07T12:00:00',blocked=false;const scheduled=[],store=new Map(),notices=[];
 const c={console,Date:class extends Date{constructor(...args){super(...(args.length?args:[now]));}},allEntries:range('2026-05-01','2026-05-06'),setInterval(){},setTimeout:(fn,delay)=>(scheduled.push({fn,delay}),scheduled.length),clearTimeout(){},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},document:{getElementById:()=>null,addEventListener(){},querySelector:()=>blocked?{}:null,createElement:()=>({setAttribute(){},remove(){}}),body:{append:b=>notices.push(b)}}};
 c.window=c;vm.createContext(c);vm.runInContext(read('scoring.js')+read('modules/bonus-streaks/bonus-streaks-core.js')+read('modules/bonus-streaks/bonus-streaks.js'),c);const ui=c.WRCBonusStreaks;ui.onEntriesLoaded();
 assert.equal(ui.renderProfile('Basti'),'');assert.match(ui.renderProfile('Marian'),/6 erfolgreiche Bonustage/);assert.equal(ui.renderPatches('Marian'),'');assert.equal(scheduled.length,0);
 const before=ui.state('Marian');c.allEntries=[...c.allEntries,entry('2026-05-07')];ui.onEntriesLoaded();assert.match(ui.renderPatches('Marian'),/Angefeuert/);assert.doesNotMatch(ui.renderPatches('Marian'),/Wurstwender/);ui.afterSave(before,entry('2026-05-07'));ui.afterSave(before,entry('2026-05-07'));assert.equal(scheduled.length,1);
 blocked=true;scheduled.shift().fn();assert.equal(notices.length,0);blocked=false;scheduled.shift().fn();assert.equal(notices.length,1);assert.match(notices[0].innerHTML,/7 Bonustage – Angefeuert/);assert.doesNotMatch(notices[0].innerHTML,/button|dialog/);
 now='2026-05-10T12:00:00';ui.onEntriesLoaded();assert.equal(ui.renderProfile('Marian'),'');assert.match(ui.renderPatches('Marian'),/Angefeuert/);
 c.allEntries=[entry('2026-05-08'),entry('2026-05-09')];ui.onEntriesLoaded();assert.equal(ui.renderProfile('Marian'),'');c.allEntries=[...c.allEntries,entry('2026-05-10')];ui.onEntriesLoaded();assert.match(ui.renderProfile('Marian'),/3 erfolgreiche Bonustage/);
 now='2026-05-12T12:00:00';ui.onEntriesLoaded();assert.match(ui.renderProfile('Marian'),/3 erfolgreiche Bonustage/);now='2026-05-13T12:00:00';ui.onEntriesLoaded();assert.equal(ui.renderProfile('Marian'),'');
 const count=scheduled.length;c.allEntries=range('2026-05-01','2026-05-13').filter(e=>e.date!=='2026-05-06');ui.onEntriesLoaded();const past=ui.state('Marian');c.allEntries=[...c.allEntries,entry('2026-05-06')];ui.onEntriesLoaded();ui.afterSave(past,entry('2026-05-06'));assert.equal(scheduled.length,count,'backfill stays silent');
 console.log('PASS profile 3-day threshold, pause, disappearance, preserved patches, one small deferred notice and silent backfills');
}
function testDaily(){
 const store=new Map();const c={DailyUI:{jokerKey:'daily-jokers',maxJokersPerMonth:3,getMonthKey:()=> '2026-10'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}};vm.createContext(c);vm.runInContext(read('modules/daily/daily-storage.js')+';Object.assign(DailyUI,WRCDailyStorage);',c);
 const api=c.DailyUI;assert.equal(api.getJokersUsed('Marian'),0);assert.equal(api.useJoker('Marian'),true);assert.equal(api.useJoker('Marian'),true);assert.equal(api.useJoker('Marian'),true);assert.equal(api.useJoker('Marian'),false);assert.equal(api.getJokersUsed('Basti'),0);api.getMonthKey=()=> '2026-11';assert.equal(api.getJokersUsed('Marian'),0);console.log('PASS separate Daily joker usage, monthly limit, player isolation and monthly renewal');
}
(async()=>{await testLoading();await testSaveHook();testController();testDaily();integration();console.log(checks+' replay scenarios plus load/save/UI/Daily integration passed.');})().catch(e=>{console.error(e);process.exitCode=1;});

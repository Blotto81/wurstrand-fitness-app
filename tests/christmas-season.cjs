const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function context(date,storage=new Map(),hostname='localhost',backend=null){
 const location=new URL('http://'+hostname+'/?holiday='+date+'&holiday-player=Thorsten');
 const c={URL,URLSearchParams,console,location,Date:class extends Date{constructor(...a){super(...(a.length?a:[date+'T12:00:00']));}},history:{state:null,replaceState(_s,_t,url){location.href=url.href;}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},supabaseClient:backend||{from(){throw Error('Preview read production');},rpc(){throw Error('Preview wrote production');}}};c.window=c;vm.createContext(c);
 for(const f of ['scoring.js','modules/holidays/holiday-calendar.js','modules/birthday/member-birthday-data.js','modules/holidays/holiday-data.js','modules/holidays/christmas-season.js','modules/insights/insights.js'])vm.runInContext(read(f),c);return c;
}
function extract(name){const html=read('index.html'),start=html.indexOf('    function '+name+'(');return html.slice(start,html.indexOf('\n    function ',start+10));}
(async()=>{
const C=context('2026-11-29').WRCHolidayCalendar;
assert.deepEqual(Array.from(C.adventSundays(2026)),['2026-11-29','2026-12-06','2026-12-13','2026-12-20']);
for(let y=2026;y<=2100;y++){
 const days=Array.from(C.adventSundays(y));assert.equal(days.length,4);for(let i=0;i<4;i++){assert.equal(new Date(days[i]+'T12:00:00').getDay(),0);if(days[i]<y+'-12-24'){assert.equal(C.advent(days[i]).lit,i+1);assert.equal(C.advent(days[i]).ignition,true);}}
 assert.equal(C.advent(y+'-12-24'),null);assert.equal(C.advent(y+'-12-31'),null);assert.equal(C.advent(y+'-11-26'),null);
}
assert.equal(C.advent('2025-12-06'),null);assert.equal(C.advent('2026-12-07').lit,2);assert.equal(C.advent('2026-12-07').ignition,false);assert.equal(C.advent('bad'),null);
const ignitionStore=new Map(),first=context('2026-12-06',ignitionStore);assert.equal(first.WRCChristmasSeason.ignition(C.advent('2026-12-06')),true);assert.equal(first.WRCChristmasSeason.ignition(C.advent('2026-12-06')),false);assert.equal(context('2026-12-06',ignitionStore).WRCChristmasSeason.ignition(C.advent('2026-12-06')),false);assert.equal(first.WRCChristmasSeason.ignition(C.advent('2026-12-07')),false);
const storage=new Map();let c=context('2026-12-06',storage);await c.WRCHolidayData.load();
await assert.rejects(c.WRCHolidayData.claim('nikolaus','Thorsten'));await assert.rejects(c.WRCHolidayData.claim('nikolaus','Thorsten',{choice:2}));
const rows=await Promise.all([c.WRCHolidayData.claim('nikolaus','Thorsten',{choice:0}),c.WRCHolidayData.claim('nikolaus','Thorsten',{choice:1})]);assert.equal(rows[0].points,-1);assert.equal(rows[1].points,-1);assert.equal(c.WRCBonusPoints.points(),-1);
for(const scope of [{person:'Thorsten'},{key:'2026-12'},{key:'2026-'},{date:'2026-12-06'},{through:'2026-12-31'}])assert.equal(c.WRCBonusPoints.points(scope),-1);
assert.equal(context('2026-12-06',storage).WRCBonusPoints.points(),-1);assert.equal((await context('2027-12-06',storage).WRCHolidayData.claim('nikolaus','Thorsten',{choice:1})).points,1);assert.equal(context('2027-12-06',storage).WRCBonusPoints.points({key:'2026-'}),-1);
await assert.rejects(context('2026-12-05',storage).WRCHolidayData.claim('nikolaus','Fabi',{choice:0}));await assert.rejects(context('2026-12-07',storage).WRCHolidayData.claim('nikolaus','Fabi',{choice:1}));
c=context('2026-12-06',new Map());c.people=Array.from(C.members);c.allEntries=c.people.map(person=>({person,date:'2026-12-01',steps:10000}));c.monthGoals={'2026-12':1000};c.HISTORIC_MONTH_POINTS={};for(const n of ['monthTotalPoints','getTeamMonthForecast'])vm.runInContext(extract(n),c);const before=c.getTeamMonthForecast('2026-12'),original=JSON.stringify(c.allEntries);await c.WRCHolidayData.claim('nikolaus','Thorsten',{choice:0});const after=c.getTeamMonthForecast('2026-12');assert.equal(after.currentTotal,before.currentTotal-1);assert.equal(after.forecast,before.forecast-1);assert.equal(after.basisTotal,before.basisTotal);assert.equal(c.monthTotalPoints('2026-12'),after.currentTotal);assert.equal(JSON.stringify(c.allEntries),original);
const stats=c.WRCHolidayData.yearStats(c.allEntries,2026,'Thorsten','2026-12-31',{},()=>[]);assert.equal(stats.bonus,-1);assert.equal(stats.points,c.calcPoints(c.allEntries[0]).total-1);
// Historical Nikolaus certificates stay readable; malformed new signed receipts do not enter totals.
const legacy={event_type:'nikolaus',event_year:2026,player:'Fabi',event_date:'2026-12-06',points:0,choice:null,result:null};const mixed=new Map([['wrcHolidayPreview_v1',JSON.stringify([legacy,{...legacy,player:'Marian',nikolaus_version:2,choice:0,points:1},{...legacy,player:'Basti',nikolaus_version:2,choice:1,points:1}])]]);const old=context('2026-12-06',mixed);assert.ok(old.WRCHolidayData.receipt('nikolaus','Fabi',2026));assert.equal(old.WRCHolidayData.receipt('nikolaus','Marian',2026),null);assert.equal(old.WRCBonusPoints.points(),1);
for(const date of ['2026-12-24','2026-12-25','2026-12-26']){const gift=context(date,storage);await gift.WRCHolidayData.claim('christmas','Thorsten');assert.equal(gift.WRCBonusPoints.points({key:'2026-12'}),4);}await context('2027-12-24',storage).WRCHolidayData.claim('christmas','Thorsten');assert.equal(context('2027-12-24',storage).WRCBonusPoints.points({key:'2027-12'}),6);
const live=context('2026-12-06',new Map(),'example.com');assert.equal(live.WRCHolidayData.preview,false);assert.equal(live.WRCHolidayCalendar.preview,false);
for(const f of ['holiday-calendar.js','holiday-data.js','christmas-season.js','holidays.js'])new vm.Script(read('modules/holidays/'+f));
console.log('PASS Christmas: 75 years of Advent, ignition once/reload, -1/+1 full aggregation and forecast, duplicate choice, annual renewal, legacy/malformed receipts, preview isolation, Christmas unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1;});

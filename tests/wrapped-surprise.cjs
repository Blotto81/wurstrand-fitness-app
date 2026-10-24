const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('modules/year-review/year-review.js','utf8');
function harness(date){
 let now=date,player='Marian',available=true,busy=false;const ids=new Map(),events={},timeouts=[],intervals=[],calls=[],notices=[],store=new Map();
 class Clock extends Date{constructor(...a){super(...(a.length?a:[now]));}}
 function node(){return {style:{},addEventListener(){},remove(){ids.delete(this.id)},append(n){ids.set(n.id,n)}};}
 ids.set('dashboard',node());ids.set('person',{get value(){return player},addEventListener(name,fn){events.person=fn}});
 const ctx={Date:Clock,Intl,location:{hostname:'app.example'},window:{addEventListener(){}},people:['Marian','Fabi'],localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{hidden:false,body:node(),getElementById:id=>ids.get(id),createElement:node,querySelector:()=>null,addEventListener:(n,f)=>events[n]=f},setTimeout:f=>(timeouts.push(f),timeouts.length),clearTimeout(){},setInterval:f=>intervals.push(f),cancelAnimationFrame(){},WRCPost:{show:(data,options)=>{if(busy)return false;notices.push(options.badge);return true;}},WRCWrappedData:{load:async(year,p)=>{calls.push({year,p});return {server_date:now.slice(0,10),personal_available:available,team_available:false}}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
 return {ids,calls,notices,ctx,async start(){events.DOMContentLoaded();ctx.window.WRCYearReview.onEntriesLoaded();await settle();while(timeouts.length){await timeouts.shift()();}await settle();},async tick(){for(const fn of intervals)await fn();await settle();},async switchPlayer(p){player=p;events.person();await settle();},setDate:d=>now=d,setAvailable:a=>available=a,setBusy:b=>busy=b};
}
(async()=>{
 const early=harness('2026-12-24T12:00:00Z');await early.start();assert.equal(early.ids.has('wrcWrappedLaunch'),false);assert.equal(early.notices.length,0);assert.equal(early.calls.length,0);console.log('PASS no teaser or request before December 25');
 const locked=harness('2026-12-25T12:00:00Z');locked.setAvailable(false);await locked.start();assert.equal(locked.ids.has('wrcWrappedLaunch'),false);assert.equal(locked.notices.length,0);console.log('PASS server release required inside season');
 const h=harness('2026-12-25T12:00:00Z');h.setBusy(true);await h.start();assert.equal(h.ids.has('wrcWrappedLaunch'),true);assert.equal(h.notices.length,0);h.setBusy(false);await h.tick();assert.deepEqual(h.notices,['WRAPPED 2026']);await h.tick();assert.equal(h.notices.length,1);console.log('PASS busy post retries; surprise shown once per player and year');
 h.setDate('2026-12-31T22:59:00Z');await h.tick();assert.equal(h.ids.has('wrcWrappedLaunch'),true);h.setDate('2026-12-31T23:00:00Z');await h.tick();assert.equal(h.ids.has('wrcWrappedLaunch'),false);assert.equal(await h.ctx.window.WRCYearReview.open('Marian',2026),false);console.log('PASS January 1 Berlin removes entry and blocks direct opening');
 h.setDate('2027-12-25T12:00:00Z');await h.tick();assert.equal(h.ids.has('wrcWrappedLaunch'),true);assert.deepEqual(h.notices,['WRAPPED 2026','WRAPPED 2027']);assert.equal(h.calls.at(-1).year,2027);assert.equal(await h.ctx.window.WRCYearReview.open('Marian',2026),false);console.log('PASS annual surprise renews for current year only');
 await h.switchPlayer('Fabi');await h.tick();assert.equal(h.calls.at(-1).p,'Fabi');assert.equal(h.notices.length,3);console.log('PASS players have separate annual surprise state');
})().catch(e=>{console.error(e);process.exitCode=1});

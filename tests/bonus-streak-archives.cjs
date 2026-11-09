const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const c=vm.createContext({console,Date,Intl,Map,Set});c.window=c;
for(const p of ['scoring.js','modules/bonus-streaks/bonus-streaks-core.js','modules/insights/insights.js','modules/year-review/wrapped-story.js'])vm.runInContext(read(p),c);
const index=read('index.html');vm.runInContext(index.slice(index.indexOf('    function cleanLoadedEntries('),index.indexOf('    function editEntry(')),c);
c.WRCClubs={definitions:[]};c.HISTORIC_PLAYER_TOTALS={};c.HISTORIC_TOTALS={};
vm.runInContext(read('modules/insights/occasions.js'),c);
const entries=Array.from({length:13},(_,i)=>({date:'2026-07-'+String(i+1).padStart(2,'0'),person:'Marian',steps:3000,bike:3,exercise:true})).filter((_,i)=>i%2===0);
const base={year:2026,through:'2026-12-23',players:['Marian','Thorsten','Basti','Fabi'],entries,history:{},dailys:[],bonuses:[],games:[],halloween:[],easter:[]};
const copy=JSON.stringify(base),ctx=c.WRCOccasions.context();
const legacy=c.WRCInsights.build({...ctx,...base,streakRulesVersion:1});
for(const version of [1,2,3]){
 const snap={...base,version};const old=c.WRCOccasions.archive(snap,'2026-11-08T12:00:00Z');
 assert.equal(JSON.stringify(old),JSON.stringify(legacy));
 assert.equal(old.players[0].bonusStreak,7);
 assert.equal(JSON.stringify(c.WRCWrappedStory.personal(old,'Marian')),JSON.stringify(c.WRCWrappedStory.personal(legacy,'Marian')));
 assert.equal(JSON.stringify(c.WRCWrappedStory.team(old)),JSON.stringify(c.WRCWrappedStory.team(legacy)));
 assert.equal(c.WRCOccasions.archive(snap).players[0].bonusStreak,7);
 assert.equal(c.WRCOccasions.archive(snap,'not-a-date').players[0].bonusStreak,7);
}
for(const version of [1,2])assert.equal(c.WRCOccasions.archive({...base,version},'2026-12-25T12:00:00Z').players[0].bonusStreak,7);
const fresh=c.WRCOccasions.archive({...base,version:3},'2026-12-25T12:00:00Z');
const live=c.WRCInsights.build({...ctx,...base});
assert.equal(fresh.players[0].bonusStreak,3);assert.equal(JSON.stringify(fresh),JSON.stringify(live));
assert.equal(fresh.players[0].points,legacy.players[0].points);assert.equal(fresh.players[0].streakEarned,legacy.players[0].streakEarned);
assert.equal(JSON.stringify(base),copy);
for(const name of base.players){const s=c.WRCBonusStreakCore.calculate(entries,name,base.through);assert.equal(live.players.find(p=>p.name===name).bonusStreak,s.record);}
for(const occasion of ['birthday','christmas','message','honor'])assert.doesNotMatch(c.WRCOccasions.occasion('Marian',entries,base.through,occasion),/joker|schutz|pausentag|gerettete serie/i);
assert.doesNotMatch(JSON.stringify(c.WRCWrappedStory.personal(fresh,'Marian'))+JSON.stringify(c.WRCWrappedStory.team(fresh)),/joker|schutz|pausentag|gerettete serie/i);
assert.match(read('modules/year-review/year-review.js'),/archive\(data.snapshot,data.frozen_at\)/);
console.log('PASS immutable v1/v2/v3 archives, original personal/team stories, absent timestamps fail closed, new v3 uses central v2 rules, same points, sources untouched, no visible protection facts.');

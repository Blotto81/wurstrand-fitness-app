/* Shared, read-only occasion facts. Version 1 is retained for frozen Wrapped archives. */
(function(root){
  'use strict';
  const providers = new Map();
  const fmt=(n,d=0)=>Number(n||0).toLocaleString('de-DE',{maximumFractionDigits:d});
  const dateOK=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&!Number.isNaN(Date.parse(d+'T12:00:00Z'))&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;
  const distance=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000);
  const round=n=>Math.round(n*1000)/1000;
  function register(id, provider){if(providers.has(id))throw Error('Duplicate insight provider: '+id);providers.set(id,provider);}
  function build(options){
    const {year,through,players,score,clean,streakCore,clubDefinitions=[]}=options;
    if(!dateOK(through)||!Number.isInteger(year)||typeof score!=='function'||typeof clean!=='function')throw Error('Incomplete insight context');
    const start=year+'-01-01',end=[through,year+'-12-31'].sort()[0];
    const archive=clean((options.entries||[]).filter(e=>dateOK(e.date)&&e.date<=end)).sort((a,b)=>a.date.localeCompare(b.date)||a.person.localeCompare(b.person));
    const inYear=d=>dateOK(d)&&d>=start&&d<=end;
    const history=year===2026&&end>='2026-04-30'?(options.history||{}):{};
    const members=[...new Set(players)];
    const result={version:1,year,through:end,players:[],team:{},facts:[]};
    for(const name of members){
      const all=archive.filter(e=>e.person===name),own=all.filter(e=>inYear(e.date));
      const h=history.players?.[name]||{};
      const activity=own.filter(e=>score(e).total>0);
      const p={name,year,through:end,steps:+h.steps||0,bike:+h.bike||0,squats:+h.squats||0,pushups:+h.pushups||0,exercises:+h.exercises||0,trainingPoints:+h.points||0,bonusDays:+h.bonusCount||0,bonusPoints:+h.bonusPoints||0,activeDays:activity.length,activityStreak:0,streakEarned:0,jokersUsed:0,bonusStreak:0,carriedIn:0,patches:[],records:[],months:[],dailyCount:null,bestDay:null,comeback:null,historical:!!h.points};
      let run=0,previous=null;const monthMap=new Map();
      for(const e of own){const scored=score(e);for(const key of ['steps','bike','squats','pushups'])p[key]+=Number(e[key])||0;p.exercises+=e.exercise?1:0;p.trainingPoints+=scored.total;p.bonusDays+=scored.bonus>0?1:0;p.bonusPoints+=scored.bonus;
        if(scored.total>0){run=previous&&distance(previous,e.date)===1?run+1:1;p.activityStreak=Math.max(p.activityStreak,run);if(previous&&distance(previous,e.date)>=15&&(!p.comeback||distance(previous,e.date)-1>p.comeback.pause))p.comeback={date:e.date,pause:distance(previous,e.date)-1};previous=e.date;}
        if(scored.total>0&&(!p.bestDay||scored.total>p.bestDay.points))p.bestDay={date:e.date,points:scored.total};
        const month=e.date.slice(0,7),m=monthMap.get(month)||{month,points:0,days:0};m.points+=scored.total;m.days+=scored.total>0?1:0;monthMap.set(month,m);
      }
      p.months=[...monthMap.values()].map(m=>({...m,points:round(m.points)}));
      p.bestMonth=[...p.months].sort((a,b)=>b.points-a.points||a.month.localeCompare(b.month))[0]||null;
      const ledger=(options.bonuses||[]).filter(g=>g.recipient===name&&inYear(g.gift_date));
      p.giftPoints=ledger.reduce((s,g)=>s+(+g.points||0),0);p.points=round(p.trainingPoints+p.giftPoints);p.bike=round(p.bike);
      if(Array.isArray(options.dailys))p.dailyCount=new Set(options.dailys.filter(d=>d.player===name&&inYear(d.completed_date)).map(d=>d.completed_date+':'+d.daily_id)).size;
      if(streakCore&&end>=streakCore.START){
        // Replay all prior history once, then project only this year's earned days.
        const state=streakCore.calculate(archive,name,end,score),days=state.days.filter(d=>inYear(d.date));
        let earned=0,series=null;
        for(const d of days){if(d.seriesStart!==series){earned=0;series=d.seriesStart;}if(d.status==='bonus'){earned++;p.streakEarned++;p.bonusStreak=Math.max(p.bonusStreak,earned);}if(d.status==='protected')p.jokersUsed++;}
        p.carriedIn=state.days.filter(d=>d.date<start).at(-1)?.current||0;
        p.patches=state.patches.filter(x=>inYear(x.date)).map(x=>({kind:'bonus',name:x.milestone+' Bonustage',date:x.date,value:x.milestone,seriesStart:x.seriesStart}));
        const priorRecord=Math.max(0,...state.days.filter(d=>d.date<start).map(d=>d.current));
        const yearRecord=Math.max(0,...days.filter(d=>d.status==='bonus').map(d=>d.current));
        if(yearRecord>priorRecord)p.streakRecord={value:yearRecord,date:days.find(d=>d.current===yearRecord)?.date,carried:priorRecord>0};
      }
      for(const club of clubDefinitions){for(const tier of club.tiers){const first=all.find(e=>(+e[club.metric]||0)>=tier.threshold);if(first&&inYear(first.date))p.patches.push({kind:'sport',name:tier.title,date:first.date,value:tier.threshold,metric:club.metric});}}
      // These are records of the detailed archive, not unprovable lifetime records.
      for(const metric of ['steps','bike','squats','pushups','points']){let best=0;for(const e of all){const value=metric==='points'?score(e).total:(+e[metric]||0);if(value>best){if(inYear(e.date)&&best>0)p.records.push({metric,date:e.date,value,previous:best});best=value;}}}
      const prev=all.filter(e=>e.date>=`${year-1}-01-01`&&e.date<=`${year-1}${end.slice(4)}`);
      if(prev.length&&own.length){const old=prev.reduce((s,e)=>s+score(e).total,0);if(old>0)p.previousYear={points:round(old),current:round(own.reduce((s,e)=>s+score(e).total,0)),delta:round(own.reduce((s,e)=>s+score(e).total,0)-old),days:prev.length,partial:true};}
      const months=p.months.filter(m=>m.days>=7);if(months.length>=2){const first=months[0],last=months.at(-1),a=first.points/first.days,b=last.points/last.days;if(b>a*1.1)p.improvement={from:first.month,to:last.month,percent:Math.round((b/a-1)*100),basis:'Punkte je aktivem Tag; mindestens 7 aktive Tage je Monat'};}
      result.players.push(p);
    }
    const t=result.team;for(const key of ['steps','bike','squats','pushups','exercises','points','trainingPoints','giftPoints','activeDays','bonusDays','bonusPoints','streakEarned','jokersUsed'])t[key]=round(result.players.reduce((sum,p)=>sum+p[key],0));
    // Existing legacy team totals are authoritative where individual legacy sums differ.
    for(const key of ['steps','bike','squats','pushups','exercises'])if(history.team&&Number.isFinite(history.team[key]))t[key]=round(t[key]-result.players.reduce((s,p)=>s+(+history.players?.[p.name]?.[key]||0),0)+history.team[key]);
    if(history.team?.points){const correction=history.team.points-result.players.reduce((s,p)=>s+(+history.players?.[p.name]?.points||0),0);t.points=round(t.points+correction);t.trainingPoints=round(t.trainingPoints+correction);}
    t.calendarDays=new Set(archive.filter(e=>members.includes(e.person)&&inYear(e.date)&&score(e).total>0).map(e=>e.date)).size;
    t.dailyCount=Array.isArray(options.dailys)?result.players.reduce((s,p)=>s+p.dailyCount,0):null;t.patches=result.players.reduce((s,p)=>s+p.patches.length,0);t.records=result.players.reduce((s,p)=>s+p.records.length,0);
    for(const p of result.players){for(const [id,value,unit] of [['steps',p.steps,'Schritte'],['bike',p.bike,'km auf dem Rad'],['bonus-series',p.bonusStreak,'verdiente Bonustage in einer Serie'],['jokers',p.jokersUsed,'geschützte Tage'],['patches',p.patches.length,'neue Patches']])if(value>0)result.facts.push({id,player:p.name,from:start,through:end,value,unit,occasions:['birthday','christmas','personal-wrapped','team-wrapped','honor','message']});}
    for(const [id,provider] of providers){const facts=provider({result,archive,inYear,options});for(const f of facts||[])if(members.includes(f.player)&&Number.isFinite(f.value)&&f.value>0&&(!f.date||inYear(f.date)))result.facts.push({...f,provider:id});}
    result.awards=awards(result);return result;
  }
  function awards(result){
    const definitions=[['bonusStreak',7,['Der Glutminister','Die ewige Grillwache'],'verdiente Bonustage in einer Serie','Bertha hat den Feuerlöscher vorsorglich weggeräumt.'],['bike',1,['Die Kettenreaktion','Der Sattel-Souverän'],'Kilometer auf dem Rad','Dein Sattel hat einen Urlaubsantrag eingereicht.'],['steps',1,['Der Sohlen-Sprinter','Die wandernde Wurst'],'Schritte','Selbst deine Schuhe möchten kurz sitzen.'],['dailyCount',1,['Der Missionsmeister','Der Daily-Detektiv'],'erfolgreiche Dailys','Auftrag erledigt. Bertha hatte nichts anderes erwartet.'],['exercises',1,['Der Trainings-Taktgeber','Die Übungs-Instanz'],'Übungseinheiten','Die Ausrede war da. Du warst trotzdem aktiv.'],['activeDays',2,['Der Wiederkommer','Die WRC-Konstante'],'aktive Tage','Immer wieder da. Genau davon lebt der Wurstrand.']];
    const picks=[];for(const p of result.players){for(const [key,min,titles,unit,joke] of definitions){if(p[key]>=min){const max=Math.max(...result.players.map(x=>x[key]||0));picks.push({player:p.name,key,value:p[key],unit,title:titles[result.year%titles.length],joke,strength:p[key]/max+(key==='bonusStreak'?.12:0)});}}if(p.comeback)picks.push({player:p.name,key:'comeback',value:p.comeback.pause,unit:'Tage Pause vor deiner Rückkehr',title:'Die Wiederauferstehung',joke:'Der Wurstrand hatte die Bühne für dich freigehalten.',strength:.95,date:p.comeback.date});}
    picks.sort((a,b)=>b.strength-a.strength||a.player.localeCompare(b.player)||a.key.localeCompare(b.key));
    const used=new Set(),chosen=new Map();for(const pick of picks)if(!chosen.has(pick.player)&&!used.has(pick.key)){chosen.set(pick.player,pick);used.add(pick.key);}
    return result.players.map((p,i)=>chosen.get(p.name)||{player:p.name,key:'welcome',title:['Ein Platz am Feuer','Teil dieser Truppe','Mitten im Wurstrand','Unser vierter Musketier'][i%4],value:null,unit:'',joke:p.activeDays?`${fmt(p.activeDays)} ${p.activeDays===1?'aktiver Tag hat':'aktive Tage haben'} dieses Jahr mitgeschrieben. Danke dafür.`:'Für diesen Zeitraum liegt keine belegte Aktivität vor. Dein Platz in der Runde bleibt trotzdem deiner.'});
  }
  register('games', ({result,inYear,options}) => {
    if(!Array.isArray(options.games))return [];
    return result.players.flatMap(p=>{
      const games=new Map(options.games.filter(g=>g.player===p.name&&inYear(g.date)&&g.place>=1&&g.place<=6).map(g=>[g.kind+':'+g.id,g]));
      return games.size?[{id:'games',player:p.name,value:games.size,unit:'gespeicherte Dart-/UNO-Partien',label:'Auch am Spieltisch dabei.',text:[...games.values()].filter(g=>g.place===1).length+' davon auf Platz 1. Aus gespeicherten Ergebnissen.',from:result.year+'-01-01',through:result.through,occasions:['personal-wrapped','team-wrapped','birthday','christmas','honor','message']}]:[];
    });
  });
  function highlight(player,entries,through,context={}){
    const year=Number(through.slice(0,4));const r=build({...context,year,through,entries,players:[player]});const p=r.players[0];
    const extra=r.facts.find(f=>f.player===player&&f.provider&&f.occasions?.includes(context.occasion||'message'));
    if(extra)return `${player}, ${fmt(extra.value)} ${extra.unit} dieses Jahr. Schön, dass du unsere Runde mit Leben füllst.`;
    if(p.bonusStreak>=7)return `${player}, ${fmt(p.bonusStreak)} selbst verdiente Bonustage in deiner längsten Serie dieses Jahres – dein Grill kann offenbar Überstunden. ${p.streakRecord?'Dein Serienrekord bis heute: '+fmt(p.streakRecord.value)+' verdiente Bonustage. ':''}${p.patches.length?fmt(p.patches.length)+' neue Patches sind dazugekommen.':''}`;
    if(p.patches.length)return `${player}, ${fmt(p.patches.length)} neue Patches dieses Jahr. Die hast du dir verdient. Bertha hat mitgezählt.`;
    if(p.bike>0)return `${player}, ${fmt(p.bike,1)} Kilometer auf dem Rad dieses Jahr. Heute darf der Sattel einmal Pause haben.`;
    if(p.steps>0)return `${player}, ${fmt(p.steps)} Schritte dieses Jahr. Schön, dass dein Weg immer wieder zum Wurstrand führt.`;
    return `${player}, schön, dass du zu unserer Runde gehörst. Wursti und Bertha halten deinen Platz frei.`;
  }
  root.WRCInsights=Object.freeze({build,awards,highlight,register,fmt,dateOK});
})(typeof window==='undefined'?globalThis:window);

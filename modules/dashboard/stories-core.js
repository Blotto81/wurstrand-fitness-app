/* Read-only dashboard facts. Calendar arithmetic is UTC; the shared day is Berlin. */
(function (root) {
  'use strict';
  const DAY = 86400000;
  const iso = ms => new Date(ms).toISOString().slice(0, 10);
  const shift = (date, days) => iso(Date.parse(date + 'T12:00:00Z') + days * DAY);
  const stamp = date => date.split('-').reverse().join('.');
  const month = date => new Intl.DateTimeFormat('de-DE', {month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date + 'T12:00:00Z'));
  const number = (n, d=0) => Number(n).toLocaleString('de-DE', {maximumFractionDigits:d});
  function today(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const get = type => parts.find(p => p.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  const metrics = {steps:['Schritte',0],bike:['km auf dem Rad',1],squats:['Kniebeugen',0],pushups:['Liegestütze',0],points:['Tagespunkte',1]};
  function facts({result, archive, options}) {
    if (!options.dashboard) return [];
    const end=result.through, start=end.slice(0,7)+'-01', previousEnd=shift(start,-1), previousStart=previousEnd.slice(0,7)+'-01';
    const weekday=new Date(end+'T12:00:00Z').getUTCDay();
    const weekStart=shift(end,-((weekday+6)%7)), lastWeekEnd=shift(weekStart,-1), lastWeekStart=shift(weekStart,-7);
    const output=[];
    for (const p of result.players) {
      const rows=archive.filter(e=>e.person===p.name);
      const between=(a,b)=>rows.filter(e=>e.date>=a&&e.date<=b);
      const complete=(a,b)=>between(a,b).length===Math.round((Date.parse(b)-Date.parse(a))/DAY)+1;
      const sum=(a,b,key)=>between(a,b).reduce((s,e)=>s+(Number(e[key])||0),0);
      function add(id,value,unit,title,text,from=start,extra={}) {
        if (value>0) output.push({id,player:p.name,value,unit,label:title,text,from,through:end,occasions:['dashboard'],...extra});
      }
      const current=between(start,end);
      const bonus=current.filter(e=>options.score(e).bonus>0).length;
      if (bonus) add('bonus',bonus,'Bonustage',`${p.name} hat im ${month(end)} schon ${bonus} ${bonus===1?'Tagesbonus':'Tagesboni'} geschafft.`,`Gespeicherte Einträge bis ${stamp(end)}.`,start,{joke:'Wursti beantragt eine Prüfung wegen übertriebener Zuverlässigkeit.'});
      for (const metric of ['steps','bike']) {
        const value=sum(start,end,metric),[unit,decimals]=metrics[metric];
        if(value>0) add(metric,value,unit,`${p.name}: ${number(value,decimals)} ${unit} im ${month(end)}.`,`Aus den gespeicherten Einträgen bis ${stamp(end)}.`);
      }
      const combinations=current.filter(e=>e.steps>0&&e.bike>0&&(e.squats>0||e.pushups>0||e.exercise));
      if(combinations.length) add('combination',combinations.length,'Tage mit Aktivitätsmix',`${p.name} hat an ${combinations.length} ${combinations.length===1?'Tag':'Tagen'} Schritte, Radfahren und Training kombiniert.`,`${month(end)} · bis ${stamp(end)}.`,start,{joke:'Bertha sucht noch die passende Ausrede.'});
      for(const [id,metric,a,b,c,d] of [['month-bike','bike',start,end,previousStart,previousEnd],['week-steps','steps',weekStart,end,lastWeekStart,lastWeekEnd]]) {
        if(!complete(a,b)||!complete(c,d)) continue;
        const value=sum(a,b,metric),old=sum(c,d,metric),[unit,decimals]=metrics[metric];
        if(old>0&&value>old) add(id,value,unit,`${p.name} hat ${id==='month-bike'?'die Radkilometer des gesamten Vormonats':'die Schritte der gesamten Vorwoche'} übertroffen.`,`${stamp(a)}–${stamp(b)}: ${number(value,decimals)} ${unit}; ${stamp(c)}–${stamp(d)}: ${number(old,decimals)} ${unit}.`,a,{previous:old,comparisonFrom:c,comparisonThrough:d});
      }
      // Existing insight records replay all cleaned historical entries. Only yesterday's
      // achievements get a one-day spotlight; old backfills can never be called fresh.
      for(const r of p.records.filter(r=>r.date===end)) {
        const [unit,decimals]=metrics[r.metric];
        add('record-'+r.metric,r.value,unit,`${p.name}: ${number(r.value,decimals)} ${unit} an einem Tag!`,`${stamp(r.date)} · bisher ${number(r.previous,decimals)} ${unit}. Persönlicher Bestwert im detaillierten Tagesarchiv.`,r.date,{kind:'record',date:r.date,previous:r.previous,joke:r.metric==='bike'?'Bertha fragt, ob das Fahrrad noch eine Bremse hat.':null});
      }
    }
    return output;
  }
  function select(facts, day, players) {
    const eligible=players.filter(p=>facts.some(f=>f.player===p));
    if(!eligible.length) return null;
    const n=Math.floor(Date.parse(day+'T12:00:00Z')/DAY);
    // Rotation is independent of performance. A record only wins within the
    // day's player's slot, so a prolific record holder cannot displace everyone.
    const player=eligible[n%eligible.length];
    const own=facts.filter(f=>f.player===player).sort((a,b)=>a.id.localeCompare(b.id,'en'));
    const records=own.filter(f=>f.kind==='record');
    const comparisons=own.filter(f=>f.previous&&!f.kind);
    const pool=records.length?records:comparisons.length&&Math.floor(n/eligible.length)%2===0?comparisons:own.filter(f=>!f.kind);
    const selected=pool[Math.floor(n/eligible.length)%pool.length];
    return {...selected,kicker:selected.kind==='record'?'🏆 Rekord geknackt!':'💡 Unsere Geschichte des Tages',text:selected.text+(selected.joke&&n%3===0?' '+selected.joke:'')};
  }
  function build(options) {
    if(!root.WRCInsights.dateOK(options.day)||options.special) return null;
    const through=shift(options.day,-1);
    const result=root.WRCInsights.build({...options,year:Number(through.slice(0,4)),through,dashboard:true});
    return select(result.facts.filter(f=>f.provider==='dashboard'),options.day,options.players);
  }
  root.WRCDashboardStoryCore=Object.freeze({facts,select,build,today,shift});
})(typeof window==='undefined'?globalThis:window);

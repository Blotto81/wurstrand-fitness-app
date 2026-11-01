/* Confirmed finds only, with no placement information in occasion text. */
WRCInsights.register('spring-easter',({result,inYear,options})=>{
 const rows=Array.isArray(options.easter)?options.easter:[];
 const unique=[...new Map(rows.filter(r=>WRCSpringCore.validFind(r)&&inYear(r.found_date)).map(r=>[r.event_year+':'+r.egg_id,r])).values()];
 return result.players.flatMap(p=>{const own=unique.filter(r=>r.player===p.name);if(!own.length)return [];return [{id:'easter-finds',player:p.name,value:own.length,unit:'eigene Ostereier gefunden',label:'Bertha hat mitgezählt.',text:own.length+' eigene Ostereier, '+own.length+' bestätigte Feiertagspunkte. Wursti behauptet weiterhin, nichts verraten zu haben.',date:own.map(r=>r.found_date).sort().at(-1),from:result.year+'-01-01',through:result.through,occasions:['birthday','christmas','personal-wrapped','team-wrapped','message']}];});
});

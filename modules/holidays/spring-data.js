(function(root){
 'use strict';
 const C=WRCSpringCore,D=WRCHolidayData,preview=D.preview,key=preview?'wrcEasterPreview_v2':'wrcEasterReceipts_v2';
 const read=()=>{try{return JSON.parse(localStorage.getItem(key))||[];}catch{return [];}};
 const clean=data=>[...new Map((Array.isArray(data)?data:[]).filter(C.validFind).map(r=>[r.event_year+':'+r.egg_id,r])).values()];
 let rows=clean(read()),ready=preview,flight=null;const claims=new Map();
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify(rows));}catch{/* Server receipt remains authoritative. */}};
 function records(year){return rows.filter(r=>(!year||r.event_year===year)&&!D.receipt('easter',r.player,r.event_year)).map(r=>({...r}));}
 function matching(scope={}){return records().filter(r=>(!scope.person||r.player===scope.person)&&(!scope.key||r.found_date.startsWith(scope.key))&&(!scope.date||r.found_date===scope.date)&&(!scope.from||r.found_date>=scope.from)&&(!scope.through||r.found_date<=scope.through)).map(r=>({recipient:r.player,gift_date:r.found_date,points:1,event_type:'easter',label:'Eigenes WRC-Osterei gefunden'}));}
 async function load(){
  if(preview){rows=clean(read());ready=true;return true;}if(flight)return flight;
  flight=(async()=>{try{const all=[];for(let offset=0;;offset+=1000){const {data,error}=await supabaseClient.from('wrc_easter_finds').select('*').order('event_year').order('egg_id').range(offset,offset+999);if(error)throw error;all.push(...data);if(data.length<1000)break;}rows=clean(all);ready=true;persist();return true;}catch{ready=false;return false;}finally{flight=null;}})();return flight;
 }
 async function claim(player,egg){
  const event=WRCHolidayCalendar.resolve(D.today());if(event?.type!=='easter'||event.year<C.FIRST_YEAR)throw Error('Die Eiersuche ist gerade nicht geöffnet.');
  if(C.eggOwner(event.year,egg)!==player)throw Error('Finger weg! Das gehört nicht dir. Bertha beobachtet dich!');
  if(D.receipt('easter',player,event.year))throw Error('Dein Osterbonus für dieses Jahr ist bereits gespeichert.');
  if(!ready)throw Error('Bitte erst die Verbindung bestätigen lassen.');
  const id=event.year+':'+egg;if(claims.has(id))return claims.get(id);
  const task=(async()=>{if(preview)rows=clean(read());const existing=rows.find(r=>r.event_year===event.year&&r.egg_id===egg);if(existing)return existing;
   let saved;if(preview){saved={event_year:event.year,egg_id:egg,player,found_date:event.date,points:1};}
   else {const {data,error}=await supabaseClient.rpc('find_wrc_easter_egg',{p_player:player,p_egg:egg});if(error){await load();const recovered=rows.find(r=>r.event_year===event.year&&r.egg_id===egg&&r.player===player);if(recovered)return recovered;throw Error('Fund noch nicht bestätigt. Bitte erneut versuchen.');}saved=Array.isArray(data)?data[0]:data;}
   if(!C.validFind(saved)||saved.player!==player||saved.egg_id!==egg||saved.event_year!==event.year)throw Error('Fundbeleg konnte nicht bestätigt werden.');rows=clean([...rows,saved]);persist();return saved;
  })();claims.set(id,task);try{return await task;}finally{claims.delete(id);}
 }
 async function firstCarnival(player){const event=WRCHolidayCalendar.resolve(D.today());if(event?.type!=='carnival'||!C.members.includes(player))return false;
  if(preview){const k='wrcCarnivalPreview:'+event.year+':'+player;try{if(localStorage.getItem(k))return false;localStorage.setItem(k,'1');}catch{}return true;}
  const {data,error}=await supabaseClient.rpc('see_wrc_carnival',{p_player:player});if(error)throw Error('Karnevalsauftakt noch nicht bestätigt');return data===true;
 }
 root.WRCSpringData=Object.freeze({load,claim,matching,records,firstCarnival,preview,get ready(){return ready;}});
})(window);

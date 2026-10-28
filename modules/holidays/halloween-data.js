/* Server-authoritative attempts. Local preview storage never grants a real point. */
(function(root){
  'use strict';
  const C=WRCHalloweenCore,D=WRCHolidayData,store='wrcHalloweenPreview_v2';
  let rows=[],ready=false,flight=null;
  const preview=D.preview;
  const read=()=>{try{return JSON.parse(localStorage.getItem(store))||[];}catch{return [];}};
  const key=r=>r.event_year+':'+r.player;
  function clean(data){return [...new Map((Array.isArray(data)?data:[]).filter(C.valid).map(r=>[key(r),r])).values()];}
  function get(player,year){return rows.find(r=>r.player===player&&r.event_year===year)||null;}
  async function load(){
    if(preview){rows=clean(read());ready=true;return true;}
    if(flight)return flight;
    flight=(async()=>{try{
      if(preview)rows=clean(read());
      else {const all=[];for(let offset=0;;offset+=1000){const {data,error}=await supabaseClient.from('wrc_halloween_runs').select('*').order('event_year').order('player').range(offset,offset+999);if(error)throw error;all.push(...data);if(data.length<1000)break;}rows=clean(all);}
      ready=true;return true;
    }catch{ready=false;return false;}finally{flight=null;}})();
    return flight;
  }
  async function open(player,year,expected,owner){
    if(D.today()!==year+'-10-31'||!ready)throw Error('Das Labyrinth ist nur am 31. Oktober mit bestätigter Verbindung geöffnet.');
    let saved;
    if(preview){
      rows=clean(read());
      const forced=root.WRC_HALLOWEEN_FIXTURE?.next;
      saved=C.step(get(player,year),player,year,expected,owner,forced);
      rows=clean([...rows,saved]);localStorage.setItem(store,JSON.stringify(rows));
    }else{
      const {data,error}=await supabaseClient.rpc('open_wrc_halloween',{p_player:player,p_expected:expected,p_door:owner});
      if(error){await load();throw Error('Die Tür ist noch nicht bestätigt. Bitte erneut versuchen. Ein gespeichertes Schicksal bleibt erhalten.');}
      saved=Array.isArray(data)?data[0]:data;
      if(!C.valid(saved)||saved.player!==player||saved.event_year!==year)throw Error('Die Halloween-Akte konnte nicht bestätigt werden. Bitte neu laden.');
      rows=clean([...rows,saved]);
      if(saved.status==='complete')await D.load();
    }
    return saved;
  }
  root.WRCHalloweenData=Object.freeze({load,get,open,preview,get ready(){return ready;},records:()=>rows.filter(r=>r.status==='complete').map(r=>({...r}))});
})(window);

(function(root){
  'use strict';
  const flights=new Map();
  const key=(year,player,mode)=>`wrcWrapped_v1_${year}_${player}_${mode}`;
  function valid(data,year,player,mode){return data&&data.year===year&&data.player===player&&data.mode===mode&&typeof data.available==='boolean'&&(!data.available||([1,2].includes(data.snapshot?.version)&&data.snapshot.year===year&&data.snapshot.through===`${year}-12-23`&&Array.isArray(data.snapshot.entries)&&Array.isArray(data.snapshot.players)));}
  function inSeason(year,date=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const get=t=>Number(parts.find(p=>p.type===t).value);return get('year')===year&&get('month')===12&&get('day')>=25;}
  function cached(year,player,mode){try{if(!inSeason(year))return null;const v=JSON.parse(localStorage.getItem(key(year,player,mode)));return valid(v,year,player,mode)&&v.available?{...v,offline:true}:null;}catch{return null;}}
  async function load(year,player,mode='personal'){
    const k=key(year,player,mode);if(flights.has(k))return flights.get(k);
    const task=(async()=>{
      // Dedicated local fixture only. URL parameters never unlock production.
      if(['localhost','127.0.0.1'].includes(location.hostname)&&root.WRC_WRAPPED_FIXTURE){const fixture=root.WRC_WRAPPED_FIXTURE;return {...fixture,year,player,mode,preview:true};}
      try{const {data,error}=await supabaseClient.rpc('get_wrc_wrapped',{p_year:year,p_player:player,p_mode:mode});if(error||!valid(data,year,player,mode))throw Error('Jahresarchiv nicht bestätigt');if(data.available)try{localStorage.setItem(k,JSON.stringify(data));} catch{/* Server archive remains available. */}return {...data,offline:false};}
      catch(error){const fallback=cached(year,player,mode),other=cached(year,player,mode==='personal'?'team':'personal');if(fallback)return {...fallback,personal_available:mode==='personal'||!!other,team_available:mode==='team'||!!other};if(other)return {...other,mode,available:false,snapshot:null,personal_available:mode==='team',team_available:mode==='personal'};throw Error('Das gemeinsame Jahresarchiv ist gerade nicht erreichbar. Bitte mit Verbindung erneut versuchen.');}
    })();flights.set(k,task);try{return await task;}finally{flights.delete(k);}
  }
  root.WRCWrappedData=Object.freeze({load,cached,valid});
})(window);

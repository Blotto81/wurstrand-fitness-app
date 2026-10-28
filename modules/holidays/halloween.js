(function(root){
  'use strict';
  const C=WRCHalloweenCore,D=WRCHalloweenData;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={scare:'Von Wursti erschreckt',gold:'Goldwurst gefunden',curse:'Mit einem Fluch entlassen'};
  let context=null,busy=false,sound=false,audio=null,stopScene=null,notice='';
  const initialOrders=new Map();
  function muted(){try{return localStorage.getItem('wrcHalloweenSound')!=='on';}catch{return true;}}
  sound=!muted();
  function audioStart(){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch{/* Sound is optional. */}}
  function hush(){if(audio)audio.suspend().catch(()=>{});}
  function tone(kind){
    if(!sound||document.hidden||!audio||audio.state!=='running')return;
    const t=audio.currentTime;
    const notes=kind==='gold'?[262,330,392,523]:kind==='scare'?[97,131,83]:kind==='curse'?[110,104,98]:[75,61];
    notes.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type=kind==='gold'?'sine':'triangle';o.frequency.setValueAtTime(f,t+i*.12);o.frequency.exponentialRampToValueAtTime(f*.8,t+i*.12+.28);g.gain.setValueAtTime(0,t+i*.12);g.gain.linearRampToValueAtTime(.035,t+i*.12+.025);g.gain.exponentialRampToValueAtTime(.001,t+i*.12+.35);o.connect(g);g.connect(audio.destination);o.start(t+i*.12);o.stop(t+i*.12+.4);});
  }
  function portrait(owner){const p=typeof playerProfiles==='undefined'?null:playerProfiles[owner];return p?`<img class="hl-owner" src="${esc(p.image)}" alt="${esc(p.displayName)}">`:'';}
  function record(r){
    const curse=r.outcome==='curse'?C.curses[r.curse]:null;
    return `<article class="hl-file"><span class="hl-eyebrow">AKTE ${r.event_year} · ABGESCHLOSSEN</span><h3>🎃 ${esc(r.player.toUpperCase())}S HALLOWEEN-AKTE</h3><dl><div><dt>Geöffnete Türen</dt><dd>${r.doors.toLocaleString('de-DE')}</dd></div><div><dt>Schicksal</dt><dd>${labels[r.outcome]}</dd></div><div><dt>Bonuspunkte</dt><dd>${r.outcome==='gold'?'+1':'0'}</dd></div></dl>${curse?`<h4>${esc(curse[0])}</h4><p>${esc(curse[1])}</p><small>${esc(curse[2])}</small>`:''}<p class="hl-aside">${r.outcome==='gold'?'Nicht einmal Wursti versteht, wie das passieren konnte.':'Bertha empfiehlt dringend, künftig den Ausgang zu benutzen.'}</p>${D.preview?'<small>Lokale Vorschau · keine echten Bonuspunkte.</small>':''}</article>`;
  }
  function door(owner,i){const d=C.doors[owner];return `<button type="button" class="hl-door hl-${d.kind}" data-hl-door="${owner}" aria-label="${d.title} öffnen" ${busy||!D.ready?'disabled':''}><span class="hl-door-number" aria-hidden="true">0${i+1}</span><span class="hl-recess" aria-hidden="true"><span class="hl-eyes">••</span></span><span class="hl-leaf" aria-hidden="true"><span class="hl-transom">${d.mark}</span><span class="hl-rivet r1"></span><span class="hl-rivet r2"></span><span class="hl-rivet r3"></span><span class="hl-rivet r4"></span><span class="hl-symbol">${d.symbol}</span><span class="hl-plaque">${d.note}</span><span class="hl-handle"></span><span class="hl-vents">≡ ≡ ≡</span><span class="hl-scratch">╱╱╱</span><span class="hl-detail">${d.detail}</span></span><span class="hl-floor" aria-hidden="true"></span></button>`;}
  function render(host,p,year){
    if(busy&&context?.host===host&&context.p===p&&context.year===year)return;
    if(context&&(context.p!==p||context.year!==year))stopScene?.();
    context={host,p,year};
    const r=D.get(p,year),complete=r?.status==='complete',n=(r?.doors||0)+1,key=year+':'+p;
    if(!initialOrders.has(key))initialOrders.set(key,C.shuffle());
    host.className='wh-card hl-card';host.setAttribute('aria-label','Wurst oder Saures: die vier verfluchten Türen');
    host.innerHTML=`<div class="hl-top"><span class="hl-eyebrow">HALLOWEEN ${year} · ${complete?'DEINE AKTE':'RAUM '+n.toLocaleString('de-DE')}</span><button type="button" class="hl-sound" aria-pressed="${sound}" data-hl-sound>${sound?'♫ Ton an':'♪ Ton aus'}</button></div><h2>Wurst oder Saures?</h2>${complete?`<div class="hl-result hl-result-${r.outcome}"><span class="hl-result-icon" aria-hidden="true">${r.outcome==='gold'?'🌭':r.outcome==='scare'?'👻':'☠'}</span><h3>${r.outcome==='gold'?'✨ DIE LEGENDÄRE GOLDWURST! ✨':r.outcome==='scare'?'BUUUH! WURSTI HAT DICH ERWISCHT!':'DU BIST VERFLUCHT!'}</h3><p>${r.outcome==='gold'?'🏆 +1 WRC-BONUSPUNKT<br>Wursti weint. Es war seine Lieblingswurst.':r.outcome==='scare'?'Bertha hat gesagt, ich soll das machen!':'Bertha hat das Kleingedruckte vorgelesen.'}</p></div>${record(r)}<button type="button" class="hl-link" data-hl-file>Halloween-Akte erneut öffnen</button>`:`<p class="hl-mantra">VIER TÜREN. EIN SCHICKSAL. KEIN ZURÜCK.</p><p class="hl-whisper">Vertraue niemandem. Nicht einmal deiner eigenen Tür.</p><div class="hl-room hl-depth-${n>=8?8:n>=5?5:n>=3?3:1}"><div class="hl-door-grid">${(r?.door_order||initialOrders.get(key)).map(door).join('')}</div><span class="hl-fog" aria-hidden="true"></span></div>${r?`<div class="hl-owner-note">${portrait(r.last_owner)}<p>${r.last_owner===p?'Ausgerechnet deine eigene Tür? Wie einfallslos!':esc(r.last_owner)+'s Tür. Offenbar kein Ausgang.'}<br><em>${C.comments[(r.doors-1)%C.comments.length]}</em></p></div>`:'<p class="hl-small">Ein Versuch pro Jahr · kurze Schreckmomente möglich.<br>Du kannst jede Animation überspringen. Bertha übernimmt keinerlei Verantwortung.</p>'}`}
+<p class="hl-status" role="status">${esc(notice||(!D.ready?'Die Halloween-Akte wird verbunden.':D.preview?'Lokale Vorschau · keine echten Bonuspunkte.':''))}</p>${!D.ready?'<button type="button" class="hl-link" data-hl-retry>Verbindung erneut prüfen</button>':''}`.replace(/\n\+/g,'\n');
    host.querySelector('[data-hl-sound]').addEventListener('click',()=>{sound=!sound;try{localStorage.setItem('wrcHalloweenSound',sound?'on':'off');}catch{}if(sound)audioStart();else hush();const b=host.querySelector('[data-hl-sound]');b.textContent=sound?'♫ Ton an':'♪ Ton aus';b.setAttribute('aria-pressed',String(sound));});
    host.querySelectorAll('[data-hl-door]').forEach(b=>b.addEventListener('click',()=>open(host,p,year,b.dataset.hlDoor,b)));
    host.querySelector('[data-hl-file]')?.addEventListener('click',()=>showFile(r));
    host.querySelector('[data-hl-retry]')?.addEventListener('click',async()=>{await D.load();render(host,p,year);});
  }
  function animate(host,r){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden)return Promise.resolve();
    return new Promise(resolve=>{
      const layer=document.createElement('div');layer.className='hl-scene hl-scene-'+r.outcome;
      layer.innerHTML=`<button class="hl-skip" type="button">Animation überspringen</button><div class="hl-dark" aria-hidden="true"><span class="hl-ray"></span>${r.outcome==='scare'?'<div class="hl-ghost"><img src="wursti-wave.png" alt=""></div>':r.outcome==='gold'?'<div class="hl-gold">🌭</div><div class="hl-sparks">✦ · ✧ · ✦ · ✧</div>':r.outcome==='curse'?'<div class="hl-curse">☠</div>':'<div class="hl-next">▯ ▯ ▯ ▯</div>'}</div><p class="hl-scene-caption">${r.outcome==='continue'?'Dahinter … noch ein Raum.':r.outcome==='curse'?'Eine Stimme flüstert deinen Namen …':'Da ist etwas in der Dunkelheit …'}</p>`;
      host.append(layer);layer.querySelector('button').focus({preventScroll:true});
      const finish=()=>{clearTimeout(timer);clearTimeout(soundTimer);layer.remove();hush();if(stopScene===finish)stopScene=null;resolve();};
      const soundTimer=setTimeout(()=>tone(r.outcome),r.outcome==='scare'?1450:750);
      const timer=setTimeout(finish,r.outcome==='gold'?3600:r.outcome==='scare'?2600:2200);
      stopScene=finish;layer.querySelector('button').addEventListener('click',finish);
    });
  }
  async function open(host,p,year,owner,button){
    if(busy||!D.ready)return;
    busy=true;notice='';const expected=D.get(p,year)?.doors||0;
    host.querySelectorAll('[data-hl-door]').forEach(b=>{b.disabled=true;});button.classList.add('hl-opening');
    audioStart();tone('open');host.querySelector('.hl-status').textContent='Die Tür öffnet sich …';
    let skipped=false;
    const skip=document.createElement('button');skip.type='button';skip.className='hl-link';skip.textContent='Animation überspringen';host.append(skip);
    const opening=matchMedia('(prefers-reduced-motion: reduce)').matches?Promise.resolve():new Promise(resolve=>{const timer=setTimeout(resolve,1100);skip.addEventListener('click',()=>{skipped=true;clearTimeout(timer);hush();resolve();},{once:true});});
    try{
      const [r]=await Promise.all([D.open(p,year,expected,owner),opening]);skip.remove();
      if(context?.host===host&&context.p===p&&context.year===year&&host.isConnected&&WRCHolidayData.today()===year+'-10-31'&&!skipped)await animate(host,r);
      busy=false;hush();
      if(context?.p===p&&context.year===year){render(host,p,year);const target=host.querySelector(r.status==='complete'?'[data-hl-file]':'[data-hl-door]');target?.focus({preventScroll:true});}
      if(typeof renderAll==='function')renderAll();
    }catch(error){skip.remove();busy=false;hush();notice=error.message;if(context?.p===p&&context.year===year)render(host,p,year);}
  }
  function showFile(r){
    document.getElementById('wrcHalloweenFile')?.remove();
    const dialog=document.createElement('dialog');dialog.id='wrcHalloweenFile';dialog.className='hl-dialog';dialog.setAttribute('aria-label',r.player+'s Halloween-Akte '+r.event_year);
    dialog.innerHTML=record(r)+'<button type="button" class="hl-link">Zurück zur WRC</button>';document.body.append(dialog);dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
  }
  function archive(){
    const parent=document.getElementById('entriesList')?.parentElement;if(!parent)return;
    let host=document.getElementById('wrcHalloweenArchive');if(!host){host=document.createElement('div');host.id='wrcHalloweenArchive';parent.append(host);}
    const records=D.records().filter(r=>r.completed_date<=WRCHolidayData.today()).sort((a,b)=>b.event_year-a.event_year||a.player.localeCompare(b.player));
    host.hidden=!records.length;host.className='hl-archive';host.innerHTML=records.length?'<details><summary>🎃 Gespeicherte Halloween-Akten</summary>'+records.map((r,i)=>`<button type="button" class="hl-link" data-hl-record="${i}">${esc(r.player)} · ${r.event_year} · ${labels[r.outcome]}</button>`).join('')+'</details>':'';
    host.querySelectorAll('[data-hl-record]').forEach(b=>b.addEventListener('click',()=>showFile(records[+b.dataset.hlRecord])));
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopScene?.();hush();}});
  root.WRCHalloween=Object.freeze({render,archive});
})(window);

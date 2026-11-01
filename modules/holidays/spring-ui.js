(function(root){
 'use strict';
 const C=WRCSpringCore,D=WRCSpringData,A=WRCSpringArt,H=WRCHolidayCalendar;
 let current=null,person=null,scheduled=false,dialog=null,showTimer=null,showOrigin=null,loading=false;
 const pending=new Set(),autoplay=new Set();
 const isEaster=()=>current?.type==='easter'&&current.year>=C.FIRST_YEAR;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function selected(year){return C.shuffle(WRCSpringLocations,year*97+241).slice(0,8);}
 function notify(message){let n=document.getElementById('wrcSpringNotice');if(!n){n=document.createElement('div');n.id='wrcSpringNotice';n.className='ws-notice';n.dataset.wrcSpring='notice';n.setAttribute('role','status');document.body.append(n);}n.textContent=message;clearTimeout(n.hideTimer);n.hideTimer=setTimeout(()=>n.remove(),6500);}
 function placeEggs(){
  const active=isEaster();const chosen=active?selected(current.year):[];
  document.querySelectorAll('[data-wrc-spring="egg"]').forEach(n=>{if(!active||n.dataset.year!==String(current.year))n.remove();});
  if(!active)return;
  const found=D.records(current.year);chosen.forEach((place,egg)=>{
   const id='wrcSpringEgg'+egg;let mount=document.getElementById(id);const target=document.querySelector(place.selector);
   if(!target)return;
   const collected=found.some(r=>r.player===person&&r.egg_id===egg);
   if(collected){mount?.remove();return;}
   if(!mount){mount=document.createElement('div');mount.id=id;mount.dataset.wrcSpring='egg';mount.dataset.year=current.year;mount.className='ws-egg-pocket ws-pocket-'+place.variant;
    const button=document.createElement('button');button.type='button';button.className='ws-hidden-egg';button.setAttribute('aria-label','Osterei untersuchen');button.innerHTML=A.egg(egg);button.addEventListener('click',e=>{e.stopPropagation();find(egg,button);});mount.append(button);
    // Keep a dedicated touch-safe pocket outside normal controls, also after rerenders.
    const cards=target.querySelectorAll(':scope > .card, :scope > details, :scope > section');const anchor=cards.length?cards[Math.min(place.variant,cards.length-1)]:target;anchor.append(mount);
   }
   mount.querySelector('button').disabled=pending.has(egg)||!C.members.includes(person);
  });
 }
 async function find(egg,button){
  if(!isEaster()||pending.has(egg))return;
  const p=person,year=current.year;
  if(C.eggOwner(year,egg)!==p){notify('Finger weg! Das gehört nicht dir. Bertha beobachtet dich! 👀');return;}
  pending.add(egg);button.disabled=true;
  try{await D.claim(p,egg);if(person===p&&isEaster()&&current.year===year){button.classList.add('ws-egg-found');notify('🐣 Gefunden! +1 WRC-Punkt ist gespeichert. Wursti klatscht. Bertha nickt fachkundig.');await new Promise(r=>setTimeout(r,reduced()?0:550));}root.renderAll?.();root.WRCHolidays?.render();}
  catch(e){notify(e.message);}finally{pending.delete(egg);placeEggs();}
 }
 function decorate(){
  const active=current?.type==='carnival';const costumes=active?C.costumes(current.year):[];
  document.querySelectorAll('[data-wrc-spring="costume"]').forEach(n=>{if(!active||n.dataset.year!==String(current.year)){n.parentElement?.classList.remove('ws-costumed');n.parentElement?.removeAttribute('data-costume-title');n.remove();}});
  if(!active)return;
  document.querySelectorAll('.player-profile-avatar').forEach(host=>{
   if(host.querySelector('[data-wrc-spring="costume"]'))return;
   const img=host.querySelector('img');const c=costumes.find(c=>typeof playerProfiles!=='undefined'&&img?.getAttribute('src')===playerProfiles[c.player]?.image);if(!c)return;
   const layer=document.createElement('span');layer.dataset.wrcSpring='costume';layer.dataset.year=current.year;layer.className='ws-profile-costume';layer.innerHTML=A.costume(c);host.classList.add('ws-costumed');host.append(layer);host.setAttribute('data-costume-title',c.title);
  });
 }
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;placeEggs();decorate();});}
 function sync(event,p){const changed=current?.type!==event?.type||current?.year!==event?.year||person!==p;current=event;person=p;if(changed&&dialog)closeShow();schedule();}
 function render(host,event,p){
  if(event.type==='easter'&&event.year>=C.FIRST_YEAR){
   const found=D.records(event.year);host.className='wh-card ws-easter';host.setAttribute('aria-label','Die große WRC-Eiersuche');
   host.innerHTML='<div class="ws-event-heading">'+A.hosts()+'<div><span class="wh-eyebrow">OSTERN · '+event.year+'</span><h2>🐰 Die große WRC-Eiersuche!</h2><p>8 Eier. 4 Wurstrandler. Und Wursti verrät absolut nichts!</p></div></div><p class="ws-search-copy">Zwei Eier gehören dir. Jedes eigene Ei bringt +1 WRC-Punkt. Bertha hat die Verstecke abgenommen. Mehr sagt sie nicht.</p><strong class="ws-team-total">Gemeinsam gefunden: '+found.length+' von 8 Eiern</strong><div class="ws-egg-progress" role="img" aria-label="'+found.length+' von 8 Eiern gefunden">'+Array.from({length:8},(_,i)=>'<span class="'+(i<found.length?'is-found':'')+'">'+A.egg(i)+'</span>').join('')+'</div><div class="ws-player-totals">'+C.members.map(name=>{const n=found.filter(r=>r.player===name).length;return '<div><strong>'+name+'</strong><span>'+n+' / 2 Eier</span><b>'+(n?'+'+n:'0')+' Punkte</b></div>';}).join('')+'</div><p class="wh-note">Bis Ostermontag, 23:59 Uhr · deutsche Ortszeit. '+(D.ready?'Gespeicherte Funde werden regelmäßig synchronisiert.':'Verbindung wird geprüft. Neue Funde werden erst nach Bestätigung gutgeschrieben.')+'</p>'+(D.preview?'<p class="wh-preview-label">Lokale Vorschau · keine echten Punkte</p>':'');return true;
  }
  if(event.type!=='carnival')return false;
  const costumes=C.costumes(event.year);host.className='wh-card ws-carnival';host.setAttribute('aria-label','Der große WRC-Kostümball');
  host.innerHTML='<div class="ws-event-heading">'+A.hosts()+'<div><span class="wh-eyebrow">ROSENMONTAG · '+event.year+'</span><h2>🎭 WRC – Vier Narren, null Würde!</h2><p>Wursti hat den Vorhang. Bertha bestreitet jede Verantwortung für die Garderobe.</p></div></div><div class="ws-cast">'+costumes.map(c=>'<article>'+A.portrait(c)+'<h3>'+A.esc(c.title)+'</h3><p>'+A.esc(c.detail)+'</p></article>').join('')+'</div><button type="button" class="wh-button" data-spring-replay>Den Kostümball ansehen</button><p class="wh-note">Nur heute verkleidet. Keine Punkte, keine Aufgaben – nur vier sehr überzeugende Fehlentscheidungen.</p>'+(D.preview?'<p class="wh-preview-label">Lokale Vorschau</p>':'');
  host.querySelector('[data-spring-replay]').addEventListener('click',()=>openShow(event.year));
  maybeAutoplay(event,p);return true;
 }
 function occupied(){return document.hidden||[...document.querySelectorAll('dialog[open],[aria-modal="true"]')].some(n=>n.getClientRects().length);}
 async function maybeAutoplay(event,p){const key=event.year+':'+p;if(autoplay.has(key)||occupied())return;autoplay.add(key);try{if(await D.firstCarnival(p)){if(person===p&&current?.type==='carnival'&&!occupied())openShow(event.year);}}catch{autoplay.delete(key);}}
 function closeShow(){if(showTimer){clearInterval(showTimer);showTimer=null;}if(dialog){const d=dialog;dialog=null;if(d.open)d.close();d.remove();}if(showOrigin?.isConnected)showOrigin.focus();showOrigin=null;}
 function openShow(year){
  if(current?.type!=='carnival'||current.year!==year)return;closeShow();showOrigin=document.activeElement;
  const cast=C.costumes(year);dialog=document.createElement('dialog');dialog.className='ws-show';dialog.dataset.wrcSpring='show';dialog.setAttribute('aria-labelledby','wsShowTitle');
  dialog.innerHTML='<div class="ws-show-top"><span>WURSTI & BERTHA PRÄSENTIEREN</span><button type="button" class="wh-button" data-show-close aria-label="Kostümball schließen">Schließen</button></div><h2 id="wsShowTitle">🎭 WRC – Vier Narren, null Würde!</h2><div class="ws-stage" aria-live="polite"></div><div class="ws-show-foot"><span class="ws-show-step"></span><button type="button" class="wh-button" data-show-skip>Animation überspringen</button></div>';
  document.body.append(dialog);dialog.querySelector('[data-show-close]').onclick=closeShow;dialog.addEventListener('cancel',e=>{e.preventDefault();closeShow();});dialog.addEventListener('close',()=>{if(dialog)closeShow();});
  let step=-1;const stage=dialog.querySelector('.ws-stage'),label=dialog.querySelector('.ws-show-step');
  const finish=()=>{clearInterval(showTimer);showTimer=null;stage.innerHTML='<div class="ws-curtain-open ws-final-cast">'+cast.map(c=>'<article>'+A.portrait(c)+'<h3>'+A.esc(c.title)+'</h3></article>').join('')+'</div><div class="ws-confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><p>Der Applaus ist verdient. Die Kostüme sind es auch. Helau vom Wurstrand!</p>';label.textContent='Alle vier auf der Bühne';dialog.querySelector('[data-show-skip]').hidden=true;};
  dialog.querySelector('[data-show-skip]').onclick=finish;
  const advance=()=>{step++;if(step>=4){finish();return;}const c=cast[step];stage.innerHTML='<div class="ws-curtain-open ws-solo">'+A.portrait(c)+'<h3>'+A.esc(c.title)+'</h3><p>'+A.esc(c.detail)+'</p></div>';label.textContent='Auftritt '+(step+1)+' von 4';};
  stage.innerHTML=A.hosts()+'<p>„Die Bühne ist frei!“ – Wursti<br>„Leider auch die Kostümwahl.“ – Bertha</p>';label.textContent='Der Vorhang hebt sich …';dialog.showModal();dialog.querySelector('[data-show-close]').focus();
  if(reduced())finish();else showTimer=setInterval(advance,2000);
 }
 async function refresh(){if(loading||document.hidden)return;const event=H.resolve(WRCHolidayData.today());if(!event||!['easter','carnival'].includes(event.type))return;loading=true;try{if(event.type==='easter'){await D.load();root.renderAll?.();}root.WRCHolidays?.render();}finally{loading=false;}}
 document.addEventListener('DOMContentLoaded',()=>{
  new MutationObserver(records=>{if(!current||!['easter','carnival'].includes(current.type))return;if(records.some(r=>!r.target.closest?.('[data-wrc-spring],#wrcHolidayEvent')&&[...r.addedNodes].some(n=>n.nodeType===1&&!n.dataset?.wrcSpring)))schedule();}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)closeShow();else refresh();});window.addEventListener('focus',refresh);window.addEventListener('storage',e=>{if(e.key==='wrcEasterPreview_v2'||e.key==='wrcEasterReceipts_v2')refresh();});setInterval(refresh,15000);
 });
 root.WRCSpringUI=Object.freeze({sync,render,selected,placeEggs,decorate,openShow,closeShow});
})(window);

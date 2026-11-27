(() => {
const key="wrc-dart-fitness-v1", members=["Thorsten","Basti","Marian","Fabi"];
const fresh=()=>({id:crypto.randomUUID(),active:false,guests:false,events:[]});
let s;try{s=JSON.parse(localStorage.getItem(key))||fresh()}catch{s=fresh()}
let latest=null;
const save=()=>localStorage.setItem(key,JSON.stringify(s));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sum=(name,field)=>s.events.reduce((n,e)=>n+(e[field]===name?e.count:0),0);
function add({from,players,base,multiplier,total,previousTotal,closed=0,allClosed=false,cricket=false,mode,game,position}){
 if(!s.active||(!s.guests&&!members.includes(from)))return;
 let count=(multiplier===3&&base>=15&&base<=20||base===25&&multiplier===2)?5:0;
 count+=cricket? (closed===2?10:closed>0?5:0)+(allClosed?10:0) : previousTotal<75&&total>=75?5:0;
 if(!count)return;
 const recipients=players.filter(to=>to!==from&&(s.guests||members.includes(to)));
 for(const to of recipients)s.events.push({from,to,count,mode,game,position,at:new Date().toISOString()});
 if(recipients.length)latest={from,recipients,count,game,position,at:Date.now()};
 save();
}
function undo(game,position){if(latest?.game===game&&latest.position===position)latest=null;s.events=s.events.filter(e=>e.game!==game||e.position!==position);save()}
function badge(name){return s.active&&(s.guests||members.includes(name))?' <small style="font-size:.72em;white-space:nowrap;opacity:.85">🦵 '+sum(name,"to")+'</small>':""}
function controls(mount,render,canEnd){
 const bar=mount.querySelector(".dart-caller-gamebar")||mount.querySelector(".dart-caller-shell");if(!bar)return;
 const div=document.createElement("div");div.style.cssText="display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12px;padding:6px";
 div.innerHTML='<label style="display:inline-flex;align-items:center;gap:7px"><input role="switch" aria-label="Kniebeugen aktivieren" type="checkbox" data-kb '+(s.active?'checked':'')+'> 🦵 Kniebeugen</label><label style="display:inline-flex;align-items:center;gap:7px"><input role="switch" aria-label="Gäste einbeziehen" type="checkbox" data-guests '+(s.guests?'checked':'')+'> Gäste einbeziehen</label>'+((s.active||s.events.length)&&canEnd?'<button type="button" data-end-kb>Dartabend beenden</button>':'');
 if(bar.matches(".dart-caller-shell"))bar.prepend(div);else bar.after(div);
 if(s.active&&latest&&Date.now()-latest.at<6500){const note=document.createElement("small");note.style.cssText="flex-basis:100%;color:#22c55e";note.textContent=latest.from+" verteilt: "+latest.recipients.map(n=>n+" +"+latest.count).join(" · ");div.append(note);setTimeout(()=>note.remove(),Math.max(0,6500-(Date.now()-latest.at)));}
 const style=document.createElement("style");style.textContent='input[data-kb],input[data-guests]{appearance:none;-webkit-appearance:none;width:40px;height:23px;border:1px solid #777;border-radius:20px;background:#52525b;position:relative;cursor:pointer;margin:0;flex-shrink:0;transition:background .15s}input[data-kb]:before,input[data-guests]:before{content:"";position:absolute;top:3px;left:3px;width:15px;height:15px;border-radius:50%;background:#fff;transition:transform .15s}input[data-kb]:checked,input[data-guests]:checked{background:#16a34a;border-color:#16a34a}input[data-kb]:checked:before,input[data-guests]:checked:before{transform:translateX(17px)}input[data-kb]:focus-visible,input[data-guests]:focus-visible{outline:2px solid #60a5fa;outline-offset:3px}';div.append(style);
 div.querySelector("[data-kb]").onchange=e=>{s.active=e.target.checked;save();render()};
 div.querySelector("[data-guests]").onchange=e=>{s.guests=e.target.checked;save();render()};
 div.querySelector("[data-end-kb]")?.addEventListener("click",async()=>{
 const names=[...new Set(s.events.flatMap(e=>[e.from,e.to]))];

 const button=div.querySelector("[data-end-kb]");
 const panel=document.createElement("section");panel.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.8);display:grid;place-items:center;padding:16px";
 const allNames=[...new Set([...names,...members])];
 const total=s.events.reduce((n,e)=>n+e.count,0);
 const leader=names.slice().sort((a,b)=>sum(b,"from")-sum(a,"from"))[0];
 panel.innerHTML='<div style="background:#18181b;color:#fff;border-radius:16px;padding:20px;width:min(100%,440px);max-height:85vh;overflow:auto"><h2>🎯 Dartabend – Abschluss</h2><p>🦵 '+total+' Kniebeugen insgesamt</p>'+allNames.map(n=>'<div style="padding:12px 0;border-bottom:1px solid #444"><strong>'+esc(n)+'</strong><div style="font-size:24px">🦵 '+sum(n,"to")+' erhalten</div><small>'+sum(n,"from")+' verteilt</small></div>').join("")+(leader?'<p>😈 Meiste verteilt: '+esc(leader)+' ('+sum(leader,"from")+')</p>':'')+'<p>Bitte Kniebeugen manuell eintragen. Erst beim Speichern wird der Zähler zurückgesetzt.</p><button class="dart-caller-primary" data-confirm-end>Speichern &amp; Dartabend beenden</button><button class="dart-caller-secondary" data-cancel-end>Zurück</button><p data-end-error role="alert"></p></div>';
 document.body.append(panel);
 panel.querySelector("[data-cancel-end]").onclick=()=>panel.remove();
 panel.querySelector("[data-confirm-end]").onclick=async()=>{
 const confirmButton=panel.querySelector("[data-confirm-end]");confirmButton.disabled=true;button.disabled=true;
 let error;try{({error}=await supabaseClient.from("dart_fitness_sessions").insert({id:s.id,events:s.events}));}catch(e){error=e;}
 if(error&&error.code!=="23505"){panel.querySelector("[data-end-error]").textContent="Speichern fehlgeschlagen. Zähler bleibt erhalten.";confirmButton.disabled=false;button.disabled=false;return}
 panel.remove();latest=null;s=fresh();save();render();window.WRCLoadDartThrowStats?.();
 };
 });
}
function stats(rows,selected,period){
 let events=rows.flatMap(r=>(r.events||[]).map(e=>({...e,session:r.id})));
 if(period==="month"){const now=new Date();events=events.filter(e=>new Date(e.at).getMonth()===now.getMonth()&&new Date(e.at).getFullYear()===now.getFullYear())}
 if(period==="last")events=events.filter(e=>e.session===rows[0]?.id);
 if(selected)events=events.filter(e=>selected.has(e.from));
 const pairs=new Map(),given=new Map(),received=new Map(),sessions=new Map();
 for(const e of events){const k=JSON.stringify([e.from,e.to]);for(const [map,id] of [[pairs,k],[given,e.from],[received,e.to],[sessions,e.session]])map.set(id,(map.get(id)||0)+e.count)}
 const rank=m=>[...m].sort((a,b)=>b[1]-a[1]);const top=m=>rank(m)[0];
 return '<section class="dart-visual-insights"><h4>🎯 Darts trifft Fitness</h4>'+(events.length?'<p>Gemeinsam '+events.reduce((n,e)=>n+e.count,0)+' Kniebeugen erspielt</p><p>😈 Kniebeugen-Terrorist: '+esc(top(given)[0])+' · '+top(given)[1]+'</p><p>🦵 Leidensmaschine: '+esc(top(received)[0])+' · '+top(received)[1]+'</p><p>🔥 Rekordabend: '+top(sessions)[1]+'</p>'+rank(pairs).map(([k,n])=>{const [a,b]=JSON.parse(k);return '<p>'+esc(a)+' → '+esc(b)+' · <strong>'+n+'</strong></p>'}).join(""):'<p>Noch keine abgeschlossenen Kniebeugen-Abende.</p>')+'</section>';
}
window.WRCDartFitness={add,undo,badge,controls,stats,gameGiven:(game,name)=>s.events.filter(e=>e.game===game&&e.from===name).reduce((n,e)=>n+e.count,0)};
})();
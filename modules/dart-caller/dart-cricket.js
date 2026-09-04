(() => {
  const mount = document.getElementById("dartCallerMount");
  if (!mount) return;

  const STORAGE_KEY = "wrc-dart-cricket-game-v1";
  const TARGETS = [20, 19, 18, 17, 16, 15, 25];
  const DEFAULT_PLAYERS = ["Thorsten", "Basti", "Marian", "Fabi"];
  const availablePlayers = typeof people !== "undefined" && Array.isArray(people) ? people.slice(0, 4) : DEFAULT_PLAYERS;
  const TEAM_META = {
    wursti: { name: "Team Wursti", image: "wursti-dart.png", icon: "🌭" },
    bertha: { name: "Team Bertha", image: "merch-assets/bertha-bohne-plueschtier.webp", icon: "🫘" }
  };
  let state = freshState();
  let savedGame = readSavedGame();
  let wakeLock = null;
  let saveGeneration = 0;
  let turnTimer = null;

  function freshMarks() { return Object.fromEntries(TARGETS.map(target => [target, 0])); }
  function freshState() {
    return {
      screen: "setup", gameType: "solo", selectedPlayers: [], teams: {}, competitors: [], throwers: [],
      currentThrower: 0, turnNumber: 1, darts: [], throwLog: [], undoStack: [], multiplier: 1,
      startedAt: null, completedAt: null, completed: false, winnerId: null, saving: false, saved: false,
      savedGameId: null, saveError: "", toast: ""
    };
  }
  const esc = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const targetLabel = target => Number(target) === 25 ? "Bull" : String(target);
  const markSymbol = marks => ["–", "╱", "✕", "⊗"][Math.min(3, Number(marks) || 0)];
  const competitor = id => state.competitors.find(item => item.id === id);
  const activeThrower = () => state.throwers[state.currentThrower];

  function readSavedGame() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return value?.version === 1 && value.state?.competitors?.length ? value : null;
    } catch { return null; }
  }
  function persist() {
    if (state.screen !== "game" || state.completed) return;
    const clean = { ...state, undoStack: state.undoStack, saving: false, saved: false, savedGameId: null, saveError: "", toast: "" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, savedAt: new Date().toISOString(), state: clean }));
    savedGame = readSavedGame();
  }
  function clearSaved() { localStorage.removeItem(STORAGE_KEY); savedGame = null; }

  function setupMarkup() {
    const teamReady = state.gameType === "team" && state.selectedPlayers.length === 4 &&
      state.selectedPlayers.filter(name => state.teams[name] === "wursti").length === 2 &&
      state.selectedPlayers.filter(name => state.teams[name] === "bertha").length === 2;
    const canStart = state.gameType === "solo" ? state.selectedPlayers.length >= 2 : teamReady;
    return `<div class="overlay dart-caller-shell dart-cricket-shell">
      <button type="button" class="dart-back-to-selection" data-cricket-back>← Zum WRC Caller</button>
      <div class="badge">WRC Caller</div>
      <header class="dart-caller-header"><span class="dart-caller-target">🎯</span><div><h2>Cricket</h2><p class="sub">Schließen. Punkten. Bis zum bitteren Ende.</p></div></header>
      ${savedGame ? `<section class="dart-caller-resume"><div><span>Laufende Partie</span><strong>${savedGame.state.gameType === "team" ? "Team Wursti · Team Bertha" : savedGame.state.selectedPlayers.map(esc).join(" · ")}</strong><small>Der letzte Dart ist sicher.</small></div><div class="dart-caller-resume-actions"><button data-cricket-resume>Fortsetzen</button><button data-cricket-discard>Verwerfen</button></div></section>` : ""}
      <section class="dart-caller-card"><h3>1. Modus wählen</h3><div class="dart-caller-mode-grid">
        <button class="dart-caller-mode ${state.gameType === "solo" ? "selected" : ""}" data-cricket-type="solo"><strong>Einzel</strong><small>2–4 Spieler</small></button>
        <button class="dart-caller-mode ${state.gameType === "team" ? "selected" : ""}" data-cricket-type="team"><strong>2 gegen 2</strong><small>Team Wursti · Team Bertha</small></button>
      </div></section>
      <section class="dart-caller-card"><h3>2. Spieler wählen <span class="dart-caller-count">${state.selectedPlayers.length}/${state.gameType === "team" ? 4 : 4}</span></h3>
        <div class="dart-caller-player-grid">${availablePlayers.map(name => `<button class="dart-caller-player ${state.selectedPlayers.includes(name) ? "selected" : ""}" data-cricket-player="${esc(name)}"><span>${esc(name)}</span><span class="dart-caller-check">✓</span></button>`).join("")}</div>
      </section>
      ${state.gameType === "team" && state.selectedPlayers.length ? `<section class="dart-caller-card"><h3>3. Teams zuordnen</h3><div class="dart-cricket-team-picker">${["wursti", "bertha"].map(teamId => `<article><div class="dart-cricket-team-title"><img src="${TEAM_META[teamId].image}" alt=""><strong>${TEAM_META[teamId].name}</strong></div>${state.selectedPlayers.map(name => `<button class="${state.teams[name] === teamId ? "selected" : ""}" data-cricket-team="${teamId}" data-cricket-team-player="${esc(name)}">${esc(name)}</button>`).join("")}</article>`).join("")}</div><p class="dart-cricket-hint">Die Auswahlreihenfolge bestimmt, wer innerhalb des Teams zuerst wirft.</p></section>` : ""}
      <button class="dart-caller-primary" data-cricket-start ${canStart ? "" : "disabled"}>Cricket starten</button>
    </div>`;
  }

  function boardMarkup() {
    const active = activeThrower();
    return `<div class="dart-cricket-board" style="--columns:${state.competitors.length}">
      <div class="dart-cricket-board-head"><span>Feld</span>${state.competitors.map(item => `<div class="${item.id === active?.competitorId ? "active" : ""}">${item.image ? `<img src="${item.image}" alt="">` : ""}<strong>${esc(item.name)}</strong><small>${item.points} Punkte</small></div>`).join("")}</div>
      ${TARGETS.map(target => `<div class="dart-cricket-board-row"><strong>${targetLabel(target)}</strong>${state.competitors.map(item => `<div class="${item.marks[target] >= 3 ? "closed" : ""}" aria-label="${item.marks[target]} Markierungen"><span>${markSymbol(item.marks[target])}</span></div>`).join("")}</div>`).join("")}
    </div>`;
  }
  function inputMarkup() {
    return `<section class="dart-caller-input"><div class="dart-caller-multipliers">${[[1,"Single"],[2,"Double"],[3,"Triple"]].map(([value,label]) => `<button class="${state.multiplier === value ? "selected" : ""}" data-cricket-multiplier="${value}">${label}</button>`).join("")}</div><div class="dart-caller-numbers">${Array.from({length:20},(_,i)=>i+1).map(number => `<button data-cricket-score="${number}">${number}</button>`).join("")}<button data-cricket-score="0">Miss</button><button class="dart-caller-bull" data-cricket-bull="1">25</button><button class="dart-caller-bullseye" data-cricket-bull="2">Bull</button></div></section>`;
  }
  function gameMarkup() {
    const active = activeThrower();
    const comp = competitor(active?.competitorId);
    return `<div class="overlay dart-caller-shell dart-cricket-shell"><div class="dart-caller-gamebar"><button class="dart-back-to-selection" data-cricket-abort>Partie abbrechen</button><span class="dart-caller-game-mode">Cricket · ${state.gameType === "team" ? "2 gegen 2" : "Einzel"}</span></div>
      ${state.toast ? `<div class="dart-caller-toast">${esc(state.toast)}</div>` : ""}
      ${state.completed ? winnerMarkup() : `${boardMarkup()}<section class="dart-caller-turn dart-cricket-turn"><div><span class="dart-caller-eyebrow">Am Board${state.gameType === "team" ? ` · ${esc(comp.name)}` : ""}</span><h2>${esc(active.name)}</h2></div><div class="dart-caller-turn-total"><span>Aufnahme</span><strong>${state.darts.length}/3</strong></div></section>
      <div class="dart-caller-darts">${[0,1,2].map(index => `<div class="dart-caller-dart ${state.darts[index] ? "filled" : ""}"><span>Dart ${index+1}</span><strong>${state.darts[index] ? esc(state.darts[index].label) : "–"}</strong></div>`).join("")}</div>
      ${inputMarkup()}<div class="dart-caller-actions"><button data-cricket-undo ${state.undoStack.length ? "" : "disabled"}>↶ Letzten Dart zurück</button><button data-cricket-end>Aufnahme beenden →</button></div>`}
    </div>`;
  }

  function ranking() {
    return state.competitors.slice().sort((a,b) => b.points-a.points || closedCount(b)-closedCount(a) || markCount(b)-markCount(a));
  }
  function closedCount(item) { return TARGETS.filter(target => item.marks[target] >= 3).length; }
  function markCount(item) { return TARGETS.reduce((sum,target) => sum + Math.min(3,item.marks[target]),0); }
  function places() {
    const sorted = ranking(); let lastKey=""; let place=0;
    return sorted.map((item,index) => { const key=`${item.points}:${closedCount(item)}:${markCount(item)}`; if(key!==lastKey) place=index+1; lastKey=key; return {item,place}; });
  }
  function durationLabel() {
    const seconds = Math.max(0, Math.round((state.completedAt-state.startedAt)/1000));
    return seconds < 60 ? `${seconds} Sek.` : `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")} Min.`;
  }
  function awards() {
    const logs=state.throwLog; const byPlayer=name=>logs.filter(d=>d.player===name); const bestMarks=state.throwers.map(p=>({name:p.name,value:byPlayer(p.name).reduce((s,d)=>s+(TARGETS.includes(d.baseValue)?d.multiplier:0),0)})).sort((a,b)=>b.value-a.value)[0];
    const misses=logs.filter(d=>d.isMiss || !TARGETS.includes(d.baseValue)).length;
    const favorite=[...TARGETS].map(target=>({target,count:logs.filter(d=>d.baseValue===target).length})).sort((a,b)=>b.count-a.count)[0];
    return [
      ["⏱ Partiezeit",durationLabel(),`${state.turnNumber} Aufnahmen`],
      ["🎯 Meiste Markierungen",bestMarks?.name||"–",`${bestMarks?.value||0} Roh-Treffer`],
      ["🔥 Lieblingsfeld",targetLabel(favorite?.target||20),`${favorite?.count||0}× getroffen`],
      ["📈 Höchste Punktzahl",`${Math.max(...state.competitors.map(c=>c.points))} Punkte`,state.gameType==="team"?"Gemeinsam erarbeitet":"Sauber gesammelt"],
      ["🌭 Nebenan gelandet",`${misses} Darts`,misses?"Auch das Board drumherum zählt":"Verdächtig zielgenau"]
    ];
  }
  function winnerMarkup() {
    const winner=competitor(state.winnerId); return `<section class="dart-caller-winner"><span>${state.gameType==="team"?TEAM_META[state.winnerId]?.icon:"🏆"}</span><p>Cricket gewonnen</p><h2>${esc(winner?.name||"")}</h2><strong>${winner?.points||0} Punkte · alle Felder geschlossen</strong><div class="dart-caller-ranking">${places().flatMap(({item,place}) => state.gameType==="team" ? item.players.map(name=>`<div><span>${place}. ${esc(name)}</span><strong>${item.points} P.</strong></div>`) : [`<div><span>${place}. ${esc(item.name)}</span><strong>${item.points} P.</strong></div>`]).join("")}</div><div class="dart-caller-awards">${awards().map(([title,value,note])=>`<article><span>${title}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></article>`).join("")}</div><div class="dart-caller-save-state ${state.saveError?"error":""}">${state.saving?"Ergebnis wird gespeichert …":state.saved?"✓ Ergebnis und Würfe gespeichert":state.saveError||""}</div>${state.saveError?`<button class="dart-caller-secondary" data-cricket-retry>Erneut speichern</button>`:""}<button class="dart-caller-primary" data-cricket-rematch>Revanche</button></section>`;
  }

  function render(){ mount.innerHTML=state.screen==="setup"?setupMarkup():gameMarkup(); bind(); }
  function bind(){
    mount.querySelector("[data-cricket-back]")?.addEventListener("click",()=>window.WRCShowDartCallerSetup?.());
    mount.querySelectorAll("[data-cricket-type]").forEach(b=>b.addEventListener("click",()=>{state.gameType=b.dataset.cricketType;state.selectedPlayers=[];state.teams={};render();}));
    mount.querySelectorAll("[data-cricket-player]").forEach(b=>b.addEventListener("click",()=>{const n=b.dataset.cricketPlayer;state.selectedPlayers=state.selectedPlayers.includes(n)?state.selectedPlayers.filter(x=>x!==n):[...state.selectedPlayers,n].slice(0,4);if(!state.selectedPlayers.includes(n))delete state.teams[n];render();}));
    mount.querySelectorAll("[data-cricket-team]").forEach(b=>b.addEventListener("click",()=>{const team=b.dataset.cricketTeam,n=b.dataset.cricketTeamPlayer;if(state.teams[n]===team)delete state.teams[n];else if(state.selectedPlayers.filter(p=>state.teams[p]===team).length<2)state.teams[n]=team;render();}));
    mount.querySelector("[data-cricket-start]")?.addEventListener("click",startGame); mount.querySelector("[data-cricket-resume]")?.addEventListener("click",restore); mount.querySelector("[data-cricket-discard]")?.addEventListener("click",()=>{clearSaved();render();});
    mount.querySelectorAll("[data-cricket-multiplier]").forEach(b=>b.addEventListener("click",()=>{state.multiplier=Number(b.dataset.cricketMultiplier);render();}));
    mount.querySelectorAll("[data-cricket-score]").forEach(b=>b.addEventListener("click",()=>addDart(Number(b.dataset.cricketScore),state.multiplier)));
    mount.querySelectorAll("[data-cricket-bull]").forEach(b=>b.addEventListener("click",()=>addDart(25,Number(b.dataset.cricketBull))));
    mount.querySelector("[data-cricket-undo]")?.addEventListener("click",undo); mount.querySelector("[data-cricket-end]")?.addEventListener("click",finishTurn); mount.querySelector("[data-cricket-abort]")?.addEventListener("click",abort);
    mount.querySelector("[data-cricket-retry]")?.addEventListener("click",saveGame); mount.querySelector("[data-cricket-rematch]")?.addEventListener("click",rematch);
  }

  function startGame(){
    if(state.gameType==="solo") state.competitors=state.selectedPlayers.map(name=>({id:name,name,players:[name],marks:freshMarks(),points:0}));
    else state.competitors=["wursti","bertha"].map(id=>({id,name:TEAM_META[id].name,image:TEAM_META[id].image,players:state.selectedPlayers.filter(name=>state.teams[name]===id),marks:freshMarks(),points:0}));
    if(state.gameType==="solo") state.throwers=state.selectedPlayers.map(name=>({name,competitorId:name}));
    else {
      const wursti=state.competitors.find(item=>item.id==="wursti").players;
      const bertha=state.competitors.find(item=>item.id==="bertha").players;
      state.throwers=[
        {name:wursti[0],competitorId:"wursti"},{name:bertha[0],competitorId:"bertha"},
        {name:wursti[1],competitorId:"wursti"},{name:bertha[1],competitorId:"bertha"}
      ];
    }
    const startingCompetitor=state.competitors[Math.floor(Math.random()*state.competitors.length)].id;
    state.currentThrower=Math.max(0,state.throwers.findIndex(item=>item.competitorId===startingCompetitor)); state.screen="game";state.turnNumber=1;state.darts=[];state.throwLog=[];state.undoStack=[];state.startedAt=Date.now();state.completedAt=null;state.completed=false;state.winnerId=null;state.saving=false;state.saved=false;state.savedGameId=null;state.saveError="";clearSaved();persist();render();requestWakeLock();
  }
  function snapshot(label){return {label,competitors:structuredClone(state.competitors),throwers:structuredClone(state.throwers),currentThrower:state.currentThrower,turnNumber:state.turnNumber,darts:structuredClone(state.darts),throwLog:structuredClone(state.throwLog),completed:state.completed,winnerId:state.winnerId,completedAt:state.completedAt};}
  function addDart(base,multiplier){
    if(state.completed||state.darts.length>=3)return; const thrower=activeThrower(), owner=competitor(thrower.competitorId); const label=base===0?"Miss":base===25?(multiplier===2?"Bull":"25"):`${multiplier===3?"T":multiplier===2?"D":""}${base}`; state.undoStack.push(snapshot(label));
    let marksAdded=0,pointsAdded=0,closedTarget=false; if(TARGETS.includes(base)){const before=owner.marks[base];marksAdded=Math.min(multiplier,Math.max(0,3-before));owner.marks[base]=Math.min(3,before+multiplier);closedTarget=before<3&&owner.marks[base]===3;const overflow=Math.max(0,multiplier-marksAdded);if(overflow&&state.competitors.some(c=>c.id!==owner.id&&c.marks[base]<3)){pointsAdded=overflow*base;owner.points+=pointsAdded;}}
    const dart={base,multiplier,label,marksAdded,pointsAdded,closedTarget};state.darts.push(dart);state.throwLog.push({player:thrower.name,competitorId:owner.id,turnNumber:state.turnNumber,dartPosition:state.darts.length,baseValue:base,multiplier,scoredValue:base*multiplier,isMiss:base===0,cricketMarks:marksAdded,cricketPoints:pointsAdded,closedTarget});state.multiplier=1;
    if(hasWon(owner)){completeGame(owner.id);return;}persist();render();if(state.darts.length===3){window.clearTimeout(turnTimer);turnTimer=window.setTimeout(finishTurn,420);}
  }
  function hasWon(owner){return TARGETS.every(t=>owner.marks[t]>=3)&&state.competitors.every(other=>other.id===owner.id||owner.points>other.points);}
  function finishTurn(){if(state.completed||!state.darts.length)return;window.clearTimeout(turnTimer);turnTimer=null;const points=state.darts.reduce((s,d)=>s+d.pointsAdded,0);const closed=[...new Set(state.darts.filter(d=>d.closedTarget).map(d=>targetLabel(d.base)))];window.WRCDartCallerAudio?.playCricketTurn?.(closed,points);state.currentThrower=(state.currentThrower+1)%state.throwers.length;state.turnNumber+=1;state.darts=[];state.multiplier=1;persist();render();}
  async function undo(){window.clearTimeout(turnTimer);turnTimer=null;const previous=state.undoStack.pop();if(!previous)return;const gameId=state.savedGameId;saveGeneration+=1;Object.assign(state,previous,{screen:"game",saving:false,saved:false,savedGameId:null,saveError:"",toast:`${previous.label} zurückgenommen`});window.WRCDartCallerAudio?.stop();persist();render();requestWakeLock();if(gameId&&typeof supabaseClient!=="undefined"){await supabaseClient.from("dart_games").delete().eq("id",gameId);window.WRCRefreshDartHistory?.();window.loadDartStatistics?.();}}
  function completeGame(id){window.clearTimeout(turnTimer);turnTimer=null;state.completed=true;state.winnerId=id;state.completedAt=Date.now();clearSaved();releaseWakeLock();render();window.WRCDartCallerAudio?.playSpecial("winner");saveGame();}
  function resultRows(gameId){return places().flatMap(({item,place})=>item.players.map(player=>({game_id:gameId,player,place})));}
  async function saveGame(){
    if(!state.completed||state.saving||state.saved||typeof supabaseClient==="undefined")return;const generation=++saveGeneration;state.saving=true;state.saveError="";render();const mode=`WRC Caller Cricket · ${state.gameType==="team"?"2 gegen 2":"Einzel"}`;const {data:game,error:gErr}=await supabaseClient.from("dart_games").insert({game_date:new Date().toISOString().split("T")[0],mode}).select().single();if(gErr){return saveFail("Das Ergebnis konnte nicht gespeichert werden.",gErr);}if(generation!==saveGeneration){await supabaseClient.from("dart_games").delete().eq("id",game.id);return;}
    const {error:rErr}=await supabaseClient.from("dart_results").insert(resultRows(game.id));if(rErr){await supabaseClient.from("dart_games").delete().eq("id",game.id);return saveFail("Die Platzierungen konnten nicht gespeichert werden.",rErr);}
    const rows=state.throwLog.map(d=>({game_id:game.id,player:d.player,turn_number:d.turnNumber,dart_position:d.dartPosition,base_value:d.baseValue,multiplier:d.multiplier,scored_value:d.scoredValue,is_miss:d.isMiss,is_bust:false}));const {error:tErr}=rows.length?await supabaseClient.from("dart_throws").insert(rows):{error:null};if(tErr){await supabaseClient.from("dart_games").delete().eq("id",game.id);return saveFail("Das Wurfprotokoll konnte nicht gespeichert werden.",tErr);}state.saving=false;state.saved=true;state.savedGameId=game.id;render();await window.WRCRefreshDartHistory?.();window.loadDartStatistics?.();window.dispatchEvent(new CustomEvent("wrc:dart-game-saved",{detail:{mode}}));
  }
  function saveFail(message,error){console.error("WRC CRICKET SAVE ERROR",error);state.saving=false;state.saveError=message;render();}
  function restore(){state={...freshState(),...savedGame.state,screen:"game",saving:false,saved:false,saveError:""};render();requestWakeLock();}
  function abort(){if(window.confirm("Cricket-Partie wirklich abbrechen? Es wird kein Ergebnis gespeichert.")){window.clearTimeout(turnTimer);turnTimer=null;clearSaved();releaseWakeLock();state=freshState();render();}}
  function rematch(){const selected=state.selectedPlayers.slice(),teams={...state.teams},type=state.gameType;state=freshState();state.selectedPlayers=selected;state.teams=teams;state.gameType=type;startGame();}
  async function requestWakeLock(){if(!("wakeLock" in navigator)||wakeLock||state.completed)return;try{wakeLock=await navigator.wakeLock.request("screen");wakeLock.addEventListener("release",()=>wakeLock=null,{once:true});}catch{}}
  async function releaseWakeLock(){if(!wakeLock)return;try{await wakeLock.release();}catch{}wakeLock=null;}
  window.WRCDartCricket={open(){savedGame=readSavedGame();state=freshState();render();}};
})();

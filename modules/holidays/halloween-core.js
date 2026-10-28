/* Pure Halloween content and local-only simulation. Production outcomes come from SQL. */
(function(root){
  'use strict';
  const owners=['Thorsten','Basti','Fabi','Marian'];
  const weights=Object.freeze([45,25,20,10]); // Preview mirrors wrc_halloween_weights(); never used for production draws.
  const events=['continue','scare','gold','curse'];
  const curses=[
    ['Der Kühlschrank-Fluch','Du wirst heute mindestens dreimal völlig grundlos in den Kühlschrank schauen.','Gomesch weiß, wovon er spricht.'],
    ['Der Wurst-Fluch','Du wirst heute bei jedem Würstchen das Gefühl haben, beobachtet zu werden.','Wursti nennt das Qualitätskontrolle.'],
    ['Der Basti-Fluch','Bei deinem nächsten Fußballspiel wird der Ball deine Absichten durchschauen.','Er hat sich bereits taktisch zurückgezogen.'],
    ['Der Alters-Fluch','Du wirst heute beim Aufstehen ein Geräusch machen, das eigentlich nur Fabi zusteht.','Der Alterspräsident prüft die Lizenz.'],
    ['Der WRC-Fluch','Du wirst die WRC heute noch einmal öffnen, obwohl du genau weißt, dass sich nichts verändert hat.','Bertha hat den nächsten Besuch schon notiert.'],
    ['Der Socken-Fluch','Deine Sportsocken werden sich heimlich auf zwei verschiedene Schubladen verteilen.','Ein sehr kleines Auswärtsspiel.'],
    ['Der Bauplan-Fluch','Jede gute Idee von dir braucht heute plötzlich ein zusätzliches Kabel.','Thorsten nennt das eine kleine Erweiterung.'],
    ['Der Theater-Fluch','Du wirst beim nächsten Einkauf so tun, als wüsstest du genau, was du brauchst.','Gomesch würde diese Improvisation durchgehen lassen.'],
    ['Der Volleyball-Fluch','Das nächste Sofakissen wird dir wie eine perfekte Vorlage vorkommen.','Fabi empfiehlt einen kontrollierten Angriff.'],
    ['Der Klingel-Fluch','Du wirst heute eine Fahrradklingel hören, obwohl weit und breit kein Fahrrad steht.','Der Sattel hat einen Geist bestellt.'],
    ['Der Besteck-Fluch','Du wirst ausgerechnet die Gabel suchen, die du bereits in der Hand hältst.','Bertha möchte dazu nichts sagen.'],
    ['Der Halbzeit-Fluch','Du wirst jede Pause heute für fünf Minuten länger halten, als sie wirklich dauert.','Basti fordert Nachspielzeit.'],
    ['Der Senf-Fluch','Beim nächsten Grillen wird der Senf genau auf deiner Seite leer sein.','Wursti war nur ganz kurz da.'],
    ['Der Treppen-Fluch','Du wirst die letzten zwei Stufen zählen und beim Ergebnis kurz unsicher werden.','Die Bauaufsicht untersucht den Fall.'],
    ['Der Fernbedienungs-Fluch','Du wirst die Fernbedienung genau dort finden, wo du schon zweimal gesucht hast.','Bertha nennt es ein Wiedersehen.']
  ];
  const comments=['Du dachtest doch nicht, dass es so einfach wird?','Wursti hat den Ausgang vergessen.','Bertha wollte eigentlich schon Feierabend machen.','Die Türen wurden übrigens von Fabi montiert.','Du bist immer noch hier?','Gomesch behauptet, er kennt eine Abkürzung.','Basti hätte jetzt einfach einen Ball dagegen geschossen.','Die Bauaufsicht hat Thorstens Labyrinth nicht genehmigt.'];
  const doors={Thorsten:{kind:'workshop',title:'Die Werkstatttür',symbol:'⚡',mark:'WRC · ZENTRALE',note:'NICHT DEN ROTEN KNOPF',detail:'Bauplan 04 · ohne Gewähr'},Basti:{kind:'locker',title:'Die Kabinentür',symbol:'⚽',mark:'KABINE 04',note:'VERLÄNGERUNG',detail:'Welpenschutz abgelaufen'},Fabi:{kind:'crypt',title:'Die Grufttür',symbol:'♛',mark:'PRÄSIDIUM',note:'EWIGE AMTSZEIT',detail:'Bitte vor dem Aufstehen knarzen'},Marian:{kind:'fridge',title:'Der verbotene Kühlschrank',symbol:'❄',mark:'NICHT ÖFFNEN',note:'ICH BIN IM KÜHLSCHRANK',detail:'Inhalt improvisiert'}};
  function shuffle(random=Math.random){const a=[...owners];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function draw(random=Math.random){let r=random()*100;for(let i=0;i<weights.length;i++){r-=weights[i];if(r<0)return events[i];}return 'curse';}
  function valid(r){return !!r&&owners.includes(r.player)&&Number.isInteger(r.event_year)&&r.event_year>=2026&&Number.isSafeInteger(r.doors)&&r.doors>=1&&owners.includes(r.last_owner)&&Array.isArray(r.door_order)&&r.door_order.length===4&&owners.every(p=>r.door_order.includes(p))&&((r.status==='active'&&r.outcome==='continue'&&!r.completed_date)||(r.status==='complete'&&events.slice(1).includes(r.outcome)&&r.completed_date===r.event_year+'-10-31'))&&(r.outcome==='curse'?Number.isInteger(r.curse)&&r.curse>=0&&r.curse<curses.length:r.curse===null);}
  function step(previous,player,year,expected,owner,forced,random=Math.random){
    if(previous&&(previous.status==='complete'||previous.doors!==expected))return previous;
    if(!owners.includes(player)||!owners.includes(owner)||(!previous&&expected!==0))throw Error('Ungültiger Raum');
    const outcome=events.includes(forced)?forced:draw(random);
    return {event_year:year,player,doors:expected+1,last_owner:owner,door_order:shuffle(random),outcome,status:outcome==='continue'?'active':'complete',curse:outcome==='curse'?Math.floor(random()*curses.length):null,completed_date:outcome==='continue'?null:year+'-10-31'};
  }
  root.WRCHalloweenCore=Object.freeze({owners,weights,events,curses,comments,doors,shuffle,draw,valid,step});
})(typeof window==='undefined'?globalThis:window);

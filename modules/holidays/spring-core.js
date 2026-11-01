/* Stable seasonal rules. No device randomness, no points calculation. */
(function(root){
 'use strict';
 const members=Object.freeze(['Thorsten','Fabi','Marian','Basti']);
 const FIRST_YEAR=2027;
 function shuffle(items,seed){const a=[...items];let x=seed>>>0;for(let i=a.length-1;i>0;i--){x=(Math.imul(x,1664525)+1013904223)>>>0;const j=x%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 // Same arithmetic in SQL; each odd stride permutes the eight IDs, two per member.
 function eggOwner(year,egg){if(!Number.isInteger(year)||year<FIRST_YEAR||!Number.isInteger(egg)||egg<0||egg>7)return null;const stride=[1,3,5,7][Math.floor((year-FIRST_YEAR)/4)%4];return members[Math.floor(((egg*stride+(year-FIRST_YEAR))%8)/2)];}
 const themes=Object.freeze([
 ['Wursthelm','Prinz','der diplomatischen Grillzange','#dbb15c','crown'],['Sternenballett','Die kosmische Fee','der schwerelosen Bratwurst','#c2a2ed','star'],['Suppenorbit','Admiral','der fliegenden Suppenschüssel','#82d4df','orbit'],['Bohnenbarock','Baron','des königlichen Bohnenballetts','#b7d58b','plume'],['Disco-Rüstung','Ritter','der glitzernden Kniebeuge','#eea4c4','helmet'],['Wolkenküche','Professor','der schwebenden Pfanne','#e9c69b','chef'],['Senfmagie','Magier','der geheimen Senfspirale','#e5cc63','wizard'],['Konfettipost','Herzog','der expressgelieferten Luftschlange','#8bb9eb','crown'],['Tüllrakete','Captain','der rasenden Tüllrakete','#df91ca','star'],['Gurkenplanet','Kommodore','des intergalaktischen Gurkenglases','#82d2b6','orbit'],['Samtzirkus','Graf','der samtenen Wurstparade','#c5a3e3','plume'],['Glitzerlabor','Doktor','der funkelnden Ausrede','#e8a187','helmet']]);
 const personal={Thorsten:['WRC-Ideenministerium','Abteilung für runde Angelegenheiten','Gründeramt mit Konfettierlaubnis'],Basti:['Fußballhof mit Welpenschutz','Abteilung rollender Bälle','Nachwuchsrat der Wurstrand-Runde'],Marian:['Gomeschs Kühlschranktheater','Improvisationsamt ohne Drehbuch','Vizepräsidentenloge mit Kühlfach'],Fabi:['Alterspräsidentenpalast','Volleyballrat mit Tüllnetz','Puzzleministerium mit Snackpause']};
 function costumes(year){const offset=(year-FIRST_YEAR)%themes.length;return members.map((player,i)=>{const t=themes[(offset+i*3)%themes.length];return {player,theme:t[0],title:t[1]+' '+player+' '+t[2],color:t[3],hat:t[4],detail:personal[player][Math.floor((year-FIRST_YEAR)/themes.length+i)%3],prop:(year+i)%4};});}
 function validFind(r){return !!r&&Number.isInteger(r.event_year)&&r.event_year>=FIRST_YEAR&&eggOwner(r.event_year,r.egg_id)===r.player&&r.points===1&&WRCHolidayCalendar.resolve(r.found_date)?.type==='easter'&&Number(r.found_date.slice(0,4))===r.event_year;}
 root.WRCSpringCore=Object.freeze({FIRST_YEAR,members,shuffle,eggOwner,costumes,validFind});
})(typeof window==='undefined'?globalThis:window);

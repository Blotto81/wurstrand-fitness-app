/* Existing services are injected at call time; script loading order does not copy their rules. */
(function(root){
  'use strict';
  function context(){return {score:calcPoints,clean:cleanLoadedEntries,streakCore:WRCBonusStreakCore,clubDefinitions:WRCClubs.definitions,history:{players:HISTORIC_PLAYER_TOTALS,team:HISTORIC_TOTALS},halloween:typeof WRCHalloweenData==='undefined'?[]:WRCHalloweenData.records(),easter:typeof WRCSpringData==='undefined'?[]:WRCSpringData.records(),bonuses:typeof WRCBonusPoints==='undefined'?[]:WRCBonusPoints.matching()};}
  function occasion(player,entries,through,occasion='message'){return WRCInsights.highlight(player,entries,through,{...context(),occasion});}
  // Evaluation version is separate from the stored source schema version.
  // The immutable server freeze timestamp avoids any database rewrite or client-clock choice.
  const STREAK_RULES_V2_FROM = Date.parse("2026-11-09T19:23:17Z");
  function archive(snapshot,frozenAt=null){if(![1,2,3].includes(snapshot.version))throw Error('Diese Archivversion wird noch nicht unterstützt.');return WRCInsights.build({...context(),...snapshot,streakRulesVersion:snapshot.version===3 && typeof frozenAt==="string" && Number.isFinite(Date.parse(frozenAt)) && Date.parse(frozenAt)>=STREAK_RULES_V2_FROM?2:1,easter:snapshot.version===3?snapshot.easter:[],halloween:snapshot.version>=2?snapshot.halloween:[]});}
  root.WRCOccasions=Object.freeze({context,occasion,archive});
})(window);

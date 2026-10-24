/* Existing services are injected at call time; script loading order does not copy their rules. */
(function(root){
  'use strict';
  function context(){return {score:calcPoints,clean:cleanLoadedEntries,streakCore:WRCBonusStreakCore,clubDefinitions:WRCClubs.definitions,history:{players:HISTORIC_PLAYER_TOTALS,team:HISTORIC_TOTALS},bonuses:typeof WRCBonusPoints==='undefined'?[]:WRCBonusPoints.matching()};}
  function occasion(player,entries,through,occasion='message'){return WRCInsights.highlight(player,entries,through,{...context(),occasion});}
  function archive(snapshot){if(snapshot.version!==1)throw Error('Diese Archivversion wird noch nicht unterstützt.');return WRCInsights.build({...context(),...snapshot});}
  root.WRCOccasions=Object.freeze({context,occasion,archive});
})(window);

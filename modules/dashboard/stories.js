/* A verified server load is required; local quickstart data never produces claims. */
(function () {
  'use strict';
  let loadedAt=0, loadedDay='', cachedEntries=null, cachedDay='', cachedStory=null, refreshing=false;
  const core=WRCDashboardStoryCore;
  function special(day) {
    return !!(WRCHolidayCalendar.resolve(day)||WRCBirthdayData.celebrating(day)||
      (day.slice(5)>='12-25'&&day.slice(5)<='12-31')||
      document.body.classList.contains('wrc-member-birthday-active'));
  }
  function render() {
    const card=document.getElementById('dashboardHighlight');
    if(!card) return;
    const day=core.today();
    const valid=loadedAt&&loadedDay===day&&Date.now()-loadedAt<5*60*1000&&navigator.onLine!==false&&!special(day);
    let story=null;
    if(valid) {
      if(cachedEntries!==allEntries||cachedDay!==day) {
        cachedStory=core.build({day,entries:allEntries,players:people,score:calcPoints,clean:cleanLoadedEntries});
        cachedEntries=allEntries; cachedDay=day;
      }
      story=cachedStory;
    }
    card.hidden=!story;
    card.classList.toggle('is-record',story?.kind==='record');
    if(story) {
      document.getElementById('dashboardHighlightKicker').textContent=story.kicker;
      document.getElementById('dashboardHighlightTitle').textContent=story.label;
      document.getElementById('dashboardHighlightText').textContent=story.text;
    }
  }
  async function refresh() {
    render();
    if(document.hidden||navigator.onLine===false||refreshing||!loadedAt||Date.now()-loadedAt<4*60*1000&&loadedDay===core.today()) return;
    refreshing=true;
    try { await loadEntries(); } finally { refreshing=false; }
  }
  window.WRCDashboardStories=Object.freeze({render,
    onEntriesLoaded(){loadedAt=Date.now();loadedDay=core.today();cachedEntries=null;},
    onLoadError(){cachedEntries=null;cachedStory=null;loadedDay='';render();}
  });
  document.addEventListener('visibilitychange',refresh);
  window.addEventListener('focus',refresh);
  window.addEventListener('offline',render);
  window.addEventListener('online',refresh);
  setInterval(refresh,60000);
})();

(function () {
  "use strict";

  const CLUBS = [
    {
      id: "steps",
      name: "Club der weiten Sohlen",
      metric: "steps",
      unit: "Schritte",
      decimals: 0,
      accent: "sky",
      tiers: [
        { threshold: 20000, title: "Weitläufer" },
        { threshold: 25000, title: "Kilometerjäger" },
        { threshold: 30000, title: "Horizontläufer" }
      ]
    },
    {
      id: "bike",
      name: "Kettenkreis",
      metric: "bike",
      unit: "km",
      decimals: 1,
      accent: "amber",
      tiers: [
        { threshold: 20, title: "Ausfahrer" },
        { threshold: 30, title: "Tourenfahrer" },
        { threshold: 40, title: "Langstreckler" },
        { threshold: 50, title: "Königsetappe" }
      ]
    }
  ];

  function number(value, decimals) {
    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(Number(value) || 0);
  }

  function metricValue(entry, club) {
    return Number(entry?.[club.metric]) || 0;
  }

  function iconMarkup(club) {
    if (club.id === "bike") {
      return `
        <svg class="club-icon-bike" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="16" cy="43" r="11"></circle>
          <circle cx="49" cy="43" r="11"></circle>
          <path d="M16 43l11-20h11l11 20M27 23l11 20H16m11-20-4-7m14 0h9"></path>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M20 34c-6 1-10 7-9 14 1 6 6 10 12 9 7-1 10-8 8-14-2-6-6-10-11-9Z"></path>
        <circle cx="12" cy="26" r="4"></circle>
        <circle cx="18" cy="22" r="4"></circle>
        <circle cx="25" cy="22" r="4"></circle>
        <path d="M43 7c-6 1-10 7-9 14 1 6 6 10 12 9 7-1 10-8 8-14-2-6-6-10-11-9Z"></path>
        <circle cx="36" cy="38" r="4"></circle>
        <circle cx="43" cy="42" r="4"></circle>
        <circle cx="50" cy="41" r="4"></circle>
      </svg>
    `;
  }

  function playerEntries(player, entries) {
    return (entries || [])
      .filter(entry => entry.person === player && entry.date)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }

  function clubState(club, player, entries) {
    const relevant = playerEntries(player, entries);
    const bestEntry = relevant.reduce((best, entry) =>
      metricValue(entry, club) > metricValue(best, club) ? entry : best
    , null);
    const best = metricValue(bestEntry, club);

    const tiers = club.tiers.map((tier, index) => {
      const triggerEntry = relevant.find(entry => metricValue(entry, club) >= tier.threshold) || null;
      return { ...tier, level: index + 1, triggerEntry, reached: !!triggerEntry };
    });

    const reached = tiers.filter(tier => tier.reached);
    const highest = reached[reached.length - 1] || null;
    return { club, best, bestEntry, tiers, reached, highest };
  }

  function formatAchievement(club, value) {
    return `${number(value, club.decimals)} ${club.unit}`;
  }

  function openEntry(date) {
    if (date && typeof window.jumpToDate === "function") {
      window.jumpToDate(date);
    }
  }

  const visiblePatches = new Map();

  function renderPlayerPatches(player, entries) {
    visiblePatches.clear();
    const patches = CLUBS.flatMap(club =>
      clubState(club, player, entries).reached.map(tier => ({ club, tier }))
    ).sort((a, b) => String(a.tier.triggerEntry.date).localeCompare(String(b.tier.triggerEntry.date)));

    patches.forEach(({ club, tier }) => {
      visiblePatches.set(`${club.id}-${tier.level}`, { club, tier, player });
    });

    if (!patches.length) return `<div class="player-patch-empty">Noch keine Patches</div>`;

    return `
      <div class="player-patch-shelf" aria-label="Erreichte Patches von ${player}">
        ${patches.map(({ club, tier }, index) => `
          <button type="button"
            class="player-mini-patch club-${club.accent}"
            style="--patch-index:${index}"
            title="${tier.title}"
            aria-label="Patch ${tier.title} öffnen"
            onclick="WRCClubs.showPatch('${club.id}-${tier.level}')">
            <span class="club-patch-stitches" aria-hidden="true"></span>
            <span class="club-patch-icon">${iconMarkup(club)}</span>
            <strong>${tier.level}</strong>
          </button>
        `).join("")}
      </div>
    `;
  }

  function showPatch(key) {
    const patch = visiblePatches.get(key);
    if (!patch) return;
    const { club, tier, player } = patch;
    const date = tier.triggerEntry.date;
    const existing = document.getElementById("clubPatchDetail");
    existing?.remove();

    const modal = document.createElement("div");
    modal.id = "clubPatchDetail";
    modal.className = `club-patch-detail club-${club.accent}`;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "clubPatchDetailTitle");
    modal.innerHTML = `
      <div class="club-patch-detail-card">
        <button type="button" class="club-patch-detail-close" aria-label="Schließen" onclick="WRCClubs.closePatch()">×</button>
        <div class="club-patch earned club-patch-detail-art">
          <span class="club-patch-stitches" aria-hidden="true"></span>
          <span class="club-patch-icon">${iconMarkup(club)}</span>
          <span class="club-patch-level">Rang ${tier.level}</span>
          <strong>${tier.title}</strong>
          <small>${formatAchievement(club, tier.threshold)}</small>
        </div>
        <span class="club-unlock-kicker">${club.name}</span>
        <h2 id="clubPatchDetailTitle">${tier.title}</h2>
        <p>${player} hat diesen Patch am ${window.formatDate(date)} freigeschaltet.</p>
        <button type="button" class="primary" onclick="WRCClubs.closePatch(); WRCClubs.openEntry('${date}')">Entscheidenden Eintrag öffnen</button>
      </div>
    `;
    modal.addEventListener("click", event => {
      if (event.target === modal) closePatch();
    });
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("show"));
  }

  function closePatch() {
    const modal = document.getElementById("clubPatchDetail");
    if (!modal) return;
    modal.classList.remove("show");
    setTimeout(() => modal.remove(), 220);
  }

  function findNewUnlocks(entry, previousEntries) {
    return CLUBS.flatMap(club => {
      const current = metricValue(entry, club);
      const oldBest = playerEntries(entry.person, previousEntries)
        .reduce((best, oldEntry) => Math.max(best, metricValue(oldEntry, club)), 0);
      const newlyReached = club.tiers
        .map((tier, index) => ({ ...tier, level: index + 1 }))
        .filter(tier => oldBest < tier.threshold && current >= tier.threshold);
      const highest = newlyReached[newlyReached.length - 1];
      return highest ? [{ club, tier: highest, entry, current }] : [];
    });
  }

  function showUnlock(unlock) {
    const existing = document.getElementById("clubUnlock");
    existing?.remove();

    const { club, tier, entry, current } = unlock;
    const modal = document.createElement("div");
    modal.id = "clubUnlock";
    modal.className = `club-unlock club-${club.accent}`;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "clubUnlockTitle");
    modal.innerHTML = `
      <div class="club-unlock-card">
        <span class="club-unlock-kicker">Neuer Leistungsclub-Rang</span>
        <div class="club-patch earned club-patch-unlock">
          <span class="club-patch-stitches" aria-hidden="true"></span>
          <span class="club-patch-icon">${iconMarkup(club)}</span>
          <span class="club-patch-level">Rang ${tier.level}</span>
          <strong>${tier.title}</strong>
          <small>${formatAchievement(club, tier.threshold)}</small>
        </div>
        <h2 id="clubUnlockTitle">Willkommen im ${club.name}</h2>
        <p>${entry.person} hat mit ${formatAchievement(club, current)} den Patch <strong>${tier.title}</strong> freigeschaltet.</p>
        <div class="club-unlock-actions">
          <button type="button" class="secondary" onclick="WRCClubs.closeUnlock()">Weiter</button>
          <button type="button" class="primary" onclick="WRCClubs.closeUnlock(); WRCClubs.openEntry('${entry.date}')">Eintrag ansehen</button>
        </div>
      </div>
    `;
    modal.addEventListener("click", event => {
      if (event.target === modal) closeUnlock();
    });
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("show"));
  }

  function showUnlocks(unlocks) {
    if (!unlocks?.length) return;
    const queue = [...unlocks];
    const showNext = () => {
      const unlock = queue.shift();
      if (!unlock) return;
      showUnlock(unlock);
      window.clubUnlockNext = queue.length ? showNext : null;
    };
    showNext();
  }

  function closeUnlock() {
    const modal = document.getElementById("clubUnlock");
    if (!modal) return;
    modal.classList.remove("show");
    setTimeout(() => {
      modal.remove();
      const next = window.clubUnlockNext;
      window.clubUnlockNext = null;
      if (typeof next === "function") setTimeout(next, 180);
    }, 220);
  }

  window.WRCClubs = {
    definitions: CLUBS,
    renderPlayerPatches,
    findNewUnlocks,
    showUnlocks,
    showPatch,
    closePatch,
    openEntry,
    closeUnlock
  };
})();

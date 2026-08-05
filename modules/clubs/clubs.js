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

  function safePlayer(player) {
    return String(player || "").replace(/[\\'\n\r]/g, "");
  }

  function openEntry(date) {
    if (date && typeof window.jumpToDate === "function") {
      window.jumpToDate(date);
    }
  }

  function renderClubCard(state, player) {
    const { club, highest, reached } = state;
    const patchTitle = highest?.title || "Noch kein Rang";
    const patchValue = highest ? formatAchievement(club, highest.threshold) : club.name;
    const triggerDate = highest?.triggerEntry?.date || "";

    return `
      <article class="club-card club-${club.accent}">
        <div class="club-card-top">
          <button type="button" class="club-patch${highest ? " earned" : " locked"}"
            ${triggerDate ? `onclick="WRCClubs.openEntry('${triggerDate}')" title="Freischaltenden Eintrag öffnen"` : "disabled"}>
            <span class="club-patch-stitches" aria-hidden="true"></span>
            <span class="club-patch-icon">${iconMarkup(club)}</span>
            <span class="club-patch-level">${highest ? `Rang ${highest.level}` : "Club"}</span>
            <strong>${patchTitle}</strong>
            <small>${patchValue}</small>
          </button>

          <div class="club-card-copy">
            <span class="club-eyebrow">Persönlicher Leistungsclub</span>
            <h4>${club.name}</h4>
            ${highest ? `
              <p><strong>${patchTitle}</strong> wurde erstmals am ${window.formatDate(triggerDate)} erreicht.</p>
              <button type="button" class="club-entry-link" onclick="WRCClubs.openEntry('${triggerDate}')">
                Entscheidenden Eintrag öffnen →
              </button>
            ` : `
              <p>Dieser Club läuft leise mit. Ein Patch zeigt sich erst, wenn er verdient wurde.</p>
            `}
          </div>
        </div>

        <details class="club-ranks">
          <summary>${reached.length} ${reached.length === 1 ? "Patch" : "Patches"} ansehen</summary>
          <div class="club-rank-list">
            ${reached.length ? reached.map(tier => `
              <button type="button" onclick="WRCClubs.openEntry('${tier.triggerEntry.date}')">
                <span>Rang ${tier.level}</span>
                <strong>${tier.title}</strong>
                <small>${formatAchievement(club, tier.threshold)} · ${window.formatDate(tier.triggerEntry.date)}</small>
                <b>Eintrag →</b>
              </button>
            `).join("") : `<p>Noch kein Patch freigeschaltet. Der Club läuft trotzdem schon mit.</p>`}
          </div>
        </details>
      </article>
    `;
  }

  function renderPlayerClubs(player, entries) {
    const states = CLUBS.map(club => clubState(club, player, entries));
    const patchCount = states.reduce((sum, state) => sum + state.reached.length, 0);

    return `
      <section class="player-clubs" aria-label="Leistungsclubs von ${safePlayer(player)}">
        <div class="player-clubs-head">
          <div>
            <span>Persönliche Auszeichnungen</span>
            <h3>Leistungsclubs</h3>
          </div>
          <strong>${patchCount} ${patchCount === 1 ? "Patch" : "Patches"}</strong>
        </div>
        <div class="player-clubs-grid">
          ${states.map(state => renderClubCard(state, player)).join("")}
        </div>
      </section>
    `;
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
    renderPlayerClubs,
    findNewUnlocks,
    showUnlocks,
    openEntry,
    closeUnlock
  };
})();

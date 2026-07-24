(function () {
  const REVIEW_START_DAY = 24;
  const REVIEW_END_DAY = 31;
  const numberFormat = new Intl.NumberFormat("de-DE");
  const decimalFormat = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  });

  let overlay = null;
  let cards = [];
  let activeIndex = 0;
  let currentPlayer = "";
  let currentYear = 0;
  let sourceEntries = [];
  let touchStartX = null;
  let hasCheckedThisLoad = false;

  function storageGet(key, fallback = null) {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      return;
    }
  }

  function playerKey(player) {
    return String(player || "WRC-Team")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .toLowerCase() || "wrc-team";
  }

  function selectedPlayer() {
    const configuredPeople = typeof people !== "undefined" ? people : [];
    return storageGet("wrcPostLastPlayer")
      || document.getElementById("person")?.value
      || configuredPeople[0]
      || "WRC-Team";
  }

  function scheduleDay(year, player) {
    const key = `wrcYearReviewSchedule_${year}_${playerKey(player)}`;
    const saved = Number(storageGet(key));
    if (saved >= REVIEW_START_DAY && saved <= REVIEW_END_DAY) return saved;

    const day = REVIEW_START_DAY
      + Math.floor(Math.random() * (REVIEW_END_DAY - REVIEW_START_DAY + 1));
    storageSet(key, String(day));
    return day;
  }

  function shouldReveal(date, player, preview = false) {
    if (preview) return true;
    const year = date.getFullYear();
    const shownKey = `wrcYearReviewShown_${year}_${playerKey(player)}`;
    if (storageGet(shownKey)) return false;
    if (date.getMonth() !== 11) return false;

    const day = date.getDate();
    if (day < REVIEW_START_DAY || day > REVIEW_END_DAY) return false;
    return day >= scheduleDay(year, player);
  }

  function markShown(year, player, preview) {
    if (!preview) {
      storageSet(`wrcYearReviewShown_${year}_${playerKey(player)}`, new Date().toISOString());
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("de-DE", {
      day: "numeric",
      month: "long"
    }).format(new Date(`${dateString}T12:00:00`));
  }

  function getYearEntries(entries, year, player) {
    const prefix = `${year}-`;
    return entries.filter(entry =>
      entry.person === player && String(entry.date || "").startsWith(prefix)
    );
  }

  function calculateStreak(entries) {
    const dates = [...new Set(entries.map(entry => entry.date).filter(Boolean))].sort();
    let longest = 0;
    let current = 0;
    let previous = null;

    dates.forEach(date => {
      const value = new Date(`${date}T12:00:00`);
      if (!previous) {
        current = 1;
      } else {
        const difference = Math.round((value - previous) / 86400000);
        current = difference === 1 ? current + 1 : 1;
      }
      longest = Math.max(longest, current);
      previous = value;
    });

    return longest;
  }

  async function countDailys(year, player) {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    try {
      if (typeof supabaseClient !== "undefined") {
        const { data, error } = await supabaseClient
          .from("daily_history")
          .select("completed_date")
          .eq("player", player)
          .gte("completed_date", start)
          .lte("completed_date", end);

        if (!error) return (data || []).length;
      }
    } catch {
      // Der lokale Fallback wird direkt darunter verwendet.
    }

    try {
      const history = typeof WRCDailyStorage !== "undefined"
        ? WRCDailyStorage.getLocalHistory()
        : JSON.parse(storageGet("wrc_daily_history", "[]"));

      return history.filter(item =>
        item.player === player
        && String(item.date || item.completed_date || "").startsWith(`${year}-`)
      ).length;
    } catch {
      return 0;
    }
  }

  function buildCards(entries, dailyCount, player, year) {
    const steps = entries.reduce((sum, entry) => sum + (+entry.steps || 0), 0);
    const bike = entries.reduce((sum, entry) => sum + (+entry.bike || 0), 0);
    const activeDays = new Set(entries.map(entry => entry.date).filter(Boolean)).size;
    const longestStreak = calculateStreak(entries);
    const bestDay = entries.reduce((best, entry) => {
      const points = typeof calcPoints === "function" ? calcPoints(entry).total : 0;
      return points > best.points ? { points, date: entry.date } : best;
    }, { points: 0, date: "" });

    return [
      {
        id: "steps",
        icon: "🏃",
        eyebrow: `${year} in Bewegung`,
        value: steps,
        display: numberFormat.format(steps),
        unit: "Schritte",
        text: "haben deinen Weg durch das WRC-Jahr begleitet.",
        accent: "mint"
      },
      {
        id: "bike",
        icon: "🚴",
        eyebrow: "Auf zwei Rädern",
        value: bike,
        decimals: 1,
        display: decimalFormat.format(bike),
        unit: "Kilometer",
        text: "bist du mit dem Fahrrad gefahren.",
        accent: "sky"
      },
      {
        id: "active-days",
        icon: "📅",
        eyebrow: "Immer wieder da",
        value: activeDays,
        display: numberFormat.format(activeDays),
        unit: activeDays === 1 ? "aktiver Tag" : "aktive Tage",
        text: "Jeder davon hat dieses Jahr ein kleines Stück mitgeschrieben.",
        accent: "violet"
      },
      {
        id: "dailys",
        icon: "🎯",
        eyebrow: "Kleine Missionen",
        value: dailyCount,
        display: numberFormat.format(dailyCount),
        unit: dailyCount === 1 ? "Daily" : "Dailys",
        text: "hast du gemeistert.",
        accent: "gold"
      },
      {
        id: "best-day",
        icon: "🏆",
        eyebrow: "Dein stärkster Tag",
        value: bestDay.points,
        decimals: 1,
        display: decimalFormat.format(bestDay.points),
        unit: "Punkte",
        text: bestDay.date
          ? `${formatDate(bestDay.date)} – dieser Tag darf ruhig glänzen.`
          : "Die erste Bestmarke wartet bereits auf ihren Auftritt.",
        accent: "orange"
      },
      {
        id: "streak",
        icon: "🔥",
        eyebrow: "Deine längste Serie",
        value: longestStreak,
        display: numberFormat.format(longestStreak),
        unit: longestStreak === 1 ? "Tag am Stück" : "Tage am Stück",
        text: "Viele einzelne Tage, die einander die Hand gereicht haben.",
        accent: "red"
      },
      {
        id: "thanks",
        icon: "❤️",
        eyebrow: `Für dich, ${player}`,
        title: "Danke, dass du Teil der Wurstrand Challenge bist.",
        text: "Wir freuen uns auf das nächste Jahr.",
        signature: "– Wursti & Bertha",
        accent: "heart"
      }
    ];
  }

  function ensureOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "wrc-year-review";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="wrc-year-review-shell" role="dialog" aria-modal="true" aria-labelledby="wrcYearReviewTitle">
        <div class="wrc-year-review-topbar">
          <div>
            <span class="wrc-year-review-gift">🎁</span>
            <span id="wrcYearReviewTitle">Dein WRC-Jahr</span>
          </div>
          <button class="wrc-year-review-close" type="button" aria-label="Jahresrückblick schließen">×</button>
        </div>

        <div class="wrc-year-review-progress" aria-hidden="true">
          <span></span>
        </div>

        <div class="wrc-year-review-stage"></div>

        <div class="wrc-year-review-footer">
          <button class="wrc-year-review-prev" type="button" aria-label="Vorherige Karte">←</button>
          <div class="wrc-year-review-count" aria-live="polite"></div>
          <button class="wrc-year-review-next" type="button">Weiter <span aria-hidden="true">→</span></button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector(".wrc-year-review-close").addEventListener("click", close);
    overlay.querySelector(".wrc-year-review-prev").addEventListener("click", previous);
    overlay.querySelector(".wrc-year-review-next").addEventListener("click", next);
    overlay.querySelector(".wrc-year-review-stage").addEventListener("click", event => {
      if (event.target.closest("button")) return;
      const rect = event.currentTarget.getBoundingClientRect();
      event.clientX < rect.left + rect.width * 0.35 ? previous() : next();
    });
    overlay.addEventListener("touchstart", event => {
      touchStartX = event.changedTouches[0]?.clientX ?? null;
    }, { passive: true });
    overlay.addEventListener("touchend", event => {
      if (touchStartX === null) return;
      const difference = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
      if (Math.abs(difference) > 45) difference < 0 ? next() : previous();
      touchStartX = null;
    }, { passive: true });
    document.addEventListener("keydown", event => {
      if (!overlay.classList.contains("is-visible")) return;
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "Escape") close();
    });

    return overlay;
  }

  function renderCard(card, index) {
    const article = document.createElement("article");
    article.className = `wrc-year-card accent-${card.accent}`;
    article.dataset.index = String(index);
    article.setAttribute("aria-hidden", "true");

    const valueMarkup = card.title
      ? `<h2>${card.title}</h2>`
      : `
        <div class="wrc-year-card-number" data-value="${card.value}" data-decimals="${card.decimals || 0}">0</div>
        <div class="wrc-year-card-unit">${card.unit}</div>
      `;

    article.innerHTML = `
      <div class="wrc-year-card-glow" aria-hidden="true"></div>
      <div class="wrc-year-card-icon" aria-hidden="true">${card.icon}</div>
      <div class="wrc-year-card-eyebrow">${card.eyebrow}</div>
      ${valueMarkup}
      <p>${card.text}</p>
      ${card.signature ? `<div class="wrc-year-card-signature">${card.signature}</div>` : ""}
    `;

    return article;
  }

  function animateNumber(element, card) {
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 0 : 850;
    const target = Number(card.value) || 0;
    const decimals = card.decimals || 0;
    const start = performance.now();

    const frame = now => {
      const progress = duration ? Math.min(1, (now - start) / duration) : 1;
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      element.textContent = decimals
        ? new Intl.NumberFormat("de-DE", {
          minimumFractionDigits: progress === 1 ? 0 : decimals,
          maximumFractionDigits: decimals
        }).format(value)
        : numberFormat.format(Math.round(value));

      if (progress < 1) requestAnimationFrame(frame);
      else element.textContent = card.display;
    };

    requestAnimationFrame(frame);
  }

  function showCard(index) {
    if (!overlay || !cards.length) return;
    activeIndex = Math.max(0, Math.min(index, cards.length - 1));
    const elements = [...overlay.querySelectorAll(".wrc-year-card")];

    elements.forEach((element, cardIndex) => {
      const active = cardIndex === activeIndex;
      element.classList.toggle("is-active", active);
      element.classList.toggle("is-before", cardIndex < activeIndex);
      element.setAttribute("aria-hidden", active ? "false" : "true");
    });

    const progress = ((activeIndex + 1) / cards.length) * 100;
    overlay.querySelector(".wrc-year-review-progress span").style.width = `${progress}%`;
    overlay.querySelector(".wrc-year-review-count").textContent =
      `${activeIndex + 1} / ${cards.length}`;
    overlay.querySelector(".wrc-year-review-prev").disabled = activeIndex === 0;
    const nextButton = overlay.querySelector(".wrc-year-review-next");
    nextButton.innerHTML = activeIndex === cards.length - 1
      ? `Zurück zur WRC <span aria-hidden="true">✓</span>`
      : `Weiter <span aria-hidden="true">→</span>`;

    animateNumber(
      elements[activeIndex]?.querySelector(".wrc-year-card-number"),
      cards[activeIndex]
    );
  }

  async function open(player = currentPlayer, year = currentYear, entries = sourceEntries) {
    const root = ensureOverlay();
    const yearEntries = getYearEntries(entries, year, player);
    const dailyCount = await countDailys(year, player);
    cards = buildCards(yearEntries, dailyCount, player, year);
    activeIndex = 0;

    const stage = root.querySelector(".wrc-year-review-stage");
    stage.replaceChildren(...cards.map(renderCard));
    root.querySelector("#wrcYearReviewTitle").textContent = `Dein WRC-Jahr ${year}`;
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("wrc-year-review-active");

    requestAnimationFrame(() => {
      root.classList.add("is-visible");
      showCard(0);
      root.querySelector(".wrc-year-review-close").focus();
    });
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove("is-visible");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("wrc-year-review-active");
  }

  function next() {
    if (activeIndex >= cards.length - 1) {
      close();
      return;
    }
    showCard(activeIndex + 1);
  }

  function previous() {
    if (activeIndex > 0) showCard(activeIndex - 1);
  }

  function showGiftLetter(player, year, entries, preview) {
    if (typeof WRCPost === "undefined") return false;

    const gift = {
      sender: "Wursti & Bertha",
      rarity: "legendär",
      text: [
        "Wir haben dein WRC-Jahr",
        "einmal für dich zusammengefasst."
      ]
    };

    const shown = WRCPost.show(gift, {
      heading: "Ein kleines Weihnachtsgeschenk",
      badge: "Jahrespost",
      signature: "– Wursti & Bertha 🌭🫘",
      actionLabel: "🎁 Rückblick öffnen",
      onAction: () => open(player, year, entries)
    });

    if (shown) markShown(year, player, preview);
    return shown;
  }

  function onEntriesLoaded(entries) {
    if (hasCheckedThisLoad || !Array.isArray(entries)) return;
    hasCheckedThisLoad = true;

    const now = new Date();
    const preview = ["localhost", "127.0.0.1"].includes(window.location.hostname)
      && new URLSearchParams(window.location.search).get("year-review") === "1";
    const player = selectedPlayer();
    const year = preview
      ? Number(new URLSearchParams(window.location.search).get("review-year")) || now.getFullYear()
      : now.getFullYear();

    scheduleDay(year, player);
    if (!shouldReveal(now, player, preview)) return;

    currentPlayer = player;
    currentYear = year;
    sourceEntries = entries;

    window.setTimeout(() => {
      if (!showGiftLetter(player, year, entries, preview)) {
        window.setTimeout(() => showGiftLetter(player, year, entries, preview), 3200);
      }
    }, preview ? 500 : 1700);
  }

  window.WRCYearReview = Object.freeze({
    buildCards,
    close,
    onEntriesLoaded,
    open,
    shouldReveal
  });
})();

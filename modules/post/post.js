(function () {
  const RANDOM_CHANCE = 0.025;
  const STREAK_MILESTONES = [7, 14, 30, 50, 100, 150, 200, 365];
  const EVENT_CHANCES = {
    achievement: 0.42,
    personal_record: 0.34,
    streak: 0.5,
    milestone: 0.46
  };
  const SIGNATURES = {
    Wursti: [
      "– Dein Wursti 🌭",
      "Sportliche Grüße\nWursti 🌭",
      "Mit breitem Grinsen\nWursti 🌭",
      "Bis zur nächsten Runde\nWursti 🌭",
      "Handschlag drauf\nWursti 🌭"
    ],
    Bertha: [
      "Liebe Grüße\nBertha 🫘",
      "Herzlich\nDeine Bertha 🫘",
      "Mit einem kleinen Augenzwinkern\nBertha 🫘",
      "Bis bald\nBertha 🫘",
      "Bohnige Grüße\nBertha 🫘"
    ]
  };

  let overlay = null;
  let activeLetter = null;
  let activeOptions = null;
  let lastFocus = null;
  let streakBaselineReady = false;
  let streakBaseline = {};

  function safeStorageGet(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      return;
    }
  }

  function normalizePlayer(player) {
    return String(player || "WRC-Team")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .toLowerCase() || "wrc-team";
  }

  function todayKey() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function currentPlayer() {
    const configuredPeople = typeof people !== "undefined" ? people : [];
    return safeStorageGet("wrcPostLastPlayer")
      || document.getElementById("person")?.value
      || configuredPeople[0]
      || "WRC-Team";
  }

  function rememberPlayer(player) {
    const value = String(player || "").trim();
    if (value) safeStorageSet("wrcPostLastPlayer", value);
  }

  function weightedPick(letters) {
    const weights = {
      "gewöhnlich": 72,
      "selten": 23,
      "legendär": 5
    };
    const total = letters.reduce((sum, letter) => sum + (weights[letter.rarity] || 1), 0);
    let draw = Math.random() * total;

    for (const letter of letters) {
      draw -= weights[letter.rarity] || 1;
      if (draw <= 0) return letter;
    }

    return letters[letters.length - 1];
  }

  function selectLetter(eventName, player) {
    const all = Array.isArray(window.WRC_POST_LETTERS) ? window.WRC_POST_LETTERS : [];
    const eligible = all.filter(letter => letter.events?.includes(eventName));
    if (!eligible.length) return null;

    const playerKey = normalizePlayer(player);
    const seenKey = `wrcPostSeen_${playerKey}`;
    let seen = [];

    try {
      seen = JSON.parse(safeStorageGet(seenKey, "[]"));
      if (!Array.isArray(seen)) seen = [];
    } catch {
      seen = [];
    }

    let fresh = eligible.filter(letter => !seen.includes(letter.id));
    if (!fresh.length) {
      const eligibleIds = new Set(eligible.map(letter => letter.id));
      seen = seen.filter(id => !eligibleIds.has(id));
      fresh = eligible;
    }

    const selected = weightedPick(fresh);
    if (!selected) return null;

    seen.push(selected.id);
    safeStorageSet(seenKey, JSON.stringify(seen.slice(-80)));
    return selected;
  }

  function signatureFor(sender) {
    const options = SIGNATURES[sender] || [`– ${sender}`];
    return options[Math.floor(Math.random() * options.length)];
  }

  function ensureMarkup() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "wrc-post-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="wrc-post-scene" role="dialog" aria-modal="true" aria-labelledby="wrcPostHeading">
        <div class="wrc-post-sparkles" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>

        <button class="wrc-post-envelope" type="button" aria-label="Brief öffnen">
          <span class="wrc-post-envelope-flap" aria-hidden="true"></span>
          <span class="wrc-post-envelope-front" aria-hidden="true"></span>
          <span class="wrc-post-seal" aria-hidden="true">WRC</span>
          <span class="wrc-post-envelope-title">📩 Post von Wursti &amp; Bertha</span>
          <span class="wrc-post-envelope-hint">Antippen zum Öffnen</span>
        </button>

        <article class="wrc-post-letter" aria-hidden="true">
          <button class="wrc-post-close" type="button" aria-label="Brief schließen">×</button>
          <div class="wrc-post-stamp" aria-hidden="true"></div>
          <div class="wrc-post-meta">
            <span id="wrcPostSender"></span>
            <span id="wrcPostRarity"></span>
          </div>
          <h2 id="wrcPostHeading">Ein kleiner Brief für dich</h2>
          <div id="wrcPostText" class="wrc-post-text"></div>
          <div id="wrcPostSignature" class="wrc-post-signature"></div>
          <button class="wrc-post-action" type="button" hidden></button>
          <div class="wrc-post-paper-mark" aria-hidden="true">WRC</div>
        </article>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector(".wrc-post-envelope").addEventListener("click", openLetter);
    overlay.querySelector(".wrc-post-close").addEventListener("click", close);
    overlay.querySelector(".wrc-post-action").addEventListener("click", () => {
      const action = activeOptions?.onAction;
      close();
      if (typeof action === "function") {
        window.setTimeout(action, 280);
      }
    });
    overlay.addEventListener("click", event => {
      if (event.target === overlay && overlay.classList.contains("is-opened")) close();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && overlay.classList.contains("is-visible")) close();
    });

    return overlay;
  }

  function show(letter, options = {}) {
    if (
      !letter
      || document.querySelector(".bigpop.show")
      || overlay?.classList.contains("is-visible")
    ) return false;

    const root = ensureMarkup();
    activeLetter = letter;
    activeOptions = options;
    lastFocus = document.activeElement;

    root.className = `wrc-post-overlay rarity-${letter.rarity}`;
    root.querySelector("#wrcPostSender").textContent = letter.sender === "Wursti"
      ? "🌭 Von Wursti"
      : letter.sender === "Bertha"
        ? "🫘 Von Bertha"
        : "📩 Von Wursti & Bertha";
    root.querySelector("#wrcPostRarity").textContent = options.badge || letter.rarity;
    root.querySelector("#wrcPostHeading").textContent = options.heading || "Ein kleiner Brief für dich";
    root.querySelector("#wrcPostText").replaceChildren(
      ...letter.text.map(line => {
        const paragraph = document.createElement("p");
        paragraph.textContent = line;
        return paragraph;
      })
    );
    root.querySelector("#wrcPostSignature").textContent =
      options.signature || signatureFor(letter.sender);
    const actionButton = root.querySelector(".wrc-post-action");
    actionButton.hidden = !options.actionLabel;
    actionButton.textContent = options.actionLabel || "";
    root.querySelector(".wrc-post-letter").setAttribute("aria-hidden", "true");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("wrc-post-active");

    requestAnimationFrame(() => {
      root.classList.add("is-visible");
      root.querySelector(".wrc-post-envelope").focus();
    });

    return true;
  }

  function openLetter() {
    if (!overlay || !activeLetter || overlay.classList.contains("is-opened")) return;
    overlay.classList.add("is-opening");

    window.setTimeout(() => {
      overlay.classList.add("is-opened");
      overlay.classList.remove("is-opening");
      const letter = overlay.querySelector(".wrc-post-letter");
      letter.setAttribute("aria-hidden", "false");
      overlay.querySelector(".wrc-post-close").focus();
    }, 520);
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove("is-visible", "is-opened", "is-opening");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("wrc-post-active");
    activeLetter = null;
    activeOptions = null;

    window.setTimeout(() => {
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }, 220);
  }

  function maybeRandomOnOpen() {
    const player = currentPlayer();
    const playerKey = normalizePlayer(player);
    const dailyKey = `wrcPostRandom_${todayKey()}_${playerKey}`;
    if (safeStorageGet(dailyKey)) return false;

    safeStorageSet(dailyKey, "checked");
    if (Math.random() >= RANDOM_CHANCE) return false;

    const letter = selectLetter("random", player);
    return show(letter);
  }

  function maybeFromEvent(eventName, options = {}) {
    const chance = options.chance ?? EVENT_CHANCES[eventName] ?? 0.35;
    const player = options.player || currentPlayer();
    const eventId = options.eventId || `${eventName}_${todayKey()}`;
    const eventKey = `wrcPostEvent_${normalizePlayer(player)}_${eventId}`;

    if (safeStorageGet(eventKey)) return false;
    safeStorageSet(eventKey, "checked");
    if (Math.random() >= chance) return false;

    const letter = selectLetter(eventName, player);
    if (!letter) return false;

    window.setTimeout(() => {
      if (!show(letter)) {
        window.setTimeout(() => show(letter), 2400);
      }
    }, options.delay ?? 4200);

    return true;
  }

  function consecutiveDays(entries, player) {
    const dates = [...new Set(
      entries
        .filter(entry => entry.person === player)
        .map(entry => entry.date)
        .filter(Boolean)
    )].sort().reverse();

    if (!dates.length) return 0;
    let streak = 1;
    let cursor = new Date(`${dates[0]}T12:00:00`);

    for (let index = 1; index < dates.length; index += 1) {
      const expected = new Date(cursor);
      expected.setDate(expected.getDate() - 1);
      const expectedKey = expected.toISOString().slice(0, 10);
      if (dates[index] !== expectedKey) break;
      streak += 1;
      cursor = expected;
    }

    return streak;
  }

  function syncStreakMilestones(entries) {
    const configuredPeople = typeof people !== "undefined" ? people : [];
    if (!Array.isArray(entries) || !Array.isArray(configuredPeople)) return;
    const latest = {};

    configuredPeople.forEach(player => {
      latest[player] = consecutiveDays(entries, player);
    });

    if (!streakBaselineReady) {
      streakBaseline = latest;
      streakBaselineReady = true;
      return;
    }

    configuredPeople.forEach(player => {
      const before = streakBaseline[player] || 0;
      const now = latest[player] || 0;
      const reached = STREAK_MILESTONES.find(value => before < value && now >= value);
      if (reached) {
        maybeFromEvent("streak", {
          player,
          eventId: `streak_${reached}_${todayKey()}`,
          delay: 5600
        });
      }
    });

    streakBaseline = latest;
  }

  function preview(id) {
    const all = Array.isArray(window.WRC_POST_LETTERS) ? window.WRC_POST_LETTERS : [];
    const letter = id ? all.find(item => item.id === id) : all[0];
    return show(letter);
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureMarkup();

    const personSelect = document.getElementById("person");
    const remembered = safeStorageGet("wrcPostLastPlayer");
    if (personSelect && remembered && [...personSelect.options].some(option => option.value === remembered)) {
      personSelect.value = remembered;
    }

    personSelect?.addEventListener("change", () => rememberPlayer(personSelect.value));
    const previewId = new URLSearchParams(window.location.search).get("preview-post");
    const localPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (previewId && localPreview) {
      window.setTimeout(() => preview(previewId), 500);
    } else {
      window.setTimeout(maybeRandomOnOpen, 2200);
    }
  });

  window.WRCPost = Object.freeze({
    close,
    maybeFromEvent,
    maybeRandomOnOpen,
    preview,
    rememberPlayer,
    show,
    syncStreakMilestones
  });
})();

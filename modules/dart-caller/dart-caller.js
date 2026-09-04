(() => {
  const mount = document.getElementById("dartCallerMount");
  const openButton = document.getElementById("openDartCaller");
  const selection = document.getElementById("dartModeSelection");
  const resultCapture = document.getElementById("dartResultCapture");
  if (!mount || !openButton || !selection || !resultCapture) return;

  const GAME_STORAGE_KEY = "wrc-dart-caller-game-v1";

  const availablePlayers = typeof people !== "undefined" && Array.isArray(people)
    ? people.slice(0, 4)
    : ["Thorsten", "Basti", "Marian", "Fabi"];
  let state = freshState();
  let turnTimer = null;
  let inputFeedbackTimer = null;
  let toastTimer = null;
  let wakeLock = null;
  let saveGeneration = 0;
  let savedGame = readSavedGame();

  function freshState() {
    return {
      screen: "setup",
      mode: 501,
      selectedPlayers: [],
      players: [],
      currentPlayer: 0,
      turnStartScore: 0,
      turnNumber: 1,
      darts: [],
      throwLog: [],
      turnBusted: false,
      multiplier: 1,
      lastInput: null,
      transition: null,
      toast: "",
      undoStack: [],
      winner: null,
      finishOrder: [],
      completed: false,
      saving: false,
      saved: false,
      savedGameId: null,
      saveError: ""
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatSavedAt(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Laufender Spielstand";
    return `Gesichert ${date.toLocaleDateString("de-DE")} · ${date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;
  }

  function readSavedGame() {
    try {
      const saved = JSON.parse(localStorage.getItem(GAME_STORAGE_KEY));
      if (!saved || saved.version !== 1 || !saved.state || ![301, 501].includes(saved.state.mode)) return null;
      if (!Array.isArray(saved.state.players) || !saved.state.players.length || saved.state.players.length > 4) return null;
      if (saved.state.players.some(player => !availablePlayers.includes(player.name))) return null;
      return saved;
    } catch (error) {
      console.warn("WRC Caller: Spielstand konnte nicht gelesen werden.", error);
      return null;
    }
  }

  function persistGame() {
    if (state.screen !== "game" || state.completed || !state.players.length) return;
    try {
      const persistedState = {
        ...state,
        players: state.players.map(player => ({ ...player })),
        darts: state.darts.map(dart => ({ ...dart })),
        throwLog: (state.throwLog || []).map(dart => ({ ...dart })),
        undoStack: state.undoStack.map(item => ({
          ...item,
          players: item.players.map(player => ({ ...player })),
          darts: item.darts.map(dart => ({ ...dart })),
          throwLog: (item.throwLog || []).map(dart => ({ ...dart })),
          winner: item.winner ? { ...item.winner } : null,
          finishOrder: (item.finishOrder || []).slice()
        })),
        lastInput: null,
        transition: null,
        toast: "",
        saving: false,
        saved: false,
        saveError: ""
      };
      savedGame = { version: 1, savedAt: new Date().toISOString(), state: persistedState };
      localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(savedGame));
    } catch (error) {
      console.warn("WRC Caller: Spielstand konnte nicht gesichert werden.", error);
    }
  }

  function clearSavedGame() {
    savedGame = null;
    try {
      localStorage.removeItem(GAME_STORAGE_KEY);
    } catch (error) {
      console.warn("WRC Caller: Spielstand konnte nicht entfernt werden.", error);
    }
  }

  function restoreSavedGame() {
    if (!savedGame) return;
    state = {
      ...freshState(),
      ...savedGame.state,
      screen: "game",
      players: savedGame.state.players.map(player => ({ highestTurn: 0, ...player })),
      darts: (savedGame.state.darts || []).map(dart => ({ ...dart })),
      throwLog: (savedGame.state.throwLog || []).map(dart => ({ ...dart })),
      undoStack: (savedGame.state.undoStack || []).map(item => ({
        ...item,
        players: item.players.map(player => ({ highestTurn: 0, ...player })),
        darts: item.darts.map(dart => ({ ...dart })),
        throwLog: (item.throwLog || []).map(dart => ({ ...dart })),
        winner: item.winner ? { ...item.winner } : null,
        finishOrder: (item.finishOrder || []).slice()
      })),
      transition: null,
      toast: "",
      lastInput: null
    };
    render();
    requestWakeLock();
    if (state.darts.length >= 3 || state.turnBusted) scheduleNextTurn(900);
  }

  function discardSavedGame() {
    clearSavedGame();
    render();
  }

  async function requestWakeLock() {
    if (!("wakeLock" in navigator) || wakeLock || state.screen !== "game" || state.completed || document.visibilityState !== "visible") return;
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => { wakeLock = null; }, { once: true });
    } catch (error) {
      console.info("WRC Caller: Bildschirm-Wachhalten ist auf diesem Gerät nicht verfügbar.", error);
    }
  }

  async function releaseWakeLock() {
    if (!wakeLock) return;
    try {
      await wakeLock.release();
    } catch (error) {
      console.info("WRC Caller: Wake Lock war bereits beendet.", error);
    } finally {
      wakeLock = null;
    }
  }

  function setupMarkup() {
    return `
      <div class="overlay dart-caller-shell">
        <button type="button" class="dart-back-to-selection" data-caller-back>← Zur Dart-Auswahl</button>
        <div class="badge">Game Lounge</div>
        <header class="dart-caller-header">
          <span class="dart-caller-target" aria-hidden="true">🎯</span>
          <div><h2>WRC Caller</h2><p class="sub">Das Board hängt. Die WRC zählt.</p></div>
        </header>

        ${savedGame ? `
          <section class="dart-caller-resume">
            <div>
              <span>Gespeichertes Spiel</span>
              <strong>${savedGame.state.mode} · ${savedGame.state.players.map(player => escapeHtml(player.name)).join(" · ")}</strong>
              <small>${formatSavedAt(savedGame.savedAt)}</small>
            </div>
            <div class="dart-caller-resume-actions">
              <button type="button" data-resume-game>Spiel fortsetzen</button>
              <button type="button" data-discard-game>Verwerfen</button>
            </div>
          </section>` : ""}

        <section class="dart-caller-card">
          <h3>1. Spiel wählen</h3>
          <div class="dart-caller-mode-grid">
            ${[301, 501].map(mode => `
              <button type="button" class="dart-caller-mode ${state.mode === mode ? "selected" : ""}" data-caller-mode="${mode}">
                <strong>${mode}</strong><small>Einfach losspielen</small>
              </button>
            `).join("")}
          </div>
        </section>

        <section class="dart-caller-card">
          <h3>2. Spieler wählen <span class="dart-caller-count">${state.selectedPlayers.length}/4</span></h3>
          <div class="dart-caller-player-grid">
            ${availablePlayers.map(name => `
              <button type="button" class="dart-caller-player ${state.selectedPlayers.includes(name) ? "selected" : ""}" data-caller-player="${escapeHtml(name)}">
                <span>${escapeHtml(name)}</span><span class="dart-caller-check" aria-hidden="true">✓</span>
              </button>
            `).join("")}
          </div>
        </section>

        <button type="button" class="dart-caller-secondary dart-caller-stats-link" data-caller-stats>📊 Dart-Statistiken ansehen</button>
        <button type="button" class="dart-caller-primary" data-start-game ${state.selectedPlayers.length ? "" : "disabled"}>Spiel starten</button>
      </div>`;
  }

  function gameMarkup() {
    const active = state.players[state.currentPlayer];
    const turnTotal = state.darts.reduce((sum, dart) => sum + dart.score, 0);
    const checkout = checkoutSuggestion(active?.score, Math.max(0, 3 - state.darts.length));
    return `
      <div class="overlay dart-caller-shell">
        <div class="dart-caller-gamebar">
          <button type="button" class="dart-back-to-selection" data-caller-setup>← Neues Spiel</button>
          <span class="dart-caller-game-mode">${state.mode} · Straight Out</span>
        </div>

        ${state.toast ? `<div class="dart-caller-toast" role="status">✓ ${escapeHtml(state.toast)}</div>` : ""}
        ${state.completed ? winnerMarkup() : `
          <section class="dart-caller-scoreboard" aria-label="Spielstand">
            ${state.players.map((player, index) => `
              <article class="dart-caller-score ${index === state.currentPlayer ? "active" : ""} ${player.finished ? "finished" : ""}">
                <span>${escapeHtml(player.name)}</span><strong>${player.score}</strong>
                <small>${player.finished ? `${player.place}. Platz` : `Ø ${formatAverage(playerAverage(player, index))}`}</small>
              </article>
            `).join("")}
          </section>

          ${state.transition ? transitionMarkup() : `<section class="dart-caller-turn">
            <div><span class="dart-caller-eyebrow">Am Board</span><h2>${escapeHtml(active.name)}</h2></div>
            <div class="dart-caller-turn-total"><span>Aufnahme</span><strong>${turnTotal}</strong></div>
          </section>

          <div class="dart-caller-darts" aria-label="Geworfene Darts">
            ${[0, 1, 2].map(index => {
              const dart = state.darts[index];
              return `<div class="dart-caller-dart ${dart ? "filled" : ""}"><span>Dart ${index + 1}</span><strong>${dart ? escapeHtml(dart.label) : "–"}</strong></div>`;
            }).join("")}
          </div>

          ${checkout ? `<div class="dart-caller-checkout"><span>🎯 Straight-Out-Weg</span><strong>${escapeHtml(checkout)}</strong></div>` : ""}

          <section class="dart-caller-input">
            <div class="dart-caller-multipliers" aria-label="Multiplikator">
              ${[{ value: 1, label: "Single" }, { value: 2, label: "Double" }, { value: 3, label: "Triple" }].map(item => `
                <button type="button" class="${state.multiplier === item.value ? "selected" : ""}" data-multiplier="${item.value}">${item.label}</button>
              `).join("")}
            </div>
            <div class="dart-caller-numbers">
              ${Array.from({ length: 20 }, (_, index) => index + 1).map(number => `<button type="button" class="${inputFeedbackClass(number)}" data-score="${number}">${number}</button>`).join("")}
              <button type="button" class="dart-caller-miss ${inputFeedbackClass(0)}" data-score="0">Miss</button>
              <button type="button" class="dart-caller-bull ${inputFeedbackClass(25, 1)}" data-bull="25">25</button>
              <button type="button" class="dart-caller-bullseye ${inputFeedbackClass(25, 2)}" data-bull="50">Bull</button>
            </div>
          </section>

          <div class="dart-caller-actions">
            <button type="button" data-undo ${state.undoStack.length ? "" : "disabled"}>↶ Letzten Dart zurück</button>
            <button type="button" data-end-turn>Aufnahme beenden →</button>
          </div>`}`}
      </div>`;
  }

  function transitionMarkup() {
    const transition = state.transition;
    if (transition.type === "bust") {
      return `<section class="dart-caller-transition bust" role="status">
        <span>Zu viel</span><strong>Bust</strong><p>Zurück auf ${transition.returnScore}</p>
      </section>`;
    }
    if (transition.type === "player") {
      return `<section class="dart-caller-transition player" role="status">
        <span>Als Nächstes</span><strong>${escapeHtml(transition.player)}</strong><p>ist am Board</p>
      </section>`;
    }
    return `<section class="dart-caller-transition turn" role="status">
      <span>${escapeHtml(transition.player)} · Aufnahme</span><strong>${transition.total}</strong>
      <p>Weiter mit ${escapeHtml(transition.nextPlayer)}</p>
    </section>`;
  }

  function winnerMarkup() {
    const ranking = state.players.slice().sort((a, b) => a.place - b.place);
    const awards = gameAwards();
    return `
      <section class="dart-caller-winner">
        <span aria-hidden="true">🏆</span><p>WRC Caller meldet</p>
        <h2>${escapeHtml(state.winner.name)} gewinnt!</h2>
        <strong>${state.mode} · Spiel beendet</strong>
        <div class="dart-caller-ranking">
          ${ranking.map(player => `
            <div><span>${placeMedal(player.place)} ${escapeHtml(player.name)}</span><strong>Ø ${formatAverage(finalAverage(player))}</strong></div>
          `).join("")}
        </div>
        <div class="dart-caller-awards" aria-label="Spielauszeichnungen">
          ${awards.map(award => `<article><span>${award.icon} ${award.label}</span><strong>${escapeHtml(award.value)}</strong><small>${escapeHtml(award.detail)}</small></article>`).join("")}
        </div>
        <div class="dart-caller-save-state ${state.saveError ? "error" : ""}">
          ${state.saving ? "Spiel wird gespeichert …" : state.saved ? "✓ Ergebnis gespeichert und Statistiken aktualisiert" : state.saveError || ""}
        </div>
        ${state.saveError ? `<button type="button" class="dart-caller-secondary" data-retry-save>Erneut speichern</button>` : ""}
        <button type="button" class="dart-caller-secondary" data-undo ${state.undoStack.length ? "" : "disabled"}>↶ Letzten Dart zurück</button>
        <button type="button" class="dart-caller-primary" data-rematch>Noch eine Runde</button>
      </section>`;
  }

  function placeMedal(place) {
    return place === 1 ? "🥇" : place === 2 ? "🥈" : place === 3 ? "🥉" : "4️⃣";
  }

  function formatAverage(value) {
    return Number(value || 0).toLocaleString("de-DE", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  }

  function gameAwards() {
    const bestAverage = state.players.reduce((best, player) => finalAverage(player) > finalAverage(best) ? player : best, state.players[0]);
    const highestTurn = state.players.reduce((best, player) => player.highestTurn > best.highestTurn ? player : best, state.players[0]);
    return [
      { icon: "📈", label: "Bester Average", value: formatAverage(finalAverage(bestAverage)), detail: bestAverage.name },
      { icon: "🔥", label: "Höchste Aufnahme", value: String(highestTurn.highestTurn || 0), detail: highestTurn.name },
      { icon: "🎯", label: "Sieg in", value: `${state.winner.dartsThrown} Darts`, detail: state.winner.name }
    ];
  }

  function checkoutSuggestion(remaining, dartsLeft) {
    const target = Number(remaining);
    if (!Number.isFinite(target) || target <= 0 || dartsLeft <= 0 || target > dartsLeft * 60) return "";
    const throws = [
      ...Array.from({ length: 20 }, (_, index) => ({ score: (20 - index) * 3, label: `T${20 - index}`, rank: 3 })),
      { score: 50, label: "Bull", rank: 4 },
      ...Array.from({ length: 20 }, (_, index) => ({ score: (20 - index) * 2, label: `D${20 - index}`, rank: 2 })),
      { score: 25, label: "25", rank: 2 },
      ...Array.from({ length: 20 }, (_, index) => ({ score: 20 - index, label: String(20 - index), rank: 1 }))
    ].sort((a, b) => b.score - a.score || a.rank - b.rank);

    const memo = new Map();
    function findRoute(rest, darts) {
      if (rest === 0) return [];
      if (!darts || rest < 0 || rest > darts * 60) return null;
      const key = `${rest}:${darts}`;
      if (memo.has(key)) return memo.get(key);
      for (const dart of throws) {
        if (dart.score > rest) continue;
        const tail = findRoute(rest - dart.score, darts - 1);
        if (tail) {
          const found = [dart.label, ...tail];
          memo.set(key, found);
          return found;
        }
      }
      memo.set(key, null);
      return null;
    }

    for (let darts = 1; darts <= dartsLeft; darts += 1) {
      const route = findRoute(target, darts);
      if (route) return route.join(" · ");
    }
    return "";
  }

  function inputFeedbackClass(base, multiplier) {
    if (!state.lastInput || state.lastInput.base !== base) return "";
    if (multiplier !== undefined && state.lastInput.multiplier !== multiplier) return "";
    return `dart-caller-hit dart-caller-hit-${state.lastInput.multiplier}`;
  }

  function showInputFeedback(base, multiplier) {
    state.lastInput = { base, multiplier };
    window.clearTimeout(inputFeedbackTimer);
    inputFeedbackTimer = window.setTimeout(() => {
      state.lastInput = null;
      mount.querySelectorAll(".dart-caller-hit").forEach(button => {
        button.classList.remove("dart-caller-hit", "dart-caller-hit-1", "dart-caller-hit-2", "dart-caller-hit-3");
      });
    }, 650);
  }

  function playerAverage(player, index) {
    const liveTurn = index === state.currentPlayer && !state.turnBusted && !state.transition
      ? state.darts.reduce((sum, dart) => sum + dart.score, 0)
      : 0;
    const darts = player.dartsThrown;
    return darts > 0
      ? ((player.scoredPoints + liveTurn) / darts) * 3
      : 0;
  }

  function finalAverage(player) {
    return player.dartsThrown > 0 ? (player.scoredPoints / player.dartsThrown) * 3 : 0;
  }

  function render() {
    mount.innerHTML = state.screen === "setup" ? setupMarkup() : gameMarkup();
    bindEvents();
  }

  function bindEvents() {
    mount.querySelector("[data-caller-back]")?.addEventListener("click", openDartSelection);
    mount.querySelector("[data-caller-setup]")?.addEventListener("click", confirmNewGame);
    mount.querySelector("[data-resume-game]")?.addEventListener("click", restoreSavedGame);
    mount.querySelector("[data-discard-game]")?.addEventListener("click", discardSavedGame);
    mount.querySelectorAll("[data-caller-mode]").forEach(button => button.addEventListener("click", () => {
      state.mode = Number(button.dataset.callerMode);
      render();
    }));
    mount.querySelectorAll("[data-caller-player]").forEach(button => button.addEventListener("click", () => {
      const name = button.dataset.callerPlayer;
      state.selectedPlayers = state.selectedPlayers.includes(name)
        ? state.selectedPlayers.filter(player => player !== name)
        : [...state.selectedPlayers, name].slice(0, 4);
      render();
    }));
    mount.querySelector("[data-start-game]")?.addEventListener("click", startGame);
    mount.querySelector("[data-caller-stats]")?.addEventListener("click", () => window.WRCOpenSharedDartStatistics?.());
    mount.querySelector("[data-rematch]")?.addEventListener("click", startGame);
    mount.querySelector("[data-retry-save]")?.addEventListener("click", saveCompletedGame);
    mount.querySelectorAll("[data-multiplier]").forEach(button => button.addEventListener("click", () => {
      state.multiplier = Number(button.dataset.multiplier);
      render();
    }));
    mount.querySelectorAll("[data-score]").forEach(button => button.addEventListener("click", () => addDart(Number(button.dataset.score), state.multiplier)));
    mount.querySelectorAll("[data-bull]").forEach(button => button.addEventListener("click", () => {
      const score = Number(button.dataset.bull);
      addDart(25, score === 50 ? 2 : 1, score === 50 ? "Bull" : "25");
    }));
    mount.querySelector("[data-undo]")?.addEventListener("click", undoLastDart);
    mount.querySelector("[data-end-turn]")?.addEventListener("click", finishTurn);
  }

  function startGame() {
    if (!state.selectedPlayers.length) return;
    state.players = state.selectedPlayers.map(name => ({
      name,
      score: state.mode,
      dartsThrown: 0,
      scoredPoints: 0,
      highestTurn: 0,
      finished: false,
      place: 0
    }));
    state.currentPlayer = 0;
    state.turnStartScore = state.mode;
    state.turnNumber = 1;
    state.darts = [];
    state.throwLog = [];
    state.turnBusted = false;
    state.multiplier = 1;
    state.undoStack = [];
    state.winner = null;
    state.finishOrder = [];
    state.completed = false;
    state.saving = false;
    state.saved = false;
    state.savedGameId = null;
    state.saveError = "";
    state.screen = "game";
    clearSavedGame();
    persistGame();
    render();
    requestWakeLock();
  }

  function addDart(base, multiplier, customLabel) {
    if (state.completed || state.darts.length >= 3) return;
    showInputFeedback(base, multiplier);
    const player = state.players[state.currentPlayer];
    const score = base * multiplier;
    const remaining = player.score - score;
    const label = customLabel || (base === 0 ? "Miss" : `${multiplier === 3 ? "T" : multiplier === 2 ? "D" : ""}${base}`);

    state.undoStack.push(snapshot(label));
    state.darts.push({ base, multiplier, score, label });
    state.throwLog.push({
      player: player.name,
      turnNumber: state.turnNumber,
      dartPosition: state.darts.length,
      baseValue: base,
      multiplier,
      scoredValue: score,
      isMiss: base === 0,
      isBust: false
    });
    player.dartsThrown += 1;

    if (remaining < 0) {
      player.score = state.turnStartScore;
      state.turnBusted = true;
      state.darts[state.darts.length - 1].label = `${label} · Bust`;
      state.throwLog[state.throwLog.length - 1].isBust = true;
      state.transition = { type: "bust", returnScore: state.turnStartScore };
      render();
      window.WRCDartCallerAudio?.playSpecial("bust");
      scheduleAdvanceTurn(1450);
      return;
    }

    player.score = remaining;
    state.multiplier = 1;
    if (remaining === 0) {
      const winningTurn = state.darts.reduce((sum, dart) => sum + dart.score, 0);
      player.scoredPoints += winningTurn;
      player.highestTurn = Math.max(player.highestTurn, winningTurn);
      player.finished = true;
      player.place = state.finishOrder.length + 1;
      state.finishOrder.push(player.name);
      if (!state.winner) state.winner = { ...player };

      const unfinished = state.players.filter(candidate => !candidate.finished);
      if (unfinished.length <= 1) {
        if (unfinished.length === 1) {
          unfinished[0].place = state.finishOrder.length + 1;
          state.finishOrder.push(unfinished[0].name);
        }
        completeGame();
      } else {
        render();
        scheduleNextTurn(650);
      }
      return;
    }
    persistGame();
    render();
    if (state.darts.length === 3) scheduleNextTurn(420);
  }

  function scheduleNextTurn(delay) {
    window.clearTimeout(turnTimer);
    turnTimer = window.setTimeout(finishTurn, delay);
  }

  function scheduleAdvanceTurn(delay) {
    window.clearTimeout(turnTimer);
    turnTimer = window.setTimeout(advanceTurn, delay);
  }

  function finishTurn() {
    if (state.completed || !state.players.length) return;
    window.clearTimeout(turnTimer);
    turnTimer = null;
    const turnTotal = state.darts.reduce((sum, dart) => sum + dart.score, 0);
    const activePlayer = state.players[state.currentPlayer];
    if (!state.turnBusted && state.darts.length && !activePlayer.finished) {
      state.players[state.currentPlayer].scoredPoints += turnTotal;
      state.players[state.currentPlayer].highestTurn = Math.max(activePlayer.highestTurn, turnTotal);
    }
    if (!state.turnBusted && state.darts.length === 3 && !activePlayer.finished) {
      window.WRCDartCallerAudio?.playTurnScore(turnTotal);
    }
    const nextPlayerIndex = nextActivePlayerIndex();
    state.transition = {
      type: "turn",
      player: activePlayer.name,
      total: turnTotal,
      nextPlayer: state.players[nextPlayerIndex].name
    };
    render();
    scheduleAdvanceTurn(1650);
  }

  function advanceTurn() {
    if (state.completed || !state.players.length) return;
    window.clearTimeout(turnTimer);
    turnTimer = null;
    state.currentPlayer = nextActivePlayerIndex();
    state.turnNumber += 1;
    state.turnStartScore = state.players[state.currentPlayer].score;
    state.darts = [];
    state.turnBusted = false;
    state.multiplier = 1;
    state.lastInput = null;
    state.transition = { type: "player", player: state.players[state.currentPlayer].name };
    persistGame();
    render();
    turnTimer = window.setTimeout(() => {
      turnTimer = null;
      state.transition = null;
      render();
    }, 850);
  }

  function nextActivePlayerIndex() {
    for (let offset = 1; offset <= state.players.length; offset += 1) {
      const index = (state.currentPlayer + offset) % state.players.length;
      if (!state.players[index].finished) return index;
    }
    return state.currentPlayer;
  }

  function completeGame() {
    window.clearTimeout(turnTimer);
    turnTimer = null;
    state.completed = true;
    state.darts = [];
    state.lastInput = null;
    state.transition = null;
    clearSavedGame();
    releaseWakeLock();
    render();
    window.WRCDartCallerAudio?.playSpecial("winner");
    saveCompletedGame();
  }

  async function saveCompletedGame() {
    if (!state.completed || state.saving || state.saved) return;
    if (typeof supabaseClient === "undefined") {
      state.saveError = "Speichern derzeit nicht möglich.";
      render();
      return;
    }

    const generation = ++saveGeneration;
    state.saving = true;
    state.saveError = "";
    render();

    const gameDate = new Date().toISOString().split("T")[0];
    const { data: game, error: gameError } = await supabaseClient
      .from("dart_games")
      .insert({ game_date: gameDate, mode: `WRC Caller ${state.mode}` })
      .select()
      .single();

    if (gameError) {
      if (generation !== saveGeneration) return;
      state.saving = false;
      state.saveError = "Das Ergebnis konnte nicht gespeichert werden.";
      console.error("WRC CALLER GAME SAVE ERROR:", gameError);
      render();
      return;
    }

    if (generation !== saveGeneration) {
      await supabaseClient.from("dart_games").delete().eq("id", game.id);
      return;
    }

    const resultRows = state.players.map(player => ({
      game_id: game.id,
      player: player.name,
      place: player.place
    }));
    const { error: resultsError } = await supabaseClient.from("dart_results").insert(resultRows);

    if (resultsError) {
      await supabaseClient.from("dart_games").delete().eq("id", game.id);
      if (generation !== saveGeneration) return;
      state.saving = false;
      state.saveError = "Das Ergebnis konnte nicht vollständig gespeichert werden.";
      console.error("WRC CALLER RESULT SAVE ERROR:", resultsError);
      render();
      return;
    }

    const throwRows = (state.throwLog || []).map(dart => ({
      game_id: game.id,
      player: dart.player,
      turn_number: dart.turnNumber,
      dart_position: dart.dartPosition,
      base_value: dart.baseValue,
      multiplier: dart.multiplier,
      scored_value: dart.scoredValue,
      is_miss: dart.isMiss,
      is_bust: dart.isBust
    }));
    const { error: throwsError } = throwRows.length
      ? await supabaseClient.from("dart_throws").insert(throwRows)
      : { error: null };

    if (throwsError) {
      await supabaseClient.from("dart_results").delete().eq("game_id", game.id);
      await supabaseClient.from("dart_games").delete().eq("id", game.id);
      if (generation !== saveGeneration) return;
      state.saving = false;
      state.saveError = "Das Wurfprotokoll konnte nicht gespeichert werden.";
      console.error("WRC CALLER THROW SAVE ERROR:", throwsError);
      render();
      return;
    }

    if (generation !== saveGeneration) {
      await supabaseClient.from("dart_games").delete().eq("id", game.id);
      return;
    }

    state.saving = false;
    state.saved = true;
    state.savedGameId = game.id;
    render();
    if (typeof window.WRCRefreshDartHistory === "function") await window.WRCRefreshDartHistory();
    if (typeof window.loadDartStatistics === "function") window.loadDartStatistics();
    window.dispatchEvent(new CustomEvent("wrc:dart-game-saved", { detail: { mode: state.mode } }));
  }

  function snapshot(removedLabel) {
    return {
      players: state.players.map(player => ({ ...player })),
      darts: state.darts.map(dart => ({ ...dart })),
      throwLog: (state.throwLog || []).map(dart => ({ ...dart })),
      currentPlayer: state.currentPlayer,
      turnStartScore: state.turnStartScore,
      turnNumber: state.turnNumber,
      turnBusted: state.turnBusted,
      multiplier: state.multiplier,
      winner: state.winner ? { ...state.winner } : null,
      finishOrder: state.finishOrder.slice(),
      removedLabel
    };
  }

  async function undoLastDart() {
    window.clearTimeout(turnTimer);
    turnTimer = null;
    window.WRCDartCallerAudio?.stop();
    const previous = state.undoStack.pop();
    if (!previous) return;
    const savedGameId = state.savedGameId;
    saveGeneration += 1;
    state.players = previous.players;
    state.darts = previous.darts;
    state.throwLog = previous.throwLog || [];
    state.currentPlayer = previous.currentPlayer ?? state.currentPlayer;
    state.turnStartScore = previous.turnStartScore ?? previous.players[state.currentPlayer]?.score ?? state.mode;
    state.turnNumber = previous.turnNumber ?? state.turnNumber;
    state.turnBusted = previous.turnBusted;
    state.multiplier = previous.multiplier;
    state.winner = previous.winner;
    state.finishOrder = previous.finishOrder;
    state.completed = false;
    state.saving = false;
    state.saved = false;
    state.savedGameId = null;
    state.saveError = "";
    state.transition = null;
    state.lastInput = null;
    state.toast = `${previous.removedLabel || "Letzter Dart"} zurückgenommen`;
    persistGame();
    render();
    requestWakeLock();
    if (savedGameId && typeof supabaseClient !== "undefined") {
      const { error } = await supabaseClient.from("dart_games").delete().eq("id", savedGameId);
      if (error) {
        console.error("WRC CALLER UNDO SAVE ROLLBACK ERROR:", error);
        state.toast = "Dart korrigiert · gespeichertes Ergebnis bitte prüfen";
        render();
      } else {
        if (typeof window.WRCRefreshDartHistory === "function") await window.WRCRefreshDartHistory();
        if (typeof window.loadDartStatistics === "function") window.loadDartStatistics();
      }
    }
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      state.toast = "";
      mount.querySelector(".dart-caller-toast")?.remove();
    }, 1400);
  }

  function showSetup() {
    window.clearTimeout(turnTimer);
    turnTimer = null;
    window.clearTimeout(inputFeedbackTimer);
    window.clearTimeout(toastTimer);
    window.WRCDartCallerAudio?.stop();
    releaseWakeLock();
    const selectedPlayers = state.selectedPlayers.slice();
    const mode = state.mode;
    state = freshState();
    state.selectedPlayers = selectedPlayers;
    state.mode = mode;
    savedGame = readSavedGame();
    render();
  }

  function confirmNewGame() {
    const untouched = state.players.every(player => player.score === state.mode);
    if (state.completed || untouched || window.confirm("Laufendes Spiel beenden und zur Auswahl zurückkehren?")) {
      clearSavedGame();
      showSetup();
    }
  }

  function openDartSelection() {
    showSetup();
    if (typeof window.WRCOpenDartSelection === "function") window.WRCOpenDartSelection();
  }

  openButton.addEventListener("click", () => {
    selection.hidden = true;
    resultCapture.hidden = true;
    mount.hidden = false;
    render();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") requestWakeLock();
  });
  render();
})();

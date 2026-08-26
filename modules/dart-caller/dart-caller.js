(() => {
  const mount = document.getElementById("dartCallerMount");
  const openButton = document.getElementById("openDartCaller");
  const selection = document.getElementById("dartModeSelection");
  const resultCapture = document.getElementById("dartResultCapture");
  if (!mount || !openButton || !selection || !resultCapture) return;

  const availablePlayers = typeof people !== "undefined" && Array.isArray(people)
    ? people.slice(0, 4)
    : ["Thorsten", "Basti", "Marian", "Fabi"];
  let state = freshState();
  let turnTimer = null;

  function freshState() {
    return {
      screen: "setup",
      mode: 501,
      selectedPlayers: [],
      players: [],
      currentPlayer: 0,
      turnStartScore: 0,
      darts: [],
      turnBusted: false,
      multiplier: 1,
      undoStack: [],
      winner: null,
      finishOrder: [],
      completed: false,
      saving: false,
      saved: false,
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

  function setupMarkup() {
    return `
      <div class="overlay dart-caller-shell">
        <button type="button" class="dart-back-to-selection" data-caller-back>← Zur Dart-Auswahl</button>
        <div class="badge">Game Lounge</div>
        <header class="dart-caller-header">
          <span class="dart-caller-target" aria-hidden="true">🎯</span>
          <div><h2>WRC Caller</h2><p class="sub">Das Board hängt. Die WRC zählt.</p></div>
        </header>

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

        <button type="button" class="dart-caller-primary" data-start-game ${state.selectedPlayers.length ? "" : "disabled"}>Spiel starten</button>
      </div>`;
  }

  function gameMarkup() {
    const active = state.players[state.currentPlayer];
    const turnTotal = state.darts.reduce((sum, dart) => sum + dart.score, 0);
    return `
      <div class="overlay dart-caller-shell">
        <div class="dart-caller-gamebar">
          <button type="button" class="dart-back-to-selection" data-caller-setup>← Neues Spiel</button>
          <span class="dart-caller-game-mode">${state.mode} · Straight Out</span>
        </div>

        ${state.completed ? winnerMarkup() : `
          <section class="dart-caller-scoreboard" aria-label="Spielstand">
            ${state.players.map((player, index) => `
              <article class="dart-caller-score ${index === state.currentPlayer ? "active" : ""} ${player.finished ? "finished" : ""}">
                <span>${escapeHtml(player.name)}</span><strong>${player.score}</strong>
                <small>${player.finished ? `${player.place}. Platz` : `Ø ${formatAverage(playerAverage(player, index))}`}</small>
              </article>
            `).join("")}
          </section>

          <section class="dart-caller-turn">
            <div><span class="dart-caller-eyebrow">Am Board</span><h2>${escapeHtml(active.name)}</h2></div>
            <div class="dart-caller-turn-total"><span>Aufnahme</span><strong>${turnTotal}</strong></div>
          </section>

          <div class="dart-caller-darts" aria-label="Geworfene Darts">
            ${[0, 1, 2].map(index => {
              const dart = state.darts[index];
              return `<div class="dart-caller-dart ${dart ? "filled" : ""}"><span>Dart ${index + 1}</span><strong>${dart ? escapeHtml(dart.label) : "–"}</strong></div>`;
            }).join("")}
          </div>

          <section class="dart-caller-input">
            <div class="dart-caller-multipliers" aria-label="Multiplikator">
              ${[{ value: 1, label: "Single" }, { value: 2, label: "Double" }, { value: 3, label: "Triple" }].map(item => `
                <button type="button" class="${state.multiplier === item.value ? "selected" : ""}" data-multiplier="${item.value}">${item.label}</button>
              `).join("")}
            </div>
            <div class="dart-caller-numbers">
              ${Array.from({ length: 20 }, (_, index) => index + 1).map(number => `<button type="button" data-score="${number}">${number}</button>`).join("")}
              <button type="button" class="dart-caller-miss" data-score="0">Miss</button>
              <button type="button" class="dart-caller-bull" data-bull="25">25</button>
              <button type="button" class="dart-caller-bullseye" data-bull="50">Bull</button>
            </div>
          </section>

          <div class="dart-caller-actions">
            <button type="button" data-undo ${state.undoStack.length ? "" : "disabled"}>↶ Letzten Dart zurück</button>
            <button type="button" data-end-turn>Aufnahme beenden →</button>
          </div>`}
      </div>`;
  }

  function winnerMarkup() {
    const ranking = state.players.slice().sort((a, b) => a.place - b.place);
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
        <div class="dart-caller-save-state ${state.saveError ? "error" : ""}">
          ${state.saving ? "Spiel wird gespeichert …" : state.saved ? "✓ Ergebnis gespeichert und Statistiken aktualisiert" : state.saveError || ""}
        </div>
        ${state.saveError ? `<button type="button" class="dart-caller-secondary" data-retry-save>Erneut speichern</button>` : ""}
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

  function playerAverage(player, index) {
    const liveTurn = index === state.currentPlayer && !state.turnBusted
      ? state.darts.reduce((sum, dart) => sum + dart.score, 0)
      : 0;
    return player.dartsThrown > 0
      ? ((player.scoredPoints + liveTurn) / player.dartsThrown) * 3
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
      finished: false,
      place: 0
    }));
    state.currentPlayer = 0;
    state.turnStartScore = state.mode;
    state.darts = [];
    state.turnBusted = false;
    state.multiplier = 1;
    state.undoStack = [];
    state.winner = null;
    state.finishOrder = [];
    state.completed = false;
    state.saving = false;
    state.saved = false;
    state.saveError = "";
    state.screen = "game";
    render();
  }

  function addDart(base, multiplier, customLabel) {
    if (state.completed || state.darts.length >= 3) return;
    const player = state.players[state.currentPlayer];
    const score = base * multiplier;
    const remaining = player.score - score;
    const label = customLabel || (base === 0 ? "Miss" : `${multiplier === 3 ? "T" : multiplier === 2 ? "D" : ""}${base}`);

    state.undoStack.push(snapshot());
    state.darts.push({ base, multiplier, score, label });
    player.dartsThrown += 1;

    if (remaining < 0) {
      player.score = state.turnStartScore;
      state.turnBusted = true;
      state.darts[state.darts.length - 1].label = `${label} · Bust`;
      render();
      window.WRCDartCallerAudio?.playSpecial("bust");
      scheduleNextTurn(700);
      return;
    }

    player.score = remaining;
    state.multiplier = 1;
    if (remaining === 0) {
      player.scoredPoints += state.darts.reduce((sum, dart) => sum + dart.score, 0);
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
    render();
    if (state.darts.length === 3) scheduleNextTurn(450);
  }

  function scheduleNextTurn(delay) {
    window.clearTimeout(turnTimer);
    turnTimer = window.setTimeout(finishTurn, delay);
  }

  function finishTurn() {
    if (state.completed || !state.players.length) return;
    window.clearTimeout(turnTimer);
    turnTimer = null;
    const turnTotal = state.darts.reduce((sum, dart) => sum + dart.score, 0);
    const activePlayer = state.players[state.currentPlayer];
    if (!state.turnBusted && state.darts.length && !activePlayer.finished) {
      state.players[state.currentPlayer].scoredPoints += turnTotal;
    }
    if (!state.turnBusted && state.darts.length === 3 && !activePlayer.finished) {
      window.WRCDartCallerAudio?.playTurnScore(turnTotal);
    }
    state.currentPlayer = nextActivePlayerIndex();
    state.turnStartScore = state.players[state.currentPlayer].score;
    state.darts = [];
    state.turnBusted = false;
    state.multiplier = 1;
    state.undoStack = [];
    render();
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
    state.undoStack = [];
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
      state.saving = false;
      state.saveError = "Das Ergebnis konnte nicht gespeichert werden.";
      console.error("WRC CALLER GAME SAVE ERROR:", gameError);
      render();
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
      state.saving = false;
      state.saveError = "Das Ergebnis konnte nicht vollständig gespeichert werden.";
      console.error("WRC CALLER RESULT SAVE ERROR:", resultsError);
      render();
      return;
    }

    state.saving = false;
    state.saved = true;
    render();
    if (typeof window.WRCRefreshDartHistory === "function") await window.WRCRefreshDartHistory();
    if (typeof window.loadDartStatistics === "function") window.loadDartStatistics();
    window.dispatchEvent(new CustomEvent("wrc:dart-game-saved", { detail: { mode: state.mode } }));
  }

  function snapshot() {
    return {
      players: state.players.map(player => ({ ...player })),
      darts: state.darts.map(dart => ({ ...dart })),
      turnBusted: state.turnBusted,
      multiplier: state.multiplier,
      winner: state.winner ? { ...state.winner } : null,
      finishOrder: state.finishOrder.slice()
    };
  }

  function undoLastDart() {
    window.clearTimeout(turnTimer);
    turnTimer = null;
    const previous = state.undoStack.pop();
    if (!previous) return;
    state.players = previous.players;
    state.darts = previous.darts;
    state.turnBusted = previous.turnBusted;
    state.multiplier = previous.multiplier;
    state.winner = previous.winner;
    state.finishOrder = previous.finishOrder;
    render();
  }

  function showSetup() {
    window.clearTimeout(turnTimer);
    turnTimer = null;
    window.WRCDartCallerAudio?.stop();
    const selectedPlayers = state.selectedPlayers.slice();
    const mode = state.mode;
    state = freshState();
    state.selectedPlayers = selectedPlayers;
    state.mode = mode;
    render();
  }

  function confirmNewGame() {
    const untouched = state.players.every(player => player.score === state.mode);
    if (state.completed || untouched || window.confirm("Laufendes Spiel beenden und zur Auswahl zurückkehren?")) showSetup();
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
  render();
})();

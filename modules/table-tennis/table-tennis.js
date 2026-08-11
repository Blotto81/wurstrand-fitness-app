(function () {
  const panel = document.getElementById("tableTennisPanel");
  if (!panel) return;

  const TABLE_NAME = "game_collection_rounds";
  const GAME_NAME = "Tischtennis";
  const SOURCE = "table-tennis";
  const players = Array.isArray(window.people)
    ? window.people
    : typeof people !== "undefined" ? people : [];

  let mode = "single";
  let placements = {};
  let teams = {};
  let rounds = [];

  panel.innerHTML = `
    <div class="overlay table-tennis-page">
      <div class="badge">Game Lounge</div>
      <div class="challenge-row">
        <div>
          <h2>🏓 Tischtennis</h2>
          <p class="sub">Einzel, Doppel und Rundlauf – mit Teams, Platzierungen und Historie.</p>
        </div>
      </div>

      <div class="table-tennis-submenu">
        <button type="button" class="table-tennis-submenu-button selected" data-view="round">🏓 Neue Runde</button>
        <button type="button" class="table-tennis-submenu-button" data-view="stats">📊 Statistik</button>
      </div>

      <div id="tableTennisRoundView" class="table-tennis-view active">
        <section class="table-tennis-section">
          <h3>Spielart</h3>
          <div class="table-tennis-mode-grid">
            <button type="button" class="table-tennis-mode selected" data-mode="single"><strong>Einzel</strong><span>1 gegen 1</span></button>
            <button type="button" class="table-tennis-mode" data-mode="double"><strong>Doppel</strong><span>2 gegen 2</span></button>
            <button type="button" class="table-tennis-mode" data-mode="round"><strong>Rundlauf</strong><span>Chinesisch</span></button>
          </div>
        </section>

        <section class="table-tennis-section">
          <h3>👥 Teilnehmer</h3>
          <p id="tableTennisPlayerHint" class="table-tennis-hint"></p>
          <div id="tableTennisPlayerGrid" class="table-tennis-player-grid"></div>
          <button type="button" id="tableTennisGuestToggle" class="table-tennis-secondary">➕ Gast hinzufügen</button>
          <div id="tableTennisGuestForm" class="table-tennis-guest-form">
            <label for="tableTennisGuestName">Name des Gastes</label>
            <input id="tableTennisGuestName" maxlength="50" autocomplete="off" placeholder="Name">
            <button type="button" id="tableTennisGuestAdd" class="table-tennis-secondary">Gast übernehmen</button>
          </div>
        </section>

        <section id="tableTennisTeamsSection" class="table-tennis-section" hidden>
          <h3>🤝 Teams zusammenstellen</h3>
          <p class="table-tennis-hint">Ordne jedem Spieler Team Blau oder Team Orange zu.</p>
          <div id="tableTennisTeams" class="table-tennis-teams"></div>
        </section>

        <section class="table-tennis-section">
          <h3>🏆 Ergebnis</h3>
          <p id="tableTennisResultHint" class="table-tennis-hint"></p>
          <div id="tableTennisResults" class="table-tennis-results"></div>
        </section>

        <button type="button" id="tableTennisSave" class="table-tennis-save">💾 Runde speichern</button>

        <section class="table-tennis-history-section">
          <h3>📜 Tischtennis-Historie</h3>
          <div id="tableTennisHistory"><p class="table-tennis-empty">Noch keine Runden geladen.</p></div>
        </section>
      </div>

      <div id="tableTennisStatsView" class="table-tennis-view">
        <div class="table-tennis-stats-head">
          <div><h3>📊 Tischtennis-Statistik</h3><p class="sub">Partien, Siege und Podestplätze.</p></div>
          <label>Spielart filtern
            <select id="tableTennisStatsFilter">
              <option value="">Alle Spielarten</option>
              <option value="single">Einzel</option>
              <option value="double">Doppel</option>
              <option value="round">Rundlauf</option>
            </select>
          </label>
        </div>
        <div id="tableTennisStatsSummary" class="table-tennis-stats-summary"></div>
        <div id="tableTennisRanking" class="table-tennis-ranking"></div>
      </div>
    </div>
  `;

  const playerGrid = panel.querySelector("#tableTennisPlayerGrid");
  const playerHint = panel.querySelector("#tableTennisPlayerHint");
  const teamsSection = panel.querySelector("#tableTennisTeamsSection");
  const teamsBox = panel.querySelector("#tableTennisTeams");
  const resultsBox = panel.querySelector("#tableTennisResults");
  const resultHint = panel.querySelector("#tableTennisResultHint");
  const saveButton = panel.querySelector("#tableTennisSave");
  const historyBox = panel.querySelector("#tableTennisHistory");
  const guestForm = panel.querySelector("#tableTennisGuestForm");
  const guestInput = panel.querySelector("#tableTennisGuestName");
  const statsFilter = panel.querySelector("#tableTennisStatsFilter");

  const modeLabels = { single: "Einzel", double: "Doppel", round: "Rundlauf (Chinesisch)" };
  const placeIcon = place => place === 1 ? "🥇" : place === 2 ? "🥈" : place === 3 ? "🥉" : `${place}.`;
  const selectedPlayers = () => Array.from(playerGrid.querySelectorAll(".selected")).map(button => button.dataset.player);
  const maxPlayers = () => mode === "single" ? 2 : mode === "double" ? 4 : 12;
  const minPlayers = () => mode === "round" ? 3 : maxPlayers();

  function isTableTennisRound(round) {
    return round.game_name === GAME_NAME
      && Array.isArray(round.results)
      && round.results.some(result => result.source === SOURCE);
  }

  function addPlayerButton(name, selected = false) {
    const normalized = String(name || "").trim().replace(/\s+/g, " ");
    if (!normalized) return;
    const exists = Array.from(playerGrid.children).find(button => button.dataset.player.toLowerCase() === normalized.toLowerCase());
    if (exists) {
      if (selected) exists.classList.add("selected");
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = `table-tennis-player${selected ? " selected" : ""}`;
    button.dataset.player = normalized;
    button.textContent = normalized;
    button.addEventListener("click", () => togglePlayer(button));
    playerGrid.appendChild(button);
  }

  players.forEach(player => addPlayerButton(player));

  function togglePlayer(button) {
    if (!button.classList.contains("selected") && selectedPlayers().length >= maxPlayers()) {
      showMessage(mode === "single"
        ? "Beim Einzel spielen genau zwei Personen."
        : mode === "double"
          ? "Beim Doppel spielen genau vier Personen."
          : "Beim Rundlauf sind höchstens zwölf Teilnehmer möglich.");
      return;
    }
    button.classList.toggle("selected");
    placements = {};
    Object.keys(teams).forEach(player => {
      if (!selectedPlayers().includes(player)) delete teams[player];
    });
    renderSetup();
  }

  function showMessage(message) {
    resultHint.textContent = message;
    resultHint.classList.add("error");
    window.setTimeout(() => resultHint.classList.remove("error"), 1800);
  }

  function setMode(nextMode) {
    mode = nextMode;
    placements = {};
    teams = {};
    playerGrid.querySelectorAll(".selected").forEach(button => button.classList.remove("selected"));
    panel.querySelectorAll(".table-tennis-mode").forEach(button => button.classList.toggle("selected", button.dataset.mode === mode));
    renderSetup();
  }

  function renderSetup() {
    const selected = selectedPlayers();
    playerHint.textContent = mode === "single"
      ? "Wähle genau zwei Spieler."
      : mode === "double"
        ? "Wähle genau vier Spieler und stelle danach die Teams zusammen."
        : "Wähle mindestens drei Teilnehmer.";
    teamsSection.hidden = mode !== "double";
    renderTeams(selected);
    renderResults(selected);
  }

  function renderTeams(selected) {
    if (mode !== "double") return;
    teamsBox.innerHTML = selected.length
      ? selected.map(player => `
          <div class="table-tennis-team-row">
            <strong>${escapeHtml(player)}</strong>
            <div>
              <button type="button" class="table-tennis-team${teams[player] === "blue" ? " selected blue" : ""}" data-player="${escapeHtml(player)}" data-team="blue">Team Blau</button>
              <button type="button" class="table-tennis-team${teams[player] === "orange" ? " selected orange" : ""}" data-player="${escapeHtml(player)}" data-team="orange">Team Orange</button>
            </div>
          </div>`).join("")
      : `<p class="table-tennis-empty">Zuerst vier Teilnehmer auswählen.</p>`;
  }

  teamsBox.addEventListener("click", event => {
    const button = event.target.closest(".table-tennis-team");
    if (!button) return;
    const teamMembers = Object.entries(teams).filter(([, team]) => team === button.dataset.team && team !== teams[button.dataset.player]);
    if (teamMembers.length >= 2) return showMessage("Ein Doppel-Team besteht aus genau zwei Spielern.");
    teams[button.dataset.player] = button.dataset.team;
    placements = {};
    renderSetup();
  });

  function teamComplete() {
    const selected = selectedPlayers();
    return selected.length === 4
      && selected.filter(player => teams[player] === "blue").length === 2
      && selected.filter(player => teams[player] === "orange").length === 2;
  }

  function renderResults(selected) {
    if (mode === "double") {
      resultHint.textContent = "Das Gewinnerteam erhält für beide Spieler Gold.";
      resultsBox.innerHTML = teamComplete()
        ? `<div class="table-tennis-winner-grid">
            <button type="button" class="table-tennis-winner${placements.winner === "blue" ? " selected blue" : ""}" data-winner="blue">🥇 Team Blau<br><small>${selected.filter(player => teams[player] === "blue").map(escapeHtml).join(" & ")}</small></button>
            <button type="button" class="table-tennis-winner${placements.winner === "orange" ? " selected orange" : ""}" data-winner="orange">🥇 Team Orange<br><small>${selected.filter(player => teams[player] === "orange").map(escapeHtml).join(" & ")}</small></button>
          </div>`
        : `<p class="table-tennis-empty">Beide Teams vollständig zusammenstellen.</p>`;
      return;
    }

    resultHint.textContent = mode === "single" ? "Bestimme Gewinner und zweiten Platz." : "Vergib die Reihenfolge des Rundlaufs.";
    if (selected.length < minPlayers()) {
      resultsBox.innerHTML = `<p class="table-tennis-empty">Noch nicht genügend Teilnehmer ausgewählt.</p>`;
      return;
    }
    resultsBox.innerHTML = selected.map((_, index) => {
      const place = index + 1;
      const used = new Set(Object.entries(placements).filter(([key]) => Number(key) !== place).map(([, player]) => player));
      return `<div class="table-tennis-place-row">
        <strong>${placeIcon(place)} Platz ${place}</strong>
        <div>${selected.filter(player => !used.has(player)).map(player => `<button type="button" class="table-tennis-place${placements[place] === player ? " selected" : ""}" data-place="${place}" data-player="${escapeHtml(player)}">${escapeHtml(player)}</button>`).join("")}</div>
      </div>`;
    }).join("");
  }

  resultsBox.addEventListener("click", event => {
    const winner = event.target.closest(".table-tennis-winner");
    if (winner) {
      placements.winner = winner.dataset.winner;
      renderSetup();
      return;
    }
    const placeButton = event.target.closest(".table-tennis-place");
    if (!placeButton) return;
    placements[Number(placeButton.dataset.place)] = placeButton.dataset.player;
    renderSetup();
  });

  function buildResults() {
    const selected = selectedPlayers();
    if (selected.length < minPlayers() || selected.length > maxPlayers()) return null;
    if (mode === "double") {
      if (!teamComplete() || !placements.winner) return null;
      return selected.map(player => ({
        player,
        place: teams[player] === placements.winner ? 1 : 2,
        team: teams[player],
        mode,
        source: SOURCE
      }));
    }
    const result = selected.map((_, index) => ({ player: placements[index + 1], place: index + 1, mode, source: SOURCE }));
    return result.some(item => !item.player) ? null : result;
  }

  async function saveRound() {
    const results = buildResults();
    if (!results) return showMessage("Bitte Teilnehmer, Teams und Ergebnis vollständig festlegen.");
    saveButton.disabled = true;
    saveButton.textContent = "Speichert …";
    const { error } = await supabaseClient.from(TABLE_NAME).insert({
      game_name: GAME_NAME,
      game_date: new Date().toISOString().slice(0, 10),
      results
    });
    if (error) {
      console.error("TABLE TENNIS SAVE ERROR:", error);
      showMessage("Die Tischtennis-Runde konnte nicht gespeichert werden.");
      saveButton.disabled = false;
      saveButton.textContent = "💾 Runde speichern";
      return;
    }
    placements = {};
    teams = {};
    playerGrid.querySelectorAll(".selected").forEach(button => button.classList.remove("selected"));
    renderSetup();
    await loadRounds();
    saveButton.textContent = "✓ Runde gespeichert";
    window.setTimeout(() => {
      saveButton.disabled = false;
      saveButton.textContent = "💾 Runde speichern";
    }, 1200);
  }

  async function loadRounds() {
    const { data, error } = await supabaseClient.from(TABLE_NAME).select("*").eq("game_name", GAME_NAME).order("game_date", { ascending: false }).order("created_at", { ascending: false });
    if (error) {
      console.error("TABLE TENNIS LOAD ERROR:", error);
      historyBox.innerHTML = `<p class="table-tennis-empty">Tischtennis-Runden konnten nicht geladen werden.</p>`;
      return;
    }
    rounds = (data || []).filter(isTableTennisRound);
    renderHistory();
    renderStats();
  }

  function renderHistory() {
    historyBox.innerHTML = rounds.length ? rounds.map(round => {
      const results = [...round.results].sort((a, b) => Number(a.place) - Number(b.place));
      return `<article class="table-tennis-history-card">
        <header><div><span>🏓 ${modeLabels[results[0]?.mode] || "Tischtennis"}</span><strong>${new Date(`${round.game_date}T12:00:00`).toLocaleDateString("de-DE")}</strong></div><button type="button" class="table-tennis-delete" data-id="${round.id}" aria-label="Runde löschen">🗑️</button></header>
        <div>${results.map(result => `<span>${placeIcon(Number(result.place))} <strong>${escapeHtml(result.player)}</strong>${result.team ? ` · Team ${result.team === "blue" ? "Blau" : "Orange"}` : ""}</span>`).join("")}</div>
      </article>`;
    }).join("") : `<p class="table-tennis-empty">Noch keine Tischtennis-Runden gespeichert.</p>`;
  }

  historyBox.addEventListener("click", async event => {
    const button = event.target.closest(".table-tennis-delete");
    if (!button || !confirm("Diese Tischtennis-Runde wirklich löschen?")) return;
    button.disabled = true;
    const { error } = await supabaseClient.from(TABLE_NAME).delete().eq("id", button.dataset.id);
    if (error) {
      console.error("TABLE TENNIS DELETE ERROR:", error);
      button.disabled = false;
      return;
    }
    await loadRounds();
  });

  function renderStats() {
    const filtered = statsFilter.value ? rounds.filter(round => round.results[0]?.mode === statsFilter.value) : rounds;
    const stats = {};
    filtered.forEach(round => round.results.forEach(result => {
      if (!stats[result.player]) stats[result.player] = { games: 0, wins: 0, podiums: 0 };
      stats[result.player].games++;
      if (Number(result.place) === 1) stats[result.player].wins++;
      if (Number(result.place) <= 3) stats[result.player].podiums++;
    }));
    const ranking = Object.entries(stats).map(([player, values]) => ({ player, ...values, rate: values.games ? values.wins / values.games * 100 : 0 })).sort((a, b) => b.wins - a.wins || b.podiums - a.podiums || b.games - a.games);
    panel.querySelector("#tableTennisStatsSummary").innerHTML = `<div><span>🏓 Partien</span><strong>${filtered.length}</strong></div><div><span>🏆 Meiste Siege</span><strong>${ranking[0] ? `${escapeHtml(ranking[0].player)} · ${ranking[0].wins}` : "–"}</strong></div><div><span>👥 Aktive Spieler</span><strong>${ranking.length}</strong></div>`;
    panel.querySelector("#tableTennisRanking").innerHTML = ranking.length
      ? `<div class="table-tennis-ranking-head"><span>Spieler</span><span>Partien</span><span>Siege</span><span>Podest</span><span>Siegquote</span></div>${ranking.map((item, index) => `<div class="table-tennis-ranking-row"><strong>${index + 1}. ${escapeHtml(item.player)}</strong><span>${item.games}</span><span>${item.wins}</span><span>${item.podiums}</span><span>${item.rate.toLocaleString("de-DE", { maximumFractionDigits: 0 })} %</span></div>`).join("")}`
      : `<p class="table-tennis-empty">Noch keine Ergebnisse für diese Auswahl.</p>`;
  }

  panel.querySelectorAll(".table-tennis-mode").forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
  panel.querySelector("#tableTennisGuestToggle").addEventListener("click", () => guestForm.classList.toggle("open"));
  panel.querySelector("#tableTennisGuestAdd").addEventListener("click", () => {
    const name = guestInput.value.trim().replace(/\s+/g, " ");
    if (!name) return guestInput.focus();
    if (selectedPlayers().length >= maxPlayers()) {
      return showMessage("Für diese Spielart sind bereits alle Plätze belegt.");
    }
    addPlayerButton(name, true);
    guestInput.value = "";
    guestForm.classList.remove("open");
    renderSetup();
  });
  saveButton.addEventListener("click", saveRound);
  statsFilter.addEventListener("change", renderStats);
  panel.querySelectorAll(".table-tennis-submenu-button").forEach(button => button.addEventListener("click", () => {
    const stats = button.dataset.view === "stats";
    panel.querySelectorAll(".table-tennis-submenu-button").forEach(item => item.classList.toggle("selected", item === button));
    panel.querySelector("#tableTennisRoundView").classList.toggle("active", !stats);
    panel.querySelector("#tableTennisStatsView").classList.toggle("active", stats);
    if (stats) renderStats();
  }));

  renderSetup();
  loadRounds();
})();

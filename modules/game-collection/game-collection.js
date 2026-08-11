(function () {
  const panel = document.getElementById("gameCollectionPanel");
  if (!panel) return;

  const TABLE_NAME = "game_collection_rounds";
  const configuredPlayers = Array.isArray(window.people)
    ? window.people
    : typeof people !== "undefined"
      ? people
      : [];

  let placements = {};
  let loadedRounds = [];

  panel.innerHTML = `
    <div class="overlay game-collection-page">
      <div class="badge">Game Lounge</div>

      <div class="challenge-row">
        <div>
          <h2>🎲 Spielesammlung</h2>
          <p class="sub">Brett-, Karten- und Gesellschaftsspiele an einem Ort.</p>
        </div>
      </div>

      <div class="game-collection-submenu">
        <button type="button" class="game-collection-submenu-button selected" data-game-collection-view="round">
          🎲 Neue Runde
        </button>
        <button type="button" class="game-collection-submenu-button" data-game-collection-view="stats">
          📊 Statistik
        </button>
      </div>

      <div id="gameCollectionRoundView" class="game-collection-view active">
        <section class="game-collection-section">
          <label class="game-collection-label" for="gameCollectionName">Spiel</label>
          <input
            id="gameCollectionName"
            class="game-collection-name"
            type="text"
            list="gameCollectionSuggestions"
            maxlength="80"
            placeholder="z. B. Skyjo, Wizard oder Kniffel"
            autocomplete="off"
          >
          <datalist id="gameCollectionSuggestions"></datalist>
          <p class="game-collection-hint">Bekannte Spiele erscheinen beim Tippen automatisch als Vorschlag.</p>
        </section>

        <section class="game-collection-section">
          <h3>👥 Teilnehmer</h3>
          <div id="gameCollectionPlayerGrid" class="game-collection-player-grid"></div>

          <button type="button" id="gameCollectionGuestToggle" class="game-collection-guest-toggle">
            ➕ Gast hinzufügen
          </button>

          <div id="gameCollectionGuestForm" class="game-collection-guest-form">
            <label for="gameCollectionGuestName">Name des Gastes</label>
            <input id="gameCollectionGuestName" type="text" maxlength="50" placeholder="z. B. Anja" autocomplete="off">
            <button type="button" id="gameCollectionGuestAdd" class="game-collection-guest-add">
              Gast übernehmen
            </button>
          </div>
        </section>

        <section class="game-collection-section">
          <h3>🏆 Platzierungen</h3>
          <p class="game-collection-hint">Wähle mindestens zwei Teilnehmer und vergib anschließend alle Plätze.</p>
          <div id="gameCollectionPlacementList" class="game-collection-placement-list"></div>
        </section>

        <div class="game-collection-save-section">
          <button type="button" id="gameCollectionSaveButton" class="game-collection-save-button">
            💾 Runde speichern
          </button>
        </div>

        <section class="game-collection-history-section">
          <h3>📜 Spiele-Historie</h3>
          <div id="gameCollectionHistoryList" class="game-collection-history-list">
            <p class="game-collection-empty">Noch keine Runden geladen.</p>
          </div>
        </section>
      </div>

      <div id="gameCollectionStatsView" class="game-collection-view">
        <div class="game-collection-stats-head">
          <div>
            <h3>📊 Spiele-Statistik</h3>
            <p class="sub">Siege, Podestplätze und Lieblingsspiele.</p>
          </div>
          <label>
            Spiel filtern
            <select id="gameCollectionStatsFilter">
              <option value="">Alle Spiele</option>
            </select>
          </label>
        </div>

        <div id="gameCollectionStatsSummary" class="game-collection-stats-summary"></div>
        <div id="gameCollectionRecentGames" class="game-collection-recent-games"></div>
        <div id="gameCollectionStatsRanking" class="game-collection-stats-ranking"></div>
      </div>
    </div>
  `;

  const nameInput = document.getElementById("gameCollectionName");
  const suggestions = document.getElementById("gameCollectionSuggestions");
  const playerGrid = document.getElementById("gameCollectionPlayerGrid");
  const placementList = document.getElementById("gameCollectionPlacementList");
  const guestToggle = document.getElementById("gameCollectionGuestToggle");
  const guestForm = document.getElementById("gameCollectionGuestForm");
  const guestNameInput = document.getElementById("gameCollectionGuestName");
  const guestAddButton = document.getElementById("gameCollectionGuestAdd");
  const saveButton = document.getElementById("gameCollectionSaveButton");
  const historyList = document.getElementById("gameCollectionHistoryList");
  const statsFilter = document.getElementById("gameCollectionStatsFilter");
  const statsSummary = document.getElementById("gameCollectionStatsSummary");
  const recentGames = document.getElementById("gameCollectionRecentGames");
  const statsRanking = document.getElementById("gameCollectionStatsRanking");
  const roundView = document.getElementById("gameCollectionRoundView");
  const statsView = document.getElementById("gameCollectionStatsView");

  function normalizedName(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function selectedPlayers() {
    return Array.from(
      playerGrid.querySelectorAll(".game-collection-player-button.selected")
    ).map((button) => button.textContent.trim());
  }

  function placeIcon(place) {
    if (place === 1) return "🥇";
    if (place === 2) return "🥈";
    if (place === 3) return "🥉";
    return `${place}.`;
  }

  function connectPlayerButton(button) {
    button.addEventListener("click", () => {
      button.classList.toggle("selected");
      renderPlacements();
    });
  }

  function addPlayerButton(player, selected) {
    const existing = Array.from(
      playerGrid.querySelectorAll(".game-collection-player-button")
    ).find((button) => button.textContent.trim().toLowerCase() === player.toLowerCase());

    if (existing) {
      if (selected) existing.classList.add("selected");
      return existing;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = `game-collection-player-button${selected ? " selected" : ""}`;
    button.textContent = player;
    connectPlayerButton(button);
    playerGrid.appendChild(button);
    return button;
  }

  configuredPlayers.forEach((player) => addPlayerButton(player, false));

  function cleanPlacements(players) {
    Object.keys(placements).forEach((place) => {
      if (!players.includes(placements[place]) || Number(place) > players.length) {
        delete placements[place];
      }
    });
  }

  function renderPlacements() {
    const players = selectedPlayers();
    cleanPlacements(players);

    if (!players.length) {
      placementList.innerHTML = `
        <div class="game-collection-placement-empty">Erst Teilnehmer auswählen.</div>
      `;
      return;
    }

    placementList.innerHTML = players
      .map((_, index) => {
        const place = index + 1;
        const availablePlayers = players.filter((player) => {
          return !Object.entries(placements).some(
            ([otherPlace, assigned]) => Number(otherPlace) !== place && assigned === player
          );
        });

        return `
          <div class="game-collection-placement-row">
            <div class="game-collection-place">${placeIcon(place)}<span>Platz ${place}</span></div>
            <div class="game-collection-placement-options" data-place="${place}">
              ${availablePlayers
                .map(
                  (player) => `
                    <button
                      type="button"
                      class="game-collection-placement-button${placements[place] === player ? " selected" : ""}"
                      data-player="${escapeHtml(player)}"
                    >${escapeHtml(player)}</button>
                  `
                )
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");
  }

  placementList.addEventListener("click", (event) => {
    const button = event.target.closest(".game-collection-placement-button");
    if (!button) return;

    const place = Number(button.closest("[data-place]").dataset.place);
    const player = button.dataset.player;
    placements[place] = placements[place] === player ? null : player;
    renderPlacements();
  });

  guestToggle.addEventListener("click", () => {
    guestForm.classList.toggle("open");
    if (guestForm.classList.contains("open")) guestNameInput.focus();
  });

  function addGuest() {
    const guestName = normalizedName(guestNameInput.value);
    if (!guestName) {
      guestNameInput.focus();
      return;
    }

    addPlayerButton(guestName, true);
    guestNameInput.value = "";
    guestForm.classList.remove("open");
    renderPlacements();
  }

  guestAddButton.addEventListener("click", addGuest);
  guestNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addGuest();
  });

  panel.querySelectorAll(".game-collection-submenu-button").forEach((button) => {
    button.addEventListener("click", () => {
      const showStats = button.dataset.gameCollectionView === "stats";

      panel.querySelectorAll(".game-collection-submenu-button").forEach((item) => {
        item.classList.toggle("selected", item === button);
      });

      roundView.classList.toggle("active", !showStats);
      statsView.classList.toggle("active", showStats);
      if (showStats) renderStatistics();
    });
  });

  function knownGameNames() {
    return [...new Set(loadedRounds.map((round) => normalizedName(round.game_name)).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "de"));
  }

  function refreshGameChoices() {
    const gameNames = knownGameNames();
    suggestions.innerHTML = gameNames
      .map((gameName) => `<option value="${escapeHtml(gameName)}"></option>`)
      .join("");

    const currentFilter = statsFilter.value;
    statsFilter.innerHTML = `
      <option value="">Alle Spiele</option>
      ${gameNames
        .map((gameName) => `<option value="${escapeHtml(gameName)}">${escapeHtml(gameName)}</option>`)
        .join("")}
    `;
    if (gameNames.includes(currentFilter)) statsFilter.value = currentFilter;
  }

  function sortedResults(round) {
    return Array.isArray(round.results)
      ? [...round.results].sort((a, b) => Number(a.place) - Number(b.place))
      : [];
  }

  function setupMessage() {
    return `
      <div class="game-collection-setup">
        <strong>Die Spielesammlung ist bereit.</strong>
        <span>Die zugehörige Supabase-Tabelle muss einmalig eingerichtet werden.</span>
      </div>
    `;
  }

  function tableNeedsSetup(error) {
    return error && (
      error.code === "42P01"
      || error.code === "PGRST205"
      || String(error.message || "").includes(TABLE_NAME)
    );
  }

  async function loadRounds() {
    historyList.innerHTML = `<p class="game-collection-empty">Lade Spielrunden …</p>`;

    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .select("*")
      .order("game_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GAME COLLECTION LOAD ERROR:", error);
      historyList.innerHTML = setupMessage();
      return;
    }

    loadedRounds = (data || []).filter(round => !(
      round.game_name === "Tischtennis"
      && Array.isArray(round.results)
      && round.results.some(result => result.source === "table-tennis")
    ));
    refreshGameChoices();
    renderHistory();
    renderStatistics();
  }

  function renderHistory() {
    if (!loadedRounds.length) {
      historyList.innerHTML = `<p class="game-collection-empty">Noch keine Spielrunden gespeichert.</p>`;
      return;
    }

    historyList.innerHTML = loadedRounds
      .map((round) => `
        <article class="game-collection-history-card">
          <div class="game-collection-history-head">
            <div>
              <span>🎲 Spielesammlung</span>
              <strong>${escapeHtml(round.game_name)}</strong>
            </div>
            <div class="game-collection-history-actions">
              <time>${new Date(`${round.game_date}T12:00:00`).toLocaleDateString("de-DE")}</time>
              <button
                type="button"
                class="game-collection-delete"
                data-round-id="${round.id}"
                aria-label="${escapeHtml(round.game_name)} löschen"
                title="Runde löschen"
              >🗑️</button>
            </div>
          </div>
          <div class="game-collection-history-results">
            ${sortedResults(round)
              .map((result) => `
                <div>
                  <span>${placeIcon(Number(result.place))}</span>
                  <strong>${escapeHtml(result.player)}</strong>
                </div>
              `)
              .join("")}
          </div>
        </article>
      `)
      .join("");
  }

  historyList.addEventListener("click", async (event) => {
    const button = event.target.closest(".game-collection-delete");
    if (!button) return;
    if (!confirm("Diese Spielrunde wirklich löschen?")) return;

    button.disabled = true;
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .delete()
      .eq("id", button.dataset.roundId);

    if (error) {
      console.error("GAME COLLECTION DELETE ERROR:", error);
      alert("❌ Die Spielrunde konnte nicht gelöscht werden.");
      button.disabled = false;
      return;
    }

    await loadRounds();
  });

  function gameFrequency(rounds) {
    const counts = {};
    rounds.forEach((round) => {
      counts[round.game_name] = (counts[round.game_name] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "de"));
  }

  function renderStatistics() {
    const selectedGame = statsFilter.value;
    const rounds = selectedGame
      ? loadedRounds.filter((round) => round.game_name === selectedGame)
      : loadedRounds;
    const players = {};

    rounds.forEach((round) => {
      sortedResults(round).forEach((result) => {
        const player = result.player;
        const place = Number(result.place);
        if (!players[player]) players[player] = { player, games: 0, wins: 0, podiums: 0 };
        players[player].games += 1;
        if (place === 1) players[player].wins += 1;
        if (place <= 3) players[player].podiums += 1;
      });
    });

    const ranking = Object.values(players)
      .map((player) => ({
        ...player,
        winRate: player.games ? (player.wins / player.games) * 100 : 0
      }))
      .sort((a, b) => b.wins - a.wins || b.podiums - a.podiums || b.games - a.games);
    const favorite = gameFrequency(rounds)[0];
    const winner = ranking[0];
    const winRateLeader = [...ranking].sort(
      (a, b) => b.winRate - a.winRate || b.games - a.games
    )[0];

    statsSummary.innerHTML = `
      <div><span>🎲 Partien</span><strong>${rounds.length}</strong></div>
      <div><span>🏆 Meiste Siege</span><strong>${winner ? `${escapeHtml(winner.player)} · ${winner.wins}` : "–"}</strong></div>
      <div><span>⭐ Lieblingsspiel</span><strong>${favorite ? escapeHtml(favorite[0]) : "–"}</strong></div>
      <div><span>📈 Beste Siegquote</span><strong>${winRateLeader ? `${escapeHtml(winRateLeader.player)} · ${winRateLeader.winRate.toLocaleString("de-DE", { maximumFractionDigits: 0 })} %` : "–"}</strong></div>
    `;

    recentGames.innerHTML = rounds.length
      ? `
          <h4>Zuletzt gespielt</h4>
          <div>${rounds.slice(0, 5).map((round) => `<span>${escapeHtml(round.game_name)}</span>`).join("")}</div>
        `
      : "";

    if (!ranking.length) {
      statsRanking.innerHTML = `<p class="game-collection-empty">Noch keine Ergebnisse für diese Auswahl vorhanden.</p>`;
      return;
    }

    statsRanking.innerHTML = `
      <div class="game-collection-ranking-head">
        <span>Spieler</span><span>Partien</span><span>Siege</span><span>Podest</span><span>Siegquote</span>
      </div>
      ${ranking
        .map((player, index) => `
          <div class="game-collection-ranking-row">
            <strong><span>${index + 1}.</span> ${escapeHtml(player.player)}</strong>
            <span>${player.games}</span>
            <span>${player.wins}</span>
            <span>${player.podiums}</span>
            <span>${player.winRate.toLocaleString("de-DE", { maximumFractionDigits: 0 })} %</span>
          </div>
        `)
        .join("")}
    `;
  }

  statsFilter.addEventListener("change", renderStatistics);

  saveButton.addEventListener("click", async () => {
    const gameName = normalizedName(nameInput.value);
    const players = selectedPlayers();

    if (!gameName) {
      alert("Bitte zuerst einen Spielnamen eingeben.");
      nameInput.focus();
      return;
    }

    if (players.length < 2) {
      alert("Bitte mindestens zwei Teilnehmer auswählen.");
      return;
    }

    const results = players.map((_, index) => ({
      player: placements[index + 1],
      place: index + 1
    }));

    if (results.some((result) => !result.player)) {
      alert("Bitte jedem Teilnehmer genau einen Platz zuweisen.");
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Speichert …";

    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .insert({
        game_name: gameName,
        game_date: new Date().toISOString().slice(0, 10),
        results
      });

    if (error) {
      console.error("GAME COLLECTION SAVE ERROR:", error);
      alert(
        tableNeedsSetup(error)
          ? "Die Supabase-Tabelle für die Spielesammlung muss zuerst eingerichtet werden."
          : "❌ Die Runde konnte nicht gespeichert werden."
      );
      saveButton.disabled = false;
      saveButton.textContent = "💾 Runde speichern";
      return;
    }

    nameInput.value = "";
    placements = {};
    playerGrid.querySelectorAll(".game-collection-player-button").forEach((button) => {
      button.classList.remove("selected");
    });
    renderPlacements();
    await loadRounds();

    saveButton.classList.add("success");
    saveButton.textContent = "✓ Runde gespeichert";
    setTimeout(() => {
      saveButton.disabled = false;
      saveButton.classList.remove("success");
      saveButton.textContent = "💾 Runde speichern";
    }, 1200);
  });

  renderPlacements();
  loadRounds();

  window.WRCGameCollection = Object.freeze({
    normalizedName,
    placeIcon,
    tableName: TABLE_NAME
  });
})();

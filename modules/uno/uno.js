const unoPanel = document.getElementById("unoPanel");

if (unoPanel) {
  unoPanel.innerHTML = `
    <div class="overlay uno-page">
      <div class="badge">Game Lounge</div>

      <div class="challenge-row">
        <div>
          <h2>🃏 UNO</h2>
          <p class="sub">UNO-Runden, Platzierungen und kleine Statistiken.</p>
        </div>
      </div>

      <div class="uno-submenu">
        <button
          type="button"
          class="uno-submenu-button"
          data-uno-view="game"
        >
          🃏 Neue Runde
        </button>

        <button
          type="button"
          class="uno-submenu-button"
          data-uno-view="stats"
        >
          📊 Statistik
        </button>
      </div>

      <div id="unoGameView" class="uno-view active">
        <div class="uno-section">
          <h3>👥 Teilnehmer</h3>

          <div id="unoPlayerGrid" class="uno-player-grid">
            <button type="button" class="uno-player-button">
              Thorsten
            </button>

            <button type="button" class="uno-player-button">
              Basti
            </button>

            <button type="button" class="uno-player-button">
              Marian
            </button>

            <button type="button" class="uno-player-button">
              Fabi
            </button>
          </div>

          <button
            type="button"
            id="unoGuestToggle"
            class="uno-guest-toggle"
          >
            ➕ Gast hinzufügen
          </button>

          <div id="unoGuestForm" class="uno-guest-form">
            <label for="unoGuestName">
              Name des Gastes
            </label>

            <input
              type="text"
              id="unoGuestName"
              placeholder="z. B. Anja"
              autocomplete="off"
            >

            <button
              type="button"
              id="unoGuestAdd"
              class="uno-guest-add"
            >
              Gast übernehmen
            </button>
          </div>
        </div>

        <div class="uno-section uno-result-section">
          <h3>🏆 Platzierungen</h3>

          <p class="uno-result-hint">
            Wähle zuerst die Teilnehmer und ordne danach jedem einen Platz zu.
          </p>

          <div id="unoPlacementList" class="uno-placement-list">
            <div class="uno-placement-empty">
              Erst Teilnehmer auswählen.
            </div>
          </div>
        </div>

        <div class="uno-save-section">
          <button
            type="button"
            id="unoSaveButton"
            class="uno-save-button"
          >
            💾 UNO-Runde speichern
          </button>
        </div>

        <div class="uno-history-section">
          <h3>📜 UNO-Historie</h3>

          <div id="unoHistoryList" class="uno-history-list">
            <p class="uno-history-empty">
              Noch keine Ergebnisse geladen.
            </p>
          </div>
        </div>
      </div>

      <div id="unoStatsView" class="uno-view">
        <div class="uno-stats-head">
          <div>
            <h3>📊 UNO-Statistik</h3>
            <p class="sub">
              Siege, Platzierungen und gespielte Runden.
            </p>
          </div>
        </div>

        <div id="unoStatsSummary" class="uno-stats-summary"></div>

        <div id="unoStatsRanking" class="uno-stats-ranking">
          <p class="uno-stats-empty">
            Noch keine UNO-Ergebnisse vorhanden.
          </p>
        </div>
      </div>
    </div>
  `;

  const playerGrid = document.getElementById("unoPlayerGrid");
  const guestToggle = document.getElementById("unoGuestToggle");
  const guestForm = document.getElementById("unoGuestForm");
  const guestNameInput = document.getElementById("unoGuestName");
  const guestAddButton = document.getElementById("unoGuestAdd");

  const placementList = document.getElementById("unoPlacementList");
  const saveButton = document.getElementById("unoSaveButton");
  const historyList = document.getElementById("unoHistoryList");

  const statsSummary = document.getElementById("unoStatsSummary");
  const statsRanking = document.getElementById("unoStatsRanking");

  const submenuButtons = unoPanel.querySelectorAll(
    ".uno-submenu-button"
  );

  const gameView = document.getElementById("unoGameView");
  const statsView = document.getElementById("unoStatsView");

  let placements = {};
  let loadedGames = [];

  function getSelectedPlayers() {
    return Array.from(
      playerGrid.querySelectorAll(".uno-player-button.selected")
    ).map((button) => button.textContent.trim());
  }

  function getPlaceIcon(place) {
    if (place === 1) return "🥇";
    if (place === 2) return "🥈";
    if (place === 3) return "🥉";

    return `${place}.`;
  }

 function cleanPlacements() {
  const selectedPlayers = getSelectedPlayers();

  Object.keys(placements).forEach((place) => {
    if (
      placements[place] &&
      !selectedPlayers.includes(placements[place])
    ) {
      placements[place] = null;
    }
  });
}

function renderPlacements() {
  cleanPlacements();

  const selectedPlayers = getSelectedPlayers();

  placementList.innerHTML = `
    <div class="uno-podium">

      <div class="uno-podium-place uno-podium-second">
        <div class="uno-medal">🥈</div>
        <div class="uno-place-title">Platz 2</div>
        <div
          class="uno-placement-grid"
          data-place="2"
        ></div>
      </div>

      <div class="uno-podium-place uno-podium-first">
        <div class="uno-medal">🥇</div>
        <div class="uno-place-title">Gewinner</div>
        <div
          class="uno-placement-grid"
          data-place="1"
        ></div>
      </div>

      <div class="uno-podium-place uno-podium-third">
        <div class="uno-medal">🥉</div>
        <div class="uno-place-title">Platz 3</div>
        <div
          class="uno-placement-grid"
          data-place="3"
        ></div>
      </div>

      <div class="uno-podium-place uno-podium-fourth">
        <div class="uno-medal">4️⃣</div>
        <div class="uno-place-title">Platz 4</div>
        <div
          class="uno-placement-grid"
          data-place="4"
        ></div>
      </div>

    </div>
  `;

  placementList
    .querySelectorAll(".uno-placement-grid")
    .forEach((grid) => {
      const place = Number(grid.dataset.place);

      if (!selectedPlayers.length) {
        grid.innerHTML = `
          <span class="uno-placement-empty">
            Erst Teilnehmer auswählen
          </span>
        `;

        return;
      }

      selectedPlayers.forEach((playerName) => {
        const usedElsewhere = Object.entries(placements).some(
          ([otherPlace, assignedPlayer]) =>
            Number(otherPlace) !== place &&
            assignedPlayer === playerName
        );

        if (usedElsewhere) return;

        const button = document.createElement("button");

        button.type = "button";
        button.className = "uno-placement-button";
        button.textContent = playerName;

        if (placements[place] === playerName) {
          button.classList.add("selected");
        }

        button.addEventListener("click", () => {
          if (placements[place] === playerName) {
            placements[place] = null;
          } else {
            placements[place] = playerName;
          }

          renderPlacements();
        });

        grid.appendChild(button);
      });
    });
}
 
 function connectPlayerButton(button) {
    button.addEventListener("click", () => {
      button.classList.toggle("selected");
      renderPlacements();
    });
  }

  playerGrid
    .querySelectorAll(".uno-player-button")
    .forEach(connectPlayerButton);

  guestToggle.addEventListener("click", () => {
    guestForm.classList.toggle("open");

    if (guestForm.classList.contains("open")) {
      guestNameInput.focus();
    }
  });

  guestAddButton.addEventListener("click", () => {
    const guestName = guestNameInput.value.trim();

    if (!guestName) {
      guestNameInput.focus();
      return;
    }

    const existingPlayer = Array.from(
      playerGrid.querySelectorAll(".uno-player-button")
    ).find(
      (button) =>
        button.textContent.trim().toLowerCase() ===
        guestName.toLowerCase()
    );

    if (existingPlayer) {
      existingPlayer.classList.add("selected");
      guestNameInput.value = "";
      guestForm.classList.remove("open");
      renderPlacements();
      return;
    }

    const guestButton = document.createElement("button");

    guestButton.type = "button";
    guestButton.className = "uno-player-button selected";
    guestButton.textContent = guestName;

    connectPlayerButton(guestButton);
    playerGrid.appendChild(guestButton);

    guestAddButton.classList.add("success");
    guestAddButton.textContent = "✓ Gast übernommen";

    guestNameInput.value = "";
    renderPlacements();

    setTimeout(() => {
      guestAddButton.classList.remove("success");
      guestAddButton.textContent = "Gast übernehmen";
      guestForm.classList.remove("open");
    }, 800);
  });

  guestNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      guestAddButton.click();
    }
  });

  submenuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetView = button.dataset.unoView;

      submenuButtons.forEach((submenuButton) => {
        submenuButton.classList.remove("selected");
      });

      button.classList.add("selected");

      gameView.classList.toggle(
        "active",
        targetView === "game"
      );

      statsView.classList.toggle(
        "active",
        targetView === "stats"
      );

      if (targetView === "stats") {
        renderStatistics();
      }
    });
  });

  async function loadHistory() {
    historyList.innerHTML = `
      <p class="uno-history-empty">
        Lade UNO-Runden...
      </p>
    `;

    const { data, error } = await supabaseClient
      .from("uno_games")
      .select(`
        *,
        uno_results (
          player,
          place
        )
      `)
      .order("game_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("UNO LOAD ERROR:", error);

      historyList.innerHTML = `
        <p class="uno-history-empty">
          ❌ UNO-Ergebnisse konnten nicht geladen werden.
        </p>
      `;

      return;
    }

    loadedGames = data || [];

    renderHistory();
    renderStatistics();
  }

  function renderHistory() {
    if (!loadedGames.length) {
      historyList.innerHTML = `
        <p class="uno-history-empty">
          Noch keine UNO-Runden gespeichert.
        </p>
      `;

      return;
    }

    historyList.innerHTML = loadedGames
      .map((game) => {
        const results = [...(game.uno_results || [])].sort(
          (a, b) => a.place - b.place
        );

        return `
          <div class="uno-history-card">
            <div class="uno-history-head">
              <strong>🃏 UNO-Runde</strong>

              <div class="uno-history-actions">
                <span>
                  📅 ${new Date(
                    game.game_date
                  ).toLocaleDateString("de-DE")}
                </span>

                <button
                  type="button"
                  class="uno-delete-icon"
                  data-game-id="${game.id}"
                  title="UNO-Runde löschen"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div class="uno-history-results">
              ${results
                .map(
                  (result) => `
                    <div class="uno-history-result">
                      <span>
                        ${getPlaceIcon(result.place)}
                      </span>

                      <strong>
                        ${result.player}
                      </strong>
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");
  }

  historyList.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(
      ".uno-delete-icon"
    );

    if (!deleteButton) return;

    const gameId = deleteButton.dataset.gameId;

    const confirmed = confirm(
      "Diese UNO-Runde und alle Platzierungen wirklich löschen?"
    );

    if (!confirmed) return;

    const { error: resultsDeleteError } =
      await supabaseClient
        .from("uno_results")
        .delete()
        .eq("game_id", gameId);

    if (resultsDeleteError) {
      console.error(
        "UNO RESULTS DELETE ERROR:",
        resultsDeleteError
      );

      alert(
        "❌ Die UNO-Platzierungen konnten nicht gelöscht werden."
      );

      return;
    }

    const { error: gameDeleteError } =
      await supabaseClient
        .from("uno_games")
        .delete()
        .eq("id", gameId);

    if (gameDeleteError) {
      console.error(
        "UNO GAME DELETE ERROR:",
        gameDeleteError
      );

      alert(
        "❌ Die UNO-Runde konnte nicht gelöscht werden."
      );

      return;
    }

    await loadHistory();
  });

 function renderStatistics() {
  const playerStatistics = {};

  loadedGames.forEach((game) => {
    const results = [...(game.uno_results || [])].sort(
      (a, b) => Number(a.place) - Number(b.place)
    );

    results.forEach((result) => {
      const player = result.player;
      const place = Number(result.place);

      if (!playerStatistics[player]) {
        playerStatistics[player] = {
          player,
          games: 0,
          wins: 0,
          secondPlaces: 0,
          thirdPlaces: 0,
          fourthPlaces: 0,
          placeTotal: 0,
          recentPlaces: []
        };
      }

      const stats = playerStatistics[player];

      stats.games += 1;
      stats.placeTotal += place;
      stats.recentPlaces.push(place);

      if (place === 1) stats.wins += 1;
      if (place === 2) stats.secondPlaces += 1;
      if (place === 3) stats.thirdPlaces += 1;
      if (place === 4) stats.fourthPlaces += 1;
    });
  });

  const ranking = Object.values(playerStatistics)
    .map((stats) => ({
      ...stats,
      averagePlace:
        stats.games > 0
          ? stats.placeTotal / stats.games
          : 0,
      recentPlaces: stats.recentPlaces.slice(0, 5)
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      if (a.averagePlace !== b.averagePlace) {
        return a.averagePlace - b.averagePlace;
      }

      return b.games - a.games;
    });

  const totalRounds = loadedGames.length;
  const totalPlayers = ranking.length;

  const highestWinCount = ranking.length
    ? Math.max(...ranking.map((stats) => stats.wins))
    : 0;

  const winLeaders = ranking
    .filter(
      (stats) =>
        highestWinCount > 0 &&
        stats.wins === highestWinCount
    )
    .map((stats) => stats.player);

  const mostWins = winLeaders.length
    ? `${winLeaders.join(" & ")} (${highestWinCount})`
    : "–";

  function formatAverage(value) {
    return value.toLocaleString("de-DE", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  }

  function placeIcon(place) {
    if (place === 1) return "🥇";
    if (place === 2) return "🥈";
    if (place === 3) return "🥉";
    return "4️⃣";
  }

  statsSummary.innerHTML = `
    <div class="uno-summary-card">
      <span>🃏 Gespielte Runden</span>
      <strong>${totalRounds}</strong>
    </div>

    <div class="uno-summary-card">
      <span>👥 Spieler</span>
      <strong>${totalPlayers}</strong>
    </div>

    <div class="uno-summary-card">
      <span>🏆 Meiste Siege</span>
      <strong>${mostWins}</strong>
    </div>
  `;

  if (!ranking.length) {
    statsRanking.innerHTML = `
      <p class="uno-stats-empty">
        Noch keine UNO-Ergebnisse vorhanden.
      </p>
    `;

    return;
  }

  statsRanking.innerHTML = `
    <div class="uno-statistics-ranking">
      <h4>👑 Rangliste</h4>

      <div class="uno-ranking-head">
        <span>Spieler</span>
        <span>Runden</span>
        <span>🥇</span>
        <span>🥈</span>
        <span>🥉</span>
        <span>4️⃣</span>
        <span>Ø Platz</span>
      </div>

      ${ranking
        .map(
          (stats, index) => `
            <div class="uno-ranking-row">
              <div class="uno-ranking-player">
                <span class="uno-ranking-position">
                  ${index + 1}.
                </span>

                <strong>${stats.player}</strong>
              </div>

              <span>${stats.games}</span>
              <span>${stats.wins}</span>
              <span>${stats.secondPlaces}</span>
              <span>${stats.thirdPlaces}</span>
              <span>${stats.fourthPlaces}</span>
              <span>${formatAverage(stats.averagePlace)}</span>
            </div>
          `
        )
        .join("")}
    </div>

    <div class="uno-player-card-grid">
      ${ranking
        .map(
          (stats, index) => `
            <article class="uno-player-stat-card">
              <div class="uno-player-card-head">
                <div>
                  <span class="uno-player-card-rank">
                    Platz ${index + 1}
                  </span>

                  <h4>${stats.player}</h4>
                </div>

                <div class="uno-player-card-games">
                  <strong>${stats.games}</strong>
                  <span>Runden</span>
                </div>
              </div>

              <div class="uno-player-medals">
                <div>
                  <span>🥇</span>
                  <strong>${stats.wins}</strong>
                </div>

                <div>
                  <span>🥈</span>
                  <strong>${stats.secondPlaces}</strong>
                </div>

                <div>
                  <span>🥉</span>
                  <strong>${stats.thirdPlaces}</strong>
                </div>

                <div>
                  <span>4️⃣</span>
                  <strong>${stats.fourthPlaces}</strong>
                </div>
              </div>

              <div class="uno-player-card-bottom">
                <div>
                  <span>Ø Platzierung</span>
                  <strong>${formatAverage(stats.averagePlace)}</strong>
                </div>

                <div class="uno-player-form">
                  <span>Letzte Form</span>

                  <div>
                    ${stats.recentPlaces
                      .map(
                        (place) => `
                          <span
                            class="uno-form-place uno-form-place-${place}"
                            title="Platz ${place}"
                          >
                            ${placeIcon(place)}
                          </span>
                        `
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}
  saveButton.addEventListener("click", async () => {
    const selectedPlayers = getSelectedPlayers();

    if (selectedPlayers.length < 2) {
      alert(
        "Bitte mindestens zwei Teilnehmer auswählen."
      );

      return;
    }

    const assignedPlayers = Object.values(placements);

    if (assignedPlayers.length !== selectedPlayers.length) {
      alert(
        "Bitte jedem Teilnehmer einen Platz zuweisen."
      );

      return;
    }

    const missingPlace = selectedPlayers.findIndex(
      (_, index) => !placements[index + 1]
    );

    if (missingPlace >= 0) {
      alert(
        `Bitte Platz ${missingPlace + 1} vergeben.`
      );

      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Speichert...";

    const gameDate = new Date()
      .toISOString()
      .split("T")[0];

    const { data: gameData, error: gameError } =
      await supabaseClient
        .from("uno_games")
        .insert({
          game_date: gameDate
        })
        .select()
        .single();

    if (gameError) {
      console.error("UNO GAME INSERT ERROR:", gameError);

      alert(
        "❌ Die UNO-Runde konnte nicht gespeichert werden."
      );

      saveButton.disabled = false;
      saveButton.textContent = "💾 UNO-Runde speichern";

      return;
    }

    const resultRows = Object.entries(placements)
      .sort(
        ([placeA], [placeB]) =>
          Number(placeA) - Number(placeB)
      )
      .map(([place, player]) => ({
        game_id: gameData.id,
        player,
        place: Number(place)
      }));

    const { error: resultsError } =
      await supabaseClient
        .from("uno_results")
        .insert(resultRows);

    if (resultsError) {
      console.error(
        "UNO RESULTS INSERT ERROR:",
        resultsError
      );

      await supabaseClient
        .from("uno_games")
        .delete()
        .eq("id", gameData.id);

      alert(
        "❌ Die UNO-Platzierungen konnten nicht gespeichert werden."
      );

      saveButton.disabled = false;
      saveButton.textContent = "💾 UNO-Runde speichern";

      return;
    }

    playerGrid
      .querySelectorAll(".uno-player-button")
      .forEach((button) => {
        button.classList.remove("selected");
      });

    placements = {};

    renderPlacements();
    await loadHistory();

    saveButton.classList.add("success");
    saveButton.textContent = "✓ UNO-Runde gespeichert";

    setTimeout(() => {
      saveButton.disabled = false;
      saveButton.classList.remove("success");
      saveButton.textContent = "💾 UNO-Runde speichern";
    }, 1200);
  });

  renderPlacements();
  loadHistory();
}

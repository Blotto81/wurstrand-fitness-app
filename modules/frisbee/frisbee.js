const frisbeePanel = document.getElementById("frisbeePanel");

if (frisbeePanel) {
  frisbeePanel.innerHTML = `
    <div class="overlay frisbee-page">
      <div class="badge">Game Lounge</div>

      <div class="challenge-row">
        <div>
          <h2>🥏 Discgolf</h2>
          <p class="sub">
            Runde starten, Würfe eintragen und den Zwischenstand live verfolgen.
          </p>
        </div>
      </div>

      <div class="frisbee-submenu">
        <button
          type="button"
          class="frisbee-submenu-button selected"
          data-frisbee-view="game"
        >
          🥏 Neue Runde
        </button>

        <button
          type="button"
          class="frisbee-submenu-button"
          data-frisbee-view="stats"
        >
          📊 Statistik
        </button>
      </div>

      <div id="frisbeeGameView" class="frisbee-view active">
        <div class="frisbee-section">
          <h3>👥 Teilnehmer</h3>

          <div id="frisbeePlayerGrid" class="frisbee-player-grid">
            <button
              type="button"
              class="frisbee-player-button"
            >
              Thorsten
            </button>

            <button
              type="button"
              class="frisbee-player-button"
            >
              Basti
            </button>

            <button
              type="button"
              class="frisbee-player-button"
            >
              Marian
            </button>

            <button
              type="button"
              class="frisbee-player-button"
            >
              Fabi
            </button>
          </div>

          <button
            type="button"
            id="frisbeeGuestToggle"
            class="frisbee-guest-toggle"
          >
            ➕ Gast hinzufügen
          </button>

          <div id="frisbeeGuestForm" class="frisbee-guest-form">
            <label for="frisbeeGuestName">
              Name des Gastes
            </label>

            <input
              type="text"
              id="frisbeeGuestName"
              placeholder="z. B. Anja"
              autocomplete="off"
            >

            <button
              type="button"
              id="frisbeeGuestAdd"
              class="frisbee-guest-add"
            >
              Gast übernehmen
            </button>
          </div>
        </div>

        <div class="frisbee-section frisbee-round-settings">
          <h3>🧺 Runde festlegen</h3>

        <label>
  Anzahl der Bahnen
</label>

<div class="frisbee-hole-counter">
  <button
    type="button"
    id="frisbeeHoleMinus"
    class="frisbee-hole-counter-button"
    aria-label="Eine Bahn weniger"
  >
    ➖
  </button>

  <div
    id="frisbeeHoleCount"
    class="frisbee-hole-count"
    aria-live="polite"
  >
    1
  </div>

  <button
    type="button"
    id="frisbeeHolePlus"
    class="frisbee-hole-counter-button"
    aria-label="Eine Bahn mehr"
  >
    ➕
  </button>
</div>

          <button
            type="button"
            id="frisbeeCreateScorecard"
            class="frisbee-create-button"
          >
            🥏 Scorekarte erstellen
          </button>
        </div>

        <div
          id="frisbeeScorecardSection"
          class="frisbee-scorecard-section"
        >
          <div class="frisbee-scorecard">
            <div class="frisbee-scorecard-head">
              <div>
                <span class="frisbee-scorecard-label">
                  WRC
                </span>

                <h3>🥏 Discgolf-Scorekarte</h3>
              </div>

              <div class="frisbee-scorecard-info">
                <span id="frisbeeScorecardDate">
                  📅 –
                </span>

                <span id="frisbeeScorecardHoles">
                  🧺 –
                </span>
              </div>
            </div>

            <div
              id="frisbeeScorecardTableWrapper"
              class="frisbee-scorecard-table-wrapper"
            >
              <div class="frisbee-scorecard-empty">
                Wähle mindestens zwei Teilnehmer und erstelle anschließend
                die Scorekarte.
              </div>
            </div>
          </div>
        </div>

        <div
          id="frisbeeResultSection"
          class="frisbee-section frisbee-result-section"
        >
          <div class="frisbee-result-head">
            <div>
              <h3 id="frisbeeResultTitle">
                🏁 Zwischenstand
              </h3>

              <p id="frisbeeResultHint" class="sub">
                Der Zwischenstand aktualisiert sich automatisch nach jeder
                Eingabe.
              </p>
            </div>
          </div>

          <div
            id="frisbeePodium"
            class="frisbee-podium"
          >
            <div class="frisbee-podium-empty">
              Noch keine Scorekarte erstellt.
            </div>
          </div>
        </div>

        <div class="frisbee-save-section">
          <button
            type="button"
            id="frisbeeSaveButton"
            class="frisbee-save-button"
            disabled
          >
            💾 Discgolf-Runde speichern
          </button>
        </div>

        <div class="frisbee-history-section">
          <h3>📜 Discgolf-Historie</h3>

          <div
            id="frisbeeHistoryList"
            class="frisbee-history-list"
          >
            <p class="frisbee-history-empty">
              Noch keine Ergebnisse geladen.
            </p>
          </div>
        </div>
      </div>

      <div id="frisbeeStatsView" class="frisbee-view">
        <div class="frisbee-stats-head">
          <div>
            <h3>📊 Discgolf-Statistik</h3>

            <p class="sub">
              Runden, Platzierungen und persönliche Bestwerte.
            </p>
          </div>
        </div>

        <div
          id="frisbeeStatsSummary"
          class="frisbee-stats-summary"
        ></div>

        <div
          id="frisbeeStatsRanking"
          class="frisbee-stats-ranking"
        >
          <p class="frisbee-stats-empty">
            Noch keine Discgolf-Ergebnisse vorhanden.
          </p>
        </div>
      </div>
    </div>
  `;

   const playerGrid = document.getElementById(
    "frisbeePlayerGrid"
  );

  const guestToggle = document.getElementById(
    "frisbeeGuestToggle"
  );

  const guestForm = document.getElementById(
    "frisbeeGuestForm"
  );

  const guestNameInput = document.getElementById(
    "frisbeeGuestName"
  );

  const guestAddButton = document.getElementById(
    "frisbeeGuestAdd"
  );

 const holeCountDisplay = document.getElementById(
  "frisbeeHoleCount"
);

const holeMinusButton = document.getElementById(
  "frisbeeHoleMinus"
);

const holePlusButton = document.getElementById(
  "frisbeeHolePlus"
);

let selectedHoleCount = 1;

  const createScorecardButton = document.getElementById(
    "frisbeeCreateScorecard"
  );

  const scorecardTableWrapper = document.getElementById(
    "frisbeeScorecardTableWrapper"
  );

  const scorecardDate = document.getElementById(
    "frisbeeScorecardDate"
  );

  const scorecardHoles = document.getElementById(
    "frisbeeScorecardHoles"
  );

  const resultTitle = document.getElementById(
    "frisbeeResultTitle"
  );

  const resultHint = document.getElementById(
    "frisbeeResultHint"
  );

  const podium = document.getElementById(
    "frisbeePodium"
  );

  const saveButton = document.getElementById(
    "frisbeeSaveButton"
  );
const historyList = document.getElementById(
  "frisbeeHistoryList"
);
  const submenuButtons = frisbeePanel.querySelectorAll(
    ".frisbee-submenu-button"
  );

  const gameView = document.getElementById(
    "frisbeeGameView"
  );

  const statsView = document.getElementById(
    "frisbeeStatsView"
  );

  let activePlayers = [];
  let activeHoleCount = 0;

  function getSelectedPlayers() {
    return Array.from(
      playerGrid.querySelectorAll(
        ".frisbee-player-button.selected"
      )
    ).map((button) => button.textContent.trim());
  }

  function connectPlayerButton(button) {
    button.addEventListener("click", () => {
      button.classList.toggle("selected");
    });
  }

  playerGrid
    .querySelectorAll(".frisbee-player-button")
    .forEach(connectPlayerButton);

  guestToggle.addEventListener("click", () => {
    guestForm.classList.toggle("open");

    if (guestForm.classList.contains("open")) {
      guestNameInput.focus();
    }
  });

  function addGuest() {
    const guestName = guestNameInput.value.trim();

    if (!guestName) {
      guestNameInput.focus();
      return;
    }

    const existingButton = Array.from(
      playerGrid.querySelectorAll(
        ".frisbee-player-button"
      )
    ).find(
      (button) =>
        button.textContent.trim().toLowerCase() ===
        guestName.toLowerCase()
    );

    if (existingButton) {
      existingButton.classList.add("selected");
      guestNameInput.value = "";
      guestForm.classList.remove("open");
      return;
    }

    const guestButton = document.createElement("button");

    guestButton.type = "button";
    guestButton.className =
      "frisbee-player-button selected";

    guestButton.textContent = guestName;

    connectPlayerButton(guestButton);
    playerGrid.appendChild(guestButton);

    guestNameInput.value = "";

    guestAddButton.classList.add("success");
    guestAddButton.textContent = "✓ Gast übernommen";

    setTimeout(() => {
      guestAddButton.classList.remove("success");
      guestAddButton.textContent = "Gast übernehmen";
      guestForm.classList.remove("open");
    }, 800);
  }

  guestAddButton.addEventListener("click", addGuest);

  guestNameInput.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter") {
        addGuest();
      }
    }
  );

  function getScoreInputs() {
    return Array.from(
      scorecardTableWrapper.querySelectorAll(
        ".frisbee-score-input"
      )
    );
  }

  function getPlayerTotals() {
  return activePlayers.map((player, playerIndex) => {
    const playerInputs = getScoreInputs().filter(
      (input) =>
        Number(input.dataset.playerIndex) === playerIndex
    );

    const enteredScores = playerInputs
      .map((input) => input.value.trim())
      .filter((value) => value !== "")
      .map(Number);

    return {
      player,
      playerIndex,
      total: enteredScores.reduce(
        (sum, score) => sum + score,
        0
      ),
      enteredCount: enteredScores.length
    };
  });
}

  function getPlaceIcon(place) {
    if (place === 1) return "🥇";
    if (place === 2) return "🥈";
    if (place === 3) return "🥉";
    if (place === 4) return "4️⃣";

    return `${place}.`;
  }

  function calculatePlacements(playerTotals) {
    const sortedPlayers = [...playerTotals]
      .filter((result) => result.enteredCount > 0)
      .sort((a, b) => {
        if (a.total !== b.total) {
          return a.total - b.total;
        }

        return a.player.localeCompare(
          b.player,
          "de"
        );
      });

    let previousTotal = null;
    let previousPlace = 0;

    return sortedPlayers.map((result, index) => {
      let place = index + 1;

      if (
        previousTotal !== null &&
        result.total === previousTotal
      ) {
        place = previousPlace;
      }

      previousTotal = result.total;
      previousPlace = place;

      return {
        ...result,
        place
      };
    });
  }

  function updateScorecard() {
    const totals = getPlayerTotals();

    totals.forEach((result) => {
 const totalCell =
  scorecardTableWrapper.querySelector(
    `[data-total-player-index="${result.playerIndex}"]`
  );

      if (totalCell) {
        totalCell.textContent = result.total;
      }
    });

    const allInputs = getScoreInputs();

    const completed =
      allInputs.length > 0 &&
      allInputs.every(
        (input) => input.value.trim() !== ""
      );

    resultTitle.textContent = completed
      ? "🏁 Endergebnis"
      : "🏁 Zwischenstand";

    resultHint.textContent = completed
      ? "Alle Würfe sind eingetragen."
      : "Der Zwischenstand aktualisiert sich nach jeder Eingabe.";

    const placements = calculatePlacements(totals);

    if (!placements.length) {
      podium.innerHTML = `
        <div class="frisbee-podium-empty">
          Trage die ersten Würfe ein.
        </div>
      `;

      saveButton.disabled = true;
      return;
    }

    podium.innerHTML = placements
      .map(
        (result) => `
          <div class="frisbee-podium-row">
            <div class="frisbee-podium-place">
              ${getPlaceIcon(result.place)}
            </div>

            <div class="frisbee-podium-name">
              ${result.player}
            </div>

            <div class="frisbee-podium-score">
              ${result.total} Würfe
            </div>
          </div>
        `
      )
      .join("");

    saveButton.disabled = !completed;
  }
function focusNextScoreInput(currentInput) {
  const inputs = getScoreInputs();
  const currentIndex = inputs.indexOf(currentInput);
  const nextInput = inputs[currentIndex + 1];

  if (nextInput) {
    nextInput.focus();
    nextInput.select();
  } else {
    currentInput.blur();
  }
}
  function createScorecard() {
    const selectedPlayers = getSelectedPlayers();

    if (selectedPlayers.length < 2) {
      alert(
        "Bitte mindestens zwei Teilnehmer auswählen."
      );

      return;
    }

    activePlayers = selectedPlayers;
   activeHoleCount = selectedHoleCount;

    const today = new Date();

    scorecardDate.textContent =
      `📅 ${today.toLocaleDateString("de-DE")}`;

    scorecardHoles.textContent =
      `🧺 ${activeHoleCount} ${
        activeHoleCount === 1 ? "Bahn" : "Bahnen"
      }`;

    const headerCells = activePlayers
      .map(
        (player) => `
          <th scope="col">
            ${player}
          </th>
        `
      )
      .join("");

    const scoreRows = Array.from(
      { length: activeHoleCount },
      (_, index) => {
        const holeNumber = index + 1;

        const playerCells = activePlayers
.map(
  (player, playerIndex) => `
              <td>
                <input
                  type="number"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  min="1"
                  max="99"
                  step="1"
                  class="frisbee-score-input"
                  data-player-index="${playerIndex}"
                  data-hole="${holeNumber}"
                  aria-label="${player}, Bahn ${holeNumber}"
                >
              </td>
            `
          )
          .join("");

        return `
          <tr>
            <td>${holeNumber}</td>
            ${playerCells}
          </tr>
        `;
      }
    ).join("");

    const totalCells = activePlayers
  .map(
    (_, playerIndex) => `
      <td
        data-total-player-index="${playerIndex}"
      >
        0
      </td>
    `
  )
  .join("");

    scorecardTableWrapper.innerHTML = `
      <table class="frisbee-scorecard-table">
        <thead>
          <tr>
            <th scope="col">Bahn</th>
            ${headerCells}
          </tr>
        </thead>

        <tbody>
          ${scoreRows}

          <tr class="frisbee-total-row">
            <td>Gesamt</td>
            ${totalCells}
          </tr>
        </tbody>
      </table>
    `;

    getScoreInputs().forEach((input) => {
      input.addEventListener("input", () => {
        if (input.value !== "") {
          const value = Number(input.value);

          if (value < 1) input.value = 1;
          if (value > 99) input.value = 99;
        }

        updateScorecard();
        if (input.value.trim() !== "") {
  focusNextScoreInput(input);
}
      });

      input.addEventListener("focus", () => {
        input.select();
      });
    });

    podium.innerHTML = `
      <div class="frisbee-podium-empty">
        Trage die ersten Würfe ein.
      </div>
    `;

    resultTitle.textContent = "🏁 Zwischenstand";

    resultHint.textContent =
      "Der Zwischenstand aktualisiert sich nach jeder Eingabe.";

    saveButton.disabled = true;

    setTimeout(() => {
      const firstInput =
        scorecardTableWrapper.querySelector(
          ".frisbee-score-input"
        );

      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }
function updateHoleCounter() {
  holeCountDisplay.textContent = selectedHoleCount;

  holeMinusButton.disabled = selectedHoleCount <= 1;
  holePlusButton.disabled = selectedHoleCount >= 18;
}

holeMinusButton.addEventListener("click", () => {
  if (selectedHoleCount > 1) {
    selectedHoleCount--;
    updateHoleCounter();
  }
});

holePlusButton.addEventListener("click", () => {
  if (selectedHoleCount < 18) {
    selectedHoleCount++;
    updateHoleCounter();
  }
});

updateHoleCounter();
  createScorecardButton.addEventListener(
    "click",
    createScorecard
  );

  submenuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetView =
        button.dataset.frisbeeView;

      submenuButtons.forEach(
        (submenuButton) => {
          submenuButton.classList.remove("selected");
        }
      );

      button.classList.add("selected");

      gameView.classList.toggle(
        "active",
        targetView === "game"
      );

      statsView.classList.toggle(
        "active",
        targetView === "stats"
      );
    });
  });
async function loadDiscgolfHistory() {
  const statsSummary = document.getElementById("frisbeeStatsSummary");
  const statsRanking = document.getElementById("frisbeeStatsRanking");

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  historyList.innerHTML = `
    <p class="frisbee-history-empty">
      Historie wird geladen ...
    </p>
  `;

  if (statsSummary) {
    statsSummary.innerHTML = `
      <p class="frisbee-stats-empty">
        Statistik wird geladen ...
      </p>
    `;
  }

  if (statsRanking) {
    statsRanking.innerHTML = `
      <p class="frisbee-stats-empty">
        Statistik wird geladen ...
      </p>
    `;
  }

  try {
    const { data: rounds, error } = await supabaseClient
      .from("discgolf_rounds")
      .select(`
        id,
        played_date,
        hole_count,
        discgolf_scores (
          player,
          hole_number,
          throws
        )
      `)
      .order("played_date", { ascending: false });

    if (error) {
      throw error;
    }

    if (!rounds || rounds.length === 0) {
      historyList.innerHTML = `
        <p class="frisbee-history-empty">
          Noch keine Discgolf-Runden vorhanden.
        </p>
      `;

      if (statsSummary) {
        statsSummary.innerHTML = `
          <p class="frisbee-stats-empty">
            Noch keine Statistik vorhanden.
          </p>
        `;
      }

      if (statsRanking) {
        statsRanking.innerHTML = `
          <p class="frisbee-stats-empty">
            Noch keine Statistik vorhanden.
          </p>
        `;
      }

      return;
    }
        const preparedRounds = rounds.map((round) => {
      const playerMap = new Map();

      (round.discgolf_scores || []).forEach((score) => {
        if (!playerMap.has(score.player)) {
          playerMap.set(score.player, {
            player: score.player,
            total: 0
          });
        }

        playerMap.get(score.player).total += Number(score.throws) || 0;
      });

      const results = Array.from(playerMap.values()).sort(
        (a, b) => a.total - b.total
      );

      let previousTotal = null;
      let previousPlace = 0;

      const placements = results.map((result, index) => {
        let place = index + 1;

        if (
          previousTotal !== null &&
          result.total === previousTotal
        ) {
          place = previousPlace;
        }

        previousTotal = result.total;
        previousPlace = place;

        return {
          ...result,
          place
        };
      });

      return {
        ...round,
        placements
      };
    });

    historyList.innerHTML = preparedRounds
      .map((round) => {
        const date = new Date(
          `${round.played_date}T12:00:00`
        ).toLocaleDateString("de-DE");

        const resultRows = round.placements
          .map(
            (result) => `
              <div class="frisbee-history-result">
                <span>
                  ${getPlaceIcon(result.place)}
                  ${escapeHtml(result.player)}
                </span>

                <strong>
                  ${result.total} Würfe
                </strong>
              </div>
            `
          )
          .join("");

        return `
          <article class="frisbee-history-card">
            <div class="frisbee-history-card-head">
              <div>
                <strong>📅 ${date}</strong>

                <span>
                  🧺 ${round.hole_count}
                  ${round.hole_count === 1 ? "Bahn" : "Bahnen"}
                </span>
              </div>

              <button
                type="button"
                class="frisbee-history-delete"
                data-round-id="${round.id}"
                aria-label="Discgolf-Runde löschen"
              >
                🗑️
              </button>
            </div>

            <div class="frisbee-history-results">
              ${resultRows}
            </div>
          </article>
        `;
      })
      .join("");

    const statisticsMap = new Map();

    preparedRounds.forEach((round) => {
      round.placements.forEach((result) => {
        if (!statisticsMap.has(result.player)) {
          statisticsMap.set(result.player, {
            player: result.player,
            rounds: 0,
            wins: 0,
            secondPlaces: 0,
            thirdPlaces: 0,
            totalThrows: 0,
            totalHoles: 0,
            bestRoundTotal: null,
            bestRoundHoles: null
          });
        }

        const stats = statisticsMap.get(result.player);

        stats.rounds += 1;
        stats.totalThrows += result.total;
        stats.totalHoles += Number(round.hole_count) || 0;

        if (result.place === 1) stats.wins += 1;
        if (result.place === 2) stats.secondPlaces += 1;
        if (result.place === 3) stats.thirdPlaces += 1;

        if (
          stats.bestRoundTotal === null ||
          result.total < stats.bestRoundTotal
        ) {
          stats.bestRoundTotal = result.total;
          stats.bestRoundHoles = round.hole_count;
        }
      });
    });

    const ranking = Array.from(statisticsMap.values())
      .map((stats) => ({
        ...stats,
        averagePerHole:
          stats.totalHoles > 0
            ? stats.totalThrows / stats.totalHoles
            : 0
      }))
      .sort((a, b) => {
        if (b.wins !== a.wins) {
          return b.wins - a.wins;
        }

        if (b.secondPlaces !== a.secondPlaces) {
          return b.secondPlaces - a.secondPlaces;
        }

        if (b.thirdPlaces !== a.thirdPlaces) {
          return b.thirdPlaces - a.thirdPlaces;
        }

        return a.averagePerHole - b.averagePerHole;
      });

    const totalThrows = ranking.reduce(
      (sum, stats) => sum + stats.totalThrows,
      0
    );

    const totalPlayers = ranking.length;

    if (statsSummary) {
      statsSummary.innerHTML = `
        <div class="frisbee-stats-summary-card">
          <strong>${rounds.length}</strong>
          <span>gespielte Runden</span>
        </div>

        <div class="frisbee-stats-summary-card">
          <strong>${totalPlayers}</strong>
          <span>Teilnehmer</span>
        </div>

        <div class="frisbee-stats-summary-card">
          <strong>${totalThrows}</strong>
          <span>Würfe insgesamt</span>
        </div>
      `;
    }

    if (statsRanking) {
      statsRanking.innerHTML = `
        <div class="uno-statistics-ranking">
          <h4>👑 Rangliste</h4>

          <div class="uno-ranking-head">
            <span>Spieler</span>
            <span>Runden</span>
            <span>🥇</span>
            <span>🥈</span>
            <span>🥉</span>
            <span>🥏 Würfe</span>
            <span>Ø / Bahn</span>
          </div>

          ${ranking
            .map(
              (stats, index) => `
                <div class="uno-ranking-row">
                  <div class="uno-ranking-player">
                    <span class="uno-ranking-position">
                      ${index + 1}.
                    </span>

                    <strong>
                      ${escapeHtml(stats.player)}
                    </strong>
                  </div>

                  <span>${stats.rounds}</span>
                  <span>${stats.wins}</span>
                  <span>${stats.secondPlaces}</span>
                  <span>${stats.thirdPlaces}</span>
                  <span>${stats.totalThrows}</span>
                  <span>${stats.averagePerHole.toFixed(2)}</span>
                </div>
              `
            )
            .join("")}
        </div>

        <div class="uno-player-card-grid">
          ${ranking
            .map((stats, index) => {
              const bestRound =
                stats.bestRoundTotal !== null
                  ? `${stats.bestRoundTotal} Würfe / ${stats.bestRoundHoles} Bahnen`
                  : "–";

              return `
                <article class="uno-player-stat-card">
                  <div class="uno-player-card-head">
                    <div>
                      <span class="uno-player-card-rank">
                        Platz ${index + 1}
                      </span>

                      <h4>
                        ${escapeHtml(stats.player)}
                      </h4>
                    </div>

                    <div class="uno-player-card-games">
                      <strong>${stats.rounds}</strong>

                      <span>
                        ${stats.rounds === 1 ? "Runde" : "Runden"}
                      </span>
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
                      <span>🥏</span>
                      <strong>${stats.totalThrows}</strong>
                    </div>
                  </div>

                  <div class="uno-player-card-bottom">
                    <div>
                      <span>Ø Würfe pro Bahn</span>

                      <strong>
                        ${stats.averagePerHole.toFixed(2)}
                      </strong>
                    </div>

                    <div class="uno-player-form">
                      <span>Beste Runde</span>

                      <strong>
                        ${bestRound}
                      </strong>
                    </div>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      `;
    }

    historyList
      .querySelectorAll(".frisbee-history-delete")
      .forEach((deleteButton) => {
        deleteButton.addEventListener(
          "click",
          async () => {
            const roundId = deleteButton.dataset.roundId;

            const confirmed = confirm(
              "Diese Discgolf-Runde wirklich löschen?"
            );

            if (!confirmed) {
              return;
            }

            deleteButton.disabled = true;
            deleteButton.textContent = "⏳";

            const { error: deleteError } =
              await supabaseClient
                .from("discgolf_rounds")
                .delete()
                .eq("id", roundId);

            if (deleteError) {
              console.error(deleteError);

              alert(
                "Die Discgolf-Runde konnte nicht gelöscht werden."
              );

              deleteButton.disabled = false;
              deleteButton.textContent = "🗑️";
              return;
            }

            await loadDiscgolfHistory();
          }
        );
      });
  } catch (error) {
    console.error(
      "Discgolf-Daten konnten nicht geladen werden:",
      error
    );

    historyList.innerHTML = `
      <p class="frisbee-history-empty">
        Historie konnte nicht geladen werden.
      </p>
    `;

    if (statsSummary) {
      statsSummary.innerHTML = `
        <p class="frisbee-stats-empty">
          Statistik konnte nicht geladen werden.
        </p>
      `;
    }

    if (statsRanking) {
      statsRanking.innerHTML = "";
    }
  }
}
saveButton.addEventListener("click", async () => {
  const originalText = saveButton.textContent;

  saveButton.disabled = true;
  saveButton.textContent = "⏳ Runde wird gespeichert ...";

  try {
    const { data: roundData, error: roundError } =
      await supabaseClient
        .from("discgolf_rounds")
        .insert({
          played_date: new Date()
            .toISOString()
            .slice(0, 10),
          hole_count: activeHoleCount
        })
        .select("id")
        .single();

    if (roundError) {
      throw roundError;
    }

    const scoreRows = getScoreInputs().map((input) => ({
      round_id: roundData.id,
      player:
        activePlayers[
          Number(input.dataset.playerIndex)
        ],
      hole_number: Number(input.dataset.hole),
      throws: Number(input.value)
    }));

    const { error: scoresError } =
      await supabaseClient
        .from("discgolf_scores")
        .insert(scoreRows);

    if (scoresError) {
      throw scoresError;
    }

    saveButton.textContent = "✅ Runde gespeichert";
    await loadDiscgolfHistory();
    

    alert("Die Discgolf-Runde wurde gespeichert.");
  } catch (error) {
    console.error(
      "Discgolf-Runde konnte nicht gespeichert werden:",
      error
    );

    alert(
      "Die Runde konnte nicht gespeichert werden. Bitte prüfe die Browserkonsole."
    );

    saveButton.disabled = false;
    saveButton.textContent = originalText;
  }
});
loadDiscgolfHistory();
}
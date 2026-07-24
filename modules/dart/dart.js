const dartPanel = document.getElementById("dartPanel");

if (dartPanel) {
  dartPanel.innerHTML = `
    <div class="overlay">
      <div class="badge">Game Lounge</div>

      <div class="challenge-row">
        <div>
          <h2>🎯 Dart</h2>
          <p class="sub">Neues Dart-Ergebnis eintragen.</p>
        </div>
      </div>

      <div class="frisbee-submenu">
        <button
          type="button"
          id="dartGameTab"
          class="frisbee-submenu-button selected"
        >
          🎯 Neue Runde
        </button>

        <button
          type="button"
          id="dartStatsTab"
          class="frisbee-submenu-button"
        >
          📊 Statistik
        </button>
      </div>
<div id="dartGameView" class="active">
      <div class="dart-section">
        <h3>👥 Teilnehmer</h3>

        <div id="dartPlayerGrid" class="dart-player-grid">
          <button type="button" class="dart-player-button">Thorsten</button>
          <button type="button" class="dart-player-button">Basti</button>
          <button type="button" class="dart-player-button">Marian</button>
          <button type="button" class="dart-player-button">Fabi</button>
        </div>

        <button type="button" id="dartGuestToggle" class="dart-guest-toggle">
          ➕ Gast hinzufügen
        </button>

        <div id="dartGuestForm" class="dart-guest-form">
          <label for="dartGuestName">Name des Gastes</label>

          <input
            type="text"
            id="dartGuestName"
            placeholder="z. B. Paul"
            autocomplete="off"
          >

          <button type="button" id="dartGuestAdd" class="dart-guest-add">
            Gast übernehmen
          </button>
        </div>
      </div>
<div class="dart-section">
    <h3>🎮 Spielmodus</h3>

    <div id="dartGameMode" class="dart-mode-grid">

        <button type="button" class="dart-mode-button" data-mode="301">
            301
        </button>

        <button type="button" class="dart-mode-button" data-mode="501">
            501
        </button>

        <button type="button" class="dart-mode-button" data-mode="Cricket">
            Cricket
        </button>

        <button type="button" class="dart-mode-button" data-mode="Round the Clock">
            Round the Clock
        </button>

        <button type="button" class="dart-mode-button" data-mode="Sonstiges">
            Sonstiges…
        </button>

    </div>

    <div id="dartOtherMode" class="dart-other-mode">

        <label for="dartOtherModeInput">
            Spielmodus
        </label>

        <input
            id="dartOtherModeInput"
            type="text"
            placeholder="z. B. Killer"
        >

    </div>

</div>
      <div class="dart-section dart-result-section">
        <h3>🏆 Ergebnis</h3>

        <p class="dart-result-hint">
          Die Platzierungen können auch teilweise leer bleiben.
        </p>

        <div class="dart-podium">

          <div class="dart-podium-place dart-podium-second">
            <div class="dart-medal">🥈</div>
            <div class="dart-place-title">Platz 2</div>

            <div
              id="dartSecondGrid"
              class="dart-placement-grid"
              data-place="2"
            ></div>
          </div>

          <div class="dart-podium-place dart-podium-first">
            <div class="dart-medal">🥇</div>
            <div class="dart-place-title">Gewinner</div>

            <div
              id="dartWinnerGrid"
              class="dart-placement-grid"
              data-place="1"
            ></div>
          </div>

          <div class="dart-podium-place dart-podium-third">
            <div class="dart-medal">🥉</div>
            <div class="dart-place-title">Platz 3</div>

            <div
              id="dartThirdGrid"
              class="dart-placement-grid"
              data-place="3"
            ></div>
          </div>

          <div class="dart-podium-place dart-podium-fourth">
            <div class="dart-medal">4️⃣</div>
            <div class="dart-place-title">Platz 4</div>

            <div
              id="dartFourthGrid"
              class="dart-placement-grid"
              data-place="4"
            ></div>
          </div>

        </div>
      </div>
      <div class="dart-save-section">

    <button
        type="button"
        id="dartSaveButton"
        class="dart-save-button">

        💾 Ergebnis speichern

    </button>

</div>
<div class="dart-history-section">

    <h3>📜 Dart-Historie</h3>

    <div id="dartHistoryList" class="dart-history-list">
        <p class="dart-history-empty">
            Noch keine Ergebnisse geladen.
        </p>
    </div>

      </div>
 </div>
<div id="dartStatsView">

  <div id="dartStatsContent">
    <p class="dart-history-empty">
      Statistik wird geladen...
    </p>
  </div>

</div>
     

    </div>
`;

  const playerGrid = document.getElementById("dartPlayerGrid");

  const guestToggle = document.getElementById("dartGuestToggle");
  const guestForm = document.getElementById("dartGuestForm");
  const guestNameInput = document.getElementById("dartGuestName");
  const guestAddButton = document.getElementById("dartGuestAdd");
  async function loadHistory() {

    dartHistoryList.innerHTML = "<p>Lade...</p>";

    const { data, error } = await supabaseClient
        .from("dart_games")
.select(`
    *,
    dart_results (
        player,
        place
    )
`)
        .order("game_date", { ascending: false });
        console.log("Dart-Historie aus Supabase:", data, error);
    if (error) {
        console.error(error);
        dartHistoryList.innerHTML = "<p>❌ Fehler beim Laden.</p>";
        return;
    }

    dartHistoryList.innerHTML = data
        .map(game => `
       <div class="dart-history-card">
  <strong>
    🎯 ${escapeHtml(game.mode)}
 <span style="float:right;">
    📅 ${new Date(game.game_date).toLocaleDateString("de-DE")}
    <button class="dart-delete-icon" data-game-id="${game.id}" title="Spiel löschen">🗑️</button>
</span>
</strong>

    ${(game.dart_results || [])
        .sort((a, b) => a.place - b.place)
        .map(result => `
            <div>
         ${
    result.place === 1 ? "🥇" :
    result.place === 2 ? "🥈" :
    result.place === 3 ? "🥉" :
    "4️⃣"
} ${escapeHtml(result.player)}
            </div>
        `)
        .join("")}
</div>
        `)
        .join("");

}
  const saveButton = document.getElementById("dartSaveButton");
const dartHistoryList = document.getElementById("dartHistoryList");
loadHistory();
dartHistoryList.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(".dart-delete-icon");

    if (!deleteButton) return;

    const gameId = deleteButton.dataset.gameId;

    const confirmed = confirm(
        "Dieses Spiel und alle Platzierungen wirklich löschen?"
    );

    if (!confirmed) return;
const { error: resultsDeleteError } = await supabaseClient
    .from("dart_results")
    .delete()
    .eq("game_id", gameId);

if (resultsDeleteError) {
    console.error("RESULTS DELETE ERROR:", resultsDeleteError);
    alert("❌ Platzierungen konnten nicht gelöscht werden.");
    return;
}
    const { error } = await supabaseClient
        .from("dart_games")
        .delete()
        .eq("id", gameId);

    if (error) {
        console.error(error);
        console.error("DELETE ERROR:", error);
        return;
    }

    loadHistory();
});
  const placementGrids = {
    1: document.getElementById("dartWinnerGrid"),
    2: document.getElementById("dartSecondGrid"),
    3: document.getElementById("dartThirdGrid"),
    4: document.getElementById("dartFourthGrid")
  };

  const placements = {
    1: null,
    2: null,
    3: null,
    4: null
  };

  function getSelectedPlayers() {
    return Array.from(
      playerGrid.querySelectorAll(".dart-player-button.selected")
    ).map((button) => button.textContent.trim());
  }

  function clearInvalidPlacements() {
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
    clearInvalidPlacements();

    const selectedPlayers = getSelectedPlayers();

    Object.entries(placementGrids).forEach(([place, grid]) => {
      grid.innerHTML = "";

      selectedPlayers.forEach((playerName) => {
        const usedElsewhere = Object.entries(placements).some(
          ([otherPlace, assignedPlayer]) =>
            otherPlace !== place && assignedPlayer === playerName
        );

        if (usedElsewhere) {
          return;
        }

        const button = document.createElement("button");

        button.type = "button";
        button.className = "dart-placement-button";
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

      if (!selectedPlayers.length) {
        grid.innerHTML = `
          <span class="dart-placement-empty">
            Erst Teilnehmer auswählen
          </span>
        `;
      }
    });
  }

  function connectPlayerButton(button) {
    button.addEventListener("click", () => {
      button.classList.toggle("selected");
      renderPlacements();
    });
  }

  playerGrid
    .querySelectorAll(".dart-player-button")
    .forEach(connectPlayerButton);

  guestToggle.addEventListener("click", () => {
    guestForm.classList.toggle("open");
  });

  guestAddButton.addEventListener("click", () => {
    const guestName = guestNameInput.value.trim();

    if (!guestName) {
      guestNameInput.focus();
      return;
    }

    const existingPlayer = Array.from(
      playerGrid.querySelectorAll(".dart-player-button")
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
    guestButton.className = "dart-player-button selected";
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
const modeButtons = dartPanel.querySelectorAll(".dart-mode-button");
const otherModeBox = document.getElementById("dartOtherMode");
const otherModeInput = document.getElementById("dartOtherModeInput");
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    modeButtons.forEach((b) => b.classList.remove("selected"));

    button.classList.add("selected");

    selectedGameMode = button.dataset.mode;

    if (selectedGameMode === "Sonstiges") {
      otherModeBox.classList.add("open");
      otherModeInput.focus();
    } else {
      otherModeBox.classList.remove("open");
      otherModeInput.value = "";
    }
  });
});
const dartGameTab = document.getElementById("dartGameTab");
const dartStatsTab = document.getElementById("dartStatsTab");

const dartGameView = document.getElementById("dartGameView");
const dartStatsView = document.getElementById("dartStatsView");

dartGameTab.addEventListener("click", () => {
  dartGameTab.classList.add("selected");
  dartStatsTab.classList.remove("selected");

  dartGameView.classList.add("active");
  dartStatsView.classList.remove("active");
});

dartStatsTab.addEventListener("click", () => {
  dartStatsTab.classList.add("selected");
  dartGameTab.classList.remove("selected");

  dartStatsView.classList.add("active");
  dartGameView.classList.remove("active");

  const existingStatsPage = document.querySelector(
    "#dartStatsPanel .dart-stats-page"
  );

  const dartStatsContent =
    document.getElementById("dartStatsContent");

  if (existingStatsPage && dartStatsContent) {
    dartStatsContent.replaceChildren(existingStatsPage);
  }

  if (typeof window.loadDartStatistics === "function") {
    window.loadDartStatistics();
  }
});



;
saveButton.addEventListener("click", async () => {

    const selectedPlayers = getSelectedPlayers();

    if (selectedPlayers.length === 0) {
        alert("Bitte mindestens einen Teilnehmer auswählen.");
        return;
    }

    if (!placements[1]) {
        alert("Bitte einen Gewinner auswählen.");
        return;
    }

    if (placements[3] && !placements[2]) {
        alert("Platz 2 fehlt.");
        return;
    }

    if (placements[4] && !placements[3]) {
        alert("Platz 3 fehlt.");
        return;
    }

    const gameMode =
        selectedGameMode === "Sonstiges"
            ? otherModeInput.value.trim()
            : selectedGameMode;

    const gameDate = new Date().toISOString().split("T")[0];

    const { data: gameData, error: gameError } =
        await supabaseClient
            .from("dart_games")
            .insert({
                game_date: gameDate,
                mode: gameMode || null
            })
            .select()
            .single();

   if (gameError) {
    console.error(gameError);
    alert(JSON.stringify(gameError, null, 2));
    return;
}

    const gameId = gameData.id;
    console.log(placements);
        const resultRows = Object.entries(placements)
        .filter(([, player]) => player)
        .map(([place, player]) => ({
            game_id: gameId,
            player: player,
            place: Number(place)
        }));

    const { error: resultsError } =
        await supabaseClient
            .from("dart_results")
            .insert(resultRows);

    if (resultsError) {
        console.error(resultsError);

        const { error: rollbackError } =
            await supabaseClient
                .from("dart_games")
                .delete()
                .eq("id", gameId);

        if (rollbackError) {
            console.error(
                "Leeres Dart-Spiel konnte nicht entfernt werden:",
                rollbackError
            );
        }

        alert("Das Dart-Spiel konnte nicht vollständig gespeichert werden.");
        return;
    }

    alert("✅ Dart-Ergebnis erfolgreich gespeichert!");
    await loadHistory();

    playerGrid
        .querySelectorAll(".dart-player-button")
        .forEach((button) => {
            button.classList.remove("selected");
        });

    Object.keys(placements).forEach((place) => {
        placements[place] = null;
    });

    modeButtons.forEach((button) => {
        button.classList.remove("selected");
    });

    selectedGameMode = "";
    otherModeBox.classList.remove("open");
    otherModeInput.value = "";

    renderPlacements();
});
  renderPlacements();
}

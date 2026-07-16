// ======================================
// WRC DAILY
// Version 2.1
// ======================================

const WRCDaily = {
  statesKey: "wrc_daily_player_states",
  historyKey: "wrc_daily_history",
  jokerKey: "wrc_daily_jokers",
maxJokersPerMonth: 3,
  // --------------------------------------
  // Datum
  // --------------------------------------

  getToday() {
    const now = new Date();

    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("-");
  },

  getStateKey(player) {
    return `${this.getToday()}__${player}`;
  },

  // --------------------------------------
  // Aktuelle Dailys je Spieler
  // --------------------------------------

  getStates() {
    try {
      return JSON.parse(
        localStorage.getItem(this.statesKey) || "{}"
      );
    } catch (error) {
      console.error("Daily-Zustände konnten nicht gelesen werden:", error);
      return {};
    }
  },

  getPlayerState(player) {
    const states = this.getStates();
    return states[this.getStateKey(player)] || null;
  },

  savePlayerState(player, state) {
    const states = this.getStates();

    states[this.getStateKey(player)] = state;

    localStorage.setItem(
      this.statesKey,
      JSON.stringify(states)
    );
  },

  // --------------------------------------
  // Lokale Historie als Sicherung
  // --------------------------------------

  getLocalHistory() {
    try {
      return JSON.parse(
        localStorage.getItem(this.historyKey) || "[]"
      );
    } catch (error) {
      console.error("Lokale Daily-Historie konnte nicht gelesen werden:", error);
      return [];
    }
  },

  saveLocalHistory(entry) {
    const history = this.getLocalHistory();

    const alreadySaved = history.some(item =>
      item.player === entry.player &&
      item.date === entry.date &&
      item.id === entry.id
    );

    if (alreadySaved) {
      return;
    }

    history.push(entry);

    localStorage.setItem(
      this.historyKey,
      JSON.stringify(history)
    );
  },

  // --------------------------------------
  // Supabase-Historie speichern
  // --------------------------------------

  
    async saveHistory(entry) {
  const { data: existing, error: checkError } = await supabaseClient
    .from("daily_history")
    .select("id")
    .eq("player", entry.player)
    .eq("daily_id", entry.id)
    .eq("completed_date", entry.date)
    .limit(1);

  if (checkError) {
    console.error(
      "Daily konnte in Supabase nicht geprüft werden:",
      checkError
    );
    return false;
  }

  if (!existing || existing.length === 0) {
    const { error: insertError } = await supabaseClient
      .from("daily_history")
      .insert([{
        player: entry.player,
        daily_id: entry.id,
        title: entry.title,
        category: entry.category,
        completed_date: entry.date,
        completed_at: entry.completedAt
      }]);

    if (insertError) {
      console.error(
        "Daily konnte nicht in Supabase gespeichert werden:",
        insertError
      );
      return false;
    }
  }

  this.saveLocalHistory(entry);
  return true;

  },

  // --------------------------------------
  // Daily auswählen
  // --------------------------------------

  
drawRandomDaily(player) {
  return DailyManager.getDaily(player);
},

    
  createPlayerState(player) {
    const daily = this.drawRandomDaily(player);

    if (!daily) {
      return null;
    }

    const state = {
      date: this.getToday(),
      player,
      status: "open",
      daily
    };

    this.savePlayerState(player, state);

    return state;
  },

  // --------------------------------------
  // HTML-Vorlagen laden
  // --------------------------------------

  async loadTemplate(filename) {
    const mount = document.getElementById("wrcDailyMount");

    if (!mount) {
      console.error("Der Platz für WRC Daily wurde nicht gefunden.");
      return false;
    }

    try {
      const response = await fetch(
        `modules/daily/${filename}`
      );

      if (!response.ok) {
        throw new Error(`Fehler ${response.status}`);
      }

      mount.innerHTML = await response.text();

      return true;
    } catch (error) {
      console.error(
        "Daily-Vorlage konnte nicht geladen werden:",
        error
      );

      mount.innerHTML = `
        <div class="wrc-daily-card">
          <div class="wrc-daily-label">WRC Daily</div>
          <p>Die Daily konnte gerade nicht geladen werden.</p>
        </div>
      `;

      return false;
    }
  },

  // --------------------------------------
  // Spielerauswahl
  // --------------------------------------

  fillPlayerSelect() {
    const select = document.getElementById(
      "wrcDailyPlayerStart"
    );

    if (!select) {
      return;
    }

    select.innerHTML = people
      .map(player =>
        `<option value="${player}">${player}</option>`
      )
      .join("");
  },

  // --------------------------------------
  // Startbanner
  // --------------------------------------

  async renderStart(selectedPlayer = "") {
    const loaded = await this.loadTemplate(
      "daily-start.html"
    );

    if (!loaded) {
      return;
    }

    this.fillPlayerSelect();

    const select = document.getElementById(
      "wrcDailyPlayerStart"
    );

    const button = document.getElementById(
      "wrcDailyDrawButton"
    );

    if (!select || !button) {
      return;
    }

    if (
      selectedPlayer &&
      people.includes(selectedPlayer)
    ) {
      select.value = selectedPlayer;
    }

    const updateButton = () => {
      const state = this.getPlayerState(select.value);

      button.textContent = state
        ? "🎁 Daily ansehen"
        : "🎁 Daily öffnen";
    };

    updateButton();

    select.addEventListener(
      "change",
      updateButton
    );

    button.addEventListener("click", () => {
      const player = select.value;

      button.disabled = true;
      button.textContent =
        "🎲 Die WRC sucht etwas für dich aus ...";

      setTimeout(() => {
        let state = this.getPlayerState(player);

        if (!state) {
          state = this.createPlayerState(player);
        }

        this.renderState(state);
      }, 650);
    });
  },

  // --------------------------------------
  // Passenden Zustand anzeigen
  // --------------------------------------

  renderState(state) {
    if (!state) {
      this.renderStart();
      return;
    }

    if (state.status === "completed") {
      this.renderCompleted(state);
      return;
    }

    if (state.status === "joker") {
      this.renderJoker(state);
      return;
    }

    this.renderOpen(state);
  },

  // --------------------------------------
  // Offene Daily
  // --------------------------------------

  async renderOpen(state) {
    const loaded = await this.loadTemplate(
      "daily-open.html"
    );

    if (!loaded) {
      return;
    }

    const daily = state.daily;

    const playerName = document.getElementById(
      "wrcDailyPlayerName"
    );

    const category = document.getElementById(
      "wrcDailyCategory"
    );

    const title = document.getElementById(
      "wrcDailyTitle"
    );

    const task = document.getElementById(
      "wrcDailyTask"
    );

    const whyBox = document.getElementById(
      "wrcDailyWhyBox"
    );

    const why = document.getElementById(
      "wrcDailyWhy"
    );

    if (playerName) {
      playerName.textContent =
        `Heute für ${state.player}`;
    }

    if (category) {
      category.textContent =
        daily.category || "Daily";
    }

    if (title) {
      title.textContent = daily.title;
    }

    if (task) {
      task.textContent = daily.text;
    }

    if (daily.why && why) {
      why.textContent = daily.why;
    } else if (whyBox) {
      whyBox.style.display = "none";
    }

    const actions = document.querySelector(
      ".wrc-daily-actions"
    );

    if (actions) {
      const changeButton =
        document.createElement("button");

      changeButton.type = "button";
      changeButton.className = "secondary";
      changeButton.textContent = "Andere Person";

      actions.appendChild(changeButton);

      changeButton.addEventListener(
        "click",
        () => {
          this.renderStart(state.player);
        }
      );
    }

    const doneButton = document.getElementById(
      "wrcDailyDoneButton"
    );

    if (doneButton) {
      doneButton.addEventListener(
        "click",
        async () => {
          doneButton.disabled = true;
          doneButton.textContent = "Wird gespeichert ...";

          state.completedAt =
            new Date().toISOString();

          const savedOnline =
            await this.saveHistory({
              player: state.player,
              date: state.date,
              id: daily.id,
              title: daily.title,
              category:
                daily.category || "Daily",
              completedAt:
                state.completedAt
            });

          if (!savedOnline) {
            doneButton.disabled = false;
            doneButton.textContent =
              "✅ Geschafft";
            return;
          }

          state.status = "completed";

          this.savePlayerState(
            state.player,
            state
          );

          this.renderCompleted(state);
        }
      );
    }

    const jokerButton = document.getElementById(
      "wrcDailyJokerButton"
    );

   if (jokerButton) {
  const jokersLeft = this.getJokersLeft(state.player);

  jokerButton.textContent =
    `🃏 Neu würfeln (${jokersLeft}/3)`;

  jokerButton.disabled = jokersLeft === 0;

  jokerButton.addEventListener("click", () => {
    const remaining = this.getJokersLeft(state.player);

    if (remaining === 0) {
      window.alert(
        "Du hast deine drei Joker für diesen Monat bereits eingesetzt."
      );
      return;
    }

    const confirmed = window.confirm(
      `Möchtest du neu würfeln? Danach bleiben dir diesen Monat noch ${remaining - 1} Joker.`
    );

    if (!confirmed) {
      return;
    }

    const oldDailyId = state.daily.id;
    const jokerUsed = this.useJoker(state.player);

    if (!jokerUsed) {
      return;
    }

    state.daily = DailyManager.getJokerDaily(
  state.player,
  oldDailyId
);

    state.status = "open";
    state.jokerUsedAt = new Date().toISOString();

    this.savePlayerState(
      state.player,
      state
    );

        this.renderOpen(state);
  });
  }
},
  // --------------------------------------
  // Daily geschafft
  // --------------------------------------

  async renderCompleted(state) {
    console.log(state);
    const loaded = await this.loadTemplate(
      "daily-finished.html"
    );

    if (!loaded) {
      return;
    }

    const card = document.querySelector(
      "#wrcDailyMount .wrc-daily-card"
    );

    if (!card) {
      return;
    }

    const playerText =
      document.createElement("div");

    playerText.className =
      "wrc-daily-player";

    playerText.textContent =
      `Für ${state.player}`;

    const heading = card.querySelector("h2");

    if (heading) {
      card.insertBefore(
        playerText,
        heading
      );
    }

    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "secondary";
    button.textContent =
      "Andere Person auswählen";

    button.style.marginTop = "16px";

    card.appendChild(button);

    button.addEventListener(
      "click",
      () => {
        this.renderStart(state.player);
      }
    );

    await this.renderPlayerHistory();
  },

  // --------------------------------------
  // Joker
  // --------------------------------------
getMonthKey() {
  return this.getToday().slice(0, 7);
},

getJokersUsed(player) {
  try {
    const allJokers = JSON.parse(
      localStorage.getItem(this.jokerKey) || "{}"
    );

    const key = `${this.getMonthKey()}__${player}`;

    return allJokers[key] || 0;
  } catch {
    return 0;
  }
},

getJokersLeft(player) {
  return Math.max(
    0,
    this.maxJokersPerMonth - this.getJokersUsed(player)
  );
},

useJoker(player) {
  const used = this.getJokersUsed(player);

  if (used >= this.maxJokersPerMonth) {
    return false;
  }

  const allJokers = JSON.parse(
    localStorage.getItem(this.jokerKey) || "{}"
  );

  const key = `${this.getMonthKey()}__${player}`;

  allJokers[key] = used + 1;

  localStorage.setItem(
    this.jokerKey,
    JSON.stringify(allJokers)
  );

  return true;
},
  renderJoker(state) {
    const mount = document.getElementById(
      "wrcDailyMount"
    );

    if (!mount) {
      return;
    }

    mount.innerHTML = `
      <div class="wrc-daily-card">

        <div class="wrc-daily-label">
          🃏 WRC Daily
        </div>

        <div class="wrc-daily-player">
          Für ${state.player}
        </div>

        <h2>Joker eingesetzt</h2>

        <p>
          Heute hat die Aufgabe nicht gepasst –
          völlig okay.
        </p>

        <p class="wrc-daily-muted">
          Morgen wartet eine neue WRC Daily
          auf dich.
        </p>

        <button
          id="wrcDailyChangePlayer"
          class="secondary"
          type="button"
        >
          Andere Person auswählen
        </button>

      </div>
    `;

    document.getElementById(
      "wrcDailyChangePlayer"
    )?.addEventListener(
      "click",
      () => {
        this.renderStart(state.player);
      }
    );
  },

  // --------------------------------------
  // Historie auf der Spielerseite
  // --------------------------------------

  async renderPlayerHistory() {
    const container = document.getElementById(
      "playerDailyHistory"
    );

    console.log("Daily-Container:", container);
    if (!container) {
      return;
    }

    const player = document.getElementById(
      "playerSelect"
    )?.value;

    if (!player) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <span class="wrc-daily-muted">
        Dailys werden geladen ...
      </span>
    `;

    const { data, error } = await supabaseClient
      .from("daily_history")
      .select(
        "player,daily_id,title,category,completed_date,completed_at"
      )
      .eq("player", player)
      .order(
        "completed_date",
        { ascending: false }
      )
      .order(
        "completed_at",
        { ascending: false }
      );

    if (error) {
      console.error(
        "Daily-Historie konnte nicht geladen werden:",
        error
      );

      container.innerHTML = `
        <span class="wrc-daily-muted">
          Daily-Historie konnte nicht geladen werden.
        </span>
      `;

      return;
    }

    const history = data || [];

    if (history.length === 0) {
      container.innerHTML = `
        <span class="wrc-daily-muted">
          Noch keine WRC Daily erledigt.
        </span>
      `;

      return;
    }

    container.innerHTML = `
      <div style="
        margin-bottom:12px;
        color:#cbd5e1;
      ">
        Bisher erledigt:
        <strong>${history.length}</strong>
      </div>

      ${history
        .slice(0, 10)
        .map(entry => {
          const date = entry.completed_date
            ? entry.completed_date
                .split("-")
                .reverse()
                .join(".")
            : "";

          return `
            <div style="
              padding:9px 0;
              border-bottom:1px solid #334155;
            ">
              <strong>${date}</strong>
              · ${entry.title}
            </div>
          `;
        })
        .join("")}
    `;
  },

  // --------------------------------------
  // Start
  // --------------------------------------

  async init() {
    // ---------- TEST-RESET ----------
localStorage.removeItem(this.statesKey);
localStorage.removeItem(this.jokerKey);
// -------------------------------
    console.log("WRC Daily 2.1 geladen");

    await this.renderStart();
  }
};

document.addEventListener(
  "DOMContentLoaded",
  () => {
    WRCDaily.init();
  }
);
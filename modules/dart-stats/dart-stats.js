(() => {
  const PLAYERS = ["Thorsten", "Basti", "Marian", "Fabi"];
  const COLORS = {
    Thorsten: "#38bdf8",
    Basti: "#22c55e",
    Marian: "#f97316",
    Fabi: "#a78bfa"
  };
  const BOARD_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  let selectedPlayer = "all";
  let selectedPeriod = "all";
  let cachedThrows = [];
  let cachedGames = [];

  const escapeHtml = value => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  async function fetchAll(table, columns, orderColumn) {
    const pageSize = 1000;
    const rows = [];
    for (let from = 0; ; from += pageSize) {
      let query = supabaseClient.from(table).select(columns).range(from, from + pageSize - 1);
      if (orderColumn) query = query.order(orderColumn, { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < pageSize) return rows;
    }
  }

  function fieldLabel(dart) {
    if (dart.is_miss || Number(dart.base_value) === 0) return "Miss";
    if (Number(dart.base_value) === 25) return Number(dart.multiplier) === 2 ? "Bull" : "25";
    return `${Number(dart.multiplier) === 3 ? "T" : Number(dart.multiplier) === 2 ? "D" : ""}${dart.base_value}`;
  }

  function mostCommon(values) {
    if (!values.length) return null;
    const counts = new Map();
    values.forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "de"))[0];
  }

  function filteredThrows() {
    let rows = cachedThrows;
    if (selectedPlayer !== "all") rows = rows.filter(dart => dart.player === selectedPlayer);
    const gameDates = new Map(cachedGames.map(game => [String(game.id), game.game_date]));
    if (selectedPeriod === "month") {
      const now = new Date();
      rows = rows.filter(dart => {
        const date = new Date(`${gameDates.get(String(dart.game_id)) || ""}T12:00:00`);
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      });
    }
    if (selectedPeriod === "last") {
      const latest = cachedGames.find(game => cachedThrows.some(dart => String(dart.game_id) === String(game.id)));
      rows = latest ? rows.filter(dart => String(dart.game_id) === String(latest.id)) : [];
    }
    return rows;
  }

  function threeDartTotals(rows) {
    const turns = new Map();
    rows.forEach(dart => {
      const key = `${dart.game_id}:${dart.player}:${dart.turn_number}`;
      const turn = turns.get(key) || [];
      turn.push(dart);
      turns.set(key, turn);
    });
    return [...turns.values()]
      .filter(turn => turn.length === 3)
      .map(turn => turn.reduce((sum, dart) => sum + Number(dart.scored_value), 0));
  }

  function polar(radius, angle) {
    const radians = (angle - 90) * Math.PI / 180;
    return { x: 200 + radius * Math.cos(radians), y: 200 + radius * Math.sin(radians) };
  }

  function ringSlice(innerRadius, outerRadius, startAngle, endAngle) {
    const a = polar(outerRadius, startAngle);
    const b = polar(outerRadius, endAngle);
    const c = polar(innerRadius, endAngle);
    const d = polar(innerRadius, startAngle);
    return `M ${a.x} ${a.y} A ${outerRadius} ${outerRadius} 0 0 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${innerRadius} ${innerRadius} 0 0 0 ${d.x} ${d.y} Z`;
  }

  function dartboard(rows) {
    const hits = rows.filter(dart => !dart.is_miss && Number(dart.base_value) > 0);
    const counts = new Map();
    hits.forEach(dart => {
      const key = `${dart.player}:${dart.base_value}:${dart.multiplier}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const maxCount = Math.max(1, ...counts.values());
    const wedges = BOARD_ORDER.map((number, index) => {
      const start = index * 18 - 9;
      const end = start + 18;
      const dark = index % 2 === 0;
      const label = polar(190, index * 18);
      return `<path d="${ringSlice(42, 176, start, end)}" fill="${dark ? "#172033" : "#e2e8f0"}" stroke="#475569" stroke-width="1"/>
        <text x="${label.x}" y="${label.y}" text-anchor="middle" dominant-baseline="middle">${number}</text>`;
    }).join("");
    const bubbles = [...counts.entries()].map(([key, count]) => {
      const [player, baseText, multiplierText] = key.split(":");
      const base = Number(baseText);
      const multiplier = Number(multiplierText);
      let point;
      if (base === 25) point = polar(multiplier === 2 ? 0 : 20, 0);
      else {
        const angle = BOARD_ORDER.indexOf(base) * 18;
        point = polar(multiplier === 2 ? 164 : multiplier === 3 ? 102 : 135, angle);
      }
      const playerIndex = Math.max(0, PLAYERS.indexOf(player));
      const offset = polar(6, playerIndex * 90);
      const x = point.x + offset.x - 200;
      const y = point.y + offset.y - 200;
      const radius = 4 + 10 * Math.sqrt(count / maxCount);
      const dart = { base_value: base, multiplier, is_miss: false };
      return `<circle class="dart-hit-bubble" cx="${x}" cy="${y}" r="${radius}" fill="${COLORS[player] || "#facc15"}" fill-opacity=".72" stroke="#fff" stroke-width="1.6" tabindex="0" role="button" data-detail="${escapeHtml(`${player}: ${fieldLabel(dart)} · ${count}×`)}"><title>${escapeHtml(`${player}: ${fieldLabel(dart)} · ${count} Treffer`)}</title></circle>`;
    }).join("");
    return `<svg class="dart-hit-board" viewBox="0 0 400 400" role="img" aria-label="Trefferverteilung auf der Dartscheibe">
      <circle cx="200" cy="200" r="199" fill="#0b1220"/>
      ${wedges}
      <circle cx="200" cy="200" r="176" fill="none" stroke="#ef4444" stroke-width="14" opacity=".62"/>
      <circle cx="200" cy="200" r="102" fill="none" stroke="#22c55e" stroke-width="13" opacity=".62"/>
      <circle cx="200" cy="200" r="27" fill="#16a34a" stroke="#e2e8f0" stroke-width="2"/>
      <circle cx="200" cy="200" r="11" fill="#dc2626" stroke="#e2e8f0" stroke-width="2"/>
      ${bubbles}
    </svg>`;
  }

  function render() {
    const mount = document.getElementById("dartThrowStats");
    if (!mount) return;
    const rows = filteredThrows();
    const players = [...new Set(cachedThrows.map(dart => dart.player))].sort((a, b) => {
      const fixed = PLAYERS.indexOf(a) - PLAYERS.indexOf(b);
      return PLAYERS.includes(a) && PLAYERS.includes(b) ? fixed : a.localeCompare(b, "de");
    });
    const favorite = mostCommon(rows.map(fieldLabel));
    const turnFavorite = mostCommon(threeDartTotals(rows));
    const misses = rows.filter(dart => dart.is_miss).length;
    const missRate = rows.length ? (misses / rows.length) * 100 : 0;
    const positionFavorites = [1, 2, 3].map(position => mostCommon(
      rows.filter(dart => Number(dart.dart_position) === position).map(fieldLabel)
    ));
    const hitRanking = [...new Map(rows.map(dart => [fieldLabel(dart), 0])).keys()]
      .map(label => [label, rows.filter(dart => fieldLabel(dart) === label).length])
      .sort((a, b) => b[1] - a[1]).slice(0, 8);
    const gameModes = new Map(cachedGames.map(game => [String(game.id), game.mode || ""]));
    const cricketRows = rows.filter(dart => gameModes.get(String(dart.game_id)).includes("Cricket"));
    const cricketHits = cricketRows.filter(dart => [15, 16, 17, 18, 19, 20, 25].includes(Number(dart.base_value)));
    const cricketFavorite = mostCommon(cricketHits.map(fieldLabel));
    const cricketMarks = cricketHits.reduce((sum, dart) => sum + Number(dart.multiplier), 0);

    mount.innerHTML = `
      <section class="dart-throw-stats">
        <div class="dart-throw-heading"><div><span>WRC Caller</span><h3>🎯 Wurfprofil</h3><p>Jeder Pfeil erzählt ein kleines Stück Wahrheit.</p></div></div>
        <div class="dart-throw-filters" aria-label="Statistik filtern">
          <div>${["all", ...players].map(player => `<button type="button" class="${selectedPlayer === player ? "selected" : ""}" data-dart-player="${escapeHtml(player)}"><i style="--dot:${COLORS[player] || "#facc15"}"></i>${player === "all" ? "Alle" : escapeHtml(player)}</button>`).join("")}</div>
          <div>${[["all", "Gesamt"], ["month", "Dieser Monat"], ["last", "Letzte Partie"]].map(([value, label]) => `<button type="button" class="${selectedPeriod === value ? "selected" : ""}" data-dart-period="${value}">${label}</button>`).join("")}</div>
        </div>
        ${rows.length ? `
          <div class="dart-throw-summary">
            <article><span>Gewertete Pfeile</span><strong>${rows.length.toLocaleString("de-DE")}</strong></article>
            <article><span>Lieblingsfeld</span><strong>${escapeHtml(favorite?.[0] || "–")}</strong><small>${favorite?.[1] || 0}× getroffen</small></article>
            <article><span>Häufigste 3er-Aufnahme</span><strong>${turnFavorite?.[0] ?? "–"}</strong><small>${turnFavorite ? `${turnFavorite[1]}× geworfen` : "Noch keine volle Aufnahme"}</small></article>
            <article><span>Miss-Quote</span><strong>${missRate.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</strong><small>${misses} von ${rows.length}</small></article>
          </div>
          <div class="dart-position-favorites">
            ${positionFavorites.map((favoriteAtPosition, index) => `<article><span>Dart ${index + 1}</span><strong>${escapeHtml(favoriteAtPosition?.[0] || "–")}</strong><small>${favoriteAtPosition ? `${favoriteAtPosition[1]}×` : "Noch offen"}</small></article>`).join("")}
          </div>
          ${cricketRows.length ? `<div class="dart-throw-summary dart-cricket-stat-summary">
            <article><span>Cricket-Pfeile</span><strong>${cricketRows.length.toLocaleString("de-DE")}</strong><small>persönlich protokolliert</small></article>
            <article><span>Cricket-Markierungen</span><strong>${cricketMarks.toLocaleString("de-DE")}</strong><small>Roh-Treffer auf 15–Bull</small></article>
            <article><span>Stärkstes Cricket-Feld</span><strong>${escapeHtml(cricketFavorite?.[0] || "–")}</strong><small>${cricketFavorite?.[1] || 0}× getroffen</small></article>
            <article><span>Außerhalb</span><strong>${(cricketRows.length - cricketHits.length).toLocaleString("de-DE")}</strong><small>Darts neben den Cricket-Feldern</small></article>
          </div>` : ""}
          <div class="dart-board-layout">
            <div><h4>Trefferkarte</h4><p>Je größer der Kreis, desto häufiger landet ihr dort.</p>${dartboard(rows)}<div id="dartBoardDetail" class="dart-board-detail">Kreis antippen für Details</div></div>
            <div class="dart-hit-ranking"><h4>Am häufigsten getroffen</h4>${hitRanking.map(([label, count], index) => `<div><span>${index + 1}. ${escapeHtml(label)}</span><strong>${count}×</strong></div>`).join("")}</div>
          </div>` : `<div class="dart-throw-empty"><strong>Noch kein Wurfprofil vorhanden.</strong><span>Die ersten Detaildaten entstehen automatisch mit der nächsten abgeschlossenen WRC-Caller-Partie.</span></div>`}
      </section>`;
    bind(mount);
  }

  function bind(mount) {
    mount.querySelectorAll("[data-dart-player]").forEach(button => button.addEventListener("click", () => {
      selectedPlayer = button.dataset.dartPlayer;
      render();
    }));
    mount.querySelectorAll("[data-dart-period]").forEach(button => button.addEventListener("click", () => {
      selectedPeriod = button.dataset.dartPeriod;
      render();
    }));
    mount.querySelectorAll(".dart-hit-bubble").forEach(bubble => bubble.addEventListener("click", () => {
      const detail = document.getElementById("dartBoardDetail");
      if (detail) detail.textContent = bubble.dataset.detail;
    }));
  }

  async function load() {
    const mount = document.getElementById("dartThrowStats");
    if (!mount || typeof supabaseClient === "undefined") return;
    mount.innerHTML = '<div class="dart-throw-loading">Wurfprofil wird geladen …</div>';
    try {
      [cachedThrows, cachedGames] = await Promise.all([
        fetchAll("dart_throws", "id,game_id,player,turn_number,dart_position,base_value,multiplier,scored_value,is_miss,is_bust,created_at", "id"),
        fetchAll("dart_games", "id,game_date,mode,created_at", "created_at")
      ]);
      render();
    } catch (error) {
      console.error("DART THROW STATS ERROR:", error);
      mount.innerHTML = '<div class="dart-throw-empty"><strong>Wurfprofil noch nicht verfügbar.</strong><span>Die bisherigen Ergebnisstatistiken bleiben vollständig erhalten.</span></div>';
    }
  }

  window.WRCLoadDartThrowStats = load;
  window.addEventListener("wrc:dart-game-saved", load);
  document.getElementById("dartStatsReload")?.addEventListener("click", load);
})();

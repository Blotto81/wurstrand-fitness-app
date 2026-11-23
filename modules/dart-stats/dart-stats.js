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
    const missCounts = new Map();
    rows.filter(dart => fieldLabel(dart) === "Miss").forEach(dart => {
      missCounts.set(dart.player, (missCounts.get(dart.player) || 0) + 1);
    });
    const maxCount = Math.max(1, ...counts.values(), ...missCounts.values());
    const bubbleRadius = count => 4 + 10 * Math.sqrt(count / maxCount);
    const totalMisses = [...missCounts.values()].reduce((sum, count) => sum + count, 0);
    const missBubbles = [...missCounts.entries()].sort(([a], [b]) => a.localeCompare(b, "de")).map(([player, count]) => {
      const detail = escapeHtml(`${player}: Miss · ${count}×`);
      return `<button type="button" class="dart-miss-marker" data-detail="${detail}" aria-label="${detail}">
        <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${bubbleRadius(count)}" fill="${COLORS[player] || "#facc15"}" fill-opacity=".72" stroke="#fff" stroke-width="1.6"/></svg>
        <span>${escapeHtml(player)}</span><strong>${count}×</strong>
      </button>`;
    }).join("");
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
      const radius = bubbleRadius(count);
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
    </svg><section class="dart-miss-zone" aria-label="Fehlwürfe neben der Dartscheibe">
      <div class="dart-miss-heading"><strong>Miss · neben dem Board</strong><span>${totalMisses}×</span></div>
      ${missBubbles ? `<div class="dart-miss-grid">${missBubbles}</div>` : '<p class="dart-miss-empty">Keine Miss-Würfe in dieser Auswahl.</p>'}
    </section>`;
  }

  function averageSeries(player) {
    const gameById = new Map(cachedGames.map(game => [String(game.id), game]));
    const grouped = new Map();
    cachedThrows.forEach(dart => {
      if (player !== "all" && dart.player !== player) return;
      const id = String(dart.game_id);
      if (!gameById.has(id)) return;
      const key = player === "all" ? id + ":" + dart.player : id;
      const group = grouped.get(key) || { game: gameById.get(id), player: dart.player, darts: [] };
      group.darts.push(dart);
      grouped.set(key, group);
    });
    return [...grouped.values()].map(group => {
      const turns = new Map();
      group.darts.forEach(dart => {
        const key = String(dart.turn_number);
        const turn = turns.get(key) || [];
        turn.push(dart);
        turns.set(key, turn);
      });
      const scored = [...turns.values()].reduce((total, turn) =>
        total + (turn.some(d => d.is_bust) ? 0 : turn.reduce((sum, d) => sum + Number(d.scored_value || 0), 0)), 0);
      return { ...group, average: group.darts.length ? scored * 3 / group.darts.length : 0,
        date: String(group.game.game_date || group.game.created_at || "").slice(0, 10) };
    }).sort((a,b) => a.date.localeCompare(b.date) || String(a.game.created_at || "").localeCompare(String(b.game.created_at || "")));
  }

  function averageChart() {
    const players = selectedPlayer === "all" ? PLAYERS : [selectedPlayer];
    const series = players.map(player => ({ player, games: averageSeries(player).slice(-10) })).filter(item => item.games.length);
    if (!series.length) return '<p class="dart-throw-empty">Noch keine Caller-Wurfdaten für einen Average-Verlauf.</p>';
    const width = 680, height = 250, left = 42, right = 14, top = 18, bottom = 39;
    const max = Math.max(20, ...series.flatMap(item => item.games.map(game => game.average)));
    const ceiling = Math.ceil(max / 10) * 10;
    const x = i => left + i * (width - left - right) / 9;
    const y = value => top + (ceiling - value) / ceiling * (height - top - bottom);
    const lines = [0, .25, .5, .75, 1].map(fraction => {
      const value = ceiling * fraction;
      return `<line x1="${left}" y1="${y(value)}" x2="${width-right}" y2="${y(value)}" stroke="#64748b" stroke-opacity=".35"/><text x="${left-7}" y="${y(value)+4}" text-anchor="end" fill="#cbd5e1" font-size="12">${Math.round(value)}</text>`;
    }).join("");
    const plots = series.map(({player,games}) => {
      const color = COLORS[player] || "#facc15";
      const points = games.map((game,i) => [x(10-games.length+i),y(game.average)]);
      const path = points.map(([px,py],i) => `${i ? "L":"M"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
      const circles = points.map(([px,py],i) => `<circle cx="${px}" cy="${py}" r="5" fill="${color}" stroke="#0f172a" stroke-width="2"><title>${escapeHtml(player)} · ${escapeHtml(games[i].date)} · ${games[i].average.toFixed(1)} Average</title></circle>`).join("");
      return `<path d="${path}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${circles}`;
    }).join("");
    const labels = Array.from({length:10},(_,i)=>`<text x="${x(i)}" y="${height-12}" text-anchor="middle" fill="#cbd5e1" font-size="12">${i+1}</text>`).join("");
    const legend = series.map(({player,games}) => `<span><i style="background:${COLORS[player] || "#facc15"}"></i>${escapeHtml(player)} · ${games.length} Partien</span>`).join("");
    const trend = selectedPlayer !== "all" ? (() => {
      const games = series[0]?.games || [];
      if (games.length < 6) return "Für einen Formvergleich brauchen wir mindestens sechs Caller-Partien.";
      const last = games.slice(-5).reduce((sum,g)=>sum+g.average,0)/5;
      const before = games.slice(-10,-5);
      const prior = before.reduce((sum,g)=>sum+g.average,0)/before.length;
      const delta = last-prior;
      return `Letzte 5: <strong>${last.toFixed(1)}</strong> · davor: ${prior.toFixed(1)} · <strong>${delta >= 0 ? "↗ +" : "↘ "}${delta.toFixed(1)}</strong>`;
    })() : "Für den persönlichen Trend einen Spieler auswählen.";
    return `<section class="dart-average-panel"><h3>📈 3-Dart-Average im Verlauf</h3><p>Je Spieler die letzten zehn Caller-Partien. Höher ist besser; Bust-Aufnahmen zählen mit 0 Punkten.</p><div class="dart-average-legend">${legend}</div><svg class="dart-average-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="3-Dart-Average je Partie, letzte zehn Partien pro Spieler">${lines}${plots}${labels}</svg><p class="dart-average-trend">${trend}</p></section>`;
  }

  function funAwards(rows) {
    const people = [...new Set(rows.map(d => d.player))];
    if (!people.length) return "";
    const stats = people.map(player => {
      const darts = rows.filter(d => d.player === player);
      const triples = darts.filter(d => Number(d.multiplier) === 3 && !d.is_miss).length;
      const gameAverages = averageSeries(player).slice(-10);
      const spread = gameAverages.length >= 3 ? Math.sqrt(gameAverages.reduce((sum,g) => sum + Math.pow(g.average - gameAverages.reduce((s,v)=>s+v.average,0)/gameAverages.length,2),0)/gameAverages.length) : Infinity;
      const first = gameAverages.slice(-10,-5), last = gameAverages.slice(-5);
      const gain = first.length && last.length === 5 ? last.reduce((s,g)=>s+g.average,0)/last.length - first.reduce((s,g)=>s+g.average,0)/first.length : -Infinity;
      return {player, darts:darts.length, tripleRate:darts.length ? triples/darts.length : 0, spread, gain, games:gameAverages.length};
    });
    const eligible = stats.filter(s => s.darts >= 30);
    const award = (title, item, description) => item ? `<article><span>${title}</span><strong>${escapeHtml(item.player)}</strong><small>${description(item)}</small></article>` : "";
    const triple = eligible.slice().sort((a,b)=>b.tripleRate-a.tripleRate)[0];
    const steady = eligible.filter(s=>s.games>=3).sort((a,b)=>a.spread-b.spread)[0];
    const comeback = eligible.filter(s=>s.games>=6 && s.gain>0).sort((a,b)=>b.gain-a.gain)[0];
    return `<section class="dart-awards"><h3>🌭 WRC Dart-Auszeichnungen</h3><p>Nur bei mindestens 30 protokollierten Pfeilen; Formpreise brauchen mehrere Partien.</p><div class="dart-award-grid">${award("🎯 Triple-Jäger",triple,s=>`${(s.tripleRate*100).toFixed(1)}% Triple-Treffer`)}${award("🧊 Konstanzmaschine",steady,s=>`Schwankung: ${s.spread.toFixed(1)} Average-Punkte`)}${award("🚀 Aufsteiger",comeback,s=>`+${s.gain.toFixed(1)} Average-Punkte` )}</div></section>`;
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
    const misses = rows.filter(dart => fieldLabel(dart) === "Miss").length;
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
    const typeCounts = [
      ["Single", rows.filter(d => Number(d.multiplier) === 1 && !d.is_miss && Number(d.base_value) > 0).length],
      ["Double", rows.filter(d => Number(d.multiplier) === 2 && !d.is_miss).length],
      ["Triple", rows.filter(d => Number(d.multiplier) === 3 && !d.is_miss).length],
      ["Miss", misses]
    ];
    const visits = new Map();
    rows.forEach(d => {
      const key = `${d.game_id}:${d.player}:${d.turn_number}`;
      const visit = visits.get(key) || { score: 0, bust: false };
      visit.score += Number(d.scored_value);
      visit.bust ||= Boolean(d.is_bust);
      visits.set(key, visit);
    });
    const bestTurn = Math.max(0, ...[...visits.values()].filter(v => !v.bust).map(v => v.score));
    const tripleCount = typeCounts[2][1];
    const funFact = tripleCount ? `${tripleCount} Triple-Treffer – ${(tripleCount / rows.length * 100).toFixed(1).replace(".", ",")}% aller Pfeile.`
      : misses === 0 ? "Kein einziger Miss in dieser Auswahl!" : `${rows.length - misses} von ${rows.length} Pfeilen trafen ein Feld.`;


    mount.innerHTML = `
      <section class="dart-throw-stats">
        <div class="dart-throw-heading"><div><span>WRC Caller</span><h3>🎯 Wurfprofil</h3><p>Jeder Pfeil erzählt ein kleines Stück Wahrheit.</p></div></div>
        <div class="dart-throw-filters" aria-label="Statistik filtern">
          <div>${["all", ...players].map(player => `<button type="button" class="${selectedPlayer === player ? "selected" : ""}" data-dart-player="${escapeHtml(player)}"><i style="--dot:${COLORS[player] || "#facc15"}"></i>${player === "all" ? "Alle" : escapeHtml(player)}</button>`).join("")}</div>
          <div>${[["all", "Gesamt"], ["month", "Dieser Monat"], ["last", "Letzte Partie"]].map(([value, label]) => `<button type="button" class="${selectedPeriod === value ? "selected" : ""}" data-dart-period="${value}">${label}</button>`).join("")}</div>
        </div>
        ${averageChart()}
        ${funAwards(rows)}
        ${rows.length ? `
          ${` `}
          <div class="dart-board-layout">
            <div><h4>Trefferkarte</h4><p>Je größer der Kreis, desto häufiger landet ihr dort – auch bei Miss.</p>${dartboard(rows)}<div id="dartBoardDetail" class="dart-board-detail" aria-live="polite">Kreis antippen für Details</div></div>
            <div class="dart-hit-ranking"><h4>Am häufigsten getroffen</h4>${hitRanking.map(([label, count], index) => `<div><span>${index + 1}. ${escapeHtml(label)}</span><strong>${count}×</strong></div>`).join("")}</div>
          </div>
          <div class="dart-throw-summary">
            <article><span>Gewertete Pfeile</span><strong>${rows.length.toLocaleString("de-DE")}</strong></article>
            <article><span>Lieblingsfeld</span><strong>${escapeHtml(favorite?.[0] || "–")}</strong><small>${favorite?.[1] || 0}× getroffen</small></article>
            <article><span>Häufigste 3er-Aufnahme</span><strong>${turnFavorite?.[0] ?? "–"}</strong><small>${turnFavorite ? `${turnFavorite[1]}× geworfen` : "Noch keine volle Aufnahme"}</small></article>
            <article><span>Miss-Quote</span><strong>${missRate.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</strong><small>${misses} von ${rows.length}</small></article>
          </div>
          <div class="dart-visual-insights">
            <h4>📊 Trefferarten</h4>
            <div class="dart-type-bars">${typeCounts.map(([label,count]) => `<div class="dart-type-row"><span>${label}</span><div class="dart-type-track"><div style="width:${rows.length ? count / rows.length * 100 : 0}%"></div></div><strong>${count}</strong></div>`).join("")}</div>
            <p class="dart-type-note">Bester nicht überworfener Besuch: <strong>${bestTurn} Punkte</strong></p>
            <p class="dart-type-note">🎲 ${escapeHtml(funFact)}</p>
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
` : `<div class="dart-throw-empty"><strong>Noch kein Wurfprofil vorhanden.</strong><span>Die ersten Detaildaten entstehen automatisch mit der nächsten abgeschlossenen WRC-Caller-Partie.</span></div>`}
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
    mount.querySelectorAll(".dart-hit-bubble, .dart-miss-marker").forEach(bubble => {
      const showDetail = () => {
        const detail = document.getElementById("dartBoardDetail");
        if (detail) detail.textContent = bubble.dataset.detail;
      };
      bubble.addEventListener("click", showDetail);
      if (bubble.matches(".dart-hit-bubble")) bubble.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showDetail(); }
      });
    });
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

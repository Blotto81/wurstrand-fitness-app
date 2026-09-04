(function () {
  "use strict";

  const TABLE = "daily_moods";
  const LOCAL_KEY = "wrc_daily_moods_v1";
  const moods = [
    { value: 1, label: "Schwer", color: "#77839a", mouth: "M8 16 Q12 12 16 16" },
    { value: 2, label: "Eher schwierig", color: "#7187a8", mouth: "M8 15 Q12 13 16 15" },
    { value: 3, label: "Okay", color: "#5d91b5", mouth: "M8 14 H16" },
    { value: 4, label: "Gut", color: "#4ca99a", mouth: "M8 13 Q12 17 16 13" },
    { value: 5, label: "Richtig gut", color: "#e0b85d", mouth: "M7.5 12.5 Q12 18 16.5 12.5" }
  ];

  let draft = { value: null, dirty: false };
  let loadToken = 0;
  let tableAvailable = true;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function face(mood, className = "") {
    return `<svg class="wrc-mood-face ${className}" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="${mood.color}" />
      <circle cx="8.5" cy="9.5" r="1.15" fill="#07111f" />
      <circle cx="15.5" cy="9.5" r="1.15" fill="#07111f" />
      <path d="${mood.mouth}" fill="none" stroke="#07111f" stroke-width="1.8" stroke-linecap="round" />
    </svg>`;
  }

  function localRows() {
    try {
      const rows = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch (_) {
      return [];
    }
  }

  function rememberLocal(row) {
    const rows = localRows().filter(item => !(item.player === row.player && item.mood_date === row.mood_date));
    rows.push(row);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows.slice(-500)));
  }

  function localMood(player, date) {
    return localRows().find(row => row.player === player && row.mood_date === date) || null;
  }

  function isMissingTable(error) {
    return ["42P01", "PGRST205"].includes(error?.code) || /daily_moods|schema cache/i.test(error?.message || "");
  }

  async function remoteRows(player, month = "") {
    if (!tableAvailable || typeof supabaseClient === "undefined") return [];
    let query = supabaseClient.from(TABLE).select("player,mood_date,mood_value").eq("player", player);
    if (month) query = query.gte("mood_date", `${month}-01`).lt("mood_date", nextMonth(month));
    const { data, error } = await query.order("mood_date", { ascending: true });
    if (error) {
      if (isMissingTable(error)) tableAvailable = false;
      else console.warn("Tagesgefühl konnte nicht geladen werden:", error);
      return [];
    }
    return data || [];
  }

  function nextMonth(month) {
    const [year, value] = month.split("-").map(Number);
    const date = new Date(year, value, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
  }

  function mergeRows(remote, local) {
    const map = new Map();
    [...remote, ...local].forEach(row => map.set(`${row.player}_${row.mood_date}`, row));
    return [...map.values()].sort((a, b) => a.mood_date.localeCompare(b.mood_date));
  }

  function pickerMarkup() {
    return `<section class="wrc-mood-entry" aria-labelledby="wrcMoodEntryTitle">
      <div class="wrc-mood-entry-copy">
        <strong id="wrcMoodEntryTitle">Wie war dein Tag?</strong><span>optional</span>
      </div>
      <div class="wrc-mood-options" role="radiogroup" aria-label="Tagesgefühl">
        ${moods.map(mood => `<button type="button" class="wrc-mood-option" data-mood-value="${mood.value}" role="radio" aria-checked="false" aria-label="${mood.label}" title="${mood.label}">
          ${face(mood)}<span class="wrc-mood-option-label">${mood.label}</span>
        </button>`).join("")}
      </div>
    </section>`;
  }

  function mountPicker() {
    const mount = document.getElementById("wrcMoodEntryMount");
    if (!mount || mount.dataset.ready) return;
    mount.dataset.ready = "true";
    mount.innerHTML = pickerMarkup();
    mount.addEventListener("click", event => {
      const option = event.target.closest("[data-mood-value]");
      if (option) {
        const value = Number(option.dataset.moodValue);
        draft = { value: draft.value === value ? null : value, dirty: true };
        renderPickerState();
        return;
      }
    });
    document.getElementById("person")?.addEventListener("change", syncPicker);
    document.getElementById("date")?.addEventListener("change", syncPicker);
    syncPicker();
  }

  function renderPickerState(loading = false) {
    const mount = document.getElementById("wrcMoodEntryMount");
    if (!mount) return;
    mount.classList.toggle("is-loading", loading);
    mount.querySelectorAll("[data-mood-value]").forEach(button => {
      const selected = Number(button.dataset.moodValue) === draft.value;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-checked", String(selected));
    });
  }

  async function syncPicker() {
    const player = document.getElementById("person")?.value;
    const date = document.getElementById("date")?.value;
    const token = ++loadToken;
    draft = { value: null, dirty: false };
    renderPickerState(true);
    if (!player || !date) return renderPickerState(false);

    let row = localMood(player, date);
    if (tableAvailable && typeof supabaseClient !== "undefined") {
      const { data, error } = await supabaseClient
        .from(TABLE).select("mood_value").eq("player", player).eq("mood_date", date).maybeSingle();
      if (!error && data) row = { mood_value: data.mood_value };
      if (error && isMissingTable(error)) tableAvailable = false;
    }
    if (token !== loadToken) return;
    draft = { value: row ? Number(row.mood_value) : null, dirty: false };
    renderPickerState(false);
  }

  async function saveDay(player, date) {
    if (!draft.dirty || !player || !date) return { saved: false, synced: tableAvailable };
    const value = draft.value;
    if (value === null) {
      const rows = localRows().filter(row => !(row.player === player && row.mood_date === date));
      localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
      if (tableAvailable && typeof supabaseClient !== "undefined") {
        const { error } = await supabaseClient.from(TABLE).delete().eq("player", player).eq("mood_date", date);
        if (error && isMissingTable(error)) tableAvailable = false;
      }
      return { saved: true, synced: tableAvailable };
    }

    const row = { player, mood_date: date, mood_value: value };
    rememberLocal(row);
    if (!tableAvailable || typeof supabaseClient === "undefined") return { saved: true, synced: false };
    const { error } = await supabaseClient.from(TABLE).upsert(row, { onConflict: "player,mood_date" });
    if (error) {
      if (isMissingTable(error)) tableAvailable = false;
      else console.warn("Tagesgefühl wurde nur lokal gespeichert:", error);
      return { saved: true, synced: false };
    }
    return { saved: true, synced: true };
  }

  function clearDraft() {
    draft = { value: null, dirty: false };
    renderPickerState(false);
    window.setTimeout(syncPicker, 0);
  }

  function moodFor(value) {
    return moods.find(mood => mood.value === Number(value)) || moods[2];
  }

  function average(rows) {
    return rows.length ? rows.reduce((sum, row) => sum + Number(row.mood_value), 0) / rows.length : 0;
  }

  function averageLabel(value) {
    if (!value) return "Noch offen";
    return moodFor(Math.round(value)).label;
  }

  function chartMarkup(rows, month) {
    const [year, monthNumber] = month.split("-").map(Number);
    const days = new Date(year, monthNumber, 0).getDate();
    const width = 720;
    const height = 210;
    const padX = 34;
    const padY = 25;
    const point = row => ({
      x: padX + ((Number(row.mood_date.slice(8, 10)) - 1) / Math.max(days - 1, 1)) * (width - padX * 2),
      y: padY + ((5 - Number(row.mood_value)) / 4) * (height - padY * 2)
    });
    const points = rows.map(point);
    const path = points.map((item, index) => `${index ? "L" : "M"}${item.x.toFixed(1)} ${item.y.toFixed(1)}`).join(" ");
    return `<div class="wrc-mood-chart-wrap">
      <svg class="wrc-mood-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Verlauf des Tagesgefühls">
        ${[1, 2, 3, 4, 5].map(value => {
          const y = padY + ((5 - value) / 4) * (height - padY * 2);
          return `<line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" class="wrc-mood-gridline" />`;
        }).join("")}
        ${path ? `<path d="${path}" class="wrc-mood-line" />` : ""}
        ${rows.map((row, index) => {
          const item = points[index];
          const mood = moodFor(row.mood_value);
          return `<circle cx="${item.x}" cy="${item.y}" r="7" fill="${mood.color}"><title>${row.mood_date.slice(8, 10)}. · ${mood.label}</title></circle>`;
        }).join("")}
      </svg>
      <div class="wrc-mood-chart-axis"><span>1.</span><span>${Math.ceil(days / 2)}.</span><span>${days}.</span></div>
    </div>`;
  }

  function activityInsight(rows, entries) {
    if (rows.length < 6) return "Nach sechs Einträgen kann die WRC erste vorsichtige Zusammenhänge zeigen.";
    const pointsByDate = new Map(entries.map(entry => [entry.date, typeof calcPoints === "function" ? calcPoints(entry).total : 0]));
    const paired = rows.map(row => ({ mood: Number(row.mood_value), points: pointsByDate.get(row.mood_date) || 0 }));
    const sortedPoints = paired.map(item => item.points).sort((a, b) => a - b);
    const median = sortedPoints[Math.floor(sortedPoints.length / 2)];
    const active = paired.filter(item => item.points >= median);
    const quieter = paired.filter(item => item.points < median);
    if (active.length < 2 || quieter.length < 2) return "Noch ein paar Tage, dann wird der persönliche Zusammenhang zwischen Bewegung und Stimmung sichtbar.";
    const difference = average(active.map(item => ({ mood_value: item.mood }))) - average(quieter.map(item => ({ mood_value: item.mood })));
    if (Math.abs(difference) < 0.2) return "Bisher zeigt sich dein Tagesgefühl an bewegungsreichen und ruhigeren Tagen ziemlich ausgeglichen.";
    return `An deinen bewegungsreicheren Tagen lag dein Tagesgefühl bisher im Schnitt ${Math.abs(difference).toLocaleString("de-DE", { maximumFractionDigits: 1 })} Stufen ${difference > 0 ? "höher" : "niedriger"}.`;
  }

  async function playerMarkup(player, entries, month) {
    const remote = await remoteRows(player, month);
    const local = localRows().filter(row => row.player === player && row.mood_date.startsWith(month));
    const rows = mergeRows(remote, local).filter(row => row.mood_date.startsWith(month));
    const avg = average(rows);
    const distribution = moods.map(mood => rows.filter(row => Number(row.mood_value) === mood.value).length);
    const maxDistribution = Math.max(...distribution, 1);
    const title = typeof getMonthTitle === "function" ? getMonthTitle(month) : month;

    return `<section class="wrc-mood-profile">
      <button type="button" class="wrc-mood-profile-toggle" data-mood-profile-toggle aria-expanded="false">
        <span class="wrc-mood-profile-toggle-icon">${face(moods[3])}</span>
        <span><small>PERSÖNLICHER RÜCKBLICK</small><strong>Tagesgefühl ansehen</strong></span>
        <span class="wrc-mood-profile-toggle-arrow" aria-hidden="true">⌄</span>
      </button>
      <div class="wrc-mood-profile-content" data-mood-profile-content hidden>
        <div class="wrc-mood-profile-head">
          <div><span>TAGESGEFÜHL · ${escapeHtml(title).toUpperCase()}</span><h3>Wie sich dein Monat angefühlt hat</h3></div>
          <p>Nur deine freiwilligen Tageschecks – ohne Wertung und ohne Vergleich.</p>
        </div>
        ${rows.length ? `<div class="wrc-mood-summary">
          <div class="wrc-mood-average">${face(moodFor(Math.round(avg)), "large")}<span><small>Durchschnitt</small><strong>${escapeHtml(averageLabel(avg))}</strong><em>${avg.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} von 5</em></span></div>
          <div class="wrc-mood-count"><small>Eingetragene Tage</small><strong>${rows.length}</strong></div>
        </div>
        ${chartMarkup(rows, month)}
        <div class="wrc-mood-distribution">${moods.map((mood, index) => `<div><span>${face(mood)} ${mood.label}</span><i><b style="width:${(distribution[index] / maxDistribution) * 100}%"></b></i><strong>${distribution[index]}</strong></div>`).join("")}</div>
        <div class="wrc-mood-insight"><span>WRC-Beobachtung</span><p>${escapeHtml(activityInsight(rows, entries))}</p><small>Ein Zusammenhang ist keine Ursache – sondern erst einmal nur interessant.</small></div>` : `<div class="wrc-mood-empty">${face(moods[2], "large")}<strong>Noch kein Tagesgefühl in diesem Monat</strong><p>Wenn du beim Eintragen freiwillig ein Gesicht auswählst, entsteht hier ganz in Ruhe dein persönlicher Verlauf.</p></div>`}
      </div>
    </section>`;
  }

  function bindPlayerSection(container) {
    const toggle = container?.querySelector("[data-mood-profile-toggle]");
    const content = container?.querySelector("[data-mood-profile-content]");
    if (!toggle || !content) return;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      content.hidden = !open;
      if (open) content.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  window.WRCMood = {
    init: mountPicker,
    syncPicker,
    saveDay,
    clearDraft,
    playerMarkup,
    bindPlayerSection,
    getDraft: () => ({ ...draft })
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountPicker);
  else mountPicker();
})();

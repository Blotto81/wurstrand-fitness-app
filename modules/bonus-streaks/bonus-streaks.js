(function () {
  "use strict";
  const C = window.WRCBonusStreakCore;
  const titles = { 7: "Angefeuert", 14: "Wurstwender", 30: "Glutmeister", 60: "Feuerhüter", 100: "Grilllegende", 180: "Flammenkrone", 365: "Ewige Glut" };
  const statusNames = { bonus: "Bonus erreicht", protected: "Durch Joker geschützt · kein Bonustag", miss: "Bonus nicht erreicht", open: "Heute noch offen" };
  const months = new Map();
  const celebratedSnapshots = new WeakSet();
  let reference, dayKey, states = new Map(), ready = false, synced = false, rewardTimer;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const stamp = date => new Date(date + "T12:00:00").toLocaleDateString("de-DE");
  function entries() { return typeof allEntries === "undefined" ? [] : allEntries; }
  function state(player) {
    const source = entries(), date = C.today();
    if (source !== reference || date !== dayKey) { reference = source; dayKey = date; states = new Map(); }
    if (!states.has(player)) states.set(player, C.calculate(source, player, date));
    return states.get(player);
  }
  function shield(filled) {
    return `<svg viewBox="0 0 24 28" class="bs-shield${filled ? " is-filled" : ""}" aria-hidden="true"><path d="M12 2 22 6v8c0 6-6 10-10 12C8 24 2 20 2 14V6Z"/><path d="m7 13 3 3 7-7"/></svg>`;
  }
  function grill() {
    return `<svg class="bs-grill" viewBox="0 0 96 96" aria-hidden="true"><path class="bs-smoke" d="M34 34c-10-9 9-12 0-23m15 23c-10-9 9-12 0-23m15 23c-10-9 9-12 0-23"/><path d="M18 43h60c-2 21-13 30-30 30S20 64 18 43Z"/><path d="m33 71-8 17m38-17 8 17M29 80h38M14 43h68"/><path class="bs-grill-glow" d="M30 52h36"/></svg>`;
  }
  function art(level) {
    // Only invoked for earned patches. Each milestone has its own illustrated motif.
    const motifs = {
      7: '<path d="M50 19c9 17 25 25 22 42-2 13-11 21-23 21S28 74 28 61c0-13 14-19 12-30l10 13c7-8 4-16 0-25Z"/><path class="bs-art-light" d="M49 52c-1 12-12 14-9 22 4 10 19 5 18-4-1-6-7-9-9-18Z"/>',
      14: '<path class="bs-art-line" d="m27 81 43-56m-6-10 13 11m-17-6 10 9m-2-18 13 11"/><path d="M23 50c-6-8 1-19 11-17l35 20c12 8 1 25-10 18Z"/><path class="bs-art-line" d="m36 39-5 10m18-3-5 10m18-3-5 10"/>',
      30: '<path class="bs-art-line" d="M39 29c-9-10 6-12 0-20m20 20c-9-10 6-12 0-20m-25 62-8 18m40-18 8 18M30 78h40"/><path d="M20 40h60c-2 23-14 32-30 32S22 63 20 40Z"/><path class="bs-art-line" d="M16 40h68m-55 9h42"/>',
      60: '<path d="M50 13c3 13 23 25 22 40-1 13-9 22-22 22s-22-9-22-22c0-13 13-20 12-29l10 14c4-8 2-16 0-25Z"/><path class="bs-art-line" d="m22 85 50-57M26 24l53 61M18 24l12-9m-8 17 13-9M67 22l13 12m-9-17 13 12"/>',
      100: '<path d="M19 42a20 20 0 0 1 20-20h24v46H19Zm44-8h19v34H63Z"/><path class="bs-art-line" d="M30 23V12h13m30 22V15h9M26 68v15m48-15v15M30 48h21m-10-8v16"/><circle class="bs-art-light" cx="72" cy="52" r="5"/>',
      180: '<path d="m27 30-7-18 19 9 11-13 11 13 19-9-7 18ZM50 35c8 13 21 20 20 32-2 11-9 18-20 18s-20-7-20-18c0-12 13-18 12-26l8 12c4-7 2-12 0-18Z"/><path class="bs-art-line" d="M20 80C7 65 9 46 17 38m-1 23-8-6m10 19-10-3m72 9c13-15 11-34 3-42m1 23 8-6m-10 19 10-3"/>',
      365: '<path d="M30 28h40v23c0 15-9 22-20 22s-20-7-20-22Z"/><path class="bs-art-line" d="M30 34H17v9c0 12 7 18 17 18m36-27h13v9c0 12-7 18-17 18M50 73v12m-18 2h36"/><path class="bs-art-light" d="m50 35 4 8 9 1-7 7 2 9-8-4-8 4 2-9-7-7 9-1Z"/><path d="m36 20-6-12 13 5 7-9 7 9 13-5-6 12Z"/>'
    };
    return `<svg viewBox="0 0 100 112" class="bs-patch-art bs-level-${level}" aria-hidden="true"><path class="bs-badge" d="m50 3 43 19v46c0 22-25 34-43 41C32 102 7 90 7 68V22Z"/><path class="bs-stitches" d="m50 9 37 17v42c0 17-21 29-37 35C34 97 13 85 13 68V26Z"/><g transform="translate(9 10) scale(.82)">${motifs[level]}</g></svg>`;
  }
  function summary(s, compact = false) {
    return `<div class="bs-summary${compact ? " bs-compact" : ""}${s.current >= 30 ? " bs-hot" : ""}">
      <div class="bs-summary-main"><span class="bs-eyebrow">BONUSSTREAK · ${esc(s.player)}</span><div class="bs-count"><strong>${s.current}</strong><span>${s.current === 1 ? "Bonustag" : "Bonustage"}<small>in deiner Serie</small></span></div>
      <p class="bs-motto">${s.current ? "Der Grill bleibt heiß." : "Der Grill ist aus. Zeit, ihn anzuheizen!"}</p></div>${grill()}
      <div class="bs-summary-footer"><div class="bs-jokers"><span class="bs-shields" aria-hidden="true">${Array.from({ length: 4 }, (_, i) => shield(i < s.jokers)).join("")}</span><span><b>${s.jokers}</b> Joker verfügbar</span></div><span class="bs-record">Rekord <b>${s.record}</b></span></div></div>`;
  }
  function note() { return !synced ? '<p class="bs-sync" role="status">Gespeicherter Stand · Abgleich mit der WRC steht noch aus.</p>' : ""; }
  function renderEntry() {
    const box = document.getElementById("bonusStreakEntry");
    const player = document.getElementById("person")?.value;
    if (!box || !player) return;
    box.innerHTML = ready ? `${summary(state(player), true)}${note()}<p class="bs-caption">Gespeicherte Bonustage seit 01.05.2026 · Joker schützen, zählen aber nicht mit.</p>` : '<p class="bs-caption">Deine Bonusserie wird geladen …</p>';
  }
  function renderPatches(player) {
    if (!ready) return "";
    const s = state(player);
    if (!s.patches.length) return "";
    return `<div class="bs-patch-shelf" aria-label="Verdiente Streak-Patches von ${esc(player)}">${s.patches.map(p => `<button type="button" class="bs-mini-patch" data-bs-patch="${p.milestone}" data-bs-player="${esc(player)}" title="${titles[p.milestone]} · ${p.milestone} Bonustage" aria-label="Streak-Patch ${titles[p.milestone]}, ${p.milestone} Bonustage öffnen">${art(p.milestone)}<span>${p.milestone}</span></button>`).join("")}</div>`;
  }
  function calendar(s) {
    const maxMonth = s.asOf.slice(0, 7);
    let month = months.get(s.player) || maxMonth;
    if (month < C.START.slice(0, 7) || month > maxMonth) month = maxMonth;
    months.set(s.player, month);
    const first = new Date(month + "-01T12:00:00Z"), offset = (first.getUTCDay() + 6) % 7;
    const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    const lookup = new Map(s.days.map(d => [d.date, d]));
    const title = first.toLocaleDateString("de-DE", { month: "long", year: "numeric", timeZone: "UTC" });
    return `<div class="bs-calendar" data-bs-player="${esc(s.player)}"><div class="bs-calendar-head"><button type="button" data-bs-month="-1" aria-label="Vorheriger Bonusmonat" ${month <= C.START.slice(0, 7) ? "disabled" : ""}>‹</button><h4 aria-live="polite">${title}</h4><button type="button" data-bs-month="1" aria-label="Nächster Bonusmonat" ${month >= maxMonth ? "disabled" : ""}>›</button></div>
      <div class="bs-calendar-grid" aria-label="Bonuskalender ${title}">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(d => `<span class="bs-weekday" aria-hidden="true">${d}</span>`).join("")}${'<span aria-hidden="true"></span>'.repeat(offset)}${Array.from({ length: last }, (_, i) => {
        const date = `${month}-${String(i + 1).padStart(2, "0")}`, d = lookup.get(date);
        const label = d ? `${stamp(date)}: ${statusNames[d.status]}${d.broke ? ". Serie beendet" : ""}` : `${stamp(date)}: noch nicht abgeschlossen`;
        return `<button type="button" class="bs-day bs-${d?.status || "future"}${date === s.asOf ? " bs-today" : ""}" data-bs-day="${date}" ${d ? "" : "disabled"} ${date === s.asOf ? 'aria-current="date"' : ""} title="${label}" aria-label="${label}"><span>${i + 1}</span><small aria-hidden="true">${({ bonus: "✓", protected: "◇", miss: "·", open: "○" })[d?.status] || ""}</small></button>`;
      }).join("")}</div><div class="bs-legend"><span><i class="bs-key-bonus">✓</i> Bonus</span><span><i class="bs-key-protected">◇</i> Joker</span><span><i>·</i> Ohne Bonus</span><span><i>○</i> Heute offen</span></div><p class="bs-day-detail" aria-live="polite">Tippe auf einen Tag für den damaligen Serien- und Jokerstand.</p></div>`;
  }
  function renderProfile(player) {
    if (!ready) return '<section id="bonusStreakProfile" class="bs-profile"><p>Bonusserie wird geladen …</p></section>';
    const s = state(player);
    return `<section id="bonusStreakProfile" class="bs-profile" data-bs-player="${esc(player)}" aria-label="Bonusserie von ${esc(player)}"><div class="bs-section-heading"><div><span class="bs-eyebrow">DER GRILL BLEIBT HEISS</span><h3>Deine Bonusserie</h3></div><span class="bs-since">Seit 01.05.2026</span></div><div class="bs-profile-grid"><div>${summary(s)}${note()}<div class="bs-record-story"><span>🏆</span><div><strong>Dein längstes Feuer: ${s.record} ${s.record === 1 ? "Bonustag" : "Bonustage"}</strong><p>${s.recordDate ? `Erreicht am ${stamp(s.recordDate)}. Ein neuer Anlauf setzt deinen Rekord nicht zurück.` : "Jeder Grillabend beginnt mit dem ersten Funken."}</p></div></div><details class="bs-rules"><summary>So bleibt dein Grill heiß</summary><p>Der bestehende Tagesbonus verlängert deine Serie um einen Bonustag. Pro Monat gibt es 2 Joker, höchstens 4 auf Vorrat. Ein Joker schützt eine laufende Serie an einem abgeschlossenen Tag ohne Bonus, zählt aber nicht mit.</p><p>Ohne Joker endet die Serie. Dein nächster Anlauf hat 2 Joker; solange keine Serie läuft, wird keiner verbraucht. Heute bleibt offen, bis der Tag vorbei ist.</p><p>Nachträge und Korrekturen berechnen die gesamte Historie ab 01.05.2026 neu. Rekorde und Patches aus früheren Serien bleiben berücksichtigt.</p></details><p class="bs-earned-note">${s.patches.length ? `${s.patches.length} ${s.patches.length === 1 ? "Streak-Patch" : "Streak-Patches"} verdient · bei deinen Sportauszeichnungen.` : "Deine erste Streak-Auszeichnung wartet auf ihren großen Moment."}</p></div>${calendar(s)}</div></section>`;
  }
  function refresh() {
    renderEntry();
    const box = document.getElementById("bonusStreakProfile");
    const player = box?.dataset.bsPlayer || document.getElementById("playerSelect")?.value;
    if (box && player) box.outerHTML = renderProfile(player);
  }
  function onEntriesLoaded(isSynced = true) { ready = true; synced = isSynced; reference = null; renderEntry(); }
  function onLoadError() { synced = false; refresh(); }
  function showPatch(player, milestone, opener) {
    const patch = state(player).patches.find(p => p.milestone === milestone);
    if (!patch) return;
    const dialog = document.createElement("dialog");
    dialog.className = "bs-patch-dialog";
    dialog.setAttribute("aria-labelledby", "bonusPatchTitle");
    dialog.innerHTML = `<button type="button" class="bs-close" aria-label="Patch schließen">×</button><span class="bs-eyebrow">WRC · VERDIENTE AUSZEICHNUNG</span>${art(milestone)}<h2 id="bonusPatchTitle">${titles[milestone]}</h2><p class="bs-patch-number">${milestone} Bonustage in einer Serie</p><p>${esc(player)} hat diesen Patch am <strong>${stamp(patch.date)}</strong> erreicht.</p><p class="bs-caption">Serie ab ${stamp(patch.seriesStart)} · Joker-Tage zählen nicht mit.</p>`;
    const close = () => dialog.close();
    dialog.querySelector("button").addEventListener("click", close);
    dialog.addEventListener("click", event => { if (event.target === dialog) close(); });
    dialog.addEventListener("close", () => { dialog.remove(); if (opener?.isConnected) opener.focus(); }, { once: true });
    document.body.append(dialog); dialog.showModal();
  }
  function showAchievement(success) {
    if (!success) return;
    clearTimeout(rewardTimer);
    document.getElementById("bonusStreakReward")?.remove();
    const box = document.createElement("aside");
    box.id = "bonusStreakReward"; box.className = `bs-reward${success.patches.length ? " bs-reveal" : ""}`;
    box.setAttribute("aria-label", "Bonusserie erreicht");
    box.innerHTML = `<button type="button" class="bs-close" aria-label="Streak-Meldung schließen">×</button><div role="status"><span class="bs-eyebrow">${esc(success.player)}${success.backdated ? ` · NACHTRAG ${stamp(success.date)}` : " · BONUS ERREICHT"}</span><strong>🔥 ${success.count} ${success.count === 1 ? "Bonustag" : "Bonustage"}!</strong><p>Der Grill bleibt heiß! 🌭${success.backdated ? " Deine Historie ist neu berechnet." : ""}</p>${success.patches.length ? `<div class="bs-reward-patches">${success.patches.map(p => `<div>${art(p.milestone)}<b>${titles[p.milestone]}</b><small>${p.milestone} Bonustage · neu verdient</small></div>`).join("")}</div>` : ""}</div>`;
    box.querySelector("button").addEventListener("click", () => box.remove());
    document.body.append(box);
    rewardTimer = setTimeout(() => box.remove(), success.patches.length ? 8500 : 5500);
  }
  function afterSave(before, savedEntry) {
    if (celebratedSnapshots.has(before)) return;
    const result = C.achievement(before, state(savedEntry.person), savedEntry.date);
    if (!result) return;
    celebratedSnapshots.add(before);
    // Follow the existing save reward; wait for any sport-patch modal to close.
    const deliver = () => {
      if (document.querySelector(".club-unlock.show, dialog[open], .wrc-post-overlay.is-visible")) { setTimeout(deliver, 1000); return; }
      showAchievement(result);
    };
    setTimeout(deliver, 5400);
  }
  document.addEventListener("click", event => {
    const target = event.target.closest?.("[data-bs-month], [data-bs-day], [data-bs-patch]");
    if (!target || target.disabled) return;
    if (target.hasAttribute("data-bs-patch")) { showPatch(target.dataset.bsPlayer, Number(target.dataset.bsPatch), target); return; }
    const host = target.closest(".bs-calendar"), player = host?.dataset.bsPlayer;
    if (!player) return;
    const s = state(player);
    if (target.hasAttribute("data-bs-month")) {
      const date = new Date((months.get(player) || s.asOf.slice(0, 7)) + "-01T12:00:00Z");
      date.setUTCMonth(date.getUTCMonth() + Number(target.dataset.bsMonth));
      months.set(player, date.toISOString().slice(0, 7));
      const direction = target.dataset.bsMonth;
      host.outerHTML = calendar(s);
      const calendarBox = document.querySelector("#bonusStreakProfile .bs-calendar");
      const same = calendarBox.querySelector(`[data-bs-month="${direction}"]`);
      (same.disabled ? calendarBox.querySelector("[data-bs-month]:not([disabled])") : same)?.focus();
    } else {
      const d = s.days.find(item => item.date === target.dataset.bsDay);
      if (d) host.querySelector(".bs-day-detail").textContent = `${stamp(d.date)} · ${statusNames[d.status]}. ${d.broke ? "Serie beendet, 2 Joker für den Neustart." : `${d.current} Bonustage in der Serie · ${d.jokers} Joker übrig.`}${d.credit ? ` Monatsgutschrift: +${d.credit} Joker.` : ""}`;
    }
  });
  document.addEventListener("change", event => { if (event.target.id === "person") renderEntry(); });
  // An app left open overnight must not keep yesterday's day protected as "today".
  function checkDate() { if (ready && dayKey !== C.today()) refresh(); }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkDate(); });
  setInterval(checkDate, 60000);
  window.WRCBonusStreaks = Object.freeze({ state, renderEntry, renderPatches, renderProfile, onEntriesLoaded, onLoadError, afterSave });
})();

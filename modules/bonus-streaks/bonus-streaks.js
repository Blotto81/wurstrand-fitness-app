(function () {
  "use strict";
  const C = window.WRCBonusStreakCore;
  const titles = { 7: "Angefeuert", 14: "Wurstwender", 30: "Glutmeister", 60: "Feuerhüter", 100: "Grilllegende", 180: "Flammenkrone", 365: "Ewige Glut" };
  const celebratedSnapshots = new WeakSet();
  let reference, dayKey, states = new Map(), ready = false, rewardTimer, pendingReward, deliveryTimer;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const stamp = date => new Date(date + "T12:00:00").toLocaleDateString("de-DE");
  function entries() { return typeof allEntries === "undefined" ? [] : allEntries; }
  function state(player) {
    const source = entries(), date = C.today();
    if (source !== reference || date !== dayKey) { reference = source; dayKey = date; states = new Map(); }
    if (!states.has(player)) states.set(player, C.calculate(source, player, date));
    return states.get(player);
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
  function renderPatches(player) {
    if (!ready) return "";
    const s = state(player);
    if (!s.patches.length) return "";
    return `<div class="bs-patch-shelf" aria-label="Verdiente Bonusserien-Patches von ${esc(player)}">${s.patches.map(p => `<button type="button" class="bs-mini-patch" data-bs-patch="${p.milestone}" data-bs-player="${esc(player)}" title="${titles[p.milestone]} · ${p.milestone} Bonustage" aria-label="Bonusserien-Patch ${titles[p.milestone]}, ${p.milestone} Bonustage öffnen">${art(p.milestone)}<span>${p.milestone}</span></button>`).join("")}</div>`;
  }
  function renderProfile(player) {
    if (!ready) return "";
    const s = state(player);
    if (s.current < 3) return "";
    return `<div id="bonusStreakProfile" class="bs-profile" data-bs-player="${esc(player)}" aria-label="Bonusserie von ${esc(player)}"><strong>🔥 ${s.current} erfolgreiche Bonustage in Serie</strong><small>Persönlicher Rekord: ${s.record}</small></div>`;
  }
  function refresh() {
    const box = document.getElementById("bonusStreakProfile");
    if (box) box.outerHTML = renderProfile(box.dataset.bsPlayer);
  }
  function onEntriesLoaded() { ready = true; reference = null; refresh(); }
  function onLoadError() { refresh(); }
  function showPatch(player, milestone, opener) {
    const patch = state(player).patches.find(p => p.milestone === milestone);
    if (!patch) return;
    const dialog = document.createElement("dialog");
    dialog.className = "bs-patch-dialog";
    dialog.setAttribute("aria-labelledby", "bonusPatchTitle");
    dialog.innerHTML = `<button type="button" class="bs-close" aria-label="Patch schließen">×</button><span class="bs-eyebrow">WRC · VERDIENTE AUSZEICHNUNG</span>${art(milestone)}<h2 id="bonusPatchTitle">${titles[milestone]}</h2><p class="bs-patch-number">${milestone} Bonustage in einer Serie</p><p>${esc(player)} hat diesen Patch am <strong>${stamp(patch.date)}</strong> erreicht.</p><p class="bs-caption">Serie ab ${stamp(patch.seriesStart)} · Pausentage zählen nicht mit.</p>`;
    const close = () => dialog.close();
    dialog.querySelector("button").addEventListener("click", close);
    dialog.addEventListener("click", event => { if (event.target === dialog) close(); });
    dialog.addEventListener("close", () => { dialog.remove(); if (opener?.isConnected) opener.focus(); }, { once: true });
    document.body.append(dialog); dialog.showModal();
  }
  const seen = new Set();
  const noticeKey = (player, milestone) => `wrcBonusSeriesNotice_${player}_${milestone}`;
  function wasSeen(player, milestone) {
    const key = noticeKey(player, milestone);
    try { return seen.has(key) || localStorage.getItem(key) === "1"; } catch { return seen.has(key); }
  }
  function showAchievement(success, patch) {
    const box = document.createElement("aside");
    box.id = "bonusStreakReward"; box.className = "bs-reward"; box.setAttribute("role", "status");
    box.innerHTML = `${art(patch.milestone)}<div><strong>${patch.milestone} Bonustage – ${titles[patch.milestone]}!</strong><span>Glückwunsch, ${esc(success.player)}.</span></div>`;
    document.body.append(box);
    const key = noticeKey(success.player, patch.milestone); seen.add(key);
    try { localStorage.setItem(key, "1"); } catch { /* Recognition works without storage. */ }
    clearTimeout(rewardTimer); rewardTimer = setTimeout(() => box.remove(), 4000);
  }
  function deliverReward() {
    if (!pendingReward) return;
    // Never cover an existing reward or force a modal. There is at most one pending notice.
    if (document.hidden || document.querySelector(".club-unlock.show, dialog[open], .wrc-post-overlay.is-visible, .save-reward.show, #bonusStreakReward")) {
      deliveryTimer = setTimeout(deliverReward, 1000); return;
    }
    const success = pendingReward; pendingReward = null;
    const patch = success.patches.at(-1);
    if (!wasSeen(success.player, patch.milestone) && state(success.player).patches.some(p => p.milestone === patch.milestone)) showAchievement(success, patch);
  }
  function afterSave(before, savedEntry) {
    if (celebratedSnapshots.has(before)) return;
    const result = C.achievement(before, state(savedEntry.person), savedEntry.date);
    if (!result) return;
    celebratedSnapshots.add(before);
    // Backfills update every earned patch silently; ordinary bonus days have no notice.
    if (result.backdated) return;
    result.patches = result.patches.filter(p => !wasSeen(result.player, p.milestone));
    if (!result.patches.length) return;
    pendingReward = result;
    clearTimeout(deliveryTimer); deliveryTimer = setTimeout(deliverReward, 5400);
  }
  document.addEventListener("click", event => {
    const target = event.target.closest?.("[data-bs-patch]");
    if (target && !target.disabled) showPatch(target.dataset.bsPlayer, Number(target.dataset.bsPatch), target);
  });
  // An app left open overnight must not keep yesterday's day open as "today".
  function checkDate() { if (ready && dayKey !== C.today()) refresh(); }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkDate(); });
  setInterval(checkDate, 60000);
  window.WRCBonusStreaks = Object.freeze({ state, renderPatches, renderProfile, onEntriesLoaded, onLoadError, afterSave });
})();

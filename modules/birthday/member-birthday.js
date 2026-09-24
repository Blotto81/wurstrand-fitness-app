(function () {
  "use strict";
  const D = WRCBirthdayData;
  const G = WRCBirthdayGifts;
  // Individual letters only. Add another explicit person/year here when supplied.
  const letters = Object.freeze({ "Fabi:2026": "modules/birthday/fabi-2026.json" });
  let loaded = false;
  let showReady = false;
  let lifetimeEntries = null;
  let dartFacts = {};
  let previewPlayer = D.previewPlayer;
  let dialog = null;
  let active = null;
  let step = 0;
  let letter = null;
  let orderTimer;
  let lastFocus;
  let showing = false;
  let busy = false;
  let lastDate = D.today();
  let attempt = 0;
  const paused = new Set();
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n, decimals = 0) => Number(n).toLocaleString("de-DE", { maximumFractionDigits: decimals });
  const stamp = date => new Date(date + "T12:00:00").toLocaleDateString("de-DE");
  function player() {
    if (D.preview && D.members[previewPlayer]) return previewPlayer;
    try { const value = localStorage.getItem("wrcPostLastPlayer"); if (D.members[value]) return value; } catch { /* Use visible selection. */ }
    return document.getElementById("person")?.value;
  }
  function badge(person) {
    const b = D.celebrating();
    return b?.person === person ? `<span class="mb-badge">👑 Geburtstagskind · Level ${b.age}</span>` : "";
  }
  function stats(person) {
    if (!loaded) return '<p class="mb-muted">Das Lebenswerk wird aus den WRC-Einträgen geladen …</p>';
    if (!lifetimeEntries) return '<p class="mb-muted">Das vollständige Tagesarchiv wird geladen. Es werden keine unvollständigen Summen angezeigt.</p>';
    const value = D.lifetime(person, lifetimeEntries, HISTORIC_PLAYER_TOTALS[person]);
    if (!value) return '<p class="mb-muted">Noch keine belegten WRC-Leistungen vorhanden.</p>';
    const facts = [[num(value.points, 1), "WRC-Punkte"], [num(value.steps), "Schritte"], [num(value.bike, 1) + " km", "auf dem Fahrrad"], [num(value.days), "dokumentierte Tage"], [num(value.exercises), "Übungseinheiten"]];
    if (value.best) facts.push([num(value.best[1], 1) + " Pkt.", "stärkster dokumentierter Tag"]);
    const dart = dartFacts[person];
    if (dart?.games) facts.push([`${dart.wins} Siege`, `in ${dart.games} gespeicherten Dartpartien`]);
    const gifts = G.matching({ person });
    const byYear = new Map();
    gifts.forEach(g => byYear.set(g.birthday_year, (byYear.get(g.birthday_year) || 0) + g.points));
    return `<div class="mb-facts">${facts.map(([v, label]) => `<div><strong>${v}</strong><span>${label}</span></div>`).join("")}</div>
      <div class="mb-moments">${value.first ? `<p><span>DER ANFANG IM TAGESARCHIV</span>${stamp(value.first)} · erster detaillierter WRC-Eintrag</p>` : ""}
      ${value.best ? `<p><span>DER REKORDTAG</span>${stamp(value.best[0])} · ${num(value.best[1], 1)} Punkte aus echter Aktivität</p>` : ""}
      ${[...byYear].map(([year, points]) => `<p><span>VON DEN JUNGS · ${year}</span>${points} Geburtstagspunkte zum ${D.birthday(person, year).age}. Geburtstag</p>`).join("")}</div>
      <p class="mb-source">Gesamtleistungen inklusive der vorhandenen WRC-Historie. Tage und Tagesrekorde aus dem detaillierten Archiv; Geschenke separat als Bonus.</p>`;
  }
  function giftStatus(b) {
    const actual = G.matching({ person: b.person, date: b.date });
    const total = actual.reduce((s, g) => s + g.points, 0);
    return `<div class="mb-gift-status"><h3>🎁 Von deinen Mitwurstrandlern</h3><div class="mb-givers">${Object.keys(D.members).filter(p => p !== b.person).map(p => `<span>${p} <b>${actual.some(g => g.giver === p) ? "+5 Punkte ♥" : "· noch offen"}</b></span>`).join("")}</div><p>${total === 15 ? "15 Geburtstagspunkte von deinen Jungs. 🎉" : `${total} von möglichen 15 Geburtstagspunkten`}${G.ready ? "" : " · letzter gespeicherter Stand"}</p></div>`;
  }
  function ensure(id, parent, tag = "div") {
    let el = document.getElementById(id);
    if (!el && parent) { el = document.createElement(tag); el.id = id; parent.prepend(el); }
    return el;
  }
  function render() {
    const b = D.celebrating();
    const hero = ensure("memberBirthdayHero", document.getElementById("dashboard"), "section");
    const header = ensure("memberBirthdayHeader", document.querySelector(".logo-header > div"));
    const input = ensure("memberBirthdayInput", document.querySelector("#eintragen > .card"));
    const invite = ensure("memberBirthdayInvitation", document.getElementById("dashboard"));
    const analysis = ensure("memberBirthdayAnalysis", document.querySelector("#analyse .analysis-header"));
    const ledger = ensure("memberBirthdayLedger", document.getElementById("entriesList")?.parentElement);
    if (ledger) {
      const rows = G.matching({ key: selectedMonth() });
      ledger.hidden = !rows.length; ledger.className = "mb-input";
      ledger.innerHTML = rows.length ? `<strong>🎁 Geburtstagsgeschenke · eigener Punktebonus</strong>${rows.map(g => `<p>${stamp(g.gift_date)} · ${g.recipient}: Geburtstagsgeschenk von ${g.giver} · +5 Punkte</p>`).join("")}` : "";
    }
    if (!hero || !input) return;
    hero.hidden = !b;
    if (header) { header.hidden = !b; header.className = "mb-header"; header.textContent = b ? `👑 ${b.person} ${b.age} · ${b.jubilee ? "Jubiläumsausgabe" : "Geburtstagsausgabe"}` : ""; }
    if (analysis) { analysis.hidden = !b; analysis.className = "mb-aside"; analysis.textContent = b ? `📊 Heute unter der ${b.person}-Festtagsverordnung. Die Zahlen bleiben ehrlich.` : ""; }
    if (b) {
      hero.className = `mb-hero${b.jubilee ? " mb-jubilee" : ""}`;
      hero.innerHTML = `<div class="mb-hero-top"><div class="mb-intro"><span class="mb-eyebrow">WRC · ${b.jubilee ? "DIE JUBILÄUMSAUSGABE" : "DIE GEBURTSTAGSAUSGABE"}</span><h2>Heute feiern wir<br><span>${b.person}.</span></h2><p>Heute gehört dir der Wurstrand.<br>Die Punkte bleiben ehrlich. Die Huldigung ist grenzenlos.</p><span class="mb-date">${stamp(b.date)} · Ein Tag ganz in deinem Zeichen.</span></div><div class="mb-portrait"><span class="mb-crown" aria-hidden="true">👑</span><img src="${esc(playerProfiles[b.person].image)}" alt="${b.person} – vorhandene WRC-Playerkarte"><div class="mb-age"><strong>${b.age}</strong><span>JAHRE ${b.person.toUpperCase()}</span></div></div></div>
      <div class="mb-life"><span class="mb-eyebrow">DAS LEBENSWERK</span><h3>Was ${b.person} für den Wurstrand geleistet hat.</h3>${stats(b.person)}</div>${giftStatus(b)}<footer>Wursti & Bertha führen heute das Festprotokoll. 🌭🫘</footer>`;
      const giver = player();
      const given = G.matching({ person: b.person, date: b.date }).some(g => g.giver === giver);
      input.className = "mb-input";
      input.innerHTML = `<strong>${giver === b.person ? "👑 Seine Hoheit trägt heute persönlich ein." : `🎁 Heute wird ${b.person} ${b.age}!`}</strong><p>${giver === b.person ? "Deine Mitwurstrandler können dir heute bis zu 15 Geburtstagspunkte schenken." : given ? `Deine +5 Geburtstagspunkte für ${b.person} sind gespeichert. Der WRC ist gerührt.` : `Training zu Ehren des Geburtstagskindes ist gestattet. Du kannst ${b.person} außerdem einmalig 5 echte WRC-Punkte schenken.`}</p>${giver !== b.person && D.members[giver] && !given ? `<button type="button" class="mb-button" id="memberBirthdayGift" ${busy || !G.ready ? "disabled" : ""}>🎁 +5 Punkte an ${b.person}</button>` : ""}<span class="mb-feedback" role="status"></span>${!G.ready ? '<p class="mb-muted">Geschenke werden synchronisiert. Bei fehlender Verbindung später erneut versuchen.</p>' : ""}`;
      input.hidden = false;
      input.querySelector("button")?.addEventListener("click", async () => {
        busy = true; render();
        let message;
        try { await G.give(giver, b.person); message = `🎁 +5 für ${b.person}! Eine großzügige Geste. Der WRC ist gerührt.`; renderAll(); }
        catch (error) { message = error.message; }
        finally { busy = false; render(); const feedback = input.querySelector(".mb-feedback"); if (feedback) feedback.textContent = message; }
      });
    } else { hero.replaceChildren(); input.replaceChildren(); input.hidden = true; }
    const waiting = loaded && D.unseen(player());
    invite.hidden = !waiting;
    invite.className = "mb-invitation";
    invite.innerHTML = waiting ? `<span>💌 ${waiting.person}, deine Geburtstagszeremonie ${waiting.year} wartet auf dich.</span><button type="button" class="mb-button">Zeremonie öffnen</button>` : "";
    invite.querySelector("button")?.addEventListener("click", () => openShow(waiting));
    const profileBadge = document.getElementById("memberBirthdayProfile");
    if (profileBadge) profileBadge.innerHTML = badge(document.getElementById("playerSelect")?.value);
  }
  async function loadDarts() {
    const rows = [];
    try {
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabaseClient.from("dart_results").select("id,player,place,game_id").in("player", Object.keys(D.members)).order("id").range(offset, offset + 999);
        if (error) return;
        rows.push(...data);
        if (data.length < 1000) break;
      }
      Object.keys(D.members).forEach(person => {
        const games = new Map(rows.filter(r => r.player === person && r.game_id != null && r.place >= 1 && r.place <= 6).map(r => [r.game_id, r]));
        dartFacts[person] = { games: games.size, wins: [...games.values()].filter(r => r.place === 1).length };
      });
      render();
    } catch { /* An unavailable statistic is omitted, never estimated. */ }
  }
  async function loadLifetime() {
    const rows = [];
    try {
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabaseClient.from("entries").select("*").order("date").order("person").range(offset, offset + 999);
        if (error) return;
        rows.push(...data);
        if (data.length < 1000) break;
      }
      lifetimeEntries = cleanLoadedEntries(rows); render();
    } catch { /* Keep a previously complete archive; never show a truncated total. */ }
  }
  function confetti() {
    if (!dialog || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const burst = document.createElement("div"); burst.className = "mb-confetti"; burst.setAttribute("aria-hidden", "true");
    for (let i = 0; i < (active.jubilee ? 32 : 14); i++) { const dot = document.createElement("i"); dot.style.setProperty("--x", `${(i * 31) % 100}%`); dot.style.setProperty("--r", `${i * 47}deg`); dot.style.setProperty("--d", `${i % 5 * 40}ms`); burst.append(dot); }
    dialog.append(burst); setTimeout(() => burst.remove(), 1500);
  }
  function closeShow() {
    attempt++; clearTimeout(orderTimer);
    if (active) paused.add(`${active.person}:${active.year}`);
    dialog?.close(); dialog?.remove(); dialog = null; active = null; showing = false; letter = null;
    document.body.classList.remove("wrc-member-birthday-active");
    if (lastFocus?.isConnected) lastFocus.focus();
    render();
  }
  function ownsShow() { return active && active.person === player(); }
  async function openShow(b) {
    if (showing || b.person !== player()) return;
    if (document.querySelector(".wrc-post-overlay.is-visible") || document.getElementById("bigPop")?.style.display === "flex") { setTimeout(maybeOpen, 1600); return; }
    showing = true; active = b; step = 0; letter = null; lastFocus = document.activeElement;
    dialog = document.createElement("dialog"); dialog.className = `mb-dialog${b.jubilee ? " mb-jubilee" : ""}`; dialog.setAttribute("aria-labelledby", "memberBirthdayTitle");
    dialog.addEventListener("cancel", event => { event.preventDefault(); closeShow(); });
    document.body.append(dialog); document.body.classList.add("wrc-member-birthday-active");
    drawStep(); dialog.showModal();
  }
  function drawStep() {
    if (!ownsShow()) { closeShow(); return; }
    const b = active; const name = b.person; const others = Object.keys(D.members).filter(p => p !== name).join(" · ");
    let title, content, button;
    if (step === 0) { title = "🎺 HALT!"; content = `<p class="mb-lead">Heute wird hier nicht einfach trainiert.</p><p>Der WRC hat einen offiziellen Anlass festgestellt.</p><div class="mb-show-age">${name.toUpperCase()} WIRD ${b.age}!</div>${b.date !== D.today() ? `<p>Deine Zeremonie vom ${stamp(b.date)}. Gut, dass du da bist.</p>` : ""}`; button = "👑 Huldigung beginnen"; }
    if (step === 1) { title = `${b.age} Jahre ${name}.`; content = `<div class="mb-jubilee-number">${b.age}</div><p class="mb-lead">Und immer noch punktfähig.</p><p>${b.age} Jahre ${name}. Davon zwar nur ein Bruchteil unter offizieller WRC-Aufsicht – aber was für ein Bruchteil.</p>`; button = "🏆 Zum Lebenswerk"; }
    if (step === 2) { title = `🏆 ${name}s WRC-Lebenswerk`; content = `<p>Was dieser Mann bereits für den Wurstrand geleistet hat.</p>${stats(name)}`; button = "Die Huldigung entgegennehmen"; }
    if (step === 3) { title = "Der WRC verneigt sich."; content = `<div class="mb-bow" aria-hidden="true">🙇</div><p class="mb-lead">Deine Mitwurstrandler verneigen sich vor dir.</p><p>Wir, die versammelten Wurstrandler, würdigen hiermit feierlich die Verdienste von ${name} um Wurst, Rand und körperliche Ertüchtigung.</p><p class="mb-signers">${others}</p>`; button = "🎁 Zum Geburtstagsgeschenk"; }
    if (step === 4) { title = b.jubilee ? "Die Gold-Edition." : "Das Geburtstagsset."; content = `<article class="mb-product"><span class="mb-eyebrow">WRC FANSHOP · ${b.jubilee ? "JUBILÄUMSAUSGABE" : "SONDERAUSGABE"}</span><div class="mb-package" aria-hidden="true">🎁</div><h3>${b.jubilee ? "WRC GOLD-EDITION – JUBILÄUMSSET" : "WRC ORIGINAL – GEBURTSTAGSSET"}</h3><ul><li>🌭 1× Original WRC-Leistungswurst</li><li>👑 1× ${b.jubilee ? "Jubiläumskrone" : "Ehrenkrone"} „${b.age} & noch punktfähig“</li><li>🫘 1× handsignierte Bertha-Sammelbohne</li>${b.jubilee ? "<li>🏅 1× Wurstrand-Verdienstorden am Bande</li>" : ""}</ul><p>Warenwert: ${b.jubilee ? "149,99" : "49,99"} Wurstmark<br><strong>Geburtstagspreis: 0 Punkte</strong></p><div id="memberBirthdayOrder" role="status"></div></article>`; button = "🎁 Geschenk anfordern"; }
    if (step === 5) { title = `Okay ${name}. Eine Sache noch. ❤️`; content = '<p class="mb-lead">Jetzt wird es ruhig.</p><p>Post von deinen Jungs.</p>'; button = "💌 Brief öffnen"; }
    if (step === 6) { title = letter ? `Für ${name}.` : `Alles Gute zum ${b.age}., ${name}!`; content = letter ? `<article class="mb-letter">${letter.paragraphs.map(p => `<p>${esc(p)}</p>`).join("")}</article>` : '<p class="mb-lead">Die Zeremonie ist beendet. Der Wurstrand gehört wieder dir.</p>'; button = "Show schließen"; }
    dialog.classList.toggle("mb-calm", step >= 5);
    dialog.innerHTML = `<div class="mb-dialog-bar"><span>WRC · ${b.year} · ${step < 5 ? "DIE ZEREMONIE" : "PERSÖNLICH"}</span><button type="button" class="mb-close" aria-label="Show für später schließen">×</button></div><div class="mb-scene"><h2 id="memberBirthdayTitle" tabindex="-1">${title}</h2>${content}<button type="button" class="mb-button mb-next">${button}</button>${step < 6 ? '<p class="mb-pace">Du bestimmst das Tempo.</p>' : ""}</div>`;
    dialog.querySelector(".mb-close").addEventListener("click", closeShow);
    dialog.querySelector(".mb-next").addEventListener("click", next);
    dialog.scrollTop = 0; dialog.querySelector("h2").focus();
  }
  async function finalStage() {
    if (!ownsShow()) return;
    step = 6; drawStep();
    // The complete letter (or neutral ending) is visible before persisting completion.
    await D.markSeen(active);
  }
  async function next() {
    if (!ownsShow()) { closeShow(); return; }
    if (step === 6) { closeShow(); return; }
    if (step === 5) { await finalStage(); return; }
    if (step === 4) { orderGift(); return; }
    step++; drawStep(); if (step === 1) confetti();
  }
  function orderGift() {
    const button = dialog.querySelector(".mb-next"); button.disabled = true;
    const status = dialog.querySelector("#memberBirthdayOrder");
    const lines = ["Bestellung wird geprüft …", "Fanshop-Lagerbestand wird kontrolliert …", "Bertha wird konsultiert …"];
    let index = 0;
    function tick() {
      if (!ownsShow()) return;
      if (index < lines.length) { status.textContent = lines[index++]; orderTimer = setTimeout(tick, 850); return; }
      status.innerHTML = '<h3>❌ ANTRAG ABGELEHNT</h3><p>Der WRC-Fanshop weist darauf hin, dass es ihn nicht gibt.</p><p><strong>Du bekommst selbstverständlich nichts.</strong></p><small>Aber der Gedanke zählt.</small>';
      button.disabled = false; button.textContent = "Eine Sache noch …";
      button.removeEventListener("click", next); button.addEventListener("click", prepareLetter, { once: true });
    }
    tick();
  }
  async function prepareLetter() {
    if (!ownsShow()) return;
    const b = active; const path = letters[`${b.person}:${b.year}`]; const token = ++attempt;
    const button = dialog.querySelector(".mb-next"); button.disabled = true;
    if (!path) { await finalStage(); return; }
    try {
      const response = await fetch(path, { cache: "no-cache" });
      if (!response.ok) throw new Error("Brief nicht erreichbar");
      const data = await response.json();
      if (!Array.isArray(data.paragraphs) || !data.paragraphs.length) throw new Error("Brief unvollständig");
      if (token !== attempt || !ownsShow()) return;
      letter = data; step = 5; drawStep();
    } catch {
      if (token !== attempt || !ownsShow()) return;
      button.disabled = false; button.textContent = "Brief erneut laden";
      button.addEventListener("click", prepareLetter, { once: true });
      dialog.querySelector("#memberBirthdayOrder").textContent = "Dein Brief konnte noch nicht geladen werden. Die Show bleibt für dich gespeichert und nachholbar.";
    }
  }
  function maybeOpen() {
    if (!loaded || !showReady || showing || document.hidden) return;
    const b = D.unseen(player());
    if (b && !paused.has(`${b.person}:${b.year}`)) openShow(b);
  }
  async function onEntriesLoaded() {
    loaded = true; render();
    await Promise.all([D.loadSeen(), loadDarts(), loadLifetime()]);
    showReady = true; render(); maybeOpen();
  }
  async function refresh() {
    if (document.hidden) return;
    if (active && active.person !== player()) closeShow();
    const now = D.today();
    if (now !== lastDate) { lastDate = now; paused.clear(); }
    render();
    if (loaded) { await G.load(); await D.loadSeen(); renderAll(); render(); maybeOpen(); }
  }
  document.addEventListener("DOMContentLoaded", () => {
    render();
    document.getElementById("person")?.addEventListener("change", event => {
      if (D.preview) previewPlayer = event.target.value;
      if (active && active.person !== player()) closeShow();
      render(); maybeOpen();
    });
    window.addEventListener("storage", event => { if (event.key === "wrcPostLastPlayer") { if (active && active.person !== player()) closeShow(); render(); maybeOpen(); } });
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    // Re-evaluate the calendar even in a tab left open overnight; no manual reset.
    setInterval(() => { if (D.today() !== lastDate) refresh(); }, 1000);
    setInterval(() => { if (D.celebrating()) refresh(); }, 60000);
  });
  window.WRCMemberBirthdays = Object.freeze({ onEntriesLoaded, render, badge });
})();

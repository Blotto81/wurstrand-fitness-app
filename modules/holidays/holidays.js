(function () {
  "use strict";
  const C = WRCHolidayCalendar, D = WRCHolidayData;
  const labels = { easter: "Die große Eiersuche", halloween: "Wurst oder Saures", nikolaus: "Die amtliche Stiefelkontrolle", christmas: "Post vom WRC-Weihnachtsmann", newyear: "Unser WRC-Jahr" };
  const outcomes = Object.freeze([
    ["🌭 WURST!", "Herzlichen Glückwunsch. Du hast eine virtuelle Wurst gewonnen.", "Warenwert: erschütternd gering."],
    ["👑 DIE EHRENWURST", "Bertha hat deine Wurst zur Ehrenwurst ernannt.", "Sie hat weder zusätzliche Rechte noch einen höheren Fleischanteil."],
    ["📦 LIEFERUNG VERZÖGERT", "Deine Wurst wurde versandt. Wursti war leider gleichzeitig Versandabteilung und Qualitätskontrolle.", "Die Sendung gilt als aufgegessen."],
    ["🧛 DER FLUCH DES WURSTRANDS", "Du bist dazu verdammt, heute mindestens einmal völlig unnötig die WRC zu öffnen.", "Möglicherweise ist der Fluch gerade schon erfüllt."],
    ["👻 BERTHA HAT DICH GESEHEN", "Weitere Einzelheiten wurden aus Gründen des Persönlichkeitsschutzes geschwärzt.", "Bertha erinnert sich trotzdem."],
    ["🕯️ DIE GEISTERPRÜFUNG", "Ein Geist hat deine Ausreden kontrolliert. Er möchte sie in seine Sammlung aufnehmen.", "Selten so lebendige Fantasie bei lebenden Menschen gesehen."]
  ]);
  const busy = new Set(), notices = new Map();
  let previewPlayer = C.previewPlayer, archive = null, archiveYear = null, archiveTask = null;
  let lastDate = D.today(), syncTask = null, initialized = false;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n, digits = 0) => Number(n).toLocaleString("de-DE", { maximumFractionDigits: digits });
  function player() {
    if (D.preview && C.members.includes(previewPlayer)) return previewPlayer;
    if (WRCBirthdayData.preview && C.members.includes(WRCBirthdayData.previewPlayer)) return document.getElementById("person")?.value || WRCBirthdayData.previewPlayer;
    try { const p = localStorage.getItem("wrcPostLastPlayer"); if (C.members.includes(p)) return p; } catch { /* Visible selector is the fallback. */ }
    return document.getElementById("person")?.value;
  }
  const actionKey = (event, p) => `${event.type}:${event.year}:${p}`;
  function make(id, parent, tag = "div") {
    let node = document.getElementById(id);
    if (!node && parent) { node = document.createElement(tag); node.id = id; parent.append(node); }
    return node;
  }
  function stats(year, p = null) {
    if (!archive || archiveYear !== year) return null;
    const history = p ? HISTORIC_PLAYER_TOTALS[p] : HISTORIC_TOTALS;
    return D.yearStats(archive, year, p, D.today(), history);
  }
  function numbers(value, team = false) {
    if (!value?.available) return '<p class="wh-note">Für dieses Jahr liegen noch keine verlässlich zugeordneten Werte vor.</p>';
    const list = team ? [[num(value.steps), "gemeinsame Schritte"], [num(value.bike, 1) + " km", "gemeinsam auf dem Rad"], [num(value.points, 1), "echte WRC-Punkte"], [num(value.days), "dokumentierte Kalendertage"]]
      : [[num(value.points, 1), "WRC-Punkte"], [num(value.steps), "Schritte"], [num(value.bike, 1) + " km", "auf dem Fahrrad"]];
    return `<div class="wh-facts">${list.map(([v, title]) => `<div><strong>${v}</strong><span>${title}</span></div>`).join("")}</div><p class="wh-source">${value.historical ? "Inklusive vorhandener Jahreshistorie. " : ""}${team ? "Dokumentierte Tage zählen gemeinsame Kalendertage, keine geschätzten Trainingstage. " : ""}${value.bonus ? `Darin ${num(value.bonus)} einmalige Geschenkpunkte, getrennt vom Training.` : "Aus den gespeicherten WRC-Einträgen."}</p>`;
  }
  function titles(year) {
    const players = C.members.map(p => ({ name: p, values: stats(year, p) }));
    if (players.some(p => !p.values?.available)) return "";
    return `<div class="wh-titles">${[["steps", "🏃 Schritte-Maschine des Jahres"], ["bike", "🚴 Wurstrand-Radler des Jahres"]].map(([metric, title]) => {
      const best = Math.max(...players.map(p => p.values[metric]));
      if (best <= 0) return "";
      const winners = players.filter(p => p.values[metric] === best).map(p => p.name).join(" · ");
      return `<p><span>${title}</span><strong>${winners}</strong><small>${num(best, metric === "bike" ? 1 : 0)} ${metric === "bike" ? "km" : "Schritte"}${players.filter(p => p.values[metric] === best).length > 1 ? " · geteilter Titel" : ""}</small></p>`;
    }).join("")}</div>`;
  }
  function button(text, action, disabled = false, extra = "") { return `<button type="button" class="wh-button ${extra}" data-wh-action="${action}" ${disabled ? "disabled" : ""}>${text}</button>`; }
  function render() {
    const dashboard = document.getElementById("dashboard"); if (!dashboard) return;
    const event = C.resolve(D.today()), p = player();
    const host = make("wrcHolidayEvent", dashboard, "section");
    const birthday = document.getElementById("memberBirthdayHero");
    if (birthday && birthday.nextElementSibling !== host) birthday.after(host);
    host.hidden = !event || !C.members.includes(p);
    renderEggs(event, p);
    renderLedger();
    if (host.hidden) { host.replaceChildren(); return; }
    const saved = D.receipt(event.type, p, event.year), key = actionKey(event, p);
    const pending = busy.has(key), disabled = pending || !D.ready;
    host.className = `wh-card wh-${event.type}`;
    host.setAttribute("aria-label", labels[event.type]);
    let body = "";
    if (event.type === "easter") {
      body = `<div class="wh-compact-icon" aria-hidden="true">🐰</div><div><span class="wh-eyebrow">OSTERN · ${event.year}</span><h2>Wursti hat ein Problem.</h2><p>Vier Ostereier waren eben noch da. Jetzt sind sie irgendwo in der WRC verteilt. Eines davon gehört dir.</p><p class="wh-highlight">${saved ? "✅ Dein Osterei wurde gefunden. +5 Punkte sind im Korb." : "🥚 Finde dein Ei und sichere dir +5 WRC-Punkte."}</p><small>Die Suche läuft bis Ostermontag, 23:59 Uhr. Bertha verrät nichts.</small></div>`;
    } else if (event.type === "halloween") {
      body = `<span class="wh-eyebrow">31. OKTOBER · EINE ENTSCHEIDUNG</span><h2>Wurst oder Saures?</h2><p>Wursti behauptet, hinter einer dieser Türen befinde sich etwas Wertvolles.<br><span class="wh-note">Bertha bestreitet das.</span></p>`;
      if (saved) {
        const result = outcomes[saved.result];
        body += `<div class="wh-reveal"><h3>${result[0]}</h3><p>${result[1]}</p><small>${result[2]}</small><p class="wh-note">Deine Tür ${event.year}: ${saved.choice === 0 ? "WURST" : "SAURES"}. Ergebnis gespeichert. Keine Punkte, nur Schicksal.</p></div>`;
      } else body += `<div class="wh-doors">${button('<span aria-hidden="true">🚪</span><strong>WURST</strong>', "door-0", disabled, "wh-door")}${button('<span aria-hidden="true">🚪</span><strong>SAURES</strong>', "door-1", disabled, "wh-door")}</div><p class="wh-note">Einmal wählen. Für dieses Jahr. Bertha führt Buch.</p>`;
    } else if (event.type === "nikolaus") {
      body = `<span class="wh-eyebrow">6. DEZEMBER · WRC-STIEFELKONTROLLE</span><h2>Der Nikolaus war da.</h2><p>Und er hat in deinen WRC-Stiefel geschaut.<br>Das Ergebnis ist leider aktenkundig.</p>`;
      if (saved) body += `<article class="wh-certificate"><span class="wh-stamp">GEPRÜFT<br>WRC ${event.year}</span><span class="wh-eyebrow">PERSÖNLICHE WRC-BESCHEINIGUNG</span><h3>Für ${p}.</h3>${numbers(stats(event.year, p))}<p>${stats(event.year, p)?.available ? "Davon waren erstaunlich viele Punkte sogar regelkonform." : "Die Akte enthält keine erfundenen Leistungen."}</p><ul><li>☑ Einträge geprüft</li><li>☑ Keine Nikolaus-Extrapunkte vergeben</li><li>☑ Weitere Beobachtung erforderlich</li></ul><footer>Gezeichnet: Wursti, amtierender WRC-Nikolaus 🌭</footer></article>`;
      else body += `<div class="wh-object" aria-hidden="true">🥾</div>${button("🥾 Stiefel öffnen", "open", disabled || !archive)}`;
    } else if (event.type === "christmas") {
      body = `<div class="wh-tree" aria-hidden="true">🎄</div><span class="wh-eyebrow">24.–26. DEZEMBER · VON WURSTI</span><h2>Da liegt etwas für dich.</h2><p class="wh-gift-label">Von: Wursti 🌭<br>An: <strong>${p}</strong></p>`;
      if (saved) body += '<div class="wh-reveal"><h3>Frohe Weihnachten! ❤️</h3><p>Wursti hat heute ausnahmsweise nicht nur an sich selbst gedacht.</p><strong class="wh-five">+5 WRC-Punkte</strong><p class="wh-note">Dein Geschenk ist ausgepackt und dauerhaft gespeichert.</p></div>';
      else body += `<div class="wh-object wh-present" aria-hidden="true">🎁</div>${button("🎁 Wurstis Geschenk öffnen", "open", disabled)}<p class="wh-note">Bis zum 26. Dezember, 23:59 Uhr, wartet es auf dich.</p>`;
    } else {
      body = `<span class="wh-eyebrow">31. DEZEMBER · WIR VIER</span><h2>Das war unser WRC-Jahr ${event.year}.</h2><div class="wh-team">${C.members.map(name => `<figure><img src="${esc(playerProfiles[name].image)}" alt="WRC-Playerkarte von ${name}"><figcaption>${name}</figcaption></figure>`).join("")}</div>${archive ? numbers(stats(event.year), true) + titles(event.year) : '<p class="wh-note">Das gemeinsame Jahresarchiv wird geladen …</p>'}`;
      body += saved ? `<div class="wh-year-ending"><p>Punkte gesammelt.<br>Grenzen verschoben.<br>Würste gerandet.</p><strong>Auf uns vier. Auf ${event.year + 1}. 🌭❤️</strong></div>` : button("🎆 Auf uns vier!", "open", disabled || !archive);
      body += '<p class="wh-note">Unser gemeinsamer Abschluss. Dein persönlicher Year Review bleibt separat in der WRC-Jahrespost.</p>';
    }
    host.innerHTML = body + `<div class="wh-status" role="status">${esc(notices.get(key) || (pending ? "Wursti kümmert sich …" : !D.ready ? "Verbindung wird geprüft. Geschenke erst nach Bestätigung verfügbar." : ""))}</div>${D.preview ? '<p class="wh-preview-label">Lokale Vorschau · keine echten Feiertags- oder Geburtstagspunkte</p>' : ""}`;
    host.querySelectorAll("[data-wh-action]").forEach(node => node.addEventListener("click", () => act(event, p, node.dataset.whAction)));
  }
  function renderEggs(event, p) {
    const targets = [document.getElementById("dashboardHighlight")?.parentElement, document.querySelector("#eintragen > .card"), document.querySelector("#analyse .analysis-header"), document.querySelector("#spieler > .card")];
    targets.forEach((target, slot) => {
      const mount = make(`wrcHolidayEgg${slot}`, target); if (!mount) return;
      mount.className = "wh-egg-wrap"; mount.hidden = event?.type !== "easter";
      if (mount.hidden) { mount.replaceChildren(); return; }
      const key = actionKey(event, p), note = notices.get(`${key}:egg:${slot}`);
      mount.innerHTML = `<button type="button" class="wh-egg" aria-label="Verstecktes Osterei öffnen" ${busy.has(key) || !D.ready ? "disabled" : ""}><span aria-hidden="true">🥚</span></button><span class="wh-egg-answer" role="status">${esc(note || "")}</span>`;
      mount.querySelector("button").addEventListener("click", () => {
        const owner = C.eggOwner(event.year, slot);
        if (owner !== p) { notices.set(`${key}:egg:${slot}`, `🥚 Finger weg! Das ist ${owner}s Ei. Such dir gefälligst dein eigenes. 😏`); render(); return; }
        if (D.receipt("easter", p, event.year)) { notices.set(`${key}:egg:${slot}`, "✅ Bereits gefunden. Deine +5 Punkte sind sicher im Korb."); render(); return; }
        act(event, p, "egg", slot);
      });
    });
  }
  function renderLedger() {
    const ledger = make("wrcHolidayLedger", document.getElementById("entriesList")?.parentElement);
    if (!ledger) return;
    const rows = D.matching({ key: selectedMonth() }); ledger.hidden = !rows.length; ledger.className = "wh-ledger";
    ledger.innerHTML = rows.length ? `<strong>🎁 Feiertagsboni · getrennt vom Training</strong>${rows.map(row => `<p>${esc(row.gift_date)} · ${row.recipient}: ${row.label} · +5 Punkte</p>`).join("")}` : "";
  }
  async function act(event, p, action, slot) {
    const key = actionKey(event, p); if (busy.has(key)) return;
    busy.add(key); notices.delete(key); render();
    const host = document.getElementById("wrcHolidayEvent"); host?.classList.add("wh-opening");
    try {
      const [saved] = await Promise.all([D.claim(event.type, p, { slot, choice: action.startsWith("door-") ? Number(action.slice(-1)) : undefined }), new Promise(resolve => setTimeout(resolve, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 850))]);
      if (event.type === "easter") notices.set(`${key}:egg:${slot}`, `🥚 GEFUNDEN! Das ist tatsächlich dein Ei, ${p}! +5 Punkte sind gespeichert. Wursti gratuliert. Bertha behauptet, sie hätte es besser versteckt.`);
      busy.delete(key); renderAll(); render();
      if (saved.points && player() === p && C.resolve(D.today())?.type === event.type) burst(event.type);
      if (event.type === "newyear" && player() === p) burst("newyear");
    } catch (error) { busy.delete(key); notices.set(key, error.message); if (slot !== undefined) notices.set(`${key}:egg:${slot}`, error.message); render(); }
  }
  function burst(type) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.body.classList.contains("wrc-member-birthday-active")) return;
    const host = document.getElementById("wrcHolidayEvent"); if (!host) return;
    const layer = document.createElement("div"); layer.className = `wh-burst wh-burst-${type}`; layer.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 20; i++) { const dot = document.createElement("i"); dot.style.setProperty("--x", `${(i * 37) % 100}%`); dot.style.setProperty("--r", `${i * 41}deg`); dot.style.setProperty("--d", `${i % 4 * 60}ms`); layer.append(dot); }
    host.append(layer); setTimeout(() => layer.remove(), 1600);
  }
  async function loadArchive(event) {
    if (!["nikolaus", "newyear"].includes(event?.type)) return;
    if (archiveTask) return archiveTask;
    const requestedYear = event.year;
    archiveTask = (async () => {
      try {
        const rows = [];
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await supabaseClient.from("entries").select("*").gte("date", `${requestedYear}-01-01`).lte("date", D.today()).order("date").order("person").range(offset, offset + 999);
          if (error) throw error;
          rows.push(...data); if (data.length < 1000) break;
        }
        archive = cleanLoadedEntries(rows); archiveYear = requestedYear;
      } catch { notices.set(actionKey(event, player()), "Das Jahresarchiv ist gerade nicht erreichbar. Bitte später erneut laden."); }
      finally { archiveTask = null; render(); }
    })();
    return archiveTask;
  }
  async function onEntriesLoaded() { initialized = true; render(); await loadArchive(C.resolve(D.today())); }
  async function refresh() {
    if (document.hidden) return;
    if (lastDate !== D.today()) { lastDate = D.today(); archive = null; archiveYear = null; render(); }
    if (!initialized || syncTask) return;
    syncTask = (async () => { await D.load(); await loadArchive(C.resolve(D.today())); renderAll(); })();
    try { await syncTask; } finally { syncTask = null; }
  }
  document.addEventListener("DOMContentLoaded", () => {
    render();
    document.getElementById("person")?.addEventListener("change", event => { if (D.preview) previewPlayer = event.target.value; render(); });
    window.addEventListener("storage", event => { if (event.key === "wrcPostLastPlayer") render(); });
    window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", refresh);
    setInterval(() => { if (D.today() !== lastDate) refresh(); }, 1000);
    setInterval(() => { if (C.resolve(D.today())) refresh(); }, 60000);
  });
  window.WRCHolidays = Object.freeze({ render, onEntriesLoaded });
})();

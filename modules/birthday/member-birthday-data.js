/* Member birthdays and a separate, append-only points ledger. Fitness entries stay untouched. */
(function () {
  "use strict";
  const members = Object.freeze({ Thorsten: "1981-05-20", Marian: "1976-10-09", Basti: "1982-02-21", Fabi: "1976-09-25" });
  const launchDate = "2026-09-24";
  const params = new URLSearchParams(location.search);
  const previewDate = params.get("member-birthday");
  const preview = ["localhost", "127.0.0.1"].includes(location.hostname) && /^\d{4}-\d{2}-\d{2}$/.test(previewDate || "") && !Number.isNaN(new Date(previewDate + "T12:00:00").getTime());
  const cacheKey = preview ? "wrcBirthdayPreviewGifts_v1" : "wrcBirthdayGifts_v1";
  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Server remains authoritative. */ } }
  function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
  function today() { return preview ? previewDate : dateKey(); }
  function birthday(person, year) {
    if (!members[person]) return null;
    const age = year - Number(members[person].slice(0, 4));
    return { person, year, age, date: `${year}-${members[person].slice(5)}`, jubilee: age > 0 && age % 10 === 0 };
  }
  function celebrating(date = today()) { return Object.keys(members).map(p => birthday(p, Number(date.slice(0, 4)))).find(b => b.date === date) || null; }
  function pending(person, seen = [], date = today()) {
    if (!members[person]) return null;
    // Never manufacture a backlog for birthdays before this feature existed.
    for (let year = 2026; year <= Number(date.slice(0, 4)); year++) {
      const b = birthday(person, year);
      if (b.date >= launchDate && b.date <= date && !seen.some(s => s.player === person && s.birthday_year === year)) return b;
    }
    return null;
  }
  function validGift(g) { return members[g.recipient] && members[g.giver] && g.recipient !== g.giver && g.points === 5 && Number.isInteger(g.birthday_year) && g.gift_date === birthday(g.recipient, g.birthday_year).date; }
  function clean(rows) {
    const unique = new Map();
    (Array.isArray(rows) ? rows : []).filter(validGift).forEach(g => unique.set(`${g.recipient}:${g.birthday_year}:${g.giver}`, g));
    return [...unique.values()];
  }
  let gifts = clean(read(cacheKey, []));
  let ready = preview;
  let inFlight = null;
  function matching(scope = {}) {
    return gifts.filter(g => (!scope.person || g.recipient === scope.person) && (!scope.key || g.gift_date.startsWith(scope.key)) && (!scope.date || g.gift_date === scope.date) && (!scope.from || g.gift_date >= scope.from) && (!scope.through || g.gift_date <= scope.through));
  }
  function points(scope = {}) { return matching(scope).reduce((sum, g) => sum + g.points, 0); }
  async function load() {
    if (preview) { gifts = clean(read(cacheKey, [])); return true; }
    if (inFlight) return inFlight;
    inFlight = (async () => {
      try {
        const rows = [];
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await supabaseClient.from("wrc_birthday_gifts").select("recipient,giver,birthday_year,gift_date,points").order("gift_date").order("recipient").order("giver").range(offset, offset + 999);
          if (error) throw error;
          rows.push(...data);
          if (data.length < 1000) break;
        }
        gifts = clean(rows); write(cacheKey, gifts); ready = true; return true;
      } catch (error) { ready = false; console.warn("Geburtstagsgeschenke konnten nicht synchronisiert werden.", error.message); return false; }
      finally { inFlight = null; }
    })();
    return inFlight;
  }
  async function give(giver, recipient) {
    const b = celebrating();
    if (!ready || !b || b.person !== recipient || !members[giver] || giver === recipient) throw new Error("Dieses Geschenk ist heute nicht möglich.");
    if (preview) gifts = clean(read(cacheKey, []));
    if (matching({ person: recipient, date: b.date }).some(g => g.giver === giver)) throw new Error("Du hast bereits +5 Punkte verschenkt.");
    const gift = { recipient, giver, birthday_year: b.year, gift_date: b.date, points: 5 };
    if (!preview) {
      const { error } = await supabaseClient.from("wrc_birthday_gifts").insert(gift);
      if (error) { await load(); throw new Error(error.code === "23505" ? "Du hast bereits +5 Punkte verschenkt." : "Nicht gespeichert. Bitte Verbindung und Geburtstag prüfen und erneut versuchen."); }
    }
    gifts = clean([...gifts, gift]); write(cacheKey, gifts);
    return gift;
  }
  const seenKey = preview ? "wrcBirthdayPreviewSeen_v1" : "wrcBirthdaySeen_v1";
  let seen = read(seenKey, []);
  if (!Array.isArray(seen)) seen = [];
  async function loadSeen() {
    if (preview) { seen = read(seenKey, []); return; }
    const { data, error } = await supabaseClient.from("wrc_birthday_shows").select("player,birthday_year");
    if (!error) {
      const combined = new Map([...seen, ...data].map(s => [`${s.player}:${s.birthday_year}`, s]));
      seen = [...combined.values()]; write(seenKey, seen);
      // Retry local receipts from a previously interrupted/offline completion.
      for (const s of seen.filter(s => !data.some(d => d.player === s.player && d.birthday_year === s.birthday_year))) await supabaseClient.from("wrc_birthday_shows").insert(s);
    }
  }
  async function markSeen(b) {
    const receipt = { player: b.person, birthday_year: b.year };
    if (!seen.some(s => s.player === b.person && s.birthday_year === b.year)) seen.push(receipt);
    write(seenKey, seen);
    if (!preview) {
      const { error } = await supabaseClient.from("wrc_birthday_shows").insert(receipt);
      return !error || error.code === "23505";
    }
    return true;
  }
  function lifetime(person, entries, historic = {}, score = calcPoints) {
    const own = entries.filter(e => e.person === person);
    if (!own.length && !historic.points) return null;
    const totals = { points: historic.points || 0, steps: historic.steps || 0, bike: historic.bike || 0, exercises: historic.exercises || 0 };
    const days = new Map();
    own.forEach(e => {
      const value = score(e).total;
      totals.points += value; totals.steps += Number(e.steps) || 0; totals.bike += Number(e.bike) || 0; totals.exercises += e.exercise ? 1 : 0;
      days.set(e.date, (days.get(e.date) || 0) + value);
    });
    totals.points += points({ person });
    return { ...totals, days: days.size, first: [...days.keys()].sort()[0], best: [...days].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] };
  }
  window.WRCBirthdayData = Object.freeze({ members, preview, previewPlayer: preview && params.get("birthday-player"), birthday, celebrating, pending, today, dateKey, validGift, lifetime, loadSeen, markSeen, unseen: person => pending(person, seen) });
  window.WRCBirthdayGifts = Object.freeze({ points, matching, give, load, get ready() { return ready; } });
})();

(function () {
  "use strict";
  const C = WRCHolidayCalendar;
  const preview = C.preview || WRCBirthdayData.preview;
  const key = preview ? "wrcHolidayPreview_v1" : "wrcHolidayReceipts_v1";
  const read = () => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
  const persist = () => { try { localStorage.setItem(key, JSON.stringify(rows)); } catch { /* Database receipt is authoritative. */ } };
  function today() { return C.previewDate || (WRCBirthdayData.preview ? WRCBirthdayData.today() : C.dateKey()); }
  function clean(data) {
    const unique = new Map();
    (Array.isArray(data) ? data : []).forEach(r => {
      const event = C.resolve(r.event_date);
      if (!C.members.includes(r.player) || !event || event.type !== r.event_type || event.year !== r.event_year) return;
      if (r.points !== (["easter", "christmas"].includes(r.event_type) ? 5 : 0)) return;
      if (r.event_type === "halloween" && (!Number.isInteger(r.result) || r.result < 0 || r.result > 5 || ![0, 1].includes(r.choice) || Math.floor(r.result / 3) !== r.choice)) return;
      unique.set(`${r.event_type}:${r.event_year}:${r.player}`, r);
    });
    return [...unique.values()];
  }
  let rows = clean(read()), ready = preview, loading = null;
  function receipt(type, player, year) { return rows.find(r => r.event_type === type && r.player === player && r.event_year === year) || null; }
  function matching(scope = {}) {
    return rows.filter(r => r.points && (!scope.person || r.player === scope.person) && (!scope.key || r.event_date.startsWith(scope.key)) && (!scope.date || r.event_date === scope.date) && (!scope.from || r.event_date >= scope.from) && (!scope.through || r.event_date <= scope.through))
      .map(r => ({ recipient: r.player, gift_date: r.event_date, points: r.points, event_type: r.event_type, label: r.event_type === "easter" ? "WRC-Osterei gefunden" : "Weihnachtsgeschenk von Wursti" }));
  }
  async function load() {
    if (preview) { rows = clean(read()); ready = true; return true; }
    if (loading) return loading;
    loading = (async () => {
      try {
        const all = [];
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await supabaseClient.from("wrc_holiday_events").select("event_type,event_year,player,event_date,points,choice,result").order("event_year").order("event_type").order("player").range(offset, offset + 999);
          if (error) throw error;
          all.push(...data); if (data.length < 1000) break;
        }
        rows = clean(all); ready = true; persist(); return true;
      } catch (error) { ready = false; console.warn("Feiertagsbelege konnten nicht synchronisiert werden.", error.message); return false; }
      finally { loading = null; }
    })();
    return loading;
  }
  async function claim(type, player, options = {}) {
    const event = C.resolve(today());
    if (!event || event.type !== type || !C.members.includes(player)) throw new Error("Dieser Feiertagsmoment ist jetzt nicht verfügbar.");
    if (type === "easter" && C.eggOwner(event.year, options.slot) !== player) throw new Error("Dieses Ei gehört einem anderen Wurstrandler.");
    if (type === "halloween" && ![0, 1].includes(options.choice)) throw new Error("Bitte wähle eine der beiden Türen.");
    if (!ready) throw new Error("Noch keine Verbindung bestätigt. Bitte erneut laden.");
    if (preview) rows = clean(read());
    const existing = receipt(type, player, event.year);
    if (existing) return existing;
    let saved;
    if (preview) {
      saved = { event_type: type, event_year: event.year, player, event_date: event.date, points: ["easter", "christmas"].includes(type) ? 5 : 0, choice: type === "halloween" ? options.choice : null, result: type === "halloween" ? options.choice * 3 + Math.floor(Math.random() * 3) : null };
    } else {
      const { data, error } = await supabaseClient.rpc("claim_wrc_holiday", { p_event: type, p_player: player, p_choice: options.choice ?? null, p_egg_slot: options.slot ?? null });
      if (error) { await load(); throw new Error("Nicht bestätigt. Bitte Verbindung prüfen und erneut versuchen. Bereits gespeicherte Geschenke gehen nicht verloren."); }
      saved = Array.isArray(data) ? data[0] : data;
      if (clean([saved]).length !== 1) throw new Error("Ungültiger Feiertagsbeleg. Bitte erneut laden.");
    }
    rows = clean([...rows, saved]); persist(); return saved;
  }
  function yearStats(entries, year, player = null, through = today(), historical = {}, birthdayGifts = WRCBirthdayGifts.matching) {
    const own = entries.filter(e => (!player || e.person === player) && C.members.includes(e.person) && (e.date || "").startsWith(`${year}-`) && e.date <= through);
    const h = year === 2026 && through >= "2026-04-30" ? historical : {};
    const points = own.reduce((sum, e) => sum + calcPoints(e).total, h.points || 0);
    const scope = { person: player, key: `${year}-`, through };
    const bonus = [...birthdayGifts(scope), ...matching(scope)].reduce((sum, g) => sum + g.points, 0);
    return { available: own.length > 0 || Object.keys(h).length > 0, points: points + bonus, bonus,
      steps: own.reduce((sum, e) => sum + (+e.steps || 0), h.steps || 0), bike: own.reduce((sum, e) => sum + (+e.bike || 0), h.bike || 0),
      days: new Set(own.map(e => e.date)).size, first: own.map(e => e.date).sort()[0] || null, historical: Object.keys(h).length > 0 };
  }
  window.WRCHolidayData = Object.freeze({ today, preview, load, claim, matching, receipt, yearStats, get ready() { return ready; } });
  // Read-only aggregation boundary. Existing birthday storage/behaviour stays intact.
  window.WRCBonusPoints = Object.freeze({
    points: scope => WRCBirthdayGifts.points(scope) + matching(scope).reduce((sum, row) => sum + row.points, 0),
    matching: scope => [...WRCBirthdayGifts.matching(scope), ...matching(scope)],
    load: () => Promise.all([WRCBirthdayGifts.load(), load()])
  });
})();

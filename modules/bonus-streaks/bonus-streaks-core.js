/* Pure replay of WRC's existing daily bonus. No points or stored entries are changed. */
(function (root) {
  "use strict";
  const START = "2026-05-01";
  const MONTHLY_FROM = "2026-11-01";
  const NO_ALLOWANCES_FROM = "2026-11-12";
  const MILESTONES = Object.freeze([7, 14, 30, 60, 100, 180, 365]);
  function today(now = new Date()) {
    // Same local calendar day as the WRC entry form and birthday modules.
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }
  function nextDay(date) {
    const value = new Date(date + "T12:00:00Z");
    value.setUTCDate(value.getUTCDate() + 1);
    return value.toISOString().slice(0, 10);
  }
  function validDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return false;
    const value = new Date(date + "T12:00:00Z");
    return !Number.isNaN(+value) && value.toISOString().slice(0, 10) === date;
  }
  function calculate(entries, player, asOf = today(), score = root.calcPoints, rulesVersion = 3) {
    if (![1, 2, 3].includes(rulesVersion)) throw new Error("Unknown streak rules version");
    if (!validDate(asOf)) throw new Error("Invalid streak date");
    if (typeof score !== "function") throw new Error("WRC calcPoints is required");
    const bonuses = new Set();
    // Input is the app's cleanLoadedEntries output (one merged activity per person/day).
    for (const entry of entries || []) {
      if (entry.person === player && validDate(entry.date) && entry.date >= START && entry.date <= asOf && score(entry).bonus > 0) bonuses.add(entry.date);
    }
    let current = 0, record = 0, misses = 0, seriesStart = null, recordDate = null;
    let month = "", used = 0;
    const days = [], patches = [];
    const earned = new Set();
    for (let date = START; date <= asOf; date = nextDay(date)) {
      // Version 1 remains immutable for previously frozen annual stories.
      // Version 2 replays two internal allowances per player/calendar month.
      if (date.slice(0, 7) !== month) { month = date.slice(0, 7); used = 0; }
      let status, broke = false;
      if (bonuses.has(date)) {
        if (!current) seriesStart = date;
        current++;
        misses = 0;
        status = "bonus";
        if (current > record) { record = current; recordDate = date; }
        if (MILESTONES.includes(current) && !earned.has(current)) {
          patches.push({ milestone: current, date, seriesStart });
          earned.add(current);
        }
      } else if (date === asOf) {
        status = "open";
      } else {
        status = "miss";
        if (current > 0) {
          const noAllowance = rulesVersion === 3 && date >= NO_ALLOWANCES_FROM;
          const monthly = rulesVersion >= 2 && date >= MONTHLY_FROM;
          const keep = !noAllowance && (monthly ? used < 2 : ++misses === 1);
          if (keep) { if (monthly) used++; status = "pause"; }
          else { current = 0; seriesStart = null; broke = true; }
        }
      }
      days.push({ date, status, current, broke, seriesStart });
    }
    return { player, start: START, asOf, current, record, recordDate, seriesStart, days, patches };
  }
  function achievement(before, after, activityDate) {
    const oldDay = before.days.find(day => day.date === activityDate);
    const day = after.days.find(item => item.date === activityDate);
    if (!day || day.status !== "bonus" || oldDay?.status === "bonus") return null;
    const patches = after.patches.filter(p => !before.patches.some(old => old.milestone === p.milestone));
    if (!patches.length) return null;
    return {
      player: after.player, date: activityDate, count: day.current,
      backdated: activityDate < after.asOf,
      patches
    };
  }
  root.WRCBonusStreakCore = Object.freeze({ START, MONTHLY_FROM, NO_ALLOWANCES_FROM, MILESTONES, today, nextDay, calculate, achievement });
})(typeof window === "undefined" ? globalThis : window);

/* Pure replay of WRC's existing daily bonus. No points or stored entries are changed. */
(function (root) {
  "use strict";
  const START = "2026-05-01";
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
  function calculate(entries, player, asOf = today(), score = root.calcPoints) {
    if (!validDate(asOf)) throw new Error("Invalid streak date");
    if (typeof score !== "function") throw new Error("WRC calcPoints is required");
    const bonuses = new Set();
    // Input is the app's cleanLoadedEntries output (one merged activity per person/day).
    for (const entry of entries || []) {
      if (entry.person === player && validDate(entry.date) && entry.date >= START && entry.date <= asOf && score(entry).bonus > 0) bonuses.add(entry.date);
    }
    let current = 0, record = 0, misses = 0, seriesStart = null, recordDate = null;
    const days = [], patches = [];
    const earned = new Set();
    for (let date = START; date <= asOf; date = nextDay(date)) {
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
          misses++;
          if (misses === 1) status = "pause";
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
  root.WRCBonusStreakCore = Object.freeze({ START, MILESTONES, today, nextDay, calculate, achievement });
})(typeof window === "undefined" ? globalThis : window);

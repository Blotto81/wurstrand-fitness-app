(function () {
  "use strict";
  const members = Object.freeze(["Thorsten", "Fabi", "Marian", "Basti"]);
  function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
  function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value || "") && dateKey(new Date(value + "T12:00:00")) === value; }
  function easter(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31), day = (h + l - 7 * m + 114) % 31 + 1;
    return dateKey(new Date(year, month - 1, day, 12));
  }
  function resolve(date = dateKey()) {
    if (!validDate(date)) return null;
    const year = Number(date.slice(0, 4)), md = date.slice(5), sunday = easter(year);
    const monday = new Date(sunday + "T12:00:00"); monday.setDate(monday.getDate() + 1);
    const type = date >= sunday && date <= dateKey(monday) ? "easter"
      : md === "10-31" ? "halloween" : md === "12-06" ? "nikolaus"
      : md >= "12-24" && md <= "12-26" ? "christmas" : md === "12-31" ? "newyear" : null;
    return type ? { type, year, date } : null;
  }
  // Four stable slots, rotated every year. SQL uses precisely the same mapping.
  function eggOwner(year, slot) { return Number.isInteger(slot) && slot >= 0 && slot < 4 ? members[(year + slot) % 4] : null; }
  const params = new URLSearchParams(location.search);
  const preview = ["localhost", "127.0.0.1"].includes(location.hostname) && validDate(params.get("holiday"));
  const previewDate = preview ? params.get("holiday") : null;
  if (preview) {
    // Reuse the existing birthday sandbox before its scripts load. A holiday
    // preview must never accidentally enable a production birthday gift either.
    const url = new URL(location.href);
    url.searchParams.set("member-birthday", previewDate);
    if (members.includes(params.get("holiday-player"))) url.searchParams.set("birthday-player", params.get("holiday-player"));
    const event = resolve(previewDate);
    const season = { easter: "easter", halloween: "halloween", nikolaus: "christmas", christmas: "christmas", newyear: "newyear" }[event?.type];
    if (season && !url.searchParams.has("season")) url.searchParams.set("season", season);
    history.replaceState(history.state, "", url);
  }
  window.WRCHolidayCalendar = Object.freeze({ members, dateKey, validDate, easter, resolve, eggOwner, preview, previewDate, previewPlayer: preview ? params.get("holiday-player") : null });
})();

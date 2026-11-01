(function () {
  const delivered = new Set();
  let latestEntries = null;
  let pending = false;
  let retryTimer = null;

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      return;
    }
  }

  function normalizePlayer(player) {
    return String(player || "WRC-Team")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .toLowerCase() || "wrc-team";
  }

  function selectedPlayer() {
    const configuredPeople = typeof people !== "undefined" ? people : [];
    return document.getElementById("person")?.value
      || storageGet("wrcPostLastPlayer")
      || configuredPeople[0]
      || "WRC-Team";
  }

  function firstEntryDate(entries) {
    return entries
      .map(entry => String(entry.date || ""))
      .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date))
      .sort()[0] || "";
  }

  function birthdayAge(entries, year) {
    return Math.max(0, year - 2026);
  }

  function birthdayText(age) {
    if (age === null) {
      return [
        "Heute feiern wir Geburtstag.",
        "Aus ersten Ideen wurde eine gemeinsame WRC-Geschichte.",
        "Danke, dass du ein Teil davon bist."
      ];
    }

    if (age === 0) {
      return [
        "Heute feiern wir den Anfang der WRC.",
        "Aus den ersten Einträgen wird gerade eine gemeinsame Geschichte.",
        "Danke, dass du von Anfang an dabei bist."
      ];
    }

    return [
      `Heute wird die WRC ${age} ${age === 1 ? "Jahr" : "Jahre"} alt.`,
      `Vor ${age} ${age === 1 ? "Jahr" : "Jahren"} begann unsere gemeinsame WRC-Geschichte.`,
      "Danke, dass du Teil dieser Geschichte bist."
    ];
  }

  function shouldShow(date, player, preview = false) {
    if (preview) return true;
    if (date.getMonth() !== 1 || date.getDate() !== 1) return false;
    return !storageGet(`wrcBirthdayShown_${date.getFullYear()}_${normalizePlayer(player)}`);
  }

  function showBirthday(entries, player, year, preview) {
    if (typeof WRCPost === "undefined") return false;

    const age = birthdayAge(entries, year);
    const sender = year % 2 === 0 ? "Bertha" : "Wursti";
    const shown = WRCPost.show({
      sender,
      rarity: "legendär",
      text: birthdayText(age)
    }, {
      heading: "🎉 Alles Gute zum Geburtstag, WRC!",
      badge: age > 0 ? `${age}. WRC-Geburtstag` : "WRC-Geburtstag",
      signature: sender === "Wursti"
        ? "– Dein Wursti 🌭"
        : "Liebe Grüße\nBertha 🫘"
    });

    if (shown) delivered.add(year + ":" + normalizePlayer(player));
    if (shown && !preview) {
      storageSet(
        `wrcBirthdayShown_${year}_${normalizePlayer(player)}`,
        new Date().toISOString()
      );
    }

    return shown;
  }

  function context() {
    const now = new Date();
    const params = new URLSearchParams(location.search);
    const preview = ["localhost", "127.0.0.1"].includes(location.hostname) && params.get("birthday") === "1";
    const parts = new Intl.DateTimeFormat("en-CA", {timeZone:"Europe/Berlin",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
    const part = type => Number(parts.find(p=>p.type===type).value);
    const date = new Date(part("year"),part("month")-1,part("day"),12);
    const requested = Number(params.get("birthday-year"));
    const year = preview && Number.isInteger(requested) && requested >= 2027 && requested <= 9999 ? requested : date.getFullYear();
    return {date,year,preview,player:selectedPlayer()};
  }
  function blocked() {
    return document.hidden || document.body.classList.contains("wrc-post-active")
      || document.body.classList.contains("wrc-member-birthday-active")
      || document.querySelector('dialog[open],.bigpop.show');
  }
  function queue() {
    clearTimeout(retryTimer);
    retryTimer = setTimeout(check, 900);
  }
  function greetingButton(ctx) {
    document.getElementById("wrcBirthdayGreeting")?.remove();
    const button = document.createElement("button");
    button.id = "wrcBirthdayGreeting";
    button.className = "wb-greeting";
    button.textContent = "🎂 Geburtstagsbrief öffnen";
    button.onclick = () => {
      if (context().player !== ctx.player || (!ctx.preview && !shouldShow(context().date,ctx.player))) { button.remove(); queue(); return; }
      if (showBirthday(latestEntries,ctx.player,ctx.year,ctx.preview)) button.remove();
    };
    document.body.append(button);
  }
  function check() {
    if (pending || !latestEntries) return;
    const ctx = context();
    if (delivered.has(ctx.year + ":" + normalizePlayer(ctx.player)) || !shouldShow(ctx.date,ctx.player,ctx.preview) || ctx.year < 2027) {
      document.getElementById("wrcBirthdayGreeting")?.remove();
      return;
    }
    if (document.getElementById("wrcBirthdayGreeting")) return;
    if (blocked()) { queue(); return; }
    const introKey = "wrcBirthdayIntro_"+ctx.year+"_"+normalizePlayer(ctx.player);
    if (!ctx.preview && storageGet(introKey)) {
      if (!showBirthday(latestEntries,ctx.player,ctx.year,false)) queue();
      return;
    }
    pending = true;
    const finish = reason => {
      pending = false;
      if (!ctx.preview) storageSet(introKey,new Date().toISOString());
      if (reason === "close") { greetingButton(ctx); return; }
      if (!showBirthday(latestEntries,ctx.player,ctx.year,ctx.preview)) greetingButton(ctx);
    };
    if (typeof WRCBirthdayScene === "undefined" || !WRCBirthdayScene.show(birthdayAge(latestEntries,ctx.year),finish)) {
      pending = false;
      if (!showBirthday(latestEntries,ctx.player,ctx.year,ctx.preview)) queue();
    }
  }
  function onEntriesLoaded(entries) {
    if (!Array.isArray(entries)) return;
    latestEntries = entries;
    queue();
  }
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("person")?.addEventListener("change", () => {
      document.getElementById("wrcBirthdayGreeting")?.remove();
      queue();
    });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) queue(); });
  });

  window.WRCBirthday = Object.freeze({
    birthdayAge,
    birthdayText,
    firstEntryDate,
    onEntriesLoaded,
    shouldShow
  });
})();

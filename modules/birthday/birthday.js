(function () {
  let hasCheckedThisLoad = false;

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
    return storageGet("wrcPostLastPlayer")
      || document.getElementById("person")?.value
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
    const firstDate = firstEntryDate(entries);
    if (!firstDate) return null;
    return Math.max(0, year - Number(firstDate.slice(0, 4)));
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
      `Vor ${age} ${age === 1 ? "Jahr" : "Jahren"} wurden die ersten WRC-Einträge gemacht.`,
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

    if (shown && !preview) {
      storageSet(
        `wrcBirthdayShown_${year}_${normalizePlayer(player)}`,
        new Date().toISOString()
      );
    }

    return shown;
  }

  function onEntriesLoaded(entries) {
    if (hasCheckedThisLoad || !Array.isArray(entries)) return;
    hasCheckedThisLoad = true;

    const now = new Date();
    const params = new URLSearchParams(window.location.search);
    const preview = ["localhost", "127.0.0.1"].includes(window.location.hostname)
      && params.get("birthday") === "1";
    const player = selectedPlayer();
    const year = preview
      ? Number(params.get("birthday-year")) || now.getFullYear()
      : now.getFullYear();

    if (!shouldShow(now, player, preview)) return;

    window.setTimeout(() => {
      if (!showBirthday(entries, player, year, preview)) {
        window.setTimeout(() => showBirthday(entries, player, year, preview), 2800);
      }
    }, preview ? 450 : 900);
  }

  window.WRCBirthday = Object.freeze({
    birthdayAge,
    birthdayText,
    firstEntryDate,
    onEntriesLoaded,
    shouldShow
  });
})();

(function () {
  const LETTER_TEMPLATES = Object.freeze([
    ({ names, verb }) => [
      "Heute gibt es etwas zu feiern!",
      `Heute ${verb} ${names} Geburtstag.`,
      "Kuchen ist ausdrücklich erlaubt. Krümel zählen heute nicht als Trainingsgewichte.",
      "Happy Birthday!"
    ],
    ({ names, verb }) => [
      "Der WRC-Kalender hat heute ein kleines Krönchen aufgesetzt.",
      `Denn heute ${verb} ${names} Geburtstag.`,
      "Wir wünschen einen großartigen Tag – mit guten Leuten und einem verdächtig großen Stück Kuchen."
    ],
    ({ names, verb }) => [
      "Kurze Unterbrechung des regulären Punktbetriebs:",
      `${names} ${verb} heute Geburtstag!`,
      "Die einzige heutige Pflichtdisziplin lautet: Kerzen auspusten.",
      "Happy Birthday!"
    ],
    ({ names, verb }) => [
      "Wursti hat den Kuchen geprüft. Bertha hat sicherheitshalber ein zweites Stück reserviert.",
      `Schließlich ${verb} ${names} heute Geburtstag.`,
      "Habt einen wunderbaren Tag – wir stoßen gedanklich mit an!"
    ],
    ({ names, verb }) => [
      "Heute führt die Geburtstagstabelle ganz eindeutig:",
      `${names}.`,
      `Denn ${names} ${verb} Geburtstag – und dagegen hilft nicht einmal eine starke Schlussrunde.`,
      "Herzlichen Glückwunsch!"
    ],
    ({ names, verb }) => [
      "Konfetti-Alarm am Wurstrand!",
      `${names} ${verb} heute Geburtstag.`,
      "Wir wünschen gute Gespräche, schöne Überraschungen und Kuchen mit stabilem Fundament."
    ],
    ({ names, verb }) => [
      "Der Trainingsplan wurde für heute angepasst:",
      `1. ${names} gratulieren. 2. Kuchen finden. 3. Noch einmal gratulieren.`,
      `${names} ${verb} Geburtstag – Happy Birthday!`
    ],
    ({ names, verb }) => [
      "Heute werden keine Rekorde vermessen.",
      `Heute feiern wir ${names}, denn ${names} ${verb} Geburtstag.`,
      "Möge der Tag mindestens so rund laufen wie Berthas Lieblingsbohne."
    ],
    ({ names, verb }) => [
      "Die WRC-Jury hat einstimmig entschieden:",
      `Heute gehört das Siegerpodest ${names}.`,
      `${names} ${verb} Geburtstag – herzlichen Glückwunsch und einen richtig schönen Tag!`
    ],
    ({ names, verb }) => [
      "Es liegt etwas Besonderes in der Wurstrand-Luft. Und ausnahmsweise ist es keine Pizza.",
      `${names} ${verb} heute Geburtstag.`,
      "Wir wünschen viele schöne Momente und genau die richtige Menge Geburtstagschaos."
    ],
    ({ names, verb }) => [
      "Bertha sagt: Gute Menschen verdienen guten Kuchen.",
      `Wursti ergänzt: ${names} ${verb} heute Geburtstag – also besser ein großes Stück.`,
      "Alles Gute und einen wunderbaren Tag!"
    ],
    ({ names, verb }) => [
      "Die heutige WRC-Sonderwertung steht fest:",
      `Gold für ${names} in der Disziplin Geburtstag.`,
      `${names} ${verb} heute Geburtstag. Wir schicken Applaus, Konfetti und die besten Wünsche!`
    ],
    ({ names, verb }) => [
      "Heute darf die Stoppuhr Pause machen.",
      `Denn ${names} ${verb} Geburtstag, und schöne Momente sollte man ohnehin nicht stoppen.`,
      "Habt einen großartigen Tag!"
    ],
    ({ names, verb }) => [
      "Wursti wollte das Geburtstagsgeschenk einpacken.",
      "Bertha hat danach das Klebeband entwirrt.",
      `Wichtig ist: ${names} ${verb} heute Geburtstag!`,
      "Von uns beiden kommen die allerbesten Wünsche."
    ],
    ({ names, verb }) => [
      "Offizielle WRC-Regel für heute:",
      `Wer ${names} sieht, darf sofort gratulieren.`,
      `${names} ${verb} Geburtstag – wir wünschen einen Tag voller guter Überraschungen!`
    ],
    ({ names, verb }) => [
      "Die Tagesprognose lautet: erhöhte Kuchenwahrscheinlichkeit bei vereinzeltem Konfetti.",
      `Der Grund: ${names} ${verb} heute Geburtstag.`,
      "Happy Birthday und ganz viele schöne Momente!"
    ],
    ({ names, verb }) => [
      "Heute bekommt die WRC einen kleinen Feiertag mitten im Alltag.",
      `${names} ${verb} Geburtstag.`,
      "Schön, dass du Teil dieser Runde bist. Lass dich ordentlich feiern!"
    ],
    ({ names, verb }) => [
      "Punkte kommen und gehen. Ein guter Geburtstag bleibt in Erinnerung.",
      `Heute ${verb} ${names} Geburtstag.`,
      "Wir wünschen herzliches Lachen, liebe Menschen und einen Kuchen ohne taktische Lücken."
    ]
  ]);

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

  function dateKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function birthdaysForDate(date, configuredBirthdays = birthdays) {
    return configuredBirthdays.filter(item =>
      item.day === date.getDate() && item.month === date.getMonth() + 1
    );
  }

  function formatNames(items) {
    const names = items.map(item => item.name);
    if (names.length <= 1) return names[0] || "";
    if (names.length === 2) return `${names[0]} und ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} und ${names[names.length - 1]}`;
  }

  function storageKey(date, items) {
    const names = items.map(item => item.name.toLowerCase()).sort().join("-");
    return `wrcCommunityBirthday_${dateKey(date)}_${names}`;
  }

  function buildLetter(items, randomValue = Math.random()) {
    const names = formatNames(items);
    const templateIndex = Math.min(
      LETTER_TEMPLATES.length - 1,
      Math.floor(randomValue * LETTER_TEMPLATES.length)
    );

    return {
      sender: "Wursti & Bertha",
      rarity: "legendär",
      text: LETTER_TEMPLATES[templateIndex]({
        names,
        verb: items.length === 1 ? "hat" : "haben"
      })
    };
  }

  function previewDate() {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("community-birthday");
    const localPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (!value || !localPreview) return null;

    const parsed = new Date(`${value}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function showBirthday(date, items, preview = false) {
    if (typeof WRCPost === "undefined" || !items.length) return false;

    const key = storageKey(date, items);
    if (!preview && storageGet(key)) return false;

    const names = formatNames(items);
    const shown = WRCPost.show(buildLetter(items), {
      heading: "🎂 Heute gibt es etwas zu feiern!",
      badge: items.length === 1 ? `Geburtstag: ${names}` : "WRC-Geburtstagsrunde",
      signature: "– Wursti & Bertha 🌭🫘"
    });

    if (shown && !preview) storageSet(key, new Date().toISOString());
    return shown;
  }

  function checkToday() {
    const preview = previewDate();
    const date = preview || new Date();
    const items = birthdaysForDate(date);
    if (!items.length) return;

    window.setTimeout(() => {
      if (!showBirthday(date, items, Boolean(preview))) {
        window.setTimeout(() => showBirthday(date, items, Boolean(preview)), 2800);
      }
    }, preview ? 450 : 800);
  }

  document.addEventListener("DOMContentLoaded", checkToday);

  window.WRCCommunityBirthdays = Object.freeze({
    birthdaysForDate,
    buildLetter,
    formatNames,
    storageKey
  });
})();

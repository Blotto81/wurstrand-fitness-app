const people = [
  "Thorsten",
  "Basti",
  "Marian",
  "Fabi"
];

const playerProfiles = Object.freeze({
  Thorsten: {
    image: "player-assets/thorsten.png",
    initials: "TH",
    number: "01",
    displayName: "Thorsten",
    facts: [
      { icon: "💡", title: "WRC-Erfinder", text: "Die Idee hatte er. Jetzt müssen alle damit leben." },
      { icon: "🏐", title: "Ballsport-Allrounder", text: "Hauptsache rund – dann kann er's." }
    ],
    quote: "Keine Panik, ich weiß durchaus nicht, was zu tun ist."
  },
  Basti: {
    image: "player-assets/basti.png",
    initials: "BA",
    number: "02",
    displayName: "Basti",
    facts: [
      { icon: "👶", title: "Benjamin der Gruppe", text: "Genießt noch Welpenschutz." },
      { icon: "⚽", title: "Fußballer aus Leidenschaft", text: "Der Ball muss rollen." }
    ],
    quote: "Etwas nicht gut zu können ist kein Grund, es nicht zu tun!"
  },
  Marian: {
    image: "player-assets/marian-gomesch.png",
    initials: "MA",
    number: "03",
    displayName: "Marian „Gomesch“ G. D. O. G.",
    facts: [
      { icon: "👴", title: "Vize-Alterspräsident", text: "Nur 14 Tage von der Macht entfernt." },
      { icon: "🎭", title: "Improvisationstheater", text: "Weiß vorher auch nicht, was er gleich macht." }
    ],
    quote: "Wenn du mich brauchst, ich bin im Kühlschrank."
  },
  Fabi: {
    image: "player-assets/fabi.png",
    initials: "FA",
    number: "04",
    displayName: "Fabi",
    facts: [
      { icon: "👴", title: "Alterspräsident", text: "Unangefochten seit 14 Tagen." },
      { icon: "🏐", title: "Volleyball", text: "In der Nationalmannschaft-Volleyball-AG stets gesetzt." }
    ],
    quote: "Was bei einem Puzzle-Spiel so bemerkenswert ist: Eine Stunde, nachdem man es gegessen hat, ist man schon wieder hungrig."
  }
});

const birthdays = Object.freeze([
  { name: "Thorsten", day: 20, month: 5 },
  { name: "Basti", day: 21, month: 2 },
  { name: "Fabi", day: 25, month: 9 },
  { name: "Marian", day: 9, month: 10 }
]);

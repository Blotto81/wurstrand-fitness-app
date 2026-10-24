/* WRC house rules are shared; card values and faces remain variant-specific. */
(function (root) {
  'use strict';
  const variants = {
    classic: { name: 'UNO Classic', subtitle: 'Der Klassiker. Mit unseren eigenen Gesetzen.', swap: 0 },
    flip: { name: 'UNO Flip', subtitle: 'Zwei Seiten. Doppelt so viel Ärger.', swap: 1 }
  };
  // Original ZIP photos and WRC display values from Karten_und_Punkte.csv.
  // Two source filenames are misleading: the circular arrow is Skip Everyone;
  // the photographed Flip card is dark-side, despite its "hell" filename.
  const photoCatalog = {
    'flip-light-wild2': { file: 'uno-flip-hell-plus2-farbwahl.png', points: 50 },
    'flip-dark-skipall': { file: 'uno-flip-dunkel-richtungswechsel-kreis.png', points: 20 },
    'flip-light-skip': { file: 'uno-flip-hell-aussetzen.png', points: 20 },
    'flip-dark-1': { file: 'uno-flip-dunkel-eins-tauschkarte.png', points: 20 },
    'flip-dark-reverse': { file: 'uno-flip-dunkel-richtungswechsel-pfeile.png', points: 20 },
    'flip-dark-wild': { file: 'uno-flip-dunkel-farbwahl.png', points: 50 },
    'flip-dark-wildcolor': { file: 'uno-flip-dunkel-ziehen-bis-farbe.png', points: 70, rotation: 90 },
    'flip-dark-draw5': { file: 'uno-flip-dunkel-plus5.png', points: 70 },
    'flip-light-draw1': { file: 'uno-flip-hell-plus1.png', points: 20 },
    'flip-dark-flip': { file: 'uno-flip-hell-flip.png', points: 50 }
  };
  const images = Object.fromEntries(Object.entries(photoCatalog).map(([id, photo]) =>
    [id, 'modules/uno/uno-rules-images/' + photo.file]));
  const cards = [];
  function add(variant, side, key, name, points, description, detail, keywords = []) {
    cards.push({ id: [variant, side, key].filter(Boolean).join('-'), variant, side,
      name, points, description, detail, keywords, number: /^\d+$/.test(key), symbol: key });
  }
  for (let n = 0; n <= 9; n++) {
    add('classic', '', String(n), n === 0 ? '0 · Pflichttausch' : String(n), n === 0 ? 20 : n,
      n === 0 ? 'Ablegen. Handkarten tauschen. Ohne Ausnahme.' : 'Zahlenkarte · Farbe oder Zahl passend ablegen.',
      n === 0 ? 'Du musst deine verbleibende Hand mit einem Mitspieler deiner Wahl tauschen. Auch mit leerer Hand! Dann gewinnt der ausgewählte Mitspieler.' : 'Diese Karte zählt ihren Zahlenwert. Zwischenwerfen ist nur bei exakt gleicher Farbe und Zahl erlaubt.',
      n === 0 ? ['tauschen', 'kartentausch', 'tauschkarte'] : ['zahl', String(n)]);
  }
  add('classic', '', 'draw2', '+2 · Zieh zwei', 20, 'Zwei Karten ziehen, einmal aussetzen.', 'Der nächste Spieler zieht zwei Karten und setzt aus. Welche +2-/+4-Abwehrkombinationen bei uns gelten, ist noch offen.', ['+2', 'abwehren']);
  add('classic', '', 'reverse', 'Richtungswechsel', 20, 'Die Spielrichtung dreht sich um.', 'Im Uhrzeigersinn wird gegen den Uhrzeigersinn – und umgekehrt. Kein Zwischenwerfen: Das ist eine Aktionskarte.');
  add('classic', '', 'skip', 'Aussetzen', 20, 'Der nächste Spieler pausiert.', 'Der nächste Spieler in Spielrichtung wird übersprungen. Kein Zwischenwerfen.');
  add('classic', '', 'wild', 'Farbwahl', 50, 'Du bestimmst die nächste Farbe.', 'Wähle die Farbe, mit der weitergespielt wird. Diese Karte darf auch bei passender Farbe auf der Hand gespielt werden.');
  add('classic', '', 'wild4', '+4 · Farbwahl', 50, 'Farbe wählen. Vier Karten für den Nächsten.', 'Nach der Grundregel nur spielbar, wenn du keine Karte in der aktuellen Farbe hast. Der nächste Spieler zieht vier und setzt aus. Weitere Abwehrkombinationen sind bei uns noch offen.', ['+4', 'abwehren']);
  for (const side of ['light', 'dark']) {
    for (let n = 1; n <= 9; n++) {
      add('flip', side, String(n), n === 1 ? '1 · Pflichttausch' : String(n), n === 1 ? 20 : n,
        n === 1 ? 'Pflichttausch auf beiden Kartenseiten.' : 'Zahlenkarte · ihr Wert bleibt ihr Zahlenwert.',
        n === 1 ? 'Tausche deine verbleibenden Handkarten mit einem Mitspieler deiner Wahl. Auch wenn die 1 deine letzte Karte war: Deine leere Hand geht an den Mitspieler – er gewinnt.' : 'Es zählt die am Rundenende aktive Kartenseite. Zahlenkarten haben auf beiden Seiten ihren Zahlenwert. Zwischenwerfen nur bei gleicher Farbe und Zahl.',
        n === 1 ? ['tauschen', 'kartentausch', 'tauschkarte'] : ['zahl', String(n)]);
    }
    add('flip', side, 'reverse', 'Richtungswechsel', 20, 'Ab jetzt geht es andersherum.', 'Die bisherige Spielrichtung wird umgedreht. Aktionskarten dürfen nicht zwischengeworfen werden.');
    add('flip', side, 'flip', 'Flip', 20, 'Alle Karten auf die andere Seite!', 'Ablagestapel, Nachziehstapel und alle Handkarten werden umgedreht. Die neue Seite bleibt aktiv, bis erneut eine Flip-Karte gespielt wird. Gestartet wird auf der hellen Seite.');
    add('flip', side, 'wild', 'Farbwahl', 50, 'Wähle eine Farbe der aktiven Seite.', side === 'light' ? 'Wähle Rot, Gelb, Grün oder Blau. Mit dieser Farbe geht es weiter.' : 'Wähle Rosa, Türkis, Orange oder Lila. Mit dieser Farbe geht es weiter.');
  }
  add('flip', 'light', 'draw1', '+1 · Zieh eins', 10, 'Eine Karte – oder die Kette verlängern.', 'WRC: +1 auf +1 ist erlaubt. Auch eine +2 darf die +1 erhöhen. Wer nicht mehr abwehren kann, zieht die angesammelten Karten.', ['+1', '+2', 'abwehren']);
  add('flip', 'light', 'skip', 'Aussetzen', 20, 'Der nächste Spieler pausiert.', 'Der nächste Spieler in Spielrichtung wird übersprungen.');
  add('flip', 'light', 'wild2', '+2 · Farbwahl', 50, 'Farbe wählen und zwei Karten drauf.', 'Nach der Grundregel nur spielbar, wenn du keine Karte in der aktuellen Farbe hast. WRC: Du darfst damit eine +1 auf insgesamt drei Karten erhöhen. Weitere Kombinationen sind noch offen.', ['+1', '+2', 'abwehren']);
  add('flip', 'dark', 'draw5', '+5 · Zieh fünf', 20, 'Fünf Karten. Es kann schlimmer kommen.', 'WRC: +5 darf mit +5 abgewehrt werden. Drei solcher Karten bedeuten 15 Karten für den ersten Spieler ohne weitere Abwehr.', ['+5', 'abwehren']);
  add('flip', 'dark', 'skipall', 'Alle aussetzen', 30, 'Alle pausieren. Du bist erneut dran.', 'Alle anderen Spieler werden übersprungen. Du spielst sofort noch einmal.');
  add('flip', 'dark', 'wildcolor', 'Farbwahl · Zieh bis Farbe', 60, 'Ziehen, bis die gewählte Farbe kommt.', 'Nach der Grundregel nur ohne passende aktuelle Farbe spielbar. WRC: Eine weitere solche Karte verlängert die Farbkette. Bei Orange → Lila wird erst bis Orange, dann bis Lila gezogen. Jede weitere Farbe kommt hinten dazu.', ['abwehren', 'orange', 'lila', 'farbkette']);

  // Rulebook only: these values never feed the existing result/statistics code.
  cards.forEach(card => {
    card.pointSource = 'Mattel-Grundregel';
    if (card.number && card.symbol === String(variants[card.variant].swap)) {
      card.pointSource = 'WRC-Hausregel · Pflichttausch';
    }
    // Explicit WRC decision, 2026-10-24: both Flip wild cards count 50.
    if (card.id === 'flip-light-wild') card.pointSource = 'WRC-Festlegung · 50 Punkte';
    if (photoCatalog[card.id]) {
      card.points = photoCatalog[card.id].points;
      card.pointSource = 'WRC-Kartenübersicht';
    }
  });

  const sharedRules = [
    { id: 'deal', icon: '♠', title: 'Der Gewinner gibt. Der Nachbar hebt.', keywords: ['kartengeber', 'austeilen', 'abheben', 'strafkarte'],
      text: 'Der Gewinner der letzten Runde teilt die nächste aus. Vorher muss er dem Spieler rechts von sich anbieten, abzuheben. Vergessen? Der Kartengeber zieht eine Strafkarte.',
      note: 'Beim Aufnehmen des Stapels zum Austeilen zählt dein Augenmaß:',
      cases: [{ tone: 'gold', label: 'Genau richtig', text: 'Alle anderen ziehen jeweils 1 Strafkarte.' }, { tone: 'red', label: 'Zu wenige', text: 'Der Kartengeber zieht 1 Strafkarte.' }, { tone: 'green', label: 'Zu viele', text: 'Keine Strafe. Großzügigkeit zahlt sich aus.' }] },
    { id: 'jump', icon: '↻', title: 'Zwischenwerfen: Farbe UND Zahl.', keywords: ['zwischenwerfen', 'zahlenkarten', 'gelbe 7', 'strafkarte'],
      text: 'Du darfst außerhalb deiner Reihe ablegen, wenn deine Zahlenkarte exakt dieselbe Farbe und Zahl wie die zuletzt gespielte Karte hat. Sonderkarten sind ausgeschlossen.',
      chain: ['Gelbe 7', 'Gelbe 7', 'Passt!'],
      note: 'Danach geht es beim Zwischenwerfenden in der bisherigen Spielrichtung weiter. Wer zu spät wirft, zieht 1 Strafkarte.' },
    { id: 'swap', icon: '⇄', title: 'Kartentausch ist keine Einladung.', keywords: ['tauschen', 'kartentausch', 'tauschkarte', 'pflichttausch'], dynamic: 'swap' },
    { id: 'penalty', icon: '!', title: 'UNO vergessen? Hilfsbereit gewesen?', keywords: ['uno', 'strafkarte', 'vergessen', 'antworten', 'frage'],
      text: 'Eine Karte übrig? „UNO!“ sagen. Wird das Vergessen rechtzeitig bemerkt, zieht der Spieler 1 Strafkarte.',
      note: '„Was ist gerade passiert?“ Wer diese Frage beantwortet, zieht ebenfalls 1 Strafkarte. Nicht der Fragende, sondern der hilfsbereite Antwortende. Schweigen ist hier ausnahmsweise Teamplay.' },
    { id: 'stack', icon: '+', title: 'Abwehren & Aufstocken', keywords: ['abwehren', 'aufstocken', 'pluskarten'], dynamic: 'stack' },
    { id: 'end', icon: '⚑', title: 'Die 1.000-Punkte-Grenze', keywords: ['punkte', 'spielende', '1000', '1.000', 'verlieren', 'punktestand'],
      text: 'Am Rundenende zählt jeder seine verbliebenen Handkarten. Diese Punkte kommen zum eigenen bisherigen Punktestand dazu. Wer mehr als 1.000 Punkte hat, verliert.',
      cases: [{ tone: 'green', label: 'Genau 1.000', text: 'Du bist noch im Spiel.' }, { tone: 'red', label: 'Ab 1.001', text: 'Grenze überschritten. Verloren.' }],
      note: 'Dieses Regelwerk erklärt unsere Regeln. Die bestehende Ergebniserfassung bleibt unverändert.' }
  ];
  function getRules(variant) {
    if (!variants[variant]) return [];
    return sharedRules.map(rule => {
      if (rule.dynamic === 'swap') return { ...rule, text: `Die ${variants[variant].swap} ist die Tauschkarte und zählt 20 Punkte. Wer sie ablegt, muss seine verbleibenden Handkarten mit einem beliebigen Mitspieler tauschen.`,
        keywords: [...rule.keywords, String(variants[variant].swap)],
        note: 'Auch bei der letzten Karte gilt der Pflichttausch: Du gibst deine leere Hand weiter. Der ausgewählte Mitspieler gewinnt die Runde. Großes Finale. Für jemand anderen.' };
      if (rule.dynamic === 'stack') return variant === 'classic' ? { ...rule,
        text: 'Die Abwehrkombinationen mit +2 und +4 sind in unseren Classic-Hausregeln noch nicht abschließend geklärt.',
        note: 'Noch offen – hier wird keine zusätzliche Kombination als erlaubt oder verboten festgelegt.', keywords: [...rule.keywords, '+2', '+4'] } : { ...rule,
        text: 'Erlaubt sind +1 auf +1, +5 auf +5 und +2 auf +1. Die Karten werden addiert. Der erste Spieler, der nicht mehr abwehren kann, zieht die gesamte angesammelte Anzahl.',
        chains: [['+1', '+1', '2 Karten'], ['+1', '+2', '3 Karten'], ['+5', '+5', '+5', '15 Karten']],
        note: 'Weitere Kombinationen sind noch offen. Keine improvisierten Gesetze!', keywords: [...rule.keywords, '+1', '+2', '+5'] };
      return variant === 'flip' && rule.id === 'end' ? { ...rule, text: rule.text + ' Bei Flip zählt die am Rundenende aktive Kartenseite.' } : { ...rule };
    }).concat(variant === 'flip' ? [{ id: 'colors', icon: '◐', title: 'Dunkle Seite: Eine Farbe reicht nicht.', keywords: ['farbkette', 'farbe', 'orange', 'lila', 'abwehren'],
      text: 'Bei „Farbwahl · Zieh bis Farbe“ bestimmt der Spieler eine Farbe. Der Nächste zieht, bis diese Farbe kommt. Eine weitere entsprechende Karte darf abwehren und eine neue Farbe an die Kette anhängen.',
      chain: ['Bis Orange', 'Dann bis Lila', '… weiter'],
      note: 'Die Reihenfolge bleibt erhalten: erst bis Orange ziehen, danach bis Lila. Die neue Farbe ersetzt die vorige nicht.' }] : []);
  }
  function getCards(variant, side) { return cards.filter(card => card.variant === variant && (!side || card.side === side)); }
  function search(variant, query) {
    const q = query.trim().toLocaleLowerCase('de');
    if (!q) return [];
    const tokens = q.match(/\+\d+|[\p{L}\d.]+/gu) || [];
    if (!tokens.length) return [];
    return [...getRules(variant).map(r => ({ ...r, kind: 'rule', name: r.title })), ...getCards(variant).map(c => ({ ...c, kind: 'card' }))].filter(item => {
      const content = [item.name, item.text, item.note, item.description, item.detail, ...(item.keywords || [])].filter(Boolean).join(' ').toLocaleLowerCase('de');
      const words = content.match(/\+\d+|[\p{L}\d.]+/gu) || [];
      return tokens.every(token => /^[+\d]/.test(token) ? words.includes(token) : content.includes(token));
    });
  }
  root.WRCUnoRules = { variants, images, photoCatalog, cards, getRules, getCards, search };
})(typeof window !== 'undefined' ? window : globalThis);

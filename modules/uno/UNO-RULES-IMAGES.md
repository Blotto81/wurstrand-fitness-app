# Originalfotos im UNO-Regelwerk

Das Regelwerk wird ausschließlich aus dem vorhandenen UNO-Bereich geöffnet.
`uno.js` und `uno.css` bleiben unverändert. Die neuen Module greifen nicht auf die Datenbank zu.

## Fotos ergänzen

1. Originalfoto in `modules/uno/uno-rules-images/` ablegen (Ordner bei Bedarf anlegen).
2. In **uno-rules-data.js**, im Objekt `photoCatalog`, den stabilen Karten-Schlüssel mit Dateiname und WRC-Punktwert zuordnen:

```js
const photoCatalog = {
  'flip-dark-wildcolor': {
    file: 'uno-flip-dunkel-ziehen-bis-farbe.png',
    points: 70,
    rotation: 90 // optionale reine Anzeigedrehung, Original bleibt unverändert
  }
};
```

Alle Schlüssel stehen in `WRCUnoRules.cards` (`id`). Classic: `classic-0` bis `classic-9`,
`classic-draw2`, `classic-reverse`, `classic-skip`, `classic-wild`, `classic-wild4`.
Flip: `flip-light-` bzw. `flip-dark-` + `1` bis `9`, `reverse`, `flip`, `wild`;
zusätzlich hell `draw1`, `skip`, `wild2`; dunkel `draw5`, `skipall`, `wildcolor`.

Bilder haben ein festes 2:3-Fenster und `object-fit: contain`. Sie werden weder
verzerrt noch abgeschnitten. Ohne Zuordnung oder bei Ladefehler bleibt ein klar
beschrifteter Platzhalter. Es sind keine nachgebauten UNO-Karten und keine
externen Platzhalterbilder eingebunden. Galerie und Detailansicht teilen die Zuordnung.
Für garantierte Offline-Verfügbarkeit neue Fotos zusätzlich in `APP_SHELL` in
`service-worker.js` aufnehmen und die Cache-Version erhöhen.

## Regeln und Erweiterungen

Gemeinsame Hausregeln stehen in `sharedRules`, Varianten in `variants`, Karten
getrennt nach Variante und Flip-Seite in `cards`. Weitere Abwehrkombinationen
erst nach einer WRC-Entscheidung ergänzen. Classic zeigt keine Flip-Inhalte.
Kartenwerte orientieren sich an den verlinkten Mattel-Anleitungen, mit WRC-
Abweichungen: Classic 0 / Flip 1 je 20 Punkte, Pflichttausch, eigene Restpunkte,
Verlust erst über 1.000. Dieses Modul ist ausschließlich eine Lesehilfe.

Tests: `node tests/uno-rules.cjs`. Die lokale Browser-Testseite
`tests/uno-rules-preview.html` verwendet eine eigene Datenbankattrappe, niemals
Produktivdaten. Sie lädt die unveränderte UNO-Ergebniserfassung.

## Eingebundene Originale

Zehn PNG-Dateien aus `WRC_UNO_Flip_Kartenbilder.zip` sind bytegenau übernommen.
Die mitgelieferte `Karten_und_Punkte.csv` liegt zur Nachvollziehbarkeit daneben.
Ihre Werte gelten nur für diese fotografierten Karten im Regelwerk. Fehlende
Gegenstücke und Classic behalten ihre bisherige Darstellung und Werte.

Zwei Dateinamen sind nach dem tatsächlichen Motiv zugeordnet:
- `uno-flip-dunkel-richtungswechsel-kreis.png` → **Alle aussetzen**, dunkle Seite (20 Punkte laut CSV).
- `uno-flip-hell-flip.png` → **Flip**, dunkle Seite (50 Punkte laut CSV).

Weitere abweichende WRC-Werte aus der CSV: hell +1 = 20, dunkel Farbwahl = 50,
dunkel +5 = 70, dunkel Zieh bis Farbe = 70. Die Anzeige kennzeichnet die
WRC-Kartenübersicht als Quelle. Es wird keine Spiel- oder Statistiklogik geändert.
Das querliegende Zieh-bis-Farbe-Foto wird ausschließlich per CSS um 90° gedreht.
Alle Fotos bleiben vollständig sichtbar (`contain`) im bestehenden 2:3-Fenster.

# Originalfotos im UNO-Regelwerk

Das Regelwerk wird ausschließlich aus dem vorhandenen UNO-Bereich geöffnet.
`uno.js` und `uno.css` bleiben unverändert. Die neuen Module greifen nicht auf die Datenbank zu.

## Fotos ergänzen

1. Originalfoto in `modules/uno/uno-rules-images/` ablegen (Ordner bei Bedarf anlegen).
2. In **uno-rules-data.js**, im Objekt `images`, den stabilen Karten-Schlüssel zuordnen:

```js
const images = {
  'classic-0': 'modules/uno/uno-rules-images/classic-0.webp',
  'flip-light-1': 'modules/uno/uno-rules-images/flip-light-1.webp',
  'flip-dark-wildcolor': 'modules/uno/uno-rules-images/flip-dark-wildcolor.webp'
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

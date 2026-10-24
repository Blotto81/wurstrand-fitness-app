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
Gegenstücke und Classic erhalten namentlich beschriftete neutrale Platzhalter.

Zwei Dateinamen sind nach dem tatsächlichen Motiv zugeordnet:
- `uno-flip-dunkel-richtungswechsel-kreis.png` → **Alle aussetzen**, dunkle Seite (20 Punkte laut CSV).
- `uno-flip-hell-flip.png` → **Flip**, dunkle Seite (50 Punkte laut CSV).

Weitere abweichende WRC-Werte aus der CSV: hell +1 = 20, dunkel Farbwahl = 50,
dunkel +5 = 70, dunkel Zieh bis Farbe = 70. Die Anzeige kennzeichnet die
WRC-Kartenübersicht als Quelle. Es wird keine Spiel- oder Statistiklogik geändert.
Das querliegende Zieh-bis-Farbe-Foto wird ausschließlich per CSS um 90° gedreht.
Alle Fotos bleiben vollständig sichtbar (`contain`) im bestehenden 2:3-Fenster.

## Kartenlexikon 2.0 – Quellenprüfung vom 24.10.2026

Die Galerie zeigt pro Zahl/Aktion einen Eintrag, ohne Farbduplikate. Alle 45
Kartenmodelle bleiben einzeln durchsuchbar. Die Sonderkartenansicht umfasst
6 Classic- und je 7 Flip-Karten, einschließlich Pflichttausch. Große Fotos,
kurze Namen und eine separate Detailansicht ersetzen die Informationskacheln.
Das Hausrecht und seine ungeklärten Abwehrkombinationen bleiben unverändert.

### Punktwerte

- Classic: 0 = 20 (WRC-Pflichttausch), 1–9 = Zahlenwert,
  +2 / Aussetzen / Richtungswechsel = 20, Farbwahl / +4 = 50.
- Flip hell: 1 = 20 (WRC), 2–9 = Zahlenwert, +1 / Aussetzen /
  Richtungswechsel / Flip = 20, Farbwahl / +2-Farbwahl = 50.
- Flip dunkel: 1 = 20 (WRC), 2–9 = Zahlenwert, Richtungswechsel /
  Alle aussetzen = 20, Flip / Farbwahl = 50, +5 / Zieh bis Farbe = 70.

**Einzige Wertänderung in 2.0:** Flip hell Farbwahl von 40 auf 50 Punkte,
auf ausdrückliche WRC-Bestätigung am 24.10.2026. Alle zehn CSV-Werte bleiben
unverändert. Jeder Karteneintrag benennt seine Punktequelle in der Detailansicht.
Die helle Flip-Karte bleibt bei 20 Punkten; das dunkle Foto mit 50 Punkten
ist kein Beleg für einen anderen Wert auf der hellen Seite.

Offizielle Quellen:
- Classic: https://service.mattel.com/instruction_sheets/UNO%20Basic%20IS.pdf
- Flip GDR44-0970: https://service.mattel.com/instruction_sheets/GDR44-English.pdf
- Flip mehrsprachig (abweichende Editionswerte):
  https://service.mattel.com/instruction-sheets/files/GDR44%20UNO%20Flip%5BEnglish_French_German_Spanish_Portuguese%5D%5B5LG%5D.pdf

Die Flip-Anleitungen unterscheiden sich unter anderem bei +1 (10/20),
Alle aussetzen (30/20) und Farbwahl (40/50). Hier gelten die dokumentierten
WRC-Werte aus CSV und Nutzerbestätigung. Keine Änderung an der Spielabrechnung.

### Bildrechte und fehlende Motive

Mattel stellt Bilder in seinen Anleitungen bereit, erteilt damit aber keine
allgemeine Freigabe zur Wiederveröffentlichung auf einer Website. Die
Copyright-/Markenhinweise verweisen auf eine Genehmigungsanfrage:
https://corporate.mattel.com/contact-us
Deshalb wurden **keine externen Motive übernommen oder nachgezeichnet**.
Alle zehn vorhandenen Originaldateien bleiben bytegleich; die CSS-Drehung
von Zieh bis Farbe bleibt erhalten. Keine neuen Bilddownloads oder Bild-CDNs.

Weiterhin fehlen 35 Originalmotive:
- Classic: alle 15 Einträge (0–9 und die fünf Aktionskarten).
- Flip hell: 1–9, Richtungswechsel, Flip, Farbwahl (12).
- Flip dunkel: Zahlen 2–9 (8).

Platzhalter nennen den Kartentyp und ausdrücklich „kein Originalfoto“.
Sie ersetzen auch nicht ladbare Originalbilder ohne kaputtes Bildsymbol.
Galerie-Bilder laden verzögert; das ausgewählte Detailbild lädt sofort.
Service-Worker v62 aktualisiert die bereits im Offline-Cache geführten Dateien.

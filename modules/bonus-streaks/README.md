# WRC Bonusserie

## Zentrale deterministische Berechnung

WRCBonusStreakCore.calculate berechnet ab 01.05.2026 alle abgeschlossenen Kalendertage aus der bereinigten Historie. Nur calcPoints(entry).bonus > 0 liefert einen erfolgreichen Bonustag. Punkte, Trainingseinträge und die separate Daily-Challenge einschließlich ihrer drei monatlichen Joker bleiben unverändert.

Regelversion 2 ist der Standard für aktuelle Auswertungen. Bestandsschutz gilt einheitlich für alle Spieler: Bis einschließlich 31.10.2026 wird die bisherige Regel verwendet, ab 01.11.2026 die neue Monatsregel. So bleiben ältere Serien, Rekorde und Patchdaten erhalten; die zwei Schutztage des laufenden Novembers können auch den 6./7. November abdecken. Es gibt keinen zusätzlichen Übergangsbonus und keine Namensausnahmen.

Ab November:
- Genau zwei interne Schutztage pro Spieler und Kalendermonat.
- Ein abgeschlossener Tag ohne Bonus verbraucht nur bei laufender Serie ein noch verfügbares Kontingent. Die Serienlänge steigt nicht.
- Aufeinanderfolgende oder getrennte Fehltage verwenden dasselbe Monatskontingent. Es gibt keine zusätzliche kostenlose Pause.
- Nach Verbrauch endet die Serie am nächsten abgeschlossenen Fehltag. Ein Abbruch oder neuer Bonustag setzt das Monatskontingent nicht zurück.
- Der Monatserste erneuert das Kontingent ohne Übertrag. Monats-/Jahreswechsel unterbrechen keine Serie.
- Heute bleibt ohne Bonus offen. Die bestehende lokale Kalendergrenze der Erfassung bleibt maßgeblich; die Iteration verwendet UTC-Mittag für stabile Datumswechsel.
- Keine Speicherung eines Kontos, keine neuen Datenbanktabellen oder Schreibzugriffe.

Die vollständige Historie aller vier Spieler wird bei jedem Datenstand gleich behandelt. Bei Nachträgen oder Korrekturen werden aktuelle Serien, Rekorde und abgeleitete Patches neu berechnet. Historische Serien bis Ende Oktober bleiben regelgleich. Ab November zählen die neuen Monatsregeln.

## Ausschließlich Serie und Rekord sichtbar

Das Profil zeigt ab drei tatsächlich erfolgreichen Bonustagen eine kompakte, warme, gerahmte Karte mit Flammensymbol, aktueller Serie und persönlichem Rekord. Keine Bedienelemente oder Hinweise auf die interne Regel; auch der Patchdialog enthält keine Erklärung. Bei kürzerer oder beendeter Serie bleibt die Karte wie bisher ausgeblendet.

Schutzdetails werden nicht in Anlass-Fakten, Post, persönliche Nachrichten, Auszeichnungen, Regeln oder Wrapped-Texte übernommen. Die eigenen Aktivitätsserien für Rad/Kraft/Übung und die Daily-Challenge sind getrennte vorhandene Funktionen und bleiben unverändert.

## Meilensteine und gespeicherte Historie

Die Schwellen 7, 14, 30, 60, 100, 180 und 365 bleiben unverändert. Nur Bonus-Tage erhöhen die Serienlänge. Jeder Meilenstein wird im Replay höchstens einmal vergeben. Auf Reload und historische Neuberechnung erfolgen keine Gratulationen; Nachträge bleiben ebenfalls still. Bestehende lokale wrcBonusSeriesNotice-Schlüssel werden unverändert gegen erneute Benachrichtigungen verwendet.

Die sichtbaren Bonuspatches sind abgeleitete Auswertungen der Trainingseinträge, keine dauerhaft gespeicherten Award-Datensätze. Vor November bleibt ihre Berechnung unverändert; ab November folgt sie der neuen Regel. Bereits eingefrorene Jahresausgaben mit ihren historischen Titeln werden dagegen nicht neu interpretiert.

## Archivkompatibilität ohne Migration

Der fünfte optionale Parameter von calculate ist die Regelversion (1 oder 2); alle normalen Aufrufer verwenden standardmäßig 2. Version 1 behält die vorherige Regel unverändert. Es gibt nur einen zentralen Replay-Algorithmus, keine UI-Nebenberechnung.

Quellarchiv-Version und Auswertungsregel sind getrennt:
- Archivquellen v1/v2 bleiben auf Regelversion 1.
- v3 mit unveränderlichem serverseitigem frozen_at vor 2026-11-09T19:23:17Z bleibt auf Regelversion 1.
- v3 ab diesem Zeitpunkt verwendet Regelversion 2.
- Fehlender/ungültiger Archivzeitpunkt fällt auf die bisherige Regel zurück.

WRCOccasions.archive erhält frozen_at aus der vorhandenen Serverantwort beziehungsweise deren bestätigtem Offline-Cache. Die Geräteuhr entscheidet nicht über historische Semantik. Keine Änderung an gespeicherten Snapshots oder dem SQL-Schema. Spätere Regeländerungen müssen diese Zuordnung erhalten und eine weitere Regelversion verwenden.

## Anlassprüfung nach AGENTS.md

Geburtstage, Weihnachten, persönliche Nachrichten/Ehrungen sowie persönliches und gemeinsames Wrapped nutzen die vorhandenen zentralen Bonusserien-Fakten über WRCInsights. Aktuelle Auswertungen verwenden Version 2; historische Archive die oben festgelegte Version. Keine neue Kennzahl, kein neuer Provider und keine sichtbaren Schutz-Fakten. Die Analyse der Fitnesspunkte und Zielkurs-Serien bleibt unverändert; Bonusserien-Fakten stammen ausschließlich aus dem zentralen Replay.

## Prüfungen und Vorschau

- node tests/bonus-streaks.cjs: Monatsbudget, aufeinanderfolgende/getrennte Fehltage, offener Tag, kein Übertrag/Reset bei Abbruch, mehrere Monats-/Jahreswechsel, Schaltjahr, Historie, zentrale Punkteautorität, Meilensteine, Lade-/Speicherpfade, stille Nachträge und unveränderte Daily-Joker.
- node tests/bonus-streak-archives.cjs: unveränderte alte Archive/Shows, neue v3-Auswertung, gleiche Punkte, keine Quellenmutation, identische zentrale Werte und unsichtbare Regel.
- node tests/wrapped.cjs sowie wrapped-data.cjs, wrapped-surprise.cjs, member-birthdays.cjs und dashboard-stories.cjs: Regressionen.
- node tests/bonus-streak-browser.cjs <Playwright-Modulpfad>: 320/390/768/1280 px, Profilgrenze, Patchdialog, Tastatur, reduzierte Bewegung und stilles Neuladen.

Lokale Vorschau ohne produktive Daten: Im Repository python -m http.server 8765 --bind 127.0.0.1 starten und http://127.0.0.1:8765/tests/bonus-streaks-preview.html öffnen.

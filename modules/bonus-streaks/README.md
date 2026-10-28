# WRC Bonusserie

## Eine zentrale Berechnung
Ab **01.05.2026** wird für jeden Spieler die bereinigte Historie chronologisch nachgerechnet. Ausschließlich `calcPoints(entry).bonus > 0` entscheidet über einen erfolgreichen Bonustag. Historische Bonusbedingungen, Punkte und Aktivitäten bleiben unverändert. Zukünftige Daten werden ignoriert.

- Ein tatsächlicher Bonustag erhöht die Serie um 1 und beendet eine vorherige Pause.
- Ein einzelner abgeschlossener Tag ohne Bonus erhält die Serie, erhöht sie aber nicht.
- Zwei aufeinanderfolgende abgeschlossene Tage ohne Bonus beenden die Serie. Der nächste Bonus startet bei 1.
- Heute bleibt ohne Bonus offen. Die Datumsgrenze entspricht der bestehenden WRC-Erfassung; die Tagesiteration mit UTC-Mittag berücksichtigt Monats-, Jahres- und Sommerzeitwechsel.

Es gibt keine Konten, Monatsgutschriften oder Schutzmechanik in der Bonusserie. Das separate Daily-System einschließlich seiner Joker bleibt unverändert.

## Zurückhaltende Oberfläche
Keine Bonusserien-Karte in der Erfassung, kein Kalender und keine Regelansicht. Das Profil zeigt nur bei laufender Serie ab drei erfolgreichen Bonustagen eine kleine Zeile mit dem persönlichen Rekord. Ein Pausentag wird nicht hervorgehoben. Nach dem Ende verschwindet die Zeile ohne Warnung.

Die sieben vorhandenen Patchmotive und Namen für 7, 14, 30, 60, 100, 180 und 365 erfolgreiche Bonustage bleiben unter den persönlichen Auszeichnungen. Ein angeklickter Patch zeigt sein belegtes Datum. Ein Serienende entfernt verdiente Patches nicht. Korrekturen und Löschungen führen dagegen bewusst zur vollständigen Neuberechnung und entfernen nicht mehr belegte Erfolge.

## Kleine Gratulationen
Nur ein erstmals neu erreichter Meilenstein am aktuellen Tag kann einen kurzen, nicht blockierenden Hinweis mit Patchmotiv auslösen. Er wartet auf vorhandene Erfolgsmeldungen und Dialoge, bleibt vier Sekunden und benötigt keine Bestätigung. Es gibt höchstens einen wartenden Hinweis. Bereits gezeigte Meilensteine werden lokal gegen Wiederholung gespeichert; dies speichert keine Leistungen oder Punkte. Die Auszeichnungen selbst stammen immer aus der gemeinsamen Aktivitätshistorie.

Gewöhnliche Bonustage, Reloads, Profilwechsel und rückwirkende Berechnung bleiben still. Nachträge aktualisieren sämtliche Patches ohne Gratulationen. Ein erfolgloser Schreibzugriff oder unvollständiges Neuladen löst nichts aus.

## Anlässe und Daten
Geburtstage, Weihnachten, persönliche Ehrungen und beide Wrapped-Shows verwenden dieselbe neue Berechnung über WRCInsights/WRCOccasions. Besondere Bonusserien werden ab sieben erfolgreichen Tagen hervorgehoben. Keine neue Kennzahl oder Punkteberechnung. Auf ausdrücklichen Nutzerwunsch gilt die neue Serienregel rückwirkend auch für diese Auswertungen; Quellarchive und gespeicherte Aktivitäten bleiben unberührt.

Keine Datenbankmigration, keine neue Tabelle und keine zusätzlichen Datenbank-Schreibzugriffe. Vollständiges paginiertes Laden der Aktivitäten bleibt bestehen. Die übergreifende Entwicklerregel für neue relevante Anlass-Fakten gilt weiter.

## Prüfungen
`node tests/bonus-streaks.cjs`: Serienregel, Pausen, offener Tag, Monats-/Jahreswechsel, Schaltjahr, alle Meilensteine, Änderungen/Löschungen, zentrale historische Bonusregeln, Profilgrenze, stille Nachträge, reduzierte Gratulation und echtes separates Daily-Jokerkonto. Echte Lade-/Speicherpfade mit lokalen Mocks.
`node tests/wrapped.cjs`: gemeinsame Jahresfakten, Bonusserien und beide Shows. Bestehende Regressionstests für Geburtstage, Feiertage, Navigation/PWA, UNO und Dart bleiben bestehen.
`tests/bonus-streaks-preview.html`: ausschließlich lokale synthetische Daten und echter Speicherpfad ohne Supabase-Schreibzugriff; Smartphone, Tablet, Desktop und Patchdialog prüfen.

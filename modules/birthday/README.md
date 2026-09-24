# WRC-Mitgliedergeburtstage

`birthday.js` bleibt der separate WRC-Geburtstag am 1. Februar.

- `member-birthday-data.js`: Geburtsdaten, dynamisches Alter, Jahresstatus, vollständiges Bonus-Ledger und reine Lebenswerk-Auswertung. Startdatum 24.09.2026: keine rückwirkenden Zeremonien vor Einführung.
- `member-birthday.js` / `.css`: öffentliche Tagesgestaltung, Geschenkangebot, persönliche manuell gesteuerte Zeremonie. Bestehende Playerbilder werden verwendet.
- `fabi-2026.json`: unveränderter individuell gelieferter Brief. Weitere Briefe als JSON mit `paragraphs` anlegen und in `letters` mit `Name:Jahr` registrieren. Ohne hinterlegten Brief neutraler Abschluss.

## Speicherung

`supabase/member-birthdays.sql` einmal ausführen. Zwei neue Tabellen, keine Änderungen an bestehenden Fitness-/Spieldaten. `wrc_birthday_gifts` ist ein unveränderliches Ledger: Empfänger, Geber, Jahr, Geburtstag, exakt fünf Punkte. Zusammengesetzter Primärschlüssel verhindert auch parallele Doppelvergaben; Constraints verhindern Selbstgeschenke und falsche Daten. RLS erlaubt Einfügen ausschließlich am serverseitigen Kalendertag in Europe/Berlin. Kein Update/Delete für App-Clients. Wie in der bestehenden WRC gilt die gewählte Person, keine neue Authentifizierung.

Bonus wird getrennt zu aktuellen Monats-/Gesamtsummen, Spielerbeiträgen und Punktekurven addiert. `calcPoints`, Fitnesswerte, Aktivitätsrekorde und der fitnessbasierte Prognose-Durchschnitt bleiben unverändert. Die gemeinsame Prognose erhält den Bonus ausschließlich über den tatsächlichen Gesamtstand, nicht als wiederkehrendes Training.

`wrc_birthday_shows` speichert Person/Jahr erst nach Anzeige des vollständigen Briefes bzw. neutralen Abschlusses. Lokaler Beleg überbrückt einen Verbindungsabbruch; nächste Synchronisierung wiederholt die Speicherung. Schließen vor Abschluss bleibt nachholbar. Personenwechsel entfernt Dialog und Brief. Die Briefdatei wird nur bei der passenden persönlichen Show geladen; diese Auswahl ist bewusst keine Zugriffsauthentifizierung.

Lebenswerk liest das vollständige paginierte Fitnessarchiv und die vorhandenen historischen Personensummen. Rekordtage und Anzahl dokumentierter Tage beziehen sich nur auf detaillierte Daten. Dart-Fakten kommen aus eindeutig zugeordneten gespeicherten Ergebnissen, ohne Dart-Code zu verändern.

## Sichere lokale Vorschau

Nur `localhost` und `127.0.0.1`; URL-Parameter werden auf Produktion ignoriert:

```
/?member-birthday=2026-09-25&birthday-player=Fabi
/?member-birthday=2026-09-25&birthday-player=Thorsten
/?member-birthday=2026-09-27&birthday-player=Fabi
/?member-birthday=2026-10-09&birthday-player=Marian
/?member-birthday=2027-02-21&birthday-player=Basti
/?member-birthday=2027-02-01&birthday-player=Thorsten
```

Die Simulation gilt ausschließlich für dieses Modul. Geschenke und Show-Belege werden nur in separaten lokalen Preview-Schlüsseln gespeichert; keine Geburtstagsschreibzugriffe auf Supabase. Echte Statistiken werden gelesen. Andere normale Eingabeformulare bleiben produktiv und sind nicht Teil der Simulation. Preview-Schlüssel `wrcBirthdayPreviewGifts_v1` und `wrcBirthdayPreviewSeen_v1` zum Zurücksetzen löschen.

Tests: `node tests/member-birthdays.cjs`. Zusätzlich Browserprüfungen für Show, Brief, responsive Gestaltung und Geschenkstatus; Datenbank-Constraints/RLS in einer zurückgerollten Transaktion prüfen. `prefers-reduced-motion` schaltet die neuen Animationen aus.

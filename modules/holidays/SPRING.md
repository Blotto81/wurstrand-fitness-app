# Rosenmontag und Ostern ab 2027

Rosenmontag ist Ostersonntag minus 48 Tage. Die vier Kostüme sind pro Jahr und Spieler stabil, wechseln jährlich und überlagern unveränderte Originalbilder. Die einmalige Einführung wird serverseitig pro Spieler/Jahr gespeichert; Wiederholung ist jederzeit am Eventtag möglich. Es gibt keine Karnevalspunkte.

Ostern läuft am Sonntag und Montag nach Berliner Serverdatum. Acht jährliche Eier, zwei pro Mitglied, liefern jeweils einen bestätigten Punkt. Zuordnung und Einmaligkeit werden in PostgreSQL geprüft. Die bestehende Auswahl eines Spielers bleibt das Identitätsmodell der App. Historische +5-Belege bleiben erhalten und schließen eine zusätzliche Einlösung im selben Jahr aus. Konkrete Fundorte werden hier bewusst nicht dokumentiert.

## Produktion

Nach der bestehenden Christmas-Migration in dieser Reihenfolge im Supabase SQL Editor ausführen:

1. supabase/spring-events.sql
2. supabase/spring-wrapped-v3.sql

Erst anschließend den App-Branch veröffentlichen. Beide Skripte laufen transaktional. Der erste Schritt legt Fundbelege und einmalige Aufrufbelege an, ersetzt den öffentlichen Feiertagsaufruf und sperrt den bisherigen Osterpfad ab 2027. Der zweite erweitert neue Jahresarchive auf Version 3; bereits eingefrorene Archive werden nicht überschrieben.

## Datenfluss

Bestätigte Funde fließen über WRCHolidayData.matching in WRCBonusPoints und damit in die bestehenden Punktesummen. Der zentrale Insights-Provider liefert Anzahl und Datum für Geburtstag, Weihnachten sowie persönliche und gemeinsame Jahresrückblicke. Trainingsauszeichnungen bleiben unverändert. Kostüme sind reine Dekoration und erzeugen keine Leistungsfakten. Archivversionen 1 und 2 ziehen keine aktuellen Osterfunde nach.

## Sichere lokale Vorschau

Im Repository: python -m http.server 8765 --bind 127.0.0.1

- http://127.0.0.1:8765/tests/spring-preview.html?holiday=2027-02-08
- http://127.0.0.1:8765/tests/spring-preview.html?holiday=2027-03-28

Die Vorschau verwendet getrennten lokalen Speicher und blockiert Datenbankaufrufe. Datum, Spieler und Zurücksetzen sind im lokalen Werkzeug verfügbar. Sie verrät keine Fundorte.

## Prüfungen

- node tests/spring-events.cjs: Kalender bis 2100, stabile Kostüme, Eigentum, Punkte, Synchronisierung, historische Belege und Insights.
- node tests/spring-db-test.cjs <Pfad zu PGlite/dist/index.cjs>: echte Migrationen in isoliertem PostgreSQL, Rechte, Einmaligkeit, Datumsgrenzen und Archive.
- node tests/spring-browser.cjs <Pfad zum Playwright-Modul>: isolierter Chrome-Test, mobile Breiten, Tastatur, reduzierte Animationen, kompletter Eventablauf. Externe Requests sind gesperrt. Keine Oster-Screenshots oder Fundortausgaben.

Die bestehenden Feiertags-, Weihnachts- und Wrapped-Tests bleiben Teil der Regression. Produktive Daten wurden durch diese Tests nicht verändert.

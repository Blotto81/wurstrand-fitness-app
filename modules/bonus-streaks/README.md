# WRC Bonusstreaks

## Daten und Berechnung

Der mit dem Nutzer vereinbarte Beginn ist **01.05.2026 für alle Spieler**. Die
historischen Summen Februar–April enthalten keine datierten Bonustage und werden
nicht in eine erfundene Serie umgewandelt.

`bonus-streaks-core.js` stellt eine zentrale, reine Funktion
`WRCBonusStreakCore.calculate(entries, player, asOf, calcPoints)` bereit. Sie erhält
die mit der bestehenden `cleanLoadedEntries`-Funktion zusammengeführten Einträge.
Alle Bonusentscheidungen stammen aus **`calcPoints(entry).bonus > 0`**. Insbesondere
gelten im Mai/Juni die bisherigen historischen Regeln und ab Juli die bestehenden
3er-Regeln. Punkte, Bonusbedingungen und gespeicherte Aktivitäten bleiben unverändert.

Replay je Spieler, chronologisch für jeden Kalendertag:

1. Am Monatsersten zuerst +2 Joker, gedeckelt auf 4 (auch am 01.05.2026).
2. Bonus: Serie +1, gegebenenfalls erster Meilenstein und neuer Rekord.
3. Heute ohne Bonus: offen; weder Jokerverbrauch noch Abbruch.
4. Abgeschlossener Tag ohne Bonus bei laufender Serie: Joker -1, Serie +0.
5. Fehlt der Joker: Serie 0, Neustartguthaben 2. Monatsgutschriften werden nicht
   erneut verarbeitet. Ohne laufende Serie muss nichts geschützt werden; dieses
   Guthaben bleibt bis zum Neustart erhalten (weitere Monatsgutschriften max. 4).

Die Kalendergrenze „heute“ folgt dem lokalen Kalender der bestehenden WRC-Erfassung
und Geburtstagsmodule. Die Iteration der ISO-Datumsschlüssel nutzt UTC-Mittag, sodass
Sommerzeitwechsel keine Tage auslassen/verdoppeln. Zukünftige Aktivitäten zählen nicht.

## Rekorde, Patches und Korrekturen

Jeder Replay behält Rekord und erstmals erreichte Meilensteine **über alle früheren
Serien** hinweg. Ein Serienabbruch löscht keine Auszeichnungen. Meilensteine aus
getrennten Serien werden nicht addiert. Diese dauerhafte Ableitung aus der gemeinsamen
Aktivitätshistorie funktioniert auf jedem Gerät, ohne lokales Abzeichenkonto oder
zusätzliche Datenbanktabelle. Sie korrigiert bei Änderungen/Löschungen falscher
Aktivitätsdaten auch die davon abhängigen Ergebnisse; ein bloßes Reload erzeugt
keine weiteren Freischaltungen.

Es gibt **keine Datenbankmigration und keine neuen Datenbank-Schreibzugriffe**.
`entries-service.js` liest die vorhandene Tabelle nun vollständig in Seiten à 500
Datensätzen (Datum + ID sortiert), statt die Historie später am API-Zeilenlimit
abzuschneiden. Bei Fehlern wird kein teilweise geladener Stand übernommen.

## Einbindung

- `bonus-streaks.js`: Erfassungskarte, Profilbereich, navigierbarer Monatskalender,
  Tag-Details, verdiente Patches neben den unveränderten Sport-Patches, native
  Patch-Dialoge mit Escape/Fokusrückgabe und nicht blockierende Erfolgsanzeige.
- `bonus-streaks.css`: ausschließlich `bs-*`/eigene Mounts, Handy bis Desktop,
  sieben individuell gezeichnete SVG-Motive, reduzierte Bewegung berücksichtigt.
- `index.html`: neue Styles/Skripte, Erfassungsmount und zwei Profil-Aufrufe.
- `entries-service.js`: vollständiges Lesen und Hooks für Lade-/Speichererfolg.
- `service-worker.js`: v61 und drei neue Offline-Dateien.

Nicht erreichte Patches werden nicht ins DOM gerendert (auch keine Silhouetten oder
zukünftigen Namen). Die bestehenden Leistungsclub-Module bleiben unverändert.

Eine Animation setzt einen erfolgreichen Aktivitätsschreibzugriff **und** ein
erfolgreiches Neuladen voraus. Vorher-/Nachhervergleich am Aktivitätsdatum verhindert
Wiederholungen bei bereits erreichtem Bonus. Nachträge können auch spätere Meilensteine
freischalten; alle neu erreichten Auszeichnungen werden angezeigt. Reload, Profilwechsel
und rückwirkende Erstberechnung lösen keine Erfolgsanimation aus. Der Hinweis folgt der
bestehenden Speichermeldung und wartet auf offene Auszeichnungsdialoge.

## Prüfung

`node tests/bonus-streaks.cjs` prüft 15 Replay-Szenarien (inkl. aller sieben Meilensteine,
Joker, Grenzen, Nachträge, Korrekturen/Löschungen, mehrere Spieler, Zukunft, historische
Bonusregeln und Idempotenz) sowie echte Lade-/Speicherfunktionen mit lokalem Datenmock.
Zusätzlich werden die bestehenden Tests zu Navigation/PWA, Geburtstagen, Feiertagen,
UNO und Dart ausgeführt. Kein package.json/Build-Schritt vorhanden; die App besteht
aus direkt ausgeliefertem HTML/CSS/JavaScript. Inline-Skripte und geänderte JS-Dateien
werden syntaktisch geprüft.

`tests/bonus-streaks-preview.html` ist eine ausschließlich auf localhost erlaubte
Browser-Prüfseite mit synthetischen Daten und dem echten Speicherpfad; sie schreibt
nicht auf Supabase. Smartphone 320/390 px, Tablet und Desktop prüfen; Spieler wechseln,
Monate/Tagdetails bedienen, Patch öffnen/Escape, neuen Bonus speichern, unveränderten
Bonus erneut speichern und Reload ohne Animation prüfen. Die 365-Tage-Probe verwendet
ausdrücklich ein simuliertes Datum in 2027.

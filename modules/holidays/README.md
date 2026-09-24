# WRC-Feiertage

Eigenes Kalender-, Daten- und UI-Modul; Seasonal bleibt die optische Kulisse. Die bestehenden Geburtstagsdateien bleiben unverändert. `WRCBonusPoints` aggregiert ausschließlich beim Lesen Geburtstags- und Feiertagsbelege. Fitnesswerte und `calcPoints` bleiben unverändert; die zentrale Monatsprognose verwendet nur Fitnesspunkte für den Tagesdurchschnitt.

## Speicherung

`supabase/holiday-events.sql` einmalig ausführen. `wrc_holiday_events` ist für App-Clients nur lesbar. Die RPC `claim_wrc_holiday` prüft den aktuellen Tag serverseitig in Europe/Berlin, feste Spieler und gegebenenfalls Ei/Tür. Punkte, Jahr und Halloween-Ergebnis werden vom Server bestimmt. Der Primärschlüssel `(event_type,event_year,player)` verhindert doppelte Vergaben auch bei gleichzeitigen Geräten. Fehler erzeugen keine optimistischen Punkte.

Ostern und Weihnachten: exakt +5. Halloween, Nikolaus und Silvester: 0. Belege bleiben nach Ablauf der Aktionsfenster erhalten. Die vorhandene Spielerwahl ist wie beim Geburtstag die Identitätsgrundlage; es wird kein neues Login eingeführt.

Vier Eierslots: Dashboard, Eingabe, Analyse, Spielerbereich. Besitzer ist `['Thorsten','Fabi','Marian','Basti'][(Jahr + Slot) % 4]`, identisch in SQL und JavaScript. Jedes Jahr rotiert die Zuordnung; sie bleibt innerhalb eines Jahres geräteübergreifend gleich.

## Lokale Vorschau

Nur auf localhost/127.0.0.1, beispielsweise mit `python -m http.server 8766 --bind 127.0.0.1`:

- `/?holiday=2026-04-05&holiday-player=Thorsten`
- `/?holiday=2026-10-31&holiday-player=Thorsten`
- `/?holiday=2026-12-06&holiday-player=Thorsten`
- `/?holiday=2026-12-24&holiday-player=Thorsten`
- `/?holiday=2026-12-31&holiday-player=Thorsten`

Andere Spieler über holiday-player oder die vorhandene Spielerwahl testen. Andere Jahre erlauben neue Durchläufe. Die Vorschau benutzt ausschließlich den lokalen Speicher `wrcHolidayPreview_v1`; sie aktiviert außerdem den bereits vorhandenen Geburtstagssandbox-Modus, bevor dessen Dateien laden. Keine Bonus-RPCs werden aufgerufen. Jahresstatistiken lesen echte Einträge. Der normale Monatsselektor bleibt unabhängig vom simulierten Feiertag. In Produktion werden sämtliche Preview-Parameter ignoriert.

## Prüfung

`node tests/holidays.cjs` und `node tests/member-birthdays.cjs`; zusätzlich `tests/test-runner.html` im Browser. Mobile Darstellung und alle fünf Aktionen einschließlich Reload prüfen. Datenbankprüfungen in einer zurückgerollten Transaktion/temporären Tabelle durchführen, niemals echte Testgeschenke vergeben.

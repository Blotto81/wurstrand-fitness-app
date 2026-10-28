# WRC-Feiertage

Eigenes Kalender-, Daten- und UI-Modul; Seasonal bleibt die optische Kulisse. Die bestehenden Geburtstagsdateien bleiben unverändert. `WRCBonusPoints` aggregiert ausschließlich beim Lesen Geburtstags- und Feiertagsbelege. Fitnesswerte und `calcPoints` bleiben unverändert; die zentrale Monatsprognose verwendet nur Fitnesspunkte für den Tagesdurchschnitt.

## Speicherung

`supabase/holiday-events.sql` einmalig ausführen. `wrc_holiday_events` ist für App-Clients nur lesbar. Die RPC `claim_wrc_holiday` prüft den aktuellen Tag serverseitig in Europe/Berlin, feste Spieler und gegebenenfalls Ei/Tür. Punkte, Jahr und Halloween-Ergebnis werden vom Server bestimmt. Der Primärschlüssel `(event_type,event_year,player)` verhindert doppelte Vergaben auch bei gleichzeitigen Geräten. Fehler erzeugen keine optimistischen Punkte.

Ostern und Weihnachten: exakt +5. Halloween v2: bei Goldwurst exakt +1, sonst 0; historische Halloween-v1-Belege, Nikolaus und Silvester: 0. Belege bleiben nach Ablauf der Aktionsfenster erhalten. Die vorhandene Spielerwahl ist wie beim Geburtstag die Identitätsgrundlage; es wird kein neues Login eingeführt.

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

## Halloween: die vier verfluchten Türen (v2)

Ein Versuch je Spieler und Kalenderjahr, nur am 31. Oktober (Serverzeit Europe/Berlin). Werkstatt, Kabine, Gruft und Kühlschrank verwenden die vorhandenen Profilmerkmale; Namen erscheinen erst nach der Wahl. Die Reihenfolge wird pro Raum gemischt. Türbesitzer, Position und Raumtiefe beeinflussen die Auslosung nicht. Stärkere Schatten/Nebel ab Raum 3/5/8 sind rein optisch.

Die allein maßgebliche Produktionskonfiguration ist `wrc_halloween_weights()` in `supabase/halloween-labyrinth.sql`: weitere Türen 45, Wursti 25, Goldwurst 20, Fluch 10. Jede Öffnung hat dieselben Gewichte. Die JS-Konfiguration spiegelt diese Werte ausschließlich für die lokale Vorschau. Kein Raumlimit, keine wachsende Gewinnchance. 15 Flüche und acht Raumkommentare. Sounds werden lokal mit Web Audio erzeugt, bleiben standardmäßig aus und starten erst nach Interaktion. Keine externen Soundlizenzen/Downloads. Reduzierte Bewegung unterdrückt die gesamte Szene; Überspringen und Hintergrundwechsel stoppen sie ebenfalls.

### Migration / Reihenfolge

Nach den bestehenden Feiertags- und Wrapped-Migrationen einmalig ausführen:

1. `supabase/halloween-labyrinth.sql`
2. `supabase/halloween-wrapped-v2.sql`
3. Aktualisierte App veröffentlichen (Service-Worker v66).

Keine bestehenden Einträge oder Belege werden gelöscht oder umgeschrieben. Die erste Migration ergänzt `wrc_halloween_runs`, ein Versionsfeld am Feiertagsbeleg, passende Constraints und `open_wrc_halloween`. Sie ersetzt den alten Halloween-Zugang durch eine Sperre; andere Feiertage delegieren an die unveränderte bisherige Implementierung. Alte Halloween-v1-Belege bleiben lesbar und gelten weiterhin als abgeschlossener Jahresversuch. Sie werden nicht zu einem erfundenen Labyrinth umgedeutet.

Spielstatus: `(event_year,player)` eindeutig, `doors` zählt bestätigte Öffnungen, `status` trennt laufend/abgeschlossen, `outcome`, `curse`, `last_owner`, `door_order` und `completed_date` bleiben gespeichert. Eine transaktionsweite Sperre und die erwartete Türanzahl (`p_expected`) serialisieren Geräte und Wiederholungen. Eine veraltete Anfrage liefert den aktuellen Zustand ohne neue Auslosung. Ergebnis und ggf. +1-Beleg werden atomar geschrieben. Direkte App-Schreibrechte sind gesperrt. Bei Netzverlust wird nicht optimistisch weitergespielt. Wiederaufnahme am selben Halloween lädt den bereits bestätigten Raum; ab 1. November sind keine neuen Öffnungen möglich. Der nächste 31. Oktober beginnt einen unabhängigen Versuch, alte Akten bleiben unter Einträge abrufbar.

Die bestehende gemeinsame Spielerwahl ist weiterhin die Identitätsgrundlage, kein persönliches Login. Damit lässt sich ein Versuch nicht zurücksetzen, aber die App verhindert nicht, dass jemand absichtlich einen anderen Namen auswählt.

Die Goldwurst zählt exakt +1 über `WRCBonusPoints`, getrennt von Fitness, Tagesbonus und Bonusserie. Ein lokales Vorschau-Ergebnis fließt überhaupt nicht in echte Punkte ein.

### Anlässe und Archiv

`WRCInsights.register('halloween', …)` verwendet nur vollständige, datierte Akten. Mein/Unser Wrapped und humorvolle Nachrichten dürfen sie aufgreifen; Geburtstags- und Weihnachtsgrüße sowie sportliche Ehrungen bleiben bewusst unverändert, da das Zufallsspiel keine sportliche Leistung ist. Neue Wrapped-Archive erhalten Version 2 und frieren die Halloween-Quelle am bisherigen Stichtag mit ein. Eingefrorene v1-Archive bleiben unverändert und erhalten keine später nachgeladenen Halloween-Fakten. Der Zeitraum 25.–31. Dezember bleibt unverändert.

### Sichere Prüfung

`tests/halloween-preview.html` auf localhost/127.0.0.1 bietet Spieler, Jahr und gezielte Ereignisse; ausschließlich lokaler Speicher, kein Supabase-Zugriff. Die normale App-Vorschau `/?holiday=2026-10-31&holiday-player=Thorsten` prüft die Integration. Produktions-URL-Parameter erlauben keine erzwungenen Ereignisse.

- `node tests/halloween.cjs`: Wahrscheinlichkeitsgrenzen, Türunabhängigkeit, 10.000 Räume, Wiederaufnahme, terminale Zustände, Vorschau-Isolation, Produktions-RPC-Vertrag.
- `node tests/halloween-db-test.js <Pfad-zum-PGlite-Modul>`: echte PostgreSQL-Ausführung in einer wegwerfbaren lokalen Instanz. Migration, 100 Räume, Wiederholungen, konkurrierende Anfragen, Rechte, exakt +1, Folgejahr, alte Belege, andere Feiertage, Archiv v2/v1 und Wrapped-Zeitraum. Testzeit/erzwungene Gewichte existieren nur in dieser isolierten Instanz.
- Alle bestehenden `tests/*.cjs` sowie Smartphone/Tablet, Akte, Überspringen und Reload prüfen. Keine echten Testpunkte vergeben.

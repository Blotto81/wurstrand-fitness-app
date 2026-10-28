# WRC Wrapped und gemeinsame Anlass-Fakten

## Aufbau
- `insights/insights.js`: reine, lesende Jahresauswertung; verwendet injizierte zentrale Punkte-, Bereinigungs- und Bonus-Streak-Funktionen. Kleine Provider-Registry statt einer neuen Regelengine.
- `insights/occasions.js`: Adapter zur bestehenden App. Geburtstag, Weihnachten und persönliche Post bekommen maximal einen passenden kurzen Highlight-Text.
- `wrapped-data.js`: serverbestätigte Freigabe, parallele Anfragen zusammenfassen, bestätigte Ausgaben offline speichern.
- `wrapped-story.js`: persönliche Dramaturgie und eigenständige Team-Gala. Jeder Archivspieler erhält genau einen eigenen Auftritt. Titel werden deterministisch anhand belegter Stärken gewählt, Kategorien möglichst unterschiedlich vergeben. Bei fehlenden Daten wertschätzende Würdigung ohne erfundene Leistung.
- `year-review.js/css`: modale Shows, Bibliothek am Dashboard-Ende, Tastatur/Pfeile, horizontales Wischen, Fortschritt, Neustart, reduzierte Bewegung. Ton startet bei jedem Öffnen aus. Optionale kurze, selbst erzeugte WebAudio-Töne, keine externen Musikdateien.

## Verbindlicher Datenstand
Für jede Ausgabe gilt **23. Dezember einschließlich**, Berliner Kalender. Bei der ersten serverseitig erlaubten Anfrage wird EIN gemeinsamer Quellstand aller Spieler in einer Transaktion archiviert. Ein Jahres-Lock verhindert konkurrierende Archive. Der Aufnahmezeitpunkt wird zusätzlich angezeigt.

Nachträge mit einem Datum bis 23.12. zählen, wenn sie vor dieser Archivierung gespeichert sind. Spätere Änderungen zählen nicht mehr in dieser Ausgabe. Aktivitäten vom 24.–31.12. gehören weiterhin zur normalen Jahresstatistik, nicht zu dieser Weihnachtsausgabe. Ohne Aufruf während des Freigabezeitraums wird keine Ausgabe nachträglich freigeschaltet; es gibt keinen Hintergrund-Scheduler. Die Anzeige sagt deshalb „bei der ersten Freischaltung archiviert“ und nennt den echten Zeitpunkt.

Der eingefrorene Quellstand und deterministische Auswertung verhindern wechselnde Titel durch nachträgliche Einträge. `version: 1` ist ein dauerhafter Kompatibilitätsvertrag: Regeln, Titelalgorithmus und Provider dieser Version erhalten. Neue Bedeutung nur in neuer Version implementieren und alte Ausgaben weiterhin über v1 auswerten. Zentrale Punkte- und Streak-Regeln müssen bei Änderungen historische Datumsregeln bewahren. Kein stilles Neuberechnen alter Ausgaben mit neuen Regeln.

## Jährliche Weihnachtsüberraschung
Vor der bestätigten Freischaltung gibt es weder Dashboard-Button noch gesperrte Vorschau. Zwischen 25. und 31. Dezember erscheint die persönliche Überraschung als WRC-Post beim Benutzen der App. Falls gerade eine andere Nachricht offen ist, wird später erneut versucht. Danach bleibt der Zugang bis einschließlich 31. Dezember verfügbar, auch auf anderen Geräten. Ab 1. Januar verschwinden Button und Shows wieder. Jedes Jahr beginnt eine neue Ausgabe mit den Erfolgen des jeweiligen Jahres. Im Archiv wird ausschließlich die aktuelle freigegebene Jahresausgabe angeboten; einzelne Shows bleiben bis zu ihrem eigenen Tag verborgen. Ein geöffnetes Browserfenster prüft im Freigabezeitraum regelmäßig nach. Kein Push bei geschlossener App.

## Freigabe und Datenbank
`supabase/wrc-wrapped.sql` einmalig als Migration anwenden. Auf bereits eingerichteten Installationen die Nachmigration `supabase/wrc-wrapped-surprise.sql` ausführen: Sie verschiebt nur noch nicht freigegebene 24.-Dezember-Termine und setzt neue Termine auf 25.–31. Dezember. Sie legt ausschließlich die neue Tabelle `wrc_wrapped_years` und die begrenzte RPC `get_wrc_wrapped` an. Bestehende Aktivitäten, Geschenke und Spielergebnisse werden nur gelesen, nie verändert. Die Tabelle hat RLS und keine Client-Lese-/Schreibrechte. Die RPC verwendet einen festen Search Path und validiert Jahr, Modus und Spieler.

Serverseitig wird einmal pro Jahr je Spieler und einmal fürs Team ein Zufallstag 25–31 gespeichert. Teamtag gilt für alle Geräte/Spieler. Gerätezeit oder URL-Parameter schalten nichts frei. Die Tage werden dem Client nicht vorab verraten. Die RPC gibt Ausgaben nur innerhalb ihres eigenen Freigabezeitraums bis 31. Dezember zurück. Eingefrorene Archive bleiben unverändert gespeichert, sind außerhalb der Saison aber nicht abrufbar. Die vorhandene App verwendet auswählbare Spielernamen statt persönlicher Authentifizierung; Wrapped übernimmt diese Vertrauensgrenze und ist kein privates Authentifizierungssystem.

Aktueller gemeinsamer Kader: Thorsten, Basti, Marian, Fabi, entsprechend `config.js`. Bei Kaderänderungen bewusst zukünftige SQL-Jahre/Archivversion anpassen; eingefrorene Kader bleiben erhalten.

## Daten und Grenzen
- Originale Tageseinträge ab Mai 2026, identisch bereinigt wie in der App. Schritte, Rad, Kraft, Übungen, Punkte und Bonus werden aus `calcPoints` abgeleitet.
- Bestehende Sammelwerte Februar–April 2026 werden unverändert addiert. Bei Abweichungen zwischen Spieler-Sammelwerten und Team-Sammelwerten bleiben die bestehenden Teamwerte maßgeblich. Keine Datenkorrektur durch Wrapped.
- Aktive Tage, stärkster Tag/Monat, Comebacks und Tagesrekorde sind nur im detaillierten Tagesarchiv belegbar; Sammelwerte erfinden keine Tage. Rekorde benötigen einen früheren niedrigeren Wert. Steigerung vergleicht Monate mit mindestens sieben aktiven Tagen. Vorjahresvergleich verwendet detaillierte Einträge bis zum gleichen Kalenderdatum und weist auf Erfassungslücken hin.
- Die Bonusserie wird pro Spieler einmal mit sämtlicher relevanter Vorgeschichte zentral nachgerechnet. Jahreswert = in diesem Jahr selbst verdiente Tage je Serie. Einzelne Pausentage zählen nicht mit; zwei abgeschlossene Tage ohne Bonus beenden die Serie. Übernommene Vorjahrestage und ein neuer serienübergreifender persönlicher Rekord werden zusätzlich erläutert. Patches zählen nur beim ersten belegten Erreichungsdatum im Jahr.
- Sport-Club-Patches verwenden vorhandene Clubschwellen und den ersten passenden archivierten Tag. Frühere Sammelwerte belegen kein individuelles Tagesdatum.
- Erfolgreiche Dailys: eindeutig nach Spieler/Tag/Daily-ID. Geburtstags-/Feiertagspunkte getrennt von Aktivitätspunkten; finale WRC-Summe enthält beide.
- Gespeicherte Dart-/UNO-Partien und Platzierungen sind optionale Fakten. Keine Änderung an Spielmodulen oder Ergebnissen.
- Vor 2026 besteht kein ausreichend belastbarer Jahresdatenbestand; Bibliothek beginnt 2026.

## Neue Fakten hinzufügen
`WRCInsights.register('eindeutige-id', ({result, archive, inYear, options}) => facts)` liefert Fakten mit `id`, `player`, `value`, `unit`, `from`, `through`, optional `date`, `label`, `text`, und `occasions` (`birthday`, `christmas`, `personal-wrapped`, `team-wrapped`, `honor`, `message`). Nur belegte positive endliche Werte und bekannte Spieler. Provider muss mit `inYear` nach Datum filtern. Fehlende Daten ergeben eine leere Liste, keine erfundenen Nullen oder Rekorde.

Neue benötigte Quellen müssen kontrolliert in Archiv und Anlass-Adapter gelangen. Registry ist bewusst kein universeller Datenlader. Bestehende Geburtstags-/Feiertagsgeschenke, Postregeln und Statistiken bleiben erhalten.

## Offline und Vorschau
Bereits auf diesem Gerät geladene, freigegebene Ausgaben bleiben innerhalb derselben Dezember-Saison offline verfügbar. Ab Januar sperrt auch der Offline-Cache die Wiedergabe (Berliner Kalender). Ohne bestätigtes lokales Archiv wird verständlich zum erneuten Online-Versuch aufgefordert; keine erfundene Freigabe. Cache- oder Speicherprobleme verhindern keine Online-Nutzung. Soundpräferenzen werden nicht gespeichert.

`tests/wrapped-preview.html` funktioniert mit `tests/wrapped-fixture.js` nur auf localhost/127.0.0.1. Sie verwendet ausdrücklich synthetische Daten ohne DB-Schreibzugriffe; kein Produktions-Unlock. Lokal per HTTP-Server starten. Nicht als echte Jahresausgabe ausgeben.

## Prüfungen
- `node tests/wrapped.cjs`: Daten, Zeiträume, zentrale Bonusserien, Pausentage, Patches, Titel, alle Spieler, Dramaturgie, Syntax.
- `node tests/wrapped-data.cjs`: RPC/Cache, Parallelität, Offline-Freigaben, Jahres-/Spielertrennung, Vorschaugrenze.
- Vorhandene `tests/*.cjs` sowie `tests/test-runner.html` ausführen; kein separater Build vorhanden.
- `tests/wrapped-database.sql` ausschließlich nach dem Migrationskörper **in einer Transaktion ohne COMMIT** ausführen. Test verändert die Uhr nur in der Rollback-Transaktion und endet immer mit ROLLBACK. Niemals diese Testdefinition als produktive RPC veröffentlichen.
- Browser: beide Shows, alle Spieler, drei Enthüllungsarten, stummer Start, Ton-Schalter, Schließen/Neustart, Keyboard, schmale/breite Viewports, sichtbarer Datenstand.

## Halloween-Archiv v2

`supabase/halloween-wrapped-v2.sql` erweitert ausschließlich neu erzeugte Jahresquellen um bestätigte Halloween-Akten. V1-Archive bleiben unverändert und werden ohne nachgeladene Halloween-Fakten gerendert. Version 2 ergänzt persönliche/teambezogene Erinnerungen über den gemeinsamen Insight-Provider, keine sportlichen Titel oder Bonusserien. Siehe Feiertagsdokumentation für Migration und lokale PostgreSQL-Tests.

# Dashboard-Geschichten

Die vorhandene Highlight-Karte zeigt genau einen belegten Fakt oder einen persönlichen Tagesrekord. Es gibt keine neuen Punkte, Datenbanktabellen, Speicherung oder Navigation.

- Gemeinsamer Kalendertag: Europe/Berlin. Datengrenze: gestern. Heutige Aktivität verändert die Auswahl nicht. Bei Korrekturen wird sie neu aufgebaut.
- Spieler mit geeigneten Fakten rotieren deterministisch nach Kalendertag. Rekorde haben nur im Slot des ausgewählten Spielers Vorrang; niemand kann die anderen durch viele Rekorde verdrängen. Bei gleichbleibendem Kandidatenkreis gleich viele Auftritte. Fehlende Daten können die Rotation verändern.
- Faktenarten wechseln nach Rotationsrunde. Einheiten, Datum und Datenbasis stehen im Text. Monats-Radvergleich und Wochen-Schrittvergleich verlangen jeden Tag beider Zeiträume; fehlende Einträge gelten nie als Null. Allgemeine Summen sind ausdrücklich gespeicherte Einträge.
- Rekorde stammen aus WRCInsights.records, benötigen einen niedrigeren früheren Bestwert und erscheinen ausschließlich am Folgetag des Leistungsdatums. Alte Nachträge bekommen kein frisches Rekordetikett. Tagesrekorde beziehen sich auf das detaillierte Archiv, nicht auf unvollständige historische Summen.
- Nur erfolgreich vollständig geladene Serverdaten berechtigen zur Anzeige. Quickstart-Cache, Ladefehler und Offlinezustand blenden sie aus. Sichtbare Apps aktualisieren über den bestehenden Ladeweg nach vier Minuten; nach fünf Minuten ist die Karte bis zur erfolgreichen Aktualisierung verborgen. Keine neue Schreiboperation.
- Feiertagskalender, Geburtstage und Wrapped-Zeitraum haben Vorrang; die Karte ist dann verborgen. Die Achievement-Karte nutzt den freien Platz. Vorhandene Zielbanner bleiben sichtbar und unterdrücken die Tagesgeschichte nicht mehr für einen ganzen erfolgreichen Monat.
- Optik: vorhandener Slot, ruhiger dunkler Hintergrund, kleinere gut lesbare Faktüberschrift, einheitlicher Schatten/Abstand, dezenter Goldrahmen für Rekorde, keine neue Animation.

## Anlassprüfung laut AGENTS.md

Dies ist eine neue Darstellung vorhandener Aktivitäten und Rekorde, keine neue Kennzahl oder Auszeichnung. Fakten werden über den zentralen dashboard-Provider registriert und ausschließlich für den Anlass dashboard freigegeben. Geburtstag, Weihnachten, persönliche und Team-Wrapped-Ausgaben, Ehrungen und Nachrichten verwenden weiterhin ihre vorhandenen Aktivitäts-/Rekordauswertungen. Keine doppelten Erfolge, keine zusätzliche Quelle und keine Änderung an eingefrorenen Archiven oder vergebenen Titeln.

## Prüfung

`node tests/dashboard-stories.cjs` prüft Zeitzone/DST, Gerätedeterminismus, Rotation, vollständige Monate/Wochen, Jahresgrenze/Schaltjahr, bestehende Rekorderkennung, Nachträge/Korrekturen, Duplikate, Bonusberechnung, fehlende Daten, Datenfrische/Offlinezustand und Ereignispriorität. Die bestehenden CJS-Tests prüfen weiter Punkte, Prognose, Speichern, Dart, UNO, Geburtstage, Feiertage und Wrapped. `tests/dashboard-preview.html` ist eine lokale Darstellung mit deutlich gekennzeichneten synthetischen Daten und ohne Backendzugriff.

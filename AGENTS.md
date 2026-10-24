# Entwicklerleitfaden: WRC-Funktionen gehören zusammen

Die App ist eine modulare Vanilla-JavaScript-Anwendung. Bestehende Punkte-, Streak- und Speicherregeln wiederverwenden; keine parallelen Berechnungen einführen.

## Pflichtprüfung bei neuen Funktionen
Bei jeder neuen Aktivität, Kennzahl, Auszeichnung, Spielmechanik oder Rekordart prüfen und im Änderungsbericht festhalten:
1. Geburtstag: Gibt es ein passendes persönliches Highlight?
2. Weihnachten: Passt ein kurzer herzlicher Hinweis zur Überraschung?
3. Mein WRC Wrapped: Gehört der Erfolg in die persönliche Jahresgeschichte?
4. Unser WRC Wrapped: Ist er für Teamleistung oder einen individuellen Auftritt relevant?
5. Ehrungen und persönliche Nachrichten: Kann er dort sinnvoll aufgegriffen werden?

Relevante Fakten zentral über `WRCInsights.register()` in `modules/insights/insights.js` bereitstellen. Zeitraum, Spieler, Einheit, belegtes Erreichungsdatum und geeignete Anlässe explizit machen. Benötigte Daten im Anlass-Adapter und im versionierten Jahresarchiv ergänzen. Eine Registrierung alleine lädt keine neuen Datenquellen. Irrelevante Anlässe bewusst auslassen und kurz begründen.

`calcPoints`, `cleanLoadedEntries` und `WRCBonusStreakCore.calculate` sind die bestehenden Autoritäten. Keine neue Punkte- oder Jokerlogik in Text-/UI-Modulen. Historische Ausgaben dürfen durch neue Regeln oder Provider ihre vergebenen Titel nicht ändern: Version 1 beibehalten und für abweichende Semantik eine neue Archiv-/Auswertungsversion ergänzen.

Details, Datenstandsregel, SQL-Einrichtung und Tests: [Wrapped-Dokumentation](modules/year-review/README.md).

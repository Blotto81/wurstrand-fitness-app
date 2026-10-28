# B.o.B. – Best of Bärte

Eigenständiges Museum unter **Fun Facts → B.o.B.**. Keine neue Hauptnavigation, Punkte, Ranglisten oder Verknüpfung zu Erfolgen. Die Produktion startet ohne Exponate.

## Bewusst gewähltes Zugriffsmodell

Im Folgegespräch hat der Auftraggeber ausdrücklich **ohne Login** und **alle mit dem App-Link dürfen hochladen, bearbeiten und löschen** gewählt. Diese Entscheidung ersetzt die anfängliche Admin-Anforderung. Der Bucket ist öffentlich: Originalfotos sind über ihre URL abrufbar; Bearbeitung erfolgt über die freigegebenen B.o.B.-RPCs. Ein ausgewählter Spielername ist nur der Bartträger, kein Berechtigungsnachweis. Keine Auth-Konten, Admin-PINs oder geheimen Schlüssel im Frontend.

RLS bleibt aktiv. Direkte Änderungen an den Museumstabellen sind gesperrt. Validierte RPCs begrenzen Änderungen auf die Sammlung. Storage-Policies erlauben nur reservierte neue Pfade; aktive Fotos können nicht direkt überschrieben oder gelöscht werden. Restriktive Guards schützen den Museum-Bucket auch bei vorhandenen allgemeinen Storage-Policies. Andere Buckets behalten ihre bisherigen Regeln.

## Supabase-Einrichtung

1. Im vorhandenen WRC-Projekt `ythcpltiujpnxedtgjmr` die Datei `supabase/bob-museum.sql` vollständig im SQL-Editor ausführen. Die Migration ist wiederholbar und verändert keine bisherigen WRC-Datentabellen.
2. Sie erstellt `wrc_bob_exhibits`, die interne Asset-/Vorgangsverwaltung, die RPCs und den Bucket `wrc-bob-originals` inklusive RLS, 15-MB-Limit und MIME-Freigabe für JPEG, PNG und WebP.
3. Frontend veröffentlichen. Es nutzt den vorhandenen Supabase-Client und veröffentlichbaren Schlüssel. Keine weitere Einrichtung und kein neuer Account erforderlich.
4. Unter Fun Facts das Museum öffnen. Die erste echte Aufnahme selbst hochladen. Auf einem zweiten Gerät ist sie beim Öffnen, über Aktualisieren oder spätestens nach dem nächsten 30-Sekunden-Abgleich der sichtbaren Galerie zu sehen.

Die Migration wurde im Rahmen der Umsetzung im vorhandenen Projekt ausgeführt. **Es wurden keine Beispiel-Exponate oder Testfotos in der Produktion angelegt.**

## Dateien und Lebenszyklus

- Originale werden als unverändertes File-Objekt hochgeladen. Kein Canvas, keine Kompression, keine Retusche, keine Filter und kein Beschnitt. `object-fit: contain`, Bilderrahmen ausschließlich in CSS. EXIF-/Orientierungsinformationen bleiben unverändert in der Originaldatei.
- JPEG, PNG und WebP bis 15 MB. Browser prüft Dateisignatur und Decodierbarkeit; Storage prüft MIME und Größe. HEIC/HEIF wird mit einer klaren Bitte um ein unterstütztes Format abgewiesen, ohne automatische Umwandlung.
- Zufällige UUID-Pfade und `upsert:false`. Upload-Reservierung und gespeicherte MIME/Bytegröße werden beim Speichern serverseitig geprüft.
- PostgreSQL-Identity vergibt eindeutige Exponatnummern. Kein Neuordnen oder Wiederverwenden nach Löschung. Fehlgeschlagene Transaktionen können Nummernlücken hinterlassen.
- Jede Speicherung hat eine stabile Vorgangs-ID. Verlorene Antworten lassen sich ohne doppeltes Exponat wiederholen. Versionsprüfung verhindert versehentliches Überschreiben von Änderungen anderer Geräte.
- Fotoaustausch speichert zuerst das neue Original und schaltet erst danach die Plakette um. Das alte Foto wird anschließend über die Storage-API entfernt.
- Löschen benötigt eine zweite Bestätigung. Der Datensatz wird zur Entfernung markiert; erst nach erfolgreicher Storage-Löschung wird er endgültig entfernt. Keine direkten SQL-Löschungen in `storage.objects` durch Produktions-RPCs.
- Unterbrochene Bereinigungen werden beim erneuten Öffnen/Aktualisieren wiederholt. Unbenutzte Upload-Reservierungen werden nach 24 Stunden bei der nächsten Bereinigung entfernt. Bei Netzwerkfehlern bleibt eine offene Bereinigung sichtbar. Öffentlich zwischengespeicherte Bilder können kurz nach einer Löschung noch im Browser/CDN liegen (Upload-Cachezeit 60 Sekunden).
- Aufnahmedatum bleibt optional; `created_at` wird nie als Aufnahmedatum angezeigt. Widmungen sind ausdrücklich persönliche Texte. Benutzereingaben werden bei der Darstellung escaped.

## Anlassprüfung nach AGENTS.md

Geburtstage, Weihnachten, persönliche/Team-Wrapped, Ehrungen und Nachrichten: bewusst keine Integration. B.o.B. ist eine private gemeinsame Sammlungsidee, keine sportliche Aktivität, Kennzahl oder Auszeichnung. Entsprechend keine neuen Insight-Fakten, keine Punkte und keine Änderung an eingefrorenen Archiven.

## Prüfungen

- `node tests/bob.cjs`: Formular, optionale Daten, Dateisignaturen/Limit, HEIC-Fehler, Sortierung, identische Originalbytes, Wiederholungen, Navigation und Syntax.
- `node tests/bob-db-test.js <Pfad zu @electric-sql/pglite>`: echte temporäre PostgreSQL-Datenbank, wiederholbare Migration, anonyme RPC-Nutzung, RLS auch bei alten allgemeinen Policies, gleichzeitige eindeutige Nummern, Versionskonflikte, zweistufiges Löschen, Fotoaustausch und Bereinigung.
- `node tests/bob-preview-server.js <Pfad zu @electric-sql/pglite>` startet auf 127.0.0.1:8784 eine **isolierte** leere Datenbank mit lokaler Storage-Nachbildung. `tests/bob-preview.html` enthält keine Verbindung zu Supabase und keine Beispielbilder. Nur selbst gewählte lokale Prüfbilder werden benutzt. Fehler-Schalter simulieren Upload-Ausfall, verlorene Speicherantwort und abgebrochene Bildlöschung.
- Browserprüfung: Smartphonebreite 390 px, Originalvorschau, Hoch-/Querformat, unbekanntes Datum, optionale Texte, Austausch, Speichern nach verlorener Antwort, zweiter Tab, Detail/Escape, Abbrechen/Bestätigen/Wiederholen der Löschung und Rückweg zu Fun Facts. Eine physische Android-Kamera wurde nicht bedient; `accept` und separater `capture=environment`-Eingang bieten Galerieauswahl und Kamera an.
- Vorhandene CJS-Regressionstests bleiben grün. Punkte, Dart, UNO, Bonusserie, Feiertage, Geburtstage, Dashboard und Wrapped unverändert.

Storage-Grundlagen: [Supabase Access Control](https://supabase.com/docs/guides/storage/security/access-control), [Bucket-Konfiguration](https://supabase.com/docs/guides/storage/buckets/fundamentals).

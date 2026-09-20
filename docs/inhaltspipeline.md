# Inhalte: eine Quelle für alle Apps

Plan für den Umbau der Inhalts-Pipeline. Stand: 20.09.2026, am Code zu
diesem Zeitpunkt nachgemessen.

## Ziel

Inhalte sollen sich ändern lassen, ohne dass jemand TypeScript anfasst,
und beide Apps sollen danach dasselbe zeigen. Das Nachladen über das Netz
ist bewusst **nicht** Teil dieses Plans; die Apps bleiben komplett
offline, Änderungen brauchen weiter einen Release.

## Befund

Die verbreitete Annahme, Desktop und iOS zeigten dasselbe, stimmt nicht.
Der Text ist tatsächlich dieselbe Quelle, aber das ist nicht das, was
jemand in der App sieht.

**Abbildungen klaffen weit auseinander:**

| | Desktop | iOS |
|---|---|---|
| `illustrationId` (Bilddateien) | 0 von 47 gerendert | 47 |
| `illustration` (React-SVG) | 3 | 0 |

47 Abbildungen sind im Inhalt verknüpft, der Desktop rendert `illustrationId`
an keiner Stelle. Er kennt nur drei fest eingebaute SVG-Komponenten.
Beim Herz-Kreislauf-System heißt das konkret: `herz-aufbau`,
`erregungsleitung` und `kreislauf-schema` erscheinen auf dem iPhone und
fehlen auf dem Desktop.

Umgekehrt gilt dasselbe: Der Kopfverband hat eine SVG-Komponente, aber
keine `illustrationId` und keine Bilddatei. Er erscheint **nur** auf dem
Desktop.

Die 49 Bilddateien (5,0 MB) liegen ausschließlich unter
`ios/SanWissen/Resources/Images/`. Ein Präzedenzfall existiert schon:
für den Elektroden-Trainer wurden zwei Dateien nach `public/electrodes/`
kopiert, also dupliziert.

**Dazu kommt veralteter Auslieferungsstand.** Die erweiterte
BE-FAST-Fassung kam mit 709d443 am 18.09.2026, einen Tag nach dem
1.0.0-Release. Wer den 1.0.0-Installer nutzt, hat sie nicht. Das behebt
sich mit dem nächsten Desktop-Build von selbst, die Abbildungen nicht.

**Struktur:** Der Desktop hat zehn eigene Modul-Renderer von je rund 120
Zeilen, von denen gut die Hälfte identisch ist. iOS macht dasselbe mit
einer generischen Ansicht von 92 Zeilen.

## Der Umbau

Heute: TypeScript ist die Quelle, ein Skript erzeugt daraus JSON für iOS.
Der Desktop liest die TypeScript-Dateien direkt.

Künftig: **JSON ist die Quelle**, beide Apps lesen sie. Der Exportschritt
entfällt, und mit ihm die Fehlerquelle „Export vergessen, iOS zeigt noch
den alten Stand".

Das Format steht bereits. `scripts/export-ios-content.mjs` erzeugt es seit
Monaten, es ist also erprobt und vollständig. Der Umbau dreht die Richtung
um, statt ein neues Format zu erfinden.

Was aus dem Skript erhalten bleiben muss, ist die **Prüfung**: es bricht
ab, wenn ein Verweis ins Leere zeigt, etwa wenn eine Cheat-Sheet-Karte auf
einen umbenannten Eintrag zeigt. Diese Prüfung wandert in einen eigenen
Schritt, der vor jedem Build und in der CI läuft. Ohne sie fällt ein
Tippfehler in einer ID erst in der laufenden App auf.

## Abbildungen

Vorgabe: Sie müssen in **allen** Versionen zu sehen sein.

1. `illustrationId` wird der einzige Weg, eine Abbildung zu verknüpfen.
   Der Desktop bekommt dafür eine Anzeige, die es dort bisher nicht gibt.
2. Die drei SVG-Komponenten werden zu Bilddateien, damit sie demselben
   Weg folgen. Für den Kopfverband, der bisher nur auf dem Desktop
   erscheint, muss eine Datei entstehen; die Vorlage ist die vorhandene
   SVG-Komponente.
3. Die Bilder brauchen **einen** Ort, aus dem beide Apps sich bedienen,
   statt der heutigen Kopiererei nach `public/electrodes/`. Zwei
   Möglichkeiten:
   - ein gemeinsamer Ordner (etwa `content/images/`), aus dem ein
     Build-Schritt in beide Apps kopiert
   - oder die Dateien bleiben, wo sie sind, und der Desktop-Build holt
     sie von dort

   Die erste Variante ist sauberer, weil dann kein Verzeichnis mehr
   bevorzugt ist. Sie kostet einen Build-Schritt.
4. Die Bildunterschrift steht heute doppelt: im Desktop fest im JSX
   („Stilisiertes Schema, kein Foto") und auf iOS in
   `IllustrationView.swift`. Sie gehört zum Inhalt und damit in die
   Daten.

## Offene Entscheidungen

- **JSON oder YAML als Quellformat.** JSON ist schon da und braucht kein
  Werkzeug. YAML liest sich besser und erlaubt Kommentare, was bei
  Quellenhinweisen hilft, braucht aber eine Abhängigkeit auf beiden
  Seiten. Vorschlag: bei JSON bleiben, weil der Aufwand sonst ohne echten
  Gewinn steigt.
- **Wohin mit den Inhalten im Repo.** Heute `src/modules/<name>/data.ts`,
  also unter dem Desktop-Quellcode. Ein eigener Ordner auf oberster Ebene
  (`content/`) macht deutlicher, dass er zu keiner App gehört.
- **Was passiert mit `minLevel`.** Das Feld hängt an jedem Inhalt, hat
  aber laut README seit 0.17.0 keine Wirkung mehr. Beim Umbau wäre der
  Moment, es entweder zu nutzen oder zu entfernen.

## Reihenfolge

1. Inhalte nach `content/` verschieben, als JSON, ohne sonstige Änderung.
   Beide Apps lesen danach von dort, das Exportskript entfällt, die
   Prüfung bleibt als eigener Schritt.
2. Abbildungen vereinheitlichen: `illustrationId` überall, die drei SVG
   zu Bilddateien, ein gemeinsamer Bildordner, Bildunterschrift in die
   Daten.
3. Erst danach die zehn Desktop-Renderer durch einen generischen
   ersetzen, nach dem Vorbild von `TopicModuleView.swift`.

Schritt 1 und 2 lösen das eigentliche Problem. Schritt 3 ist Aufräumen
und kann warten.

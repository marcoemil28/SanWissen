# Inhalte: eine Quelle für alle Apps

Plan für den Umbau der Inhalts-Pipeline. Stand: 20.09.2026, am Code zu
diesem Zeitpunkt nachgemessen.

## Ziel

Inhalte sollen sich ändern lassen, ohne dass jemand TypeScript anfasst,
und beide Apps sollen danach dasselbe zeigen. Das Nachladen über das Netz
ist bewusst **nicht** Teil dieses Plans; die Apps bleiben komplett
offline, Änderungen brauchen weiter einen Release.

## Befund (Stand vor dem Umbau)

Die verbreitete Annahme, Desktop und iOS zeigten dasselbe, stimmte nicht.
Der Text war zwar dieselbe Quelle, aber das ist nicht das, was jemand in
der App sieht.

**Abbildungen klafften weit auseinander:**

| | Desktop | iOS |
|---|---|---|
| `illustrationId` (Bilddateien) | 0 von 47 gerendert | 47 |
| `illustration` (React-SVG) | 3 | 0 |

47 Abbildungen waren im Inhalt verknüpft, der Desktop rendert `illustrationId`
an keiner Stelle. Er kannte nur drei fest eingebaute SVG-Komponenten.
Beim Herz-Kreislauf-System hiess das konkret: `herz-aufbau`,
`erregungsleitung` und `kreislauf-schema` erschienen auf dem iPhone und
fehlten auf dem Desktop.

Umgekehrt galt dasselbe: Der Kopfverband hatte eine SVG-Komponente, aber
keine `illustrationId` und keine Bilddatei. Er erschien **nur** auf dem
Desktop.

Die 49 Bilddateien (5,0 MB) lagen ausschliesslich unter
`ios/SanWissen/Resources/Images/`. Ein Präzedenzfall existierte schon:
für den Elektroden-Trainer waren zwei Dateien nach `public/electrodes/`
kopiert, also dupliziert.

**Dazu kam veralteter Auslieferungsstand.** Die erweiterte
BE-FAST-Fassung kam mit 709d443 am 18.09.2026, einen Tag nach dem
1.0.0-Release. Wer den 1.0.0-Installer nutzte, hatte sie nicht. Das behebt
sich mit dem nächsten Desktop-Build von selbst, die Abbildungen nicht.

**Struktur:** Der Desktop hat zehn eigene Modul-Renderer von je rund 120
Zeilen, von denen gut die Hälfte identisch ist. iOS macht dasselbe mit
einer generischen Ansicht von 92 Zeilen. Das bleibt bis Schritt 5.

## Der Umbau

Heute: TypeScript ist die Quelle, ein Skript erzeugt daraus JSON für iOS.
Der Desktop liest die TypeScript-Dateien direkt.

Künftig: **JSON ist die Quelle**, beide Apps lesen sie. Der Exportschritt
entfällt, und mit ihm die Fehlerquelle „Export vergessen, iOS zeigt noch
den alten Stand".

Das Format stand bereits. `scripts/export-ios-content.mjs` hatte es über
Monate erzeugt, es war also erprobt und vollständig. Der Umbau hat nur die
Richtung umgedreht, statt ein neues Format zu erfinden.

Erhalten geblieben ist die **Prüfung**: sie bricht ab, wenn ein Verweis ins
Leere zeigt, etwa wenn eine Cheat-Sheet-Karte auf einen umbenannten Eintrag
zeigt. Sie steht jetzt als `scripts/check-content.mjs` für sich und läuft
bei `npm run build`. Ohne sie fiele ein Tippfehler in einer ID erst in der
laufenden App auf.

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

## Entschieden

- **Ort:** Die Inhalte ziehen nach `content/` auf oberster Ebene. Damit
  ist sichtbar, dass sie zu keiner der beiden Apps gehören.
- **`minLevel` fliegt raus.** Das Feld hängt an 806 Stellen und hat seit
  0.17.0 keine Wirkung mehr. Das spart 7 Prozent Dateigröße und, viel
  wichtiger, 806 Zeilen Rauschen in Dateien, die jemand von Hand
  bearbeiten soll.
- **Abbildungen richten sich nach der iOS-Fassung.** Die drei
  SVG-Komponenten des Desktops entfallen ersatzlos, auch der Kopfverband,
  der dadurch verschwindet. `illustrationId` wird der einzige Weg.
- **Format: JSON.** Begründung unten.

## Warum JSON und nicht YAML

Der Zweck des Umbaus ist, dass auch Nichtentwickler Inhalte ändern
können. Genau dafür ist YAML die schlechtere Wahl, obwohl es sich besser
liest.

**Was für YAML spricht:** weniger Satzzeichen, Kommentare sind erlaubt,
und lange Texte lassen sich als Block schreiben statt als eine endlose
Zeile.

**Was dagegen spricht, gemessen am tatsächlichen Inhalt:**

- Die iOS-App hat heute **keine einzige** Fremd-Abhängigkeit. Swift
  bringt keinen YAML-Leser mit, es käme also die erste dazu, allein für
  das Dateiformat.
- **331 Zeichenketten (9 Prozent) müssten gequotet werden**, weil sie
  einen Doppelpunkt enthalten. Eure Texte sind voll davon:
  „Dokumentation: Einsatzprotokoll & DIVI-Protokoll", „Zumutbarkeit hat
  Grenzen: die eigene Sicherheit geht vor". Wer das Quoting vergisst,
  bekommt im besten Fall einen Fehler.
- **YAML rät Typen.** `Ja` wird zu einem Wahrheitswert, `3.5` zu einer
  Zahl, `01` zu einer Eins. In einer App mit Dosierungen und Grenzwerten
  ist das kein theoretisches Risiko.
- Einrückung trägt Bedeutung. Ein Leerzeichen zu viel verschiebt einen
  Eintrag in den falschen Abschnitt.

**Der Lesbarkeitsvorteil ist kleiner als gedacht.** Der Median einer
Zeichenkette liegt bei 23 Zeichen, nur 16 Prozent sind länger als 80 und
3 Prozent länger als 200. Der Inhalt besteht überwiegend aus kurzen
Stichpunkten, nicht aus Fließtext.

**Kommentare fehlen in JSON**, aber dafür gibt es bereits `sourceNote`
an jedem Eintrag. Begründungen gehören ohnehin dorthin und nicht in einen
Kommentar, den keine App anzeigt.

## Das eigentliche Werkzeug: ein JSON Schema

Die Formatwahl löst das Bearbeitungsproblem nur halb. Mehr bringt ein
**JSON Schema** neben den Inhalten. VS Code und die meisten Editoren
werten es ohne Zutun aus und liefern damit:

- Vervollständigung der Feldnamen beim Tippen
- eine Fehlermarkierung, sobald ein Pflichtfeld fehlt, etwa `sourceNote`
- eine Auswahlliste für feste Werte wie die Kategorien eines Moduls
- eine Warnung bei Tippfehlern in Feldnamen, statt dass das Feld still
  ignoriert wird

Das hilft jemandem ohne Entwicklerhintergrund deutlich mehr als die
Entscheidung zwischen zwei Klammerarten.

## Reihenfolge

1. ~~**Inhalte nach `content/` verschieben**~~ **erledigt** (1.1.0). Beide
   Apps lesen von dort, das Exportskript ist zu
   `scripts/check-content.mjs` geworden und läuft bei `npm run build`.
   Nebenbei entfallen: die generierte `meta.json` (iOS liest die Version
   jetzt aus dem Bundle) sowie `medications.json` und `wirkung.ts`, die
   zu `content/medikamente.json` zusammengeführt sind.
2. ~~**`minLevel` entfernen**~~ **erledigt** (1.1.0). 806 Vorkommen in 13
   Inhaltsdateien, die Felder in 13 `types.ts`, die Swift-Modelle und
   `src/app/levels.ts` sind weg.
3. ~~**Abbildungen vereinheitlichen**~~ **erledigt** (1.1.0). Die Bilder
   liegen unter `content/images/`, die Bildunterschriften in
   `content/illustrations.json`, die drei SVG-Komponenten sind weg. Der
   Desktop zeigt jetzt dieselben Abbildungen wie iOS.
4. ~~**JSON Schema** neben die Inhalte legen~~ **erledigt** (1.1.0). Zwölf
   Schemas unter `content/schema/`, je Datei über `$schema` verknüpft.
   `npm run check-content` prüft dagegen, zusätzlich zu den Verweisen.
5. Erst danach die zehn Desktop-Renderer durch einen generischen
   ersetzen, nach dem Vorbild von `TopicModuleView.swift`.

Schritt 1 bis 3 lösen das eigentliche Problem. Schritt 4 macht das
Bearbeiten erst wirklich zugänglich. Schritt 5 ist Aufräumen und kann
warten.

Jeder Schritt ist für sich lauffähig und sollte einzeln committet werden.
Schritt 1 und 2 fassen sehr viele Dateien an; sie gehören nicht in
denselben Commit wie eine Verhaltensänderung, sonst ist der Diff nicht
mehr zu prüfen.

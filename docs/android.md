# SanWissen auf Android

Notiz zur Frage, was nötig wäre, um die App auch auf Android anzubieten.
Keine Arbeitsanweisung, sondern eine Einschätzung für später. Stand:
21.09.2026, am Code zu diesem Zeitpunkt nachgemessen.

## Kurzfassung

Die Datenschicht ist bereits fertig und plattformneutral. Die Arbeit
steckt in der Oberfläche: die Desktop-App hat kein mobiles Layout, und
der 3D-Atlas existiert nur als SwiftUI-Umsetzung. Welcher Weg richtig
ist, hängt daran, ob Android gleichwertig zu iOS sein soll.

## Was schon trägt

**Die Inhalte.** Seit 1.1.0 liegen sie als JSON unter `content/`, mit
Schemas daneben. Jeder neue Client liest sie ohne Anpassung. Vorher wäre
das eine eigene Baustelle gewesen, weil die Inhalte als TypeScript nur
von der Desktop-App zu verstehen waren.

**Der Atlas, zumindest als Daten.** Die Geometrie liegt als Rohpuffer
mit Byte-Offsets in Binärblöcken: Positionen float32, Normalen int16,
Indizes uint32. Das ist an keine Engine gebunden. In `atlas.json` stehen
bei den Blöcken sogar noch `url`-Felder wie `/models/body-0.bin` samt
gzip-Varianten; das Format stammt aus der Web-Vorlage. Eine
WebGL-Umsetzung wäre also kein Experiment, sondern der Rückweg zum
Original.

**Der Mobile-Einstiegspunkt in Tauri.** `#[cfg_attr(mobile,
tauri::mobile_entry_point)]` in `src-tauri/src/lib.rs` und das passende
`crate-type` in der `Cargo.toml` sind vorhanden.

**Touch im Elektroden-Trainer.** Er nutzt Pointer-Events, funktioniert
also bereits mit dem Finger.

## Die zwei Wege

### Tauri 2 Android: die React-App wiederverwenden

Der Ablauf steht im README unter „Mobile (Android)".

**Das mobile Layout steht seit 1.1.0** (siehe Reihenfolge unten). Bis
dahin gab es keine einzige `@media`-Regel, und die Seitenleiste war fest
auf 260 Pixel gesetzt.

Offen bleibt, dass der 3D-Atlas auf dem Desktop gar nicht existiert.
Android bekäme ihn auf diesem Weg also zunächst auch nicht. Soll Android
gleichwertig zu iOS sein, ist eine WebGL-Umsetzung damit Pflicht und
nicht mehr optional.

### Natives Android in Kotlin

Ein Spiegel der iOS-App. Umfang, gemessen am Swift-Code:

| Bereich | Zeilen | Aufwand |
|---|---|---|
| Atlas (SceneKit) | 2.165 | eigene Zeichenlogik, braucht Filament oder OpenGL ES |
| EKG (Kurven, Elektroden) | 1.585 | eigene Zeichenlogik |
| Content, Core, App, Themen | 1.529 | gewöhnliche Oberfläche |
| Werkzeuge (Rechner) | 735 | Logik liegt bereits getrennt in `ScoreLogic.swift` |

Rund 6.000 Zeilen, davon gut 3.700 mit eigener Zeichenlogik. Und es wäre
eine dritte Umsetzung zu pflegen.

## Vorschlag

**Erst responsive machen, dann Tauri-Android.** Android bekäme damit alle
17 Module, EKG-Trainer, Elektroden-Trainer, Rechner und Suche. Es fehlte
allein der 3D-Atlas, der auf dem Desktop ohnehin fehlt.

**Und wenn der Atlas dazu soll: in WebGL, nicht in Kotlin.** Das bedient
Windows, macOS und Android auf einmal und schließt nebenbei die Lücke,
die der Desktop heute hat. Eine Kotlin-Umsetzung hülfe nur Android.

Native Entwicklung lohnt sich erst, wenn Android denselben Anspruch
bekommen soll wie iOS, also Gesten, natives Scrolling und den Atlas in
voller Qualität.

## Offene Entscheidungen

- **Was Android sein soll.** Gleichwertig zu iOS oder „die Inhalte aufs
  Telefon"? Davon hängt der Weg ab, nicht umgekehrt.
- **Die 97 MB Atlas-Daten.** Auf iOS liegen sie im Bundle. Für Android
  bräuchte es ein App Bundle mit Asset Packs oder einen
  Nachlade-Mechanismus. Letzteres bricht mit „komplett offline", also
  dieselbe Frage wie beim verworfenen Nachladen der Inhalte (siehe
  [inhaltspipeline.md](inhaltspipeline.md)).
- **Signierung und CI.** `release.yml` baut nur macOS und Windows. Ein
  Android-Job braucht SDK, NDK und einen Keystore. Für eine erste
  Testversion reicht eine unsignierte APK zum Sideload.

## Reihenfolge, wenn es losgeht

1. ~~`src/App.css` und die App-Hülle responsive machen~~ **erledigt**
   (1.1.0). Unter 900 Pixel wird die Seitenleiste zur Schublade, die
   zweispaltigen Modulansichten stapeln sich, und die Abbildung des
   Elektroden-Trainers skaliert mit. Alle 17 Module laufen bei 375 Pixeln
   ohne waagerechten Überlauf.
2. `npm run tauri android init` und ein Debug-Build auf einem Gerät.
3. Erst danach entscheiden, ob der Atlas in WebGL dazukommt.

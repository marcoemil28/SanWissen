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

## Werkzeugkette einrichten

Am 21.09.2026 eingerichtet und bis zur fertigen Debug-APK durchgezogen.
Vorhanden waren Android Studio, `build-tools 36.0.0`, die Platform-Tools
und der Emulator. Ergänzt wurden:

- **Die Rust-Zielarchitekturen.** `rustup target add aarch64-linux-android
  armv7-linux-androideabi i686-linux-android x86_64-linux-android`.
- **Die Command-line Tools**, entpackt nach
  `~/Library/Android/sdk/cmdline-tools/latest`. Wichtig: das Paket gibt es
  für macOS in zwei Fassungen, `mac_x86_64` und `mac_arm64`. Seit Fassung
  23 steckt darin ein natives `android`-Binary; die x86-Variante scheitert
  auf Apple Silicon ohne Rosetta an „Bad CPU type in executable".
- **Das NDK**, `ndk;27.3.13750724`. Bewusst nicht die neueste Reihe r30,
  sondern die letzte r27, weil sie am breitesten erprobt ist.
- **Die Plattform `android-36`**, weil das erzeugte Gradle-Projekt
  `compileSdk = 36` setzt. Installiert war nur `android-37.0`.

Gesetzt werden müssen `ANDROID_HOME` auf `~/Library/Android/sdk` und
`NDK_HOME` auf den NDK-Ordner darunter. Ohne die Command-line Tools bricht
`tauri android init` mit „failed to ensure Android environment" ab, weil
Tauri sie im nicht-interaktiven Lauf nicht nachinstallieren kann.

### Das JDK ist nicht beliebig

Der Wrapper des erzeugten Projekts zieht Gradle 8.14.3, und das verträgt
kein Java 25. Der Build bricht ab mit „Unsupported class file major
version 69". Betroffen sind beide auf dem Rechner vorhandenen 25er, das
Oracle-JDK und die mit Android Studio gelieferte JBR.

`JAVA_HOME` muss deshalb auf das JDK 21 zeigen:

```
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
```

### Wo die Inhalte landen

Dafür war nichts zu tun, und zwar an einer Stelle, die man nicht erwartet:
die Abbildungen liegen **nicht** als Dateien in der APK. Tauri bettet das
gesamte Frontend in die native Bibliothek ein. Die 49 Abbildungen aus
`content/images/` stecken also in `libtauri_app_lib.so`, nachgeprüft über
die Dateinamen im Binärcode. Kein Netz nötig.

Die Debug-APK ist entsprechend 134 MB groß, fast alles davon die
unoptimierte Bibliothek mit Debug-Symbolen. Ein Release-Build fällt
deutlich kleiner aus.

## Reihenfolge, wenn es losgeht

1. ~~`src/App.css` und die App-Hülle responsive machen~~ **erledigt**
   (1.1.0). Unter 900 Pixel wird die Seitenleiste zur Schublade, die
   zweispaltigen Modulansichten stapeln sich, und die Abbildung des
   Elektroden-Trainers skaliert mit. Alle 17 Module laufen bei 375 Pixeln
   ohne waagerechten Überlauf.
2. ~~`npm run tauri android init` und ein Debug-Build~~ **erledigt**.
   Das Gradle-Projekt liegt unter `src-tauri/gen/android`, die Debug-APK
   baut durch (`tauri android build --debug --target aarch64`). Offen ist
   nur noch der Lauf auf einem echten Gerät oder im Emulator, wofür noch
   kein System-Image installiert ist.
3. Erst danach entscheiden, ob der Atlas in WebGL dazukommt.

## Was beim ersten Lauf auffiel

Drei Dinge waren am Schreibtisch unsichtbar und sind behoben: der Inhalt
lag unter den Systemleisten, die feste Menütaste verdeckte beim Scrollen
Text, und über dem Körperbild des Elektroden-Trainers ließ sich nicht
scrollen. Einzelheiten im Changelog zu 1.1.0.

Offen geblieben ist eines:

- **Der Elektroden-Trainer ist am Telefon umständlich.** Im Übungsmodus
  liegen die Chips in der Ablage und die Zielstellen am Körper rund 1.900
  Bildpunkte auseinander, weil zwischen Bild und Ablage ein langer
  Beschreibungstext steht. Auf einem Pixel 7 passt beides nur in einem
  schmalen Scrollfenster gleichzeitig ins Bild, und für die Schultern gar
  nicht. Das Ziehen selbst funktioniert, nachgeprüft mit echten
  Berührungen: Treffer und Fehlversuch werden beide erkannt. Aber die
  Anordnung müsste für schmale Bildschirme anders sein, etwa die Ablage
  als feste Leiste am unteren Rand. Auf iOS stellt sich die Frage nicht,
  dort ist der Trainer eigens gebaut.
- **Der Emulator rendert ohne `-gpu host` in Software.** Beim ersten Lauf
  des 3D-Atlas kamen 2 Bilder pro Sekunde heraus. Die Ursache war nicht
  die App: `WEBGL_debug_renderer_info` meldete
  „SwiftShader", also einen reinen Software-Rasterisierer ohne
  Grafikkarte. Mit `emulator -avd <name> -gpu host` meldet dieselbe
  Messung „Apple M4 Pro" und 60 Bilder pro Sekunde. Wer die Leistung von
  3D im Emulator misst, muss das prüfen, sonst misst er nichts.
- **`env(safe-area-inset-bottom)` meldet null.** Auf dem Pixel-7-Emulator
  unter Android 16 gibt die WebView oben 52 Pixel zurück, unten aber
  null, obwohl die Gestenleiste dort liegt. Sie überlagert die Seite und
  zählt der WebView nicht als unsicherer Bereich. Wer sich nach unten auf
  `env()` verlässt, legt seine Bedienelemente unter die Gestenleiste. Im
  Stylesheet steht deshalb ein Mindestabstand über `max()`. Nachgemessen
  über die Chrome-Entwicklerwerkzeuge an der laufenden App:
  `adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>`,
  dann `http://localhost:9222/json`. Debug-Builds von Tauri erlauben das
  von sich aus.
- ~~**`INTERNET`-Berechtigung.**~~ **erledigt.** Die Vorlage von Tauri
  fordert sie an, gebraucht wird sie nicht: das Frontend kommt aus der
  App selbst, nicht über das Netz. Gestrichen und auf dem Gerät
  nachgeprüft, Module, Abbildungen und der 3D-Atlas laufen unverändert.
  Damit steht in der Berechtigungsliste nichts mehr, was der Zusage
  „komplett offline" widerspricht.
- **Namensreste aus der Vorlage.** Das Gradle-Thema heißt
  `Theme.tauri_app`, weil das Rust-Paket in `Cargo.toml` noch
  `tauri-app` heißt, mit `description = "A Tauri App"` und
  `authors = ["you"]`. Kosmetik, aber sie steht im fertigen Paket.

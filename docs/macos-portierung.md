# Die SwiftUI-App auf dem Mac

Notiz zur Frage, ob sich dieselbe Codebasis für iPhone, iPad **und** Mac
nutzen lässt. Keine Arbeitsanweisung, sondern eine Einschätzung für
später. Stand: 20.09.2026, geprüft am Code zu diesem Zeitpunkt.

## Kurzfassung

Das iPad ist bereits abgedeckt, der Mac wäre mit überschaubarem Aufwand
machbar. Die technische Frage ist kleiner als die strategische: für macOS
gibt es die Tauri-App schon.

## Ausgangslage

`ios/SanWissen/App/RootView.swift` schaltet über die
`horizontalSizeClass` zwischen zwei Layouts um:

- `CompactRootView` für das iPhone, eine `TabView` mit vier Reitern
- `RegularRootView` für das iPad, eine `NavigationSplitView` mit
  Seitenleiste und Detailspalte

Der iPad-Pfad ist genau das Layout, das eine Mac-App haben will. Eine
Portierung wäre deshalb kein Layout-Problem, sondern nur ein Problem
plattformspezifischer APIs.

`TARGETED_DEVICE_FAMILY` steht bereits auf `"1,2"` (iPhone und iPad),
`SUPPORTED_PLATFORMS` auf `"iphoneos iphonesimulator"`.

## Was portiert werden müsste

Die UIKit-Abhängigkeit ist klein und sitzt an drei Stellen:

| Stelle | Umfang | Aufwand |
|---|---|---|
| `Features/Atlas/AtlasSceneView.swift:308` | `UIViewRepresentable` und drei Gesture Recognizer | größter Brocken, ca. 70 Zeilen |
| `Features/Topics/IllustrationView.swift:128` | `UIImage` an 6 Stellen | `typealias` und ein `Image(nsImage:)` |
| `Features/Atlas/AtlasScene.swift:115` | `UIColor` an 3 Stellen | `typealias`, SceneKit nimmt beide |

Dazu auf SwiftUI-Ebene:

- `navigationBarTitleDisplayMode` an 19 Stellen, auf macOS nicht
  vorhanden. Lässt sich mit einem eigenen Modifier erschlagen, der auf
  dem Mac nichts tut, statt 19 Mal `#if os(iOS)` zu schreiben.
- `horizontalSizeClass` an 2 Stellen. Auf dem Mac gäbe es immer den
  `RegularRootView`-Pfad.
- `keyboardType(.decimalPad)` an 1 Stelle, im Verdünnungsrechner.

Nicht betroffen sind Content-Schicht, Store, Theme, Router, der
EKG-Kurvengenerator, die Rechner und die Suche. Das ist reines SwiftUI
und Foundation und liefe unverändert.

## Drei Wege

**„Designed for iPad".** Ein Häkchen in App Store Connect, kein Code. Die
iPad-App läuft auf Apple-Silicon-Macs. Fühlt sich aber wie eine iPad-App
an, kein Menüband, keine Intel-Macs.

**Mac Catalyst.** Im Wesentlichen `SUPPORTS_MACCATALYST = YES`. UIKit
funktioniert weiter, damit entfallen alle drei Zeilen der Tabelle oben
und `navigationBarTitleDisplayMode` ebenfalls. Der billigste Weg zu
etwas, das sich wirklich verteilen lässt, und er deckt auch Intel-Macs
ab.

**Natives macOS** im selben Target. Hier fällt die Liste oben an. Bei den
Gesten wäre der Umbau auf `NSPanGestureRecognizer` und Verwandte der
falsche Weg, weil er die Plattform-Verzweigung verdoppelt. Besser gleich
auf SwiftUI-Gesten (`DragGesture`, `MagnifyGesture`,
`SpatialTapGesture`): die sind plattformneutral, und das
Deployment-Target 17.0 trägt sie. Damit verschwindet die Verzweigung im
Atlas ganz.

## Die strategische Frage

Für macOS gibt es die Tauri-App bereits. Eine SwiftUI-Mac-App würde sie
doppeln, und Windows bliebe trotzdem bei Tauri. Die Frage ist also
weniger, ob es geht, sondern was die Tauri-App künftig sein soll.

Die Inhalte wären davon nicht betroffen: sie liegen in `src/modules/` und
werden für iOS exportiert, das gilt für jede Zahl von Clients.

Ein Argument für den Mac über SwiftUI: der 3D-Anatomieatlas existiert nur
dort. Mit Maus und großem Bildschirm wäre er auf dem Desktop eher besser
als auf dem iPhone. Eine SwiftUI-Mac-App bekäme ihn geschenkt, die
Tauri-App müsste ihn von Grund auf in WebGL nachbauen.

## Empfehlung

1. Erst Catalyst einschalten und eine Stunde damit herumklicken. Das
   kostet fast nichts und beantwortet die eigentliche Frage: fühlt sich
   die Sidebar-Navigation auf dem Mac richtig an?
2. Nur wenn die Antwort ja ist, lohnt der native Umbau.
3. Die Atlas-Gesten auf SwiftUI umstellen, unabhängig vom Mac. Das
   vereinfacht den Code so oder so und nimmt einer späteren Portierung
   den größten Posten ab.

# SanWissen für iOS

Native SwiftUI-App mit denselben Inhalten wie die Desktop-App. Die Texte
liegen nicht doppelt vor: `scripts/export-ios-content.mjs` liest die
TypeScript-Module unter `src/modules/` und schreibt sie als JSON nach
`SanWissen/Resources/Content/`.

## Einrichten

Team-ID und Bundle-ID stehen bewusst nicht im Repository. Lege sie
einmalig lokal an:

```bash
cp ios/Signing.local.xcconfig.example ios/Signing.local.xcconfig
```

Danach in der Datei die eigene Team-ID eintragen. Sie steht in Xcode
unter *Settings → Accounts* oder im Apple Developer Portal unter
*Membership*. Die Datei ist in der `.gitignore` aufgeführt.

Ohne diese Datei baut das Projekt mit Platzhaltern
(`com.example.sanwissen`, keine Team-ID). Für den Simulator reicht das,
zum Signieren für ein Gerät, TestFlight oder den App Store nicht.

## Inhalte aktualisieren

Nach jeder Änderung an `src/modules/`:

```bash
node scripts/export-ios-content.mjs
```

Der Export bricht ab, wenn ein Verweis ins Leere zeigt — etwa wenn eine
Cheat-Sheet-Karte auf einen umbenannten Eintrag zeigt. Ohne diesen
Schritt zeigt die App weiter den alten Stand.

## Bauen

```bash
xcodebuild -project ios/SanWissen.xcodeproj -scheme SanWissen -configuration Debug build
```

Neue Swift-Dateien müssen nicht ins Projekt eingetragen werden: der
Ordner `SanWissen` ist eine synchronisierte Gruppe, Xcode nimmt alles
darin automatisch auf.

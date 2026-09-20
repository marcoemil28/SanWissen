# SanWissen für iOS

Native SwiftUI-App mit denselben Inhalten wie die Desktop-App. Die Texte
liegen nicht doppelt vor: beide lesen die JSON-Dateien aus `content/` im
Wurzelverzeichnis. Eine Build-Phase des Xcode-Projekts kopiert sie ins
App-Bundle.

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

Dateien unter `content/` bearbeiten. Beim nächsten Build kopiert die Phase
„Inhalte aus content/ kopieren" sie ins Bundle, es ist also nichts von Hand
anzustoßen.

Prüfen lässt sich der Bestand mit:

```bash
npm run check-content
```

Das meldet Verweise, die ins Leere zeigen, etwa wenn eine Cheat-Sheet-Karte
auf einen umbenannten Eintrag zeigt.

## Bauen

```bash
xcodebuild -project ios/SanWissen.xcodeproj -scheme SanWissen -configuration Debug build
```

Neue Swift-Dateien müssen nicht ins Projekt eingetragen werden: der
Ordner `SanWissen` ist eine synchronisierte Gruppe, Xcode nimmt alles
darin automatisch auf.

## Für TestFlight und den App Store bauen

Der Ablauf ist erprobt; die Signatur stimmt, wenn `Signing.local.xcconfig`
eingerichtet ist (siehe oben).

**1. Archiv erstellen**

```bash
xcodebuild -project ios/SanWissen.xcodeproj -scheme SanWissen \
  -configuration Release -destination 'generic/platform=iOS' \
  -archivePath build/SanWissen.xcarchive -allowProvisioningUpdates archive
```

**2. Für den App Store exportieren.** Dafür braucht es eine
`ExportOptions.plist` mit `method: app-store-connect`, `signingStyle:
automatic` und der eigenen `teamID`. Die Datei liegt bewusst nicht im
Repository, weil die Team-ID dort nicht hingehört:

```bash
xcodebuild -exportArchive -archivePath build/SanWissen.xcarchive \
  -exportPath build/export -exportOptionsPlist ExportOptions.plist \
  -allowProvisioningUpdates
```

Das Ergebnis muss mit einem Verteilungszertifikat signiert sein. Prüfen:

```bash
codesign -dv --verbose=2 build/export/Payload/SanWissen.app
```

Dort muss `Apple Distribution` stehen, nicht `Apple Development`.

**3. Hochladen.** Dafür wird ein App-Store-Connect-API-Schlüssel gebraucht
(App Store Connect → Users and Access → Integrations → Team Keys, Rolle
App Manager). Die heruntergeladene Datei gehört nach
`~/.appstoreconnect/private_keys/AuthKey_<KEYID>.p8`, sie darf nicht ins
Repository:

```bash
xcrun altool --validate-app -f build/export/SanWissen.ipa -t ios \
  --apiKey <KEYID> --apiIssuer <ISSUER-ID>

xcrun altool --upload-app -f build/export/SanWissen.ipa -t ios \
  --apiKey <KEYID> --apiIssuer <ISSUER-ID>
```

Anschließend verarbeitet Apple den Build, meist in fünf bis dreißig
Minuten. Den Status abfragen:

```bash
xcrun altool --list-apps --apiKey <KEYID> --apiIssuer <ISSUER-ID> --output-format json
```

**Zu beachten**

- Die Bundle-ID lässt sich nach dem ersten Upload nicht mehr ändern.
- Der App-Eintrag in App Store Connect muss vorher von Hand angelegt
  werden; über die API geht das nicht.
- Interne TestFlight-Tester brauchen im Team die Rolle Account Holder,
  Admin, App Manager, Developer oder Marketing. Die Rolle Kundensupport
  genügt nicht.
- Externe Tester brauchen nur eine E-Mail-Adresse, der erste Build für sie
  geht aber einmal durch Apples Beta-Prüfung.

# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.

Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
Versionierung angelehnt an [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

## [1.1.0] – 2026-09-20

### Zweite Plattform: native App für iPhone und iPad

Der Schwerpunkt seit 1.0.0 liegt auf der neuen iOS-App unter `ios/`. Sie
ist kein Tauri-Wrapper, sondern in SwiftUI geschrieben, teilt sich aber
die Inhalte mit der Desktop-App: beide lesen dieselben JSON-Dateien aus
`content/`. Texte leben damit genau an einer Stelle.

Einträge ohne Plattform-Vermerk betreffen beide Apps, weil sie die
gemeinsame Inhaltsquelle ändern.

### Hinzugefügt

- **iOS-App (iPhone und iPad)**: native SwiftUI-App mit denselben 17
  Modulen wie die Desktop-App, dazu globale Suche, Favoriten, Checklisten
  und Lernfortschritt. Auf dem iPhone eine TabView, auf dem iPad eine
  Seitenleiste mit Detailspalte, die der Sidebar der Desktop-App
  entspricht. Persistenz über `UserDefaults` statt `localStorage`, alles
  offline, ohne Account.
  - Eigenständig statt Tauri, weil EKG-Trainer und Elektroden-Trainer von
    echten Gesten und nativem Scrolling deutlich profitieren.
  - Team-ID und Bundle-ID stehen bewusst nicht im Repository, sondern in
    einer lokalen `ios/Signing.local.xcconfig` (siehe `ios/README.md`).
- **Gemeinsame Inhaltsquelle unter `content/`** samt
  `scripts/check-content.mjs`, das alle Verweise prüft und bei
  `npm run build` läuft. Siehe „Geändert" für den Weg dorthin.
- **Interaktiver 3D-Anatomieatlas (iOS)**, erreichbar über das Modul
  „Anatomie & Physiologie". Drehen, Zoomen, Antippen zum Untersuchen,
  Freistellen einzelner Systeme und stufenloses Auseinanderziehen bis zum
  vollständigen anatomischen Inventar. Die Geometrie liegt als Rohpuffer
  in Binärblöcken (Positionen float32, Normalen int16, Indizes uint32)
  und wird von SceneKit unverändert übernommen, die Dateien werden nur
  eingeblendet statt geladen.
  - **Männliches Modell** aus BodyParts3D: 2.234 Teile, 2,29 Mio.
    Dreiecke, vollständige Abdeckung.
  - **Weibliches Modell** mit Umschalter in der Kopfzeile: 902 Teile,
    1,89 Mio. Dreiecke. Da kein vollständiger, frei lizenzierter
    weiblicher Ganzkörperdatensatz existiert, ist es zusammengesetzt aus
    Organen, Gefäßen, Nerven, Fortpflanzungsorganen und Becken des Human
    Reference Atlas (united-female v1.5) sowie den übrigen Knochen und
    der Muskulatur aus BodyParts3D. Die Einpassung ist nachgerechnet, und
    dass Muskulatur und übrige Knochen männlich sind, steht in der
    Quellenangabe der App.
  - **Struktur-Quiz**: eine Struktur wird genannt und ist im Modell
    anzutippen. Gefragt wird nur nach Strukturen, die von der aktuellen
    Ansicht aus wirklich zu erreichen sind; die App tastet die Ansicht
    dafür mit einem Raster von Strahlen ab. Drehen ändert die Auswahl.
  - Beide Datensätze stehen unter CC Attribution 4.0 International, die
    Quellenangabe steht in der App unter dem Info-Symbol.
  - Die App wächst dadurch auf rund 109 MB.
- **EKG: Nahaufnahme eines PQRST-Komplexes (iOS)**: Umschalter unten
  rechts im Streifen. Das Raster bleibt quadratisch, die Eichung mit
  25 mm/s und 10 mm/mV gilt also weiter. Im Quiz ist der Umschalter
  abgeschaltet, weil sein Fehlen die Antwort sonst auf Kammerflimmern,
  Kammerflattern oder Asystole eingrenzen würde.
- **EKG: vollständige Lehrbuch-Beschriftung (iOS)**: P, Q, R, S und T je
  an ihrer Zacke, QRS als Klammer darüber, dazu PQ-Strecke, ST-Strecke,
  PQ-Intervall und QT-Intervall. Die Buchstaben sitzen an der
  tatsächlichen Kurvenhöhe, nicht auf einer festen Linie.
- **Quellenhinweis für alle 78 Einträge**: bisher ohne Beleg waren die
  sechs Rechner (GCS nach Teasdale und Jennett 1974, APGAR nach Apgar
  1953, Neuner-Regel nach Wallace 1951, NACA über die DIVI-Protokolle)
  und die neun Cheat-Sheet-Karten.
- **Notverband (Israeli Bandage)** als neuer Abschnitt der Verbandslehre,
  nach den DLRG-Teilnehmerunterlagen Sanitätsausbildung A, S. 59 f.
- **34 Abbildungen** aus den DLRG-Teilnehmerunterlagen A und B verknüpft;
  die Section-Typen von vier Modulen kannten das Feld dafür noch nicht.
- **Weg nach TestFlight und in den App Store** in `ios/README.md`
  festgehalten (Archivieren, Export mit Verteilungssignatur, Upload über
  `altool` mit App-Store-Connect-API-Schlüssel), weil der Ablauf mehrere
  Stolpersteine hat.

### Geändert

- **Inhalte liegen jetzt in `content/` und sind die Quelle, nicht mehr das
  Ergebnis eines Exports.** Bisher waren die TypeScript-Dateien unter
  `src/modules/` die Quelle, und `scripts/export-ios-content.mjs` erzeugte
  daraus die JSON-Dateien für iOS. Wer den Export vergaß, hatte Desktop und
  iOS auf unterschiedlichem Stand, ohne dass es auffiel.

  Jetzt lesen beide Apps dieselben Dateien: die Desktop-App über
  `src/app/content.ts`, die iOS-App aus dem App-Bundle, in das eine
  Build-Phase sie kopiert. Inhalte lassen sich damit ändern, ohne
  TypeScript anzufassen. Am Inhalt selbst hat sich nichts geändert; die
  Dateien sind byte-identisch zu den zuvor erzeugten, bis auf zwei bewusste
  Ergänzungen (Emoji-Icon je Modul für die Desktop-Sidebar, `contentStand`
  der Werkzeuge, das vorher nur in der TS-Datei stand).
  - `scripts/export-ios-content.mjs` ist zu `scripts/check-content.mjs`
    geworden. Es erzeugt nichts mehr, prüft aber weiter alle Verweise und
    läuft bei `npm run build`.
  - Die Dateien unter `src/modules/<name>/data.ts` halten nur noch
    Typisierung und Zugriff, statt mehrere hundert Zeilen Inhalt.
  - Die generierte `meta.json` entfällt. Sie enthielt nur Abgeleitetes; die
    iOS-App liest ihre Version jetzt aus dem Bundle, was auch das Problem
    löst, dass ein Versionssprung bisher einen Inhaltsexport brauchte.
  - `medications.json` und `wirkung.ts` sind zu `content/medikamente.json`
    zusammengeführt. Sie wurden ohnehin nur an einer Stelle kombiniert.
  - Der Plan dahinter steht in [docs/inhaltspipeline.md](docs/inhaltspipeline.md).
- **Die Suche ist ebenfalls zusammengefasst.** `searchIndex.ts` hatte für
  jedes Modul einen eigenen Block, fünfzehn an der Zahl, von denen sich zehn
  nur in Modul-ID und Feldnamen unterschieden. Die zehn Themenmodule laufen
  jetzt über eine Schleife; übrig bleiben die Quellen mit eigener Form. Die
  Datei schrumpft von 211 auf 82 Zeilen.
  - **Das Cheat-Sheet ist jetzt durchsuchbar.** Die iOS-Suche führt es seit
    jeher, die Desktop-Suche hatte es nie aufgenommen.
  - **Algorithmen erscheinen in der Suche jetzt unter ihrem vollen Namen**
    („Algorithmen (ABCDE, BLS/ALS)" statt „Algorithmen"). Modultitel und
    Icon kommen jetzt aus `content/modules.json`, wie es die iOS-Suche
    schon macht; damit laufen Suche und Seitenleiste nicht mehr
    auseinander.
  - Damit sind die zehn `data.ts` und `types.ts` der Themenmodule
    unbenutzt und entfallen, zusammen mit der Zwischenschicht in
    `content.ts`, die `items` nach `facts`/`steps` umbenannte. Der
    Desktop-Quellcode schrumpft dadurch um rund 570 Zeilen.
- **Die zehn Themenmodule teilen sich auf dem Desktop eine Ansicht.** Jedes
  hatte bisher einen eigenen Renderer von rund 120 Zeilen, von denen gut die
  Hälfte identisch war; die iOS-App kam für dieselben Module schon immer mit
  einer einzigen Ansicht aus. Neu ist `src/components/TopicModule.tsx` mit
  180 Zeilen, die zehn Modul-Dateien schrumpfen von zusammen 1.121 auf 213
  Zeilen.
  - Die Kategorie-Reihenfolge stand als Konstante in jedem Renderer und
    kommt jetzt aus `categoryOrder` der Inhaltsdatei. Beide stimmten
    überein, die Anzeige ändert sich also nicht.
  - Ob die Seitenzahl erscheint, richtet sich jetzt danach, ob der Eintrag
    eine hat, statt nach dem Modul. Betroffen sind dieselben zwei Module
    wie bisher.
  - Für den Nutzer ändert sich nichts.
- **Die Desktop-App hat jetzt ein mobiles Layout.** Bisher gab es keine
  einzige `@media`-Regel und die Seitenleiste stand fest auf 260 Pixel; auf
  einem Telefon blieb für Inhalte fast nichts. Unter 900 Pixel wird die
  Seitenleiste zu einer Schublade mit Menütaste, die zweispaltigen
  Modulansichten stapeln sich, Kopf- und Reiterzeilen brechen um, und die
  Abbildung des Elektroden-Trainers skaliert mit.
  - Geprüft bei 375 Pixeln: alle 17 Module ohne waagerechten Überlauf. Die
    Ursachen waren meist `min-width: auto` bei Raster- und Flex-Kindern,
    an dem sich lange Modulnamen aufzogen.
  - Das Platzieren der Elektroden bleibt korrekt, obwohl die Abbildung
    jetzt skaliert: die Umrechnung läuft über `getScreenCTM()` und
    berücksichtigt die tatsächliche Darstellungsgröße. Nachgemessen, die
    Abweichung an allen vier Zielen ist null.
  - Am Desktop ändert sich nichts.
  - Erster Schritt Richtung Android, siehe [docs/android.md](docs/android.md).
- **Android: das Gradle-Projekt steht, die Debug-APK baut durch.**
  `tauri android init` legt es unter `src-tauri/gen/android` an. Die
  Inhalte brauchten dafür keine Anpassung, weil Tauri das Frontend samt
  der 49 Abbildungen in die native Bibliothek einbettet statt als Dateien
  in die APK zu legen. Im Emulator gelaufen und durchgeklickt. Der
  3D-Atlas fehlt weiterhin, siehe [docs/android.md](docs/android.md).
  - **Der Inhalt lag unter den Systemleisten.** Ab Android 15 zeichnet
    eine App randlos. Ohne `viewport-fit=cover` und
    `env(safe-area-inset-*)` saß die Menütaste auf der Uhr und die
    Gestenleiste auf der letzten Zeile.
  - **Die Menütaste verdeckte beim Scrollen Text.** Sie steht fest am
    Bildschirm, der Inhalt lief darunter durch; aus „Erregungszustände"
    wurde „rregungszustände". Jetzt liegt ein undurchsichtiger Streifen
    dahinter.
  - **Über dem Körperbild des Elektroden-Trainers ließ sich nicht
    scrollen.** `touch-action: none` lag auf der ganzen Fläche, obwohl
    ausschließlich die Chips in der Ablage gezogen werden und die es
    selbst setzen. Am Telefon füllt das Bild fast den Bildschirm, ein
    Wisch darüber wurde verschluckt statt zu scrollen. Mit der Maus fällt
    das nie auf.
  - Das Platzieren der Elektroden wurde auf dem Gerät mit echten
    Berührungen nachgeprüft, Treffer und Fehlversuch werden erkannt.
  - `index.html` sagt jetzt `lang="de"` statt `lang="en"`.
- **Der 3D-Atlas läuft jetzt auch auf Windows, macOS und Android.** Bisher
  gab es ihn nur als SceneKit-Fassung auf iOS, und er war die größte
  Lücke zwischen den Plattformen. Die Neufassung nutzt WebGL über
  three.js und bietet dasselbe: Drehen, Zoomen, Antippen zum Untersuchen,
  Freistellen einzelner Systeme und stufenloses Auseinanderziehen bis zum
  vollständigen anatomischen Inventar.
  - **An den Daten war nichts umzurechnen.** Positionen als float32,
    Normalen als int16 und Indizes als uint32 gehen direkt als
    Buffer-Attribute durch. In `atlas.json` stehen sogar noch die
    ursprünglichen Web-URLs; das Format stammt aus einer Web-Vorlage,
    SceneKit war die Zweitverwertung.
  - **Ein Zeichenaufruf je Organsystem statt 2.234.** Auf iOS bekommt
    jedes Netz einen eigenen Knoten, was SceneKit wegsteckt. In WebGL
    wären das 2.234 Aufrufe pro Bild. Ein `BatchedMesh` je System fasst
    sie zusammen und bietet trotzdem Sichtbarkeit, Farbe und Matrix je
    Teil. Nachgemessen: 14 Aufrufe pro Bild.
  - **Suche nach Strukturen, Freistellen und Struktur-Quiz** sind
    ebenfalls übernommen. Das Quiz fragt nur nach dem, was von der
    aktuellen Ansicht aus wirklich zu treffen ist: ein Raster von
    Strahlen tastet das Bild ab, Drehen ändert damit die Auswahl der
    Fragen. Links und rechts werden unterschieden.
  - **Die Geometrie ist nach `content/atlas/` gezogen**, wie alle anderen
    Inhalte, und wird über ein Vite-Plugin ans Frontend ausgeliefert. Sie
    liegt damit in der App und braucht kein Netz.
  - **Die Organsysteme stehen jetzt in `content/atlas-systems.json`** statt
    fest im Swift-Code, und zwar auf Deutsch. Vorher hießen sie
    „Skeleton", „Sensory organs" und „Body surface", auch in der
    deutschen App. Die Teilenamen der Geometrie bleiben englisch, das
    sind 2.234 anatomische Bezeichnungen aus BodyParts3D.
  - Auf dem Android-Emulator gemessen: 59,5 MB Geometrie in 1,9 Sekunden
    geladen, der Atlas nach 2,3 Sekunden bedienbar, 60 Bilder pro Sekunde
    mit allen Systemen. **Auf einem echten Telefon ist das noch nicht
    geprüft**, der Emulator nutzt die Grafikkarte des Macs.
- **Die Oberfläche von PC und Android sieht jetzt aus wie die iOS-App.**
  Bisher war es eine eigene, blaugraue Gestaltung mit umrandeten Kästen,
  kleiner Schrift und einer Seitenleiste; die iOS-Fassung wirkte daneben
  aufgeräumter. Übernommen sind Farben, Schrift, Abstände, Aufbau und
  Navigation.
  - **Farben und Schrift.** Die semantischen Farben von iOS: schwarzer
    Grund statt Blaugrau, randlose Karten mit größerem Radius, Systemblau
    als Akzent. Grundschrift 17 Pixel wie die 17 Punkt auf iOS, und die
    Schriftfamilie ist die des jeweiligen Systems.
  - **Vier Darstellungen statt einer.** Automatisch, Hell, Dunkel und
    Hoher Kontrast, dieselben wie auf iOS. Die App war bisher fest dunkel
    mit einem Kontrast-Schalter; wer den an hatte, landet beim hohen
    Kontrast.
  - **Startseite nach `HomeView`**: großer Titel, fachlicher Hinweis als
    Karte, Favoriten, Fortschritt, Schnellzugriff, Module nach Thema und
    der Fahrplan zum Aufklappen.
  - **Einträge öffnen sich als eigene Seite.** Vorher standen Liste und
    Inhalt nebeneinander in einem Kasten. Jetzt zeigt das Modul erst die
    Liste, der Eintrag kommt mit Zurück-Schaltfläche, und jeder Abschnitt
    ist eine eigene Karte. Betrifft die zehn Themenmodule ebenso wie
    Werkzeuge, Medikamente, Checklisten und die Rhythmus-Bibliothek des
    EKG-Trainers.
  - Der rote Hinweiskasten ist dem gemeinsamen Baustein nach dem Vorbild
    von `DisclaimerBox` gewichen, in allen Modulen derselbe.
  - **Unten eine Reiterleiste statt der Schublade** auf schmalen
    Fenstern, mit Start, Module, Quiz und Suche wie in der TabView auf
    iOS. Dafür kamen zwei Seiten dazu, die es nur schmal braucht.
  - **Jede Ansicht beginnt oben.** Vorher behielt die Inhaltsfläche beim
    Wechsel die Scrollposition der vorherigen Seite, sodass eine gerade
    geöffnete Detailseite irgendwo in der Mitte anfing.
  - **Ein Klick auf das schon offene Modul führt zurück zu seiner Liste**,
    so wie der aktive Reiter auf iOS zur Wurzel zurückgeht. Vorher blieb
    die Detailseite stehen.
  - Geprüft bei 375 und 390 Pixeln: alle vier Reiter, alle 17 Module und
    116 Detailseiten ohne waagerechten Überlauf. Tiefe Verweise aus
    Favoriten und Fahrplan öffnen weiterhin direkt die Detailseite.
  - **Die Gestenleiste auf Android braucht einen eigenen Mindestabstand.**
    Die WebView meldet oben 52 Pixel sicheren Bereich, unten aber null,
    obwohl die Gestenleiste dort liegt. Wer sich auf `env()` verlässt,
    legt die Reiterleiste darunter.
- **Atlas auf dem iPad: Systemliste lag über dem Körper.** Ob die Liste
  neben der Szene steht oder über eine Taste als Blatt aufgeht, hing an der
  Größenklasse. Im iPad-Split-View ist die Detailspalte zwar „regular", aber
  oft nur gut 500 Punkt breit; die 232 Punkt breite Liste nahm davon fast
  die Hälfte und lag über dem Rumpf. Die Entscheidung richtet sich jetzt
  nach der gemessenen Breite. Auf breiten iPads steht die Liste weiter
  daneben, und das Modell rückt in den freien Streifen rechts davon.
  - Die Einpassung vermisst die Bedienfelder jetzt auf zwei Arten, als
    Kante und als Höhe, und nimmt den größeren Wert. Je nach Gerät fällt
    die eine oder andere Messung zu klein aus: auf dem iPhone läuft die
    Szene unter der Tab-Leiste hindurch, im iPad-Split-View liegt ihr
    Rechteck gegenüber den Bedienfeldern versetzt. Zu viel Rand kostet
    etwas Modellgröße, zu wenig schneidet die Füße ab.
- **Tests für die Rechner** (`ios/SanWissenTests/`). Die Rechenlogik steckte
  in den SwiftUI-Ansichten und war damit nicht prüfbar. Sie steht jetzt als
  reine Funktionen in `ScoreLogic.swift`, gegen die 17 Tests rechnen, die
  über parametrisierte Fälle rund 40 Eingaben abdecken. Geprüft werden vor
  allem die Grenzen: wo GCS von mittelschwer auf leicht springt, ab wann die
  Schmerzskala welches Medikament nennt, dass die Neuner-Regel in beiden
  Altersgruppen 100 Prozent ergibt, und die beiden Verdünnungsbeispiele der
  App.
  - Die Schwellen sind mit der Desktop-App abgeglichen; sie stimmen
    überein. Die Tests halten beide Seiten auf demselben Stand, denn diese
    Logik lässt sich nicht nach `content/` verschieben.
  - Ein Test hält ausdrücklich fest, dass APGAR erst ab 8 als „guter
    Zustand" gilt, während verbreitet 7 bis 10 genannt wird. So geschieht
    eine spätere Korrektur bewusst und nicht unbemerkt.
  - Der CI-Job baut die iOS-App nicht mehr nur, sondern führt die Tests aus.
- **CI-Workflow für Pull Requests** (`.github/workflows/ci.yml`). Bisher gab
  es nur den Release-Workflow, der ausschließlich auf Tags reagiert: ein
  Fehler fiel damit erst beim Bauen der Installer auf, also lange nach dem
  Merge. Drei Jobs laufen jetzt bei jedem PR und auf `main`:
  - **Inhalte & Frontend**: `check-content` (Schemas und Verweise) sowie
    `npm run build` mit Typprüfung
  - **iOS-App bauen**: für den Simulator, ohne Signierung, wie es ohne
    `Signing.local.xcconfig` ohnehin läuft
  - **Tauri-Backend prüfen**: `cargo check`, damit Rust-Fehler vor dem Tag
    auffallen statt beim Release
- **JSON Schemas für alle Inhaltsdateien** unter `content/schema/`, je Datei
  über `$schema` verknüpft. VS Code und die meisten Editoren werten das ohne
  Zutun aus und bieten Feldvervollständigung, eine Markierung bei fehlendem
  Pflichtfeld wie `sourceNote`, Auswahllisten für feste Werte und eine
  Warnung bei vertippten Feldnamen. Das war der eigentliche Zweck des
  Umbaus: Inhalte sollen sich ohne Entwicklerhintergrund pflegen lassen.
  - `npm run check-content` prüft dieselben Schemas, damit ein Fehler auch
    im Build auffällt und nicht nur im Editor sichtbar ist.
  - Dazu zwei Prüfungen, die ein Schema nicht ausdrücken kann: dass jede
    Kategorie in der `categoryOrder` ihrer Datei steht und dass zu jeder
    verknüpften Abbildung Datei und Bildunterschrift vorliegen.
- **Abbildungen vereinheitlicht: der Desktop zeigt jetzt alle 47.** Bisher
  waren im Inhalt 47 Abbildungen verknüpft, die der Desktop an keiner
  Stelle rendern konnte; er kannte nur drei fest eingebaute SVG-Zeichnungen.
  Beim Herz-Kreislauf-System fehlten ihm damit Herzaufbau,
  Erregungsleitungssystem und Kreislaufschema, die auf dem iPhone zu sehen
  waren. Umgekehrt erschien der Kopfverband nur auf dem Desktop, weil es
  dazu eine Zeichnung, aber kein Bild gab.
  - Die Bilder liegen jetzt unter `content/images/` und werden von beiden
    Apps genutzt. Die Kopie unter `public/electrodes/` entfällt.
  - Die Bildunterschriften standen in einem `switch` in
    `IllustrationView.swift` und damit nur auf iOS. Sie stehen jetzt in
    `content/illustrations.json` und gelten für beide Apps.
  - Die drei SVG-Komponenten sind entfernt. Der Kopfverband verliert damit
    seine Abbildung, weil es dazu kein Bild gibt.
  - `npm run check-content` meldet ab sofort, wenn zu einer verknüpften
    Abbildung die Bilddatei oder die Bildunterschrift fehlt. Genau dieser
    Fall war unbemerkt im Bestand.
- **`minLevel` und `QualificationLevel` entfernt.** Das Feld stammte aus
  der früheren Navigation nach Qualifikationsstufe (SanH/RS/NotSan), die in
  0.17.0 durch die Gruppierung nach Thema ersetzt wurde. Seither hing es an
  806 Stellen, ohne Anzeige, Gruppierung oder Suche zu beeinflussen. Kein
  einziger Zugriff darauf war im Code übrig, nur Deklarationen.
  - 806 Vorkommen in 13 Inhaltsdateien, die Felder in 13 `types.ts`, die
    vier Swift-Modelle und `src/app/levels.ts` sind weg.
  - Die Inhaltsdateien werden dadurch rund 16 KB kleiner, vor allem aber
    um 806 Zeilen Rauschen leichter, was beim Bearbeiten von Hand zählt.
- **Das Schema heißt jetzt durchgängig xABCDE statt cABCDE.** So wird es in
  der Ausbildung benannt, und das Glossar erklärte ohnehin schon das x,
  während es als cABCDE geführt war. Betroffen sind Titel, Überschriften,
  Cheat-Sheet, Glossar, Checkliste, Fahrplan und die Querverweise aus
  Anatomie und Traumatologie.
  - Die Quellenhinweise zitieren weiterhin die Abschnittstitel des
    SAA/BPR-Dokuments, das an dieser Stelle `<c>` schreibt. Sie sagen die
    Abweichung jetzt ausdrücklich an, wie es die Konvention für
    `sourceNote` verlangt. Nebenbei korrigiert: die Zitate lauteten bisher
    „cABCDE, Herangehensweise", das Dokument schreibt aber
    „<c>ABCDE – Herangehensweise".
- **Elektrodenlage am Rettungsdienst statt an Mason-Likar ausgerichtet**:
  Geklebt wird an Schultern und Leisten, damit die Flächen für die
  Defibrillations-Pads frei bleiben. Die in Klinik und Intensivmedizin
  übliche Mason-Likar-Position ist im Einleitungstext beschrieben und
  gegenüber der Rettungsdienst-Variante eingeordnet.
- **Inhalte gegen SAA und BPR 2025 nachgeschärft**: WASB ordnet jedem
  Buchstaben die Bewusstseinslage zu (Somnolenz, Sopor, Koma) statt alles
  unter B zu sammeln; SAMPLER um Schwangerschaft und die Leitfrage bei
  den Risikofaktoren ergänzt; OPQRST trennt unter Q zwischen
  Charakteristik und Schmerzqualität; beim Atemwegsmanagement fehlten die
  Einstiegskriterien vollständig (SpO₂ unter 90 %, Zyanose, Atemfrequenz
  unter 8 oder über 30, pathologische Thoraxexkursion) samt
  Erfolgskontrolle; SINNHAFT um die Erläuterungen der Handreichung
  erweitert.
- **Gedankenstriche als Satzzeichen aufgelöst**: 128 Textstellen im
  ersten Durchlauf, 19 weitere im zweiten, der auch `intro` der
  Elektrodensets, `clinicalNote` der EKG-Rhythmen, die
  Wirkungsbeschreibungen der Medikamente und mehrere Quellenhinweise
  erfasst. Kurze Anhängsel wurden zum Komma, vollständige Aussagen zum
  eigenen Satz. Titel, Überschriften und Roadmap-Label bleiben unberührt,
  weil der Strich dort einen Namen von seinem Zusatz trennt.
- **README**: der iOS-Abschnitt beschrieb den nie umgesetzten Tauri-Weg
  über `npm run tauri ios init`. Er erklärt jetzt die eigenständige
  SwiftUI-App mit Signierungsdatei, Inhaltsexport und Build; Android
  steht als eigener Abschnitt daneben. Der Warnhinweis oben sagte, die
  Inhalte seien gegen kein offizielles Curriculum geprüft, was nicht mehr
  zutrifft.

### Behoben

- **Elektrodenansicht der Desktop-App war unbrauchbar**: seit der
  Neuvermessung kam die `viewBox` aus den Daten (Monitoring 669 × 1200,
  12-Kanal 746 × 1000), `BodyOutline` und `ThoraxOutline` zeichneten aber
  weiter in ihrem alten Koordinatensystem von rund 400 × 750 bzw.
  500 × 500. Die Figur saß dadurch in der linken oberen Ecke, während die
  Elektrodenpunkte über die volle Fläche verteilt lagen; auf iOS war die
  Ansicht korrekt. Beide Ansichten zeigen jetzt dieselben Abbildungen wie
  die iOS-App, die beiden gezeichneten Umrisse entfallen.
- **Medikamente: zerrissene Dosierungszeilen** in
  `medications.json` wiederhergestellt (10 Stellen).
- **Atlas: zwei Fehler beim Auseinanderziehen (iOS)**. Das gesamte
  Inventar lag eine halbe Körperhöhe zu tief, weil die Rasterzellen um
  den Ursprung zentriert sind, die Netze aber unter dem verschobenen
  Körperknoten hängen. Und das Seitenverhältnis erreichte die Szene nie,
  weil die eingebettete Ansicht beim ersten Aufbau noch keine Größe hat;
  das Raster wurde dadurch quer statt hochkant.
- **Atlas: Beschriftung lag auf dem Modell (iOS).** Die Kameraeinpassung
  rechnete mit fest verdrahteten Anteilen (0,62 der Höhe, 0,11 Versatz),
  die die Höhe der Bedienfelder nur schätzten. Seit der Umschalter für das
  Geschlecht in der Kopfzeile sitzt, bricht die Quellenzeile dort auf drei
  Zeilen um, und die Schätzung stimmte nicht mehr: „Erwachsener Mensch ·
  männlich" lag auf den Unterschenkeln, die Füße waren abgeschnitten.
  Kopfzeile und Bedienfelder melden ihre Kanten jetzt über
  `PreferenceKey` in einem gemeinsamen Koordinatenraum, aus dem die freie
  Fläche berechnet wird. Der gemeinsame Raum ist nötig, weil die Szene die
  untere Safe Area ignoriert und unter der Tab-Leiste weiterläuft, die
  Bedienfelder aber darüber liegen; reine Höhen wären nicht vergleichbar.
  Damit stimmt die Einpassung auch im Quiz, auf dem iPad und bei großer
  Schrift, wo die Felder jeweils anders hoch sind.
- **Datum des Inhaltsstands wurde auf iOS roh angezeigt.** Dort stand
  „2026-09-20" statt „20.09.2026", weil das Gegenstück zu
  `src/app/formatDate.ts` fehlte. Betrifft die Themenmodule, die
  Medikamente und die Suche.
- **package-lock.json** an Name und Version aus `package.json`
  angeglichen.

## [1.0.0] – 2026-09-17

### Erste offizielle Testversion

Erster Release, der als Mac- und Windows-Installer über GitHub Releases
verteilt wird (gebaut via `.github/workflows/release.yml`). Inhaltlich
identisch zu 0.27.0 — der Versionssprung markiert den Milestone
"erste fertige App zum Testen weitergeben", kein Breaking Change.

Umfang zu diesem Zeitpunkt: 17 Module (EKG-Trainer, Algorithmen,
Medikamente, Anatomie, Werkzeuge & Scores, Traumatologie, Medikamente
vorbereiten & verabreichen, Sanitätsdienst, Internistische Notfälle,
Pädiatrie & Geburtshilfe, Psychiatrische Notfälle & Kommunikation,
Rettungstechnik & Gerätekunde, Rechtliche Grundlagen, Glossar,
Prüfungsvorbereitung/Quiz, Checklisten, Cheat-Sheet), globale Suche,
Favoriten, Hoher-Kontrast-Modus, themenbasierte Sidebar-Navigation.

## [0.27.0] – 2026-09-17

### Hinzugefügt

- **Quellenangabe/Stand pro Modul** (aus `docs/vorgaben_und_inhalte.txt`
  Abschnitt 3, „Content-Pipeline"): jedes Themenmodul (Algorithmen,
  Anatomie, Traumatologie, Medikamente, Medikamente vorbereiten &
  verabreichen, Sanitätsdienst, Internistische Notfälle, Pädiatrie &
  Geburtshilfe, Psychiatrische Notfälle, Rettungstechnik, Rechtliche
  Grundlagen) exportiert jetzt eine `CONTENT_STAND`-Konstante
  (ISO-Datum), die im Disclaimer-Banner als „Inhaltlicher Stand:
  TT.MM.JJJJ" angezeigt wird (`src/app/formatDate.ts`) — unabhängig vom
  Stand der jeweiligen Originalquelle (z. B. SAA/BPR-Dokument). Macht auf
  einen Blick erkennbar, was ggf. veraltet sein könnte.
  - Konvention in README dokumentiert: `CONTENT_STAND` beim Anlegen oder
    inhaltlichen Ändern eines Moduls aktualisieren.
  - Die eigentliche Content-Pipeline-Erweiterung (weitere Quell-PDFs
    unter `docs/`) bleibt offen, bis entsprechende Dokumente vorliegen —
    der Extraktionsworkflow dafür ist bereits in der README beschrieben.

## [0.26.0] – 2026-09-17

### Hinzugefügt

- **Cheat-Sheet-Ansicht** (aus `docs/vorgaben_und_inhalte.txt` Abschnitt 3,
  „Praxisnähe"): neues, fest angepinntes Modul mit 8 stark verkürzten,
  großformatigen Merkzetteln für den Einsatzfall — Reanimation
  Erwachsene, Reanimation Kinder, ABCDE-Schema, Anaphylaxie, MANV-
  Sichtung, Schlaganfall (FAST), Verbrennungen, Hypoglykämie. Jede Karte
  verlinkt per "Mehr Details →" zurück ins ausführliche Quellmodul.
  - Druckbar über einen 🖨️-Button (`window.print()`); eigenes
    `@media print`-Stylesheet blendet Sidebar/Buttons aus und stellt auf
    schwarz-auf-weiß um, unabhängig vom aktuell aktiven Hoher-Kontrast-
    Modus.

## [0.25.0] – 2026-09-17

### Hinzugefügt

- **Checklisten-Modus** (aus `docs/vorgaben_und_inhalte.txt` Abschnitt 3,
  „Praxisnähe"): neues, fest angepinntes Modul mit 5 abhakbaren
  Checklisten für den echten Dienst — Notfallrucksack-Check
  (Dienstbeginn), Reanimation Erwachsene — Ablauf (BLS), MANV —
  Sichtungsablauf, Notgeburt — Ablauf-Checkliste, Übergabe (SINNHAFT) —
  Checkliste. Alle Punkte sind aus den jeweiligen Themenmodulen abgeleitet
  (mit Verweis darauf), nicht neu erfunden.
  - Haken werden pro Checkliste in `localStorage` gespeichert
    (`src/modules/checklisten/state.ts`) und bleiben bis zum manuellen
    Zurücksetzen erhalten — nützlich auch während des Diensts, nicht nur
    zum Lernen.
  - Checklisten sind über die globale Suche erreichbar.

## [0.24.0] – 2026-09-17

### Hinzugefügt

- **Generalisierter Quiz-Modus** (aus `docs/vorgaben_und_inhalte.txt`
  Abschnitt 3/6, letzter Punkt der Priorisierung): neues, fest angepinntes
  Modul „Prüfungsvorbereitung (Quiz)" mit Multiple-Choice-Fragen über fast
  alle Themenmodule hinweg (Algorithmen, Anatomie, Traumatologie,
  Medikamente, Medikamente vorbereiten & verabreichen, Sanitätsdienst,
  Internistische Notfälle, Pädiatrie & Geburtshilfe, Psychiatrische
  Notfälle, Rettungstechnik, Rechtliche Grundlagen, Glossar).
  - Gewichtete Zufallsauswahl nach demselben Prinzip wie beim
    EKG-Quiz (`src/app/quiz/progress.ts`, angelehnt an
    `modules/ekg/progress.ts`) — Fragen mit wenig Übung/niedriger
    Trefferquote erscheinen häufiger.
  - Modul-Filter ("Alle Module" oder ein einzelnes), Sofort-Feedback mit
    Erklärung, "Zum Eintrag springen" verlinkt direkt zurück ins
    Quellmodul.
  - Startbestand von 45 kuratierten Fragen (`src/app/quiz/questions.ts`)
    — kein Anspruch auf vollständige Abdeckung jedes Eintrags, wachsender
    Fragenpool.
  - Das bestehende EKG-Quiz (visuelle Rhythmuserkennung) bleibt als
    eigenständiges Feature unverändert bestehen, da es sich konzeptionell
    unterscheidet (Kurvenerkennung statt Text-Multiple-Choice).
  - `LearningModule.component` akzeptiert jetzt optional
    `onNavigateModule` (`ModuleProps` in `registry.tsx`) für
    modulübergreifende Sprünge außerhalb der Startseite.

### Behoben

- Tippfehler in der Glossar-ID für „ROSC" (`'ros c'` statt `'rosc'`)
  korrigiert.

## [0.23.1] – 2026-09-17

### Behoben

- **Sidebar ließ sich nicht scrollen**: Die Sidebar hat eine feste Höhe
  (100vh), aber mit inzwischen 14 Modulen in 5 Kategorien plus Fußzeile
  (Kontrast-Umschalter) passte der Inhalt nicht mehr vollständig ins
  Fenster — ohne Scroll-Möglichkeit war alles unterhalb des sichtbaren
  Bereichs (u. a. der Kontrast-Umschalter) unerreichbar. Die Modul-Liste
  (`.app-nav`) scrollt jetzt eigenständig zwischen Suchfeld und Fußzeile,
  die beide fest sichtbar bleiben.

## [0.23.0] – 2026-09-17

### Hinzugefügt

- **Favoriten/Lesezeichen** (aus `docs/vorgaben_und_inhalte.txt` Abschnitt
  3, „Favoriten/Lesezeichen"): ☆-Stern-Button neben dem Titel in der
  Detailansicht der meisten Themenmodule (Algorithmen, Anatomie,
  Traumatologie, Medikamente, Sanitätsdienst, Internistische Notfälle,
  Pädiatrie & Geburtshilfe, Psychiatrische Notfälle & Kommunikation,
  Rettungstechnik & Gerätekunde, Rechtliche Grundlagen, EKG-Rhythmen) —
  markiert einen Eintrag zum schnellen Wiederfinden.
  - Neue Sektion „Deine Favoriten" auf der Startseite, direkt oberhalb des
    Fahrplans, mit Klick-Navigation zum jeweiligen Eintrag.
  - Persistiert in `localStorage` (`src/app/favorites.ts`), modulübergreifend
    synchronisiert über ein einfaches Pub/Sub (kein zusätzlicher React-
    Context nötig).
  - Bewusst nicht enthalten: Werkzeuge & Scores (Rechner, kein
    "Nachschlage-Eintrag") und Glossar (bereits als durchsuchbare
    Kurzliste konzipiert) sowie das Einzelthema
    "Medikamente vorbereiten & verabreichen" (redundant zum direkten
    Modul-Link auf der Startseite).

## [0.22.0] – 2026-09-17

### Hinzugefügt

- **Hoher-Kontrast-Modus** (aus `docs/vorgaben_und_inhalte.txt` Abschnitt 3,
  „Dark Mode / High-Contrast für schlechte Lichtverhältnisse im Einsatz"):
  Umschalter unten in der Sidebar. Die App ist standardmäßig bereits
  dunkel gestaltet — der neue Modus geht für schlechte Lichtverhältnisse
  (grelle Sonne, Blendung) einen Schritt weiter: reines Schwarz als
  Hintergrund, kräftigere Akzentfarben, dickere Rahmen und größere
  Grundschrift. Einstellung wird lokal gespeichert (`localStorage`) und
  bleibt über Neustarts erhalten.

## [0.21.0] – 2026-09-17

### Hinzugefügt

- **Neues Modul „Glossar & Abkürzungen"** (aus `docs/vorgaben_und_inhalte.txt`
  Abschnitt 3, „Tag-/Verlinkungssystem"), fest oben in der Sidebar
  angepinnt wie Werkzeuge & Scores: ca. 40 RS-typische Abkürzungen (SAA,
  BPR, GCS, NACA, MANV, SAMPLER, ZOABCDE, SINNHAFT, DIVI, PSNV, ROSC, u.
  v. m.) mit Bedeutung, teils mit kurzer Erklärung und Verweis auf das
  jeweilige Fachmodul. Direkt durchsuchbar per Eingabefeld im Modul selbst
  sowie über die globale Suche.

## [0.20.0] – 2026-09-17

### Hinzugefügt

- **Neues Modul „Rechtliche & organisatorische Grundlagen"** (aus
  `docs/vorgaben_und_inhalte.txt` Abschnitt 2), letztes offenes
  Themenmodul aus der Liste — erscheint in der Sidebar unter „Einsatz &
  Organisation": 5 Themen in 3 Kategorien —
  - Grundrechte & Pflichten: Garantenstellung & unterlassene Hilfeleistung,
    Schweigepflicht, Patientenverfügung/-wille & mutmaßlicher Wille
  - Delegation & Kompetenz: Delegation ärztlicher Maßnahmen — Abgrenzung
    RS vs. NotSan
  - Dokumentation: Einsatzprotokoll & DIVI-Protokoll
  - Allgemeines rechtliches Grundlagenwissen, keine SAA/BPR-Quelle und
    keine Rechtsberatung — bundeslandspezifische Abweichungen sind je
    Eintrag vermerkt.
- Fahrplan und Suchindex um die neuen Inhalte ergänzt.
- Damit sind alle Themenmodule aus `docs/vorgaben_und_inhalte.txt`
  Abschnitt 2 umgesetzt. Offen bleibt aus der Priorisierung (Abschnitt 6)
  noch der generalisierte Quiz-Modus sowie die cross-cutting Features aus
  Abschnitt 3 (Glossar, Favoriten/Notizen, Checklisten-Modus, Cheat-Sheet,
  Dark Mode/High-Contrast).

## [0.19.0] – 2026-09-17

### Hinzugefügt

- **Neues Modul „Rettungstechnik & Gerätekunde"** (aus
  `docs/vorgaben_und_inhalte.txt` Abschnitt 2), erscheint in der Sidebar
  unter „Diagnostik & Training": 6 Themen in 4 Kategorien —
  - Transport & Trageformen: Rautekgriff, Tragestuhl, Schaufeltrage,
    Vakuummatratze
  - Lagerungsarten: stabile Seitenlage, Schocklage, Oberkörperhochlagerung,
    Knierolle, jeweils mit Indikation
  - Atemwege & Beatmung: Sauerstoffgabe (Systeme/Flussraten), Absaugung &
    Atemwegshilfen (Guedel-/Wendl-Tubus), Beatmungsbeutel
  - Gerätekunde: Notfallrucksack-Inhalt & Vollständigkeitsprüfung
  - Allgemeines rettungsdienstliches Grundlagenwissen, keine SAA/BPR-Quelle.
- Fahrplan und Suchindex um die neuen Inhalte ergänzt.

## [0.18.0] – 2026-09-17

### Hinzugefügt

- **Neues Modul „Psychiatrische Notfälle & Kommunikation"** (aus
  `docs/vorgaben_und_inhalte.txt` Abschnitt 2), erscheint in der Sidebar
  unter „Krankheitsbilder & Algorithmen": 5 Themen in 4 Kategorien —
  - Psychiatrische Notfälle: Erregungszustände & Deeskalation, Suizidalität
  - Kommunikation: Gesprächsführung mit Patienten & Angehörigen
  - Sterben & Todesfeststellung: sichere/unsichere Todeszeichen,
    rechtlicher Rahmen der Todesfeststellung als RS
  - Großschadenslagen: Psychische Erste Hilfe (PSNV-Grundprinzipien)
  - Allgemeines rettungsdienstliches Grundlagenwissen, keine SAA/BPR-Quelle.
    Bundeslandspezifische rechtliche Rahmenbedingungen (Unterbringung,
    Todesfeststellung) sind je Eintrag vermerkt.
- Fahrplan und Suchindex um die neuen Inhalte ergänzt.

## [0.17.1] – 2026-09-17

### Hinzugefügt

- **Dosierungsbesonderheiten bei Kindern** als eigener Abschnitt im
  Pädiatrie-Modul ergänzt (Thema „Besonderheiten pädiatrischer Notfälle")
  — bewusst ohne konkrete Zahlenwerte (Verweis auf Medikamente-Modul/SAA-
  BPR), da eine gewichtsbasierte Kinderdosierung zu hochsensibel für eine
  auswendig gelernte Faustregel ist (analog zur bestehenden
  Dosisrechner-Entscheidung, siehe CHANGELOG 0.8.0). Ergänzt den bereits
  vorhandenen Verweis auf die altersabhängigen Vitalwerte im
  Anatomie-Modul.

## [0.17.0] – 2026-09-17

### Geändert

- **Sidebar-/Fahrplan-Gruppierung von Qualifikationsstufe auf Thema
  umgestellt**: Statt „Sanitätshelfer/Rettungssanitäter/Notfallsanitäter"
  gruppieren Sidebar und Startseiten-Fahrplan jetzt nach fünf
  Themenkategorien — **Grundlagenwissen**, **Krankheitsbilder &
  Algorithmen**, **Medikamente**, **Diagnostik & Training**, **Einsatz &
  Organisation** (neues `ModuleCategory`-Feld in `registry.tsx`, ersetzt
  `minLevel` auf Modulebene). Grund: drei Kompetenzstufen als
  Navigationsachse waren unnötig komplex, wenn Inhalte ohnehin für alle
  einsehbar sind — Gruppierung nach Thema ist einfacher zu überblicken.
  Die globale Suche zeigt entsprechend die Themenkategorie statt der
  Stufe an.
- `QualificationLevel` bleibt als internes `minLevel`-Datenfeld auf
  einzelnen Inhalten bestehen (aktuell ohne Anzeige-Auswirkung), wird aber
  nicht mehr für Navigation/Gruppierung verwendet.

### Hinzugefügt

- **Neues Modul „Pädiatrie & Geburtshilfe"** (aus
  `docs/vorgaben_und_inhalte.txt` Abschnitt 2), erscheint in der Sidebar
  unter „Krankheitsbilder & Algorithmen": 4 Themen in 2 Kategorien —
  - Pädiatrie: Besonderheiten pädiatrischer Notfälle (Anatomie/Physiologie,
    Kommunikation, Gewichtsschätzung, Verweis auf Kinderreanimation im
    Algorithmen-Modul)
  - Geburtshilfe: Normale Geburt, Notgeburt-Ablauf für den Sanitätsdienst,
    Erstversorgung Neugeborenes & APGAR-Score (Verweis auf den
    APGAR-Rechner im Werkzeuge-Modul)
  - Allgemeines rettungsdienstliches Grundlagenwissen, keine SAA/BPR-Quelle.
- Fahrplan und Suchindex um die neuen Inhalte ergänzt.

## [0.16.0] – 2026-09-17

### Hinzugefügt

- **Neues Modul „Internistische Notfälle"** (aus `docs/vorgaben_und_inhalte.txt`
  Abschnitt 2), erscheint in der Sidebar unter „Sanitätshelfer": 10 Themen
  in 5 Kategorien —
  - Herz & Kreislauf: Herzinfarkt (ACS), Lungenödem
  - Neurologisch: Schlaganfall (FAST-Test), Krampfanfall/Epilepsie
  - Stoffwechsel & Allergie: Diabetische Notfälle, Allergie/Anaphylaxie
  - Abdomen & Vergiftungen: Akutes Abdomen, Intoxikationen
    (Alkohol/Drogen)
  - Umweltbedingte Notfälle: Hitzenotfälle, Unterkühlung & Erfrierung
  - Allgemeines rettungsdienstliches Grundlagenwissen, keine SAA/BPR-Quelle.
    Ärztlich delegierte Maßnahmen (ASS/Nitro, Glucose i.v., Adrenalin,
    Naloxon) sind als solche markiert und verweisen auf das
    Medikamente-Modul.
- Fahrplan und Suchindex um die neuen Inhalte ergänzt.

## [0.15.1] – 2026-09-17

### Behoben

- **Sprechfunk-Ablauf im Sanitätsdienst-Modul korrigiert**: Reihenfolge war
  falsch angegeben (eigener Rufname zuerst) — korrekt ist erst die
  Gegenstelle, dann "von", dann der eigene Rufname (z. B. "Wachleitung von
  Sani 3"). Außerdem klargestellt, dass "kommen" nur die Übergabe an die
  Gegenstelle markiert und nicht bei jeder einzelnen Durchsage innerhalb
  eines laufenden Gesprächs wiederholt werden muss — "Ende" beendet den
  gesamten Sprechfunkverkehr.

## [0.15.0] – 2026-09-17

### Hinzugefügt

- **Neues Modul „Sanitätsdienst (Veranstaltungsdienst)"** (Priorisierungspunkt 5
  aus `docs/vorgaben_und_inhalte.txt`), erscheint in der Sidebar unter
  „Sanitätshelfer": 5 Themen in 3 Kategorien —
  - Einsatzorganisation: Sanitätswachdienst-Organisation (Wachaufbau,
    Materialdepot, Funkkonzept, Einsatzabschnitte), MANV & Sichtung
    (Ampelschema, Sichtungsalgorithmus angelehnt an START)
  - Kommunikation: Funkalphabet (DIN 5009/ICAO) & Funkdisziplin
  - Medizinische Besonderheiten: Typische Veranstaltungs-Verletzungsmuster
    (Kreislaufkollaps, Crowd-Crush-Verletzungen, Alkohol-/Hitzeintoxikation),
    Hygiene & Infektionsschutz (Basishygiene, PSA, Nadelstichverletzung)
  - Allgemeines Grundlagenwissen, keine SAA/BPR-Quelle — organisations- und
    bundeslandspezifische Abweichungen (Sichtungsschema, Funkkanäle,
    Hygieneplan) sind im jeweiligen Quellenhinweis vermerkt.
- Fahrplan und Suchindex um die neuen Inhalte ergänzt.

## [0.14.0] – 2026-09-17

### Entfernt

- **"Meine Qualifikation"-Selector** in der Sidebar (inkl. `LevelContext`)
  komplett entfernt — nicht benötigt.
- Damit einhergehend auch **"ab \<Stufe\>"-Badges und die
  Abblendung von Inhalten über der gewählten Stufe** (`LevelBadge`,
  `aboveLevelClass`, `isAboveSelected`) aus allen Modulen sowie dem
  Fahrplan auf der Startseite entfernt.
- Die Sidebar-Gruppierung der Module nach Einstiegsstufe (Sanitätshelfer/
  Rettungssanitäter/Notfallsanitäter) bleibt zur Orientierung bestehen —
  betroffen war nur die personalisierte Auswahl/Anzeige, nicht die
  strukturelle Einteilung.

## [0.13.0] – 2026-09-17

### Korrigiert

- **0.12.1 zurückgerollt**: Die dort eingeführten, permanent sichtbaren
  Stufen-Badges waren nach Rückmeldung unübersichtlich ("steht fast überall
  Rettungssanitäter") — `LevelBadge` zeigt Badges wieder nur an, wenn eine
  Qualifikationsstufe explizit im Filter gewählt ist (Ursprungsverhalten).
  Die zusätzlichen Badges in den Seitenlisten von Algorithmen, Anatomie,
  Traumatologie und Werkzeuge wurden ebenfalls entfernt.
- **Eigentliche Ursache der ursprünglichen Beschwerde behoben**: „Medikamente
  vorbereiten & sicher verabreichen" gehörte inhaltlich nicht in die
  SanH/Basis-lastige Kategorie „Medikamentengabe" des Algorithmen-Moduls.
  Der Eintrag ist jetzt ein **eigenständiges Modul** und erscheint als
  eigener Tab in der Sidebar unter „Rettungssanitäter" (statt versteckt
  als Unterpunkt in Algorithmen). Kategorie „Medikamentengabe" aus dem
  Algorithmen-Modul entfernt, da sie dadurch leer wurde. Fahrplan,
  Suchindex und der Querverweis im Verdünnungsrechner wurden entsprechend
  aktualisiert.

## [0.12.1] – 2026-09-17

### Behoben

- **Kritischer Bug im Stufen-Badge-System**: `LevelBadge` zeigte "ab
  Rettungssanitäter"/"ab Notfallsanitäter" nur an, wenn explizit eine
  Qualifikationsstufe im Filter unten links gewählt war. Im Standardzustand
  "Alle anzeigen" erschien **nirgendwo im gesamten App** ein Badge — dadurch
  sah z. B. "Medikamente vorbereiten & sicher verabreichen" (RS) optisch
  identisch aus wie SanH-Inhalte wie "ABCDE – Herangehensweise", ohne jede
  Kennzeichnung. Badges sind jetzt eine **permanente Einordnung**: sie
  erscheinen immer für Inhalte oberhalb der Basisstufe (SanH), unabhängig
  vom gewählten Filter. Die Abblendung (`above-level`) bleibt weiterhin
  filterabhängig.
- Badges werden jetzt zusätzlich direkt in den Seitenlisten der Module
  Algorithmen, Anatomie, Traumatologie und Werkzeuge angezeigt (vorher nur
  in der Detailansicht nach dem Reinklicken) — Stufe ist so auf einen
  Blick erkennbar, ohne jeden Eintrag einzeln öffnen zu müssen.

## [0.12.0] – 2026-09-17

### Hinzugefügt

- **Neuer Algorithmen-Eintrag „Medikamente vorbereiten & sicher verabreichen"**
  (Kategorie „Medikamentengabe", minLevel RS) direkt aus bisher ungenutzten
  SAA/BPR-Seiten 40–41: 6-R-Regel, Sicherheitsprinzipien (DIVI-ISO-Aufkleber,
  4-Augen-Prinzip, Doppelkontrolle, gesicherte Kommunikation),
  Standardvorgehen-Ablauf sowie die allgemeine Verdünnungsformel
  (C1×V1 = C2×V2, Pharmazie-Grundwissen, als solches gekennzeichnet) mit
  zwei aus dem PDF verifizierten Praxisbeispielen (Epinephrin, Naloxon).
- **Verdünnungsrechner** im Werkzeuge & Scores-Modul: berechnet aus
  Ausgangskonzentration, Zielkonzentration und Zielvolumen die benötigte
  Menge Ausgangslösung + Verdünnungsmittel. Mit zwei anklickbaren, gegen
  das SAA/BPR-PDF geprüften Beispielen (Epinephrin bei instabiler
  Bradykardie, Naloxon-Verdünnung). Bewusst als reine Rechenhilfe für eine
  bereits vorgegebene Zielkonzentration konzipiert, nicht als Dosis-
  Empfehlung.

### Geändert

- **Sidebar-Struktur**: "Werkzeuge & Scores" ist jetzt fest oben angepinnt
  (direkt unter "Startseite"), statt in der "Sanitätshelfer"-Gruppe zu
  stecken — die Werkzeuge sind stufenübergreifend gleich relevant.
  Registry-Modell um `pinned`-Flag erweitert.

## [0.11.0] – 2026-09-17

### Hinzugefügt

- **Stilisierte Verbands-Illustrationen** im Traumatologie-Modul (statt der
  ursprünglich angedachten interaktiven Übung — nach Rückmeldung reichen
  einfache Beispiel-Diagramme): Druckverband am Unterarm, Dreiecktuch als
  Armtragetuch, Dreiecktuch als Kopfverband
  (`modules/traumatologie/illustrations/`). Reine SVG-Schemazeichnungen im
  Look der bestehenden EKG-Elektroden-Diagramme, keine Fotos — dafür sofort
  umsetzbar und ohne Lizenzfragen. Jede Illustration ist klar als
  "Stilisiertes Schema, kein Foto" gekennzeichnet.
- `TraumaSection` kann jetzt optional eine `illustration`-Komponente tragen
  (neues Feld im Datenmodell), gerendert oberhalb der zugehörigen
  Stichpunkte.
- Falls die Diagramme nicht überzeugen: Umstieg auf einen Platzhalter-
  Mechanismus für eigene Fotos (z. B. aus Kursunterlagen) ist als nächster
  Schritt vorgemerkt, sobald gewünscht.

## [0.10.0] – 2026-09-17

### Hinzugefügt

- **Traumatologie & Verbandslehre-Modul** (neu, Priorität 4 aus
  `docs/vorgaben_und_inhalte.txt`) mit 7 Themen: Frakturlehre,
  Wundversorgung, Verbandslehre (Druckverband/Dreiecktuch/Schienung),
  Wirbelsäulentrauma & Immobilisation, Thorax-/Abdominaltrauma,
  Verbrennungen (mit Verweis auf die Neuner-Regel im Werkzeuge-Modul),
  Polytrauma & kritische Blutungen (Tourniquet). Allgemeines
  rettungsdienstliches Grundlagenwissen, keine SAA/BPR-Quelle.
- In den "Fahrplan" auf der Startseite eingehängt (SanH: Frakturlehre/
  Wundversorgung/Verbandslehre/Verbrennungen; RS: Wirbelsäulentrauma/
  Thorax-Abdominaltrauma/Polytrauma) und in die globale Suche
  aufgenommen.
- Der Verbandslehre-Eintrag markiert explizit, dass er sich als nächster
  Ausbaustand für einen interaktiven Schritt-für-Schritt-Übungsmodus
  eignet (im Stil des Elektroden-Trainers) — bewusst als Referenztext
  begonnen, da die interaktive Variante ein neues UI-Pattern braucht und
  nicht überstürzt werden sollte.

## [0.9.1] – 2026-09-17

### Hinzugefügt

- Versionsnummer wird jetzt in der Sidebar neben dem Logo angezeigt
  ("SanWissen v0.9.1") — automatisch aus `package.json` übernommen
  (`vite.config.ts` injiziert `__APP_VERSION__` als Build-Konstante),
  keine manuelle Pflege an zweiter Stelle nötig.

## [0.9.0] – 2026-09-17

### Hinzugefügt

- **Startseite** (`app/HomePage.tsx`, neuer Sidebar-Eintrag "Startseite",
  jetzt Standardansicht beim Öffnen der App):
  - Modul-Karten-Übersicht (Klick navigiert direkt ins Modul).
  - **"Dein Fahrplan"**: kuratierte Verlinkung in die relevanten Abschnitte
    aller Module, gruppiert nach Qualifikationsstufe (`app/roadmap.ts`) —
    setzt die "Fahrplan"-Idee aus `docs/vorgaben_und_inhalte.txt`
    Abschnitt 5 um. Kein eigenes Modul mit eigenen Inhalten, nur Links;
    Einträge über der gewählten Stufe werden wie überall sonst nur markiert,
    nicht versteckt.
  - EKG-Fortschritts-Kachel (Versuche/Trefferquote), sobald erste
    Quiz-Versuche vorliegen.
  - `NavigationContext`: `itemId` ist jetzt optional, damit auch reine
    Modul-Links (ohne konkreten Eintrag, z. B. "Elektroden legen üben")
    funktionieren.

## [0.8.0] – 2026-09-17

### Hinzugefügt

- **Werkzeuge & Scores-Modul** (neu) mit 5 interaktiven Rechnern, gemäß
  Priorität 3 aus `docs/vorgaben_und_inhalte.txt` (geringer Aufwand, hoher
  Nutzen):
  - **Glasgow Coma Scale (GCS)**: Klick-Rechner für Augenöffnung/verbale/
    motorische Reaktion, live Summe + Schweregrad. Ergänzt die bereits
    bestehende statische GCS-Tabelle im Algorithmen-Modul um eine
    interaktive Variante.
  - **Schmerzskala (NRS/VAS)**: 0–10-Regler mit Einordnung und einer
    **direkten Cross-Referenz zu den Medikamente-Schwellenwerten**
    (z. B. "ab NRS ≥ 6 laut SAA/BPR Morphin/Fentanyl/Nalbuphin indiziert").
  - **APGAR-Score**: 5 Kategorien à 0–2 Punkte für die Neugeborenen-Beurteilung.
  - **Neuner-Regel**: Verbrennungsflächen-Schätzung mit Umschalter
    Erwachsene/Kind (unterschiedliche Körperproportionen) plus
    Handflächenregel für kleine/verstreute Areale.
  - **NACA-Score**: Referenzliste der 8 Einsatzschwere-Stufen (0–VII).
  - Alle Tools sind in die globale Suche und die modulübergreifende
    Navigation eingebunden.
- Bewusst **nicht** umgesetzt: ein Medikamenten-Dosisrechner nach
  Körpergewicht (ebenfalls in der Roadmap-Doc genannt) — die Dosierungsfelder
  der 29 SAA/BPR-Medikamente sind uneinheitlich formatierter Freitext
  (Einzeldosis, gewichtsadaptiert, Alterstabellen gemischt), ein
  automatisches Auslesen daraus wäre bei einem hochsensiblen Thema wie
  Dosierung ein zu hohes Fehlerrisiko. Ein Dosisrechner sollte, falls
  gewünscht, als eigenes, sorgfältig geprüftes Feature pro Medikament
  angegangen werden statt generisch geparst.

## [0.7.0] – 2026-09-17

### Geändert (Breaking im Datenmodell)

- **Rettungshelfer (RH) und Rettungssanitäter (RS) zu einer Stufe zusammengelegt**
  (sehr ähnlicher Kompetenzumfang). `QualificationLevel` ist jetzt
  `'SanH' | 'RS' | 'NotSan'` statt vier Stufen. Alle bisherigen `RH`-Werte
  in den Datenquellen wurden auf `RS` migriert.
- **Suche konsolidiert**: die einzelnen Suchfelder in EKG-Trainer,
  Medikamente und Algorithmen sind entfernt. Stattdessen gibt es jetzt
  **eine globale Suche** oben in der Sidebar (`app/GlobalSearch.tsx`), die
  alle Module gleichzeitig durchsucht (`app/searchIndex.ts`) und beim Klick
  auf einen Treffer direkt zum richtigen Modul **und** Eintrag springt
  (`app/NavigationContext.tsx` — auch über EKG-Trainer-interne Tabs
  hinweg).

### Hinzugefügt

- **Anatomie & Physiologie-Modul** (vorher Platzhalter, jetzt verfügbar)
  mit 5 Themen: Herz-Kreislauf-System (inkl. Erregungsleitungssystem als
  direkte Grundlage fürs EKG-Modul), Atmungssystem, Skelett & Muskulatur,
  Nervensystem (inkl. vegetatives NS als Grundlage für Medikamentenwirkungen
  wie Adrenalin/Atropin), Vitalparameter-Normwerte nach Altersgruppe als
  Nachschlagetabelle. Allgemeines anatomisch-physiologisches Wissen, klar
  als solches gekennzeichnet (keine SAA/BPR-Quelle).
- Algorithmen-Eintrag "Beurteilung der Bewusstseinslage" um die vollständige
  GCS-Punktetabelle ergänzt (siehe 0.6.1).

## [0.6.1] – 2026-09-17

### Geändert

- Sidebar-Gruppenüberschriften zeigen nur noch den Stufennamen ("Sanitätshelfer"
  statt "Ab Sanitätshelfer").
- EKG-Trainer (Lernmodus) hat jetzt ein Suchfeld, konsistent mit
  Medikamente/Algorithmen.
- Algorithmen-Eintrag "Beurteilung der Bewusstseinslage (WASB & GCS)" um die
  vollständige GCS-Punktetabelle (Augenöffnung/verbale/motorische Reaktion,
  je mit Einzelpunktwerten) ergänzt — allgemein gebräuchliche Originalskala
  nach Teasdale & Jennett, nicht im SAA/BPR-PDF enthalten (per Quellenhinweis
  markiert).

## [0.6.0] – 2026-09-17

### Hinzugefügt

- **Algorithmen-Modul** (vorher Platzhalter, jetzt verfügbar) mit 10
  Einträgen aus den BPR-Abschnitten „Herangehensweise" und
  „Kreislaufstillstand": ABCDE-Herangehensweise, ABCDE-Instabilitäten,
  WASB & GCS, SAMPLER, OPQRST, Atemwegsmanagement, Patientenanmeldung
  (ZOABCDE), Übergabe (SINNHAFT), Reanimation Erwachsene (BLS→ALS),
  Reanimation Kinder (PLS).
  - Jeder einzelne Schritt trägt sein eigenes `minLevel` (nicht nur der
    ganze Eintrag) — z. B. zeigt "Reanimation Erwachsene" die
    Basismaßnahmen (Bewusstsein/Atmung prüfen, HDM 30:2, AED) ohne Badge
    für alle Stufen, während EGA/Zugang/Medikamente mit "ab
    Notfallsanitäter" markiert sind. Das setzt das Stufen-Datenmodell aus
    0.5.0 direkt im Detail um.
  - SINNHAFT-Inhalt wurde aus einer im PDF eingebetteten Grafik (keine
    Textebene) durch Rendern der Seite und visuelles Auslesen gewonnen.
  - Basismaßnahmen-Anteile der Reanimation (Laienreanimation, nicht Teil
    der NotSan-fokussierten SAA/BPR-Quelle) sind als allgemeines BLS-Wissen
    ergänzt und per `sourceNote` von den PDF-Inhalten abgegrenzt.
- **Sidebar nach Qualifikationsstufe gruppiert**: Module erscheinen jetzt
  unter Abschnitts-Überschriften ("Ab Sanitätshelfer", "Ab Rettungshelfer" …)
  nach ihrer niedrigsten Einstiegsstufe, damit die Navigation mit
  wachsender Modulzahl übersichtlich bleibt.

## [0.5.0] – 2026-09-17

### Hinzugefügt

- **Qualifikationsstufen-Modell** (SanH/RH/RS/NotSan) als Cross-cutting-
  Metadatum auf bestehenden Inhalten, gemäß `docs/vorgaben_und_inhalte.txt`
  Abschnitt 5/6 (Priorität 1):
  - `app/levels.ts` (Typ, Reihenfolge, Vergleichslogik),
    `app/LevelContext.tsx` (global, lokal persistiert unter
    `sanwissen:selectedLevel`).
  - Neuer Stufen-Auswahl in der Sidebar ("Meine Qualifikation" /
    "Alle anzeigen").
  - `LevelBadge`-Komponente + `above-level`-Abblendung
    (`components/LevelBadge.tsx`): Inhalte über der gewählten Stufe werden
    **nicht versteckt**, nur mit Badge ("ab NotSan" etc.) markiert und
    abgeblendet — der Nachschlage-Charakter bleibt erhalten.
  - Migration bestehender Inhalte: EKG-Rhythmuserkennung →
    `minLevel: 'RS'`, Medikamente (SAA/BPR) → `minLevel: 'NotSan'`,
    Elektroden-legen → `minLevel: 'RH'` (stufenunabhängige Fertigkeit,
    niedrig angesetzt) für beide Sets.
- Projekt umbenannt in **SanWissen** (vormals "RS Learner") inkl. neuer
  Zielgruppenbeschreibung (SanH/RH/RS/NotSan) in README/App-Branding.
- `docs/vorgaben_und_inhalte.txt`: ausführliche Modul- und Feature-Roadmap
  vom Nutzer ergänzt (Grundlage für die weitere Priorisierung).

## [0.4.0] – 2026-09-16

### Behoben

- **„Zurücksetzen" im EKG-Quiz und in der Fortschrittsansicht funktionierte
  nicht.** Ursache: `window.confirm()` liefert in der Tauri-WebView nicht
  zuverlässig einen echten Bestätigungsdialog. Ersetzt durch eine
  In-App-Bestätigung (`components/ConfirmButton.tsx`, Klick → "Wirklich?"/
  "Abbrechen" statt nativem Dialog).

### Geändert

- **12-Kanal-Elektrodentrainer:** `ThoraxOutline.tsx` zeigt jetzt einen
  echten, anatomisch angelehnten Rippenkorb (Schlüsselbeine, Brustbein mit
  Manubrium/Corpus/Xiphoid, 9 nummerierte Rippenpaare als Knochen statt
  schattierter Bänder) — angelehnt an eine vom Nutzer bereitgestellte
  Referenz-Abbildung. Die V1-V6-Punkte sitzen jetzt direkt auf den Rippen
  mit gepunkteten Hilfslinien zu den Labels darunter (wie in klassischen
  Lehrbuch-Abbildungen). Hit-Zonen (ICR-Band + Leitlinie) wurden an die neue
  Rippengeometrie angepasst und erneut end-to-end getestet.

## [0.3.0] – 2026-09-16

### Hinzugefügt

- **Medikamente-Modul:** neues Feld „Wirkung“ pro Medikament (allgemeinverständlich,
  was das Medikament im Körper macht) direkt neben den Indikationen, damit
  auf einen Blick klar ist, was ein Mittel bringt und wann es eingesetzt
  wird (`modules/medikamente/wirkung.ts`). Dieses Wissen stammt bewusst
  nicht aus dem SAA/BPR-PDF, sondern ist ergänztes Pharmakologie-Grundwissen
  — im UI-Disclaimer entsprechend gekennzeichnet.
- **12-Kanal-Elektrodentrainer grundlegend überarbeitet:** statt der
  bisherigen Ganzkörper-Ansicht mit grobem Abstands-Treffer gibt es jetzt
  einen eigenen, gezoomten **Brustkorb-Umriss** (`ThoraxOutline.tsx`) mit
  gezeichneten, nummerierten Rippen, schattierten Interkostalraum-Bändern
  (ICR 1-6) und durchgehend sichtbaren vertikalen Leitlinien
  (Sternal-/Medioklavikular-/vordere+mittlere Axillarlinie).
  - Für V1, V2, V4, V5 und V6 wird jetzt **zweidimensional geprüft**: Die
    Elektrode muss sowohl im richtigen Interkostalraum **als auch** auf der
    richtigen Linie liegen (`ElectrodeHitZone`), statt nur "nah genug" an
    einem Punkt zu sein — deutlich näher an der echten Anlegetechnik
    ("Rippe zählen, dann Linie finden").
  - V3 (per Definition nur "zwischen V2 und V4") und die vier
    Extremitätenableitungen (jetzt als Schulter-/Hüft-Ansatzpunkte am
    Brustkorb) bleiben bewusst einfache Abstandsziele.
  - Das Monitoring-EKG-Set (Ampelschema) nutzt weiterhin die
    Ganzkörperansicht (dort nicht nötig/sinnvoll, keine ICR-Kritikalität).

## [0.2.0] – 2026-09-16

### Hinzugefügt

- **Elektroden-Platzierungstrainer** im EKG-Modul (neuer Tab „Elektroden
  legen“): interaktiver, per Maus/Touch bedienbarer Körper (SVG-Mannequin,
  `modules/ekg/electrodes/`), auf dem die richtigen Klebepositionen der
  EKG-Elektroden trainiert werden.
  - Zwei Sets: **Monitoring-EKG (3-/4-Kanal, „Ampelschema“)** und
    **12-Kanal-EKG** (Extremitäten- + Brustwandableitungen V1-V6 nach
    Wilson, inkl. Rippen-/Hilfslinien für die Landmarken).
  - Zwei Modi: **Lernen** (statische, beschriftete Referenzansicht) und
    **Üben** (Elektroden per Drag-and-drop an die richtige Stelle ziehen,
    mit Sofort-Feedback, Versuchszähler und Reset).
- **Medikamente-Modul** (neu verfügbar, vorher Platzhalter): durchsuchbares
  Nachschlagewerk mit 29 Medikamenten (Wirkstoff, Konzentration,
  Indikationen, Kontraindikationen, Dosierung, Nebenwirkungen,
  Besonderheiten), inhaltlich aus den **SAA und BPR 2025** (Standard-
  Arbeitsanweisungen und Behandlungspfade Rettungsdienst, 6-Länder-
  Arbeitsgruppe ÄLRD) extrahiert. Mit deutlich sichtbarem Hinweis, dass es
  sich um NotSan-Kompetenzen (nicht RS-Prüfungsstoff) handelt und die App
  hier als Kontext-/Nachschlage-Plattform dient.
- `docs/saa_bpr_2025.pdf` als Wissensquelle im Projekt abgelegt; Extraktion
  der Medikamentendaten über ein einmaliges Python/PyMuPDF-Skript
  (Ergebnis liegt strukturiert in `modules/medikamente/medications.json`).

### Geändert

- Registry-Eintrag „SAA / BPR Fragenkatalog“ entfernt zugunsten des jetzt
  verfügbaren Medikamente-Moduls; „Algorithmen“ bleibt als Platzhalter für
  die BPR-Krankheitsbilder/-Algorithmen aus derselben Quelle.
- Versionsnummer auf 0.2.0 angehoben.

## [0.1.0] – 2026-09-16

### Hinzugefügt

- Projekt-Setup als Tauri + React + TypeScript App (lauffähig auf macOS und
  Windows, Vite als Build-Tool).
- App-Shell mit Seitenleiste und Modul-Registry (`src/app/registry.tsx`) als
  Grundlage für zukünftige Lernmodule.
- **EKG-Trainer** als erstes vollständiges Lernmodul:
  - Parametrischer EKG-Kurvengenerator (`modules/ekg/waveform.ts`), der
    Rhythmen aus P/Q/R/S/T-Gaußkurven synthetisiert statt Bildmaterial zu
    benötigen.
  - Rhythmus-Bibliothek mit 18 Einträgen: Sinusrhythmus, Sinusbradykardie,
    Sinustachykardie, respiratorische Sinusarrhythmie, Vorhofflimmern,
    Vorhofflattern, SVT, ventrikuläre Extrasystole, ventrikuläre Tachykardie,
    Kammerflattern, Kammerflimmern (grob/fein), Asystolie, AV-Block I°,
    AV-Block II° Wenckebach, AV-Block II° Mobitz II, AV-Block III°,
    ST-Hebung- und ST-Senkung-Muster.
  - Canvas-Rendering der Kurven im Monitor-Look (`EkgTrace.tsx`).
  - Lernmodus mit Karteikarten-Bibliothek, gruppiert nach Kategorie
    (`StudyMode.tsx`).
  - Quiz-Modus mit Multiple-Choice-Erkennung und gewichteter
    Wiederholungslogik für schwache Rhythmen (`QuizMode.tsx`, `progress.ts`).
  - Fortschrittsansicht mit Trefferquote pro Rhythmus, lokal persistiert
    (`ProgressView.tsx`).
- Platzhalter-Einträge für kommende Module: SAA/BPR-Fragenkatalog,
  Algorithmen (ABCDE, BLS/ALS), Medikamente, Anatomie & Physiologie.
- README mit Schnellstart, Architekturüberblick und
  Fehlerbehebungs-Hinweisen (u. a. Xcode-Lizenz unter macOS).

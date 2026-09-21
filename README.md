# SanWissen

Eine lokale Lern- und Nachschlage-App für den Sanitäts- und Rettungsdienst —
von Sanitätshelfer (SanH) über Rettungssanitäter (RS, schließt Rettungshelfer
mit ein) bis Notfallsanitäter (NotSan) (EKG, Anatomie, Algorithmen, SAA/BPR,
und perspektivisch weitere Themen). Läuft als native Desktop-App auf
**macOS und Windows** (Tauri + React/TypeScript) sowie als native App auf
**iPhone und iPad** (SwiftUI) — komplett offline, keine Accounts, keine
Cloud. Beide teilen sich dieselbe Inhaltsquelle, siehe
[Architektur](#architektur).

> ⚠️ **Wichtiger Hinweis zu den Inhalten:** Jeder der 78 Einträge trägt einen
> Quellenhinweis, der benennt, worauf er beruht. Die Medikamente sind zeilenweise
> gegen „SAA und BPR 2025" geprüft, Algorithmen und Schemata ebenfalls; andere
> Themen stützen sich auf Leitlinien, Ausbildungsunterlagen oder allgemeines
> rettungsdienstliches Fachwissen, was der jeweilige Hinweis offenlegt.
> Landesspezifische Angaben beziehen sich auf **Baden-Württemberg**.
>
> Trotzdem gilt: vor der Prüfung mit den eigenen Kursunterlagen abgleichen.
> Grenzwerte, Algorithmen und Zuständigkeiten unterscheiden sich je nach
> Organisation, Bundesland und Rettungsdienstbereich. Diese App ersetzt keine
> offizielle Ausbildung.

Änderungen zwischen Versionen stehen in [CHANGELOG.md](CHANGELOG.md).

---

## Inhaltsverzeichnis

- [Schnellstart](#schnellstart)
- [Voraussetzungen](#voraussetzungen)
- [Features](#features)
- [Architektur](#architektur)
- [Eigene Inhalte einpflegen](#eigene-inhalte-einpflegen--korrigieren)
- [Neues Lernmodul hinzufügen](#neues-lernmodul-hinzufügen-z-b-saabpr)
- [Builds für macOS & Windows](#builds-für-macos--windows)
- [iOS-App (iPhone & iPad)](#ios-app-iphone--ipad)
- [Mobile (Android)](#mobile-android)
- [Fehlerbehebung](#fehlerbehebung)
- [Roadmap](#roadmap)

---

## Schnellstart

Einmalig einrichten:

```bash
# 1. Node.js Abhängigkeiten installieren
npm install

# 2. Rust-Toolchain installieren (falls noch nicht vorhanden)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# danach neue Shell öffnen oder: source "$HOME/.cargo/env"
```

**macOS-spezifisch:** Xcode Command Line Tools müssen installiert *und*
lizenziert sein (siehe [Fehlerbehebung](#fehlerbehebung) falls der Build mit
einem Linker-Fehler abbricht):

```bash
xcode-select --install        # falls noch nicht installiert
sudo xcodebuild -license      # Lizenz bestätigen (einmalig, braucht Passwort)
```

App starten (jedes Mal, wenn du entwickeln/testen willst):

```bash
npm run tauri dev
```

Das öffnet die App als natives Fenster. Änderungen am Code werden per
Hot-Reload sofort übernommen.

> Tipp: `npm run dev` startet nur das Frontend im Browser (ohne Tauri-Fenster,
> ohne Rust) — nützlich zum schnellen Iterieren an der Optik, aber ohne
> native Fenster-Funktionen.

## Voraussetzungen

| Tool | Zweck | Check |
|---|---|---|
| [Node.js](https://nodejs.org/) (LTS) | Frontend-Build (Vite/React) | `node -v` |
| [Rust](https://rustup.rs/) | Tauri-Backend | `rustc --version` |
| Xcode Command Line Tools (nur macOS) | native Builds | `xcode-select -p` |
| Visual Studio Build Tools mit "Desktop development with C++" (nur Windows) | native Builds | — |

## Features

### ✅ Startseite

- Landet man beim App-Start: Modul-Karten-Übersicht + **"Deine Favoriten"**
  + **"Dein Fahrplan"** — kuratierte Verlinkung in ausgewählte Abschnitte
  aller Module, gruppiert nach Thema (kein eigenes Modul mit eigenen
  Inhalten, nur Navigation, siehe `docs/vorgaben_und_inhalte.txt`
  Abschnitt 5).
- Zeigt eine EKG-Fortschritts-Kachel, sobald erste Quiz-Versuche vorliegen.
- Die App-Version steht sichtbar neben dem Logo in der Sidebar (z. B.
  "v0.10.0") — automatisch aus `package.json` übernommen, keine doppelte
  Pflege nötig (`vite.config.ts` → `__APP_VERSION__`).

### ✅ Favoriten/Lesezeichen

- ☆-Stern-Button neben dem Titel in der Detailansicht der meisten
  Themenmodule sowie der EKG-Rhythmen — markiert einen Eintrag zum
  schnellen Wiederfinden (ausgefüllter ★, wenn aktiv).
- Erscheinen gesammelt in der Sektion "Deine Favoriten" auf der Startseite,
  mit Klick-Navigation direkt zum Eintrag.
- Persistiert in `localStorage` (`src/app/favorites.ts`), modulübergreifend
  über ein leichtgewichtiges Pub/Sub synchronisiert (`FavoriteButton` in
  `src/components/`).
- Nicht enthalten: Werkzeuge & Scores (Rechner statt Nachschlage-Eintrag),
  Glossar (bereits als durchsuchbare Kurzliste konzipiert) und das
  Einzelthema "Medikamente vorbereiten & verabreichen" (redundant zum
  direkten Modul-Link).

### ✅ Themen-Gruppierung (statt Qualifikationsstufen)

- Sidebar und Fahrplan gruppieren Module nach fünf Themenkategorien statt
  nach Kompetenzstufe: **Grundlagenwissen**, **Krankheitsbilder &
  Algorithmen**, **Medikamente**, **Diagnostik & Training**, **Einsatz &
  Organisation** (`ModuleCategory` in `src/app/registry.tsx`). Werkzeuge &
  Scores sowie Glossar & Abkürzungen bleiben fest oben angepinnt
  (`pinned: true`), alle anderen Module erscheinen in ihrer Kategorie.
- Ursprünglich gab es hier drei Qualifikationsstufen (SanH/RS/NotSan) als
  Navigationsachse — nach Rückmeldung war das unnötig komplex, da Inhalte
  ohnehin für alle einsehbar sind. Umgestellt in 0.17.0, siehe CHANGELOG.
- Das zugehörige `minLevel`-Feld und der Typ `QualificationLevel` sind in
  1.1.0 entfernt worden. Sie hingen als Altlast an 806 Stellen, ohne
  Anzeige, Gruppierung oder Suche zu beeinflussen.

### ✅ Globale Suche

- Ein Suchfeld oben in der Sidebar durchsucht **alle Module gleichzeitig**
  (EKG-Rhythmen, Medikamente, Algorithmen, Anatomie) statt einzelner
  Tab-Suchfelder.
- Klick auf einen Treffer springt direkt zum richtigen Modul **und**
  Eintrag — auch über die internen Tabs des EKG-Trainers hinweg.
- Implementierung: `app/searchIndex.ts` (durchsuchbarer Index über alle
  Module) + `app/NavigationContext.tsx` (moduleübergreifende
  Navigations-Anfrage, die jedes Modul selbst konsumiert).

### ✅ Hoher-Kontrast-Modus

- Umschalter unten in der Sidebar (🌙/🔆). Die App ist standardmäßig
  bereits dunkel gestaltet — der Hoher-Kontrast-Modus geht für schlechte
  Lichtverhältnisse im Einsatz (grelle Sonne, Blendung) einen Schritt
  weiter: reines Schwarz als Hintergrund, kräftigere Akzentfarben, dickere
  Rahmen, größere Grundschrift.
- Einstellung wird per `localStorage` gespeichert und bleibt über
  Neustarts erhalten.

### ✅ Prüfungsvorbereitung (Quiz)

- Fest angepinntes Modul mit Multiple-Choice-Fragen über fast alle
  Themenmodule hinweg (Algorithmen, Anatomie, Traumatologie, Medikamente,
  Medikamente vorbereiten & verabreichen, Sanitätsdienst, Internistische
  Notfälle, Pädiatrie & Geburtshilfe, Psychiatrische Notfälle,
  Rettungstechnik, Rechtliche Grundlagen, Glossar).
- Modul-Filter ("Alle Module" oder ein einzelnes), gewichtete
  Zufallsauswahl nach demselben Prinzip wie beim EKG-Quiz (Fragen mit
  wenig Übung/niedriger Trefferquote erscheinen häufiger), Sofort-Feedback
  mit Erklärung, "Zum Eintrag springen" führt direkt zurück ins
  Quellmodul.
- Startbestand von 45 kuratierten Fragen — kein Anspruch auf vollständige
  Abdeckung jedes Eintrags, wachsender Fragenpool
  (`src/app/quiz/questions.ts`).
- Das EKG-Quiz (visuelle Rhythmuserkennung an der Kurve) bleibt als
  eigenständiges Feature bestehen — konzeptionell verschieden von
  Text-Multiple-Choice.

### ✅ Checklisten

- Fest angepinntes Modul mit 5 abhakbaren Checklisten für den echten
  Dienst: Notfallrucksack-Check (Dienstbeginn), Reanimation Erwachsene —
  Ablauf (BLS), MANV — Sichtungsablauf, Notgeburt — Ablauf-Checkliste,
  Übergabe (SINNHAFT) — Checkliste.
- Alle Punkte sind aus den jeweiligen Themenmodulen abgeleitet (mit
  Verweis darauf dort), nicht neu erfunden.
- Haken werden pro Checkliste in `localStorage` gespeichert und bleiben
  bis zum manuellen Zurücksetzen erhalten — auch für den echten Einsatz
  gedacht, nicht nur zum Lernen.

### ✅ Cheat-Sheet

- Fest angepinntes Modul mit 8 stark verkürzten, großformatigen
  Merkzetteln: Reanimation Erwachsene, Reanimation Kinder, ABCDE-Schema,
  Anaphylaxie, MANV-Sichtung, Schlaganfall (FAST), Verbrennungen,
  Hypoglykämie.
- Jede Karte verlinkt per "Mehr Details →" zurück ins ausführliche
  Quellmodul.
- Druckbar über einen 🖨️-Button; eigenes `@media print`-Stylesheet blendet
  Sidebar/Buttons aus und stellt auf schwarz-auf-weiß um, unabhängig vom
  Hoher-Kontrast-Modus.

### ✅ EKG-Trainer (v1)

- **18 Rhythmen** über alle für die RS-Ausbildung relevanten Kategorien:
  Sinusrhythmen, Vorhofarrhythmien (Vorhofflimmern/-flattern, SVT),
  Kammerarrhythmien (VES, VT, Kammerflattern), Kammerflimmern (grob/fein),
  Asystolie, alle drei AV-Block-Grade (inkl. Wenckebach vs. Mobitz II),
  ST-Hebung/-Senkung.
- Die EKG-Kurven werden **synthetisch/parametrisch generiert** (Summe von
  Gauß-Kurven für P/Q/R/S/T, siehe `waveform.ts`) — kein Bildmaterial nötig,
  dadurch beliebig viele Varianten pro Rhythmus und keine Lizenzfragen.
- **Lernmodus**: Karteikarten-artige Bibliothek mit Merkmalen und klinischer
  Relevanz/Vorgehen pro Rhythmus.
- **Quiz-Modus**: Multiple-Choice-Erkennung mit **gewichteter Wiederholung**
  (Rhythmen, bei denen du öfter falsch liegst, kommen häufiger dran — eine
  einfache Form von Spaced Repetition).
- **Fortschrittsansicht**: Trefferquote pro Rhythmus, lokal gespeichert
  (im Browser-/App-Storage, verlässt nie deinen Rechner).
- **Nahaufnahme eines PQRST-Komplexes** (nur iOS): Umschalter unten rechts
  im Streifen. Das Raster bleibt quadratisch, die Eichung mit 25 mm/s und
  10 mm/mV gilt also weiter. Im Zoom sind die Zacken einzeln benannt
  (P, Q, R, S, T), dazu QRS-Komplex, PQ- und ST-Strecke sowie PQ- und
  QT-Intervall. Im Quiz ist der Umschalter abgeschaltet, weil sein Fehlen
  die Antwort sonst auf Kammerflimmern, Kammerflattern oder Asystole
  eingrenzen würde.

### ✅ Elektroden-Platzierungstrainer (im EKG-Modul, Tab „Elektroden legen“)

- Anatomische **Körper- und Thoraxabbildung**, auf der du die Elektroden
  per Maus oder Touch an die richtige Stelle ziehst. Die Trefferzonen sind
  auf den Bildern ausgemessen; Desktop und iOS nutzen dieselben Dateien.
- **Monitoring-EKG (3-/4-Kanal, „Ampelschema“)**: Ganzkörperansicht mit 4
  Positionen. Geklebt wird an **Schultern und Leisten**, wie im
  Rettungsdienst üblich, damit die Flächen für die Defibrillations-Pads
  frei bleiben. Die in Klinik und Intensivmedizin übliche
  Mason-Likar-Position ist im Einleitungstext beschrieben und gegenüber
  der Rettungsdienst-Variante eingeordnet.
- **12-Kanal-EKG**: gezoomte Brustkorbansicht mit sichtbarem Rippenverlauf.
  Bei V1, V2 und V4–V6 wird **zweidimensional** geprüft (richtiger
  Interkostalraum **und** richtige Linie), nicht nur „nah genug" an einem
  Punkt. Das trainiert die echte Anlegetechnik: Rippe zählen, Linie finden.
- Elektroden bleiben liegen, wo du sie ablegst. Falsch platzierte bekommen
  einen roten Ring und lassen sich wieder aufnehmen.
- **Lernen**-Modus zeigt alle Positionen beschriftet an, **Üben**-Modus
  lässt dich die Elektroden platzieren (Sofort-Feedback, Versuchszähler).

### ✅ Medikamente (SAA/BPR) — Nachschlagewerk

- Durchsuchbare Referenz mit **29 Medikamenten** (Wirkstoff, Konzentration,
  Wirkung, Indikationen, Kontraindikationen, Dosierung, Nebenwirkungen,
  Besonderheiten), gruppiert nach Kategorie. Die kurze "Wirkung"-Erklärung
  (was macht das Mittel im Körper) ist allgemeines Pharmakologie-Wissen,
  ergänzt neben den PDF-Originalfeldern.
- Inhaltlich extrahiert aus [`docs/saa_bpr_2025.pdf`](docs/saa_bpr_2025.pdf)
  ("Standard-Arbeitsanweisungen und Behandlungspfade Rettungsdienst 2025",
  6-Länder-Arbeitsgruppe ÄLRD).
- ⚠️ **Scope-Hinweis:** Diese SAA/BPR beschreiben delegierbare invasive
  Maßnahmen und Medikamentengaben für **Notfallsanitäter:innen (NotSan)**
  mit ärztlicher Delegation — **nicht** den Kompetenzbereich der (kürzeren)
  Rettungssanitäter-Ausbildung (RS). Das Modul ist bewusst als
  **Nachschlage-/Kontextwissen** gedacht (verstehen, was NA/NotSan tun und
  warum), nicht als 1:1-RS-Prüfungsstoff. Die App ist damit auch allgemein
  als **Kontext-Plattform** angelegt: eigene Quell-PDFs unter `docs/`
  ablegen und daraus weitere Module/Inhalte extrahieren, siehe
  [Eigene Inhalte einpflegen](#eigene-inhalte-einpflegen--korrigieren).

### ✅ Algorithmen (ABCDE, BLS/ALS)

- 9 Einträge aus den BPR-Abschnitten „Herangehensweise" und
  „Kreislaufstillstand": ABCDE-Herangehensweise/-Instabilitäten, WASB & GCS,
  SAMPLER, OPQRST, Atemwegsmanagement, Patientenanmeldung (ZOABCDE),
  Übergabe (SINNHAFT), Reanimation Erwachsene (BLS→ALS) und Kinder (PLS).
- Laien-Basismaßnahmen (Reanimation) sind allgemeines BLS-Wissen und per
  Quellenhinweis von den PDF-Inhalten (NotSan-fokussiert) abgegrenzt.

### ✅ Medikamente vorbereiten & sicher verabreichen

Eigenständiges Modul, eigener Sidebar-Tab in der „Rettungssanitäter"-Gruppe
(vorher fälschlich als Unterpunkt in Algorithmen einsortiert).

- 6-R-Regel, Sicherheitsprinzipien (DIVI-ISO-Aufkleber, 4-Augen-Prinzip,
  Doppelkontrolle, gesicherte Kommunikation) und der
  Standardvorgehen-Ablauf direkt aus SAA/BPR S. 40–41, plus die allgemeine
  Verdünnungsformel (C1×V1 = C2×V2) mit zwei PDF-geprüften
  Praxisbeispielen (Epinephrin, Naloxon).

### ✅ Anatomie & Physiologie

- 5 Themen: Herz-Kreislauf-System (inkl. Erregungsleitungssystem — direkte
  Grundlage fürs EKG-Modul), Atmungssystem, Skelett & Muskulatur,
  Nervensystem (inkl. vegetatives NS als Grundlage für Medikamentenwirkungen
  wie Adrenalin/Atropin), Vitalparameter-Normwerte nach Altersgruppe als
  Nachschlagetabelle.
  Allgemeines anatomisch-physiologisches Grundlagenwissen, keine SAA/BPR-Quelle.

### ✅ 3D-Anatomieatlas

Einstieg oben im Modul „Anatomie & Physiologie", auf allen Plattformen.
Auf iOS in SceneKit, auf Windows, macOS und Android in WebGL über
three.js. Beide lesen dieselbe Geometrie aus `content/atlas/`.

- **Zwei Modelle**, umschaltbar in der Kopfzeile: männlich aus
  [BodyParts3D](https://lifesciencedb.jp/bp3d/) (2.234 Teile, 2,29 Mio.
  Dreiecke, vollständige Abdeckung) und weiblich (902 Teile, 1,89 Mio.
  Dreiecke). Ein vollständiger, frei lizenzierter weiblicher
  Ganzkörperdatensatz existiert nicht, deshalb ist das weibliche Modell
  zusammengesetzt: Organe, Gefäße, Nerven, Fortpflanzungsorgane und
  Becken aus dem [Human Reference Atlas](https://humanatlas.io/)
  (united-female v1.5), die übrigen Knochen und die Muskulatur aus
  BodyParts3D. Dass diese Teile männlich sind, steht in der
  Quellenangabe der App.
- **Bedienung:** Ziehen zum Drehen, zwei Finger zum Zoomen, Tippen zum
  Untersuchen. Einzelne Systeme lassen sich ein- und ausblenden oder
  freistellen, ein Regler zieht die Anatomie stufenlos bis zum
  vollständigen Inventar auseinander.
- **Struktur-Quiz:** eine Struktur wird genannt und ist im Modell
  anzutippen. Gefragt wird nur nach dem, was von der aktuellen Ansicht
  aus wirklich zu erreichen ist; Drehen ändert die Auswahl.
- Beide Datensätze stehen unter CC Attribution 4.0 International; die
  Quellenangabe steht in der App unter dem Info-Symbol. Die Geometrie
  liegt als Rohpuffer in `content/atlas/` und wird nur
  eingeblendet (memory mapped) statt geladen. Sie macht den Großteil der
  rund 109 MB aus, die die App belegt.
- **Zur WebGL-Fassung:** auf iOS bekommt jedes der 2.234 Netze einen
  eigenen Knoten, was SceneKit wegsteckt. In WebGL wären das 2.234
  Zeichenaufrufe pro Bild. Dort fasst deshalb ein `BatchedMesh` je
  Organsystem alle Netze zusammen und bietet trotzdem Sichtbarkeit,
  Farbe und Matrix je Teil. Gemessen: 14 Aufrufe pro Bild. Die Geometrie
  wird dabei nicht eingeblendet, sondern geladen; auf dem
  Android-Emulator dauert das 1,9 Sekunden.
- Die Namen der Teile und Strukturen sind englisch, so wie sie in den
  Quelldaten stehen. Die Organsysteme sind übersetzt und stehen in
  `content/atlas-systems.json`.

### ✅ Werkzeuge & Scores

Fest oben in der Sidebar angepinnt (direkt unter der Startseite, nicht in
einer Themen-Kategorie) — die Werkzeuge sind themenübergreifend gleich
relevant.

- 6 interaktive Rechner: **GCS** (Klick-Rechner, live Summe + Schweregrad),
  **Schmerzskala NRS/VAS** (0–10-Regler, inkl. Cross-Referenz zu den
  Medikamente-Schwellenwerten), **APGAR-Score** (Neugeborenen-Beurteilung),
  **Neuner-Regel** (Verbrennungsfläche, Erwachsene/Kind umschaltbar +
  Handflächenregel), **NACA-Score** (Einsatzschwere-Referenzliste),
  **Verdünnungsrechner** (Ausgangs-/Zielkonzentration + Zielvolumen →
  benötigte Mengen, mit PDF-geprüften Beispielen).
- Bewusst nicht enthalten: ein Medikamenten-Dosisrechner nach Körpergewicht
  — die Dosierungsangaben der 29 SAA/BPR-Medikamente sind uneinheitlicher
  Freitext, ein automatisches Auslesen wäre bei diesem hochsensiblen Thema
  ein zu hohes Fehlerrisiko (siehe CHANGELOG 0.8.0).

### ✅ Glossar & Abkürzungen

Ebenfalls fest oben in der Sidebar angepinnt.

- Ca. 40 RS-typische Abkürzungen (SAA, BPR, GCS, NACA, MANV, SAMPLER,
  ZOABCDE, SINNHAFT, DIVI, PSNV, ROSC, u. v. m.) mit Bedeutung, teils mit
  kurzer Erklärung und Verweis auf das jeweilige Fachmodul.
- Eigenes Suchfeld im Modul selbst zum schnellen Filtern, zusätzlich über
  die globale Suche erreichbar.

### ✅ Traumatologie & Verbandslehre

- 7 Themen: Frakturlehre, Wundversorgung, Verbandslehre (Druckverband/
  Dreiecktuch/Schienung), Wirbelsäulentrauma & Immobilisation,
  Thorax-/Abdominaltrauma, Verbrennungen, Polytrauma & kritische
  Blutungen (Tourniquet). Allgemeines rettungsdienstliches
  Grundlagenwissen, keine SAA/BPR-Quelle.
- Abbildungen kommen als Bilddatei aus `content/images/`, in beiden Apps
  dieselben. Bis 1.1.0 zeichnete der Desktop hier drei Abschnitte als SVG
  und zeigte die übrigen verknüpften Abbildungen gar nicht.

### ✅ Sanitätsdienst (Veranstaltungsdienst)

- 5 Themen in 3 Kategorien: **Einsatzorganisation** (Sanitätswachdienst-
  Organisation, MANV & Sichtung/Triage mit Ampelschema und
  Sichtungsalgorithmus angelehnt an START), **Kommunikation**
  (Funkalphabet nach DIN 5009/ICAO & Funkdisziplin), **Medizinische
  Besonderheiten** (typische Veranstaltungs-Verletzungsmuster wie
  Kreislaufkollaps und Crowd-Crush-Verletzungen, Hygiene &
  Infektionsschutz).
- Allgemeines Grundlagenwissen zum Sanitäts-/Veranstaltungsdienst, keine
  SAA/BPR-Quelle — organisations- und bundeslandspezifische Abweichungen
  (Sichtungsschema, Funkkanäle, Hygieneplan) sind je Eintrag vermerkt.

### ✅ Internistische Notfälle

- 10 Themen in 5 Kategorien: **Herz & Kreislauf** (Herzinfarkt/ACS,
  Lungenödem), **Neurologisch** (Schlaganfall mit FAST-Test,
  Krampfanfall/Epilepsie), **Stoffwechsel & Allergie** (diabetische
  Notfälle, Allergie/Anaphylaxie), **Abdomen & Vergiftungen** (akutes
  Abdomen, Intoxikationen inkl. Alkohol/Drogen), **Umweltbedingte
  Notfälle** (Hitzenotfälle, Unterkühlung & Erfrierung).
- Allgemeines rettungsdienstliches Grundlagenwissen, keine SAA/BPR-Quelle.
  Ärztlich delegierte Maßnahmen (z. B. ASS/Nitro, Glucose i.v., Adrenalin,
  Naloxon) sind je Eintrag markiert und verweisen auf das
  Medikamente-Modul.

### ✅ Pädiatrie & Geburtshilfe

- 4 Themen in 2 Kategorien: **Pädiatrie** (Besonderheiten pädiatrischer
  Notfälle — Anatomie/Physiologie, altersabhängige Vitalwerte (Verweis auf
  Anatomie-Modul), Dosierungsbesonderheiten (bewusst ohne Zahlenwerte,
  Verweis auf Medikamente-Modul), Kommunikation, Gewichtsschätzung, Verweis
  auf die Kinderreanimation im Algorithmen-Modul), **Geburtshilfe**
  (Normale Geburt, Notgeburt-Ablauf für den Sanitätsdienst, Erstversorgung
  Neugeborenes & APGAR-Score).
- Allgemeines rettungsdienstliches Grundlagenwissen, keine SAA/BPR-Quelle.
  Der APGAR-Rechner selbst bleibt im Werkzeuge-Modul, hier nur der
  fachliche Hintergrund und Verweis darauf.

### ✅ Psychiatrische Notfälle & Kommunikation

- 5 Themen in 4 Kategorien: **Psychiatrische Notfälle** (Erregungszustände
  & Deeskalation, Suizidalität), **Kommunikation** (Gesprächsführung mit
  Patienten & Angehörigen), **Sterben & Todesfeststellung** (sichere/
  unsichere Todeszeichen, rechtlicher Rahmen der Todesfeststellung als
  RS), **Großschadenslagen** (Psychische Erste Hilfe / PSNV-
  Grundprinzipien).
- Allgemeines rettungsdienstliches Grundlagenwissen, keine SAA/BPR-Quelle.
  Bundeslandspezifische rechtliche Rahmenbedingungen (Unterbringung gegen
  den eigenen Willen, Todesfeststellung) sind je Eintrag vermerkt.

### ✅ Rettungstechnik & Gerätekunde

- 6 Themen in 4 Kategorien: **Transport & Trageformen** (Rautekgriff,
  Tragestuhl, Schaufeltrage, Vakuummatratze), **Lagerungsarten** (stabile
  Seitenlage, Schocklage, Oberkörperhochlagerung, Knierolle — jeweils mit
  Indikation), **Atemwege & Beatmung** (Sauerstoffgabe, Absaugung &
  Atemwegshilfen mit Guedel-/Wendl-Tubus, Beatmungsbeutel),
  **Gerätekunde** (Notfallrucksack-Inhalt & Vollständigkeitsprüfung).
- Allgemeines rettungsdienstliches Grundlagenwissen, keine SAA/BPR-Quelle.
  Konkrete Geräte und Checklisten können je nach Organisation/Fahrzeugtyp
  abweichen.

### ✅ Rechtliche & organisatorische Grundlagen

- 5 Themen in 3 Kategorien: **Grundrechte & Pflichten** (Garantenstellung
  & unterlassene Hilfeleistung, Schweigepflicht, Patientenverfügung/
  -wille & mutmaßlicher Wille), **Delegation & Kompetenz** (Delegation
  ärztlicher Maßnahmen — Abgrenzung RS vs. NotSan), **Dokumentation**
  (Einsatzprotokoll & DIVI-Protokoll).
- Allgemeines rechtliches Grundlagenwissen, keine SAA/BPR-Quelle und keine
  Rechtsberatung. Bundeslandspezifische Abweichungen sind je Eintrag
  vermerkt.
- Damit sind alle Themenmodule aus `docs/vorgaben_und_inhalte.txt`
  Abschnitt 2 umgesetzt.

### 🔜 Geplant

Aktuell keine Platzhalter-Module offen. Aus `docs/vorgaben_und_inhalte.txt`
bleibt noch aus Abschnitt 3: eigene Notizen zu Einträgen.

Mobile-Version: die iOS-App ist umgesetzt, siehe
[iOS-App (iPhone & iPad)](#ios-app-iphone--ipad). Android ist noch offen,
der Umsetzungsweg steht unter [Mobile (Android)](#mobile-android).

## Architektur

```
src/
  main.tsx                # Einstiegspunkt; setzt die Darstellung, bevor React zeichnet
  App.tsx                 # App-Hülle: Seitenleiste am PC, Reiterleiste am Telefon
  app/
    registry.tsx         # Modul-Registry: Zuordnung ID → Komponente, Rest aus content/modules.json
    content.ts            # liest die Themenmodule aus content/
    appearance.ts          # Automatisch/Hell/Dunkel/Hoher Kontrast, wie auf iOS
    AppearancePicker.tsx    # Umschalter dafür
    NavigationContext.tsx    # modulübergreifende „spring zu Modul X, Eintrag Y"-Anfrage
    searchIndex.ts            # durchsuchbarer Index über alle Module
    GlobalSearch.tsx           # Suchfeld mit Auswahlliste in der Seitenleiste (PC)
    SearchPage.tsx              # dasselbe als eigene Seite für den Reiter „Suche" (Telefon)
    ModuleListPage.tsx           # alle Module als gruppierte Liste für den Reiter „Module"
    TabIcons.tsx                  # einfarbige SVG-Symbole der Reiterleiste
    HomePage.tsx                   # Startseite nach dem Vorbild von HomeView.swift
    roadmap.ts                      # kuratierter „Fahrplan" je Kategorie (nur Links)
    favorites.ts                     # Favoriten (localStorage + Pub/Sub)
    formatDate.ts                     # ISO-Datum als TT.MM.JJJJ, Gegenstück zu formatStand(_:)
    quiz/                              # Prüfungsquiz über alle Module (Fragen, Fortschritt, Ansicht)
    checklisten/, cheatsheet/           # siehe modules/ unten, liegen historisch hier
  components/
    TopicModule.tsx        # gemeinsame Ansicht der zehn Themenmodule: Liste, dann Detailseite
    SectionBox.tsx          # SectionBox, RowLink, RowGroup, DisclaimerBox, BackLink
    SectionIllustration.tsx  # Abbildung aus content/images/ samt Bildunterschrift
    FavoriteButton.tsx        # ☆/★-Stern neben Titeln
    ConfirmButton.tsx          # In-App-Bestätigung statt window.confirm
  modules/
    <zehn Themenmodule>/   # je eine Hülle um TopicModule, Inhalte in content/topics-*.json
    anatomie/
      atlas/               # 3D-Atlas in WebGL (three.js)
        atlasData.ts        # Verzeichnis laden, weibliches Modell zusammensetzen
        AtlasScene.ts        # Szene: BatchedMesh je System, Kamera, Auswahl, Explosionsansicht
        AtlasView.tsx         # Bedienung: Suche, Systeme, Freistellen, Regler, Struktur-Quiz
    ekg/                   # Rhythmen, Kurvengenerator, Quiz, Fortschritt
      electrodes/          # Elektroden-Trainer (SVG, Ziehen per Pointer-Events)
    werkzeuge/             # sechs Rechner; Titel und Texte in content/werkzeuge.json
    medikamente/, glossar/, checklisten/, cheatsheet/
                           # eigene Ansichten; data.ts hält nur Typisierung und Zugriff
content/                 # ALLE Fachinhalte als JSON — die einzige Pflegestelle
  modules.json           # Modul-Registry: Titel, Kategorie, Icon/Symbol, angepinnt
  topics-<modul>.json    # die zehn Themenmodule mit gemeinsamem Schema
  medikamente.json, ekg-*.json, glossar.json, quiz.json, …
  illustrations.json     # Bildunterschrift je Abbildung
  images/                # 49 Bilddateien, von beiden Apps genutzt (ca. 5 MB)
  atlas/                 # Geometrie des 3D-Atlas (Rohpuffer, ca. 97 MB) + atlas*.json
  atlas-systems.json     # Namen, Farben und Beschreibungen der Organsysteme
  schema/                # JSON Schemas: Feldhilfe im Editor + Prüfung im Build
src-tauri/                # Rust-Backend (Tauri), native Fenster/Bundling
docs/                    # Quell-PDFs/Unterlagen, aus denen Inhalte extrahiert werden
scripts/
  check-content.mjs      # prüft alle Verweise in content/ (läuft bei npm run build)
  vite-plugin-atlas.ts   # liefert content/atlas/ unter /atlas/ ans Frontend aus
ios/                     # native SwiftUI-App (iPhone/iPad), siehe ios/README.md
  SanWissen/
    App/                 # Einstiegspunkt, Wurzelansicht (TabView bzw. Split-View), Routing
    Core/                # Favoriten, Einstellungen, Checklisten, Lernfortschritt (UserDefaults)
    Content/             # Laden der JSON-Dateien + Datenmodelle
    Features/            # eine Ansicht je Modul, zehn teilen sich eine gemeinsame
      Atlas/             # 3D-Anatomieatlas (SceneKit): Szene, Systeme, Quiz
  Signing.xcconfig       # Platzhalter, bindet die lokale, nicht versionierte Datei ein
```

Die Inhalte liegen **nur** in `content/`, als JSON. Beide Apps lesen von
dort: die Desktop-App über `src/app/content.ts`, die iOS-App aus dem
App-Bundle, in das eine Build-Phase die Dateien kopiert. Es gibt keinen
Exportschritt mehr, den man vergessen könnte.

Die Dateien unter `src/modules/<name>/data.ts` halten nur noch Typisierung
und Zugriff. Wer Texte ändert, ändert sie in `content/` und braucht dafür
weder TypeScript noch einen Build.

### Eigene Inhalte einpflegen / korrigieren

Alle Inhalte liegen als JSON unter `content/` und lassen sich direkt
bearbeiten, ohne TypeScript oder einen Build. Jede Datei verweist über
`$schema` auf ihr Schema unter `content/schema/`. VS Code und die meisten
Editoren werten das ohne Zutun aus und bieten dann:

- Vervollständigung der Feldnamen beim Tippen
- eine Markierung, wenn ein Pflichtfeld wie `sourceNote` fehlt
- eine Auswahlliste für feste Werte, etwa die Modul-Kategorien
- eine Warnung bei vertippten Feldnamen, statt dass das Feld still
  ignoriert wird

Dieselben Schemas prüft `npm run check-content`, das auch bei
`npm run build` läuft. Dazu kommen dort Prüfungen, die ein Schema nicht
ausdrücken kann: dass Verweise aus Fahrplan, Cheat-Sheet, Quiz und Glossar
auf existierende Einträge zeigen, dass zu jeder verknüpften Abbildung Datei
und Bildunterschrift vorliegen und dass jede Kategorie in der
`categoryOrder` ihrer Datei steht.

- EKG-Rhythmen: `src/modules/ekg/rhythms.ts` — jeder Eintrag hat Merkmale,
  klinische Hinweise und die Parameter für die Kurvengenerierung
  (`gen`-Feld, siehe `types.ts` für die möglichen Rhythmus-Arten).
- Elektroden-Positionen: `src/modules/ekg/electrodes/data.ts` — die
  Koordinaten beziehen sich auf die `viewBox` des jeweiligen Sets
  (Monitoring 669 × 1200, 12-Kanal 746 × 1000) und damit auf die
  Abbildungen `koerper-vorderansicht` bzw. `thorax-vorderansicht`.
- Abbildungen: eine Datei `content/images/illu-<id>.jpg` ablegen, im
  Abschnitt `"illustration": "<id>"` setzen und die Bildunterschrift in
  `content/illustrations.json` eintragen. `npm run check-content` meldet,
  wenn Datei oder Unterschrift fehlt. Beide Apps zeigen dieselbe Abbildung.
- Medikamente: `content/medikamente.json` direkt anpassen,
  oder eigene Quell-PDFs unter `docs/` ablegen und wie unten beschrieben neu
  extrahieren.
- Wenn du eigene Skripten/Fragenkataloge hast: am besten als eigene
  Modul-Datenquelle im gleichen Stil wie `rhythms.ts`/`medications.json`
  anlegen.

### Quellenangabe & Stand pro Modul

Jedes Themenmodul (Algorithmen, Anatomie, Traumatologie, Medikamente,
Medikamente vorbereiten & verabreichen, Sanitätsdienst, Internistische
Notfälle, Pädiatrie & Geburtshilfe, Psychiatrische Notfälle,
Rettungstechnik, Rechtliche Grundlagen) exportiert in seiner `data.ts`
eine Konstante `CONTENT_STAND` (ISO-Datum, z. B. `'2026-09-17'`) — das
Datum, an dem der Inhalt zuletzt inhaltlich geprüft/aktualisiert wurde.
Sie wird über `src/app/formatDate.ts` (`formatStand`) im
Disclaimer-Banner des jeweiligen Moduls als "Inhaltlicher Stand:
TT.MM.JJJJ" angezeigt. Das ist unabhängig vom Datum der Originalquelle
selbst (z. B. steht das SAA/BPR-Dokument mit seinem eigenen Stand
gesondert im Quellenhinweis).

**Beim Anlegen oder inhaltlichen Ändern eines Moduls**: `CONTENT_STAND` in
der `data.ts` auf das aktuelle Datum setzen, damit erkennbar bleibt, was
ggf. veraltet ist.

Zusätzlich trägt **jeder einzelne Eintrag** ein Feld `sourceNote`, das
benennt, worauf er beruht — inklusive Seitenzahl, wenn es eine gibt.
Derzeit sind das alle 78 Einträge. Wo ein Inhalt über die Quelle
hinausgeht oder von ihr abweicht, sagt der Hinweis das ausdrücklich; ein
Beispiel ist die GCS-Punktetabelle, die aus der Originalskala nach
Teasdale und Jennett stammt, während das SAA/BPR-Dokument nur die grobe
Schweregrad-Einteilung nennt. Ein neuer Eintrag ohne `sourceNote` ist
unvollständig.

Für landesspezifische Angaben gilt **Baden-Württemberg** als Bezug.

### Eigene PDFs als Wissensbasis nutzen

Die Medikamente stammen aus `docs/saa_bpr_2025.pdf` und wurden per Skript
(PyMuPDF) automatisiert in `medications.json` extrahiert, nicht händisch
abgetippt — das minimiert Übertragungsfehler bei sicherheitsrelevanten
Dosierungen. Um eigene Unterlagen (z. B. eine andere/aktuellere
SAA/BPR-Version, ein Fragenkatalog-PDF) als Quelle zu nutzen:

1. PDF unter `docs/` ablegen.
2. Text extrahieren (z. B. mit `pymupdf`/`pdftotext`) und Struktur/Kapitel
   sichten.
3. Passendes Extraktionsskript schreiben (Vorlage: die Parser, die
   `medications.json` erzeugt haben — nicht Teil des Repos, da einmalig
   ausgeführt), Ergebnis als JSON/TS in ein neues oder bestehendes Modul
   einpflegen.
4. Zahlenwerte (Dosierungen!) stichprobenartig gegen das Original-PDF
   gegenprüfen, bevor du dich darauf verlässt.

### Neues Lernmodul hinzufügen (z. B. SAA/BPR)

1. Neuen Ordner `src/modules/<name>/` anlegen.
2. Eine Hauptkomponente bauen (an `modules/ekg/EkgModule.tsx` orientieren).
3. In `src/app/registry.tsx` den Eintrag von `status: 'coming-soon'` auf
   `status: 'available'` setzen und `component` angeben.

## Builds für macOS & Windows

Native Installer werden pro Betriebssystem gebaut (kein Cross-Compiling
ohne weiteres möglich). D. h. für einen Windows-Installer brauchst du
einen Windows-Rechner (oder CI, z. B. GitHub Actions mit einem
`windows-latest`-Runner — siehe unten).

```bash
npm run tauri build
```

Die fertigen Installer liegen danach unter `src-tauri/target/release/bundle/`
(z. B. `.dmg`/`.app` auf macOS, `.msi`/`.exe` auf Windows). Lokal auf
Apple Silicon gebaut läuft die App nur auf Apple-Silicon-Macs — für einen
Intel+Apple-Silicon-Installer: `npm run tauri build -- --target universal-apple-darwin`
(einmalig `rustup target add x86_64-apple-darwin aarch64-apple-darwin`).

### Release-Workflow (GitHub Actions) — macOS & Windows in einem Schritt

`.github/workflows/release.yml` baut bei jedem Push eines Tags im Format
`v*` (z. B. `v1.0.0`) automatisch **beide** Plattformen parallel in der
Cloud (macOS als Universal Binary + Windows) und legt die Installer als
**Entwurf** eines GitHub Release ab — kein eigener Windows-Rechner nötig.

So auslösen:

```bash
git tag v1.0.0        # Versionsnummer aus package.json übernehmen
git push origin v1.0.0
```

Danach im Reiter „Actions" auf GitHub den Fortschritt verfolgen (dauert
einige Minuten). Ist der Workflow fertig, liegt unter „Releases" ein
**Entwurf** mit den fertigen Installern als Anhang. Entwürfe sind nicht
öffentlich sichtbar — erst nach manuellem „Publish release" bekommen
Tester einen Download-Link. Alternativ die Dateien aus dem Entwurf selbst
herunterladen und direkt weitergeben (z. B. per AirDrop/Cloud-Link), ohne
den Release zu veröffentlichen.

**Ohne Code-Signing** (kein Apple Developer Account, kein Windows-
Zertifikat) zeigen macOS und Windows beim ersten Start eine Warnung
("nicht verifizierter Entwickler" bzw. SmartScreen) — für Tester normal,
einmal bestätigen reicht. Für eine unauffällige Installation später wäre
ein Apple Developer Account (99 $/Jahr, für Code-Signing + Notarisierung)
und ein Windows-Codesigning-Zertifikat nötig — für eine erste Testversion
nicht notwendig.

## iOS-App (iPhone & iPad)

Die iOS-App liegt unter `ios/` und ist **kein Tauri-Wrapper**, sondern in
SwiftUI geschrieben. Ursprünglich war der Tauri-Weg über
`npm run tauri ios init` vorgesehen; umgesetzt wurde stattdessen eine
eigenständige native App, weil Module wie der EKG-Trainer und der
Elektroden-Trainer von echten Gesten und nativem Scrolling deutlich
profitieren.

Doppelt gepflegte Inhalte gibt es deshalb trotzdem nicht: beide Apps lesen
dieselben JSON-Dateien aus `content/`. Eine Build-Phase des Xcode-Projekts
kopiert sie ins App-Bundle, es gibt also nichts von Hand anzustoßen.

**Einrichten:** Team-ID und Bundle-ID stehen nicht im Repository. Einmalig
anlegen:

```bash
cp ios/Signing.local.xcconfig.example ios/Signing.local.xcconfig
```

Danach die eigene Team-ID eintragen (Xcode → *Settings → Accounts*, oder
Apple Developer Portal → *Membership*). Die Datei steht in der
`.gitignore`. Ohne sie baut das Projekt mit Platzhaltern für den
Simulator; zum Signieren für Gerät, TestFlight oder App Store werden die
eigenen Werte gebraucht.

**Inhalte aktualisieren:** Dateien unter `content/` bearbeiten, fertig. Die
Build-Phase kopiert sie beim nächsten Build ins Bundle. Prüfen lässt sich
der Bestand jederzeit:

```bash
npm run check-content
```

Das meldet Verweise, die ins Leere zeigen, etwa wenn eine Cheat-Sheet-Karte
auf einen umbenannten Eintrag zeigt. Es läuft auch bei `npm run build`.

**Bauen:**

```bash
xcodebuild -project ios/SanWissen.xcodeproj -scheme SanWissen -configuration Debug build
```

Neue Swift-Dateien müssen nicht ins Projekt eingetragen werden: der Ordner
`SanWissen` ist eine synchronisierte Gruppe
(`PBXFileSystemSynchronizedRootGroup`), Xcode nimmt alles darin
automatisch auf.

**Verteilen:** Der Weg nach TestFlight und in den App Store (Archivieren,
Export mit Verteilungssignatur, Upload über `altool` mit einem
App-Store-Connect-API-Schlüssel) ist erprobt und Schritt für Schritt
festgehalten, zusammen mit den Stolpersteinen, die dabei aufgetreten sind.

Ausführlicher steht das alles in [ios/README.md](ios/README.md).

## Mobile (Android)

Tauri 2 unterstützt Android nativ aus derselben Codebasis wie Desktop —
kein separates Rewrite nötig. Der Mobile-Entry-Point
(`#[cfg_attr(mobile, tauri::mobile_entry_point)]` in
`src-tauri/src/lib.rs`) und das passende `crate-type` in
`src-tauri/Cargo.toml` sind aus dem Standard-Tauri-Template bereits
vorhanden.

Der Ablauf entspricht dem früher für iOS geplanten, nur mit
Android-Studio/Kotlin/Gradle statt Xcode/Swift:

**Voraussetzungen:**

- [Android Studio](https://developer.android.com/studio) (inkl. Android
  SDK, empfohlen aktuelles API-Level)
- Android NDK (über Android Studio → SDK Manager → SDK Tools installierbar)
- JDK 17+
- Umgebungsvariablen `ANDROID_HOME` und `NDK_HOME` gesetzt (Android
  Studio zeigt die passenden Pfade unter SDK Manager an)

**Einmalig initialisieren:**

```bash
npm run tauri android init
```

Generiert `src-tauri/gen/android/` (Gradle-Projekt).

**Entwickeln** (Hot-Reload auf Emulator oder angeschlossenem Gerät):

```bash
npm run tauri android dev
```

**Release-Build** (APK/AAB):

```bash
npm run tauri android build
```

Ergebnis liegt unter
`src-tauri/gen/android/app/build/outputs/apk/` bzw. `.../bundle/`.

**Signing:** Für eine erste Testversion reicht die unsignierte/
Debug-APK zum direkten Sideload (z. B. per Link teilen, „Installation aus
unbekannten Quellen" auf dem Testgerät erlauben) — analog zu den
unsignierten macOS/Windows-Testbuilds oben. Für eine Play-Store-
Veröffentlichung später braucht es einen Keystore zum Signieren (siehe
[Tauri-Doku: Android Signing](https://tauri.app/distribute/sign/android/)).

**CI:** `.github/workflows/release.yml` deckt bisher nur macOS/Windows
ab. Ein Android-Build ließe sich als zusätzlicher Job (`runs-on:
ubuntu-latest`, plus Android-SDK/NDK-Setup-Action und
`npm run tauri android build` statt `tauri-apps/tauri-action`, da dessen
Mobile-Unterstützung noch eingeschränkter ist als für Desktop) ergänzen,
sobald der Android-Teil so weit ist.

## Fehlerbehebung

**`npm run tauri dev` / `cargo check` bricht mit `linking with "cc" failed`
und `"You have not agreed to the Xcode license agreements"` ab (macOS):**

```bash
sudo xcodebuild -license
```
Lizenztext mit Leertaste durchblättern, am Ende mit `agree` bestätigen.
Danach den Befehl erneut ausführen.

**Erster Start dauert lange:** Beim allerersten `npm run tauri dev` bzw.
`npm run tauri build` kompiliert Rust alle Abhängigkeiten neu — das kann
einige Minuten dauern. Danach sind Rebuilds durch Caching viel schneller.

## Roadmap

Siehe [CHANGELOG.md](CHANGELOG.md) für den aktuellen Stand und
`src/app/registry.tsx` für die geplanten Module.

Ob sich die SwiftUI-App künftig auch auf dem Mac nutzen ließe, ist in
[docs/macos-portierung.md](docs/macos-portierung.md) eingeschätzt (kurz:
das iPad ist bereits abgedeckt, der Mac wäre machbar, die offene Frage
ist das Verhältnis zur bestehenden Tauri-App).

Der geplante Umbau der Inhalts-Pipeline steht in
[docs/inhaltspipeline.md](docs/inhaltspipeline.md) (kurz: JSON wird die
Quelle statt ein Export-Ergebnis, und die 47 verknüpften Abbildungen
sollen endlich auch auf dem Desktop erscheinen).

Was für eine Android-Fassung nötig wäre, steht in
[docs/android.md](docs/android.md) (kurz: die Inhalte sind bereits
plattformneutral, die Arbeit steckt im fehlenden mobilen Layout der
Desktop-App).

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

import Testing
@testable import SanWissen

/// Prüft die Rechenlogik der Werkzeuge.
///
/// Dieselben Schwellen gelten in der Desktop-App unter
/// `src/modules/werkzeuge/`. Weicht dort etwas ab, zeigen beide Apps bei
/// gleicher Eingabe Verschiedenes; die Fälle hier sind deshalb bewusst als
/// Tabelle geschrieben, damit sie sich gegen die andere Seite abgleichen
/// lassen.

// MARK: - Glasgow Coma Scale

@Suite("Glasgow Coma Scale")
struct GcsTests {
    @Test("Summe der drei Kategorien")
    func summe() {
        #expect(Gcs.total(eye: 4, verbal: 5, motor: 6) == 15)
        #expect(Gcs.total(eye: 1, verbal: 1, motor: 1) == 3)
    }

    /// Die Grenzen sind das Entscheidende: 13 ist noch leicht, 12 schon
    /// mittelschwer, 9 mittelschwer, 8 schwer.
    @Test("Schweregrad an den Grenzen", arguments: [
        (3, "Schweres SHT"),
        (8, "Schweres SHT"),
        (9, "Mittelschweres SHT"),
        (12, "Mittelschweres SHT"),
        (13, "Leichtes Schädel-Hirn-Trauma (SHT)"),
        (15, "Leichtes Schädel-Hirn-Trauma (SHT)"),
    ])
    func schweregrad(total: Int, erwartet: String) {
        #expect(Gcs.severity(total: total).label == erwartet)
    }

    @Test("Kleinstmöglicher Wert ist 3, nicht 0")
    func minimum() {
        let min = Gcs.eyeRange.lowerBound + Gcs.verbalRange.lowerBound + Gcs.motorRange.lowerBound
        #expect(min == 3)
        let max = Gcs.eyeRange.upperBound + Gcs.verbalRange.upperBound + Gcs.motorRange.upperBound
        #expect(max == 15)
    }
}

// MARK: - APGAR

@Suite("APGAR")
struct ApgarTests {
    private static let kriterien = ["herzfrequenz", "atmung", "grundtonus", "aussehen", "reflexe"]

    @Test("Summe über alle fünf Kriterien")
    func summe() {
        let alleZwei = Dictionary(uniqueKeysWithValues: Self.kriterien.map { ($0, 2) })
        #expect(Apgar.total(alleZwei, criteria: Self.kriterien) == 10)
        #expect(Apgar.total([:], criteria: Self.kriterien) == 0)
    }

    /// Achtung: Die App wertet erst ab 8 als „guter Zustand". Verbreitet ist
    /// 7 bis 10. Der Test hält den tatsächlichen Stand fest, damit eine
    /// spätere Korrektur bewusst geschieht und nicht unbemerkt.
    @Test("Einordnung an den Grenzen", arguments: [
        (0, "Kritisch — sofortige Erstversorgung/Reanimationsbereitschaft"),
        (3, "Kritisch — sofortige Erstversorgung/Reanimationsbereitschaft"),
        (4, "Mäßig deprimiert — engmaschig beobachten"),
        (7, "Mäßig deprimiert — engmaschig beobachten"),
        (8, "Guter Zustand"),
        (10, "Guter Zustand"),
    ])
    func einordnung(total: Int, erwartet: String) {
        #expect(Apgar.interpretation(total: total).label == erwartet)
    }
}

// MARK: - Schmerzskala

@Suite("Schmerzskala (NRS)")
struct PainScaleTests {
    @Test("Bänder", arguments: [
        (0, "Kein Schmerz"),
        (1, "Leichter Schmerz"),
        (3, "Leichter Schmerz"),
        (4, "Mittlerer Schmerz"),
        (6, "Mittlerer Schmerz"),
        (7, "Starker Schmerz"),
        (9, "Starker Schmerz"),
        (10, "Stärkster vorstellbarer Schmerz"),
    ])
    func baender(score: Int, erwartet: String) {
        #expect(PainScale.band(score) == erwartet)
    }

    /// Unter 3 kein Hinweis, ab 3 die schwächeren Mittel, ab 6 die Opioide.
    @Test("Medikamentenhinweis setzt bei 3 und 6 ein")
    func hinweise() {
        #expect(PainScale.medHint(0) == nil)
        #expect(PainScale.medHint(2) == nil)
        #expect(PainScale.medHint(3)?.contains("Ibuprofen") == true)
        #expect(PainScale.medHint(5)?.contains("Ibuprofen") == true)
        #expect(PainScale.medHint(6)?.contains("Morphin") == true)
        #expect(PainScale.medHint(10)?.contains("Morphin") == true)
    }
}

// MARK: - Neuner-Regel

@Suite("Neuner-Regel")
struct BurnAreaTests {
    /// Der eigentliche Sinn der Regel: alle Regionen zusammen ergeben den
    /// ganzen Körper. Ein Tippfehler in einer Prozentzahl fällt hier auf.
    @Test("Alle Regionen ergeben zusammen 100 Prozent", arguments: BurnAgeMode.allCases)
    func summeIstHundert(mode: BurnAgeMode) {
        let summe = BurnArea.regions(mode).reduce(0) { $0 + $1.percent }
        #expect(summe == 100)
    }

    @Test("Kopf ist beim Kind doppelt so groß, Beine kleiner")
    func kindAbweichend() {
        #expect(BurnArea.percent(region: "kopf", mode: .erwachsen) == 9)
        #expect(BurnArea.percent(region: "kopf", mode: .kind) == 18)
        #expect(BurnArea.percent(region: "beinLinks", mode: .erwachsen) == 18)
        #expect(BurnArea.percent(region: "beinLinks", mode: .kind) == 14)
    }

    @Test("Das Kind-Schema kennt keine Genitalregion")
    func kindOhneGenital() {
        #expect(BurnArea.regions(.kind).contains { $0.id == "genital" } == false)
        #expect(BurnArea.regions(.erwachsen).contains { $0.id == "genital" })
    }

    @Test("Ausgewählte Regionen und Handflächen addieren sich")
    func summe() {
        #expect(BurnArea.total(checked: [], handflaechen: 0, mode: .erwachsen) == 0)
        // Ein ganzer Arm plus Rumpf vorne
        #expect(BurnArea.total(checked: ["armLinks", "rumpfVorne"], handflaechen: 0, mode: .erwachsen) == 27)
        // Dazu drei Handflächen, je etwa ein Prozent
        #expect(BurnArea.total(checked: ["armLinks", "rumpfVorne"], handflaechen: 3, mode: .erwachsen) == 30)
        // Unbekannte Regionen zählen nicht mit
        #expect(BurnArea.total(checked: ["gibtesnicht"], handflaechen: 0, mode: .erwachsen) == 0)
    }
}

// MARK: - Verdünnung

@Suite("Verdünnungsrechner")
struct DilutionTests {
    @Test("Komma und Punkt als Dezimaltrennzeichen")
    func parsen() {
        #expect(Dilution.parse("0,01") == 0.01)
        #expect(Dilution.parse("0.01") == 0.01)
        #expect(Dilution.parse("") == nil)
        #expect(Dilution.parse("abc") == nil)
    }

    /// Die beiden Beispiele, die die App selbst anbietet.
    @Test("Epinephrin bei instabiler Bradykardie: 1 auf 0,01 in 100 ml")
    func epinephrin() {
        #expect(Dilution.compute(c1: "1", c2: "0,01", v2: "100")
                == .ok(ausgangsloesung: 1.0, verduennungsmittel: 99.0))
    }

    @Test("Naloxon: 0,4 auf 0,1 in 4 ml")
    func naloxon() {
        #expect(Dilution.compute(c1: "0,4", c2: "0,1", v2: "4")
                == .ok(ausgangsloesung: 1.0, verduennungsmittel: 3.0))
    }

    @Test("Gleiche Konzentration heißt: nichts verdünnen")
    func gleich() {
        #expect(Dilution.compute(c1: "5", c2: "5", v2: "10")
                == .ok(ausgangsloesung: 10.0, verduennungsmittel: 0.0))
    }

    @Test("Höhere Zielkonzentration ist durch Verdünnen nicht erreichbar")
    func nichtErreichbar() {
        #expect(Dilution.compute(c1: "0,1", c2: "1", v2: "10") == .nichtErreichbar)
    }

    @Test("Fehlende oder unsinnige Werte", arguments: [
        ("", "0,01", "100"),
        ("1", "", "100"),
        ("1", "0,01", ""),
        ("0", "0,01", "100"),
        ("1", "0", "100"),
        ("1", "0,01", "0"),
        ("-1", "0,01", "100"),
    ])
    func unvollstaendig(c1: String, c2: String, v2: String) {
        #expect(Dilution.compute(c1: c1, c2: c2, v2: v2) == .unvollstaendig)
    }
}

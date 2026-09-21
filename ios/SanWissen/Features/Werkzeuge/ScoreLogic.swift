import Foundation

/// Die Rechenlogik der Werkzeuge, getrennt von der Darstellung.
///
/// Bis 1.1.0 steckte sie in den SwiftUI-Ansichten und war damit nicht
/// prüfbar. Hier steht sie als reine Funktionen, gegen die
/// `SanWissenTests` rechnet. Dieselben Schwellen gelten in der
/// Desktop-App (`src/modules/werkzeuge/`); die Tests halten beide Seiten
/// auf demselben Stand.

// MARK: - Glasgow Coma Scale

enum Gcs {
    /// Punktebereiche der drei Kategorien nach Teasdale und Jennett.
    static let eyeRange = 1...4
    static let verbalRange = 1...5
    static let motorRange = 1...6

    static func total(eye: Int, verbal: Int, motor: Int) -> Int {
        eye + verbal + motor
    }

    /// Schweregrad des Schädel-Hirn-Traumas. 13–15 leicht, 9–12 mittel,
    /// 3–8 schwer.
    static func severity(total: Int) -> (label: String, tone: ResultTone) {
        if total >= 13 { return ("Leichtes Schädel-Hirn-Trauma (SHT)", .good) }
        if total >= 9 { return ("Mittelschweres SHT", .warn) }
        return ("Schweres SHT", .bad)
    }
}

// MARK: - APGAR

enum Apgar {
    static func total(_ scores: [String: Int], criteria: [String]) -> Int {
        criteria.reduce(0) { $0 + (scores[$1] ?? 0) }
    }

    static func interpretation(total: Int) -> (label: String, tone: ResultTone) {
        if total >= 8 { return ("Guter Zustand", .good) }
        if total >= 4 { return ("Mäßig deprimiert — engmaschig beobachten", .warn) }
        return ("Kritisch — sofortige Erstversorgung/Reanimationsbereitschaft", .bad)
    }
}

// MARK: - Schmerzskala (NRS/VAS)

enum PainScale {
    static func band(_ score: Int) -> String {
        switch score {
        case 0: "Kein Schmerz"
        case 1...3: "Leichter Schmerz"
        case 4...6: "Mittlerer Schmerz"
        case 7...9: "Starker Schmerz"
        default: "Stärkster vorstellbarer Schmerz"
        }
    }

    /// Ab welcher Stärke die SAA/BPR eine Schmerztherapie vorsehen.
    static func medHint(_ score: Int) -> String? {
        if score >= 6 {
            return "Ab NRS ≥ 6 ist laut SAA/BPR z. B. Morphin/Fentanyl/Nalbuphin indiziert (NotSan-Kompetenz, siehe Medikamente)."
        }
        if score >= 3 {
            return "Ab NRS ≥ 3 ist laut SAA/BPR z. B. Ibuprofen/Paracetamol indiziert (NotSan-Kompetenz, siehe Medikamente)."
        }
        return nil
    }
}

// MARK: - Neuner-Regel

enum BurnArea {
    /// Anteil je Körperregion an der Körperoberfläche.
    static func percent(region: String, mode: BurnAgeMode) -> Int {
        regions(mode).first { $0.id == region }?.percent ?? 0
    }

    static func regions(_ mode: BurnAgeMode) -> [BurnRegion] {
        switch mode {
        case .erwachsen:
            [
                BurnRegion(id: "kopf", label: "Kopf/Hals", percent: 9),
                BurnRegion(id: "armLinks", label: "Arm links (ganz)", percent: 9),
                BurnRegion(id: "armRechts", label: "Arm rechts (ganz)", percent: 9),
                BurnRegion(id: "rumpfVorne", label: "Rumpf vorne", percent: 18),
                BurnRegion(id: "rumpfHinten", label: "Rumpf hinten", percent: 18),
                BurnRegion(id: "beinLinks", label: "Bein links (ganz)", percent: 18),
                BurnRegion(id: "beinRechts", label: "Bein rechts (ganz)", percent: 18),
                BurnRegion(id: "genital", label: "Genitalregion", percent: 1),
            ]
        case .kind:
            [
                BurnRegion(id: "kopf", label: "Kopf/Hals (bei Kindern anteilig größer)", percent: 18),
                BurnRegion(id: "armLinks", label: "Arm links (ganz)", percent: 9),
                BurnRegion(id: "armRechts", label: "Arm rechts (ganz)", percent: 9),
                BurnRegion(id: "rumpfVorne", label: "Rumpf vorne", percent: 18),
                BurnRegion(id: "rumpfHinten", label: "Rumpf hinten", percent: 18),
                BurnRegion(id: "beinLinks", label: "Bein links (ganz, bei Kindern anteilig kleiner)", percent: 14),
                BurnRegion(id: "beinRechts", label: "Bein rechts (ganz, bei Kindern anteilig kleiner)", percent: 14),
            ]
        }
    }

    /// Geschätzte verbrannte Körperoberfläche. Die Handfläche der
    /// betroffenen Person entspricht etwa 1 Prozent.
    static func total(checked: Set<String>, handflaechen: Int, mode: BurnAgeMode) -> Int {
        regions(mode).filter { checked.contains($0.id) }.reduce(0) { $0 + $1.percent } + handflaechen
    }
}

enum BurnAgeMode: String, CaseIterable, Identifiable {
    case erwachsen, kind
    var id: String { rawValue }
    var label: String { self == .erwachsen ? "Erwachsene" : "Kind (vereinfacht)" }
}

struct BurnRegion: Identifiable, Hashable {
    let id: String
    let label: String
    let percent: Int
}

// MARK: - Verdünnung

enum Dilution {
    /// Akzeptiert Komma und Punkt als Dezimaltrennzeichen.
    static func parse(_ text: String) -> Double? {
        Double(text.replacingOccurrences(of: ",", with: "."))
    }

    enum Result: Equatable {
        /// Benötigte Menge Ausgangslösung und Verdünnungsmittel in ml.
        case ok(ausgangsloesung: Double, verduennungsmittel: Double)
        /// Zielkonzentration über Ausgangskonzentration: durch Verdünnen
        /// nicht erreichbar.
        case nichtErreichbar
        /// Mindestens ein Wert fehlt oder ist nicht größer als null.
        case unvollstaendig
    }

    /// C1 × V1 = C2 × V2, aufgelöst nach V1.
    static func compute(c1: String, c2: String, v2: String) -> Result {
        guard let c1 = parse(c1), let c2 = parse(c2), let v2 = parse(v2),
              c1 > 0, c2 > 0, v2 > 0 else { return .unvollstaendig }
        guard c2 <= c1 else { return .nichtErreichbar }
        let v1 = (c2 * v2) / c1
        return .ok(ausgangsloesung: v1, verduennungsmittel: v2 - v1)
    }
}

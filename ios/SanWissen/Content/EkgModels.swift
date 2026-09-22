import Foundation

/// Parametrische Beschreibung eines Rhythmus für den Kurvengenerator.
/// Entspricht `RhythmGenSpec` aus src/modules/ekg/types.ts — dort ein
/// diskriminierter Union-Typ über das Feld `kind`.
enum RhythmGenSpec: Hashable {
    case regularNarrow(hr: ClosedRange<Double>, prMs: Double?)
    case sinusArrhythmia(hr: ClosedRange<Double>)
    case irregularNarrowNoP(hr: ClosedRange<Double>)
    case flutter(atrialRate: Double, conduction: Int)
    case regularWide(hr: ClosedRange<Double>)
    case ventricularFlutter(rate: Double)
    case fibrillation(coarse: Bool)
    case flatline
    case avBlock1(hr: ClosedRange<Double>, prMs: Double)
    case avBlock2Wenckebach(atrialRate: Double, prStartMs: Double, prIncrementMs: Double, groupSize: Int)
    case avBlock2Mobitz2(atrialRate: Double, prMs: Double, conduction: Int)
    case avBlock3(atrialRate: Double, ventricularRate: Double, wideEscape: Bool)
    case ectopicBeat(hr: ClosedRange<Double>, every: Int)
    case stElevation(hr: ClosedRange<Double>, elevationMv: Double)
    case stDepression(hr: ClosedRange<Double>, depressionMv: Double)
}

extension RhythmGenSpec: Decodable {
    private enum CodingKeys: String, CodingKey {
        case kind, hr, prMs, atrialRate, conduction, rate, coarse
        case prStartMs, prIncrementMs, groupSize, ventricularRate, wideEscape
        case every, elevationMv, depressionMv
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let kind = try c.decode(String.self, forKey: .kind)

        // `hr` ist im JSON ein Zweier-Array [min, max].
        func hrRange() throws -> ClosedRange<Double> {
            let pair = try c.decode([Double].self, forKey: .hr)
            guard pair.count == 2 else {
                throw DecodingError.dataCorruptedError(forKey: .hr, in: c, debugDescription: "hr braucht genau 2 Werte")
            }
            return pair[0]...max(pair[0], pair[1])
        }

        switch kind {
        case "regular-narrow":
            self = .regularNarrow(hr: try hrRange(), prMs: try c.decodeIfPresent(Double.self, forKey: .prMs))
        case "sinus-arrhythmia":
            self = .sinusArrhythmia(hr: try hrRange())
        case "irregular-narrow-no-p":
            self = .irregularNarrowNoP(hr: try hrRange())
        case "flutter":
            self = .flutter(atrialRate: try c.decode(Double.self, forKey: .atrialRate),
                            conduction: try c.decode(Int.self, forKey: .conduction))
        case "regular-wide":
            self = .regularWide(hr: try hrRange())
        case "ventricular-flutter":
            self = .ventricularFlutter(rate: try c.decode(Double.self, forKey: .rate))
        case "fibrillation":
            self = .fibrillation(coarse: try c.decode(Bool.self, forKey: .coarse))
        case "flatline":
            self = .flatline
        case "av-block-1":
            self = .avBlock1(hr: try hrRange(), prMs: try c.decode(Double.self, forKey: .prMs))
        case "av-block-2-wenckebach":
            self = .avBlock2Wenckebach(
                atrialRate: try c.decode(Double.self, forKey: .atrialRate),
                prStartMs: try c.decode(Double.self, forKey: .prStartMs),
                prIncrementMs: try c.decode(Double.self, forKey: .prIncrementMs),
                groupSize: try c.decode(Int.self, forKey: .groupSize))
        case "av-block-2-mobitz2":
            self = .avBlock2Mobitz2(
                atrialRate: try c.decode(Double.self, forKey: .atrialRate),
                prMs: try c.decode(Double.self, forKey: .prMs),
                conduction: try c.decode(Int.self, forKey: .conduction))
        case "av-block-3":
            self = .avBlock3(
                atrialRate: try c.decode(Double.self, forKey: .atrialRate),
                ventricularRate: try c.decode(Double.self, forKey: .ventricularRate),
                wideEscape: try c.decode(Bool.self, forKey: .wideEscape))
        case "ectopic-beat":
            self = .ectopicBeat(hr: try hrRange(), every: try c.decode(Int.self, forKey: .every))
        case "st-elevation":
            self = .stElevation(hr: try hrRange(), elevationMv: try c.decode(Double.self, forKey: .elevationMv))
        case "st-depression":
            self = .stDepression(hr: try hrRange(), depressionMv: try c.decode(Double.self, forKey: .depressionMv))
        default:
            throw DecodingError.dataCorruptedError(forKey: .kind, in: c, debugDescription: "Unbekannter Rhythmus-Typ \(kind)")
        }
    }
}

struct Rhythm: Decodable, Identifiable, Hashable {
    let id: String
    let nameDe: String
    let nameEn: String
    let category: String
    let difficulty: Int
    /// Ob dieser Rhythmus im Quiz als "am Streifen erkennbar" abgefragt wird.
    let quizEligible: Bool
    let keyFeatures: [String]
    let clinicalNote: String
    let gen: RhythmGenSpec
}

struct EkgRhythmsFile: Decodable {
    let categoryLabels: [String: String]
    let rhythms: [Rhythm]
}

// MARK: - Elektroden

/// Zweidimensionales Trefferfenster: richtiger Interkostalraum (`rowY`) UND
/// richtige vertikale Leitlinie (`colX`) — strenger als ein reiner Radius.
struct ElectrodeHitZone: Decodable, Hashable {
    let rowY: [Double]
    let colX: [Double]

    var yRange: ClosedRange<Double> { rowY[0]...rowY[1] }
    var xRange: ClosedRange<Double> { colX[0]...colX[1] }
}

struct ElectrodePoint: Decodable, Identifiable, Hashable {
    let id: String
    let label: String
    /// Hex-Farbe aus der Desktop-App (Ampelschema der Monitoring-Elektroden).
    let color: String
    let x: Double
    let y: Double
    let description: String
    let hitZone: ElectrodeHitZone?
}

struct ElectrodeViewBox: Decodable, Hashable {
    let w: Double
    let h: Double
}

struct ElectrodeSet: Decodable, Identifiable, Hashable {
    enum BodyType: String, Decodable {
        case full, thorax
    }

    let id: String
    let title: String
    let intro: String
    let points: [ElectrodePoint]
    let bodyType: BodyType
    /// Name eines Bildes im Bundle, das als Körperdarstellung dient. Ist es
    /// nil, zeichnet die App den Körper selbst (siehe `BodyShapes`).
    let imageName: String?
    let viewBox: ElectrodeViewBox
}

struct ElectrodesFile: Decodable {
    let sets: [ElectrodeSet]
}

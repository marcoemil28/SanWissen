import SwiftUI

/// Ein Organsystem des Atlas.
///
/// Namen, Farben und Beschreibungen standen bis 1.2.0 hier im Code, und zwar
/// auf Englisch. Seither stehen sie in `content/atlas-systems.json`, damit
/// beide Apps dieselben lesen und Texte sich ohne Codeänderung anpassen
/// lassen. `scripts/check-content.mjs` prüft, dass die ids zu den Werten des
/// Feldes `system` in der Geometrie passen.
struct AtlasSystem: Decodable, Identifiable, Hashable {
    let id: String
    let name: String
    let hex: String
    let description: String
    /// Abweichende Beschreibung für das weibliche Modell, wo die allgemeine
    /// männlich formuliert ist.
    var femaleDescription: String? = nil
    /// Zu Beginn ausgeblendet: die Körperoberfläche würde alles darunter
    /// verdecken, die Schwangerschaftsstrukturen gehören nicht zur
    /// Standardanatomie.
    var hiddenByDefault: Bool = false

    var color: Color { Color(hex: hex) }

    func description(for sex: AtlasSex) -> String {
        sex == .female ? (femaleDescription ?? description) : description
    }

    /*
     * Eigener Decoder statt des erzeugten: Swift setzt bei einem fehlenden
     * Schlüssel keinen Vorgabewert ein, sondern wirft, sobald das Feld nicht
     * optional ist. `hiddenByDefault` steht aber nur bei den zwei Systemen in
     * der Datei, die es brauchen.
     */
    enum CodingKeys: String, CodingKey {
        case id, name, hex, description, femaleDescription, hiddenByDefault
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        name = try c.decode(String.self, forKey: .name)
        hex = try c.decode(String.self, forKey: .hex)
        description = try c.decode(String.self, forKey: .description)
        femaleDescription = try c.decodeIfPresent(String.self, forKey: .femaleDescription)
        hiddenByDefault = try c.decodeIfPresent(Bool.self, forKey: .hiddenByDefault) ?? false
    }

    /// Ein Reiter über der Systemliste.
    struct Filter: Decodable, Identifiable, Hashable {
        let id: String
        let label: String
        /// Fehlt die Liste, zeigt der Reiter alle Systeme.
        var systems: [String]? = nil

        func matches(_ system: AtlasSystem) -> Bool {
            guard let systems else { return true }
            return systems.contains(system.id)
        }
    }

    private struct File: Decodable {
        let filters: [Filter]
        let systems: [AtlasSystem]
    }

    private static let file: File = {
        guard let url = Bundle.main.url(forResource: "atlas-systems", withExtension: "json") else {
            fatalError("atlas-systems.json fehlt im Bundle — bitte den Kopierschritt prüfen.")
        }
        do {
            return try JSONDecoder().decode(File.self, from: Data(contentsOf: url))
        } catch {
            // Den Grund nennen. Ein blosses „ist beschädigt" kostete beim
            // Umstellen unnötig Zeit, weil die Datei sehr wohl da war.
            fatalError("atlas-systems.json lässt sich nicht lesen: \(error)")
        }
    }()

    static var all: [AtlasSystem] { file.systems }
    static var filters: [Filter] { file.filters }

    static func named(_ id: String) -> AtlasSystem? { all.first { $0.id == id } }

    /// Systeme, die beim Start sichtbar sind.
    static var defaultVisible: Set<String> {
        Set(all.filter { !$0.hiddenByDefault }.map(\.id))
    }
}

/// Welches der beiden Referenzmodelle gezeigt wird.
enum AtlasSex: String, CaseIterable, Identifiable {
    case male, female

    var id: String { rawValue }
    var label: String { self == .male ? "Männlich" : "Weiblich" }

    /// Dateiname der Metadaten im Bundle.
    var manifestName: String { self == .male ? "atlas" : "atlas-female" }
}

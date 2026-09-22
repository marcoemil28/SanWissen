import Foundation

/// Kurze Erklärungen zu einzelnen Strukturen, ergänzend zur Beschreibung des
/// Systems.
///
/// Die Texte standen bis 1.2.0 hier im Code, und zwar auf Englisch. Seither
/// stehen sie in `content/atlas-explanations.json`, damit beide Apps
/// dieselben lesen und sich Texte ohne Codeänderung ändern lassen.
///
/// Die Schlüssel bleiben englisch: verglichen wird mit den Strukturnamen aus
/// `content/atlas/atlas.json`, und die kommen so aus BodyParts3D.
enum AtlasExplanations {
    private struct Entry: Decodable {
        let match: String
        let text: String
    }

    private struct File: Decodable {
        let explanations: [Entry]
    }

    private static let entries: [Entry] = {
        guard let url = Bundle.main.url(forResource: "atlas-explanations", withExtension: "json") else {
            fatalError("atlas-explanations.json fehlt im Bundle — bitte den Kopierschritt prüfen.")
        }
        do {
            return try JSONDecoder().decode(File.self, from: Data(contentsOf: url)).explanations
        } catch {
            fatalError("atlas-explanations.json lässt sich nicht lesen: \(error)")
        }
    }()

    /// Sucht eine Erklärung zum Namen einer Struktur. Verglichen wird auch mit
    /// Teilwörtern, damit etwa „left ovary" die Erklärung zu „ovary" findet.
    static func forStructure(named name: String) -> String? {
        let needle = name.lowercased()
        if let exact = entries.first(where: { $0.match == needle }) { return exact.text }
        return entries.first { needle.contains($0.match) }?.text
    }
}

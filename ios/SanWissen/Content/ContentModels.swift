import Foundation

// MARK: - Modul-Registry

/// Ein Eintrag aus `modules.json` — spiegelt `MODULES` aus der Desktop-App
/// (src/app/registry.tsx). `symbol` ist das SF Symbol, das auf iOS das
/// Emoji-Icon der Desktop-Sidebar ersetzt.
struct ModuleInfo: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let symbol: String
    let category: String
    let pinned: Bool
    let available: Bool
}

struct ModuleRegistry: Codable {
    let categories: [String]
    let modules: [ModuleInfo]
}

// MARK: - Generisches Themenmodul

/// Ein einzelner Merkpunkt bzw. Handlungsschritt.
struct TopicItem: Codable, Hashable {
    let text: String
}

struct TopicSection: Codable, Hashable {
    let heading: String?
    /// ID einer stilisierten Illustration (siehe `IllustrationView`), sonst nil.
    let illustration: String?
    let items: [TopicItem]
}

struct Topic: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let category: String?
    let summary: String
    let page: Int?
    let sourceNote: String?
    let notes: [String]
    let sections: [TopicSection]
}

/// Zehn inhaltlich verschiedene Module teilen sich dasselbe Schema
/// (Themen → Abschnitte → Punkte) und damit auch dieselbe Ansicht.
/// `listStyle` unterscheidet nur die Darstellung.
struct TopicModule: Codable {
    enum ListStyle: String, Codable {
        /// Merkpunkte mit Aufzählungszeichen.
        case facts
        /// Nummerierte Handlungsschritte (Algorithmen, Medikamentenvorbereitung).
        case steps
    }

    let moduleId: String
    let title: String
    let symbol: String
    let listStyle: ListStyle
    let categoryOrder: [String]
    let contentStand: String?
    let topics: [Topic]
}

// MARK: - Medikamente

struct Medikament: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let category: String
    let wirkstoff: String?
    let konzentration: String?
    let arzneimittelgruppe: String?
    /// Allgemeinverständliche Wirkungsbeschreibung — nicht aus dem SAA/BPR-PDF.
    let wirkung: String?
    let indikationen: String?
    let kontraindikationen: String?
    let relativeKontraindikationen: String?
    let altersbegrenzung: String?
    let dosierung: String?
    let uaw: String?
    let ueberdosierung: String?
    let besonderheiten: String?
    let besondereHinweise: String?
    /// Seitenzahl in der Quelle (SAA und BPR 2025), zur Nachvollziehbarkeit.
    let page: Int
}

struct MedikamenteFile: Codable {
    let contentStand: String?
    let categoryOrder: [String]
    let medikamente: [Medikament]
}

// MARK: - Glossar, Checklisten, Cheat-Sheet, Quiz

struct GlossaryEntry: Codable, Identifiable, Hashable {
    let id: String
    let abbr: String
    let meaning: String
    let description: String?
    /// Beim Export aufgelöster „siehe <X>-Modul"-Verweis aus der Beschreibung,
    /// sonst nil. Wird in der Detailansicht zum Sprunglink.
    let moduleId: String?
}

struct ChecklistItem: Codable, Identifiable, Hashable {
    let id: String
    let text: String
}

struct Checklist: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let description: String
    let items: [ChecklistItem]
    let sourceNote: String?
}

struct CheatSheetCard: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    /// Emoji aus der Desktop-App — auf iOS nur als dekorative Kachel-Marke.
    let icon: String
    let points: [String]
    let moduleId: String?
    let itemId: String?
    /// Primärquelle der Kurzfassung. Die ausführliche Darstellung steht im
    /// verlinkten Eintrag.
    let sourceNote: String?
}

struct QuizQuestion: Codable, Identifiable, Hashable {
    let id: String
    let moduleId: String
    let moduleTitle: String
    let icon: String
    let itemId: String?
    let question: String
    let options: [String]
    let correctIndex: Int
    let explanation: String?
}

// MARK: - Fahrplan & Werkzeuge

struct RoadmapEntry: Codable, Hashable, Identifiable {
    let moduleId: String
    let itemId: String?
    let label: String

    var id: String { "\(moduleId):\(itemId ?? "-"):\(label)" }
}

struct RoadmapSection: Codable, Hashable, Identifiable {
    let category: String
    let entries: [RoadmapEntry]

    var id: String { category }
}

struct ToolInfo: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let category: String
    let description: String
    /// Woher die Skala stammt — wird unter dem Rechner angezeigt.
    let sourceNote: String?
}

// MARK: - Meta

/// Formatiert ein ISO-Datum (JJJJ-MM-TT) als deutsches Datum (TT.MM.JJJJ).
///
/// Entsprechung zu `src/app/formatDate.ts` der Desktop-App. Ohne das stand
/// hier das rohe Datum aus dem Export, während der Desktop es umgeschrieben
/// hat: derselbe Inhalt sah je nach App anders aus.
func formatStand(_ isoDate: String) -> String {
    let parts = isoDate.split(separator: "-")
    guard parts.count == 3 else { return isoDate }
    return "\(parts[2]).\(parts[1]).\(parts[0])"
}

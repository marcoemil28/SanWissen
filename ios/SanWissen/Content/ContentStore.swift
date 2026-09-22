import Foundation

/// Lädt die exportierten JSON-Inhalte aus dem App-Bundle.
///
/// Die Dateien entstehen aus den TypeScript-Datenmodulen der Desktop-App
/// (`node scripts/export-ios-content.mjs`) — hier wird nichts inhaltlich
/// ergänzt, nur gelesen. Alles liegt vollständig offline im Bundle.
/// Die Inhalte sind unveränderlich, daher kein `@Observable` — Ansichten
/// lesen direkt von `ContentStore.shared`.
final class ContentStore {
    static let shared = ContentStore()

    let registry: ModuleRegistry
    let topicModules: [String: TopicModule]
    let medikamente: MedikamenteFile
    let rhythms: EkgRhythmsFile
    let electrodeSets: [ElectrodeSet]
    let glossary: [GlossaryEntry]
    let checklists: [Checklist]
    let cheatSheet: [CheatSheetCard]
    let quiz: [QuizQuestion]
    let roadmap: [RoadmapSection]
    let tools: [ToolInfo]
    private let illustrations: [String: String]

    private(set) lazy var searchIndex: [SearchItem] = SearchIndex.build(from: self)

    private init() {
        let decoder = JSONDecoder()

        func load<T: Decodable>(_ name: String, as type: T.Type = T.self) -> T {
            guard let url = Bundle.main.url(forResource: name, withExtension: "json") else {
                fatalError("Inhaltsdatei \(name).json fehlt im Bundle — wurde scripts/export-ios-content.mjs ausgeführt?")
            }
            do {
                return try decoder.decode(T.self, from: Data(contentsOf: url))
            } catch {
                fatalError("Inhaltsdatei \(name).json ist fehlerhaft: \(error)")
            }
        }

        registry = load("modules")
        medikamente = load("medikamente")
        rhythms = load("ekg-rhythms")
        electrodeSets = load("ekg-electrodes", as: ElectrodesFile.self).sets
        glossary = load("glossar", as: GlossaryFile.self).entries
        checklists = load("checklisten", as: ChecklistenFile.self).checklists
        cheatSheet = load("cheatsheet", as: CheatSheetFile.self).cards
        quiz = load("quiz", as: QuizFile.self).questions
        roadmap = load("roadmap", as: RoadmapFile.self).sections
        tools = load("werkzeuge", as: WerkzeugeFile.self).tools
        illustrations = Dictionary(
            uniqueKeysWithValues: load("illustrations", as: IllustrationsFile.self)
                .illustrations.map { ($0.id, $0.caption) })

        var modules: [String: TopicModule] = [:]
        for id in Self.topicModuleIds {
            let module: TopicModule = load("topics-\(id)")
            modules[id] = module
        }
        topicModules = modules
    }

    /// Module, die sich das generische Themen-Schema teilen (siehe TopicModule).
    static let topicModuleIds = [
        "anatomie", "traumatologie", "internistischenotfaelle", "paediatrie",
        "psychiatrienotfaelle", "rettungstechnik", "rechtlichegrundlagen",
        "sanitaetsdienst", "algorithmen", "medikamentenvorbereitung",
    ]

    // MARK: - Nachschlagen

    func module(id: String) -> ModuleInfo? {
        registry.modules.first { $0.id == id }
    }

    func moduleTitle(id: String) -> String {
        module(id: id)?.title ?? id
    }

    func symbol(forModule id: String) -> String {
        module(id: id)?.symbol ?? "square.grid.2x2"
    }

    func topic(moduleId: String, itemId: String) -> Topic? {
        topicModules[moduleId]?.topics.first { $0.id == itemId }
    }

    /// Bildunterschrift zu einer Abbildung, leer wenn keine hinterlegt ist.
    func caption(forIllustration id: String) -> String {
        illustrations[id] ?? ""
    }

    func rhythm(id: String) -> Rhythm? {
        rhythms.rhythms.first { $0.id == id }
    }

    func medikament(id: String) -> Medikament? {
        medikamente.medikamente.first { $0.id == id }
    }

    /// Angepinnte Module in Registry-Reihenfolge (Werkzeuge, Glossar, Quiz, …).
    var pinnedModules: [ModuleInfo] {
        registry.modules.filter { $0.pinned && $0.available }
    }

    /// Alle übrigen Module, nach Themenkategorie gruppiert.
    var groupedModules: [(category: String, modules: [ModuleInfo])] {
        registry.categories.compactMap { category in
            let items = registry.modules.filter { $0.category == category && !$0.pinned && $0.available }
            return items.isEmpty ? nil : (category, items)
        }
    }
}

// MARK: - Datei-Hüllen

private struct GlossaryFile: Decodable { let entries: [GlossaryEntry] }
private struct ChecklistenFile: Decodable { let checklists: [Checklist] }
private struct CheatSheetFile: Decodable { let cards: [CheatSheetCard] }
private struct QuizFile: Decodable { let questions: [QuizQuestion] }
private struct RoadmapFile: Decodable { let sections: [RoadmapSection] }
private struct WerkzeugeFile: Decodable { let tools: [ToolInfo] }
private struct IllustrationsFile: Decodable { let illustrations: [Illustration] }

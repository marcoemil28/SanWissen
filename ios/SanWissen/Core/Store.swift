import Foundation
import SwiftUI

// MARK: - Favoriten

struct FavoriteItem: Codable, Identifiable, Hashable {
    let id: String          // "<moduleId>:<itemId>"
    let moduleId: String
    let itemId: String
    let title: String
    let moduleTitle: String
    let symbol: String

    init(moduleId: String, itemId: String, title: String, moduleTitle: String, symbol: String) {
        self.id = "\(moduleId):\(itemId)"
        self.moduleId = moduleId
        self.itemId = itemId
        self.title = title
        self.moduleTitle = moduleTitle
        self.symbol = symbol
    }
}

/// Favoriten/Lesezeichen — Entsprechung zu src/app/favorites.ts, hier in
/// `UserDefaults` statt `localStorage`. Verlässt das Gerät nie.
@Observable
final class FavoritesStore {
    static let shared = FavoritesStore()
    private static let key = "sanwissen.favorites"

    private(set) var items: [FavoriteItem]

    private init() {
        items = Persistence.decode([FavoriteItem].self, forKey: Self.key) ?? []
    }

    func contains(_ id: String) -> Bool {
        items.contains { $0.id == id }
    }

    func toggle(_ item: FavoriteItem) {
        if contains(item.id) {
            items.removeAll { $0.id == item.id }
        } else {
            items.append(item)
        }
        Persistence.encode(items, forKey: Self.key)
    }

    func remove(id: String) {
        items.removeAll { $0.id == id }
        Persistence.encode(items, forKey: Self.key)
    }
}

// MARK: - Einstellungen

/// Anzeigemodus. Der Hoher-Kontrast-Modus entspricht dem Umschalter der
/// Desktop-App: reines Schwarz, kräftigere Akzente, größere Schrift — gedacht
/// für schlechte Lichtverhältnisse im Dienst.
enum AppearanceMode: String, CaseIterable, Identifiable {
    case system, light, dark, highContrast

    var id: String { rawValue }

    var label: String {
        switch self {
        case .system: "Automatisch"
        case .light: "Hell"
        case .dark: "Dunkel"
        case .highContrast: "Hoher Kontrast"
        }
    }

    var symbol: String {
        switch self {
        case .system: "circle.lefthalf.filled"
        case .light: "sun.max"
        case .dark: "moon"
        case .highContrast: "circle.righthalf.filled.inverse"
        }
    }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: nil
        case .light: .light
        case .dark, .highContrast: .dark
        }
    }

    var isHighContrast: Bool { self == .highContrast }
}

@Observable
final class SettingsStore {
    static let shared = SettingsStore()
    private static let appearanceKey = "sanwissen.appearance"

    var appearance: AppearanceMode {
        didSet { UserDefaults.standard.set(appearance.rawValue, forKey: Self.appearanceKey) }
    }

    private init() {
        let raw = UserDefaults.standard.string(forKey: Self.appearanceKey) ?? ""
        appearance = AppearanceMode(rawValue: raw) ?? .system
    }
}

// MARK: - Checklisten-Haken

/// Abgehakte Punkte je Checkliste. Bleiben bis zum manuellen Zurücksetzen
/// erhalten — die Listen sind auch für den echten Dienst gedacht, nicht nur
/// zum Lernen.
@Observable
final class ChecklistStore {
    static let shared = ChecklistStore()
    private static let key = "sanwissen.checklists"

    private var checked: [String: Set<String>]

    private init() {
        let raw = Persistence.decode([String: [String]].self, forKey: Self.key) ?? [:]
        checked = raw.mapValues(Set.init)
    }

    func isChecked(list: String, item: String) -> Bool {
        checked[list]?.contains(item) ?? false
    }

    func checkedCount(list: String) -> Int {
        checked[list]?.count ?? 0
    }

    func toggle(list: String, item: String) {
        var set = checked[list] ?? []
        if set.contains(item) { set.remove(item) } else { set.insert(item) }
        checked[list] = set
        persist()
    }

    func reset(list: String) {
        checked[list] = []
        persist()
    }

    private func persist() {
        Persistence.encode(checked.mapValues(Array.init), forKey: Self.key)
    }
}

// MARK: - Lernfortschritt

struct AttemptStat: Codable, Hashable {
    var attempts: Int = 0
    var correct: Int = 0
    var lastSeenAt: Date?
    var lastCorrect: Bool?

    var accuracy: Double? {
        attempts > 0 ? Double(correct) / Double(attempts) : nil
    }
}

/// Trefferquote je Rhythmus bzw. je Quizfrage. Speist die gewichtete
/// Wiederholung (siehe `WeightedPicker`) und die Fortschrittsansicht.
@Observable
final class ProgressStore {
    static let ekg = ProgressStore(key: "sanwissen.progress.ekg")
    static let quiz = ProgressStore(key: "sanwissen.progress.quiz")

    private let key: String
    private(set) var stats: [String: AttemptStat]

    private init(key: String) {
        self.key = key
        stats = Persistence.decode([String: AttemptStat].self, forKey: key) ?? [:]
    }

    func stat(for id: String) -> AttemptStat {
        stats[id] ?? AttemptStat()
    }

    func record(id: String, correct: Bool) {
        var stat = stats[id] ?? AttemptStat()
        stat.attempts += 1
        if correct { stat.correct += 1 }
        stat.lastSeenAt = Date()
        stat.lastCorrect = correct
        stats[id] = stat
        Persistence.encode(stats, forKey: key)
    }

    func reset() {
        stats = [:]
        Persistence.encode(stats, forKey: key)
    }

    var totalAttempts: Int { stats.values.reduce(0) { $0 + $1.attempts } }
    var totalCorrect: Int { stats.values.reduce(0) { $0 + $1.correct } }

    var overallAccuracy: Double? {
        totalAttempts > 0 ? Double(totalCorrect) / Double(totalAttempts) : nil
    }
}

// MARK: - Gewichtete Wiederholung

/// Einfache Form von Spaced Repetition: Einträge mit wenig Übung oder
/// niedriger Trefferquote werden häufiger gezogen. Entspricht der Gewichtung
/// aus src/modules/ekg/progress.ts.
enum WeightedPicker {

    static func weight(for stat: AttemptStat) -> Double {
        guard stat.attempts > 0 else { return 3.0 } // noch nie gesehen → hohe Priorität
        let accuracy = Double(stat.correct) / Double(stat.attempts)
        let base = 1.0 + (1.0 - accuracy) * 2.5
        // Wenig Versuche → weiterhin bevorzugen, damit nichts liegen bleibt.
        let practiceBonus = stat.attempts < 3 ? 0.8 : 0
        return base + practiceBonus
    }

    /// Zieht ein Element gewichtet zufällig; `avoiding` verhindert direkte
    /// Wiederholung desselben Eintrags, solange es Alternativen gibt.
    static func pick<T>(from items: [T], id: (T) -> String, progress: ProgressStore, avoiding: String? = nil) -> T? {
        guard !items.isEmpty else { return nil }
        let pool = items.count > 1 ? items.filter { id($0) != avoiding } : items
        let candidates = pool.isEmpty ? items : pool

        let weights = candidates.map { weight(for: progress.stat(for: id($0))) }
        let total = weights.reduce(0, +)
        guard total > 0 else { return candidates.randomElement() }

        var roll = Double.random(in: 0..<total)
        for (item, w) in zip(candidates, weights) {
            roll -= w
            if roll <= 0 { return item }
        }
        return candidates.last
    }
}

// MARK: - App-Infos

/// Version der App, gelesen aus dem Bundle (`MARKETING_VERSION`).
///
/// Stand frueher als `appVersion` in der generierten meta.json und musste
/// deshalb bei jedem Versionssprung neu exportiert werden. Das Bundle ist
/// die richtige Quelle: Xcode fuellt es aus derselben Einstellung, die auch
/// im App Store steht.
enum AppInfo {
    static var version: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "—"
    }
}

// MARK: - Speicher-Helfer

enum Persistence {
    static func encode<T: Encodable>(_ value: T, forKey key: String) {
        guard let data = try? JSONEncoder().encode(value) else { return }
        UserDefaults.standard.set(data, forKey: key)
    }

    static func decode<T: Decodable>(_ type: T.Type, forKey key: String) -> T? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }
}

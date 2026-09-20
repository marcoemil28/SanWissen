import SwiftUI

/// Alle Ziele, die per Navigation erreichbar sind. Ersetzt die
/// Modul-übergreifende Navigations-Anfrage der Desktop-App
/// (src/app/NavigationContext.tsx) durch typisierte Routen.
enum Route: Hashable {
    case module(String)
    case topic(moduleId: String, topicId: String)
    case medikament(String)
    case rhythm(String)
    case tool(String)
    case checklist(String)
    case cheatCard(String)
    case glossarEntry(String)
    /// Der interaktive 3D-Anatomieatlas. Nur auf iOS, die Desktop-App hat ihn nicht.
    case atlas
}

enum AppTab: Hashable {
    case start, module, quiz, suche
}

/// Hält die aktuelle Navigation. Ein einziger Pfad für die Detailspalte
/// (iPad) bzw. den Modul-Tab (iPhone), damit Sprünge aus Suche, Favoriten
/// und Fahrplan überall gleich funktionieren.
@Observable
final class AppRouter {
    var tab: AppTab = .start
    var path: [Route] = []
    /// Auf dem iPad in der Seitenleiste markiertes Modul.
    var sidebarSelection: String?

    /// Springt zu einem Modul und, falls angegeben, direkt zum Eintrag darin.
    func open(moduleId: String, itemId: String? = nil) {
        var routes: [Route] = [.module(moduleId)]
        if let itemId, let detail = Self.detailRoute(moduleId: moduleId, itemId: itemId) {
            routes.append(detail)
        }
        sidebarSelection = moduleId
        tab = moduleId == "quiz" ? .quiz : .module
        path = tab == .quiz ? [] : routes
    }

    func open(_ item: SearchItem) {
        open(moduleId: item.moduleId, itemId: item.itemId)
    }

    func open(_ favorite: FavoriteItem) {
        open(moduleId: favorite.moduleId, itemId: favorite.itemId)
    }

    /// Passende Detailroute für einen Eintrag innerhalb eines Moduls.
    static func detailRoute(moduleId: String, itemId: String) -> Route? {
        switch moduleId {
        case "medikamente": .medikament(itemId)
        case "ekg": .rhythm(itemId)
        case "werkzeuge": .tool(itemId)
        case "checklisten": .checklist(itemId)
        case "cheatsheet": .cheatCard(itemId)
        case "glossar": .glossarEntry(itemId)
        case "quiz": nil
        default: .topic(moduleId: moduleId, topicId: itemId)
        }
    }
}

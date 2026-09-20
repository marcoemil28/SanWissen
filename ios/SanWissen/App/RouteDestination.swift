import SwiftUI

/// Löst eine `Route` in die passende Ansicht auf. Eine Stelle für alle
/// Navigationsziele, damit Suche, Favoriten und Fahrplan überall dieselben
/// Detailansichten erreichen.
struct RouteDestination: View {
    let route: Route

    var body: some View {
        switch route {
        case let .module(id):
            ModuleRootView(moduleId: id)
        case let .topic(moduleId, topicId):
            TopicDetailView(moduleId: moduleId, topicId: topicId)
        case let .medikament(id):
            MedikamentDetailView(id: id)
        case let .rhythm(id):
            RhythmDetailView(id: id)
        case let .tool(id):
            ToolDetailView(id: id)
        case let .checklist(id):
            ChecklistDetailView(id: id)
        case let .cheatCard(id):
            CheatSheetDetailView(id: id)
        case let .glossarEntry(id):
            GlossarDetailView(id: id)
        case .atlas:
            AtlasView()
        }
    }
}

/// Einstiegsansicht eines Moduls — je nach Modul eine Themenliste, ein
/// Nachschlagewerk oder ein Trainer.
struct ModuleRootView: View {
    let moduleId: String

    var body: some View {
        switch moduleId {
        case "ekg": EkgView()
        case "medikamente": MedikamenteView()
        case "werkzeuge": WerkzeugeView()
        case "glossar": GlossarView()
        case "checklisten": ChecklistenView()
        case "cheatsheet": CheatSheetView()
        case "quiz": QuizView()
        default: TopicModuleView(moduleId: moduleId)
        }
    }
}

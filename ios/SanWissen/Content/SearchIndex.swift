import Foundation

/// Ein durchsuchbarer Treffer über alle Module hinweg — Entsprechung zu
/// `SearchItem` aus src/app/searchIndex.ts.
struct SearchItem: Identifiable, Hashable {
    let id: String
    let title: String
    let moduleId: String
    let moduleTitle: String
    let symbol: String
    let itemId: String
    let category: String
    /// Vorberechneter, kleingeschriebener Suchtext.
    let haystack: String
}

enum SearchIndex {

    static func build(from store: ContentStore) -> [SearchItem] {
        let categoryByModule = Dictionary(uniqueKeysWithValues: store.registry.modules.map { ($0.id, $0.category) })

        func make(moduleId: String, itemId: String, title: String, parts: [String?]) -> SearchItem {
            let info = store.module(id: moduleId)
            return SearchItem(
                id: "\(moduleId):\(itemId)",
                title: title,
                moduleId: moduleId,
                moduleTitle: info?.title ?? moduleId,
                symbol: info?.symbol ?? "square.grid.2x2",
                itemId: itemId,
                category: categoryByModule[moduleId] ?? "",
                haystack: parts.compactMap { $0 }.joined(separator: " ").lowercased())
        }

        var items: [SearchItem] = []

        for r in store.rhythms.rhythms {
            items.append(make(moduleId: "ekg", itemId: r.id, title: r.nameDe,
                              parts: [r.nameDe, r.nameEn] + r.keyFeatures))
        }

        for m in store.medikamente.medikamente {
            items.append(make(moduleId: "medikamente", itemId: m.id, title: m.name,
                              parts: [m.name, m.wirkstoff, m.arzneimittelgruppe, m.indikationen, m.wirkung]))
        }

        for (_, module) in store.topicModules {
            for t in module.topics {
                let facts = t.sections.flatMap { $0.items.map(\.text) }
                items.append(make(moduleId: module.moduleId, itemId: t.id, title: t.title,
                                  parts: [t.title, t.summary, t.category] + facts))
            }
        }

        for tool in store.tools {
            items.append(make(moduleId: "werkzeuge", itemId: tool.id, title: tool.title,
                              parts: [tool.title, tool.description, tool.category]))
        }

        for g in store.glossary {
            items.append(make(moduleId: "glossar", itemId: g.id, title: "\(g.abbr) — \(g.meaning)",
                              parts: [g.abbr, g.meaning, g.description]))
        }

        for c in store.checklists {
            items.append(make(moduleId: "checklisten", itemId: c.id, title: c.title,
                              parts: [c.title, c.description] + c.items.map(\.text)))
        }

        for card in store.cheatSheet {
            items.append(make(moduleId: "cheatsheet", itemId: card.id, title: card.title,
                              parts: [card.title] + card.points))
        }

        return items.sorted { $0.title.localizedStandardCompare($1.title) == .orderedAscending }
    }

    /// Sucht über alle Begriffe (UND-Verknüpfung), Treffer im Titel zuerst.
    static func search(_ query: String, in index: [SearchItem], limit: Int = 60) -> [SearchItem] {
        let terms = query.lowercased().split(separator: " ").map(String.init).filter { !$0.isEmpty }
        guard !terms.isEmpty else { return [] }

        let matches = index.filter { item in
            terms.allSatisfy { item.haystack.contains($0) }
        }
        return Array(matches.sorted { a, b in
            let aTitle = terms.allSatisfy { a.title.lowercased().contains($0) }
            let bTitle = terms.allSatisfy { b.title.lowercased().contains($0) }
            if aTitle != bTitle { return aTitle }
            return a.title.localizedStandardCompare(b.title) == .orderedAscending
        }.prefix(limit))
    }
}

import SwiftUI

/// Globale Suche über alle Module — Entsprechung zu src/app/GlobalSearch.tsx.
/// Ein Treffer springt direkt zum Eintrag im jeweiligen Modul.
struct SearchView: View {
    @Environment(AppRouter.self) private var router
    @Environment(\.theme) private var theme
    @State private var query = ""
    private let store = ContentStore.shared

    private var results: [SearchItem] {
        SearchIndex.search(query, in: store.searchIndex)
    }

    var body: some View {
        List {
            if query.isEmpty {
                Section {
                    Text("Durchsucht alle Module gleichzeitig: EKG-Rhythmen, Medikamente, Algorithmen, Anatomie, Traumatologie, Glossar, Checklisten und mehr.")
                        .font(.footnote)
                        .foregroundStyle(theme.secondaryText)
                }
                Section("Inhalt der App") {
                    LabeledContent("Durchsuchbare Einträge", value: "\(store.searchIndex.count)")
                    LabeledContent("Module", value: "\(store.registry.modules.filter(\.available).count)")
                    LabeledContent("Stand der Inhalte",
                                   value: store.medikamente.contentStand.map(formatStand) ?? "—")
                }
            } else if results.isEmpty {
                ContentUnavailableView.search(text: query)
            } else {
                ForEach(groupedResults, id: \.module) { group in
                    Section(group.module) {
                        ForEach(group.items) { item in
                            Button {
                                router.open(item)
                            } label: {
                                HStack {
                                    Label(item.title, systemImage: item.symbol)
                                        .foregroundStyle(theme.primaryText)
                                    Spacer(minLength: 0)
                                    Image(systemName: "chevron.right")
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(theme.secondaryText)
                                }
                                .contentShape(Rectangle())
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
        .searchable(text: $query, placement: .navigationBarDrawer(displayMode: .always), prompt: "Alle Module durchsuchen")
        .navigationTitle("Suche")
        .toolbar { AppearanceMenu() }
    }

    private var groupedResults: [(module: String, items: [SearchItem])] {
        var order: [String] = []
        var byModule: [String: [SearchItem]] = [:]
        for item in results {
            if byModule[item.moduleTitle] == nil { order.append(item.moduleTitle) }
            byModule[item.moduleTitle, default: []].append(item)
        }
        return order.map { ($0, byModule[$0] ?? []) }
    }
}

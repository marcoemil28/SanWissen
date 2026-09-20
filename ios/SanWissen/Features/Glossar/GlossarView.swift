import SwiftUI

/// Abkürzungsverzeichnis mit eigenem Suchfeld.
struct GlossarView: View {
    @State private var query = ""
    private let store = ContentStore.shared

    private var entries: [GlossaryEntry] {
        let q = query.lowercased()
        guard !q.isEmpty else { return store.glossary }
        return store.glossary.filter {
            $0.abbr.lowercased().contains(q)
                || $0.meaning.lowercased().contains(q)
                || ($0.description?.lowercased().contains(q) ?? false)
        }
    }

    var body: some View {
        List(entries) { entry in
            NavigationLink(value: Route.glossarEntry(entry.id)) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.abbr).font(.body.weight(.semibold))
                    Text(entry.meaning)
                        .font(.caption).foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                    if let moduleId = entry.moduleId {
                        Label(store.moduleTitle(id: moduleId), systemImage: "arrow.up.forward")
                            .font(.caption2)
                            .foregroundStyle(.tint)
                    }
                }
            }
        }
        .searchable(text: $query, prompt: "Abkürzung oder Bedeutung")
        .navigationTitle("Glossar")
        .navigationBarTitleDisplayMode(.inline)
        .overlay {
            if entries.isEmpty { ContentUnavailableView.search(text: query) }
        }
    }
}

struct GlossarDetailView: View {
    let id: String
    @Environment(AppRouter.self) private var router
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared

    var body: some View {
        Group {
            if let entry = store.glossary.first(where: { $0.id == id }) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        Text(entry.meaning)
                            .font(.title3.weight(.medium))
                            .foregroundStyle(theme.primaryText)

                        if let description = entry.description {
                            Text(description)
                                .font(.callout)
                                .foregroundStyle(theme.primaryText)
                                .padding(14)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .cardBackground()
                        }

                        // „siehe <X>-Modul" im Text als echter Sprung statt
                        // als bloßer Hinweis zum Selbersuchen.
                        if let moduleId = entry.moduleId {
                            Button {
                                router.open(moduleId: moduleId)
                            } label: {
                                Label("Zum Modul \(store.moduleTitle(id: moduleId))",
                                      systemImage: store.symbol(forModule: moduleId))
                            }
                            .buttonStyle(.borderedProminent)
                        }
                    }
                    .padding()
                }
                .background(theme.pageBackground)
                .navigationTitle(entry.abbr)
                .navigationBarTitleDisplayMode(.inline)
            } else {
                ContentUnavailableView("Eintrag nicht gefunden", systemImage: "character.book.closed")
            }
        }
    }
}

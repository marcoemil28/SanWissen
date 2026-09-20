import SwiftUI

/// Themenliste eines Moduls mit gemeinsamem Datenschema (Anatomie,
/// Traumatologie, Algorithmen, …), gruppiert nach der Kategorie-Reihenfolge
/// aus dem Datenbestand.
struct TopicModuleView: View {
    let moduleId: String
    @State private var query = ""
    private let store = ContentStore.shared

    private var module: TopicModule? { store.topicModules[moduleId] }

    var body: some View {
        Group {
            if let module {
                List {
                    // Der 3D-Atlas gehört zur Anatomie, hat aber eine eigene
                    // Ansicht und steht deshalb vor den Themen.
                    if moduleId == "anatomie" {
                        Section {
                            NavigationLink(value: Route.atlas) {
                                HStack(spacing: 12) {
                                    Image(systemName: "figure.stand")
                                        .font(.title3)
                                        .frame(width: 30)
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text("3D-Atlas").font(.body)
                                        Text("\(AtlasStore.shared.parts.count) Modellteile zum Drehen, Freistellen und Auseinanderziehen")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                            .fixedSize(horizontal: false, vertical: true)
                                    }
                                }
                            }
                        }
                    }

                    if !module.topics.isEmpty {
                        ForEach(groups(in: module), id: \.category) { group in
                            Section(group.category ?? "") {
                                ForEach(group.topics) { topic in
                                    NavigationLink(value: Route.topic(moduleId: moduleId, topicId: topic.id)) {
                                        VStack(alignment: .leading, spacing: 3) {
                                            Text(topic.title).font(.body)
                                            // Vollständig anzeigen: die
                                            // Zusammenfassungen sind kurz, eine
                                            // Kappung mit „…" hilft hier nicht.
                                            Text(topic.summary)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                                .fixedSize(horizontal: false, vertical: true)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if let stand = module.contentStand {
                        Section {
                            Text("Inhalte zuletzt geprüft: \(stand)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .searchable(text: $query, prompt: "In \(module.title) suchen")
                .navigationTitle(module.title)
            } else {
                ContentUnavailableView("Modul nicht gefunden", systemImage: "questionmark.folder")
            }
        }
        .navigationBarTitleDisplayMode(.inline)
    }

    private func groups(in module: TopicModule) -> [(category: String?, topics: [Topic])] {
        let filtered = query.isEmpty ? module.topics : module.topics.filter { topic in
            let q = query.lowercased()
            return topic.title.lowercased().contains(q)
                || topic.summary.lowercased().contains(q)
                || topic.sections.contains { $0.items.contains { $0.text.lowercased().contains(q) } }
        }

        guard !module.categoryOrder.isEmpty else {
            return filtered.isEmpty ? [] : [(nil, filtered)]
        }
        return module.categoryOrder.compactMap { category in
            let topics = filtered.filter { $0.category == category }
            return topics.isEmpty ? nil : (category, topics)
        }
    }
}

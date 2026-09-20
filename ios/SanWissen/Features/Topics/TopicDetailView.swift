import SwiftUI

/// Detailansicht eines Themas: Zusammenfassung, Abschnitte mit Merkpunkten
/// bzw. nummerierten Handlungsschritten, Hinweise und Quellenangabe.
struct TopicDetailView: View {
    let moduleId: String
    let topicId: String
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared

    private var module: TopicModule? { store.topicModules[moduleId] }
    private var topic: Topic? { store.topic(moduleId: moduleId, itemId: topicId) }

    var body: some View {
        Group {
            if let topic, let module {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        Text(topic.summary)
                            .font(.body)
                            .foregroundStyle(theme.primaryText)

                        ForEach(Array(topic.sections.enumerated()), id: \.offset) { _, section in
                            VStack(alignment: .leading, spacing: 10) {
                                if let heading = section.heading {
                                    Text(heading)
                                        .font(.headline)
                                        .foregroundStyle(theme.primaryText)
                                }

                                if let illustration = section.illustration {
                                    IllustrationView(id: illustration)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 4)
                                }

                                ForEach(Array(section.items.enumerated()), id: \.offset) { index, item in
                                    ItemRow(text: item.text,
                                            number: module.listStyle == .steps ? index + 1 : nil)
                                }
                            }
                            .padding(14)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .cardBackground()
                        }

                        if !topic.notes.isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                Label("Hinweise", systemImage: "info.circle")
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundStyle(theme.accent)
                                ForEach(topic.notes, id: \.self) { note in
                                    Text(note)
                                        .font(.footnote)
                                        .foregroundStyle(theme.secondaryText)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                            }
                            .padding(14)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .cardBackground()
                        }

                        if let note = topic.sourceNote {
                            SourceNote(text: note, page: topic.page)
                        } else if let page = topic.page {
                            SourceNote(text: "Quelle: SAA und BPR 2025", page: page)
                        }
                    }
                    .padding()
                }
                .background(theme.pageBackground)
                .navigationTitle(topic.title)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    FavoriteButton(item: FavoriteItem(
                        moduleId: moduleId,
                        itemId: topic.id,
                        title: topic.title,
                        moduleTitle: module.title,
                        symbol: module.symbol))
                }
            } else {
                ContentUnavailableView("Eintrag nicht gefunden", systemImage: "questionmark.circle")
            }
        }
    }
}

/// Ein Merkpunkt (Aufzählungszeichen) bzw. ein nummerierter Handlungsschritt.
struct ItemRow: View {
    @Environment(\.theme) private var theme
    let text: String
    var number: Int?

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 10) {
            if let number {
                Text("\(number)")
                    .font(.caption.weight(.bold).monospacedDigit())
                    .foregroundStyle(theme.accent)
                    .frame(minWidth: 20, alignment: .trailing)
            } else {
                Circle()
                    .fill(theme.accent)
                    .frame(width: 5, height: 5)
                    .offset(y: -3)
            }
            Text(text)
                .font(.callout)
                .foregroundStyle(theme.primaryText)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
    }
}

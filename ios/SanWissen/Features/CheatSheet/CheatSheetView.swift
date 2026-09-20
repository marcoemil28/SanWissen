import SwiftUI

/// Stark verkürzte Merkzettel. Jede Karte verlinkt zurück ins ausführliche
/// Quellmodul; einzelne Karten lassen sich teilen bzw. drucken.
struct CheatSheetView: View {
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared

    private let columns = [GridItem(.adaptive(minimum: 260), spacing: 14)]

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 14) {
                ForEach(store.cheatSheet) { card in
                    NavigationLink(value: Route.cheatCard(card.id)) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(card.title)
                                .font(.headline)
                                .foregroundStyle(theme.primaryText)
                                .multilineTextAlignment(.leading)
                            ForEach(card.points.prefix(4), id: \.self) { point in
                                Text("• " + point)
                                    .font(.caption)
                                    .foregroundStyle(theme.secondaryText)
                                    .fixedSize(horizontal: false, vertical: true)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            if card.points.count > 4 {
                                Text("+ \(card.points.count - 4) weitere")
                                    .font(.caption2)
                                    .foregroundStyle(theme.accent)
                            }
                        }
                        .padding(14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardBackground()
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding()
        }
        .background(theme.pageBackground)
        .navigationTitle("Cheat-Sheet")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct CheatSheetDetailView: View {
    let id: String
    @Environment(AppRouter.self) private var router
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared

    var body: some View {
        Group {
            if let card = store.cheatSheet.first(where: { $0.id == id }) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(Array(card.points.enumerated()), id: \.offset) { index, point in
                            HStack(alignment: .firstTextBaseline, spacing: 12) {
                                Text("\(index + 1)")
                                    .font(.title3.weight(.bold).monospacedDigit())
                                    .foregroundStyle(theme.accent)
                                    .frame(minWidth: 28, alignment: .trailing)
                                Text(point)
                                    .font(.title3)
                                    .foregroundStyle(theme.primaryText)
                                    .fixedSize(horizontal: false, vertical: true)
                                Spacer(minLength: 0)
                            }
                            .padding(14)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .cardBackground()
                        }

                        if let moduleId = card.moduleId {
                            Button {
                                router.open(moduleId: moduleId, itemId: card.itemId)
                            } label: {
                                Label("Mehr Details in \(store.moduleTitle(id: moduleId))",
                                      systemImage: "arrow.forward.circle")
                            }
                            .buttonStyle(.borderedProminent)
                            .padding(.top, 4)
                        }

                        if let note = card.sourceNote {
                            SourceNote(text: note, page: nil)
                        }
                    }
                    .padding()
                }
                .background(theme.pageBackground)
                .navigationTitle(card.title)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ShareLink(item: shareText(card)) {
                        Label("Teilen", systemImage: "square.and.arrow.up")
                    }
                }
            } else {
                ContentUnavailableView("Karte nicht gefunden", systemImage: "note.text")
            }
        }
    }

    private func shareText(_ card: CheatSheetCard) -> String {
        ([card.title] + card.points.map { "• \($0)" }
            + ["", "Aus SanWissen — ersetzt keine offizielle Ausbildung."]).joined(separator: "\n")
    }
}

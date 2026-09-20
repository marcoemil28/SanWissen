import SwiftUI

/// Übersicht der interaktiven Rechner und Score-Referenzen.
struct WerkzeugeView: View {
    private let store = ContentStore.shared

    private var groups: [(category: String, tools: [ToolInfo])] {
        var order: [String] = []
        var byCategory: [String: [ToolInfo]] = [:]
        for tool in store.tools {
            if byCategory[tool.category] == nil { order.append(tool.category) }
            byCategory[tool.category, default: []].append(tool)
        }
        return order.map { ($0, byCategory[$0] ?? []) }
    }

    var body: some View {
        List {
            ForEach(groups, id: \.category) { group in
                Section(group.category) {
                    ForEach(group.tools) { tool in
                        NavigationLink(value: Route.tool(tool.id)) {
                            VStack(alignment: .leading, spacing: 3) {
                                Text(tool.title)
                                Text(tool.description)
                                    .font(.caption).foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("Werkzeuge & Scores")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct ToolDetailView: View {
    let id: String
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared

    var body: some View {
        Group {
            if let tool = store.tools.first(where: { $0.id == id }) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        // Die IDs stammen aus werkzeuge.json (exportiert aus
                        // src/modules/werkzeuge/data.ts) — sie müssen exakt passen.
                        switch id {
                        case "gcs": GcsCalculator()
                        case "schmerzskala": SchmerzSkala()
                        case "apgar": ApgarCalculator()
                        case "neuner-regel": NeunerRegel()
                        case "naca": NacaScore()
                        case "verduennung": VerduennungsRechner()
                        default:
                            ContentUnavailableView("Rechner nicht verfügbar",
                                                   systemImage: "exclamationmark.triangle",
                                                   description: Text("Für „\(tool.title)“ (\(id)) ist keine Ansicht hinterlegt."))
                        }

                        if let note = tool.sourceNote {
                            SourceNote(text: note, page: nil)
                        }
                    }
                    .padding()
                }
                .background(theme.pageBackground)
                .navigationTitle(tool.title)
                .navigationBarTitleDisplayMode(.inline)
            } else {
                ContentUnavailableView("Werkzeug nicht gefunden", systemImage: "function")
            }
        }
    }
}

// MARK: - Gemeinsame Bausteine der Rechner

struct ToolIntro: View {
    @Environment(\.theme) private var theme
    let text: String

    var body: some View {
        Text(text)
            .font(.footnote)
            .foregroundStyle(theme.secondaryText)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// Eine Score-Kategorie mit auswählbaren Antwortmöglichkeiten.
struct ScoreGroup: View {
    @Environment(\.theme) private var theme
    let title: String
    let options: [(score: Int, label: String)]
    @Binding var value: Int?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(theme.primaryText)

            ForEach(options, id: \.score) { option in
                Button {
                    value = option.score
                } label: {
                    HStack(alignment: .firstTextBaseline, spacing: 10) {
                        Text("\(option.score)")
                            .font(.callout.weight(.bold).monospacedDigit())
                            .foregroundStyle(value == option.score ? Color.white : theme.accent)
                            .frame(minWidth: 22)
                        Text(option.label)
                            .font(.callout)
                            .foregroundStyle(value == option.score ? Color.white : theme.primaryText)
                            .multilineTextAlignment(.leading)
                            .fixedSize(horizontal: false, vertical: true)
                        Spacer(minLength: 0)
                    }
                    .padding(10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(value == option.score ? theme.accent : theme.cardBackground,
                                in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
    }
}

enum ResultTone {
    case good, warn, bad, neutral
}

/// Ergebnisfeld am Fuß eines Rechners.
struct ToolResult<Content: View>: View {
    @Environment(\.theme) private var theme
    var tone: ResultTone = .neutral
    var onReset: (() -> Void)?
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            content
            if let onReset {
                Button("Zurücksetzen", systemImage: "arrow.counterclockwise", action: onReset)
                    .buttonStyle(.bordered)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(background, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private var background: Color {
        switch tone {
        case .good: theme.good.opacity(0.18)
        case .warn: Color.orange.opacity(0.18)
        case .bad: theme.bad.opacity(0.18)
        case .neutral: theme.cardBackground
        }
    }
}

struct ResultScore: View {
    @Environment(\.theme) private var theme
    let text: String
    var tone: ResultTone = .neutral

    var body: some View {
        Text(text)
            .font(.title2.weight(.semibold))
            .foregroundStyle(color)
    }

    private var color: Color {
        switch tone {
        case .good: theme.good
        case .warn: .orange
        case .bad: theme.bad
        case .neutral: theme.primaryText
        }
    }
}

/// Querverweis auf ein anderes Modul (z. B. von der Schmerzskala zu den
/// Medikamenten-Schwellenwerten).
struct CrossHint: View {
    @Environment(\.theme) private var theme
    let text: String

    var body: some View {
        Text(text)
            .font(.caption)
            .foregroundStyle(theme.secondaryText)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

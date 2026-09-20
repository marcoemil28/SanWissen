import SwiftUI

/// Startseite: Favoriten, EKG-/Quiz-Fortschritt, Schnellzugriff auf die
/// angepinnten Module, alle Module nach Thema und der kuratierte Fahrplan.
struct HomeView: View {
    @Environment(AppRouter.self) private var router
    @Environment(FavoritesStore.self) private var favorites
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                header

                DisclaimerBox(text: "Jeder Eintrag nennt seine Quelle. Medikamente, Algorithmen und Schemata sind gegen „SAA und BPR 2025\" geprüft, andere Themen stützen sich auf Leitlinien und Ausbildungsunterlagen. Landesspezifisches bezieht sich auf Baden-Württemberg. Trotzdem gilt: vor der Prüfung mit den eigenen Kursunterlagen abgleichen. Grenzwerte, Algorithmen und Zuständigkeiten unterscheiden sich je nach Organisation und Bundesland. Diese App ersetzt keine offizielle Ausbildung.")

                if !favorites.items.isEmpty { favoritesSection }
                progressSection
                quickAccessSection
                modulesSection
                roadmapSection
            }
            .padding()
        }
        .background(theme.pageBackground)
        .navigationTitle("SanWissen")
        .navigationBarTitleDisplayMode(.large)
        .toolbar { AppearanceMenu() }
    }

    // MARK: Abschnitte

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Lern- und Nachschlagewerk für den Sanitäts- und Rettungsdienst")
                .font(.subheadline)
                .foregroundStyle(theme.secondaryText)
            Text("Version \(AppInfo.version) · komplett offline")
                .font(.caption)
                .foregroundStyle(theme.secondaryText)
        }
    }

    private var favoritesSection: some View {
        SectionBox(title: "Deine Favoriten", symbol: "star.fill") {
            ForEach(favorites.items) { fav in
                Button {
                    router.open(fav)
                } label: {
                    RowLabel(symbol: fav.symbol, title: fav.title, subtitle: fav.moduleTitle)
                }
                .buttonStyle(.plain)
            }
        }
    }

    @ViewBuilder
    private var progressSection: some View {
        let ekg = ProgressStore.ekg
        let quiz = ProgressStore.quiz
        if ekg.totalAttempts > 0 || quiz.totalAttempts > 0 {
            SectionBox(title: "Dein Fortschritt", symbol: "chart.bar.fill") {
                HStack(spacing: 12) {
                    if ekg.totalAttempts > 0 {
                        ProgressTile(title: "EKG-Quiz", stat: ekg)
                    }
                    if quiz.totalAttempts > 0 {
                        ProgressTile(title: "Prüfungsquiz", stat: quiz)
                    }
                }
            }
        }
    }

    private var quickAccessSection: some View {
        SectionBox(title: "Schnellzugriff", symbol: "bolt.fill") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
                ForEach(store.pinnedModules) { module in
                    Button {
                        router.open(moduleId: module.id)
                    } label: {
                        VStack(alignment: .leading, spacing: 8) {
                            Image(systemName: module.symbol)
                                .font(.title2)
                                .foregroundStyle(theme.accent)
                            Text(module.title)
                                .font(.callout.weight(.medium))
                                .foregroundStyle(theme.primaryText)
                                .multilineTextAlignment(.leading)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .frame(maxWidth: .infinity, minHeight: 84, alignment: .topLeading)
                        .padding(12)
                        .cardBackground()
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var modulesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            ForEach(store.groupedModules, id: \.category) { group in
                SectionBox(title: group.category, symbol: nil) {
                    ForEach(group.modules) { module in
                        Button {
                            router.open(moduleId: module.id)
                        } label: {
                            RowLabel(symbol: module.symbol, title: module.title, subtitle: nil)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var roadmapSection: some View {
        SectionBox(title: "Dein Fahrplan", symbol: "map.fill") {
            Text("Kuratierte Reihenfolge durch die bestehenden Module — reine Verlinkung, keine eigenen Inhalte.")
                .font(.footnote)
                .foregroundStyle(theme.secondaryText)

            ForEach(store.roadmap) { section in
                DisclosureGroup {
                    ForEach(section.entries) { entry in
                        Button {
                            router.open(moduleId: entry.moduleId, itemId: entry.itemId)
                        } label: {
                            RowLabel(symbol: store.symbol(forModule: entry.moduleId),
                                     title: entry.label,
                                     subtitle: store.moduleTitle(id: entry.moduleId))
                        }
                        .buttonStyle(.plain)
                    }
                } label: {
                    Text(section.category)
                        .font(.callout.weight(.semibold))
                        .foregroundStyle(theme.primaryText)
                }
            }
        }
    }
}

// MARK: - Bausteine

struct SectionBox<Content: View>: View {
    @Environment(\.theme) private var theme
    let title: String
    var symbol: String?
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                if let symbol {
                    Image(systemName: symbol).foregroundStyle(theme.accent)
                }
                Text(title).font(.headline).foregroundStyle(theme.primaryText)
            }
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct RowLabel: View {
    @Environment(\.theme) private var theme
    let symbol: String
    let title: String
    var subtitle: String?

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: symbol)
                .font(.body)
                .foregroundStyle(theme.accent)
                .frame(width: 26)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.body)
                    .foregroundStyle(theme.primaryText)
                    .multilineTextAlignment(.leading)
                if let subtitle {
                    Text(subtitle).font(.caption).foregroundStyle(theme.secondaryText)
                }
            }
            Spacer(minLength: 0)
            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(theme.secondaryText)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .contentShape(Rectangle())
        .cardBackground()
    }
}

private struct ProgressTile: View {
    @Environment(\.theme) private var theme
    let title: String
    let stat: ProgressStore

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.caption).foregroundStyle(theme.secondaryText)
            Text(stat.overallAccuracy.map { "\(Int($0 * 100)) %" } ?? "—")
                .font(.title2.weight(.semibold).monospacedDigit())
                .foregroundStyle(theme.primaryText)
            Text("\(stat.totalCorrect)/\(stat.totalAttempts) richtig")
                .font(.caption2).foregroundStyle(theme.secondaryText)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .cardBackground()
    }
}

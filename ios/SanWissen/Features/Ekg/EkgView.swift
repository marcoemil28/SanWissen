import SwiftUI

/// EKG-Trainer mit vier Bereichen — wie die Tabs der Desktop-App:
/// Lernen, Elektroden legen, Quiz und Fortschritt.
struct EkgView: View {
    private enum Tab: String, CaseIterable, Identifiable {
        case study, electrodes, quiz, progress
        var id: String { rawValue }

        var label: String {
            switch self {
            case .study: "Lernen"
            case .electrodes: "Elektroden"
            case .quiz: "Quiz"
            case .progress: "Fortschritt"
            }
        }
    }

    @State private var tab: Tab = .study
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(spacing: 0) {
            Picker("Bereich", selection: $tab) {
                ForEach(Tab.allCases) { Text($0.label).tag($0) }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            .padding(.bottom, 8)

            switch tab {
            case .study: EkgStudyView()
            case .electrodes: ElectrodesView()
            case .quiz: EkgQuizView()
            case .progress: EkgProgressView()
            }
        }
        .background(theme.pageBackground)
        .navigationTitle("EKG-Trainer")
        .navigationBarTitleDisplayMode(.inline)
    }
}

/// Karteikarten-artige Bibliothek aller Rhythmen, gruppiert nach Kategorie.
struct EkgStudyView: View {
    @State private var query = ""
    private let store = ContentStore.shared

    private var groups: [(category: String, label: String, rhythms: [Rhythm])] {
        let q = query.lowercased()
        let filtered = q.isEmpty ? store.rhythms.rhythms : store.rhythms.rhythms.filter {
            $0.nameDe.lowercased().contains(q) || $0.nameEn.lowercased().contains(q)
                || $0.keyFeatures.contains { $0.lowercased().contains(q) }
        }
        var order: [String] = []
        var byCategory: [String: [Rhythm]] = [:]
        for r in filtered {
            if byCategory[r.category] == nil { order.append(r.category) }
            byCategory[r.category, default: []].append(r)
        }
        return order.map { ($0, store.rhythms.categoryLabels[$0] ?? $0, byCategory[$0] ?? []) }
    }

    var body: some View {
        List {
            ForEach(groups, id: \.category) { group in
                Section(group.label) {
                    ForEach(group.rhythms) { rhythm in
                        NavigationLink(value: Route.rhythm(rhythm.id)) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(rhythm.nameDe)
                                Text(rhythm.nameEn).font(.caption).foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
        }
        .searchable(text: $query, prompt: "Rhythmus suchen")
    }
}

/// Detailkarte eines Rhythmus: generierter Streifen, Merkmale, klinische Relevanz.
struct RhythmDetailView: View {
    let id: String
    @Environment(\.theme) private var theme
    @State private var trace: EcgWaveform.Trace?
    @State private var showAnnotations = true
    private let store = ContentStore.shared

    var body: some View {
        Group {
            if let rhythm = store.rhythm(id: id) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        if let trace {
                            EcgTraceView(trace: trace, height: 200, showAnnotations: showAnnotations)
                        } else {
                            ProgressView().frame(height: 200).frame(maxWidth: .infinity)
                        }

                        HStack {
                            Button("Neue Kurve", systemImage: "arrow.triangle.2.circlepath") {
                                trace = EcgWaveform.generate(rhythm.gen)
                            }
                            .buttonStyle(.bordered)

                            if trace?.annotation != nil {
                                Toggle(isOn: $showAnnotations) {
                                    Label("Beschriftung", systemImage: "textformat.abc")
                                }
                                .toggleStyle(.button)
                                .buttonStyle(.bordered)
                            }
                        }

                        Text(rhythm.nameEn)
                            .font(.subheadline)
                            .foregroundStyle(theme.secondaryText)

                        card(title: "Erkennungsmerkmale", symbol: "eye") {
                            ForEach(rhythm.keyFeatures, id: \.self) { feature in
                                ItemRow(text: feature)
                            }
                        }

                        card(title: "Klinische Relevanz / Vorgehen", symbol: "cross.case") {
                            Text(rhythm.clinicalNote)
                                .font(.callout)
                                .foregroundStyle(theme.primaryText)
                                .fixedSize(horizontal: false, vertical: true)
                        }

                        SourceNote(text: "Die Kurven sind synthetisch erzeugte, stilisierte Annäherungen — keine kalibrierten Patienten-EKGs.")
                    }
                    .padding()
                }
                .background(theme.pageBackground)
                .navigationTitle(rhythm.nameDe)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    FavoriteButton(item: FavoriteItem(
                        moduleId: "ekg", itemId: rhythm.id, title: rhythm.nameDe,
                        moduleTitle: "EKG-Trainer", symbol: store.symbol(forModule: "ekg")))
                }
                .task(id: rhythm.id) {
                    trace = EcgWaveform.generate(rhythm.gen)
                }
            } else {
                ContentUnavailableView("Rhythmus nicht gefunden", systemImage: "waveform.path.ecg")
            }
        }
    }

    @ViewBuilder
    private func card<Content: View>(title: String, symbol: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Label(title, systemImage: symbol)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(theme.accent)
            content()
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
    }
}

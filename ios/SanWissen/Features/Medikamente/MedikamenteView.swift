import SwiftUI

/// Nachschlagewerk der 29 Medikamente aus den SAA/BPR 2025, gruppiert nach
/// Arzneimittelkategorie.
struct MedikamenteView: View {
    @State private var query = ""
    private let store = ContentStore.shared

    var body: some View {
        List {
            Section {
                DisclaimerBox(text: "Die SAA/BPR beschreiben delegierbare Maßnahmen für Notfallsanitäter:innen mit ärztlicher Delegation — nicht den Kompetenzbereich der Rettungssanitäter-Ausbildung. Dieses Modul ist als Nachschlage- und Kontextwissen gedacht.")
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(Color.clear)
            }

            ForEach(groups, id: \.category) { group in
                Section(group.category) {
                    ForEach(group.items) { med in
                        NavigationLink(value: Route.medikament(med.id)) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(med.name)
                                if let wirkstoff = med.wirkstoff, wirkstoff != med.name {
                                    Text(wirkstoff).font(.caption).foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                }
            }

            if let stand = store.medikamente.contentStand {
                Section {
                    Text("Inhalte zuletzt geprüft: \(formatStand(stand))")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
        }
        .searchable(text: $query, prompt: "Medikament, Wirkstoff, Indikation")
        .navigationTitle("Medikamente")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var groups: [(category: String, items: [Medikament])] {
        let q = query.lowercased()
        let filtered = q.isEmpty ? store.medikamente.medikamente : store.medikamente.medikamente.filter { med in
            [med.name, med.wirkstoff, med.arzneimittelgruppe, med.indikationen, med.wirkung]
                .compactMap { $0?.lowercased() }
                .contains { $0.contains(q) }
        }
        return store.medikamente.categoryOrder.compactMap { category in
            let items = filtered.filter { $0.category == category }
            return items.isEmpty ? nil : (category, items)
        }
    }
}

/// Detailansicht eines Medikaments — alle Felder der Quelle plus die kurze,
/// allgemeinverständliche Wirkungsbeschreibung (nicht aus dem PDF).
struct MedikamentDetailView: View {
    let id: String
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared

    var body: some View {
        Group {
            if let med = store.medikament(id: id) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        if let gruppe = med.arzneimittelgruppe {
                            Text(gruppe)
                                .font(.subheadline)
                                .foregroundStyle(theme.accent)
                        }

                        field("Wirkstoff", med.wirkstoff)
                        field("Konzentration", med.konzentration)
                        field("Wirkung", med.wirkung, note: "Allgemeine Pharmakologie, nicht aus der SAA/BPR-Quelle.")
                        field("Indikationen", med.indikationen)
                        field("Kontraindikationen", med.kontraindikationen, tone: .warning)
                        field("Relative Kontraindikationen", med.relativeKontraindikationen, tone: .warning)
                        field("Altersbegrenzung", med.altersbegrenzung)
                        field("Dosierung", med.dosierung, tone: .highlight)
                        field("Unerwünschte Arzneimittelwirkungen", med.uaw)
                        field("Überdosierung", med.ueberdosierung)
                        field("Besonderheiten", med.besonderheiten)
                        field("Besondere Hinweise", med.besondereHinweise)

                        SourceNote(text: "Quelle: SAA und BPR 2025", page: med.page)
                    }
                    .padding()
                }
                .background(theme.pageBackground)
                .navigationTitle(med.name)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    FavoriteButton(item: FavoriteItem(
                        moduleId: "medikamente", itemId: med.id, title: med.name,
                        moduleTitle: "Medikamente (SAA/BPR)", symbol: store.symbol(forModule: "medikamente")))
                }
            } else {
                ContentUnavailableView("Medikament nicht gefunden", systemImage: "pills")
            }
        }
    }

    private enum Tone { case normal, warning, highlight }

    @ViewBuilder
    private func field(_ title: String, _ value: String?, note: String? = nil, tone: Tone = .normal) -> some View {
        if let value, !value.isEmpty {
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 6) {
                    if tone == .warning {
                        Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(theme.bad)
                    }
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(tone == .warning ? theme.bad : theme.accent)
                }
                Text(value)
                    .font(tone == .highlight ? .callout.weight(.medium) : .callout)
                    .foregroundStyle(theme.primaryText)
                    .fixedSize(horizontal: false, vertical: true)
                if let note {
                    Text(note).font(.caption2).foregroundStyle(theme.secondaryText)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardBackground()
        }
    }
}

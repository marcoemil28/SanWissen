import SwiftUI

/// Wer die Fachinhalte gegengelesen hat.
///
/// Bewusst auch ehrlich nach unten: die Ansicht nennt nicht nur, was geprüft
/// wurde, sondern auch, was noch niemand gegengelesen hat. Eine
/// Herkunftsangabe, die nur die geprüften Teile zeigt, erweckt den Eindruck,
/// alles sei geprüft.
///
/// Die Einträge stehen in `content/reviewers.json`, gemeinsam mit der
/// Desktop-App. `scripts/check-content.mjs` prüft, dass die genannten Module
/// wirklich existieren.
struct Reviewer: Decodable, Identifiable {
    let id: String
    let name: String
    let role: String
    var organisation: String?
    let modules: [String]
    let date: String
    var note: String?

    enum CodingKeys: String, CodingKey {
        case id, name, role, organisation, modules, date, note
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        name = try c.decode(String.self, forKey: .name)
        role = try c.decode(String.self, forKey: .role)
        organisation = try c.decodeIfPresent(String.self, forKey: .organisation)
        modules = try c.decode([String].self, forKey: .modules)
        date = try c.decode(String.self, forKey: .date)
        note = try c.decodeIfPresent(String.self, forKey: .note)
    }
}

enum ReviewerStore {
    private struct File: Decodable { let reviewers: [Reviewer] }

    static let all: [Reviewer] = {
        guard let url = Bundle.main.url(forResource: "reviewers", withExtension: "json") else {
            fatalError("reviewers.json fehlt im Bundle — bitte den Kopierschritt prüfen.")
        }
        do {
            return try JSONDecoder().decode(File.self, from: Data(contentsOf: url)).reviewers
        } catch {
            fatalError("reviewers.json lässt sich nicht lesen: \(error)")
        }
    }()
}

struct GeprueftView: View {
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared

    private var reviewers: [Reviewer] { ReviewerStore.all }

    /// Module, zu denen niemand eine Prüfung eingetragen hat.
    private var ungeprueft: [ModuleInfo] {
        if reviewers.contains(where: { $0.modules.contains("alle") }) { return [] }
        let geprueft = Set(reviewers.flatMap(\.modules))
        return store.registry.modules.filter {
            $0.available && $0.id != "geprueft" && !geprueft.contains($0.id)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                DisclaimerBox(text: "Eine Prüfung hier bedeutet: die genannte Person hat die Inhalte der "
                    + "aufgeführten Module fachlich durchgesehen. Sie ersetzt weder die offizielle Ausbildung "
                    + "noch die Dienstanweisung deiner Organisation, und sie macht die App nicht zu einer "
                    + "verbindlichen Quelle. Maßgeblich bleiben die Originaldokumente, die bei jedem Eintrag "
                    + "genannt sind.")

                if reviewers.isEmpty {
                    leererStand
                } else {
                    ForEach(reviewers) { karte(for: $0) }
                }

                if !reviewers.isEmpty, !ungeprueft.isEmpty {
                    SectionBox(title: "Noch nicht gegengelesen", symbol: nil) {
                        Text("Zu diesen Modulen liegt keine Prüfung vor. Das heißt nicht, dass sie falsch "
                            + "sind, sondern dass niemand sie bestätigt hat.")
                            .font(.footnote)
                            .foregroundStyle(theme.secondaryText)
                        ForEach(ungeprueft) { modul in
                            Label(modul.title, systemImage: modul.symbol)
                                .font(.callout)
                                .foregroundStyle(theme.secondaryText)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                    }
                }
            }
            .padding()
        }
        .background(theme.pageBackground)
        .navigationTitle("Geprüft von")
    }

    private var leererStand: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Bisher hat niemand gegengelesen.")
                .font(.headline)
            Text("Die Inhalte stammen aus den bei jedem Eintrag genannten Quellen, vor allem aus den "
                + "Standard-Arbeitsanweisungen und Behandlungspfaden 2025, sind aber noch von keiner "
                + "weiteren Person fachlich geprüft worden. Sobald das geschieht, steht es hier.")
                .font(.footnote)
                .foregroundStyle(theme.secondaryText)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
    }

    private func karte(for person: Reviewer) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(person.name)
                .font(.title3.weight(.semibold))
            Text(person.role)
                .font(.subheadline)
                .foregroundStyle(theme.accent)
            if let organisation = person.organisation {
                Text(organisation)
                    .font(.caption)
                    .foregroundStyle(theme.secondaryText)
            }

            Divider().opacity(0.3).padding(.vertical, 6)

            Text("Geprüft")
                .font(.caption2)
                .foregroundStyle(theme.secondaryText)
            if person.modules.contains("alle") {
                Text("Alle Module").font(.callout.weight(.medium))
            } else {
                ForEach(person.modules, id: \.self) { id in
                    Text(store.moduleTitle(id: id))
                        .font(.callout)
                }
            }

            if let note = person.note {
                Text(note)
                    .font(.footnote)
                    .foregroundStyle(theme.secondaryText)
                    .padding(.top, 6)
            }
            Text("Stand \(formatStand(person.date))")
                .font(.caption2)
                .foregroundStyle(theme.secondaryText)
                .padding(.top, 6)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
    }
}

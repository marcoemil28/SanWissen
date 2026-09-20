import SwiftUI

/// Visuelle Rhythmuserkennung: Streifen zeigen, aus vier Möglichkeiten wählen.
/// Die Auswahl ist gewichtet — Rhythmen mit niedriger Trefferquote kommen
/// häufiger dran (einfache Form von Spaced Repetition).
struct EkgQuizView: View {
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared
    private let progress = ProgressStore.ekg

    @State private var current: Rhythm?
    @State private var options: [Rhythm] = []
    @State private var trace: EcgWaveform.Trace?
    @State private var selected: String?

    private var pool: [Rhythm] {
        store.rhythms.rhythms.filter(\.quizEligible)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if let current, let trace {
                    EcgTraceView(trace: trace)

                    Text("Welcher Rhythmus ist das?")
                        .font(.headline)
                        .foregroundStyle(theme.primaryText)

                    ForEach(options) { option in
                        answerButton(option: option, correctId: current.id)
                    }

                    if selected != nil {
                        feedback(current)
                    }
                } else {
                    ProgressView().frame(maxWidth: .infinity).padding(.top, 40)
                }
            }
            .padding()
        }
        .onAppear { if current == nil { nextQuestion() } }
    }

    private func answerButton(option: Rhythm, correctId: String) -> some View {
        let answered = selected != nil
        let isCorrect = option.id == correctId
        let isChosen = selected == option.id

        return Button {
            guard selected == nil else { return }
            selected = option.id
            progress.record(id: correctId, correct: isCorrect)
        } label: {
            HStack(alignment: .firstTextBaseline, spacing: 10) {
                Image(systemName: answered ? (isCorrect ? "checkmark.circle.fill"
                                                        : (isChosen ? "xmark.circle.fill" : "circle"))
                                           : "circle")
                    .foregroundStyle(answered ? (isCorrect ? theme.good
                                                           : (isChosen ? theme.bad : theme.secondaryText))
                                              : theme.secondaryText)
                Text(option.nameDe)
                    .foregroundStyle(theme.primaryText)
                    .multilineTextAlignment(.leading)
                Spacer(minLength: 0)
            }
            .font(.callout)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(answered && isCorrect ? theme.good.opacity(0.18)
                        : (answered && isChosen ? theme.bad.opacity(0.18) : theme.cardBackground),
                        in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(answered)
    }

    private func feedback(_ rhythm: Rhythm) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Label(selected == rhythm.id ? "Richtig" : "Falsch — \(rhythm.nameDe)",
                  systemImage: selected == rhythm.id ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.headline)
                .foregroundStyle(selected == rhythm.id ? theme.good : theme.bad)

            ForEach(rhythm.keyFeatures, id: \.self) { ItemRow(text: $0) }

            HStack {
                Button("Nächster Streifen", systemImage: "arrow.right") { nextQuestion() }
                    .buttonStyle(.borderedProminent)
                NavigationLink(value: Route.rhythm(rhythm.id)) {
                    Label("Zum Eintrag", systemImage: "arrow.up.forward.square")
                }
                .buttonStyle(.bordered)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
    }

    private func nextQuestion() {
        selected = nil
        guard let next = WeightedPicker.pick(from: pool, id: { $0.id },
                                             progress: progress, avoiding: current?.id) else { return }
        current = next
        trace = EcgWaveform.generate(next.gen)
        // Drei Ablenker, bevorzugt aus derselben Kategorie — sonst wäre die
        // Zuordnung oft schon über die Kategorie zu erraten.
        let sameCategory = pool.filter { $0.id != next.id && $0.category == next.category }.shuffled()
        let others = pool.filter { $0.id != next.id && $0.category != next.category }.shuffled()
        let distractors = Array((sameCategory + others).prefix(3))
        options = ([next] + distractors).shuffled()
    }
}

/// Trefferquote je Rhythmus, lokal gespeichert.
struct EkgProgressView: View {
    @Environment(\.theme) private var theme
    @State private var showResetConfirmation = false
    private let store = ContentStore.shared
    private let progress = ProgressStore.ekg

    private var practiced: [Rhythm] {
        store.rhythms.rhythms
            .filter { progress.stat(for: $0.id).attempts > 0 }
            .sorted { (progress.stat(for: $0.id).accuracy ?? 0) < (progress.stat(for: $1.id).accuracy ?? 0) }
    }

    var body: some View {
        List {
            Section {
                LabeledContent("Versuche", value: "\(progress.totalAttempts)")
                LabeledContent("Richtig", value: "\(progress.totalCorrect)")
                LabeledContent("Trefferquote",
                               value: progress.overallAccuracy.map { "\(Int($0 * 100)) %" } ?? "—")
            }

            if practiced.isEmpty {
                Section {
                    Text("Noch keine Quiz-Versuche. Der Fortschritt wird nur auf diesem Gerät gespeichert.")
                        .font(.footnote).foregroundStyle(theme.secondaryText)
                }
            } else {
                Section("Nach Rhythmus (schwächste zuerst)") {
                    ForEach(practiced) { rhythm in
                        let stat = progress.stat(for: rhythm.id)
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(rhythm.nameDe).font(.callout)
                                Spacer()
                                Text("\(stat.correct)/\(stat.attempts)")
                                    .font(.caption.monospacedDigit())
                                    .foregroundStyle(theme.secondaryText)
                            }
                            ProgressView(value: stat.accuracy ?? 0)
                                .tint((stat.accuracy ?? 0) >= 0.7 ? theme.good : theme.bad)
                        }
                    }
                }
            }

            Section {
                Button("Fortschritt zurücksetzen", systemImage: "arrow.counterclockwise", role: .destructive) {
                    showResetConfirmation = true
                }
            }
        }
        .confirmationDialog("EKG-Fortschritt zurücksetzen?",
                            isPresented: $showResetConfirmation, titleVisibility: .visible) {
            Button("Zurücksetzen", role: .destructive) { progress.reset() }
            Button("Abbrechen", role: .cancel) {}
        }
    }
}

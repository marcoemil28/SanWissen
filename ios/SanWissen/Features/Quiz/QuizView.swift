import SwiftUI

/// Multiple-Choice-Prüfungsvorbereitung über fast alle Themenmodule.
/// Die Auswahl ist gewichtet: Fragen mit wenig Übung oder niedriger
/// Trefferquote erscheinen häufiger (siehe `WeightedPicker`).
struct QuizView: View {
    @Environment(AppRouter.self) private var router
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared
    private let progress = ProgressStore.quiz

    @State private var moduleFilter: String = "alle"
    @State private var current: QuizQuestion?
    @State private var selected: Int?
    @State private var showResetConfirmation = false

    private var pool: [QuizQuestion] {
        moduleFilter == "alle" ? store.quiz : store.quiz.filter { $0.moduleId == moduleFilter }
    }

    private var moduleOptions: [(id: String, title: String)] {
        var seen: [String] = []
        var result: [(String, String)] = [("alle", "Alle Module")]
        for q in store.quiz where !seen.contains(q.moduleId) {
            seen.append(q.moduleId)
            result.append((q.moduleId, q.moduleTitle))
        }
        return result
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Picker("Modul", selection: $moduleFilter) {
                    ForEach(moduleOptions, id: \.id) { option in
                        Text(option.title).tag(option.id)
                    }
                }
                .pickerStyle(.menu)
                .onChange(of: moduleFilter) { _, _ in nextQuestion() }

                statsRow

                if let question = current {
                    questionCard(question)
                } else {
                    ContentUnavailableView("Keine Fragen für diese Auswahl",
                                           systemImage: "questionmark.circle")
                }
            }
            .padding()
        }
        .background(theme.pageBackground)
        .navigationTitle("Prüfungsquiz")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            Menu {
                Button("Fortschritt zurücksetzen", systemImage: "arrow.counterclockwise", role: .destructive) {
                    showResetConfirmation = true
                }
            } label: {
                Label("Mehr", systemImage: "ellipsis.circle")
            }
        }
        .confirmationDialog("Quiz-Fortschritt zurücksetzen?",
                            isPresented: $showResetConfirmation, titleVisibility: .visible) {
            Button("Zurücksetzen", role: .destructive) { progress.reset() }
            Button("Abbrechen", role: .cancel) {}
        }
        .onAppear { if current == nil { nextQuestion() } }
    }

    // MARK: Bausteine

    private var statsRow: some View {
        HStack(spacing: 16) {
            stat("Beantwortet", "\(progress.totalAttempts)")
            stat("Richtig", "\(progress.totalCorrect)")
            stat("Quote", progress.overallAccuracy.map { "\(Int($0 * 100)) %" } ?? "—")
            Spacer(minLength: 0)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
    }

    private func stat(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value).font(.headline.monospacedDigit()).foregroundStyle(theme.primaryText)
            Text(label).font(.caption2).foregroundStyle(theme.secondaryText)
        }
    }

    private func questionCard(_ question: QuizQuestion) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(question.moduleTitle)
                .font(.caption)
                .foregroundStyle(theme.accent)

            Text(question.question)
                .font(.title3.weight(.medium))
                .foregroundStyle(theme.primaryText)
                .fixedSize(horizontal: false, vertical: true)

            ForEach(Array(question.options.enumerated()), id: \.offset) { index, option in
                answerButton(question: question, index: index, text: option)
            }

            if selected != nil {
                feedback(question)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
    }

    private func answerButton(question: QuizQuestion, index: Int, text: String) -> some View {
        let answered = selected != nil
        let isCorrect = index == question.correctIndex
        let isChosen = selected == index

        return Button {
            guard selected == nil else { return }
            selected = index
            progress.record(id: question.id, correct: isCorrect)
        } label: {
            HStack(alignment: .firstTextBaseline, spacing: 10) {
                Image(systemName: symbol(answered: answered, isCorrect: isCorrect, isChosen: isChosen))
                    .foregroundStyle(tint(answered: answered, isCorrect: isCorrect, isChosen: isChosen))
                Text(text)
                    .foregroundStyle(theme.primaryText)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
            }
            .font(.callout)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(background(answered: answered, isCorrect: isCorrect, isChosen: isChosen),
                        in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(answered)
    }

    @ViewBuilder
    private func feedback(_ question: QuizQuestion) -> some View {
        let correct = selected == question.correctIndex

        VStack(alignment: .leading, spacing: 10) {
            Label(correct ? "Richtig" : "Falsch",
                  systemImage: correct ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.headline)
                .foregroundStyle(correct ? theme.good : theme.bad)

            if let explanation = question.explanation {
                Text(explanation)
                    .font(.callout)
                    .foregroundStyle(theme.primaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }

            HStack {
                Button("Nächste Frage", systemImage: "arrow.right") { nextQuestion() }
                    .buttonStyle(.borderedProminent)

                if let itemId = question.itemId {
                    Button("Zum Eintrag", systemImage: "arrow.up.forward.square") {
                        router.open(moduleId: question.moduleId, itemId: itemId)
                    }
                    .buttonStyle(.bordered)
                }
            }
        }
        .padding(.top, 4)
    }

    // MARK: Logik

    private func nextQuestion() {
        selected = nil
        current = WeightedPicker.pick(from: pool, id: { $0.id }, progress: progress, avoiding: current?.id)
    }

    private func symbol(answered: Bool, isCorrect: Bool, isChosen: Bool) -> String {
        guard answered else { return "circle" }
        if isCorrect { return "checkmark.circle.fill" }
        return isChosen ? "xmark.circle.fill" : "circle"
    }

    private func tint(answered: Bool, isCorrect: Bool, isChosen: Bool) -> Color {
        guard answered else { return theme.secondaryText }
        if isCorrect { return theme.good }
        return isChosen ? theme.bad : theme.secondaryText
    }

    private func background(answered: Bool, isCorrect: Bool, isChosen: Bool) -> Color {
        guard answered else { return theme.cardBackground }
        if isCorrect { return theme.good.opacity(0.18) }
        return isChosen ? theme.bad.opacity(0.18) : theme.cardBackground
    }
}

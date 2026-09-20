import SwiftUI

/// Abhakbare Checklisten für den echten Dienst. Haken bleiben bis zum
/// manuellen Zurücksetzen erhalten.
struct ChecklistenView: View {
    @Environment(ChecklistStore.self) private var checklistStore
    private let store = ContentStore.shared

    var body: some View {
        List(store.checklists) { list in
            NavigationLink(value: Route.checklist(list.id)) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(list.title)
                    Text(list.description)
                        .font(.caption).foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                    ProgressView(value: Double(checklistStore.checkedCount(list: list.id)),
                                 total: Double(list.items.count))
                        .tint(.green)
                }
            }
        }
        .navigationTitle("Checklisten")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct ChecklistDetailView: View {
    let id: String
    @Environment(ChecklistStore.self) private var checklistStore
    @Environment(\.theme) private var theme
    @State private var showResetConfirmation = false
    private let store = ContentStore.shared

    var body: some View {
        Group {
            if let list = store.checklists.first(where: { $0.id == id }) {
                List {
                    Section {
                        Text(list.description)
                            .font(.footnote)
                            .foregroundStyle(theme.secondaryText)
                    }

                    Section {
                        ForEach(list.items) { item in
                            let checked = checklistStore.isChecked(list: list.id, item: item.id)
                            Button {
                                checklistStore.toggle(list: list.id, item: item.id)
                            } label: {
                                HStack(alignment: .firstTextBaseline, spacing: 12) {
                                    Image(systemName: checked ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(checked ? theme.good : theme.secondaryText)
                                    Text(item.text)
                                        .foregroundStyle(checked ? theme.secondaryText : theme.primaryText)
                                        .strikethrough(checked, color: theme.secondaryText)
                                        .fixedSize(horizontal: false, vertical: true)
                                    Spacer(minLength: 0)
                                }
                                .contentShape(Rectangle())
                            }
                            .buttonStyle(.plain)
                        }
                    } header: {
                        Text("\(checklistStore.checkedCount(list: list.id)) von \(list.items.count) erledigt")
                    }

                    if let note = list.sourceNote {
                        Section { SourceNote(text: note) }
                    }
                }
                .navigationTitle(list.title)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    Button("Zurücksetzen", systemImage: "arrow.counterclockwise") {
                        showResetConfirmation = true
                    }
                }
                .confirmationDialog("Alle Haken dieser Checkliste entfernen?",
                                    isPresented: $showResetConfirmation, titleVisibility: .visible) {
                    Button("Zurücksetzen", role: .destructive) {
                        checklistStore.reset(list: list.id)
                    }
                    Button("Abbrechen", role: .cancel) {}
                }
            } else {
                ContentUnavailableView("Checkliste nicht gefunden", systemImage: "checklist")
            }
        }
    }
}

import SwiftUI

/// Alle Module, gruppiert wie die Sidebar der Desktop-App: angepinnte oben,
/// darunter die fünf Themenkategorien.
struct ModuleListView: View {
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared

    var body: some View {
        List {
            Section {
                ForEach(store.pinnedModules) { module in
                    NavigationLink(value: Route.module(module.id)) {
                        Label(module.title, systemImage: module.symbol)
                    }
                }
            }

            ForEach(store.groupedModules, id: \.category) { group in
                Section(group.category) {
                    ForEach(group.modules) { module in
                        NavigationLink(value: Route.module(module.id)) {
                            Label(module.title, systemImage: module.symbol)
                        }
                    }
                }
            }
        }
        .navigationTitle("Module")
        .toolbar { AppearanceMenu() }
    }
}

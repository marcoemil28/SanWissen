import SwiftUI

/// Wurzelansicht. Auf dem iPhone eine TabView, auf dem iPad (und im
/// Querformat großer Geräte) eine Seitenleiste mit Detailspalte — das
/// entspricht am ehesten der Sidebar-Struktur der Desktop-App.
struct RootView: View {
    @Environment(\.horizontalSizeClass) private var sizeClass
    @Environment(AppRouter.self) private var router

    var body: some View {
        if sizeClass == .compact {
            CompactRootView()
        } else {
            RegularRootView()
        }
    }
}

// MARK: - iPhone

private struct CompactRootView: View {
    @Environment(AppRouter.self) private var router

    var body: some View {
        @Bindable var router = router

        TabView(selection: $router.tab) {
            NavigationStack {
                HomeView()
            }
            .tabItem { Label("Start", systemImage: "house") }
            .tag(AppTab.start)

            NavigationStack(path: $router.path) {
                ModuleListView()
                    .navigationDestination(for: Route.self) { RouteDestination(route: $0) }
            }
            .tabItem { Label("Module", systemImage: "square.grid.2x2") }
            .tag(AppTab.module)

            NavigationStack {
                QuizView()
            }
            .tabItem { Label("Quiz", systemImage: "questionmark.circle") }
            .tag(AppTab.quiz)

            NavigationStack {
                SearchView()
            }
            .tabItem { Label("Suche", systemImage: "magnifyingglass") }
            .tag(AppTab.suche)
        }
    }
}

// MARK: - iPad

private struct RegularRootView: View {
    @Environment(AppRouter.self) private var router
    @Environment(\.theme) private var theme
    private let store = ContentStore.shared

    var body: some View {
        @Bindable var router = router

        NavigationSplitView {
            List(selection: $router.sidebarSelection) {
                Section {
                    NavigationLink(value: "home") {
                        Label("Startseite", systemImage: "house")
                    }
                    NavigationLink(value: "suche") {
                        Label("Suche", systemImage: "magnifyingglass")
                    }
                }

                Section {
                    ForEach(store.pinnedModules) { module in
                        NavigationLink(value: module.id) {
                            Label(module.title, systemImage: module.symbol)
                        }
                    }
                }

                ForEach(store.groupedModules, id: \.category) { group in
                    Section(group.category) {
                        ForEach(group.modules) { module in
                            NavigationLink(value: module.id) {
                                Label(module.title, systemImage: module.symbol)
                            }
                        }
                    }
                }
            }
            .navigationTitle("SanWissen")
            .toolbar { AppearanceMenu() }
        } detail: {
            NavigationStack(path: $router.path) {
                detailRoot
                    .navigationDestination(for: Route.self) { RouteDestination(route: $0) }
            }
        }
        .onChange(of: router.sidebarSelection) { _, _ in
            router.path = []
        }
    }

    @ViewBuilder
    private var detailRoot: some View {
        switch router.sidebarSelection {
        case nil, "home": HomeView()
        case "suche": SearchView()
        case let id?: ModuleRootView(moduleId: id)
        }
    }
}

// MARK: - Darstellungs-Umschalter

struct AppearanceMenu: View {
    @Environment(SettingsStore.self) private var settings

    var body: some View {
        @Bindable var settings = settings

        Menu {
            Picker("Darstellung", selection: $settings.appearance) {
                ForEach(AppearanceMode.allCases) { mode in
                    Label(mode.label, systemImage: mode.symbol).tag(mode)
                }
            }
            .pickerStyle(.inline)
        } label: {
            Label("Darstellung", systemImage: settings.appearance.symbol)
        }
    }
}

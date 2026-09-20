import SwiftUI

@main
struct SanWissenApp: App {
    @State private var settings = SettingsStore.shared
    @State private var router = AppRouter()
    @State private var favorites = FavoritesStore.shared
    @State private var checklists = ChecklistStore.shared

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(settings)
                .environment(router)
                .environment(favorites)
                .environment(checklists)
                .environment(\.theme, Theme(highContrast: settings.appearance.isHighContrast))
                .preferredColorScheme(settings.appearance.colorScheme)
                .tint(Theme(highContrast: settings.appearance.isHighContrast).accent)
        }
    }
}

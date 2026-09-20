import SwiftUI

/// Stern-Umschalter für Lesezeichen — Entsprechung zum ☆-Button der
/// Desktop-App, hier als Toolbar-Element der Detailansichten.
struct FavoriteButton: View {
    @Environment(FavoritesStore.self) private var favorites
    let item: FavoriteItem

    var body: some View {
        let active = favorites.contains(item.id)
        Button {
            favorites.toggle(item)
        } label: {
            Label(active ? "Aus Favoriten entfernen" : "Zu Favoriten",
                  systemImage: active ? "star.fill" : "star")
        }
        .tint(active ? .yellow : nil)
    }
}

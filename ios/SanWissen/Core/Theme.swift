import SwiftUI

/// Farb- und Abstandswerte der App. Im Normalfall System-Farben (Light und
/// Dark), im Hoher-Kontrast-Modus reines Schwarz mit kräftigeren Akzenten und
/// dickeren Rahmen — wie der Umschalter der Desktop-App.
struct Theme {
    var highContrast: Bool

    var accent: Color {
        highContrast ? Color(red: 0.40, green: 0.76, blue: 1.0) : Color.accentColor
    }

    var pageBackground: Color {
        highContrast ? .black : Color(.systemGroupedBackground)
    }

    var cardBackground: Color {
        highContrast ? Color(white: 0.08) : Color(.secondarySystemGroupedBackground)
    }

    var primaryText: Color {
        highContrast ? .white : .primary
    }

    var secondaryText: Color {
        highContrast ? Color(white: 0.78) : .secondary
    }

    var separator: Color {
        highContrast ? Color(white: 0.45) : Color(.separator)
    }

    var borderWidth: CGFloat { highContrast ? 1.5 : 0 }

    var good: Color { highContrast ? Color(red: 0.35, green: 1.0, blue: 0.55) : .green }
    var bad: Color { highContrast ? Color(red: 1.0, green: 0.42, blue: 0.42) : .red }

    /// Textskalierung im Hoher-Kontrast-Modus (größere Grundschrift).
    var textScale: CGFloat { highContrast ? 1.1 : 1.0 }
}

private struct ThemeKey: EnvironmentKey {
    static let defaultValue = Theme(highContrast: false)
}

extension EnvironmentValues {
    var theme: Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}

/// Karten-Hintergrund, der den Hoher-Kontrast-Modus mitnimmt.
struct CardBackground: ViewModifier {
    @Environment(\.theme) private var theme

    func body(content: Content) -> some View {
        content
            .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay {
                if theme.borderWidth > 0 {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(theme.separator, lineWidth: theme.borderWidth)
                }
            }
    }
}

extension View {
    func cardBackground() -> some View { modifier(CardBackground()) }
}

/// Fachlicher Hinweis, der in der App an mehreren Stellen auftaucht.
struct DisclaimerBox: View {
    @Environment(\.theme) private var theme
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.orange)
            Text(text)
                .font(.footnote)
                .foregroundStyle(theme.secondaryText)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
    }
}

/// Quellen-/Herkunftshinweis unter einem Inhalt.
struct SourceNote: View {
    @Environment(\.theme) private var theme
    let text: String
    var page: Int?

    var body: some View {
        let suffix = page.map { " (Quelle SAA/BPR 2025, S. \($0))" } ?? ""
        Text(text + suffix)
            .font(.caption)
            .foregroundStyle(theme.secondaryText)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

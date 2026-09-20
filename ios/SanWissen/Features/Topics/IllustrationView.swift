import SwiftUI
import UIKit

/// Zeigt die Abbildung zu einem Abschnitt, sofern eine vorliegt.
///
/// Die Bilder liegen als `illu-<id>.jpg` im Bundle, die Bildunterschriften
/// in `content/illustrations.json`; beides teilen sich die Apps. Gibt es zu
/// einer ID kein Bild, wird nichts angezeigt — der Fließtext des Abschnitts
/// steht dann für sich. Bewusst kein gezeichneter Ersatz: lieber gar keine
/// Abbildung als eine, die Lagebeziehungen nur ungefähr trifft.
struct IllustrationView: View {
    let id: String

    var body: some View {
        if let image = BundledImage.load("illu-\(id)") {
            ImageIllustration(image: image, caption: ContentStore.shared.caption(forIllustration: id))
        }
    }
}

/// Zeigt eine Illustration, die als Bild im Bundle liegt.
private struct ImageIllustration: View {
    @Environment(\.theme) private var theme
    let image: UIImage
    let caption: String

    var body: some View {
        VStack(spacing: 8) {
            Image(uiImage: image)
                .resizable()
                .scaledToFit()
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                .accessibilityLabel(caption)

            if !caption.isEmpty {
                Text(caption)
                    .font(.caption2)
                    .italic()
                    .foregroundStyle(theme.secondaryText)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: 520)
    }
}

/// Lädt Bilder aus dem Bundle und hält sie vor. `Canvas` und Listen zeichnen
/// häufig neu — die Datei soll dabei nicht jedes Mal von der Platte kommen.
/// `UIImage(named:)` allein genügt nicht: ohne Endung sucht es nur nach PNG.
enum BundledImage {
    private static var cache: [String: UIImage] = [:]

    static func load(_ name: String) -> UIImage? {
        if let cached = cache[name] { return cached }
        var found = UIImage(named: name)
        if found == nil {
            for ext in ["jpg", "jpeg", "png"] {
                if let url = Bundle.main.url(forResource: name, withExtension: ext),
                   let image = UIImage(contentsOfFile: url.path) {
                    found = image
                    break
                }
            }
        }
        if let found { cache[name] = found }
        return found
    }
}

/// Wandelt die Hex-Farben aus den Elektrodendaten (Ampelschema) in `Color`.
extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var value: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&value)
        let r, g, b: Double
        if cleaned.count == 3 {
            r = Double((value >> 8) & 0xF) / 15
            g = Double((value >> 4) & 0xF) / 15
            b = Double(value & 0xF) / 15
        } else {
            r = Double((value >> 16) & 0xFF) / 255
            g = Double((value >> 8) & 0xFF) / 255
            b = Double(value & 0xFF) / 255
        }
        self.init(red: r, green: g, blue: b)
    }
}

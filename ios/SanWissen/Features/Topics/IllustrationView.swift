import SwiftUI
import UIKit

/// Zeigt die Abbildung zu einem Abschnitt, sofern eine vorliegt.
///
/// Die Bilder liegen als `illu-<id>.jpg` im Bundle und stammen aus der
/// Bildgenerierung. Gibt es zu einer ID kein Bild, wird nichts angezeigt —
/// der Fließtext des Abschnitts steht dann für sich. Bewusst kein
/// gezeichneter Ersatz mehr: lieber gar keine Abbildung als eine, die
/// Lagebeziehungen nur ungefähr trifft.
struct IllustrationView: View {
    let id: String

    var body: some View {
        if let image = BundledImage.load("illu-\(id)") {
            ImageIllustration(image: image, caption: Self.caption(for: id))
        }
    }

    /// Bildunterschriften. Wo eine Abbildung einen fachlichen Punkt nicht
    /// sauber zeigt, trägt die Unterschrift ihn nach.
    private static func caption(for id: String) -> String {
        switch id {
        case "herz-aufbau":
            "Herz im Längsschnitt: Vorhöfe, Kammern, Klappen und große Gefäße"
        case "erregungsleitung":
            "Erregungsleitungssystem — Grundlage für das EKG"
        case "stabile-seitenlage":
            "Stabile Seitenlage — Kopf zusätzlich überstrecken, damit der Mund der tiefste Punkt ist und Erbrochenes ablaufen kann"
        case "guedel-wendl":
            "Guedel-Tubus über die Zunge, Wendl-Tubus durch die Nase — beide enden im Rachen"
        case "tourniquet":
            "Tourniquet körpernah oberhalb der Wunde, nie über einem Gelenk"
        case "wound-packing":
            "Wound Packing: Kompressen Lage für Lage in die Wunde, danach mindestens drei Minuten kräftig draufdrücken"
        case "schienung":
            "Schienung über beide angrenzenden Gelenke, Finger zur DMS-Kontrolle frei"
        case "frakturarten":
            "Offene Fraktur: steril abdecken, nicht reponieren"
        case "oberkoerperhochlagerung":
            "Oberkörperhochlagerung bei Atemnot — der Notfallrucksack stützt Rücken und Kopf"
        case "knierolle":
            "Knierolle: die angewinkelten Beine liegen auf dem Rucksack, das entlastet die Bauchdecke"
        case "schocklage":
            "Schocklage: Beine etwa 30 Grad erhöht, Oberkörper bleibt flach"
        case "sichtungskarte":
            "Anhängekarte für Verletzte und Kranke mit den Sichtungskategorien I bis IV"
        case "druckverband":
            "Druckverband: Wundauflage, Druckpolster, straffe Fixierbinde"
        case "armtragetuch":
            "Armtragetuch aus dem Dreiecktuch"
        case "rautekgriff":
            "Rautek-Rettungsgriff — nie am verletzten Arm greifen"

        // Abbildungen aus den DLRG-Teilnehmerunterlagen Sanitätsausbildung A und B (2021)
        case "kreislauf-schema":
            "Körperkreislauf und Lungenkreislauf als geschlossenes System"
        case "gasaustausch":
            "Atemwege bis zu den Lungenbläschen, in denen der Gasaustausch stattfindet"
        case "lungenvolumina":
            "Atemzugvolumen, Reservevolumina und Vitalkapazität"
        case "schaedelknochen":
            "Knochen des Schädels"
        case "gehirn-aufbau":
            "Großhirn, Kleinhirn, verlängertes Mark und Rückenmark im Längsschnitt"
        case "blutverlust-fraktur":
            "Größenordnung des Blutverlusts je nach gebrochenem Knochen"
        case "pneumothorax":
            "Geschlossener und offener Pneumothorax im Vergleich zum gesunden Thorax"
        case "wirbelsaeulen-fraktur":
            "Wirbelkörperfraktur mit Einengung des Rückenmarks"
        case "beckengurt":
            "Beckenbruchstabilisierungsgurt (T-POD) — stabilisiert das verletzte Becken und begrenzt die innere Blutung"
        case "hws-stuetzkragen":
            "HWS-Stützkragen: Größe ermitteln und einstellen (oben), danach vorformen und anlegen (unten)"
        case "verbrennungsgrade":
            "Verbrennung Grad 1 mit Rötung (links) und Grad 2 mit Blasenbildung (rechts)"
        case "notverband":
            "Notverband: Wundauflage anlegen, Binde in die Druckstange einfädeln, straff in die Gegenrichtung führen"
        case "schaufeltrage":
            "Schaufeltrage — längenverstellbar und seitlich teilbar"
        case "vakuummatratze":
            "Vakuummatratze: erst modellieren, dann Luft absaugen"
        case "sauerstoffmaske":
            "Sauerstoffmaske mit Reservoirbeutel"
        case "beatmungsbeutel-aufbau":
            "Beatmungsbeutel mit Maske und Reservoirbeutel"
        case "beutel-masken-beatmung":
            "C-Griff: Daumen und Zeigefinger halten die Maske, die übrigen Finger ziehen den Unterkiefer an"
        case "wendl-tubus":
            "Wendl-Tubus — wird durch die Nase eingeführt und auch bei erhaltenen Schutzreflexen toleriert"
        case "notfallrucksack":
            "Typisch bestückter Notfallrucksack"
        case "fazialisparese":
            "Halbseitige Gesichtslähmung — hängender Mundwinkel auf der betroffenen Seite"
        case "zentralisation":
            "Zentralisation: der Körper opfert die Peripherie, um Rumpf und Kopf warm zu halten"
        case "giftaufnahmewege":
            "Aufnahmewege von Giften: Atemwege, Verdauungsweg, Haut und direkt in die Blutbahn"
        case "aed-elektroden":
            "Klebeelektroden rechts unterhalb des Schlüsselbeins und links seitlich unter der Achsel"
        case "atemweg-freimachen":
            "Kopf überstrecken und Kinn anheben, danach höchstens 10 Sekunden auf normale Atmung prüfen"
        case "larynxtubus":
            "Aufbau des Larynxtubus mit proximalem und distalem Cuff"
        case "intraossaerer-zugang":
            "Punktionsorte für den intraossären Zugang"
        case "medikamentenschachtel":
            "Angaben auf der Faltschachtel: Bezeichnung, Stärke, Charge und Verfalldatum"
        case "infusionssystem":
            "Infusionssystem mit Tropfkammer und Rollenklemme"
        case "sichtungskategorien":
            "Sichtungskategorien I bis IV mit Behandlungsdringlichkeit"
        case "haendedesinfektion":
            "Die sechs Einreibeschritte der hygienischen Händedesinfektion"
        case "saeugling-puls":
            "Pulskontrolle beim Säugling an der Oberarminnenseite, nicht am Hals"

        default:
            ""
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

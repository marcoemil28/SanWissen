import SwiftUI

/// Ein Organsystem des Atlas. Reihenfolge, Farben und Beschreibungen stammen
/// aus der Vorlage, damit beide Fassungen dasselbe zeigen.
struct AtlasSystem: Identifiable, Hashable {
    let id: String
    let name: String
    let hex: String
    let description: String
    /// Abweichende Beschreibung für das weibliche Modell, wo die der Vorlage
    /// männlich formuliert ist.
    var femaleDescription: String? = nil
    /// Systeme, die zu Beginn ausgeblendet sind: die Körperoberfläche würde
    /// alles darunter verdecken, die Schwangerschaftsstrukturen gehören nicht
    /// zur Standardanatomie.
    var hiddenByDefault: Bool = false

    var color: Color { Color(hex: hex) }

    func description(for sex: AtlasSex) -> String {
        sex == .female ? (femaleDescription ?? description) : description
    }

    static let all: [AtlasSystem] = [
        AtlasSystem(id: "skeletal", name: "Skeleton", hex: "#e2d9ba",
                    description: "Bones form the supporting framework of the body, protect organs, and provide attachment points for muscles. Their internal tissue also stores minerals and produces blood cells.",
                    hiddenByDefault: false),
        AtlasSystem(id: "muscular", name: "Muscles", hex: "#a85b50",
                    description: "Skeletal muscles generate movement by pulling on their attachments. Together with tendons, they move joints, stabilize posture, and produce heat.",
                    hiddenByDefault: false),
        AtlasSystem(id: "cardiac", name: "Heart", hex: "#b96760",
                    description: "The heart is a muscular pump with four chambers. Its valves direct blood forward through the pulmonary and systemic circuits.",
                    hiddenByDefault: false),
        AtlasSystem(id: "sensory", name: "Sensory organs", hex: "#b0c8ce",
                    description: "These structures contribute to special senses, including sight, hearing, and balance. Their specialized tissues detect stimuli and work with the nervous system to convey information.",
                    hiddenByDefault: false),
        AtlasSystem(id: "arterial", name: "Arteries", hex: "#c05245",
                    description: "The heart drives blood through the circulation. Arteries carry blood away from the heart to supply tissues or, in the pulmonary circuit, to the lungs.",
                    hiddenByDefault: false),
        AtlasSystem(id: "venous", name: "Veins", hex: "#527c9f",
                    description: "Veins return blood toward the heart. Superficial and deep networks collect blood from the tissues; the pulmonary veins bring oxygenated blood back from the lungs.",
                    hiddenByDefault: false),
        AtlasSystem(id: "nervous", name: "Nervous system", hex: "#d8b565",
                    description: "The brain, spinal cord, and peripheral nerves carry and process signals. They support sensation, movement, coordination, and automatic regulation of body functions.",
                    hiddenByDefault: false),
        AtlasSystem(id: "respiratory", name: "Respiratory", hex: "#b98991",
                    description: "The airways conduct air to the lungs, where oxygen and carbon dioxide move between air and blood. Breathing depends on pressure changes produced by respiratory muscles.",
                    hiddenByDefault: false),
        AtlasSystem(id: "digestive", name: "Digestive", hex: "#b8916b",
                    description: "The digestive tract breaks down food, absorbs nutrients and water, and moves waste onward. Accessory organs contribute bile and digestive enzymes.",
                    hiddenByDefault: false),
        AtlasSystem(id: "urinary", name: "Urinary", hex: "#b47961",
                    description: "The kidneys filter blood and regulate fluid, electrolyte, and acid–base balance. Urine travels through the ureters to the bladder and exits through the urethra.",
                    hiddenByDefault: false),
        AtlasSystem(id: "lymphatic", name: "Lymphatic", hex: "#879f7c",
                    description: "Lymphatic vessels return excess tissue fluid to the circulation. Lymph nodes and other lymphoid organs support immune surveillance and responses.",
                    hiddenByDefault: false),
        AtlasSystem(id: "endocrine", name: "Endocrine", hex: "#c5a09a",
                    description: "Endocrine organs release hormones into the blood to coordinate processes such as metabolism, growth, stress responses, and reproduction.",
                    hiddenByDefault: false),
        AtlasSystem(id: "reproductive", name: "Reproductive", hex: "#bda098",
                    description: "The male reproductive structures represented here contribute to sperm production, maturation, transport, and the production of sex hormones.",
                    femaleDescription: "The female reproductive structures represented here include the ovaries, uterine tubes, uterus, and vagina. They produce oocytes and sex hormones and support fertilization, implantation, and pregnancy.",
                    hiddenByDefault: false),
        AtlasSystem(id: "integumentary", name: "Body surface", hex: "#ba9b7d",
                    description: "The body surface provides an outer anatomical reference. The integumentary system forms a protective barrier and contributes to sensation and temperature regulation.",
                    hiddenByDefault: true),
        AtlasSystem(id: "pregnancy", name: "Pregnancy reference", hex: "#b88380",
                    description: "The placenta and umbilical cord support exchange between maternal and fetal circulations during pregnancy. These reference structures are shown separately from the default adult anatomy.",
                    hiddenByDefault: true),
        AtlasSystem(id: "connective", name: "Connective tissue", hex: "#aec3bb",
                    description: "Cartilage, ligaments, and other connective tissues support, connect, and separate structures. Their roles include stabilizing joints and distributing mechanical loads.",
                    hiddenByDefault: false),
    ]

    static func named(_ id: String) -> AtlasSystem? { all.first { $0.id == id } }

    /// Systeme, die beim Start sichtbar sind.
    static var defaultVisible: Set<String> {
        Set(all.filter { !$0.hiddenByDefault }.map(\.id))
    }

    /// Die Filterreiter über der Systemliste.
    enum Filter: String, CaseIterable, Identifiable {
        case all = "All"
        case skeleton = "Skeleton"
        case organs = "Organs"

        var id: String { rawValue }

        /// Welche Systeme der Reiter zeigt. „Skeleton" meint den Bewegungsapparat,
        /// „Organs" alles, was in Körperhöhlen liegt oder sie versorgt.
        func matches(_ system: AtlasSystem) -> Bool {
            switch self {
            case .all:
                return true
            case .skeleton:
                return ["skeletal", "muscular", "connective"].contains(system.id)
            case .organs:
                return ["cardiac", "respiratory", "digestive", "urinary", "reproductive",
                        "endocrine", "sensory", "nervous", "lymphatic", "pregnancy"].contains(system.id)
            }
        }
    }
}

/// Welches der beiden Referenzmodelle gezeigt wird.
enum AtlasSex: String, CaseIterable, Identifiable {
    case male, female

    var id: String { rawValue }
    var label: String { self == .male ? "Männlich" : "Weiblich" }

    /// Dateiname der Metadaten im Bundle.
    var manifestName: String { self == .male ? "atlas" : "atlas-female" }
}

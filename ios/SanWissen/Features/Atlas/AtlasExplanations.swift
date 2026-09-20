import Foundation

/// Kurze Erklärungen zu einzelnen Strukturen, ergänzend zur Beschreibung des
/// Systems. Der Schlüssel ist der Name der Struktur in Kleinschreibung.
enum AtlasExplanations {
    static let byName: [String: String] = [
    "uterus": "A hollow muscular organ in the pelvis. Its lining changes through the menstrual cycle and can support implantation and development during pregnancy.",
    "vagina": "A muscular canal connecting the cervix of the uterus to the outside of the body. It provides a passage for menstrual flow and forms part of the birth canal.",
    "ovary": "An organ that contains developing oocytes and produces hormones including estrogen and progesterone.",
    "heart": "A muscular pump in the chest. Its right side sends blood to the lungs; its left side sends blood through the systemic circulation.",
    "liver": "A large organ beneath the right side of the diaphragm. It processes absorbed nutrients, produces bile, and synthesizes many proteins carried in the blood.",
    "brain": "The central organ of the nervous system. Its interconnected regions support perception, movement, memory, language, and the regulation of bodily functions.",
    "stomach": "A muscular chamber between the esophagus and small intestine. It stores and mixes food with acid and enzymes before releasing it into the duodenum.",
    "spleen": "A lymphoid organ in the upper left abdomen. It filters blood, removes aging blood cells, and participates in immune responses.",
    "pancreas": "An abdominal organ with digestive and endocrine roles. It supplies enzymes to the small intestine and releases hormones including insulin and glucagon.",
    "urinary bladder": "A muscular reservoir in the pelvis that stores urine arriving from the kidneys through the ureters.",
    "trachea": "The main airway connecting the larynx to the bronchi. Its cartilage supports keep the airway open during breathing.",
    "diaphragm": "A broad muscle separating the chest and abdomen. When it contracts, it increases chest volume and helps draw air into the lungs.",
    ]

    /// Sucht eine Erklärung zum Namen einer Struktur. Verglichen wird auch mit
    /// Teilwörtern, damit etwa „left ovary" die Erklärung zu „ovary" findet.
    static func forStructure(named name: String) -> String? {
        let needle = name.lowercased()
        if let exact = byName[needle] { return exact }
        return byName.first { needle.contains($0.key) }?.value
    }
}

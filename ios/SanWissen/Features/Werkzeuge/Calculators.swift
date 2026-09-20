import SwiftUI

// MARK: - Glasgow Coma Scale

struct GcsCalculator: View {
    @State private var eye: Int?
    @State private var verbal: Int?
    @State private var motor: Int?

    private static let eyeOptions: [(score: Int, label: String)] = [
        (4, "Spontan"), (3, "Auf Ansprache"), (2, "Auf Schmerzreiz"), (1, "Keine Reaktion"),
    ]
    private static let verbalOptions: [(score: Int, label: String)] = [
        (5, "Orientiert"), (4, "Verwirrt"), (3, "Unzusammenhängende Worte"),
        (2, "Unverständliche Laute"), (1, "Keine Reaktion"),
    ]
    private static let motorOptions: [(score: Int, label: String)] = [
        (6, "Befolgt Aufforderungen"), (5, "Gezielte Schmerzabwehr"),
        (4, "Ungezielte Schmerzabwehr (normale Beugung)"),
        (3, "Abnorme Beugung (Dekortikationshaltung)"),
        (2, "Streckung (Dezerebrationshaltung)"), (1, "Keine Reaktion"),
    ]

    private var complete: Bool { eye != nil && verbal != nil && motor != nil }
    private var total: Int { (eye ?? 0) + (verbal ?? 0) + (motor ?? 0) }

    private var severity: (label: String, tone: ResultTone) {
        if total >= 13 { return ("Leichtes Schädel-Hirn-Trauma (SHT)", .good) }
        if total >= 9 { return ("Mittelschweres SHT", .warn) }
        return ("Schweres SHT", .bad)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            ToolIntro(text: "Glasgow Coma Scale — für jede Kategorie die zutreffende Reaktion wählen. Siehe auch Algorithmen: „Beurteilung der Bewusstseinslage (WASB & GCS)“.")

            ScoreGroup(title: "Augenöffnung (E)", options: Self.eyeOptions, value: $eye)
            ScoreGroup(title: "Verbale Reaktion (V)", options: Self.verbalOptions, value: $verbal)
            ScoreGroup(title: "Motorische Reaktion (M)", options: Self.motorOptions, value: $motor)

            ToolResult(tone: complete ? severity.tone : .neutral, onReset: {
                eye = nil; verbal = nil; motor = nil
            }) {
                if complete {
                    ResultScore(text: "GCS: \(total) / 15 (\(eye!)+\(verbal!)+\(motor!))", tone: severity.tone)
                    Text(severity.label).font(.callout)
                } else {
                    Text("Bitte alle drei Kategorien auswählen.")
                        .font(.callout).foregroundStyle(.secondary)
                }
            }
        }
    }
}

// MARK: - Schmerzskala (NRS/VAS)

struct SchmerzSkala: View {
    @State private var value: Double = 0

    private var score: Int { Int(value.rounded()) }

    private var band: String {
        switch score {
        case 0: "Kein Schmerz"
        case 1...3: "Leichter Schmerz"
        case 4...6: "Mittlerer Schmerz"
        case 7...9: "Starker Schmerz"
        default: "Stärkster vorstellbarer Schmerz"
        }
    }

    private var medHint: String? {
        if score >= 6 {
            return "Ab NRS ≥ 6 ist laut SAA/BPR z. B. Morphin/Fentanyl/Nalbuphin indiziert (NotSan-Kompetenz, siehe Medikamente)."
        }
        if score >= 3 {
            return "Ab NRS ≥ 3 ist laut SAA/BPR z. B. Ibuprofen/Paracetamol indiziert (NotSan-Kompetenz, siehe Medikamente)."
        }
        return nil
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            ToolIntro(text: "Numerische Ratingskala (NRS): Patient:in gibt eine Zahl von 0 (kein Schmerz) bis 10 (stärkster vorstellbarer Schmerz) an. Die Visuelle Analogskala (VAS) funktioniert analog über eine 10-cm-Linie.")

            VStack(spacing: 6) {
                Slider(value: $value, in: 0...10, step: 1) {
                    Text("Schmerzstärke")
                } minimumValueLabel: {
                    Text("0")
                } maximumValueLabel: {
                    Text("10")
                }
                HStack {
                    ForEach(0...10, id: \.self) { i in
                        Text("\(i)")
                            .font(.caption2.monospacedDigit())
                            .foregroundStyle(.secondary)
                            .frame(maxWidth: .infinity)
                    }
                }
            }
            .padding(14)
            .cardBackground()

            ToolResult {
                ResultScore(text: "NRS: \(score) / 10")
                Text(band).font(.callout)
                if let medHint {
                    CrossHint(text: medHint)
                }
            }
        }
    }
}

// MARK: - APGAR

struct ApgarCalculator: View {
    private struct Criterion {
        let key: String
        let title: String
        let options: [(score: Int, label: String)]
    }

    private static let criteria: [Criterion] = [
        Criterion(key: "herzfrequenz", title: "Herzfrequenz (Herzaktion)", options: [
            (0, "Keine"), (1, "< 100/min"), (2, "≥ 100/min"),
        ]),
        Criterion(key: "atmung", title: "Atmung", options: [
            (0, "Keine"), (1, "Unregelmäßig, schwach, Schnappatmung"), (2, "Regelmäßig, kräftig, Schreien"),
        ]),
        Criterion(key: "grundtonus", title: "Grundtonus (Muskeltonus)", options: [
            (0, "Schlaff"), (1, "Leichte Beugung der Extremitäten"), (2, "Aktive Bewegung"),
        ]),
        Criterion(key: "aussehen", title: "Aussehen (Hautkolorit)", options: [
            (0, "Blau oder blass"), (1, "Stamm rosig, Extremitäten blau"), (2, "Komplett rosig"),
        ]),
        Criterion(key: "reflexe", title: "Reflexe (z. B. beim Absaugen)", options: [
            (0, "Keine Reaktion"), (1, "Grimassieren"), (2, "Schreien, Husten, Niesen, Abwehr"),
        ]),
    ]

    @State private var scores: [String: Int] = [:]

    private var complete: Bool { Self.criteria.allSatisfy { scores[$0.key] != nil } }
    private var total: Int { Self.criteria.reduce(0) { $0 + (scores[$1.key] ?? 0) } }

    private var interpretation: (label: String, tone: ResultTone) {
        if total >= 8 { return ("Guter Zustand", .good) }
        if total >= 4 { return ("Mäßig deprimiert — engmaschig beobachten", .warn) }
        return ("Kritisch — sofortige Erstversorgung/Reanimationsbereitschaft", .bad)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            ToolIntro(text: "APGAR-Score zur Beurteilung von Neugeborenen — üblich zu den Zeitpunkten 1, 5 und 10 Minuten nach der Geburt (jeweils neu erheben).")

            ForEach(Self.criteria, id: \.key) { criterion in
                ScoreGroup(title: criterion.title,
                           options: criterion.options,
                           value: Binding(
                            get: { scores[criterion.key] },
                            set: { scores[criterion.key] = $0 }))
            }

            ToolResult(tone: complete ? interpretation.tone : .neutral, onReset: { scores = [:] }) {
                if complete {
                    ResultScore(text: "APGAR: \(total) / 10", tone: interpretation.tone)
                    Text(interpretation.label).font(.callout)
                } else {
                    Text("Bitte alle fünf Kategorien auswählen.")
                        .font(.callout).foregroundStyle(.secondary)
                }
            }
        }
    }
}

// MARK: - Neuner-Regel

struct NeunerRegel: View {
    private enum AgeMode: String, CaseIterable, Identifiable {
        case erwachsen, kind
        var id: String { rawValue }
        var label: String { self == .erwachsen ? "Erwachsene" : "Kind (vereinfacht)" }
    }

    private struct Region: Identifiable {
        let id: String
        let label: String
        let percent: Int
    }

    private static let regions: [AgeMode: [Region]] = [
        .erwachsen: [
            Region(id: "kopf", label: "Kopf/Hals", percent: 9),
            Region(id: "armLinks", label: "Arm links (ganz)", percent: 9),
            Region(id: "armRechts", label: "Arm rechts (ganz)", percent: 9),
            Region(id: "rumpfVorne", label: "Rumpf vorne", percent: 18),
            Region(id: "rumpfHinten", label: "Rumpf hinten", percent: 18),
            Region(id: "beinLinks", label: "Bein links (ganz)", percent: 18),
            Region(id: "beinRechts", label: "Bein rechts (ganz)", percent: 18),
            Region(id: "genital", label: "Genitalregion", percent: 1),
        ],
        .kind: [
            Region(id: "kopf", label: "Kopf/Hals (bei Kindern anteilig größer)", percent: 18),
            Region(id: "armLinks", label: "Arm links (ganz)", percent: 9),
            Region(id: "armRechts", label: "Arm rechts (ganz)", percent: 9),
            Region(id: "rumpfVorne", label: "Rumpf vorne", percent: 18),
            Region(id: "rumpfHinten", label: "Rumpf hinten", percent: 18),
            Region(id: "beinLinks", label: "Bein links (ganz, bei Kindern anteilig kleiner)", percent: 14),
            Region(id: "beinRechts", label: "Bein rechts (ganz, bei Kindern anteilig kleiner)", percent: 14),
        ],
    ]

    @Environment(\.theme) private var theme
    @State private var mode: AgeMode = .erwachsen
    @State private var checked: Set<String> = []
    @State private var handflaechen = 0

    private var regions: [Region] { Self.regions[mode] ?? [] }
    private var total: Int {
        regions.filter { checked.contains($0.id) }.reduce(0) { $0 + $1.percent } + handflaechen
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            ToolIntro(text: "Neuner-Regel (Wallace) zur groben Schätzung der verbrannten Körperoberfläche (VKOF). Bei Kindern sind die Anteile anders verteilt (größerer Kopf, kleinere Beine) — hier vereinfacht dargestellt. Für die genaue pädiatrische Einschätzung gelten altersadaptierte Schemata (z. B. Lund-Browder).")

            Picker("Altersgruppe", selection: $mode) {
                ForEach(AgeMode.allCases) { Text($0.label).tag($0) }
            }
            .pickerStyle(.segmented)
            .onChange(of: mode) { _, _ in checked = [] }

            VStack(alignment: .leading, spacing: 8) {
                Text("Betroffene Körperregionen (ganz)")
                    .font(.subheadline.weight(.semibold))
                ForEach(regions) { region in
                    let on = checked.contains(region.id)
                    Button {
                        if on { checked.remove(region.id) } else { checked.insert(region.id) }
                    } label: {
                        HStack {
                            Image(systemName: on ? "checkmark.square.fill" : "square")
                                .foregroundStyle(on ? theme.accent : theme.secondaryText)
                            Text(region.label)
                                .foregroundStyle(theme.primaryText)
                                .multilineTextAlignment(.leading)
                            Spacer(minLength: 0)
                            Text("\(region.percent) %")
                                .font(.callout.weight(.semibold).monospacedDigit())
                                .foregroundStyle(theme.accent)
                        }
                        .font(.callout)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardBackground()

            VStack(alignment: .leading, spacing: 8) {
                Text("Handflächenregel (für kleine/verstreute Areale)")
                    .font(.subheadline.weight(.semibold))
                Text("Die Handfläche inkl. Finger der/des Patient:in entspricht ca. 1 % KOF.")
                    .font(.footnote).foregroundStyle(theme.secondaryText)
                Stepper("\(handflaechen) Handflächen (~\(handflaechen) %)",
                        value: $handflaechen, in: 0...50)
                    .font(.callout)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardBackground()

            ToolResult(onReset: { checked = []; handflaechen = 0 }) {
                ResultScore(text: "Geschätzte VKOF: \(total) %")
            }
        }
    }
}

// MARK: - NACA-Score

struct NacaScore: View {
    private struct Grade: Identifiable {
        let id: String
        let label: String
    }

    private static let grades: [Grade] = [
        Grade(id: "0", label: "Keine Verletzung/Erkrankung"),
        Grade(id: "I", label: "Geringfügige Störung, keine ärztliche Behandlung notwendig"),
        Grade(id: "II", label: "Ambulante Abklärung/Behandlung notwendig, keine Vitalgefährdung"),
        Grade(id: "III", label: "Stationäre Behandlung erforderlich, keine akute Vitalgefährdung"),
        Grade(id: "IV", label: "Akute Vitalgefährdung nicht auszuschließen"),
        Grade(id: "V", label: "Akute Vitalgefährdung vorhanden (z. B. Schock, Bewusstlosigkeit)"),
        Grade(id: "VI", label: "Reanimation am Einsatzort erforderlich"),
        Grade(id: "VII", label: "Tod (keine Reanimation eingeleitet oder erfolglose Reanimation)"),
    ]

    @Environment(\.theme) private var theme
    @State private var selected: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            ToolIntro(text: "NACA-Score — grobe Einteilung der Einsatzschwere für Dokumentation und Statistik.")

            VStack(spacing: 8) {
                ForEach(Self.grades) { grade in
                    let active = selected == grade.id
                    Button {
                        selected = grade.id
                    } label: {
                        HStack(alignment: .firstTextBaseline, spacing: 12) {
                            Text(grade.id)
                                .font(.callout.weight(.bold))
                                .foregroundStyle(active ? Color.white : theme.accent)
                                .frame(minWidth: 34, alignment: .leading)
                            Text(grade.label)
                                .font(.callout)
                                .foregroundStyle(active ? Color.white : theme.primaryText)
                                .multilineTextAlignment(.leading)
                                .fixedSize(horizontal: false, vertical: true)
                            Spacer(minLength: 0)
                        }
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(active ? theme.accent : theme.cardBackground,
                                    in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                }
            }

            if let selected, let grade = Self.grades.first(where: { $0.id == selected }) {
                ToolResult(onReset: { self.selected = nil }) {
                    ResultScore(text: "NACA \(grade.id)")
                    Text(grade.label).font(.callout)
                }
            }
        }
    }
}

// MARK: - Verdünnungsrechner

struct VerduennungsRechner: View {
    private struct Preset: Identifiable {
        let id: String
        let c1: String
        let c2: String
        let v2: String
    }

    private static let presets: [Preset] = [
        Preset(id: "Epinephrin bei instabiler Bradykardie (SAA)", c1: "1", c2: "0,01", v2: "100"),
        Preset(id: "Naloxon-Verdünnung (Notfallkarte Opioid-Überdosierung)", c1: "0,4", c2: "0,1", v2: "4"),
    ]

    @Environment(\.theme) private var theme
    @State private var c1 = ""
    @State private var c2 = ""
    @State private var v2 = ""

    /// Akzeptiert Komma und Punkt als Dezimaltrennzeichen.
    private func parse(_ text: String) -> Double? {
        Double(text.replacingOccurrences(of: ",", with: "."))
    }

    private var values: (c1: Double, c2: Double, v2: Double)? {
        guard let a = parse(c1), let b = parse(c2), let c = parse(v2),
              a > 0, b > 0, c > 0 else { return nil }
        return (a, b, c)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            ToolIntro(text: "Berechnet, wie viel Ausgangslösung und wie viel Verdünnungsmittel (z. B. NaCl 0,9 %) nötig sind, um aus einer bekannten Ausgangskonzentration eine vorgegebene Zielkonzentration in einem bestimmten Gesamtvolumen herzustellen. Beide Konzentrationen müssen dieselbe Einheit haben (z. B. beide in mg/ml).")

            VStack(alignment: .leading, spacing: 8) {
                Text("Beispiele zum Ausprobieren")
                    .font(.subheadline.weight(.semibold))
                ForEach(Self.presets) { preset in
                    Button(preset.id) {
                        c1 = preset.c1; c2 = preset.c2; v2 = preset.v2
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardBackground()

            VStack(spacing: 10) {
                field("Ausgangskonzentration", text: $c1, placeholder: "z. B. 1")
                field("Zielkonzentration", text: $c2, placeholder: "z. B. 0,01")
                field("Zielgesamtvolumen (ml)", text: $v2, placeholder: "z. B. 100")
            }
            .padding(14)
            .cardBackground()

            result

            CrossHint(text: "Diese Rechenhilfe ersetzt nicht die Vorgabe des eigenen Protokolls (SAA/BPR) — sie hilft nur, eine bereits vorgegebene Zielkonzentration korrekt anzumischen. Ergebnis immer gegenprüfen (Doppelkontrolle, 4-Augen-Prinzip, 6-R-Regel — siehe „Medikamente vorbereiten & sicher verabreichen“).")
        }
    }

    @ViewBuilder
    private var result: some View {
        if let v = values {
            if v.c2 > v.c1 {
                ToolResult(tone: .bad, onReset: reset) {
                    ResultScore(text: "Nicht durch Verdünnung erreichbar", tone: .bad)
                    Text("Die Zielkonzentration ist höher als die Ausgangskonzentration.")
                        .font(.callout)
                }
            } else {
                let v1 = (v.c2 * v.v2) / v.c1
                ToolResult(tone: .good, onReset: reset) {
                    ResultScore(text: String(format: "%.2f ml Ausgangslösung", v1), tone: .good)
                    Text(String(format: "+ %.2f ml Verdünnungsmittel (z. B. NaCl 0,9 %%) = %g ml gesamt",
                                v.v2 - v1, v.v2))
                        .font(.callout)
                }
            }
        } else {
            ToolResult(onReset: reset) {
                Text("Bitte alle drei Werte als Zahl größer 0 eingeben.")
                    .font(.callout).foregroundStyle(.secondary)
            }
        }
    }

    private func field(_ title: String, text: Binding<String>, placeholder: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.caption).foregroundStyle(theme.secondaryText)
            TextField(placeholder, text: text)
                .keyboardType(.decimalPad)
                .textFieldStyle(.roundedBorder)
        }
    }

    private func reset() {
        c1 = ""; c2 = ""; v2 = ""
    }
}

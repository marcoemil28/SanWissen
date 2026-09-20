import SwiftUI

/// Elektroden-Platzierungstrainer: Monitoring-EKG (Ampelschema) am
/// Ganzkörper und 12-Kanal-EKG am gezoomten Brustkorb.
struct ElectrodesView: View {
    @Environment(\.theme) private var theme
    @State private var setIndex = 0
    @State private var mode: Mode = .learn
    private let store = ContentStore.shared

    enum Mode: String, CaseIterable, Identifiable {
        case learn, practice
        var id: String { rawValue }
        var label: String { self == .learn ? "Lernen" : "Üben" }
    }

    private var activeSet: ElectrodeSet? {
        store.electrodeSets.indices.contains(setIndex) ? store.electrodeSets[setIndex] : nil
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                if store.electrodeSets.count > 1 {
                    Picker("Ableitung", selection: $setIndex) {
                        ForEach(Array(store.electrodeSets.enumerated()), id: \.offset) { index, item in
                            Text(item.title).tag(index)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                if let activeSet {
                    Text(activeSet.intro)
                        .font(.footnote)
                        .foregroundStyle(theme.secondaryText)
                        .fixedSize(horizontal: false, vertical: true)

                    Picker("Modus", selection: $mode) {
                        ForEach(Mode.allCases) { Text($0.label).tag($0) }
                    }
                    .pickerStyle(.segmented)

                    // id erzwingt einen frischen Zustand beim Wechsel von Set/Modus.
                    ElectrodeBoard(electrodeSet: activeSet, mode: mode)
                        .id("\(activeSet.id)-\(mode.rawValue)")
                }
            }
            .padding()
        }
    }
}

/// Spielfeld: Körperumriss mit Zielzonen plus Ablage der noch offenen
/// Elektroden. Im Üben-Modus werden die Elektroden aus der Ablage an die
/// richtige Stelle gezogen.
private struct ElectrodeBoard: View {
    let electrodeSet: ElectrodeSet
    let mode: ElectrodesView.Mode

    @Environment(\.theme) private var theme
    /// Wo die Elektrode tatsächlich abgelegt wurde (viewBox-Koordinaten).
    /// Sie bleibt dort kleben — auch wenn die Stelle falsch ist.
    @State private var placements: [String: CGPoint] = [:]
    /// Elektroden, deren Ablageort als richtig gewertet wurde.
    @State private var correct: Set<String> = []
    @State private var attempts = 0
    @State private var dragId: String?
    @State private var dragLocation: CGPoint = .zero
    @State private var boardFrame: CGRect = .zero
    /// In der Ablage ausgewählte Elektrode (Tipp-Variante, siehe `tray`).
    @State private var selectedId: String?

    /// Radius-Toleranz in viewBox-Einheiten. Bewusst großzügig — geprüft wird
    /// die richtige anatomische Region, nicht Pixelgenauigkeit.
    private let radiusTolerance: Double = 46
    /// Zusätzlicher Rand auf die zweidimensionalen Trefferfenster (ICR × Linie).
    private let zoneMargin: Double = 14

    private var openPoints: [ElectrodePoint] {
        electrodeSet.points.filter { placements[$0.id] == nil }
    }

    private var misplaced: [ElectrodePoint] {
        electrodeSet.points.filter { placements[$0.id] != nil && !correct.contains($0.id) }
    }

    private var finished: Bool { correct.count == electrodeSet.points.count }

    var body: some View {
        ZStack(alignment: .topLeading) {
            VStack(alignment: .leading, spacing: 14) {
                board
                if mode == .practice { tray }
                legend
                score
            }

            // Mitgezogene Elektrode folgt dem Finger.
            if let dragId, let point = electrodeSet.points.first(where: { $0.id == dragId }) {
                chip(point)
                    .position(dragLocation)
                    .shadow(radius: 8, y: 4)
                    .allowsHitTesting(false)
            }
        }
        .coordinateSpace(name: "stage")
    }

    // MARK: Körperumriss

    private var board: some View {
        Canvas { context, size in
            let scale = min(size.width / electrodeSet.viewBox.w, size.height / electrodeSet.viewBox.h)
            context.translateBy(x: (size.width - electrodeSet.viewBox.w * scale) / 2,
                                y: (size.height - electrodeSet.viewBox.h * scale) / 2)
            context.scaleBy(x: scale, y: scale)
            var ctx = context

            // Untergrund ist das Körperbild; die Elektrodenkoordinaten sind
            // darauf eingemessen. Ohne Bild bleibt die Fläche leer.
            guard let imageName = electrodeSet.imageName,
                  let uiImage = BundledImage.load(imageName) else { return }
            ctx.draw(Image(uiImage: uiImage),
                     in: CGRect(x: 0, y: 0,
                                width: electrodeSet.viewBox.w,
                                height: electrodeSet.viewBox.h))
            drawPlaced(&ctx)
        }
        .aspectRatio(electrodeSet.viewBox.w / electrodeSet.viewBox.h, contentMode: .fit)
        .background(theme.cardBackground, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .contentShape(Rectangle())
        .onTapGesture(coordinateSpace: .named("stage")) { location in
            // Zweiter Weg zum Platzieren: erst eine Elektrode in der Ablage
            // antippen, dann die Stelle am Körper. Auf dem iPhone passen
            // Körper und Ablage nicht gleichzeitig auf den Schirm, dort wäre
            // reines Ziehen kaum benutzbar.
            guard mode == .practice else { return }
            if let id = selectedId, let point = electrodeSet.points.first(where: { $0.id == id }) {
                place(point, at: location)
            } else if let point = misplacedPoint(near: location) {
                // Falsch geklebte Elektrode wieder abnehmen und neu ansetzen.
                placements[point.id] = nil
                selectedId = point.id
            }
        }
        .background {
            GeometryReader { proxy in
                Color.clear
                    .onAppear { boardFrame = proxy.frame(in: .named("stage")) }
                    .onChange(of: proxy.frame(in: .named("stage"))) { _, new in boardFrame = new }
            }
        }
    }

    private func drawPlaced(_ ctx: inout GraphicsContext) {
        if mode == .learn {
            for point in electrodeSet.points {
                drawElectrode(&ctx, point, at: CGPoint(x: point.x, y: point.y), state: .reference)
            }
            return
        }
        for point in electrodeSet.points {
            guard let position = placements[point.id] else { continue }
            drawElectrode(&ctx, point, at: position,
                          state: correct.contains(point.id) ? .correct : .wrong)
        }
    }

    private enum ElectrodeState { case reference, correct, wrong }

    private func drawElectrode(_ ctx: inout GraphicsContext, _ point: ElectrodePoint,
                               at position: CGPoint, state: ElectrodeState) {
        let rect = CGRect(x: position.x - 13, y: position.y - 13, width: 26, height: 26)
        ctx.fill(Path(ellipseIn: rect), with: .color(Color(hex: point.color)))
        ctx.stroke(Path(ellipseIn: rect), with: .color(.black), lineWidth: 1.5)

        switch state {
        case .reference:
            break
        case .correct:
            let ring = rect.insetBy(dx: -7, dy: -7)
            ctx.stroke(Path(ellipseIn: ring), with: .color(theme.good), lineWidth: 3)
        case .wrong:
            // Bleibt kleben, ist aber sichtbar als falsch markiert.
            let ring = rect.insetBy(dx: -7, dy: -7)
            ctx.stroke(Path(ellipseIn: ring), with: .color(theme.bad),
                       style: StrokeStyle(lineWidth: 3, dash: [5, 4]))
        }

        // Beschriftung nach außen setzen, damit sich Nachbarn nicht überlappen.
        let toRight = position.x >= electrodeSet.viewBox.w / 2
        let text = ctx.resolve(Text(point.label).font(.system(size: 14, weight: .semibold))
            .foregroundStyle(theme.primaryText))
        ctx.draw(text,
                 at: CGPoint(x: position.x + (toRight ? 22 : -22), y: position.y),
                 anchor: toRight ? .leading : .trailing)
    }

    // MARK: Ablage

    private var tray: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(selectedId == nil
                 ? "Elektrode antippen und dann die Stelle am Körper antippen — oder direkt dorthin ziehen."
                 : "Jetzt die passende Stelle am Körper antippen.")
                .font(.footnote)
                .foregroundStyle(selectedId == nil ? theme.secondaryText : theme.accent)
                .fixedSize(horizontal: false, vertical: true)

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 64), spacing: 10)], spacing: 10) {
                ForEach(openPoints) { point in
                    chip(point)
                        .opacity(dragId == point.id ? 0.35 : 1)
                        .overlay {
                            if selectedId == point.id {
                                Circle().strokeBorder(theme.accent, lineWidth: 3)
                            }
                        }
                        .onTapGesture {
                            selectedId = selectedId == point.id ? nil : point.id
                        }
                        .gesture(dragGesture(for: point))
                        .accessibilityLabel(point.label)
                        .accessibilityHint(selectedId == point.id ? "Ausgewählt" : "Zum Platzieren antippen")
                }
            }
        }
    }

    private func chip(_ point: ElectrodePoint) -> some View {
        Text(point.label)
            .font(.caption2.weight(.bold))
            .foregroundStyle(.black)
            .minimumScaleFactor(0.55)
            .lineLimit(2)
            .multilineTextAlignment(.center)
            .padding(4)
            .frame(width: 56, height: 56)
            .background(Color(hex: point.color), in: Circle())
    }

    /// `minimumDistance` bewusst > 0, damit ein einfaches Antippen die Auswahl
    /// setzt statt sofort als Fehlversuch zu zählen.
    private func dragGesture(for point: ElectrodePoint) -> some Gesture {
        DragGesture(minimumDistance: 12, coordinateSpace: .named("stage"))
            .onChanged { value in
                dragId = point.id
                dragLocation = value.location
            }
            .onEnded { value in
                dragId = nil
                place(point, at: value.location)
            }
    }

    /// Legt die Elektrode an der angetippten/abgelegten Stelle ab — sie bleibt
    /// dort kleben — und wertet aus, ob die Stelle anatomisch passt.
    private func place(_ point: ElectrodePoint, at stageLocation: CGPoint) {
        guard let position = viewBoxPoint(from: stageLocation) else { return }
        attempts += 1
        placements[point.id] = position
        if isHit(point, at: position) {
            correct.insert(point.id)
        } else {
            correct.remove(point.id)
        }
        selectedId = nil
    }

    /// Rechnet einen Punkt aus der Bühnen- in die viewBox-Koordinaten um.
    private func viewBoxPoint(from stageLocation: CGPoint) -> CGPoint? {
        guard boardFrame.width > 0, boardFrame.height > 0 else { return nil }
        let scale = min(boardFrame.width / electrodeSet.viewBox.w, boardFrame.height / electrodeSet.viewBox.h)
        guard scale > 0 else { return nil }
        let originX = boardFrame.minX + (boardFrame.width - electrodeSet.viewBox.w * scale) / 2
        let originY = boardFrame.minY + (boardFrame.height - electrodeSet.viewBox.h * scale) / 2
        return CGPoint(x: (stageLocation.x - originX) / scale,
                       y: (stageLocation.y - originY) / scale)
    }

    /// Prüft, ob die Ablagestelle zur Elektrode passt — bei `hitZone`
    /// zweidimensional (Interkostalraum × Leitlinie, mit Rand), sonst über den
    /// Radius. Bewusst tolerant: es geht um die richtige Region.
    private func isHit(_ point: ElectrodePoint, at position: CGPoint) -> Bool {
        if let zone = point.hitZone {
            let inZone = (zone.yRange.lowerBound - zoneMargin...zone.yRange.upperBound + zoneMargin).contains(position.y)
                && (zone.xRange.lowerBound - zoneMargin...zone.xRange.upperBound + zoneMargin).contains(position.x)
            if inZone { return true }
            // Zusätzlich ein Radius um den Referenzpunkt, damit knapp daneben
            // nicht als grob falsch gilt.
            return hypot(position.x - point.x, position.y - point.y) <= radiusTolerance * 0.6
        }
        return hypot(position.x - point.x, position.y - point.y) <= radiusTolerance
    }

    /// Falsch platzierte Elektrode in der Nähe eines Tipps — zum Wiederaufnehmen.
    private func misplacedPoint(near stageLocation: CGPoint) -> ElectrodePoint? {
        guard let position = viewBoxPoint(from: stageLocation) else { return nil }
        return misplaced
            .compactMap { point -> (ElectrodePoint, Double)? in
                guard let placed = placements[point.id] else { return nil }
                return (point, hypot(position.x - placed.x, position.y - placed.y))
            }
            .filter { $0.1 <= 30 }
            .min { $0.1 < $1.1 }?.0
    }

    // MARK: Legende & Punktestand

    private var legend: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(electrodeSet.points) { point in
                HStack(alignment: .firstTextBaseline, spacing: 10) {
                    Circle()
                        .fill(Color(hex: point.color))
                        .frame(width: 12, height: 12)
                    (Text(point.label).font(.callout.weight(.semibold))
                        + Text(" – " + point.description).font(.callout))
                        .foregroundStyle(correct.contains(point.id) && mode == .practice
                                         ? theme.secondaryText : theme.primaryText)
                        .fixedSize(horizontal: false, vertical: true)
                    Spacer(minLength: 0)
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
    }

    @ViewBuilder
    private var score: some View {
        if mode == .practice {
            VStack(alignment: .leading, spacing: 8) {
                Text("\(correct.count)/\(electrodeSet.points.count) richtig platziert · \(attempts) Versuche")
                    .font(.callout.monospacedDigit())
                    .foregroundStyle(theme.primaryText)

                if !misplaced.isEmpty {
                    Label("\(misplaced.count) sitzt noch falsch — rot gestrichelt markiert. Antippen, um sie wieder abzunehmen.",
                          systemImage: "exclamationmark.circle")
                        .font(.footnote)
                        .foregroundStyle(theme.bad)
                        .fixedSize(horizontal: false, vertical: true)
                }

                if finished {
                    Label("Fertig! Alle Elektroden korrekt platziert.", systemImage: "checkmark.seal.fill")
                        .font(.callout.weight(.semibold))
                        .foregroundStyle(theme.good)
                }

                Button("Zurücksetzen", systemImage: "arrow.counterclockwise") {
                    placements = [:]
                    correct = []
                    attempts = 0
                    selectedId = nil
                }
                .buttonStyle(.bordered)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardBackground()
        }
    }
}

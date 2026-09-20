import SceneKit
import SwiftUI

/// Der Zustand, den die Bedienoberfläche und die Szene sich teilen.
@Observable
final class AtlasModel {
    /// Sichtbare Systeme. Die Körperoberfläche ist zu Beginn aus, sonst
    /// verdeckt sie alles darunter — die Vorlage zeigt deshalb 2.229 der
    /// 2.234 Teile.
    static let initiallyHidden: Set<String> = ["integumentary"]
    var visibleSystems: Set<String> = Set(AtlasSystem.all.map(\.id))
        .subtracting(AtlasModel.initiallyHidden)
    var filter: AtlasSystem.Filter = .all
    var explode: Double = 0
    var viewpoint: AtlasViewpoint = .threeQuarter

    /// Die angetippte Struktur. Ein Konzept kann mehrere Netze umfassen.
    var selectedConcept: AtlasConcept?
    var selectedPart: AtlasPart?
    var isolated = false

    var searchText = ""
    var showsCredits = false
    var isRotating = false

    /// Ab 80 Prozent liegen die Teile flach im Raster; dann ergibt nur noch die
    /// Frontalansicht Sinn, und Ziehen verschiebt statt zu drehen.
    var isFlattened: Bool { explode > 0.8 }
    /// Die automatische Drehung ist nur bei weitgehend zusammengesetztem
    /// Körper sinnvoll.
    var canRotate: Bool { explode < 0.4 }

    /// Die Zeile unter dem Modell, wie in der Vorlage.
    var caption: String {
        if isolated { return (selectedConcept?.name ?? "Ausgewählte Struktur").uppercased() }
        if explode > 0.95 { return "ANATOMISCHES INVENTAR" }
        if explode > 0.05 { return "AUFGETRENNTE STRUKTUREN" }
        return "ERWACHSENER MENSCH · MÄNNLICH"
    }

    @ObservationIgnored let controller = AtlasSceneController()

    init() {
        // Die Szene wird mit allen Systemen gebaut; der Anfangszustand muss
        // deshalb einmal übertragen werden.
        for system in AtlasSystem.all {
            controller.setSystem(system.id, visible: visibleSystems.contains(system.id))
        }
    }

    var visiblePieceCount: Int {
        AtlasStore.shared.parts.reduce(into: 0) { total, part in
            if visibleSystems.contains(part.system) { total += 1 }
        }
    }

    var selectedSystem: AtlasSystem? {
        guard let id = selectedPart?.system else { return nil }
        return AtlasSystem.named(id)
    }

    /// Alle Netze der gewählten Struktur.
    var selectedPartIds: Set<String> {
        guard let concept = selectedConcept else {
            return selectedPart.map { [$0.id] } ?? []
        }
        return Set(concept.elements)
    }

    func toggle(_ system: AtlasSystem) {
        if visibleSystems.contains(system.id) {
            visibleSystems.remove(system.id)
        } else {
            visibleSystems.insert(system.id)
        }
        controller.setSystem(system.id, visible: visibleSystems.contains(system.id))
        controller.setExplode(Float(explode))
    }

    func hideAll() {
        let shown = AtlasSystem.all.filter { filter.matches($0) }
        let allHidden = shown.allSatisfy { !visibleSystems.contains($0.id) }
        for system in shown {
            if allHidden {
                visibleSystems.insert(system.id)
            } else {
                visibleSystems.remove(system.id)
            }
            controller.setSystem(system.id, visible: visibleSystems.contains(system.id))
        }
    }

    /// Wählt ein Netz aus und sucht das zugehörige Konzept dazu.
    func select(part: AtlasPart?) {
        selectedPart = part
        selectedConcept = part.flatMap { p in
            AtlasStore.shared.concepts.first { $0.id == p.conceptId }
        }
        controller.select(partIds: part == nil ? nil : selectedPartIds)
        if isolated { applyIsolation() }
    }

    /// Springt zu einer Struktur aus der Suche.
    func select(concept: AtlasConcept) {
        selectedConcept = concept
        selectedPart = concept.elements.compactMap { AtlasStore.shared.part(id: $0) }.first
        searchText = ""
        // Das System der Struktur muss sichtbar sein, sonst zeigt die Auswahl ins Leere.
        if let system = selectedPart?.system, !visibleSystems.contains(system) {
            visibleSystems.insert(system)
            controller.setSystem(system, visible: true)
        }
        controller.select(partIds: selectedPartIds)
        if isolated { applyIsolation() }
    }

    func clearSelection() {
        selectedConcept = nil
        selectedPart = nil
        isolated = false
        controller.select(partIds: nil)
        controller.isolate(partIds: nil, visibleSystems: visibleSystems)
    }

    func toggleIsolation() {
        isolated.toggle()
        if explode != 0 { setExplode(0) }
        applyIsolation()
    }

    private func applyIsolation() {
        let ids = selectedPartIds
        controller.isolate(partIds: isolated && !ids.isEmpty ? ids : nil,
                           visibleSystems: visibleSystems)
    }

    func apply(viewpoint: AtlasViewpoint) {
        self.viewpoint = viewpoint
        controller.setViewpoint(viewpoint)
        setRotating(false)
    }

    /// Setzt den Explosionsgrad und zieht die Folgen nach: ab 80 Prozent
    /// springt die Ansicht nach vorn, die automatische Drehung endet.
    func setExplode(_ value: Double) {
        explode = value
        controller.setExplode(Float(value))
        setRotating(false)
        if value > 0.8, viewpoint != .front {
            viewpoint = .front
            controller.setViewpoint(.front)
        }
    }

    func setRotating(_ rotating: Bool) {
        let wanted = rotating && canRotate
        isRotating = wanted
        controller.setRotating(wanted)
    }

    func resetAll() {
        setRotating(false)
        explode = 0
        controller.setExplode(0)
        controller.resetCamera()
        viewpoint = .threeQuarter
        visibleSystems = Set(AtlasSystem.all.map(\.id)).subtracting(AtlasModel.initiallyHidden)
        for system in AtlasSystem.all {
            controller.setSystem(system.id, visible: visibleSystems.contains(system.id))
        }
        clearSelection()
    }
}

/// Bettet die SceneKit-Ansicht in SwiftUI ein und übersetzt die Gesten.
struct AtlasSceneView: UIViewRepresentable {
    let model: AtlasModel

    func makeUIView(context: Context) -> SCNView {
        let view = SCNView()
        view.scene = model.controller.scene
        view.backgroundColor = .clear
        view.antialiasingMode = .multisampling2X
        view.isJitteringEnabled = false
        view.preferredFramesPerSecond = 60
        // Eigene Steuerung statt allowsCameraControl, damit die Blickrichtungen
        // aus der Seitenleiste dieselbe Kamera bewegen.
        view.allowsCameraControl = false

        let pan = UIPanGestureRecognizer(target: context.coordinator,
                                         action: #selector(Coordinator.handlePan(_:)))
        let pinch = UIPinchGestureRecognizer(target: context.coordinator,
                                             action: #selector(Coordinator.handlePinch(_:)))
        let tap = UITapGestureRecognizer(target: context.coordinator,
                                         action: #selector(Coordinator.handleTap(_:)))
        view.addGestureRecognizer(pan)
        view.addGestureRecognizer(pinch)
        view.addGestureRecognizer(tap)
        context.coordinator.view = view
        return view
    }

    func updateUIView(_ uiView: SCNView, context: Context) {
        context.coordinator.model = model
        let size = uiView.bounds.size
        if size.height > 0 {
            model.controller.setAspect(Float(size.width / size.height))
        }
    }

    func makeCoordinator() -> Coordinator { Coordinator(model: model) }

    final class Coordinator: NSObject {
        var model: AtlasModel
        weak var view: SCNView?
        private var lastPan: CGPoint = .zero

        init(model: AtlasModel) { self.model = model }

        @objc func handlePan(_ gesture: UIPanGestureRecognizer) {
            guard let view else { return }
            let point = gesture.translation(in: view)
            if gesture.state == .began { lastPan = .zero }
            let dx = Float(point.x - lastPan.x)
            let dy = Float(point.y - lastPan.y)
            lastPan = point
            if model.isFlattened {
                model.controller.pan(deltaX: dx, deltaY: dy, viewHeight: Float(view.bounds.height))
            } else {
                model.controller.orbit(deltaX: dx * 0.006, deltaY: dy * 0.006)
            }
        }

        @objc func handlePinch(_ gesture: UIPinchGestureRecognizer) {
            guard gesture.state == .changed else {
                gesture.scale = 1
                return
            }
            model.controller.zoom(scale: Float(gesture.scale))
            gesture.scale = 1
        }

        @objc func handleTap(_ gesture: UITapGestureRecognizer) {
            guard let view else { return }
            let point = gesture.location(in: view)
            let part = model.controller.hitTest(point, in: view)
            model.select(part: part)
        }
    }
}

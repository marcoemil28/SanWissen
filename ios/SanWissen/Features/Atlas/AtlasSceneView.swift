import SceneKit
import SwiftUI

/// Der Zustand, den die Bedienoberfläche und die Szene sich teilen.
@Observable
final class AtlasModel {
    /// Sichtbare Systeme. Die Körperoberfläche ist zu Beginn aus, sonst
    /// verdeckt sie alles darunter — die Vorlage zeigt deshalb 2.229 der
    /// 2.234 Teile.
    var visibleSystems: Set<String> = AtlasSystem.defaultVisible
    var filter: AtlasSystem.Filter = .all
    /// Welches Referenzmodell gezeigt wird.
    var sex: AtlasSex = .male

    // Kenndaten des geladenen Modells. Als gespeicherte Eigenschaften, damit
    // die Ansicht den Wechsel mitbekommt — der Store selbst wird nicht
    // beobachtet.
    var partCount = 0
    var conceptCount = 0
    var sourceName = ""
    var scopeText = ""
    var versionText = ""
    var availableSystems: [AtlasSystem] = []

    private func captureDatasetInfo() {
        let store = AtlasStore.shared
        partCount = store.parts.count
        conceptCount = store.concepts.count
        sourceName = store.source
        scopeText = store.scope
        versionText = store.version
        let present = Set(store.parts.map(\.system))
        availableSystems = AtlasSystem.all.filter { present.contains($0.id) }
    }
    var explode: Double = 0
    var viewpoint: AtlasViewpoint = .threeQuarter

    /// Die angetippte Struktur. Ein Konzept kann mehrere Netze umfassen.
    var selectedConcept: AtlasConcept?
    var selectedPart: AtlasPart?
    var isolated = false

    var searchText = ""
    var showsCredits = false
    var isRotating = false

    // MARK: - Quiz

    /// Ergebnis der letzten Antwort.
    enum QuizResult: Equatable {
        case correct
        /// Falsch getippt, mit dem Namen der getroffenen Struktur.
        case wrong(String)
    }

    var quizActive = false
    /// Die gesuchte Struktur.
    var quizTarget: AtlasPart?
    var quizResult: QuizResult?
    var quizAsked = 0
    var quizCorrect = 0
    /// Netze, die von der aktuellen Ansicht aus getroffen werden können.
    @ObservationIgnored private var outerPartIds: [String] = []
    /// Bereits gefragte Strukturen, damit sich Fragen nicht sofort wiederholen.
    @ObservationIgnored private var askedConceptIds: Set<String> = []

    /// Anzeigename der gesuchten Struktur.
    var quizPrompt: String {
        guard let part = quizTarget else { return "" }
        let concept = AtlasStore.shared.concepts.first { $0.id == part.conceptId }
        return concept?.name ?? part.name
    }

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
        return sex == .female ? "ERWACHSENER MENSCH · WEIBLICH" : "ERWACHSENER MENSCH · MÄNNLICH"
    }

    @ObservationIgnored let controller = AtlasSceneController()
    /// Wird von der eingebetteten Ansicht gesetzt; das Quiz braucht sie für die
    /// Abtastung, weil dafür die Bildschirmgröße zählt.
    @ObservationIgnored weak var sceneView: SCNView?

    init() {
        // Die Szene wird mit allen Systemen gebaut; der Anfangszustand muss
        // deshalb einmal übertragen werden.
        for system in AtlasSystem.all {
            controller.setSystem(system.id, visible: visibleSystems.contains(system.id))
        }
        captureDatasetInfo()
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

    /// Startet das Quiz. Die Auswahl kommt aus der Abtastung der Ansicht,
    /// gefragt wird also nur nach Strukturen, die gerade von außen zu sehen sind.
    func startQuiz(in view: SCNView) {
        quizActive = true
        quizAsked = 0
        quizCorrect = 0
        askedConceptIds = []
        clearSelection()
        setRotating(false)
        if explode != 0 { setExplode(0) }
        nextQuestion(in: view)
    }

    func endQuiz() {
        quizActive = false
        quizTarget = nil
        quizResult = nil
        controller.select(partIds: nil)
    }

    func nextQuestion(in view: SCNView) {
        quizResult = nil
        controller.select(partIds: nil)
        outerPartIds = controller.outerParts(in: view)

        let store = AtlasStore.shared
        let candidates = outerPartIds
            .compactMap { store.part(id: $0) }
            .filter { !askedConceptIds.contains($0.conceptId) }
        // Sind alle schon gefragt, wird von vorn begonnen.
        let pool = candidates.isEmpty
            ? outerPartIds.compactMap { store.part(id: $0) }
            : candidates
        guard let target = pool.randomElement() else {
            quizTarget = nil
            return
        }
        askedConceptIds.insert(target.conceptId)
        quizTarget = target
    }

    /// Prüft den Tipp. Richtig ist jedes Netz derselben benannten Struktur,
    /// denn eine Struktur kann aus mehreren Teilen bestehen.
    func answer(with part: AtlasPart?) {
        guard let target = quizTarget else { return }
        quizAsked += 1
        let accepted = Set(AtlasStore.shared.concepts
            .first { $0.id == target.conceptId }?.elements ?? [target.id])

        if let part, accepted.contains(part.id) || part.conceptId == target.conceptId {
            quizCorrect += 1
            quizResult = .correct
        } else {
            let hitName = part.map { p -> String in
                AtlasStore.shared.concepts.first { $0.id == p.conceptId }?.name ?? p.name
            } ?? "daneben"
            quizResult = .wrong(hitName)
        }
        // In beiden Fällen die gesuchte Struktur zeigen.
        controller.select(partIds: accepted)
    }

    /// Wechselt zwischen männlichem und weiblichem Referenzmodell.
    ///
    /// Die Sichtbarkeit wird zurückgesetzt, weil die beiden Modelle nicht
    /// dieselben Systeme führen: die Schwangerschaftsstrukturen gibt es nur
    /// weiblich, Bindegewebe nur männlich.
    func switchSex(to newSex: AtlasSex) {
        guard newSex != sex else { return }
        sex = newSex
        endQuiz()
        clearSelection()
        setRotating(false)
        explode = 0
        visibleSystems = AtlasSystem.defaultVisible
        controller.switchTo(newSex, visibleSystems: visibleSystems)
        controller.setExplode(0)
        captureDatasetInfo()
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
        visibleSystems = AtlasSystem.defaultVisible
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
        model.sceneView = view
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

        /// Die Szene-Ansicht, damit das Quiz die Abtastung anstoßen kann.
        var sceneView: SCNView? { view }

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
            if model.quizActive {
                // Nach einer Antwort erst weiterblättern, nicht sofort neu raten.
                guard model.quizResult == nil else { return }
                model.answer(with: part)
            } else {
                model.select(part: part)
            }
        }
    }
}

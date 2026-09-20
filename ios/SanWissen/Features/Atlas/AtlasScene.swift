import SceneKit
import SwiftUI
import UIKit

/// Die Blickrichtungen aus der Vorlage.
enum AtlasViewpoint: String, CaseIterable, Identifiable {
    case threeQuarter = "¾"
    case front = "F"
    case side = "S"
    case back = "B"

    var id: String { rawValue }

    /// Drehung um die Hochachse und leichte Neigung, jeweils im Bogenmaß.
    var angles: (yaw: Float, pitch: Float) {
        switch self {
        case .threeQuarter: (-.pi / 5, -0.12)
        case .front: (0, 0)
        case .side: (-.pi / 2, 0)
        case .back: (.pi, 0)
        }
    }
}

/// Baut und steuert die 3D-Szene.
///
/// Jedes Netz bekommt einen eigenen Knoten, weil Auswahl, Isolieren und die
/// Explosionsansicht einzeln auf sie zugreifen. Die Knoten hängen unter einem
/// Systemknoten, damit sich ein ganzes System in einem Schritt ein- und
/// ausblenden lässt.
final class AtlasSceneController {
    let scene = SCNScene()
    private let root = SCNNode()
    private let orbit = SCNNode()
    private let cameraNode = SCNNode()

    private var systemNodes: [String: SCNNode] = [:]
    private var partNodes: [String: SCNNode] = [:]
    private var restPositions: [String: SCNVector3] = [:]
    private var materials: [String: SCNMaterial] = [:]

    /// Mittelpunkt des Körpers, Bezugspunkt für die Explosionsansicht.
    private var bodyCenter = SCNVector3Zero
    private var bodyHeight: Float = 1.8

    private var yaw: Float = AtlasViewpoint.threeQuarter.angles.yaw
    private var pitch: Float = AtlasViewpoint.threeQuarter.angles.pitch
    private var distance: Float = 3.2
    private var baseDistance: Float = 3.2
    private let fieldOfView: CGFloat = 34
    /// Anteil der Ansichtshöhe, der wirklich frei ist. Kopfzeile, Regler und
    /// Tab-Leiste liegen über der Szene und verdecken sonst die Füße.
    private var usableHeightFraction: Float = 0.85
    /// Verschiebt den Körper im Bild nach oben, weil der freie Bereich nicht
    /// in der Mitte der Ansicht liegt. Anteil der Ansichtshöhe.
    private var verticalShiftFraction: Float = 0
    /// Zusätzliche Verschiebung durch Ziehen in der flachen Ansicht.
    private var panOffset = (x: Float(0), y: Float(0))

    private(set) var selectedPartId: String?
    private var lightsAdded = false

    init() {
        buildScene()
    }

    // MARK: - Aufbau

    /// Lädt das andere Referenzmodell und baut die Szene damit neu auf.
    func switchTo(_ sex: AtlasSex, visibleSystems: Set<String>) {
        guard AtlasStore.shared.sex != sex else { return }
        AtlasStore.shared.load(sex)

        // Alte Knoten und Materialien wegräumen, sonst bleiben die Netze des
        // vorigen Modells im Speicher und in der Szene.
        for node in systemNodes.values { node.removeFromParentNode() }
        systemNodes = [:]
        partNodes = [:]
        materials = [:]
        layoutCells = [:]
        layoutKey = ""
        explodeAmount = 0
        selectedPartId = nil

        buildScene()
        for system in AtlasSystem.all {
            setSystem(system.id, visible: visibleSystems.contains(system.id))
        }
    }

    private func buildScene() {
        let store = AtlasStore.shared

        var minY: Float = .greatestFiniteMagnitude
        var maxY: Float = -.greatestFiniteMagnitude
        var sum = SCNVector3Zero
        for part in store.parts {
            minY = min(minY, part.bounds[0][1])
            maxY = max(maxY, part.bounds[1][1])
            let c = part.center
            sum = SCNVector3(sum.x + c.x, sum.y + c.y, sum.z + c.z)
        }
        let count = Float(max(store.parts.count, 1))
        bodyCenter = SCNVector3(sum.x / count, (minY + maxY) / 2, sum.z / count)
        bodyHeight = maxY - minY

        for system in AtlasSystem.all {
            let node = SCNNode()
            node.name = system.id
            systemNodes[system.id] = node
            root.addChildNode(node)

            let material = SCNMaterial()
            material.lightingModel = .physicallyBased
            material.diffuse.contents = UIColor(system.color)
            material.roughness.contents = 0.62
            material.metalness.contents = 0.0
            // Beidseitig, weil die vereinfachten Netze stellenweise offen sind.
            material.isDoubleSided = true
            materials[system.id] = material
        }

        for part in store.parts {
            guard let geometry = store.geometry(for: part),
                  let material = materials[part.system],
                  let parent = systemNodes[part.system] else { continue }
            geometry.materials = [material]
            let node = SCNNode(geometry: geometry)
            node.name = part.id
            node.castsShadow = false
            parent.addChildNode(node)
            partNodes[part.id] = node
            restPositions[part.id] = SCNVector3Zero
        }

        // Den Körper so verschieben, dass er um den Ursprung kreist.
        root.position = SCNVector3(-bodyCenter.x, -bodyCenter.y, -bodyCenter.z)

        if orbit.parent == nil {
            let pivot = SCNNode()
            pivot.addChildNode(root)
            orbit.addChildNode(pivot)
            scene.rootNode.addChildNode(orbit)
        }

        let camera = SCNCamera()
        camera.fieldOfView = fieldOfView
        // Ohne das bezieht SceneKit das Blickfeld auf die kürzere Kante; im
        // Hochformat wäre der Körper dann oben und unten abgeschnitten.
        camera.projectionDirection = .vertical
        camera.zNear = 0.01
        camera.zFar = 100
        camera.wantsHDR = false
        cameraNode.camera = camera

        fit(usableHeightFraction: usableHeightFraction, verticalShift: verticalShiftFraction)
        if cameraNode.parent == nil { scene.rootNode.addChildNode(cameraNode) }
        if !lightsAdded {
            addLights()
            lightsAdded = true
        }
        applyCamera()
    }

    private func addLights() {
        let key = SCNLight()
        key.type = .directional
        key.intensity = 780
        key.castsShadow = false
        let keyNode = SCNNode()
        keyNode.light = key
        keyNode.eulerAngles = SCNVector3(-0.6, 0.7, 0)
        scene.rootNode.addChildNode(keyNode)

        let fill = SCNLight()
        fill.type = .directional
        fill.intensity = 340
        let fillNode = SCNNode()
        fillNode.light = fill
        fillNode.eulerAngles = SCNVector3(0.3, -1.2, 0)
        scene.rootNode.addChildNode(fillNode)

        let ambient = SCNLight()
        ambient.type = .ambient
        ambient.intensity = 420
        let ambientNode = SCNNode()
        ambientNode.light = ambient
        scene.rootNode.addChildNode(ambientNode)
    }

    // MARK: - Kamera

    private func applyCamera() {
        orbit.eulerAngles = SCNVector3(pitch, yaw, 0)
        // Die Kamera blickt waagerecht; senkt man sie, rutscht der Körper im
        // Bild nach oben. So landet er in der freien Fläche statt in der Mitte.
        let halfAngle = Float((fieldOfView / 2) * .pi / 180)
        let visibleHeight = 2 * distance * tan(halfAngle)
        cameraNode.position = SCNVector3(panOffset.x,
                                        panOffset.y - verticalShiftFraction * visibleHeight,
                                        distance)
        cameraNode.eulerAngles = SCNVector3Zero
    }

    /// Setzt den Kameraabstand so, dass der Körper in den freien Bereich passt,
    /// und verschiebt ihn dorthin. `shift` ist positiv, wenn es nach oben geht.
    func fit(usableHeightFraction fraction: Float, verticalShift shift: Float = 0) {
        usableHeightFraction = max(0.3, min(1, fraction))
        verticalShiftFraction = shift
        let halfAngle = Float((fieldOfView / 2) * .pi / 180)
        let exactFit = (bodyHeight / 2) / tan(halfAngle)
        baseDistance = exactFit / usableHeightFraction
        distance = baseDistance
        applyCamera()
    }

    func orbit(deltaX: Float, deltaY: Float) {
        yaw += deltaX
        pitch = max(-.pi / 2.2, min(.pi / 2.2, pitch + deltaY))
        applyCamera()
    }

    /// Verschiebt den Bildausschnitt. Wird gebraucht, wenn die Teile flach im
    /// Raster liegen und Drehen keinen Sinn mehr ergibt.
    func pan(deltaX: Float, deltaY: Float, viewHeight: Float) {
        guard viewHeight > 0 else { return }
        let halfAngle = Float((fieldOfView / 2) * .pi / 180)
        let worldPerPixel = (2 * distance * tan(halfAngle)) / viewHeight
        panOffset.x -= deltaX * worldPerPixel
        panOffset.y += deltaY * worldPerPixel
        applyCamera()
    }

    func zoom(scale: Float) {
        let lowerBound = bodyHeight * 0.28
        let upperBound = max(bodyHeight, layoutSize.height) * 3.4
        distance = max(lowerBound, min(upperBound, distance / scale))
        applyCamera()
    }

    func setViewpoint(_ viewpoint: AtlasViewpoint) {
        let angles = viewpoint.angles
        yaw = angles.yaw
        pitch = angles.pitch
        applyCamera()
    }

    func resetRotation() {
        setViewpoint(.threeQuarter)
    }

    func resetCamera() {
        distance = baseDistance
        panOffset = (0, 0)
        setRotating(false)
        resetRotation()
    }

    // MARK: - Sichtbarkeit

    func setSystem(_ id: String, visible: Bool) {
        systemNodes[id]?.isHidden = !visible
    }

    /// Blendet außerhalb der Auswahl alles aus. `nil` hebt die Isolierung auf.
    func isolate(partIds: Set<String>?, visibleSystems: Set<String>) {
        guard let partIds else {
            for (id, node) in partNodes {
                node.isHidden = false
                _ = id
            }
            for system in AtlasSystem.all {
                setSystem(system.id, visible: visibleSystems.contains(system.id))
            }
            return
        }
        for system in AtlasSystem.all { systemNodes[system.id]?.isHidden = false }
        for (id, node) in partNodes { node.isHidden = !partIds.contains(id) }
    }

    // MARK: - Auswahl

    func select(partIds: Set<String>?) {
        selectedPartId = partIds?.first
        for (id, node) in partNodes {
            guard let geometry = node.geometry, let part = AtlasStore.shared.part(id: id) else { continue }
            let isSelected = partIds?.contains(id) ?? false
            if isSelected {
                let highlight = SCNMaterial()
                highlight.lightingModel = .physicallyBased
                highlight.diffuse.contents = UIColor.white
                highlight.emission.contents = UIColor(white: 0.22, alpha: 1)
                highlight.roughness.contents = 0.45
                highlight.isDoubleSided = true
                geometry.materials = [highlight]
            } else if let base = materials[part.system], geometry.materials.first !== base {
                geometry.materials = [base]
            }
        }
    }

    /// Liefert das Netz unter dem Tipppunkt.
    func hitTest(_ point: CGPoint, in view: SCNView) -> AtlasPart? {
        let results = view.hitTest(point, options: [
            .searchMode: SCNHitTestSearchMode.closest.rawValue,
            .ignoreHiddenNodes: true,
            .boundingBoxOnly: false,
        ])
        guard let name = results.first?.node.name else { return nil }
        return AtlasStore.shared.part(id: name)
    }

    // MARK: - Was ist von außen zu sehen?

    /// Sammelt die Netze, die von der aktuellen Kameraposition aus wirklich
    /// getroffen werden können.
    ///
    /// Statt zu raten, welche Strukturen oberflächlich liegen, wird die Ansicht
    /// mit einem Raster von Strahlen abgetastet. Was dabei als erstes getroffen
    /// wird, ist von außen sichtbar — genau das, was im Quiz gefragt werden darf.
    /// `minHits` sortiert Strukturen aus, von denen nur ein Zipfel hervorschaut.
    func outerParts(in view: SCNView, samples: Int = 26, minHits: Int = 2) -> [String] {
        let bounds = view.bounds
        guard bounds.width > 1, bounds.height > 1 else { return [] }

        // Nur dort abtasten, wo der Körper im Bild liegt. Über die ganze
        // Ansicht verteilt gingen die meisten Strahlen daneben, und die
        // wenigen Treffer verteilten sich zu fein auf zu viele Netze.
        let area = projectedBounds(in: view) ?? bounds
        let region = area.insetBy(dx: -4, dy: -4).intersection(bounds)
        guard region.width > 1, region.height > 1 else { return [] }

        var hits: [String: Int] = [:]
        let options: [SCNHitTestOption: Any] = [
            .searchMode: SCNHitTestSearchMode.closest.rawValue,
            .ignoreHiddenNodes: true,
            .boundingBoxOnly: false,
        ]
        for i in 0..<samples {
            for j in 0..<samples {
                let point = CGPoint(
                    x: region.minX + region.width * (Double(i) + 0.5) / Double(samples),
                    y: region.minY + region.height * (Double(j) + 0.5) / Double(samples))
                if let name = view.hitTest(point, options: options).first?.node.name {
                    hits[name, default: 0] += 1
                }
            }
        }
        return hits.filter { $0.value >= minHits }.map(\.key)
    }

    /// Bildschirmbereich, den der sichtbare Körper einnimmt. Dafür werden die
    /// Ecken des Hüllquaders projiziert.
    private func projectedBounds(in view: SCNView) -> CGRect? {
        let visible = AtlasStore.shared.parts.filter { partNodes[$0.id]?.isHidden == false }
        guard !visible.isEmpty else { return nil }
        var lo = SCNVector3(Float.greatestFiniteMagnitude, .greatestFiniteMagnitude, .greatestFiniteMagnitude)
        var hi = SCNVector3(-Float.greatestFiniteMagnitude, -.greatestFiniteMagnitude, -.greatestFiniteMagnitude)
        for part in visible {
            lo = SCNVector3(min(lo.x, part.bounds[0][0]), min(lo.y, part.bounds[0][1]), min(lo.z, part.bounds[0][2]))
            hi = SCNVector3(max(hi.x, part.bounds[1][0]), max(hi.y, part.bounds[1][1]), max(hi.z, part.bounds[1][2]))
        }

        var minX = CGFloat.greatestFiniteMagnitude, minY = CGFloat.greatestFiniteMagnitude
        var maxX = -CGFloat.greatestFiniteMagnitude, maxY = -CGFloat.greatestFiniteMagnitude
        for dx in [lo.x, hi.x] {
            for dy in [lo.y, hi.y] {
                for dz in [lo.z, hi.z] {
                    // Die Ecken liegen im Körpersystem, deshalb über den
                    // Körperknoten in die Szene umrechnen.
                    let world = root.convertPosition(SCNVector3(dx, dy, dz), to: nil)
                    let p = view.projectPoint(world)
                    minX = min(minX, CGFloat(p.x)); maxX = max(maxX, CGFloat(p.x))
                    minY = min(minY, CGFloat(p.y)); maxY = max(maxY, CGFloat(p.y))
                }
            }
        }
        guard maxX > minX, maxY > minY else { return nil }
        return CGRect(x: minX, y: minY, width: maxX - minX, height: maxY - minY)
    }

    // MARK: - Explosionsansicht

    /// Zielposition je Netz im aufgelösten Raster.
    private var layoutCells: [String: SCNVector3] = [:]
    private var layoutSize = (width: Float(0), height: Float(0))
    private var layoutKey = ""
    private var explodeAmount: Float = 0
    private var viewAspect: Float = 1

    func setAspect(_ aspect: Float) {
        guard aspect > 0, abs(aspect - viewAspect) > 0.01 else { return }
        viewAspect = aspect
        layoutKey = ""
        applyExplode()
    }

    /// Legt alle sichtbaren Netze nebeneinander in ein Raster.
    ///
    /// Die Vorlage sortiert nach Höhe und füllt Reihe für Reihe auf, wie beim
    /// Setzen von Regalböden. Die Reihenbreite folgt aus der Gesamtfläche und
    /// dem Seitenverhältnis der Ansicht, damit das Ergebnis ungefähr die Form
    /// des Fensters hat.
    private func buildLayout(for parts: [AtlasPart]) {
        struct Cell {
            let id: String
            let width: Float
            let height: Float
        }
        let cells = parts.map { part in
            Cell(id: part.id,
                 width: max(0.035, part.bounds[1][0] - part.bounds[0][0]) + 0.04,
                 height: max(0.035, part.bounds[1][1] - part.bounds[0][1]) + 0.04)
        }
        guard !cells.isEmpty else { layoutCells = [:]; return }

        let area = cells.reduce(Float(0)) { $0 + $1.width * $1.height }
        let widest = max(0.3, cells.map(\.width).max() ?? 0.3)
        let rowWidth = max(widest, sqrt(area * max(0.5, min(1.5, viewAspect))) * 1.18)

        let sorted = cells.sorted {
            $0.height != $1.height ? $0.height > $1.height : $0.id < $1.id
        }

        var placed: [String: (x: Float, y: Float)] = [:]
        var x: Float = 0, y: Float = 0, rowHeight: Float = 0, maxX: Float = 0
        for cell in sorted {
            if x > 0, x + cell.width > rowWidth {
                x = 0
                y += rowHeight
                rowHeight = 0
            }
            placed[cell.id] = (x + cell.width / 2, -y - cell.height / 2)
            x += cell.width
            maxX = max(maxX, x)
            rowHeight = max(rowHeight, cell.height)
        }
        let totalHeight = y + rowHeight

        layoutCells = placed.mapValues { cell in
            SCNVector3(cell.x - maxX / 2, cell.y + totalHeight / 2, 0)
        }
        layoutSize = (maxX, totalHeight)
    }

    /// `amount` läuft von 0 (zusammengesetzt) bis 1 (jedes Teil einzeln).
    func setExplode(_ amount: Float) {
        explodeAmount = max(0, min(1, amount))
        applyExplode()
    }

    private func applyExplode() {
        let visible = AtlasStore.shared.parts.filter { partNodes[$0.id]?.isHidden == false }
        let key = "\(visible.count)-\(visible.first?.id ?? "")-\(visible.last?.id ?? "")-\(viewAspect)"
        if key != layoutKey {
            buildLayout(for: visible)
            layoutKey = key
        }

        // Der Bildausschnitt wandert von der Körperhöhe zur Rasterhöhe mit,
        // sonst läuft das Inventar bei hohen Werten aus dem Bild.
        let targetHeight = max(layoutSize.height, layoutSize.width / max(viewAspect, 0.01))
        let contentHeight = bodyHeight + (targetHeight - bodyHeight) * explodeAmount
        let halfAngle = Float((fieldOfView / 2) * .pi / 180)
        distance = (contentHeight / 2) / tan(halfAngle) / usableHeightFraction
        applyCamera()

        for (id, node) in partNodes {
            guard let part = AtlasStore.shared.part(id: id) else { continue }
            guard explodeAmount > 0, let cell = layoutCells[id] else {
                node.position = SCNVector3Zero
                continue
            }
            // Das Netz soll mit seinem Mittelpunkt in der Rasterzelle landen.
            // Die Knotenposition ist relativ zum Körperknoten, der um
            // -bodyCenter verschoben ist — das muss hier gegengerechnet
            // werden, sonst liegt das Raster um eine halbe Körperhöhe zu tief.
            let c = part.center
            let target = SCNVector3(cell.x + bodyCenter.x - c.x,
                                    cell.y + bodyCenter.y - c.y,
                                    bodyCenter.z - c.z)
            node.position = SCNVector3(target.x * explodeAmount,
                                       target.y * explodeAmount,
                                       target.z * explodeAmount)
        }
    }

    // MARK: - Automatische Drehung

    private var rotationTimer: Timer?
    private(set) var isRotating = false

    func setRotating(_ rotating: Bool) {
        isRotating = rotating
        rotationTimer?.invalidate()
        rotationTimer = nil
        guard rotating else { return }
        rotationTimer = Timer.scheduledTimer(withTimeInterval: 1.0 / 60, repeats: true) { [weak self] _ in
            guard let self else { return }
            yaw += 0.004
            applyCamera()
        }
    }
}

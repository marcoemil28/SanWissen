import Foundation
import SceneKit

/// Ein einzelnes Netz des Atlas.
///
/// `positions`, `normals` und `indices` sind Byte-Offsets in die Binärdatei des
/// jeweiligen Blocks, nicht die Daten selbst — die Dateien werden nur eingeblendet
/// (memory mapped), damit die 58 MB Geometrie nicht im Arbeitsspeicher landen.
struct AtlasPart: Decodable, Identifiable, Hashable {
    let id: String
    let name: String
    let conceptId: String
    let system: String
    let chunk: Int
    let positions: Int
    let normals: Int
    let indices: Int
    let vertexCount: Int
    let indexCount: Int
    /// [[minX, minY, minZ], [maxX, maxY, maxZ]]
    private(set) var bounds: [[Float]]

    /// Aus welchem Datensatz das Netz stammt. Im weiblichen Modell werden
    /// beide gemischt, deshalb muss jedes Teil seine Herkunft kennen.
    var origin: AtlasSex = .male
    /// Verschiebung, mit der das Netz in die Szene gesetzt wird. Nötig, weil
    /// die beiden Datensätze ihren Ursprung unterschiedlich legen.
    private(set) var offsetX: Float = 0
    private(set) var offsetY: Float = 0
    private(set) var offsetZ: Float = 0

    private enum CodingKeys: String, CodingKey {
        case id, name, conceptId, system, chunk, positions, normals, indices
        case vertexCount, indexCount, bounds
    }

    /// Verschiebt das Teil, damit es zum anderen Datensatz passt. Die Grenzen
    /// wandern mit, sonst stimmen Mittelpunkt, Raster und Trefferfläche nicht.
    mutating func shift(x: Float, y: Float, z: Float) {
        offsetX = x; offsetY = y; offsetZ = z
        bounds = [[bounds[0][0] + x, bounds[0][1] + y, bounds[0][2] + z],
                  [bounds[1][0] + x, bounds[1][1] + y, bounds[1][2] + z]]
    }

    var offset: SCNVector3 { SCNVector3(offsetX, offsetY, offsetZ) }

    var center: SCNVector3 {
        SCNVector3((bounds[0][0] + bounds[1][0]) / 2,
                   (bounds[0][1] + bounds[1][1]) / 2,
                   (bounds[0][2] + bounds[1][2]) / 2)
    }

    static func == (a: AtlasPart, b: AtlasPart) -> Bool { a.id == b.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

/// Eine benannte Struktur, die aus einem oder mehreren Netzen besteht.
struct AtlasConcept: Decodable, Identifiable, Hashable {
    let id: String
    let name: String
    let elements: [String]
}

private struct AtlasChunk: Decodable {
    let url: String
    let bytes: Int
}

private struct AtlasFile: Decodable {
    let version: String
    let parts: [AtlasPart]
    let chunks: [AtlasChunk]
    let concepts: [AtlasConcept]
    let triangles: Int
    let sex: String
    let source: String
    let scope: String
}

/// Lädt den Atlas und baut daraus SceneKit-Geometrie.
///
/// Die Vorlage liefert pro Netz drei Rohpuffer: Positionen als float32, Normalen
/// als int16 auf Einheitslänge normiert und Indizes als uint32. SceneKit kann
/// alle drei direkt übernehmen, deshalb wird hier nichts umgerechnet.
final class AtlasStore {
    static let shared = AtlasStore()

    /// Welches Referenzmodell gerade geladen ist.
    private(set) var sex: AtlasSex = .male

    private(set) var parts: [AtlasPart] = []
    private(set) var concepts: [AtlasConcept] = []
    private(set) var triangleCount = 0
    private(set) var scope = ""
    private(set) var source = ""
    private(set) var version = ""

    /// Netze je System, in der Reihenfolge der Datei.
    private(set) var partsBySystem: [String: [AtlasPart]] = [:]
    private var partsById: [String: AtlasPart] = [:]

    /// Die eingeblendeten Binärdateien, je Herkunft und Blocknummer.
    private var chunkData: [String: Data] = [:]
    private var maleChunkNames: [Int: String] = [:]
    private var femaleChunkNames: [Int: String] = [:]

    private init() {
        load(.male)
    }

    /// Systeme, die den Körperrahmen bilden. Sie sind weitgehend
    /// geschlechtsneutral und kommen im weiblichen Modell aus dem männlichen
    /// Datensatz, weil der weibliche sie nicht führt.
    static let frameSystems: Set<String> = ["skeletal", "muscular", "connective", "integumentary"]

    /// Versatz, mit dem die weichen Strukturen des weiblichen Datensatzes in
    /// den männlichen Rahmen passen. Aus dem Vergleich der Hüllquader beider
    /// Datensätze je System ermittelt; der Verdauungstrakt ist in beiden
    /// gleich groß, es braucht also nur eine Verschiebung, keine Skalierung.
    private static let femaleShift: (x: Float, y: Float, z: Float) = (0, 0.05, 0.067)

    /// Knochen, die der weibliche Datensatz selbst mitbringt und die den
    /// männlichen ersetzen. Das Becken ist der Knochen, an dem sich die
    /// Geschlechter deutlich unterscheiden und an dem das auch gelehrt wird.
    private static let femaleBoneTerms = ["hip bone", "sacrum", "coccyx", "sternum",
                                          "manubrium", "ilium", "ischium", "pubis"]

    private static func isFemaleSpecificBone(_ name: String) -> Bool {
        let lower = name.lowercased()
        return femaleBoneTerms.contains { lower.contains($0) }
    }

    private func decode(_ name: String) -> AtlasFile {
        guard let url = Bundle.main.url(forResource: name, withExtension: "json"),
              let data = try? Data(contentsOf: url, options: .mappedIfSafe),
              let file = try? JSONDecoder().decode(AtlasFile.self, from: data) else {
            fatalError("\(name).json fehlt oder ist beschädigt — bitte content/atlas prüfen.")
        }
        return file
    }

    private func chunkTable(_ file: AtlasFile) -> [Int: String] {
        Dictionary(uniqueKeysWithValues: file.chunks.enumerated().map { index, chunk in
            // "/models/body-3.bin" → "body-3", "/models/female-2.bin" → "female-2"
            (index, (chunk.url as NSString).lastPathComponent.replacingOccurrences(of: ".bin", with: ""))
        })
    }

    /// Lädt ein Modell. Die Geometrie wird nur eingeblendet (memory mapped),
    /// der Wechsel kostet deshalb kaum Speicher.
    ///
    /// Das weibliche Modell ist zusammengesetzt: der Human Reference Atlas
    /// führt Organe, Gefäße und Nerven, aber weder Arme noch Schädel, Rippen
    /// oder Becken. Skelett und Muskulatur kommen deshalb aus BodyParts3D.
    func load(_ sex: AtlasSex) {
        let maleFile = decode(AtlasSex.male.manifestName)
        maleChunkNames = chunkTable(maleFile)

        var combined: [AtlasPart] = []
        var allConcepts: [AtlasConcept] = []

        if sex == .female {
            let femaleFile = decode(AtlasSex.female.manifestName)
            femaleChunkNames = chunkTable(femaleFile)

            // Rahmen aus dem männlichen Satz, ohne die Knochen, für die es
            // ein weibliches Gegenstück gibt.
            for var part in maleFile.parts where Self.frameSystems.contains(part.system) {
                if part.system == "skeletal", Self.isFemaleSpecificBone(part.name) { continue }
                part.origin = .male
                combined.append(part)
            }
            // Weiches Gewebe und Organe aus dem weiblichen Satz, dazu die
            // geschlechtstypischen Knochen. Alles eingepasst.
            for var part in femaleFile.parts {
                let isFrame = Self.frameSystems.contains(part.system)
                let isOwnBone = part.system == "skeletal" && Self.isFemaleSpecificBone(part.name)
                guard !isFrame || isOwnBone else { continue }
                part.origin = .female
                part.shift(x: Self.femaleShift.x, y: Self.femaleShift.y, z: Self.femaleShift.z)
                combined.append(part)
            }
            let kept = Set(combined.map(\.id))
            allConcepts = (femaleFile.concepts + maleFile.concepts)
                .filter { $0.elements.contains(where: kept.contains) }
            triangleCount = combined.reduce(0) { $0 + $1.indexCount / 3 }
            scope = "Weibliche Referenz · Organe, Gefäße, Nerven sowie Becken, Kreuzbein und Brustbein "
                + "aus dem Human Reference Atlas. Die übrigen Knochen und die Muskulatur stammen aus "
                + "BodyParts3D und sind männlich — ein vollständiger weiblicher Datensatz ist frei "
                + "nicht verfügbar."
            source = "HRA und BodyParts3D"
            version = femaleFile.version + " + " + maleFile.version
        } else {
            for var part in maleFile.parts {
                part.origin = .male
                combined.append(part)
            }
            allConcepts = maleFile.concepts
            triangleCount = maleFile.triangles
            scope = maleFile.scope
            source = maleFile.source
            version = maleFile.version
        }

        self.sex = sex
        parts = combined
        concepts = allConcepts
        partsById = Dictionary(combined.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
        partsBySystem = Dictionary(grouping: combined, by: \.system)
        // Blöcke des vorigen Modells nicht weiter vorhalten.
        chunkData = [:]
    }

    func part(id: String) -> AtlasPart? { partsById[id] }

    /// Blendet eine Blockdatei ein. Ohne `.mappedIfSafe` läge der gesamte
    /// Atlas im Arbeitsspeicher.
    private func data(forChunk index: Int, origin: AtlasSex) -> Data? {
        let table = origin == .female ? femaleChunkNames : maleChunkNames
        guard let name = table[index] else { return nil }
        if let cached = chunkData[name] { return cached }
        guard let url = Bundle.main.url(forResource: name, withExtension: "bin"),
              let data = try? Data(contentsOf: url, options: .mappedIfSafe) else { return nil }
        chunkData[name] = data
        return data
    }

    /// Baut die Geometrie eines Netzes. Die Teildaten werden aus der
    /// eingeblendeten Datei kopiert, weil SceneKit sie behalten muss.
    func geometry(for part: AtlasPart) -> SCNGeometry? {
        guard let chunk = data(forChunk: part.chunk, origin: part.origin) else { return nil }

        let positionBytes = part.vertexCount * 3 * MemoryLayout<Float>.size
        let normalBytes = part.vertexCount * 3 * MemoryLayout<Int16>.size
        let indexBytes = part.indexCount * MemoryLayout<UInt32>.size
        guard part.indices + indexBytes <= chunk.count else { return nil }

        let positionData = chunk.subdata(in: part.positions..<(part.positions + positionBytes))
        let normalData = chunk.subdata(in: part.normals..<(part.normals + normalBytes))
        let indexData = chunk.subdata(in: part.indices..<(part.indices + indexBytes))

        let positionSource = SCNGeometrySource(
            data: positionData, semantic: .vertex, vectorCount: part.vertexCount,
            usesFloatComponents: true, componentsPerVector: 3,
            bytesPerComponent: MemoryLayout<Float>.size, dataOffset: 0,
            dataStride: 3 * MemoryLayout<Float>.size)

        // int16, auf ±32767 normiert — SceneKit liest das als Festkommaformat.
        let normalSource = SCNGeometrySource(
            data: normalData, semantic: .normal, vectorCount: part.vertexCount,
            usesFloatComponents: false, componentsPerVector: 3,
            bytesPerComponent: MemoryLayout<Int16>.size, dataOffset: 0,
            dataStride: 3 * MemoryLayout<Int16>.size)

        let element = SCNGeometryElement(
            data: indexData, primitiveType: .triangles,
            primitiveCount: part.indexCount / 3,
            bytesPerIndex: MemoryLayout<UInt32>.size)

        return SCNGeometry(sources: [positionSource, normalSource], elements: [element])
    }

    /// Suchtreffer über die benannten Strukturen. Die Vorlage sucht über die
    /// Konzepte, nicht über die einzelnen Netze.
    func search(_ query: String, limit: Int = 40) -> [AtlasConcept] {
        let needle = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard needle.count >= 2 else { return [] }
        var starts: [AtlasConcept] = []
        var contains: [AtlasConcept] = []
        for concept in concepts {
            let name = concept.name.lowercased()
            if name.hasPrefix(needle) {
                starts.append(concept)
            } else if name.contains(needle) {
                contains.append(concept)
            }
            if starts.count >= limit { break }
        }
        return Array((starts + contains).prefix(limit))
    }
}

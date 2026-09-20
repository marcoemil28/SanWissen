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
    let bounds: [[Float]]

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

    let parts: [AtlasPart]
    let concepts: [AtlasConcept]
    let triangleCount: Int
    let scope: String
    let source: String

    /// Netze je System, in der Reihenfolge der Datei.
    let partsBySystem: [String: [AtlasPart]]
    private let partsById: [String: AtlasPart]

    /// Die eingeblendeten Binärdateien, nach Blocknummer.
    private var chunkData: [Int: Data] = [:]
    private let chunkNames: [Int: String]

    private init() {
        guard let url = Bundle.main.url(forResource: "atlas", withExtension: "json"),
              let data = try? Data(contentsOf: url, options: .mappedIfSafe),
              let file = try? JSONDecoder().decode(AtlasFile.self, from: data) else {
            fatalError("atlas.json fehlt oder ist beschädigt — bitte Resources/Atlas prüfen.")
        }
        parts = file.parts
        concepts = file.concepts
        triangleCount = file.triangles
        scope = file.scope
        source = file.source
        partsById = Dictionary(uniqueKeysWithValues: file.parts.map { ($0.id, $0) })
        partsBySystem = Dictionary(grouping: file.parts, by: \.system)
        chunkNames = Dictionary(uniqueKeysWithValues: file.chunks.enumerated().map { index, chunk in
            // "/models/body-3.bin" → "body-3"
            (index, (chunk.url as NSString).lastPathComponent.replacingOccurrences(of: ".bin", with: ""))
        })
    }

    func part(id: String) -> AtlasPart? { partsById[id] }

    /// Blendet eine Blockdatei ein. Ohne `.mappedIfSafe` läge der gesamte
    /// Atlas im Arbeitsspeicher.
    private func data(forChunk index: Int) -> Data? {
        if let cached = chunkData[index] { return cached }
        guard let name = chunkNames[index],
              let url = Bundle.main.url(forResource: name, withExtension: "bin"),
              let data = try? Data(contentsOf: url, options: .mappedIfSafe) else { return nil }
        chunkData[index] = data
        return data
    }

    /// Baut die Geometrie eines Netzes. Die Teildaten werden aus der
    /// eingeblendeten Datei kopiert, weil SceneKit sie behalten muss.
    func geometry(for part: AtlasPart) -> SCNGeometry? {
        guard let chunk = data(forChunk: part.chunk) else { return nil }

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

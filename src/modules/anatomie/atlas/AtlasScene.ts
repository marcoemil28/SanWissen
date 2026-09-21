import * as THREE from 'three';
import {
  ATLAS_SYSTEMS,
  type AtlasPart,
  type LoadedAtlas,
} from './atlasData';

/**
 * Baut und steuert die 3D-Szene des Atlas.
 *
 * Nachbau von `AtlasScene.swift`, aber mit einem wesentlichen Unterschied:
 * dort bekommt jedes der 2.234 Netze einen eigenen Knoten, was SceneKit
 * wegsteckt. In WebGL wären das 2.234 Zeichenaufrufe pro Bild, was auf einem
 * Telefon nicht läuft. Stattdessen sammelt ein `BatchedMesh` je Organsystem
 * alle Netze in einem Aufruf und bietet trotzdem Sichtbarkeit, Farbe und
 * Matrix je Teil. Genau das brauchen Freistellen, Auswahl und die
 * Explosionsansicht.
 *
 * Die Kamera steht fest auf der Z-Achse und blickt auf den Ursprung; gedreht
 * wird das Modell. Das ist dieselbe Anordnung wie auf iOS.
 */

export type AtlasViewpoint = 'threeQuarter' | 'front' | 'side' | 'back';

const VIEWPOINT_ANGLES: Record<AtlasViewpoint, { yaw: number; pitch: number }> = {
  threeQuarter: { yaw: -Math.PI / 5, pitch: -0.12 },
  front: { yaw: 0, pitch: 0 },
  side: { yaw: -Math.PI / 2, pitch: 0 },
  back: { yaw: Math.PI, pitch: 0 },
};

const FIELD_OF_VIEW = 34;

/** Eine Zelle der Explosionsansicht. */
interface LayoutCell {
  x: number;
  y: number;
}

interface SystemBatch {
  mesh: THREE.BatchedMesh;
  /** instanceId je Teil-id. */
  instances: Map<string, number>;
  baseColor: THREE.Color;
}

export class AtlasScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly orbit = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly raycaster = new THREE.Raycaster();

  private readonly batches = new Map<string, SystemBatch>();
  private readonly partsById = new Map<string, AtlasPart>();
  private readonly partSystem = new Map<string, string>();

  private bodyCenter = new THREE.Vector3();
  private bodyHeight = 1.8;

  private yaw = VIEWPOINT_ANGLES.threeQuarter.yaw;
  private pitch = VIEWPOINT_ANGLES.threeQuarter.pitch;
  private distance = 3.2;
  private baseDistance = 3.2;
  private panOffset = { x: 0, y: 0 };
  private usableHeightFraction = 0.85;
  private verticalShiftFraction = 0;
  private viewAspect = 1;

  private explodeAmount = 0;
  private layoutCells = new Map<string, LayoutCell>();
  private layoutSize = { width: 0, height: 0 };
  private layoutKey = '';

  private hiddenSystems = new Set<string>();
  private isolated: Set<string> | null = null;
  private selectedId: string | null = null;

  private frameHandle = 0;
  private needsRender = true;
  private disposed = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly atlas: LoadedAtlas,
    chunks: Map<string, ArrayBuffer>,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera = new THREE.PerspectiveCamera(FIELD_OF_VIEW, 1, 0.01, 100);
    this.scene.add(this.camera);

    this.orbit.add(this.body);
    this.scene.add(this.orbit);

    this.measureBody();
    this.buildBatches(chunks);
    this.addLights();
    this.fit(this.usableHeightFraction, 0);
    this.loop();
  }

  // ---------------------------------------------------------------- Aufbau

  private measureBody() {
    let minY = Infinity;
    let maxY = -Infinity;
    const sum = new THREE.Vector3();

    for (const part of this.atlas.parts) {
      minY = Math.min(minY, part.bounds[0][1]);
      maxY = Math.max(maxY, part.bounds[1][1]);
      sum.x += (part.bounds[0][0] + part.bounds[1][0]) / 2;
      sum.y += (part.bounds[0][1] + part.bounds[1][1]) / 2;
      sum.z += (part.bounds[0][2] + part.bounds[1][2]) / 2;
      this.partsById.set(part.id, part);
      this.partSystem.set(part.id, part.system);
    }

    const count = Math.max(this.atlas.parts.length, 1);
    this.bodyCenter.set(sum.x / count, (minY + maxY) / 2, sum.z / count);
    this.bodyHeight = maxY - minY;
    this.body.position.set(-this.bodyCenter.x, -this.bodyCenter.y, -this.bodyCenter.z);
  }

  /**
   * Schneidet ein Netz aus dem Binärblock.
   *
   * Die drei Puffer liegen hintereinander im Block: Positionen als float32,
   * Normalen als int16 auf Einheitslänge normiert, Indizes als uint32. Alle
   * Versätze sind ausgerichtet, es wird also nichts kopiert, sondern nur ein
   * Fenster auf den Puffer gelegt.
   */
  private geometryFor(part: AtlasPart, buffer: ArrayBuffer): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(buffer, part.positions, part.vertexCount * 3), 3),
    );
    geometry.setAttribute(
      'normal',
      // `normalized: true` lässt die Grafikkarte die int16-Werte auf [-1, 1]
      // abbilden, genau wie die Vorlage es meint.
      new THREE.BufferAttribute(new Int16Array(buffer, part.normals, part.vertexCount * 3), 3, true),
    );
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer, part.indices, part.indexCount), 1));
    return geometry;
  }

  private buildBatches(chunks: Map<string, ArrayBuffer>) {
    const bySystem = new Map<string, AtlasPart[]>();
    for (const part of this.atlas.parts) {
      const list = bySystem.get(part.system) ?? [];
      list.push(part);
      bySystem.set(part.system, list);
    }

    for (const info of ATLAS_SYSTEMS) {
      const parts = bySystem.get(info.id);
      if (!parts || parts.length === 0) continue;

      const vertices = parts.reduce((sum, p) => sum + p.vertexCount, 0);
      const indices = parts.reduce((sum, p) => sum + p.indexCount, 0);

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(info.hex),
        roughness: 0.62,
        metalness: 0,
        // Beidseitig, weil die vereinfachten Netze stellenweise offen sind.
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.BatchedMesh(parts.length, vertices, indices, material);
      mesh.name = info.id;
      mesh.sortObjects = false;

      const instances = new Map<string, number>();
      const matrix = new THREE.Matrix4();

      for (const part of parts) {
        const buffer = chunks.get(`${part.origin}:${part.chunk}`);
        if (!buffer) continue;
        const geometry = this.geometryFor(part, buffer);
        const geometryId = mesh.addGeometry(geometry);
        const instanceId = mesh.addInstance(geometryId);
        matrix.makeTranslation(part.offset[0], part.offset[1], part.offset[2]);
        mesh.setMatrixAt(instanceId, matrix);
        instances.set(part.id, instanceId);
        geometry.dispose();
      }

      this.batches.set(info.id, { mesh, instances, baseColor: new THREE.Color(info.hex) });
      this.body.add(mesh);

      if (info.hiddenByDefault) {
        this.hiddenSystems.add(info.id);
        mesh.visible = false;
      }
    }
  }

  private addLights() {
    // Dieselbe Ausleuchtung wie auf iOS, nur in den Einheiten von three.js.
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(0.6, 0.8, 1).normalize();
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 0.9);
    fill.position.set(-1, 0.3, 0.6).normalize();
    this.scene.add(fill);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.15));
  }

  // ---------------------------------------------------------------- Kamera

  private applyCamera() {
    this.orbit.rotation.set(this.pitch, this.yaw, 0);
    const halfAngle = (FIELD_OF_VIEW / 2) * (Math.PI / 180);
    const visibleHeight = 2 * this.distance * Math.tan(halfAngle);
    this.camera.position.set(
      this.panOffset.x,
      this.panOffset.y - this.verticalShiftFraction * visibleHeight,
      this.distance,
    );
    this.camera.rotation.set(0, 0, 0);
    this.needsRender = true;
  }

  /** Abstand so setzen, dass der Körper in den freien Bereich passt. */
  fit(fraction: number, verticalShift = 0) {
    this.usableHeightFraction = Math.max(0.3, Math.min(1, fraction));
    this.verticalShiftFraction = verticalShift;
    const halfAngle = (FIELD_OF_VIEW / 2) * (Math.PI / 180);
    this.baseDistance = this.bodyHeight / 2 / Math.tan(halfAngle) / this.usableHeightFraction;
    this.distance = this.baseDistance;
    this.applyCamera();
  }

  setSize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.viewAspect = width / height;
    this.camera.aspect = this.viewAspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.layoutKey = '';
    this.applyExplode();
  }

  orbitBy(deltaX: number, deltaY: number) {
    this.yaw += deltaX;
    this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch + deltaY));
    this.applyCamera();
  }

  /** Verschiebt den Ausschnitt; gebraucht, wenn die Teile flach im Raster liegen. */
  panBy(deltaX: number, deltaY: number, viewHeight: number) {
    if (viewHeight <= 0) return;
    const halfAngle = (FIELD_OF_VIEW / 2) * (Math.PI / 180);
    const worldPerPixel = (2 * this.distance * Math.tan(halfAngle)) / viewHeight;
    this.panOffset.x -= deltaX * worldPerPixel;
    this.panOffset.y += deltaY * worldPerPixel;
    this.applyCamera();
  }

  zoomBy(scale: number) {
    const lower = this.bodyHeight * 0.28;
    const upper = Math.max(this.bodyHeight, this.layoutSize.height) * 3.4;
    this.distance = Math.max(lower, Math.min(upper, this.distance / scale));
    this.applyCamera();
  }

  setViewpoint(viewpoint: AtlasViewpoint) {
    const { yaw, pitch } = VIEWPOINT_ANGLES[viewpoint];
    this.yaw = yaw;
    this.pitch = pitch;
    this.applyCamera();
  }

  resetCamera() {
    this.distance = this.baseDistance;
    this.panOffset = { x: 0, y: 0 };
    this.setViewpoint('threeQuarter');
  }

  // ----------------------------------------------------------- Sichtbarkeit

  setSystemVisible(id: string, visible: boolean) {
    if (visible) this.hiddenSystems.delete(id);
    else this.hiddenSystems.add(id);
    const batch = this.batches.get(id);
    if (batch) batch.mesh.visible = visible && (this.isolated === null || this.hasIsolatedPart(id));
    this.layoutKey = '';
    this.applyExplode();
  }

  private hasIsolatedPart(systemId: string): boolean {
    if (!this.isolated) return true;
    for (const id of this.isolated) if (this.partSystem.get(id) === systemId) return true;
    return false;
  }

  /** Nur die genannten Teile zeigen. `null` hebt das wieder auf. */
  isolate(partIds: Set<string> | null) {
    this.isolated = partIds;
    for (const [systemId, batch] of this.batches) {
      const systemVisible = !this.hiddenSystems.has(systemId);
      if (!partIds) {
        for (const instanceId of batch.instances.values()) batch.mesh.setVisibleAt(instanceId, true);
        batch.mesh.visible = systemVisible;
        continue;
      }
      let any = false;
      for (const [partId, instanceId] of batch.instances) {
        const show = partIds.has(partId);
        batch.mesh.setVisibleAt(instanceId, show);
        any ||= show;
      }
      batch.mesh.visible = any;
    }
    this.layoutKey = '';
    this.applyExplode();
  }

  /** Hebt ein Teil farblich hervor. */
  select(partId: string | null) {
    if (this.selectedId) {
      const previous = this.batches.get(this.partSystem.get(this.selectedId) ?? '');
      const instanceId = previous?.instances.get(this.selectedId);
      if (previous && instanceId !== undefined) previous.mesh.setColorAt(instanceId, previous.baseColor);
    }
    this.selectedId = partId;
    if (partId) {
      const batch = this.batches.get(this.partSystem.get(partId) ?? '');
      const instanceId = batch?.instances.get(partId);
      if (batch && instanceId !== undefined) {
        batch.mesh.setColorAt(instanceId, new THREE.Color(0x4fb0ff));
      }
    }
    this.needsRender = true;
  }

  /** Welches Teil liegt unter dem Punkt? Koordinaten in Pixeln der Leinwand. */
  pick(x: number, y: number): AtlasPart | null {
    const rect = this.canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2(((x - rect.left) / rect.width) * 2 - 1, -(((y - rect.top) / rect.height) * 2 - 1));
    this.raycaster.setFromCamera(pointer, this.camera);

    const meshes = [...this.batches.values()].filter((b) => b.mesh.visible).map((b) => b.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);
    for (const hit of hits) {
      const batch = this.batches.get((hit.object as THREE.BatchedMesh).name);
      if (!batch || hit.batchId === undefined) continue;
      for (const [partId, instanceId] of batch.instances) {
        if (instanceId === hit.batchId) return this.partsById.get(partId) ?? null;
      }
    }
    return null;
  }

  // ------------------------------------------------------- Auseinanderziehen

  /**
   * Legt alle sichtbaren Netze nebeneinander in ein Raster.
   *
   * Nach Höhe sortiert und Reihe für Reihe aufgefüllt, wie beim Setzen von
   * Regalböden. Die Reihenbreite folgt aus der Gesamtfläche und dem
   * Seitenverhältnis, damit das Ergebnis ungefähr die Form des Fensters hat.
   */
  private buildLayout(parts: AtlasPart[]) {
    if (parts.length === 0) {
      this.layoutCells.clear();
      this.layoutSize = { width: 0, height: 0 };
      return;
    }

    const cells = parts.map((part) => ({
      id: part.id,
      width: Math.max(0.035, part.bounds[1][0] - part.bounds[0][0]) + 0.04,
      height: Math.max(0.035, part.bounds[1][1] - part.bounds[0][1]) + 0.04,
    }));

    const area = cells.reduce((sum, c) => sum + c.width * c.height, 0);
    const widest = Math.max(0.3, ...cells.map((c) => c.width));
    const rowWidth = Math.max(widest, Math.sqrt(area * Math.max(0.5, Math.min(1.5, this.viewAspect))) * 1.18);

    cells.sort((a, b) => (a.height !== b.height ? b.height - a.height : a.id.localeCompare(b.id)));

    const placed = new Map<string, LayoutCell>();
    let x = 0;
    let y = 0;
    let rowHeight = 0;
    let maxX = 0;

    for (const cell of cells) {
      if (x > 0 && x + cell.width > rowWidth) {
        x = 0;
        y += rowHeight;
        rowHeight = 0;
      }
      placed.set(cell.id, { x: x + cell.width / 2, y: -y - cell.height / 2 });
      x += cell.width;
      maxX = Math.max(maxX, x);
      rowHeight = Math.max(rowHeight, cell.height);
    }

    const totalHeight = y + rowHeight;
    this.layoutCells.clear();
    for (const [id, cell] of placed) {
      this.layoutCells.set(id, { x: cell.x - maxX / 2, y: cell.y + totalHeight / 2 });
    }
    this.layoutSize = { width: maxX, height: totalHeight };
  }

  /** `amount` läuft von 0 (zusammengesetzt) bis 1 (jedes Teil einzeln). */
  setExplode(amount: number) {
    this.explodeAmount = Math.max(0, Math.min(1, amount));
    this.applyExplode();
  }

  private visibleParts(): AtlasPart[] {
    return this.atlas.parts.filter((part) => {
      if (this.hiddenSystems.has(part.system)) return false;
      if (this.isolated && !this.isolated.has(part.id)) return false;
      return true;
    });
  }

  private applyExplode() {
    const visible = this.visibleParts();
    const key = `${visible.length}-${visible[0]?.id ?? ''}-${visible[visible.length - 1]?.id ?? ''}-${this.viewAspect.toFixed(2)}`;
    if (key !== this.layoutKey) {
      this.buildLayout(visible);
      this.layoutKey = key;
    }

    // Der Bildausschnitt wandert von der Körperhöhe zur Rasterhöhe mit, sonst
    // läuft das Inventar bei hohen Werten aus dem Bild.
    const targetHeight = Math.max(this.layoutSize.height, this.layoutSize.width / Math.max(this.viewAspect, 0.01));
    const contentHeight = this.bodyHeight + (targetHeight - this.bodyHeight) * this.explodeAmount;
    const halfAngle = (FIELD_OF_VIEW / 2) * (Math.PI / 180);
    this.distance = contentHeight / 2 / Math.tan(halfAngle) / this.usableHeightFraction;
    this.applyCamera();

    const matrix = new THREE.Matrix4();
    for (const [systemId, batch] of this.batches) {
      for (const [partId, instanceId] of batch.instances) {
        const part = this.partsById.get(partId);
        if (!part) continue;
        const cell = this.layoutCells.get(partId);
        if (this.explodeAmount <= 0 || !cell || this.hiddenSystems.has(systemId)) {
          matrix.makeTranslation(part.offset[0], part.offset[1], part.offset[2]);
          batch.mesh.setMatrixAt(instanceId, matrix);
          continue;
        }
        // Das Netz soll mit seinem Mittelpunkt in der Rasterzelle landen. Die
        // Position ist relativ zum Körper, der um -bodyCenter verschoben ist;
        // das muss gegengerechnet werden, sonst liegt das Raster um eine halbe
        // Körperhöhe zu tief.
        const cx = (part.bounds[0][0] + part.bounds[1][0]) / 2;
        const cy = (part.bounds[0][1] + part.bounds[1][1]) / 2;
        const cz = (part.bounds[0][2] + part.bounds[1][2]) / 2;
        const target = {
          x: cell.x + this.bodyCenter.x - cx,
          y: cell.y + this.bodyCenter.y - cy,
          z: this.bodyCenter.z - cz,
        };
        const rest = part.offset;
        matrix.makeTranslation(
          rest[0] + (target.x - rest[0]) * this.explodeAmount,
          rest[1] + (target.y - rest[1]) * this.explodeAmount,
          rest[2] + (target.z - rest[2]) * this.explodeAmount,
        );
        batch.mesh.setMatrixAt(instanceId, matrix);
      }
    }
    this.needsRender = true;
  }

  // ------------------------------------------------------------ Darstellung

  /**
   * Zeichnet nur, wenn sich etwas geändert hat. Ein Atlas, der still
   * dasteht, soll auf einem Telefon keinen Akku verbrauchen.
   */
  private loop = () => {
    if (this.disposed) return;
    this.frameHandle = requestAnimationFrame(this.loop);
    if (!this.needsRender) return;
    this.needsRender = false;
    this.renderer.render(this.scene, this.camera);
  };

  /** Zum Messen: wie viele Zeichenaufrufe kostet ein Bild? */
  get drawCalls(): number {
    return this.renderer.info.render.calls;
  }

  get triangles(): number {
    return this.renderer.info.render.triangles;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameHandle);
    for (const batch of this.batches.values()) {
      batch.mesh.dispose();
      (batch.mesh.material as THREE.Material).dispose();
    }
    this.renderer.dispose();
  }
}

import systemsContent from '../../../../content/atlas-systems.json';
import explanationsContent from '../../../../content/atlas-explanations.json';

/**
 * Lädt das Verzeichnis des 3D-Atlas und stellt daraus die Teileliste
 * zusammen.
 *
 * Spiegelt `AtlasStore.swift` der iOS-App. Die Geometrie selbst holt
 * `AtlasScene`; hier geht es nur um die Metadaten und darum, welche Teile
 * zu welchem Modell gehören.
 */

export interface AtlasPart {
  id: string;
  name: string;
  conceptId: string;
  system: string;
  chunk: number;
  /** Byte-Versatz im Block: Positionen float32, Normalen int16, Indizes uint32. */
  positions: number;
  normals: number;
  indices: number;
  vertexCount: number;
  indexCount: number;
  /** [[minX, minY, minZ], [maxX, maxY, maxZ]] */
  bounds: [number[], number[]];
  /** Aus welchem Datensatz das Teil stammt; im weiblichen Modell gemischt. */
  origin: AtlasSex;
  /** Versatz, mit dem das Teil in die Szene kommt. */
  offset: [number, number, number];
}

export interface AtlasConcept {
  id: string;
  name: string;
  elements: string[];
}

export interface AtlasSystemInfo {
  id: string;
  name: string;
  hex: string;
  description: string;
  femaleDescription?: string;
  hiddenByDefault?: boolean;
}

export type AtlasSex = 'male' | 'female';

interface RawManifest {
  version: string;
  parts: Omit<AtlasPart, 'origin' | 'offset'>[];
  chunks: { url: string; bytes: number }[];
  concepts: AtlasConcept[];
  triangles: number;
  scope: string;
  source: string;
}

export interface LoadedAtlas {
  sex: AtlasSex;
  parts: AtlasPart[];
  concepts: AtlasConcept[];
  triangles: number;
  scope: string;
  source: string;
  version: string;
  /** Dateiname je Herkunft und Blocknummer, etwa `male` → 3 → `body-3`. */
  chunkNames: Record<AtlasSex, Record<number, string>>;
}

export const ATLAS_SYSTEMS: AtlasSystemInfo[] = systemsContent.systems;
export const ATLAS_FILTERS: { id: string; label: string; systems?: string[] }[] = systemsContent.filters;

export function systemById(id: string): AtlasSystemInfo | undefined {
  return ATLAS_SYSTEMS.find((s) => s.id === id);
}

/**
 * Kurze Erklärung zu einer Struktur, ergänzend zur Beschreibung des
 * Systems. Verglichen wird auch mit Teilwörtern, damit etwa „left ovary"
 * die Erklärung zu „ovary" findet.
 */
export function explanationFor(name: string): string | undefined {
  const needle = name.toLowerCase();
  const list = explanationsContent.explanations;
  return (list.find((e) => e.match === needle) ?? list.find((e) => needle.includes(e.match)))?.text;
}

/**
 * Strukturnamen der Quelldaten sind durchgehend kleingeschrieben. Als
 * Überschrift liest sich das schlecht, deshalb hier Wort für Wort groß,
 * wie in `capitalizedStructureName` auf iOS.
 */
export function capitalizeStructure(name: string): string {
  return name
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/** Systeme, die beim Start sichtbar sind. */
export function defaultVisibleSystems(): Set<string> {
  return new Set(ATLAS_SYSTEMS.filter((s) => !s.hiddenByDefault).map((s) => s.id));
}

/**
 * Systeme, die den Körperrahmen bilden. Sie sind weitgehend
 * geschlechtsneutral und kommen im weiblichen Modell aus dem männlichen
 * Datensatz, weil der weibliche sie nicht führt.
 */
const FRAME_SYSTEMS = new Set(['skeletal', 'muscular', 'connective', 'integumentary']);

/**
 * Versatz, mit dem die weichen Strukturen des weiblichen Datensatzes in den
 * männlichen Rahmen passen. Aus dem Vergleich der Hüllquader beider Sätze je
 * System ermittelt, übernommen aus der iOS-Fassung.
 */
const FEMALE_SHIFT: [number, number, number] = [0, 0.05, 0.067];

/**
 * Knochen, die der weibliche Datensatz selbst mitbringt und die den
 * männlichen ersetzen. Das Becken ist der Knochen, an dem sich die
 * Geschlechter deutlich unterscheiden und an dem das auch gelehrt wird.
 */
const FEMALE_BONE_TERMS = ['hip bone', 'sacrum', 'coccyx', 'sternum', 'manubrium', 'ilium', 'ischium', 'pubis'];

function isFemaleSpecificBone(name: string): boolean {
  const lower = name.toLowerCase();
  return FEMALE_BONE_TERMS.some((term) => lower.includes(term));
}

/** „/models/body-3.bin" wird zu „body-3". */
function chunkTable(manifest: RawManifest): Record<number, string> {
  const table: Record<number, string> = {};
  manifest.chunks.forEach((chunk, index) => {
    table[index] = chunk.url.split('/').pop()!.replace(/\.bin$/, '');
  });
  return table;
}

async function fetchManifest(name: string): Promise<RawManifest> {
  const response = await fetch(`/atlas/${name}.json`);
  if (!response.ok) throw new Error(`${name}.json nicht erreichbar (${response.status})`);
  return (await response.json()) as RawManifest;
}

function withOrigin(
  part: RawManifest['parts'][number],
  origin: AtlasSex,
  shift: [number, number, number] = [0, 0, 0],
): AtlasPart {
  // Der Versatz wandert in die Grenzen mit, sonst stimmen Mittelpunkt und
  // Trefferfläche nicht.
  const [dx, dy, dz] = shift;
  return {
    ...part,
    bounds: [
      [part.bounds[0][0] + dx, part.bounds[0][1] + dy, part.bounds[0][2] + dz],
      [part.bounds[1][0] + dx, part.bounds[1][1] + dy, part.bounds[1][2] + dz],
    ],
    origin,
    offset: shift,
  };
}

/**
 * Stellt ein Modell zusammen.
 *
 * Das weibliche ist gemischt: der Human Reference Atlas führt Organe, Gefäße
 * und Nerven, aber weder Arme noch Schädel, Rippen oder Becken. Skelett und
 * Muskulatur kommen deshalb aus BodyParts3D.
 */
export async function loadAtlasManifest(sex: AtlasSex): Promise<LoadedAtlas> {
  const male = await fetchManifest('atlas');
  const chunkNames: LoadedAtlas['chunkNames'] = { male: chunkTable(male), female: {} };

  if (sex === 'male') {
    return {
      sex,
      parts: male.parts.map((p) => withOrigin(p, 'male')),
      concepts: male.concepts,
      triangles: male.triangles,
      scope: male.scope,
      source: male.source,
      version: male.version,
      chunkNames,
    };
  }

  const female = await fetchManifest('atlas-female');
  chunkNames.female = chunkTable(female);

  const parts: AtlasPart[] = [];

  // Rahmen aus dem männlichen Satz, ohne die Knochen, für die es ein
  // weibliches Gegenstück gibt.
  for (const part of male.parts) {
    if (!FRAME_SYSTEMS.has(part.system)) continue;
    if (part.system === 'skeletal' && isFemaleSpecificBone(part.name)) continue;
    parts.push(withOrigin(part, 'male'));
  }

  // Weiches Gewebe und Organe aus dem weiblichen Satz, dazu die
  // geschlechtstypischen Knochen. Alles eingepasst.
  for (const part of female.parts) {
    const isFrame = FRAME_SYSTEMS.has(part.system);
    const isOwnBone = part.system === 'skeletal' && isFemaleSpecificBone(part.name);
    if (isFrame && !isOwnBone) continue;
    parts.push(withOrigin(part, 'female', FEMALE_SHIFT));
  }

  const kept = new Set(parts.map((p) => p.id));
  return {
    sex,
    parts,
    concepts: [...female.concepts, ...male.concepts].filter((c) => c.elements.some((e) => kept.has(e))),
    triangles: parts.reduce((sum, p) => sum + p.indexCount / 3, 0),
    scope:
      'Weibliche Referenz: Organe, Gefäße, Nerven sowie Becken, Kreuzbein und Brustbein aus dem Human ' +
      'Reference Atlas. Die übrigen Knochen und die Muskulatur stammen aus BodyParts3D und sind ' +
      'männlich, ein vollständiger weiblicher Datensatz ist frei nicht verfügbar.',
    source: 'HRA und BodyParts3D',
    version: `${female.version} + ${male.version}`,
    chunkNames,
  };
}

/** Lädt die Binärblöcke, die für die übergebenen Teile gebraucht werden. */
export async function loadChunks(
  atlas: LoadedAtlas,
  onProgress?: (done: number, total: number) => void,
): Promise<Map<string, ArrayBuffer>> {
  const needed = new Set<string>();
  for (const part of atlas.parts) needed.add(`${part.origin}:${part.chunk}`);

  const keys = [...needed];
  const buffers = new Map<string, ArrayBuffer>();
  let done = 0;

  // Nacheinander statt alle auf einmal: 15 gleichzeitige Anfragen über je
  // 4 MB lassen den Speicher auf dem Telefon unnötig hochschnellen.
  for (const key of keys) {
    const [origin, index] = key.split(':') as [AtlasSex, string];
    const name = atlas.chunkNames[origin][Number(index)];
    const response = await fetch(`/atlas/${name}.bin`);
    if (!response.ok) throw new Error(`${name}.bin nicht erreichbar (${response.status})`);
    buffers.set(key, await response.arrayBuffer());
    onProgress?.(++done, keys.length);
  }

  return buffers;
}

/**
 * Prüft die Fachinhalte unter content/ gegeneinander.
 *
 *   node scripts/check-content.mjs
 *
 * Bis 1.1.0 hieß dieses Skript `export-ios-content.mjs` und erzeugte aus den
 * TypeScript-Modulen die JSON-Dateien für iOS. Seit die Inhalte unter
 * `content/` liegen und von beiden Apps direkt gelesen werden, erzeugt es
 * nichts mehr; geblieben ist die Prüfung.
 *
 * Sie fängt still kaputte Sprungziele ab: Fahrplan, Cheat-Sheet, Quiz oder
 * Glossar zeigen auf einen Eintrag, den es nicht mehr gibt. In der App führt
 * das sonst nur zu einer leeren Seite. Läuft vor jedem Build und in der CI.
 */

import { readFile, readdir } from 'node:fs/promises';
import { validate } from './validate-schema.mjs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = resolve(ROOT, 'content');

const read = async (name) => JSON.parse(await readFile(resolve(CONTENT_DIR, name), 'utf8'));

async function main() {
  const problems = [];

  // ---- Gegen die Schemas unter content/schema/ prüfen ---------------------
  // Fängt Tippfehler in Feldnamen, fehlende Pflichtfelder und falsche Typen
  // ab. Dieselben Schemas werten Editoren wie VS Code beim Tippen aus.
  for (const file of (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'))) {
    const data = await read(file);
    if (!data.$schema) {
      problems.push(`${file}: kein $schema eingetragen`);
      continue;
    }
    const schema = JSON.parse(
      await readFile(resolve(CONTENT_DIR, data.$schema.replace(/^\.\//, '')), 'utf8'),
    );
    for (const message of validate(data, schema)) problems.push(`${file} → ${message}`);
  }

  const registry = await read('modules.json');
  const moduleIds = registry.modules.map((m) => m.id);

  // Einträge je Modul einsammeln, gegen die Verweise geprüft werden.
  const byModule = {};
  for (const file of (await readdir(CONTENT_DIR)).filter((f) => f.startsWith('topics-'))) {
    const mod = await read(file);
    byModule[mod.moduleId] = new Set(mod.topics.map((t) => t.id));
  }
  byModule.medikamente = new Set((await read('medikamente.json')).medikamente.map((m) => m.id));
  byModule.ekg = new Set((await read('ekg-rhythms.json')).rhythms.map((r) => r.id));
  byModule.werkzeuge = new Set((await read('werkzeuge.json')).tools.map((t) => t.id));
  byModule.glossar = new Set((await read('glossar.json')).entries.map((e) => e.id));
  byModule.checklisten = new Set((await read('checklisten.json')).checklists.map((c) => c.id));
  byModule.cheatsheet = new Set((await read('cheatsheet.json')).cards.map((c) => c.id));

  const check = (source, moduleId, itemId, label) => {
    if (!moduleIds.includes(moduleId)) {
      problems.push(`${source}: unbekanntes Modul "${moduleId}" (${label})`);
      return;
    }
    if (itemId && byModule[moduleId] && !byModule[moduleId].has(itemId)) {
      problems.push(`${source}: "${itemId}" existiert nicht in ${moduleId} (${label})`);
    }
  };

  for (const section of (await read('roadmap.json')).sections) {
    if (!registry.categories.includes(section.category)) {
      problems.push(`Fahrplan: unbekannte Kategorie "${section.category}"`);
    }
    for (const entry of section.entries) check('Fahrplan', entry.moduleId, entry.itemId, entry.label);
  }
  for (const card of (await read('cheatsheet.json')).cards) {
    if (card.moduleId) check('Cheat-Sheet', card.moduleId, card.itemId, card.title);
  }
  for (const q of (await read('quiz.json')).questions) check('Quiz', q.moduleId, q.itemId, q.id);
  for (const e of (await read('glossar.json')).entries) {
    if (e.moduleId) check('Glossar', e.moduleId, e.itemId, e.abbr);
  }

  // Jedes Modul braucht eine Kategorie, die die Sidebar kennt.
  for (const m of registry.modules) {
    if (!registry.categories.includes(m.category)) {
      problems.push(`Modul-Registry: unbekannte Kategorie "${m.category}" bei ${m.id}`);
    }
  }

  // Jede Kategorie eines Themas muss in der categoryOrder derselben Datei
  // stehen, sonst fällt das Thema in der Gruppierung hinten runter.
  for (const file of (await readdir(CONTENT_DIR)).filter((f) => f.startsWith('topics-'))) {
    const mod = await read(file);
    for (const topic of mod.topics) {
      if (topic.category && !mod.categoryOrder.includes(topic.category)) {
        problems.push(`${file}: Kategorie "${topic.category}" von "${topic.title}" fehlt in categoryOrder`);
      }
    }
  }

  // Jede verknüpfte Abbildung braucht eine Bilddatei und eine Bildunterschrift,
  // sonst zeigt die App an der Stelle stillschweigend nichts an.
  const imageIds = new Set(
    (await readdir(resolve(CONTENT_DIR, 'images')))
      .filter((f) => f.startsWith('illu-') && f.endsWith('.jpg'))
      .map((f) => f.slice('illu-'.length, -'.jpg'.length)),
  );
  const captions = new Map(
    (await read('illustrations.json')).illustrations.map((i) => [i.id, i.caption]),
  );
  for (const file of (await readdir(CONTENT_DIR)).filter((f) => f.startsWith('topics-'))) {
    const mod = await read(file);
    for (const topic of mod.topics) {
      for (const section of topic.sections) {
        const id = section.illustration;
        if (!id) continue;
        if (!imageIds.has(id)) {
          problems.push(`Abbildung: zu "${id}" fehlt content/images/illu-${id}.jpg (${topic.title})`);
        }
        if (!captions.has(id)) {
          problems.push(`Abbildung: zu "${id}" fehlt ein Eintrag in illustrations.json (${topic.title})`);
        }
      }
    }
  }
  for (const [id] of captions) {
    if (!imageIds.has(id)) {
      problems.push(`Abbildung: illustrations.json führt "${id}", aber die Bilddatei fehlt`);
    }
  }

  // Jeder Rechner braucht einen `case` in der Swift-Ansicht, sonst bleibt die
  // Seite auf iOS leer.
  const viewPath = resolve(ROOT, 'ios/SanWissen/Features/Werkzeuge/WerkzeugeView.swift');
  try {
    const swift = await readFile(viewPath, 'utf8');
    for (const tool of (await read('werkzeuge.json')).tools) {
      if (!swift.includes(`case "${tool.id}"`)) {
        problems.push(`Werkzeuge: für "${tool.id}" (${tool.title}) fehlt ein case in WerkzeugeView.swift`);
      }
    }
  } catch {
    // Swift-Ansicht nicht vorhanden — dann ist hier nichts zu prüfen.
  }

  // Jedes Organsystem, das in der Geometrie vorkommt, braucht Namen und Farbe,
  // und umgekehrt darf atlas-systems.json nichts führen, was es nicht gibt.
  // Ohne diese Prüfung fällt eine Umbenennung erst im laufenden Atlas auf,
  // wo das System dann namenlos und grau erscheint.
  const atlasSystems = await read('atlas-systems.json');
  const beschrieben = new Set(atlasSystems.systems.map((s) => s.id));
  const inGeometrie = new Set();
  for (const manifest of ['atlas/atlas.json', 'atlas/atlas-female.json']) {
    for (const part of (await read(manifest)).parts) inGeometrie.add(part.system);
  }
  for (const id of inGeometrie) {
    if (!beschrieben.has(id)) {
      problems.push(`Atlas: System "${id}" kommt in der Geometrie vor, fehlt aber in atlas-systems.json`);
    }
  }
  for (const id of beschrieben) {
    if (!inGeometrie.has(id)) {
      problems.push(`Atlas: atlas-systems.json führt "${id}", aber kein Netz hat dieses System`);
    }
  }
  for (const filter of atlasSystems.filters) {
    for (const id of filter.systems ?? []) {
      if (!beschrieben.has(id)) {
        problems.push(`Atlas: Reiter "${filter.label}" nennt System "${id}", das es nicht gibt`);
      }
    }
  }

  if (problems.length > 0) {
    for (const p of problems) console.error(`✗ ${p}`);
    console.error(`\n${problems.length} Problem(e) in content/.`);
    process.exit(1);
  }

  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));
  console.log(`✓ ${files.length} Inhaltsdateien geprüft, alle Verweise lösen auf.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

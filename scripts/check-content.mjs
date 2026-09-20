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
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = resolve(ROOT, 'content');

const read = async (name) => JSON.parse(await readFile(resolve(CONTENT_DIR, name), 'utf8'));

async function main() {
  const problems = [];

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

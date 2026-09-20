/**
 * Exportiert die Fachinhalte aus den TypeScript-Datenmodulen (src/modules/...)
 * nach JSON, damit die native iOS-App (ios/) dieselben Inhalte liest wie die
 * Desktop-App. Die TS-Dateien bleiben die einzige Pflegestelle — dieses Skript
 * ist nur ein Übersetzer, kein zweiter Inhaltsspeicher.
 *
 *   node scripts/export-ios-content.mjs
 *
 * Geladen wird über Vites SSR-Modullader, damit TypeScript, JSON-Importe und
 * extensionslose Pfade genauso aufgelöst werden wie im normalen Build.
 */

import { createServer } from 'vite';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'ios/SanWissen/Resources/Content');

/**
 * Emoji-Icons der Desktop-Sidebar → SF Symbols. Die iOS-App nutzt native
 * Symbole statt Emoji (siehe README, Abschnitt iOS-App).
 */
const SF_SYMBOLS = {
  ekg: 'waveform.path.ecg',
  algorithmen: 'list.bullet.rectangle.portrait',
  medikamente: 'pills.fill',
  anatomie: 'figure.stand',
  werkzeuge: 'function',
  traumatologie: 'bandage.fill',
  medikamentenvorbereitung: 'syringe.fill',
  sanitaetsdienst: 'tent.fill',
  internistischenotfaelle: 'stethoscope',
  paediatrie: 'figure.child',
  psychiatrienotfaelle: 'brain.head.profile',
  rettungstechnik: 'backpack.fill',
  rechtlichegrundlagen: 'building.columns.fill',
  glossar: 'character.book.closed.fill',
  quiz: 'questionmark.circle.fill',
  checklisten: 'checklist',
  cheatsheet: 'note.text',
};

/**
 * Module mit identischem Datenschema (Themen → Abschnitte → Punkte). Sie
 * werden auf ein gemeinsames `TopicModule`-JSON normalisiert und auf iOS von
 * einer einzigen Ansicht gerendert. `listStyle` unterscheidet nur die Optik:
 * nummerierte Handlungsschritte vs. Merkpunkte.
 */
const TOPIC_MODULES = [
  { id: 'anatomie', file: 'modules/anatomie/data', exportName: 'ANATOMIE_THEMEN', itemsKey: 'facts', listStyle: 'facts' },
  { id: 'traumatologie', file: 'modules/traumatologie/data', exportName: 'TRAUMA_THEMEN', itemsKey: 'facts', listStyle: 'facts' },
  { id: 'internistischenotfaelle', file: 'modules/internistischenotfaelle/data', exportName: 'INTERNISTISCHE_NOTFAELLE_THEMEN', itemsKey: 'facts', listStyle: 'facts' },
  { id: 'paediatrie', file: 'modules/paediatrie/data', exportName: 'PAEDIATRIE_THEMEN', itemsKey: 'facts', listStyle: 'facts' },
  { id: 'psychiatrienotfaelle', file: 'modules/psychiatrienotfaelle/data', exportName: 'PSYCHIATRIENOTFAELLE_THEMEN', itemsKey: 'facts', listStyle: 'facts' },
  { id: 'rettungstechnik', file: 'modules/rettungstechnik/data', exportName: 'RETTUNGSTECHNIK_THEMEN', itemsKey: 'facts', listStyle: 'facts' },
  { id: 'rechtlichegrundlagen', file: 'modules/rechtlichegrundlagen/data', exportName: 'RECHTLICHEGRUNDLAGEN_THEMEN', itemsKey: 'facts', listStyle: 'facts' },
  { id: 'sanitaetsdienst', file: 'modules/sanitaetsdienst/data', exportName: 'SANITAETSDIENST_THEMEN', itemsKey: 'facts', listStyle: 'facts' },
  { id: 'algorithmen', file: 'modules/algorithmen/data', exportName: 'ALGORITHMEN', itemsKey: 'steps', listStyle: 'steps' },
  { id: 'medikamentenvorbereitung', file: 'modules/medikamentenvorbereitung/data', exportName: 'MED_VORBEREITUNG', itemsKey: 'steps', listStyle: 'steps' },
];

/** React-Komponente einer Illustration → stabile ID für die Swift-Entsprechung. */
function illustrationId(component) {
  if (!component) return null;
  const name = component.name || '';
  const match = name.match(/^(.*)Illustration$/);
  return match ? match[1].toLowerCase() : name.toLowerCase() || null;
}

function nullIfEmpty(value) {
  return value === undefined ? null : value;
}

async function main() {
  const server = await createServer({
    root: ROOT,
    configFile: false,
    appType: 'custom',
    server: { middlewareMode: true, hmr: false },
    logLevel: 'warn',
  });

  const load = (path) => server.ssrLoadModule(`/src/${path}`);

  try {
    await rm(OUT_DIR, { recursive: true, force: true });
    await mkdir(OUT_DIR, { recursive: true });

    const written = [];
    const write = async (name, data) => {
      await writeFile(resolve(OUT_DIR, name), JSON.stringify(data, null, 2) + '\n', 'utf8');
      written.push(name);
    };

    // ---- Modul-Registry (Reihenfolge, Kategorien, Anpinnung) ----------------
    const registry = await load('app/registry.tsx');
    const modules = registry.MODULES.map((m) => ({
      id: m.id,
      title: m.title,
      symbol: SF_SYMBOLS[m.id] ?? 'square.grid.2x2',
      category: m.category,
      pinned: m.pinned === true,
      available: m.status === 'available',
    }));
    await write('modules.json', {
      categories: registry.MODULE_CATEGORIES,
      modules,
    });

    // ---- Themenmodule mit gemeinsamem Schema -------------------------------
    const contentStands = {};
    /** moduleId → [{ id, title }], für die Auflösung der Glossar-Verweise. */
    const topicsByModule = {};
    for (const spec of TOPIC_MODULES) {
      const mod = await load(spec.file);
      const entries = mod[spec.exportName];
      if (!Array.isArray(entries)) throw new Error(`${spec.exportName} fehlt in ${spec.file}`);
      if (mod.CONTENT_STAND) contentStands[spec.id] = mod.CONTENT_STAND;

      const meta = modules.find((m) => m.id === spec.id);
      const topics = entries.map((t) => ({
        id: t.id,
        title: t.title,
        category: nullIfEmpty(t.category),
        summary: t.summary,
        minLevel: t.minLevel,
        page: nullIfEmpty(t.page),
        sourceNote: nullIfEmpty(t.sourceNote),
        notes: t.notes ?? [],
        sections: t.sections.map((s) => ({
          heading: nullIfEmpty(s.heading),
          illustration: s.illustrationId ?? illustrationId(s.illustration),
          items: (s[spec.itemsKey] ?? []).map((item) => ({
            text: item.text,
            minLevel: nullIfEmpty(item.minLevel),
          })),
        })),
      }));

      // Kategorie-Reihenfolge aus dem Datenbestand ableiten (erstes Auftreten),
      // damit die iOS-Gruppierung derselben Sortierung folgt wie die Desktop-App.
      const categoryOrder = [];
      for (const t of topics) {
        if (t.category && !categoryOrder.includes(t.category)) categoryOrder.push(t.category);
      }

      topicsByModule[spec.id] = topics.map((t) => ({ id: t.id, title: t.title }));

      await write(`topics-${spec.id}.json`, {
        moduleId: spec.id,
        title: meta?.title ?? spec.id,
        symbol: meta?.symbol ?? 'square.grid.2x2',
        listStyle: spec.listStyle,
        categoryOrder,
        contentStand: mod.CONTENT_STAND ?? null,
        topics,
      });
    }

    // ---- Medikamente ------------------------------------------------------
    const medikamente = await load('modules/medikamente/data');
    contentStands.medikamente = medikamente.CONTENT_STAND;
    const medCategoryOrder = [];
    for (const m of medikamente.MEDIKAMENTE) {
      if (!medCategoryOrder.includes(m.category)) medCategoryOrder.push(m.category);
    }
    await write('medikamente.json', {
      contentStand: medikamente.CONTENT_STAND ?? null,
      categoryOrder: medCategoryOrder,
      medikamente: medikamente.MEDIKAMENTE,
    });

    // ---- EKG: Rhythmen + Elektroden ---------------------------------------
    const rhythms = await load('modules/ekg/rhythms');
    const ekgTypes = await load('modules/ekg/types');
    await write('ekg-rhythms.json', {
      categoryLabels: ekgTypes.CATEGORY_LABELS,
      rhythms: rhythms.RHYTHMS,
    });

    const electrodes = await load('modules/ekg/electrodes/data');
    await write('ekg-electrodes.json', { sets: electrodes.ELECTRODE_SETS });

    // ---- Glossar, Checklisten, Cheat-Sheet, Quiz ---------------------------
    const werkzeugeForRefs = await load('modules/werkzeuge/data');
    topicsByModule.werkzeuge = werkzeugeForRefs.TOOLS.map((t) => ({ id: t.id, title: t.title }));

    const glossar = await load('modules/glossar/data');
    // Viele Beschreibungen enden mit „… siehe <Name>-Modul". Der Verweis wird
    // hier zu einer echten Modul-ID aufgelöst, damit die App daraus einen
    // Sprunglink machen kann statt nur Fließtext anzuzeigen.
    const unresolvedRefs = [];
    const glossarEntries = glossar.GLOSSAR.map((entry) => {
      const match = (entry.description ?? '').match(/siehe\s+([^.,;)]+?)-Modul/i);
      if (!match) return { ...entry, moduleId: null, itemId: null, itemTitle: null };
      const name = match[1].trim().toLowerCase();
      const target = modules.find((m) => m.title.toLowerCase().includes(name));
      if (!target) {
        unresolvedRefs.push(`Glossar: Verweis „${match[0]}" bei ${entry.abbr} passt auf kein Modul`);
        return { ...entry, moduleId: null, itemId: null, itemTitle: null };
      }
      // Wenn es im Zielmodul einen passenden Eintrag gibt (gleiche ID oder die
      // Abkürzung im Titel), direkt dorthin verlinken statt nur zur Modulliste.
      const abbrNorm = entry.abbr.replace(/\s*\/\s*/g, '/').trim().toLowerCase();
      const topics = topicsByModule[target.id] ?? [];
      const item =
        topics.find((t) => t.id.toLowerCase() === abbrNorm) ??
        topics.find((t) => t.title.toLowerCase().includes(abbrNorm));
      return { ...entry, moduleId: target.id, itemId: item?.id ?? null, itemTitle: item?.title ?? null };
    });
    if (unresolvedRefs.length > 0) {
      for (const r of unresolvedRefs) console.error(`✗ ${r}`);
      throw new Error(`${unresolvedRefs.length} Glossar-Verweis(e) lösen nicht auf.`);
    }
    await write('glossar.json', { entries: glossarEntries });

    const checklisten = await load('modules/checklisten/data');
    await write('checklisten.json', { checklists: checklisten.CHECKLISTEN });

    const cheatsheet = await load('modules/cheatsheet/data');
    await write('cheatsheet.json', { cards: cheatsheet.CHEATSHEET_CARDS });

    const quiz = await load('app/quiz/questions');
    await write('quiz.json', { questions: quiz.QUIZ_QUESTIONS });

    // ---- Fahrplan ---------------------------------------------------------
    const roadmap = await load('app/roadmap');
    await write('roadmap.json', {
      sections: registry.MODULE_CATEGORIES.map((category) => ({
        category,
        entries: (roadmap.ROADMAP[category] ?? []).map((e) => ({
          moduleId: e.moduleId,
          itemId: nullIfEmpty(e.itemId),
          label: e.label,
        })),
      })).filter((s) => s.entries.length > 0),
    });

    // ---- Werkzeuge (nur Metadaten — die Rechner sind nativer Swift-Code) ---
    const werkzeuge = await load('modules/werkzeuge/data');
    await write('werkzeuge.json', {
      tools: werkzeuge.TOOLS.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        description: t.description,
        sourceNote: nullIfEmpty(t.sourceNote),
      })),
    });

    // ---- Versionsinfo -----------------------------------------------------
    const pkg = JSON.parse(await (await import('node:fs/promises')).readFile(resolve(ROOT, 'package.json'), 'utf8'));
    await write('meta.json', {
      appVersion: pkg.version,
      exportedAt: new Date().toISOString(),
      contentStands,
    });

    // ---- Konsistenzprüfung ------------------------------------------------
    // Fängt still kaputte Sprungziele ab (Fahrplan/Cheat-Sheet/Quiz zeigen auf
    // einen Eintrag, den es nicht mehr gibt) sowie Rechner ohne Swift-Ansicht —
    // beides führt in der App sonst nur zu einer leeren Seite.
    const problems = await validate(OUT_DIR);
    if (problems.length > 0) {
      for (const p of problems) console.error(`✗ ${p}`);
      throw new Error(`${problems.length} Verweis(e) lösen nicht auf.`);
    }

    console.log(`✓ ${written.length} Dateien nach ios/SanWissen/Resources/Content/ geschrieben:`);
    for (const name of written) console.log(`  · ${name}`);
    console.log('✓ Alle Modul-/Eintrags-Verweise und Rechner-IDs lösen auf.');
  } finally {
    await server.close();
  }
}

/**
 * Prüft die geschriebenen JSON-Dateien gegeneinander: Jeder Verweis aus
 * Fahrplan, Cheat-Sheet und Quiz muss auf ein existierendes Modul und einen
 * existierenden Eintrag zeigen, und jede Werkzeug-ID muss in der Swift-Ansicht
 * einen `case` haben. Liefert eine Liste von Problemen (leer = alles gut).
 */
async function validate(outDir) {
  const { readFile, readdir } = await import('node:fs/promises');
  const read = async (name) => JSON.parse(await readFile(resolve(outDir, name), 'utf8'));

  const modules = (await read('modules.json')).modules.map((m) => m.id);
  const byModule = {};
  for (const file of (await readdir(outDir)).filter((f) => f.startsWith('topics-'))) {
    const mod = await read(file);
    byModule[mod.moduleId] = new Set(mod.topics.map((t) => t.id));
  }
  byModule.medikamente = new Set((await read('medikamente.json')).medikamente.map((m) => m.id));
  byModule.ekg = new Set((await read('ekg-rhythms.json')).rhythms.map((r) => r.id));
  byModule.werkzeuge = new Set((await read('werkzeuge.json')).tools.map((t) => t.id));
  byModule.glossar = new Set((await read('glossar.json')).entries.map((e) => e.id));
  byModule.checklisten = new Set((await read('checklisten.json')).checklists.map((c) => c.id));
  byModule.cheatsheet = new Set((await read('cheatsheet.json')).cards.map((c) => c.id));

  const problems = [];
  const check = (source, moduleId, itemId, label) => {
    if (!modules.includes(moduleId)) {
      problems.push(`${source}: unbekanntes Modul "${moduleId}" (${label})`);
      return;
    }
    if (itemId && byModule[moduleId] && !byModule[moduleId].has(itemId)) {
      problems.push(`${source}: "${itemId}" existiert nicht in ${moduleId} (${label})`);
    }
  };

  for (const section of (await read('roadmap.json')).sections) {
    for (const entry of section.entries) check('Fahrplan', entry.moduleId, entry.itemId, entry.label);
  }
  for (const card of (await read('cheatsheet.json')).cards) {
    if (card.moduleId) check('Cheat-Sheet', card.moduleId, card.itemId, card.title);
  }
  for (const q of (await read('quiz.json')).questions) check('Quiz', q.moduleId, q.itemId, q.id);

  // Jeder Rechner braucht einen `case` in ToolDetailView.
  const viewPath = resolve(ROOT, 'ios/SanWissen/Features/Werkzeuge/WerkzeugeView.swift');
  try {
    const swift = await readFile(viewPath, 'utf8');
    for (const tool of (await read('werkzeuge.json')).tools) {
      if (!swift.includes(`case "${tool.id}"`)) {
        problems.push(`Werkzeuge: für "${tool.id}" (${tool.title}) fehlt ein case in WerkzeugeView.swift`);
      }
    }
  } catch {
    // Swift-Ansicht (noch) nicht vorhanden — dann ist hier nichts zu prüfen.
  }

  return problems;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

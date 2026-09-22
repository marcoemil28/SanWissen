import raw from '../../content/roadmap.json';
import modules from '../../content/modules.json';
import type { ModuleCategory } from './registry';

export interface RoadmapEntry {
  moduleId: string;
  itemId?: string;
  label: string;
}

/**
 * Kuratierter „Fahrplan" je Themenkategorie, aus `content/roadmap.json`.
 * Kein eigenes Modul mit eigenen Inhalten, sondern reine Verlinkung in
 * bestehende Themenmodule (siehe docs/vorgaben_und_inhalte.txt Abschnitt 5).
 *
 * Die Inhaltsdatei führt nur Kategorien mit Einträgen. Hier wird über alle
 * Kategorien aufgefüllt, damit `ROADMAP[category]` nie undefined ist.
 */
export const ROADMAP = Object.fromEntries(
  modules.categories.map((category) => [
    category,
    (raw.sections.find((section) => section.category === category)?.entries ?? []).map((entry) => ({
      moduleId: entry.moduleId,
      itemId: entry.itemId ?? undefined,
      label: entry.label,
    })),
  ]),
) as Record<ModuleCategory, RoadmapEntry[]>;

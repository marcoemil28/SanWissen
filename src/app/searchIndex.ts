import modulesContent from '../../content/modules.json';
import { allTopicModules } from './content';
import { RHYTHMS } from '../modules/ekg/rhythms';
import { MEDIKAMENTE } from '../modules/medikamente/data';
import { TOOLS } from '../modules/werkzeuge/data';
import { GLOSSAR } from '../modules/glossar/data';
import { CHECKLISTEN } from '../modules/checklisten/data';
import { CHEATSHEET_CARDS } from '../modules/cheatsheet/data';

export interface SearchItem {
  key: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  icon: string;
  itemId: string;
  category: string;
  haystack: string;
}

/**
 * Durchsuchbarer Index über alle Module.
 *
 * Bis 1.1.0 stand hier für jedes Modul ein eigener Block, fünfzehn an der
 * Zahl, von denen sich zehn nur in Modul-ID und Feldnamen unterschieden.
 * Die zehn Themenmodule laufen jetzt über eine Schleife; übrig bleiben die
 * Quellen mit eigener Form.
 *
 * Titel, Icon und Kategorie je Modul kommen aus `content/modules.json`,
 * damit Suche und Seitenleiste nicht auseinanderlaufen. Die iOS-Suche
 * macht es genauso.
 */
const MODULE_INFO = new Map(modulesContent.modules.map((m) => [m.id, m]));

function make(moduleId: string, itemId: string, title: string, parts: (string | null | undefined)[]): SearchItem {
  const info = MODULE_INFO.get(moduleId);
  return {
    key: `${moduleId}:${itemId}`,
    title,
    moduleId,
    moduleTitle: info?.title ?? moduleId,
    icon: info?.icon ?? '',
    itemId,
    category: info?.category ?? '',
    haystack: parts.filter(Boolean).join(' ').toLowerCase(),
  };
}

const INDEX: SearchItem[] = [
  ...RHYTHMS.map((r) => make('ekg', r.id, r.nameDe, [r.nameDe, r.nameEn, ...r.keyFeatures])),

  ...MEDIKAMENTE.map((m) =>
    make('medikamente', m.id, m.name, [m.name, m.wirkstoff, m.arzneimittelgruppe, m.indikationen]),
  ),

  // Die zehn Module mit gemeinsamem Schema.
  ...allTopicModules().flatMap((mod) =>
    mod.topics.map((topic) =>
      make(mod.moduleId, topic.id, topic.title, [
        topic.title,
        topic.summary,
        ...topic.sections.flatMap((section) => section.items.map((item) => item.text)),
      ]),
    ),
  ),

  ...TOOLS.map((t) => make('werkzeuge', t.id, t.title, [t.title, t.description, t.category])),

  ...GLOSSAR.map((e) => make('glossar', e.id, e.abbr, [e.abbr, e.meaning, e.description])),

  ...CHECKLISTEN.map((c) =>
    make('checklisten', c.id, c.title, [c.title, c.description, ...c.items.map((i) => i.text)]),
  ),

  ...CHEATSHEET_CARDS.map((c) => make('cheatsheet', c.id, c.title, [c.title, ...c.points])),
];

export function searchAll(query: string, limit = 12): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return INDEX.filter((item) => item.haystack.includes(q)).slice(0, limit);
}

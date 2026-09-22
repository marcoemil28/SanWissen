/**
 * Zugriff auf die Fachinhalte unter `content/`.
 *
 * Die Inhalte liegen als JSON dort und werden von beiden Apps gelesen: die
 * Desktop-App über dieses Modul, die iOS-App direkt aus dem App-Bundle. Bis
 * 1.1.0 waren die TypeScript-Dateien unter `src/modules/` die Quelle und ein
 * Skript erzeugte daraus die JSON-Dateien für iOS. Seither ist es umgekehrt,
 * damit Inhalte sich ändern lassen, ohne Code anzufassen.
 *
 * Die Ansichten arbeiten direkt auf dieser Form. Eine Zwischenschicht, die
 * `items` nach `facts`/`steps` umbenannte, gab es bis zur gemeinsamen
 * Themen-Ansicht; sie wird nicht mehr gebraucht.
 */
export interface RawItem {
  text: string;
}

export interface RawSection {
  heading?: string | null;
  illustration?: string | null;
  items: RawItem[];
}

export interface RawTopic {
  id: string;
  title: string;
  category?: string | null;
  summary: string;
  page?: number | null;
  sourceNote?: string | null;
  notes?: string[];
  sections: RawSection[];
}

export interface RawTopicModule {
  moduleId: string;
  title: string;
  symbol: string;
  listStyle: string;
  categoryOrder: string[];
  contentStand: string | null;
  topics: RawTopic[];
}

/**
 * Alle zehn Themenmodule, nach `moduleId` erreichbar. Wird von der
 * gemeinsamen Ansicht `components/TopicModule.tsx` genutzt, die direkt auf
 * dieser Form arbeitet und `items` nicht erst umbenennen muss.
 */
const TOPIC_MODULES: Record<string, RawTopicModule> = Object.fromEntries(
  Object.values(
    import.meta.glob('../../content/topics-*.json', {
      eager: true,
      import: 'default',
    }) as Record<string, RawTopicModule>,
  ).map((mod) => [mod.moduleId, mod]),
);

/** Alle Themenmodule in stabiler Reihenfolge (nach Dateiname). */
export function allTopicModules(): RawTopicModule[] {
  return Object.values(TOPIC_MODULES);
}

export function topicModuleById(moduleId: string): RawTopicModule {
  const mod = TOPIC_MODULES[moduleId];
  if (!mod) throw new Error(`Kein Themenmodul "${moduleId}" unter content/`);
  return mod;
}

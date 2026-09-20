/**
 * Zugriff auf die Fachinhalte unter `content/`.
 *
 * Die Inhalte liegen als JSON dort und werden von beiden Apps gelesen: die
 * Desktop-App über dieses Modul, die iOS-App direkt aus dem App-Bundle. Bis
 * 1.1.0 waren die TypeScript-Dateien unter `src/modules/` die Quelle und ein
 * Skript erzeugte daraus die JSON-Dateien für iOS. Seither ist es umgekehrt,
 * damit Inhalte sich ändern lassen, ohne Code anzufassen.
 *
 * Dieses Modul bildet die JSON-Form auf die Typen ab, die die bestehenden
 * Desktop-Ansichten erwarten. Die Umbenennung von `items` zurück nach
 * `facts`/`steps` verschwindet, sobald die zehn Themenmodule sich eine
 * gemeinsame Ansicht teilen (siehe docs/inhaltspipeline.md, Schritt 5).
 */
/** JSON kennt nur `null`, die TS-Typen erwarten an diesen Stellen `undefined`. */
function undef<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

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

export function topicModuleById(moduleId: string): RawTopicModule {
  const mod = TOPIC_MODULES[moduleId];
  if (!mod) throw new Error(`Kein Themenmodul "${moduleId}" unter content/`);
  return mod;
}

/**
 * Übersetzt ein Themenmodul aus `content/` in die Form, die die jeweilige
 * Desktop-Ansicht erwartet. `itemsKey` unterscheidet nur die Benennung:
 * Merkpunkte heißen dort `facts`, nummerierte Handlungsschritte `steps`.
 */
export function topicsFrom<T>(raw: RawTopicModule, itemsKey: 'facts' | 'steps'): T[] {
  return raw.topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    category: undef(topic.category),
    summary: topic.summary,
    page: undef(topic.page),
    sourceNote: undef(topic.sourceNote),
    notes: topic.notes ?? [],
    sections: topic.sections.map((section) => ({
      heading: undef(section.heading),
      illustrationId: undef(section.illustration),
      [itemsKey]: section.items.map((item) => ({ text: item.text })),
    })),
  })) as unknown as T[];
}

import type { ComponentType } from 'react';
import raw from '../../../content/werkzeuge.json';
import { GcsCalculator } from './GcsCalculator';
import { NacaScore } from './NacaScore';
import { SchmerzSkala } from './SchmerzSkala';
import { ApgarCalculator } from './ApgarCalculator';
import { NeunerRegel } from './NeunerRegel';
import { VerduennungsRechner } from './VerduennungsRechner';

export interface Tool {
  id: string;
  title: string;
  category: string;
  description: string;
  component: ComponentType;
  /** Woher die Skala stammt, damit jeder Wert nachvollziehbar bleibt. */
  sourceNote?: string;
}

/**
 * Zuordnung Werkzeug-ID → Rechner. Titel, Kategorie, Beschreibung und
 * Quellenhinweis stehen in `content/werkzeuge.json`; die Rechner selbst
 * sind Code und lassen sich nicht als Inhalt ausdrücken.
 */
const COMPONENTS: Record<string, ComponentType> = {
  gcs: GcsCalculator,
  schmerzskala: SchmerzSkala,
  apgar: ApgarCalculator,
  'neuner-regel': NeunerRegel,
  naca: NacaScore,
  verduennung: VerduennungsRechner,
};

/** Zuletzt inhaltlich geprüft/aktualisiert. */
export const CONTENT_STAND = raw.contentStand ?? '';

export const TOOLS: Tool[] = raw.tools.map((tool) => ({
  id: tool.id,
  title: tool.title,
  category: tool.category,
  description: tool.description,
  sourceNote: tool.sourceNote ?? undefined,
  component: COMPONENTS[tool.id],
}));

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

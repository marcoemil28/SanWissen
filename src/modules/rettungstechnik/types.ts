import type { QualificationLevel } from '../../app/levels';

export type RettungstechnikCategory = 'Transport & Trageformen' | 'Lagerungsarten' | 'Atemwege & Beatmung' | 'Gerätekunde';

export interface RettungstechnikFact {
  text: string;
  minLevel?: QualificationLevel;
}

export interface RettungstechnikSection {
  heading?: string;
  facts: RettungstechnikFact[];
  /** ID einer schematischen Zeichnung zu diesem Abschnitt (siehe ios/…/IllustrationView.swift). */
  illustrationId?: string;
}

export interface RettungstechnikTopic {
  id: string;
  title: string;
  category: RettungstechnikCategory;
  minLevel: QualificationLevel;
  summary: string;
  sections: RettungstechnikSection[];
  notes?: string[];
  sourceNote?: string;
}

import type { QualificationLevel } from '../../app/levels';

export type SanitaetsdienstCategory = 'Einsatzorganisation' | 'Kommunikation' | 'Medizinische Besonderheiten';

export interface SanitaetsdienstFact {
  text: string;
  minLevel?: QualificationLevel;
}

export interface SanitaetsdienstSection {
  heading?: string;
  facts: SanitaetsdienstFact[];
  /** ID einer Abbildung zu diesem Abschnitt (siehe ios/…/IllustrationView.swift). */
  illustrationId?: string;
}

export interface SanitaetsdienstTopic {
  id: string;
  title: string;
  category: SanitaetsdienstCategory;
  minLevel: QualificationLevel;
  summary: string;
  sections: SanitaetsdienstSection[];
  notes?: string[];
  sourceNote?: string;
}

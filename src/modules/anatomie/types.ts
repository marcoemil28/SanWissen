import type { QualificationLevel } from '../../app/levels';

export type AnatomieCategory = 'Herz-Kreislauf' | 'Atmung' | 'Skelett & Muskulatur' | 'Nervensystem' | 'Vitalparameter';

export interface AnatomieFact {
  text: string;
  minLevel?: QualificationLevel;
}

export interface AnatomieSection {
  heading?: string;
  facts: AnatomieFact[];
  /** ID einer schematischen Zeichnung zu diesem Abschnitt (siehe ios/…/IllustrationView.swift). */
  illustrationId?: string;
}

export interface AnatomieTopic {
  id: string;
  title: string;
  category: AnatomieCategory;
  minLevel: QualificationLevel;
  summary: string;
  sections: AnatomieSection[];
  notes?: string[];
  sourceNote?: string;
}

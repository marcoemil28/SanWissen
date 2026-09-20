import type { QualificationLevel } from '../../app/levels';

export type PaediatrieCategory = 'Pädiatrie' | 'Geburtshilfe';

export interface PaediatrieFact {
  text: string;
  minLevel?: QualificationLevel;
}

export interface PaediatrieSection {
  heading?: string;
  /** ID einer Abbildung zu diesem Abschnitt (siehe ios/…/IllustrationView.swift). */
  illustrationId?: string;
  facts: PaediatrieFact[];
}

export interface PaediatrieTopic {
  id: string;
  title: string;
  category: PaediatrieCategory;
  minLevel: QualificationLevel;
  summary: string;
  sections: PaediatrieSection[];
  notes?: string[];
  sourceNote?: string;
}

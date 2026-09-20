export type AnatomieCategory = 'Herz-Kreislauf' | 'Atmung' | 'Skelett & Muskulatur' | 'Nervensystem' | 'Vitalparameter';

export interface AnatomieFact {
  text: string;
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
  summary: string;
  sections: AnatomieSection[];
  notes?: string[];
  sourceNote?: string;
}

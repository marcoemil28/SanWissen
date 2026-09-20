export type PaediatrieCategory = 'Pädiatrie' | 'Geburtshilfe';

export interface PaediatrieFact {
  text: string;
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
  summary: string;
  sections: PaediatrieSection[];
  notes?: string[];
  sourceNote?: string;
}

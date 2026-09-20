export type InternistischeNotfaelleCategory =
  | 'Herz & Kreislauf'
  | 'Neurologisch'
  | 'Stoffwechsel & Allergie'
  | 'Abdomen & Vergiftungen'
  | 'Umweltbedingte Notfälle';

export interface InternistischeNotfaelleFact {
  text: string;
}

export interface InternistischeNotfaelleSection {
  heading?: string;
  /** ID einer Abbildung zu diesem Abschnitt (siehe ios/…/IllustrationView.swift). */
  illustrationId?: string;
  facts: InternistischeNotfaelleFact[];
}

export interface InternistischeNotfaelleTopic {
  id: string;
  title: string;
  category: InternistischeNotfaelleCategory;
  summary: string;
  sections: InternistischeNotfaelleSection[];
  notes?: string[];
  sourceNote?: string;
}

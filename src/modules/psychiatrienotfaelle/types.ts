export type PsychiatrieNotfaelleCategory =
  | 'Psychiatrische Notfälle'
  | 'Kommunikation'
  | 'Sterben & Todesfeststellung'
  | 'Großschadenslagen';

export interface PsychiatrieNotfaelleFact {
  text: string;
}

export interface PsychiatrieNotfaelleSection {
  heading?: string;
  facts: PsychiatrieNotfaelleFact[];
}

export interface PsychiatrieNotfaelleTopic {
  id: string;
  title: string;
  category: PsychiatrieNotfaelleCategory;
  summary: string;
  sections: PsychiatrieNotfaelleSection[];
  notes?: string[];
  sourceNote?: string;
}

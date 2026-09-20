export type RechtlicheGrundlagenCategory = 'Grundrechte & Pflichten' | 'Delegation & Kompetenz' | 'Dokumentation';

export interface RechtlicheGrundlagenFact {
  text: string;
}

export interface RechtlicheGrundlagenSection {
  heading?: string;
  /** ID einer Abbildung zu diesem Abschnitt (siehe content/illustrations.json). */
  illustrationId?: string;
  facts: RechtlicheGrundlagenFact[];
}

export interface RechtlicheGrundlagenTopic {
  id: string;
  title: string;
  category: RechtlicheGrundlagenCategory;
  summary: string;
  sections: RechtlicheGrundlagenSection[];
  notes?: string[];
  sourceNote?: string;
}

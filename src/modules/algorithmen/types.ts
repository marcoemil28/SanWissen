export type AlgorithmCategory = 'Herangehensweise & Einschätzung' | 'Atemweg' | 'Kommunikation & Übergabe' | 'Kreislaufstillstand';

export interface AlgorithmStep {
  text: string;
}

export interface AlgorithmSection {
  heading?: string;
  /** ID einer Abbildung zu diesem Abschnitt (siehe ios/…/IllustrationView.swift). */
  illustrationId?: string;
  steps: AlgorithmStep[];
}

export interface AlgorithmEntry {
  id: string;
  title: string;
  category: AlgorithmCategory;
  summary: string;
  sections: AlgorithmSection[];
  notes?: string[];
  /** Seitenzahl in der Quelle (SAA und BPR 2025), falls von dort übernommen. */
  page?: number;
  /** Herkunftshinweis, wenn Inhalte (teilweise) nicht aus dem SAA/BPR-PDF stammen. */
  sourceNote?: string;
}

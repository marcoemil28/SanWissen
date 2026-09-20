import type { QualificationLevel } from '../../app/levels';

export type AlgorithmCategory = 'Herangehensweise & Einschätzung' | 'Atemweg' | 'Kommunikation & Übergabe' | 'Kreislaufstillstand';

export interface AlgorithmStep {
  text: string;
  /** Wenn gesetzt, überschreibt dies das minLevel der Sektion/des Eintrags für diesen einzelnen Schritt. */
  minLevel?: QualificationLevel;
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
  /** Basis-Stufe für Schritte ohne eigenes minLevel. */
  minLevel: QualificationLevel;
  summary: string;
  sections: AlgorithmSection[];
  notes?: string[];
  /** Seitenzahl in der Quelle (SAA und BPR 2025), falls von dort übernommen. */
  page?: number;
  /** Herkunftshinweis, wenn Inhalte (teilweise) nicht aus dem SAA/BPR-PDF stammen. */
  sourceNote?: string;
}

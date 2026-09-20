import type { QualificationLevel } from '../../app/levels';

export interface MedVorbereitungStep {
  text: string;
  /** Wenn gesetzt, überschreibt dies das minLevel des Eintrags für diesen einzelnen Schritt. */
  minLevel?: QualificationLevel;
}

export interface MedVorbereitungSection {
  heading?: string;
  /** ID einer Abbildung zu diesem Abschnitt (siehe ios/…/IllustrationView.swift). */
  illustrationId?: string;
  steps: MedVorbereitungStep[];
}

export interface MedVorbereitungEntry {
  id: string;
  title: string;
  /** Basis-Stufe für Schritte ohne eigenes minLevel. */
  minLevel: QualificationLevel;
  summary: string;
  sections: MedVorbereitungSection[];
  notes?: string[];
  /** Seitenzahl in der Quelle (SAA und BPR 2025), falls von dort übernommen. */
  page?: number;
  /** Herkunftshinweis, wenn Inhalte (teilweise) nicht aus dem SAA/BPR-PDF stammen. */
  sourceNote?: string;
}

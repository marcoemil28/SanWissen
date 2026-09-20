import type { ComponentType } from 'react';

export type TraumaCategory =
  | 'Frakturen & Wunden'
  | 'Verbandslehre'
  | 'Schwere Verletzungen'
  | 'Verbrennungen'
  | 'Polytrauma & Blutstillung';

export interface TraumaFact {
  text: string;
}

export interface TraumaSection {
  heading?: string;
  facts: TraumaFact[];
  /** Optionale stilisierte Beispiel-Illustration (kein Foto) für diesen Abschnitt. */
  illustration?: ComponentType;
  /** ID einer schematischen Zeichnung, die nur die iOS-App rendert. */
  illustrationId?: string;
}

export interface TraumaTopic {
  id: string;
  title: string;
  category: TraumaCategory;
  summary: string;
  sections: TraumaSection[];
  notes?: string[];
  sourceNote?: string;
}

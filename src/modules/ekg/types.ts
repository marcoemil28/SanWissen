export type RhythmCategory =
  | 'Sinusrhythmen'
  | 'Vorhofarrhythmien'
  | 'Kammerarrhythmien'
  | 'Erregungsleitungsstoerungen'
  | 'Kreislaufstillstand'
  | 'Ischaemiezeichen';

export const CATEGORY_LABELS: Record<RhythmCategory, string> = {
  Sinusrhythmen: 'Sinusrhythmen',
  Vorhofarrhythmien: 'Vorhofarrhythmien (supraventrikulär)',
  Kammerarrhythmien: 'Kammerarrhythmien',
  Erregungsleitungsstoerungen: 'Erregungsleitungsstörungen (AV-Blöcke)',
  Kreislaufstillstand: 'Kreislaufstillstand-relevante Rhythmen',
  Ischaemiezeichen: 'Ischämie- / Infarktzeichen',
};

export type RhythmGenSpec =
  | { kind: 'regular-narrow'; hr: [number, number]; prMs?: number }
  | { kind: 'sinus-arrhythmia'; hr: [number, number] }
  | { kind: 'irregular-narrow-no-p'; hr: [number, number] }
  | { kind: 'flutter'; atrialRate: number; conduction: number }
  | { kind: 'regular-wide'; hr: [number, number] }
  | { kind: 'ventricular-flutter'; rate: number }
  | { kind: 'fibrillation'; coarse: boolean }
  | { kind: 'flatline' }
  | { kind: 'av-block-1'; hr: [number, number]; prMs: number }
  | {
      kind: 'av-block-2-wenckebach';
      atrialRate: number;
      prStartMs: number;
      prIncrementMs: number;
      groupSize: number;
    }
  | { kind: 'av-block-2-mobitz2'; atrialRate: number; prMs: number; conduction: number }
  | { kind: 'av-block-3'; atrialRate: number; ventricularRate: number; wideEscape: boolean }
  | { kind: 'ectopic-beat'; hr: [number, number]; every: number }
  | { kind: 'st-elevation'; hr: [number, number]; elevationMv: number }
  | { kind: 'st-depression'; hr: [number, number]; depressionMv: number };

export interface Rhythm {
  id: string;
  nameDe: string;
  nameEn: string;
  category: RhythmCategory;
  difficulty: 1 | 2 | 3;
  /** Ob dieser Rhythmus im Multiple-Choice-Quiz als "erkennbar am Streifen" abgefragt wird. */
  quizEligible: boolean;
  keyFeatures: string[];
  clinicalNote: string;
  gen: RhythmGenSpec;
}

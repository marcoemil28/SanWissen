export type MedikamentKategorie =
  | 'Analgesie & Sedierung'
  | 'Herz-Kreislauf'
  | 'Atemwege & Allergie'
  | 'Gerinnung & Volumen'
  | 'Magen-Darm & Stoffwechsel'
  | 'Antidot & Ausleitung';

export interface Medikament {
  id: string;
  name: string;
  category: MedikamentKategorie;
  wirkstoff: string | null;
  konzentration: string | null;
  arzneimittelgruppe: string | null;
  /** Kurze, allgemeinverständliche Wirkungsbeschreibung (siehe wirkung.ts) — nicht aus dem SAA/BPR-PDF. */
  wirkung: string | null;
  indikationen: string | null;
  kontraindikationen: string | null;
  relativeKontraindikationen: string | null;
  altersbegrenzung: string | null;
  dosierung: string | null;
  uaw: string | null;
  ueberdosierung: string | null;
  besonderheiten: string | null;
  besondereHinweise: string | null;
  /** Seitenzahl in der Quelle (SAA und BPR 2025), zur Nachvollziehbarkeit. */
  page: number;
}

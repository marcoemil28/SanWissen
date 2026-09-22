import raw from '../../../content/ekg-rhythms.json';
import type { Rhythm } from './types';

/**
 * Rhythmus-Bibliothek für den EKG-Trainer (RS-Niveau).
 *
 * WICHTIG: Diese Inhalte basieren auf allgemeinem rettungsdienstlichem
 * Fachwissen und wurden NICHT gegen ein bestimmtes offizielles Skript/
 * Curriculum geprüft. Bitte vor der Prüfung mit deinen Kursunterlagen
 * abgleichen — insbesondere Grenzwerte und Algorithmus-Zuordnungen können
 * je nach Rettungsorganisation/Bundesland leicht variieren.
 */
export const RHYTHMS = raw.rhythms as unknown as Rhythm[];

export function getRhythmById(id: string): Rhythm | undefined {
  return RHYTHMS.find((r) => r.id === id);
}

import raw from '../../../content/topics-medikamentenvorbereitung.json';
import { topicsFrom } from '../../app/content';
import type { MedVorbereitungEntry } from './types';

/**
 * Inhalte aus `content/topics-medikamentenvorbereitung.json`. Diese Datei hält nur noch die
 * Typisierung und den Zugriff; die Texte werden dort gepflegt und von der
 * iOS-App aus derselben Quelle gelesen (siehe docs/inhaltspipeline.md).
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht Stand der Quelle). */
export const CONTENT_STAND = raw.contentStand ?? '';

export const MED_VORBEREITUNG: MedVorbereitungEntry[] = topicsFrom<MedVorbereitungEntry>(raw, 'steps');

export function getMedVorbereitungById(id: string): MedVorbereitungEntry | undefined {
  return MED_VORBEREITUNG.find((entry) => entry.id === id);
}

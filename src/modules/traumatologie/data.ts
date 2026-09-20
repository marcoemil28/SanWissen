import raw from '../../../content/topics-traumatologie.json';
import { topicsFrom } from '../../app/content';
import type { TraumaTopic } from './types';

/**
 * Inhalte aus `content/topics-traumatologie.json`. Diese Datei hält nur noch die
 * Typisierung und den Zugriff; die Texte werden dort gepflegt und von der
 * iOS-App aus derselben Quelle gelesen (siehe docs/inhaltspipeline.md).
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht Stand der Quelle). */
export const CONTENT_STAND = raw.contentStand ?? '';

export const TRAUMA_THEMEN: TraumaTopic[] = topicsFrom<TraumaTopic>(raw, 'facts');

export function getTraumaTopicById(id: string): TraumaTopic | undefined {
  return TRAUMA_THEMEN.find((entry) => entry.id === id);
}

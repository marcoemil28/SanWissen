import raw from '../../../content/topics-rettungstechnik.json';
import { topicsFrom } from '../../app/content';
import type { RettungstechnikTopic } from './types';

/**
 * Inhalte aus `content/topics-rettungstechnik.json`. Diese Datei hält nur noch die
 * Typisierung und den Zugriff; die Texte werden dort gepflegt und von der
 * iOS-App aus derselben Quelle gelesen (siehe docs/inhaltspipeline.md).
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht Stand der Quelle). */
export const CONTENT_STAND = raw.contentStand ?? '';

export const RETTUNGSTECHNIK_THEMEN: RettungstechnikTopic[] = topicsFrom<RettungstechnikTopic>(raw, 'facts');

export function getRettungstechnikTopicById(id: string): RettungstechnikTopic | undefined {
  return RETTUNGSTECHNIK_THEMEN.find((entry) => entry.id === id);
}

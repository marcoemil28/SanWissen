import raw from '../../../content/topics-anatomie.json';
import { topicsFrom } from '../../app/content';
import type { AnatomieTopic } from './types';

/**
 * Inhalte aus `content/topics-anatomie.json`. Diese Datei hält nur noch die
 * Typisierung und den Zugriff; die Texte werden dort gepflegt und von der
 * iOS-App aus derselben Quelle gelesen (siehe docs/inhaltspipeline.md).
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht Stand der Quelle). */
export const CONTENT_STAND = raw.contentStand ?? '';

export const ANATOMIE_THEMEN: AnatomieTopic[] = topicsFrom<AnatomieTopic>(raw, 'facts');

export function getAnatomieTopicById(id: string): AnatomieTopic | undefined {
  return ANATOMIE_THEMEN.find((entry) => entry.id === id);
}

import raw from '../../../content/topics-sanitaetsdienst.json';
import { topicsFrom } from '../../app/content';
import type { SanitaetsdienstTopic } from './types';

/**
 * Inhalte aus `content/topics-sanitaetsdienst.json`. Diese Datei hält nur noch die
 * Typisierung und den Zugriff; die Texte werden dort gepflegt und von der
 * iOS-App aus derselben Quelle gelesen (siehe docs/inhaltspipeline.md).
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht Stand der Quelle). */
export const CONTENT_STAND = raw.contentStand ?? '';

export const SANITAETSDIENST_THEMEN: SanitaetsdienstTopic[] = topicsFrom<SanitaetsdienstTopic>(raw, 'facts');

export function getSanitaetsdienstTopicById(id: string): SanitaetsdienstTopic | undefined {
  return SANITAETSDIENST_THEMEN.find((entry) => entry.id === id);
}

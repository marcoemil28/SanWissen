import raw from '../../../content/topics-internistischenotfaelle.json';
import { topicsFrom } from '../../app/content';
import type { InternistischeNotfaelleTopic } from './types';

/**
 * Inhalte aus `content/topics-internistischenotfaelle.json`. Diese Datei hält nur noch die
 * Typisierung und den Zugriff; die Texte werden dort gepflegt und von der
 * iOS-App aus derselben Quelle gelesen (siehe docs/inhaltspipeline.md).
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht Stand der Quelle). */
export const CONTENT_STAND = raw.contentStand ?? '';

export const INTERNISTISCHE_NOTFAELLE_THEMEN: InternistischeNotfaelleTopic[] = topicsFrom<InternistischeNotfaelleTopic>(raw, 'facts');

export function getInternistischeNotfaelleTopicById(id: string): InternistischeNotfaelleTopic | undefined {
  return INTERNISTISCHE_NOTFAELLE_THEMEN.find((entry) => entry.id === id);
}

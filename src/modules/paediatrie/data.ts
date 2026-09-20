import raw from '../../../content/topics-paediatrie.json';
import { topicsFrom } from '../../app/content';
import type { PaediatrieTopic } from './types';

/**
 * Inhalte aus `content/topics-paediatrie.json`. Diese Datei hält nur noch die
 * Typisierung und den Zugriff; die Texte werden dort gepflegt und von der
 * iOS-App aus derselben Quelle gelesen (siehe docs/inhaltspipeline.md).
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht Stand der Quelle). */
export const CONTENT_STAND = raw.contentStand ?? '';

export const PAEDIATRIE_THEMEN: PaediatrieTopic[] = topicsFrom<PaediatrieTopic>(raw, 'facts');

export function getPaediatrieTopicById(id: string): PaediatrieTopic | undefined {
  return PAEDIATRIE_THEMEN.find((entry) => entry.id === id);
}

import raw from '../../../content/topics-psychiatrienotfaelle.json';
import { topicsFrom } from '../../app/content';
import type { PsychiatrieNotfaelleTopic } from './types';

/**
 * Inhalte aus `content/topics-psychiatrienotfaelle.json`. Diese Datei hält nur noch die
 * Typisierung und den Zugriff; die Texte werden dort gepflegt und von der
 * iOS-App aus derselben Quelle gelesen (siehe docs/inhaltspipeline.md).
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht Stand der Quelle). */
export const CONTENT_STAND = raw.contentStand ?? '';

export const PSYCHIATRIENOTFAELLE_THEMEN: PsychiatrieNotfaelleTopic[] = topicsFrom<PsychiatrieNotfaelleTopic>(raw, 'facts');

export function getPsychiatrieNotfaelleTopicById(id: string): PsychiatrieNotfaelleTopic | undefined {
  return PSYCHIATRIENOTFAELLE_THEMEN.find((entry) => entry.id === id);
}

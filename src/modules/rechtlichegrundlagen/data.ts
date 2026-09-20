import raw from '../../../content/topics-rechtlichegrundlagen.json';
import { topicsFrom } from '../../app/content';
import type { RechtlicheGrundlagenTopic } from './types';

/**
 * Inhalte aus `content/topics-rechtlichegrundlagen.json`. Diese Datei hält nur noch die
 * Typisierung und den Zugriff; die Texte werden dort gepflegt und von der
 * iOS-App aus derselben Quelle gelesen (siehe docs/inhaltspipeline.md).
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht Stand der Quelle). */
export const CONTENT_STAND = raw.contentStand ?? '';

export const RECHTLICHEGRUNDLAGEN_THEMEN: RechtlicheGrundlagenTopic[] = topicsFrom<RechtlicheGrundlagenTopic>(raw, 'facts');

export function getRechtlicheGrundlagenTopicById(id: string): RechtlicheGrundlagenTopic | undefined {
  return RECHTLICHEGRUNDLAGEN_THEMEN.find((entry) => entry.id === id);
}

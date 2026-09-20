import raw from '../../../content/topics-algorithmen.json';
import { topicsFrom } from '../../app/content';
import type { AlgorithmEntry } from './types';

/**
 * Inhalte aus `content/topics-algorithmen.json`. Diese Datei hält nur noch die
 * Typisierung und den Zugriff; die Texte werden dort gepflegt und von der
 * iOS-App aus derselben Quelle gelesen (siehe docs/inhaltspipeline.md).
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht Stand der Quelle). */
export const CONTENT_STAND = raw.contentStand ?? '';

export const ALGORITHMEN: AlgorithmEntry[] = topicsFrom<AlgorithmEntry>(raw, 'steps');

export function getAlgorithmById(id: string): AlgorithmEntry | undefined {
  return ALGORITHMEN.find((entry) => entry.id === id);
}

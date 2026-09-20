import raw from '../../../content/glossar.json';
import type { GlossaryEntry } from './types';

/**
 * Inhalte aus `content/glossar.json`. Die dort zusätzlich hinterlegten Felder
 * `moduleId`/`itemId`/`itemTitle` lösen den Verweis „siehe …-Modul" auf einen
 * Sprunglink auf; die Desktop-Ansicht nutzt sie bisher nicht.
 */
export const GLOSSAR = raw.entries as GlossaryEntry[];

export function getGlossarEntryById(id: string): GlossaryEntry | undefined {
  return GLOSSAR.find((entry) => entry.id === id);
}

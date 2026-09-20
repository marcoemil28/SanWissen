import raw from '../../../content/checklisten.json';
import type { Checklist } from './types';

/** Inhalte aus `content/checklisten.json`. */
export const CHECKLISTEN = raw.checklists as Checklist[];

export function getChecklistById(id: string): Checklist | undefined {
  return CHECKLISTEN.find((list) => list.id === id);
}

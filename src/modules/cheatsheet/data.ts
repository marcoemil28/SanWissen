import raw from '../../../content/cheatsheet.json';
import type { CheatSheetCard } from './types';

/** Inhalte aus `content/cheatsheet.json`. */
export const CHEATSHEET_CARDS = raw.cards as CheatSheetCard[];

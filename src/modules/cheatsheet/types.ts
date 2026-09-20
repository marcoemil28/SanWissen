export interface CheatSheetCard {
  id: string;
  title: string;
  icon: string;
  points: string[];
  moduleId?: string;
  itemId?: string;
  /**
   * Woher die Kurzfassung stammt. Die ausführliche, belegte Darstellung steht
   * im verlinkten Eintrag (moduleId/itemId) — hier steht nur die Primärquelle.
   */
  sourceNote?: string;
}

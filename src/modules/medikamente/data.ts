import raw from '../../../content/medikamente.json';
import type { Medikament } from './types';

/**
 * Quelle: "Standard-Arbeitsanweisungen und Behandlungspfade im Rettungsdienst
 * (SAA und BPR) 2025", Ärztliche Leitungen Rettungsdienst Baden-Württemberg,
 * Brandenburg, Mecklenburg-Vorpommern, Nordrhein-Westfalen, Sachsen und
 * Sachsen-Anhalt, Stand: 30.04.2025.
 *
 * WICHTIG: Diese SAA/BPR richten sich an Notfallsanitäter:innen (NotSan) und
 * beschreiben delegierbare invasive Maßnahmen und Medikamentengaben, die eine
 * dreijährige NotSan-Ausbildung sowie eine ärztliche (Vorab-)Delegation
 * voraussetzen. Das ist NICHT der Kompetenzbereich der (kürzeren)
 * Rettungssanitäter-Ausbildung (RS) — als RS verabreichst du diese
 * Medikamente nicht eigenständig. Dieses Modul dient als Nachschlagewerk /
 * Kontextwissen (z. B. um zu verstehen, was NA/NotSan tun und warum), nicht
 * als RS-Prüfungsstoff im engeren Sinn. Inhalte können sich zwischen
 * Rettungsdienstbereichen und Bundesländern unterscheiden — im Zweifel zählt
 * immer die eigene, aktuell gültige Dienstanweisung.
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht das Datum der Quelle oben). */
export const CONTENT_STAND = raw.contentStand ?? '';

/**
 * Inhalte aus `content/medikamente.json`. Wirkstoffdaten und die ergänzten
 * Kurz-Wirkbeschreibungen lagen früher getrennt in `medications.json` und
 * `wirkung.ts` und wurden hier zusammengesetzt; beides steht jetzt fertig
 * zusammengeführt in der Inhaltsdatei.
 */
export const MEDIKAMENTE = raw.medikamente as Medikament[];

export function getMedikamentById(id: string): Medikament | undefined {
  return MEDIKAMENTE.find((m) => m.id === id);
}

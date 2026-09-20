import raw from '../../../../content/ekg-electrodes.json';
import type { ElectrodeSet } from './types';

/**
 * Elektrodenpositionen nach allgemein gebräuchlichen Standards (u. a.
 * "Ampelschema" für Monitoring-EKG, Wilson-Ableitungen für die
 * Brustwandableitungen V1-V6). Allgemeines Fachwissen, nicht aus einer
 * bestimmten Dienstanweisung — im Zweifel gilt das Vorgehen deines
 * Rettungsdienstbereichs bzw. Geräteherstellers.
 */
export const ELECTRODE_SETS = raw.sets as unknown as ElectrodeSet[];

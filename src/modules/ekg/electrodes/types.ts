import type { QualificationLevel } from '../../../app/levels';

export interface ElectrodeHitZone {
  /** Gültiger y-Bereich (Interkostalraum-Band) im SVG-Koordinatensystem. */
  rowY: [number, number];
  /** Gültiger x-Bereich (Toleranzband um die vertikale Leitlinie). */
  colX: [number, number];
}

export interface ElectrodePoint {
  id: string;
  label: string;
  color: string;
  /** Referenzposition (für Lernansicht/Beschriftung sowie als Fallback-Ziel). */
  x: number;
  y: number;
  description: string;
  /**
   * Wenn gesetzt, wird beim Üben statt eines einfachen Radius-Treffers geprüft,
   * ob die Elektrode sowohl im richtigen Interkostalraum (rowY) als auch auf der
   * richtigen vertikalen Linie (colX) liegt — strenger und realitätsnäher als
   * ein reiner Abstand zu einem Punkt.
   */
  hitZone?: ElectrodeHitZone;
}

export interface ElectrodeSet {
  id: string;
  title: string;
  intro: string;
  points: ElectrodePoint[];
  bodyType: 'full' | 'thorax';
  /**
   * Dateiname eines Hintergrundbildes (nur iOS-App). Ist es gesetzt, zeichnet
   * die App den Körper nicht selbst, sondern legt die Elektroden auf dieses
   * Bild — die Koordinaten beziehen sich dann auf dessen Pixelmaße.
   */
  imageName: string;
  viewBox: { w: number; h: number };
  /** Elektroden legen ist überwiegend eine technische Fertigkeit, keine Kompetenzfrage — daher niedrig angesetzt. */
  minLevel: QualificationLevel;
}

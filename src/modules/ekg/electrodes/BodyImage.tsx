import type { ElectrodeSet } from './types';

/**
 * Zeichnet die Körper- bzw. Thoraxabbildung, auf die sich die Koordinaten in
 * data.ts beziehen. Dieselben Dateien nutzt die iOS-App, damit beide Plattformen
 * dieselben Trefferzonen zeigen — vorher lagen hier gezeichnete SVG-Umrisse in
 * einem eigenen Koordinatensystem, die nach der Neuvermessung nicht mehr passten.
 */
export function BodyImage({ set }: { set: ElectrodeSet }) {
  return (
    <image
      href={`${import.meta.env.BASE_URL}electrodes/${set.imageName}.jpg`}
      x="0"
      y="0"
      width={set.viewBox.w}
      height={set.viewBox.h}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

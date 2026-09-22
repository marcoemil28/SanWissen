import type { ElectrodeSet } from './types';

/**
 * Zeichnet die Körper- bzw. Thoraxabbildung, auf die sich die Koordinaten in
 * data.ts beziehen. Dieselben Dateien nutzt die iOS-App, damit beide Plattformen
 * dieselben Trefferzonen zeigen — vorher lagen hier gezeichnete SVG-Umrisse in
 * einem eigenen Koordinatensystem, die nach der Neuvermessung nicht mehr passten.
 *
 * Die Bilder liegen unter `content/images/` und werden über
 * `import.meta.glob` gebündelt; bis 1.1.0 lag zusätzlich eine Kopie unter
 * `public/electrodes/`.
 */
const IMAGES = import.meta.glob('../../../../content/images/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function BodyImage({ set }: { set: ElectrodeSet }) {
  const src = IMAGES[`../../../../content/images/${set.imageName}.jpg`];
  if (!src) return null;
  return (
    <image
      href={src}
      x="0"
      y="0"
      width={set.viewBox.w}
      height={set.viewBox.h}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

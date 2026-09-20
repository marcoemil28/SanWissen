import illustrationsContent from '../../content/illustrations.json';

/**
 * Zeigt die Abbildung zu einem Abschnitt, sofern eine vorliegt.
 *
 * Bilder und Bildunterschriften liegen unter `content/` und werden von
 * beiden Apps gelesen. Bis 1.1.0 zeichnete der Desktop nur drei Abschnitte
 * als SVG und ignorierte die übrigen 47 verknüpften Abbildungen, die allein
 * auf iOS zu sehen waren.
 *
 * Die Dateien werden über `import.meta.glob` eingebunden, damit Vite sie
 * mitbündelt und sie nicht zusätzlich unter `public/` liegen müssen.
 */
const IMAGES = import.meta.glob('../../content/images/illu-*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const CAPTIONS: Record<string, string> = Object.fromEntries(
  illustrationsContent.illustrations.map((entry) => [entry.id, entry.caption]),
);

export function SectionIllustration({ id }: { id?: string }) {
  if (!id) return null;
  const src = IMAGES[`../../content/images/illu-${id}.jpg`];
  // Fehlt zu einer ID ein Bild, steht der Fließtext des Abschnitts für sich.
  if (!src) return null;

  const caption = CAPTIONS[id] ?? '';
  return (
    <div className="illustration-box">
      <img className="illustration-img" src={src} alt={caption || id} loading="lazy" />
      {caption && <p className="illustration-caption">{caption}</p>}
    </div>
  );
}

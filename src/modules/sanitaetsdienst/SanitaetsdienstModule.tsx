import { useEffect, useMemo, useState } from 'react';
import { SANITAETSDIENST_THEMEN, CONTENT_STAND } from './data';
import type { SanitaetsdienstCategory, SanitaetsdienstTopic } from './types';
import { useNavigation } from '../../app/NavigationContext';
import { FavoriteButton } from '../../components/FavoriteButton';
import { formatStand } from '../../app/formatDate';
import { SectionIllustration } from '../../components/SectionIllustration';

const CATEGORY_ORDER: SanitaetsdienstCategory[] = ['Einsatzorganisation', 'Kommunikation', 'Medizinische Besonderheiten'];

function SanitaetsdienstDetail({ topic }: { topic: SanitaetsdienstTopic }) {
  return (
    <div className="algo-detail">
      <div className="algo-detail-header">
        <div>
          <h2>
            {topic.title}{' '}
            <FavoriteButton
              moduleId="sanitaetsdienst"
              itemId={topic.id}
              title={topic.title}
              moduleTitle="Sanitätsdienst (Veranstaltungsdienst)"
              icon="🎪"
            />
          </h2>
          <p className="algo-summary">{topic.summary}</p>
        </div>
      </div>

      {topic.sections.map((section, i) => (
        <div key={i} className="algo-section">
          {section.heading && <h4>{section.heading}</h4>}
          <SectionIllustration id={section.illustrationId} />
          <ul>
            {section.facts.map((fact, j) => (
              <li key={j}>{fact.text}</li>
            ))}
          </ul>
        </div>
      ))}

      {topic.notes && topic.notes.length > 0 && (
        <div className="algo-notes">
          <h4>Hinweise</h4>
          <ul>
            {topic.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {topic.sourceNote && <p className="algo-source-note">ℹ️ {topic.sourceNote}</p>}
    </div>
  );
}

export function SanitaetsdienstModule() {
  const [selectedId, setSelectedId] = useState(SANITAETSDIENST_THEMEN[0].id);
  const { pending, clearPending } = useNavigation();

  useEffect(() => {
    if (
      pending?.moduleId === 'sanitaetsdienst' &&
      pending.itemId &&
      SANITAETSDIENST_THEMEN.some((t) => t.id === pending.itemId)
    ) {
      setSelectedId(pending.itemId);
      clearPending();
    }
  }, [pending, clearPending]);

  const grouped = useMemo(() => {
    const map = new Map<SanitaetsdienstCategory, SanitaetsdienstTopic[]>();
    for (const t of SANITAETSDIENST_THEMEN) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, []);

  const selected = SANITAETSDIENST_THEMEN.find((t) => t.id === selectedId) ?? SANITAETSDIENST_THEMEN[0];

  return (
    <div className="module sanitaetsdienst-module">
      <header className="module-header">
        <h1>Sanitätsdienst (Veranstaltungsdienst)</h1>
      </header>

      <div className="med-disclaimer">
        ℹ️ Allgemeines Grundlagenwissen zu Wachdienst-Organisation, MANV/Sichtung, Funkdisziplin und Hygiene bei
        Veranstaltungen — keine SAA/BPR-Quelle. Konkrete Abläufe (Kanäle/Rufnamen, Sichtungsschema,
        Hygieneplan) sind organisations- und bundeslandspezifisch geregelt. Inhaltlicher Stand:{' '}
        {formatStand(CONTENT_STAND)}.
      </div>

      <div className="med-layout">
        <aside className="med-list">
          {CATEGORY_ORDER.filter((c) => grouped.has(c)).map((cat) => (
            <div key={cat} className="med-group">
              <h4>{cat}</h4>
              <ul>
                {grouped.get(cat)!.map((t) => (
                  <li key={t.id}>
                    <button className={t.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(t.id)}>
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <SanitaetsdienstDetail topic={selected} />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { INTERNISTISCHE_NOTFAELLE_THEMEN, CONTENT_STAND } from './data';
import type { InternistischeNotfaelleCategory, InternistischeNotfaelleTopic } from './types';
import { useNavigation } from '../../app/NavigationContext';
import { FavoriteButton } from '../../components/FavoriteButton';
import { formatStand } from '../../app/formatDate';
import { SectionIllustration } from '../../components/SectionIllustration';

const CATEGORY_ORDER: InternistischeNotfaelleCategory[] = [
  'Herz & Kreislauf',
  'Neurologisch',
  'Stoffwechsel & Allergie',
  'Abdomen & Vergiftungen',
  'Umweltbedingte Notfälle',
];

function InternistischeNotfaelleDetail({ topic }: { topic: InternistischeNotfaelleTopic }) {
  return (
    <div className="algo-detail">
      <div className="algo-detail-header">
        <div>
          <h2>
            {topic.title}{' '}
            <FavoriteButton
              moduleId="internistischenotfaelle"
              itemId={topic.id}
              title={topic.title}
              moduleTitle="Internistische Notfälle"
              icon="🩺"
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

export function InternistischeNotfaelleModule() {
  const [selectedId, setSelectedId] = useState(INTERNISTISCHE_NOTFAELLE_THEMEN[0].id);
  const { pending, clearPending } = useNavigation();

  useEffect(() => {
    if (
      pending?.moduleId === 'internistischenotfaelle' &&
      pending.itemId &&
      INTERNISTISCHE_NOTFAELLE_THEMEN.some((t) => t.id === pending.itemId)
    ) {
      setSelectedId(pending.itemId);
      clearPending();
    }
  }, [pending, clearPending]);

  const grouped = useMemo(() => {
    const map = new Map<InternistischeNotfaelleCategory, InternistischeNotfaelleTopic[]>();
    for (const t of INTERNISTISCHE_NOTFAELLE_THEMEN) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, []);

  const selected = INTERNISTISCHE_NOTFAELLE_THEMEN.find((t) => t.id === selectedId) ?? INTERNISTISCHE_NOTFAELLE_THEMEN[0];

  return (
    <div className="module internistischenotfaelle-module">
      <header className="module-header">
        <h1>Internistische Notfälle</h1>
      </header>

      <div className="med-disclaimer">
        ℹ️ Allgemeines rettungsdienstliches Grundlagenwissen zur Erkennung und Erstversorgung internistischer
        Notfälle — keine SAA/BPR-Quelle. Ärztlich delegierte Maßnahmen (z. B. Medikamentengabe) sind gesondert
        gekennzeichnet, siehe Medikamente-Modul. Inhaltlicher Stand: {formatStand(CONTENT_STAND)}.
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

        <InternistischeNotfaelleDetail topic={selected} />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { RETTUNGSTECHNIK_THEMEN, CONTENT_STAND } from './data';
import type { RettungstechnikCategory, RettungstechnikTopic } from './types';
import { useNavigation } from '../../app/NavigationContext';
import { FavoriteButton } from '../../components/FavoriteButton';
import { formatStand } from '../../app/formatDate';
import { SectionIllustration } from '../../components/SectionIllustration';

const CATEGORY_ORDER: RettungstechnikCategory[] = ['Transport & Trageformen', 'Lagerungsarten', 'Atemwege & Beatmung', 'Gerätekunde'];

function RettungstechnikDetail({ topic }: { topic: RettungstechnikTopic }) {
  return (
    <div className="algo-detail">
      <div className="algo-detail-header">
        <div>
          <h2>
            {topic.title}{' '}
            <FavoriteButton
              moduleId="rettungstechnik"
              itemId={topic.id}
              title={topic.title}
              moduleTitle="Rettungstechnik & Gerätekunde"
              icon="🎒"
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

export function RettungstechnikModule() {
  const [selectedId, setSelectedId] = useState(RETTUNGSTECHNIK_THEMEN[0].id);
  const { pending, clearPending } = useNavigation();

  useEffect(() => {
    if (
      pending?.moduleId === 'rettungstechnik' &&
      pending.itemId &&
      RETTUNGSTECHNIK_THEMEN.some((t) => t.id === pending.itemId)
    ) {
      setSelectedId(pending.itemId);
      clearPending();
    }
  }, [pending, clearPending]);

  const grouped = useMemo(() => {
    const map = new Map<RettungstechnikCategory, RettungstechnikTopic[]>();
    for (const t of RETTUNGSTECHNIK_THEMEN) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, []);

  const selected = RETTUNGSTECHNIK_THEMEN.find((t) => t.id === selectedId) ?? RETTUNGSTECHNIK_THEMEN[0];

  return (
    <div className="module rettungstechnik-module">
      <header className="module-header">
        <h1>Rettungstechnik & Gerätekunde</h1>
      </header>

      <div className="med-disclaimer">
        ℹ️ Allgemeines rettungsdienstliches Grundlagenwissen zu Trageformen, Lagerung, Atemwegshilfen und
        Gerätekunde — keine SAA/BPR-Quelle. Konkrete Geräte und Checklisten können je nach
        Organisation/Fahrzeugtyp abweichen. Inhaltlicher Stand: {formatStand(CONTENT_STAND)}.
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

        <RettungstechnikDetail topic={selected} />
      </div>
    </div>
  );
}

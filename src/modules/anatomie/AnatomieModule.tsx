import { useEffect, useMemo, useState } from 'react';
import { ANATOMIE_THEMEN, CONTENT_STAND } from './data';
import type { AnatomieCategory, AnatomieTopic } from './types';
import { useNavigation } from '../../app/NavigationContext';
import { FavoriteButton } from '../../components/FavoriteButton';
import { formatStand } from '../../app/formatDate';
import { SectionIllustration } from '../../components/SectionIllustration';

const CATEGORY_ORDER: AnatomieCategory[] = ['Herz-Kreislauf', 'Atmung', 'Skelett & Muskulatur', 'Nervensystem', 'Vitalparameter'];

function AnatomieDetail({ topic }: { topic: AnatomieTopic }) {
  return (
    <div className="algo-detail">
      <div className="algo-detail-header">
        <div>
          <h2>
            {topic.title}{' '}
            <FavoriteButton moduleId="anatomie" itemId={topic.id} title={topic.title} moduleTitle="Anatomie & Physiologie" icon="🫀" />
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

export function AnatomieModule() {
  const [selectedId, setSelectedId] = useState(ANATOMIE_THEMEN[0].id);
  const { pending, clearPending } = useNavigation();

  useEffect(() => {
    if (pending?.moduleId === 'anatomie' && pending.itemId && ANATOMIE_THEMEN.some((t) => t.id === pending.itemId)) {
      setSelectedId(pending.itemId);
      clearPending();
    }
  }, [pending, clearPending]);

  const grouped = useMemo(() => {
    const map = new Map<AnatomieCategory, AnatomieTopic[]>();
    for (const t of ANATOMIE_THEMEN) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, []);

  const selected = ANATOMIE_THEMEN.find((t) => t.id === selectedId) ?? ANATOMIE_THEMEN[0];

  return (
    <div className="module anatomie-module">
      <header className="module-header">
        <h1>Anatomie & Physiologie</h1>
      </header>

      <div className="med-disclaimer">
        ℹ️ Grundlagenwissen zu Aufbau und Funktion des Körpers — als Verständnisbasis für andere Module (z. B.
        Erregungsleitungssystem fürs EKG, vegetatives Nervensystem für Medikamentenwirkungen). Allgemeines
        anatomisch-physiologisches Wissen, keine bestimmte Quelle wie beim SAA/BPR-PDF — für Prüfungsdetails gilt
        dein Kurs-Lehrbuch/Skript. Inhaltlicher Stand: {formatStand(CONTENT_STAND)}.
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

        <AnatomieDetail topic={selected} />
      </div>
    </div>
  );
}

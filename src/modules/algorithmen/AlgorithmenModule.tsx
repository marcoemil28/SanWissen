import { useEffect, useMemo, useState } from 'react';
import { ALGORITHMEN, CONTENT_STAND } from './data';
import type { AlgorithmCategory, AlgorithmEntry } from './types';
import { useNavigation } from '../../app/NavigationContext';
import { FavoriteButton } from '../../components/FavoriteButton';
import { formatStand } from '../../app/formatDate';
import { SectionIllustration } from '../../components/SectionIllustration';

const CATEGORY_ORDER: AlgorithmCategory[] = [
  'Herangehensweise & Einschätzung',
  'Atemweg',
  'Kommunikation & Übergabe',
  'Kreislaufstillstand',
];

function AlgorithmDetail({ entry }: { entry: AlgorithmEntry }) {
  return (
    <div className="algo-detail">
      <div className="algo-detail-header">
        <div>
          <h2>
            {entry.title}{' '}
            <FavoriteButton moduleId="algorithmen" itemId={entry.id} title={entry.title} moduleTitle="Algorithmen" icon="🧭" />
          </h2>
          <p className="algo-summary">{entry.summary}</p>
        </div>
        {entry.page && <span className="med-page-ref">SAA und BPR 2025, S. {entry.page}</span>}
      </div>

      {entry.sections.map((section, i) => (
        <div key={i} className="algo-section">
          {section.heading && <h4>{section.heading}</h4>}
          <SectionIllustration id={section.illustrationId} />
          <ul>
            {section.steps.map((step, j) => (
              <li key={j}>{step.text}</li>
            ))}
          </ul>
        </div>
      ))}

      {entry.notes && entry.notes.length > 0 && (
        <div className="algo-notes">
          <h4>Erläuterungen</h4>
          <ul>
            {entry.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {entry.sourceNote && <p className="algo-source-note">ℹ️ {entry.sourceNote}</p>}
    </div>
  );
}

export function AlgorithmenModule() {
  const [selectedId, setSelectedId] = useState(ALGORITHMEN[0].id);
  const { pending, clearPending } = useNavigation();

  useEffect(() => {
    if (pending?.moduleId === 'algorithmen' && pending.itemId && ALGORITHMEN.some((a) => a.id === pending.itemId)) {
      setSelectedId(pending.itemId);
      clearPending();
    }
  }, [pending, clearPending]);

  const grouped = useMemo(() => {
    const map = new Map<AlgorithmCategory, AlgorithmEntry[]>();
    for (const a of ALGORITHMEN) {
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    }
    return map;
  }, []);

  const selected = ALGORITHMEN.find((a) => a.id === selectedId) ?? ALGORITHMEN[0];

  return (
    <div className="module algorithmen-module">
      <header className="module-header">
        <h1>Algorithmen</h1>
      </header>

      <div className="med-disclaimer">
        ℹ️ Diese Algorithmen fassen die <strong>Herangehensweise- und Kreislaufstillstand-Behandlungspfade</strong>{' '}
        aus den Standard-Arbeitsanweisungen und Behandlungspfaden (SAA/BPR) 2025 zusammen — ergänzt um allgemeines
        Basiswissen (z. B. Laien-Basismaßnahmen bei der Reanimation), das nicht aus dem PDF stammt (siehe
        Quellenhinweis je Eintrag). Inhaltlicher Stand: {formatStand(CONTENT_STAND)}.
      </div>

      <div className="med-layout">
        <aside className="med-list">
          {CATEGORY_ORDER.filter((c) => grouped.has(c)).map((cat) => (
            <div key={cat} className="med-group">
              <h4>{cat}</h4>
              <ul>
                {grouped.get(cat)!.map((a) => (
                  <li key={a.id}>
                    <button className={a.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(a.id)}>
                      {a.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <AlgorithmDetail entry={selected} />
      </div>
    </div>
  );
}

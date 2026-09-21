import { useEffect, useMemo, useState } from 'react';
import { TOOLS } from './data';
import { useNavigation } from '../../app/NavigationContext';
import { BackLink, DisclaimerBox, RowGroup, RowLink, SectionBox } from '../../components/SectionBox';

/**
 * Rechner und Scores. Wie in `WerkzeugeView` der iOS-App zuerst nur die
 * Liste; ein Werkzeug öffnet sich als eigene Seite.
 */
export function WerkzeugeModule() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { pending, clearPending } = useNavigation();

  useEffect(() => {
    if (pending?.moduleId === 'werkzeuge' && pending.itemId && TOOLS.some((t) => t.id === pending.itemId)) {
      setSelectedId(pending.itemId);
      clearPending();
    }
  }, [pending, clearPending]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof TOOLS>();
    for (const t of TOOLS) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, []);

  const selected = selectedId ? TOOLS.find((t) => t.id === selectedId) ?? null : null;

  if (selected) {
    const SelectedComponent = selected.component;
    return (
      <div className="module werkzeuge-module">
        <BackLink label="Werkzeuge & Scores" onClick={() => setSelectedId(null)} />

        <div className="algo-detail">
          <div className="algo-detail-header">
            <div>
              <h2>{selected.title}</h2>
              <p className="algo-summary">{selected.description}</p>
            </div>
          </div>
          <SelectedComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="module werkzeuge-module">
      <header className="page-header">
        <h1>Werkzeuge &amp; Scores</h1>
      </header>

      <DisclaimerBox>
        Interaktive Rechner für standardisierte Scores, allgemein gebräuchliche Skalen ohne SAA/BPR-Quelle.
        Ergebnisse sind eine Einschätzungshilfe, keine automatische Diagnose oder Handlungsanweisung.
      </DisclaimerBox>

      {[...grouped.entries()].map(([category, items]) => (
        <SectionBox key={category} title={category}>
          <RowGroup>
            {items.map((t) => (
              <RowLink key={t.id} title={t.title} subtitle={t.description} onClick={() => setSelectedId(t.id)} />
            ))}
          </RowGroup>
        </SectionBox>
      ))}
    </div>
  );
}

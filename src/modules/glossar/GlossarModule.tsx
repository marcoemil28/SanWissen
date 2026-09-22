import { useEffect, useMemo, useState } from 'react';
import { GLOSSAR, getGlossarEntryById } from './data';
import { useNavigation } from '../../app/NavigationContext';
import { DisclaimerBox } from '../../components/SectionBox';

export function GlossarModule() {
  const [query, setQuery] = useState('');
  const { pending, clearPending } = useNavigation();

  useEffect(() => {
    if (pending?.moduleId === 'glossar' && pending.itemId) {
      const entry = getGlossarEntryById(pending.itemId);
      if (entry) setQuery(entry.abbr);
      clearPending();
    }
  }, [pending, clearPending]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSAR;
    return GLOSSAR.filter(
      (e) => e.abbr.toLowerCase().includes(q) || e.meaning.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="module glossar-module">
      <header className="page-header">
        <h1>Glossar & Abkürzungsverzeichnis</h1>
      </header>

      <DisclaimerBox>
        RS-typische Abkürzungen und Fachbegriffe zum Nachschlagen, allgemeines Grundlagenwissen ohne
        SAA/BPR-Quelle. Viele Einträge verweisen auf das jeweilige Fachmodul für weitere Details.
      </DisclaimerBox>

      <input
        type="text"
        className="glossar-search"
        placeholder="Abkürzung oder Begriff suchen…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="glossar-list">
        {filtered.length === 0 && <p className="global-search-empty">Keine Treffer.</p>}
        {filtered.map((entry) => (
          <div key={entry.id} className="glossar-entry">
            <div className="glossar-entry-abbr">{entry.abbr}</div>
            <div className="glossar-entry-body">
              <p className="glossar-entry-meaning">{entry.meaning}</p>
              {entry.description && <p className="glossar-entry-description">{entry.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

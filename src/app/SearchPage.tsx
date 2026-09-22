import { useMemo, useState } from 'react';
import { searchAll } from './searchIndex';
import { useNavigation } from './NavigationContext';
import { RowGroup, RowLink } from '../components/SectionBox';

/**
 * Suche als eigene Seite, für den gleichnamigen Reiter auf schmalen
 * Fenstern. Entspricht `SearchView` der iOS-App.
 *
 * Am Schreibtisch sitzt die Suche als Feld mit Auswahlliste oben in der
 * Seitenleiste (`GlobalSearch`); beide greifen auf denselben Index zu.
 */
export function SearchPage({ onNavigateModule }: { onNavigateModule: (moduleId: string) => void }) {
  const [query, setQuery] = useState('');
  const { goTo } = useNavigation();

  const results = useMemo(() => searchAll(query), [query]);
  const trimmed = query.trim();

  function open(moduleId: string, itemId: string) {
    goTo({ moduleId, itemId });
    onNavigateModule(moduleId);
  }

  return (
    <div className="module search-page">
      <header className="page-header">
        <h1>Suche</h1>
      </header>

      <div className="search-page-field">
        <input
          type="search"
          placeholder="Alles durchsuchen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {!trimmed && <p className="section-box-hint">Durchsucht alle Module auf einmal: Themen, Medikamente, Glossar, Checklisten und Rhythmen.</p>}

      {trimmed && results.length === 0 && <p className="section-box-hint">Keine Treffer.</p>}

      {trimmed && results.length > 0 && (
        <RowGroup>
          {results.map((r) => (
            <RowLink
              key={r.key}
              icon={r.icon}
              title={r.title}
              subtitle={`${r.moduleTitle} · ${r.category}`}
              onClick={() => open(r.moduleId, r.itemId)}
            />
          ))}
        </RowGroup>
      )}
    </div>
  );
}

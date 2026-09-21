import { useMemo } from 'react';
import { MODULES, MODULE_CATEGORIES, type LearningModule, type ModuleCategory } from './registry';
import { RowGroup, RowLink, SectionBox } from '../components/SectionBox';

/**
 * Alle Module als gruppierte Liste, nachgebaut nach `ModuleListView` der
 * iOS-App: oben ohne Überschrift die angepinnten Module, darunter je
 * Kategorie ein Abschnitt.
 *
 * Gebraucht wird das nur auf schmalen Fenstern, wo statt der Seitenleiste
 * unten eine Reiterleiste steht. Am Schreibtisch führt die Seitenleiste
 * dieselben Einträge.
 */
export function ModuleListPage({ onNavigateModule }: { onNavigateModule: (moduleId: string) => void }) {
  const pinned = useMemo(() => MODULES.filter((m) => m.pinned), []);

  const groups = useMemo(() => {
    const map = new Map<ModuleCategory, LearningModule[]>();
    for (const category of MODULE_CATEGORIES) map.set(category, []);
    for (const m of MODULES) {
      if (m.pinned) continue;
      map.get(m.category)!.push(m);
    }
    return MODULE_CATEGORIES.map((category) => ({ category, modules: map.get(category)! })).filter(
      (g) => g.modules.length > 0
    );
  }, []);

  function row(m: LearningModule) {
    return (
      <RowLink
        key={m.id}
        icon={m.icon}
        title={m.title}
        onClick={() => onNavigateModule(m.id)}
        disabled={m.status === 'coming-soon'}
        badge={m.status === 'coming-soon' ? 'bald' : undefined}
      />
    );
  }

  return (
    <div className="module module-list-page">
      <header className="page-header">
        <h1>Module</h1>
      </header>

      <div className="section-box">
        <RowGroup>{pinned.map(row)}</RowGroup>
      </div>

      {groups.map((g) => (
        <SectionBox key={g.category} title={g.category}>
          <RowGroup>{g.modules.map(row)}</RowGroup>
        </SectionBox>
      ))}
    </div>
  );
}

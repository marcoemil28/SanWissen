import { useEffect, useMemo, useState } from 'react';
import { MODULES, MODULE_CATEGORIES, type LearningModule, type ModuleCategory } from './registry';
import { ROADMAP } from './roadmap';
import { useNavigation } from './NavigationContext';
import { getFavorites, subscribeFavorites } from './favorites';
import { DisclaimerBox, RowGroup, RowLink, SectionBox } from '../components/SectionBox';
import { getProgress as getEkgProgress } from '../modules/ekg/progress';
import { getProgress as getQuizProgress } from './quiz/progress';

/**
 * Startseite, aufgebaut wie `HomeView` der iOS-App: Kopf, fachlicher
 * Hinweis, Favoriten, Fortschritt, Schnellzugriff, alle Module nach Thema
 * und zuletzt der Fahrplan.
 */

const DISCLAIMER =
  'Jeder Eintrag nennt seine Quelle. Medikamente, Algorithmen und Schemata sind gegen „SAA und BPR 2025" ' +
  'geprüft, andere Themen stützen sich auf Leitlinien und Ausbildungsunterlagen. Landesspezifisches bezieht ' +
  'sich auf Baden-Württemberg. Trotzdem gilt: vor der Prüfung mit den eigenen Kursunterlagen abgleichen. ' +
  'Grenzwerte, Algorithmen und Zuständigkeiten unterscheiden sich je nach Organisation und Bundesland. ' +
  'Diese App ersetzt keine offizielle Ausbildung.';

interface Tally {
  attempts: number;
  correct: number;
}

function tally(stats: { attempts: number; correct: number }[]): Tally {
  return {
    attempts: stats.reduce((sum, s) => sum + s.attempts, 0),
    correct: stats.reduce((sum, s) => sum + s.correct, 0),
  };
}

function ProgressTile({ title, stat }: { title: string; stat: Tally }) {
  const accuracy = Math.round((stat.correct / stat.attempts) * 100);
  return (
    <div className="progress-tile">
      <span className="progress-tile-title">{title}</span>
      <strong className="progress-tile-value">{accuracy} %</strong>
      <span className="progress-tile-detail">
        {stat.correct}/{stat.attempts} richtig
      </span>
    </div>
  );
}

export function HomePage({ onNavigateModule }: { onNavigateModule: (moduleId: string) => void }) {
  const { goTo } = useNavigation();
  const [favorites, setFavorites] = useState(getFavorites);
  const [openRoadmap, setOpenRoadmap] = useState<ModuleCategory | null>(null);

  useEffect(() => subscribeFavorites(() => setFavorites(getFavorites())), []);

  const ekg = useMemo(() => tally(Object.values(getEkgProgress())), []);
  const quiz = useMemo(() => tally(Object.values(getQuizProgress())), []);

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

  const moduleTitle = useMemo(() => {
    const map = new Map(MODULES.map((m) => [m.id, m.title] as const));
    return (id: string) => map.get(id) ?? id;
  }, []);

  function open(moduleId: string, itemId?: string) {
    if (itemId) goTo({ moduleId, itemId });
    onNavigateModule(moduleId);
  }

  return (
    <div className="module home-page">
      <header className="page-header">
        <h1>SanWissen</h1>
        <p className="page-subtitle">Lern- und Nachschlagewerk für den Sanitäts- und Rettungsdienst</p>
        <p className="page-caption">Version {__APP_VERSION__} · komplett offline</p>
      </header>

      <DisclaimerBox>{DISCLAIMER}</DisclaimerBox>

      {favorites.length > 0 && (
        <SectionBox title="Deine Favoriten" icon="★">
          <RowGroup>
            {favorites.map((f) => (
              <RowLink
                key={f.key}
                icon={f.icon}
                title={f.title}
                subtitle={moduleTitle(f.moduleId)}
                onClick={() => open(f.moduleId, f.itemId)}
              />
            ))}
          </RowGroup>
        </SectionBox>
      )}

      {(ekg.attempts > 0 || quiz.attempts > 0) && (
        <SectionBox title="Dein Fortschritt" icon="📊">
          <div className="progress-row">
            {ekg.attempts > 0 && <ProgressTile title="EKG-Quiz" stat={ekg} />}
            {quiz.attempts > 0 && <ProgressTile title="Prüfungsquiz" stat={quiz} />}
          </div>
        </SectionBox>
      )}

      <SectionBox title="Schnellzugriff" icon="⚡">
        <div className="quick-grid">
          {pinned.map((m) => (
            <button key={m.id} type="button" className="quick-tile" onClick={() => open(m.id)}>
              <span className="quick-tile-icon" aria-hidden="true">
                {m.icon}
              </span>
              <span className="quick-tile-title">{m.title}</span>
            </button>
          ))}
        </div>
      </SectionBox>

      {groups.map((g) => (
        <SectionBox key={g.category} title={g.category}>
          <RowGroup>
            {g.modules.map((m) => (
              <RowLink
                key={m.id}
                icon={m.icon}
                title={m.title}
                onClick={() => open(m.id)}
                disabled={m.status === 'coming-soon'}
                badge={m.status === 'coming-soon' ? 'bald' : undefined}
              />
            ))}
          </RowGroup>
        </SectionBox>
      ))}

      <SectionBox title="Dein Fahrplan" icon="🗺️">
        <p className="section-box-hint">
          Kuratierte Reihenfolge durch die bestehenden Module, reine Verlinkung ohne eigene Inhalte.
        </p>
        {MODULE_CATEGORIES.map((category) => {
          const open_ = openRoadmap === category;
          return (
            <div key={category} className="roadmap-group">
              <button
                type="button"
                className="roadmap-toggle"
                onClick={() => setOpenRoadmap(open_ ? null : category)}
                aria-expanded={open_}
              >
                <span>{category}</span>
                <span className={`roadmap-chevron ${open_ ? 'open' : ''}`} aria-hidden="true">
                  ›
                </span>
              </button>
              {open_ && (
                <RowGroup>
                  {ROADMAP[category].map((entry, i) => (
                    <RowLink
                      key={i}
                      icon={MODULES.find((m) => m.id === entry.moduleId)?.icon ?? '•'}
                      title={entry.label}
                      subtitle={moduleTitle(entry.moduleId)}
                      onClick={() => open(entry.moduleId, entry.itemId)}
                    />
                  ))}
                </RowGroup>
              )}
            </div>
          );
        })}
      </SectionBox>
    </div>
  );
}

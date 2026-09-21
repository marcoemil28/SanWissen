import { useEffect, useMemo, useState } from 'react';
import { MODULES, MODULE_CATEGORIES, type LearningModule } from './app/registry';
import { NavigationProvider } from './app/NavigationContext';
import { GlobalSearch } from './app/GlobalSearch';
import { HomePage } from './app/HomePage';
import { ModuleListPage } from './app/ModuleListPage';
import { SearchPage } from './app/SearchPage';
import { AppearancePicker } from './app/AppearancePicker';
import { GridIcon, HomeIcon, QuestionIcon, SearchIcon } from './app/TabIcons';
import {
  applyAppearance,
  loadAppearance,
  resolveAppearance,
  saveAppearance,
  watchSystemAppearance,
  type AppearanceMode,
} from './app/appearance';
import './App.css';

/**
 * Reiter der unteren Leiste auf schmalen Fenstern, dieselben vier wie in
 * der TabView der iOS-App.
 */
const TABS = [
  { id: 'home', label: 'Start', Icon: HomeIcon },
  { id: 'modules', label: 'Module', Icon: GridIcon },
  { id: 'quiz', label: 'Quiz', Icon: QuestionIcon },
  { id: 'search', label: 'Suche', Icon: SearchIcon },
] as const;

function AppShell() {
  const [activeId, setActiveId] = useState('home');
  const [appearance, setAppearance] = useState<AppearanceMode>(loadAppearance);
  const resolved = resolveAppearance(appearance);
  const highContrast = resolved === 'contrast';
  function navigate(moduleId: string) {
    setActiveId(moduleId);
  }

  const activeModule = MODULES.find((m) => m.id === activeId);
  const ActiveComponent = activeModule?.component;

  /*
   * Welcher Reiter leuchtet. Alles, was weder Start, Quiz noch Suche ist,
   * liegt unter „Module" — also auch ein geöffnetes Modul. Ein Tippen auf
   * den schon aktiven Reiter führt zurück zur Liste, so wie es eine
   * TabView auf iOS macht.
   */
  const activeTab =
    activeId === 'home' || activeId === 'quiz' || activeId === 'search' ? activeId : 'modules';

  useEffect(() => {
    saveAppearance(appearance);
    applyAppearance(resolveAppearance(appearance));
  }, [appearance]);

  /*
   * Bei „Automatisch" muss ein Wechsel der Systemeinstellung ankommen,
   * ohne dass die App neu geladen wird. Das erneute Auflösen erledigt der
   * Zustandswechsel oben; hier reicht ein Anstoß zum Neuzeichnen.
   */
  useEffect(() => {
    if (appearance !== 'system') return;
    return watchSystemAppearance(() => applyAppearance(resolveAppearance('system')));
  }, [appearance]);

  const pinnedModules = useMemo(() => MODULES.filter((m) => m.pinned), []);

  const groups = useMemo(() => {
    const map = new Map<string, LearningModule[]>();
    for (const category of MODULE_CATEGORIES) map.set(category, []);
    for (const m of MODULES) {
      if (m.pinned) continue;
      map.get(m.category)!.push(m);
    }
    return MODULE_CATEGORIES.map((category) => ({ category, modules: map.get(category)! })).filter(
      (g) => g.modules.length > 0
    );
  }, []);

  return (
    <div className={`app-shell ${highContrast ? 'high-contrast' : ''}`}>
      {/*
        Auf schmalen Fenstern steckt die Seitenleiste nicht in einer
        Schublade, sondern entfällt zugunsten der Reiterleiste unten. Der
        Umschalter für die Darstellung sitzt dann oben rechts, wie der
        entsprechende Knopf in der Werkzeugleiste auf iOS.
      */}
      <div className="app-floating-appearance">
        <AppearancePicker value={appearance} onChange={setAppearance} />
      </div>

      <aside className="app-sidebar">
        <div className="app-brand">
          <span className="app-brand-icon">🚑</span>
          <span>SanWissen</span>
          <span className="app-brand-version">v{__APP_VERSION__}</span>
        </div>

        <GlobalSearch onNavigate={navigate} />

        <nav className="app-nav">
          <button className={`app-nav-item ${activeId === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>
            <span className="app-nav-icon">🏠</span>
            <span>Startseite</span>
          </button>

          {pinnedModules.map((m) => (
            <button
              key={m.id}
              className={`app-nav-item ${m.id === activeId ? 'active' : ''}`}
              onClick={() => navigate(m.id)}
            >
              <span className="app-nav-icon">{m.icon}</span>
              <span>{m.title}</span>
            </button>
          ))}

          {groups.map((g) => (
            <div key={g.category} className="app-nav-group">
              <h4>{g.category}</h4>
              {g.modules.map((m) => (
                <button
                  key={m.id}
                  className={`app-nav-item ${m.id === activeId ? 'active' : ''} ${
                    m.status === 'coming-soon' ? 'disabled' : ''
                  }`}
                  onClick={() => m.status === 'available' && navigate(m.id)}
                  disabled={m.status === 'coming-soon'}
                >
                  <span className="app-nav-icon">{m.icon}</span>
                  <span>{m.title}</span>
                  {m.status === 'coming-soon' && <span className="badge">bald</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          <AppearancePicker value={appearance} onChange={setAppearance} />
        </div>
      </aside>

      <main className="app-content">
        {activeId === 'home' ? (
          <HomePage onNavigateModule={navigate} />
        ) : activeId === 'modules' ? (
          <ModuleListPage onNavigateModule={navigate} />
        ) : activeId === 'search' ? (
          <SearchPage onNavigateModule={navigate} />
        ) : ActiveComponent ? (
          <ActiveComponent onNavigateModule={navigate} />
        ) : (
          <div className="coming-soon">Dieses Modul ist noch nicht verfügbar.</div>
        )}
      </main>

      <nav className="app-tabbar" aria-label="Hauptbereiche">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`app-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => navigate(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="app-tab-icon">
              <tab.Icon />
            </span>
            <span className="app-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function App() {
  return (
    <NavigationProvider>
      <AppShell />
    </NavigationProvider>
  );
}

export default App;

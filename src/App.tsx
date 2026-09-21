import { useEffect, useMemo, useState } from 'react';
import { MODULES, MODULE_CATEGORIES, type LearningModule } from './app/registry';
import { NavigationProvider } from './app/NavigationContext';
import { GlobalSearch } from './app/GlobalSearch';
import { HomePage } from './app/HomePage';
import { AppearancePicker } from './app/AppearancePicker';
import {
  applyAppearance,
  loadAppearance,
  resolveAppearance,
  saveAppearance,
  watchSystemAppearance,
  type AppearanceMode,
} from './app/appearance';
import './App.css';

function AppShell() {
  const [activeId, setActiveId] = useState('home');
  const [appearance, setAppearance] = useState<AppearanceMode>(loadAppearance);
  const resolved = resolveAppearance(appearance);
  const highContrast = resolved === 'contrast';
  /**
   * Auf schmalen Fenstern liegt die Seitenleiste als Schublade über dem
   * Inhalt statt daneben. Gesteuert wird sie hier, sichtbar wird der
   * Unterschied allein über CSS (siehe `@media` in App.css) — so gibt es
   * keinen zweiten Umschaltpunkt, der mit dem im Stylesheet auseinanderlaufen
   * könnte.
   */
  const [menuOpen, setMenuOpen] = useState(false);

  /** Nach jedem Modulwechsel schließt die Schublade, sonst verdeckt sie das Ziel. */
  function navigate(moduleId: string) {
    setActiveId(moduleId);
    setMenuOpen(false);
  }
  const activeModule = MODULES.find((m) => m.id === activeId);
  const ActiveComponent = activeModule?.component;

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
    <div className={`app-shell ${highContrast ? 'high-contrast' : ''} ${menuOpen ? 'menu-open' : ''}`}>
      <button
        className="app-menu-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Schließt die Schublade beim Tippen daneben. */}
      <div className="app-scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />

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
        ) : ActiveComponent ? (
          <ActiveComponent onNavigateModule={navigate} />
        ) : (
          <div className="coming-soon">Dieses Modul ist noch nicht verfügbar.</div>
        )}
      </main>
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

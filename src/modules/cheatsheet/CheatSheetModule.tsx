import { CHEATSHEET_CARDS } from './data';
import { useNavigation } from '../../app/NavigationContext';
import type { ModuleProps } from '../../app/registry';
import { DisclaimerBox } from '../../components/SectionBox';

export function CheatSheetModule({ onNavigateModule }: ModuleProps) {
  const { goTo } = useNavigation();

  function handleOpen(moduleId: string, itemId?: string) {
    if (itemId) goTo({ moduleId, itemId });
    onNavigateModule?.(moduleId);
  }

  return (
    <div className="module cheatsheet-module">
      <header className="page-header cheatsheet-header">
        <h1>Cheat-Sheet</h1>
        <button className="secondary" onClick={() => window.print()}>
          🖨️ Drucken
        </button>
      </header>

      <div className="cheatsheet-disclaimer">
        <DisclaimerBox>
          Stark verkürzte Merkzettel für den Einsatzfall: großformatig, wenig Text. Ersetzt nicht die
          ausführliche Handlungsanweisung im jeweiligen Modul.
        </DisclaimerBox>
      </div>

      <div className="cheatsheet-grid">
        {CHEATSHEET_CARDS.map((card) => (
          <div key={card.id} className="cheatsheet-card">
            <h2>
              {card.icon} {card.title}
            </h2>
            <ul>
              {card.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            {card.moduleId && (
              <button className="secondary cheatsheet-link" onClick={() => handleOpen(card.moduleId!, card.itemId)}>
                Mehr Details →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

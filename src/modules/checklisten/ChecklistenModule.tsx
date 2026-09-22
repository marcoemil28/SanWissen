import { useEffect, useState } from 'react';
import { CHECKLISTEN } from './data';
import { getChecked, resetChecklist, toggleChecked } from './state';
import { useNavigation } from '../../app/NavigationContext';
import { ConfirmButton } from '../../components/ConfirmButton';
import { BackLink, DisclaimerBox, RowGroup, RowLink } from '../../components/SectionBox';

/**
 * Abhakbare Checklisten. Wie die übrigen Module zuerst nur die Liste, eine
 * Checkliste öffnet sich als eigene Seite.
 */
export function ChecklistenModule() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const { pending, clearPending } = useNavigation();

  useEffect(() => {
    if (pending?.moduleId === 'checklisten' && pending.itemId && CHECKLISTEN.some((c) => c.id === pending.itemId)) {
      setSelectedId(pending.itemId);
      clearPending();
    }
  }, [pending, clearPending]);

  useEffect(() => {
    setChecked(selectedId ? getChecked(selectedId) : new Set());
  }, [selectedId]);

  const selected = selectedId ? CHECKLISTEN.find((c) => c.id === selectedId) ?? null : null;

  if (!selected) {
    return (
      <div className="module checklisten-module">
        <header className="page-header">
          <h1>Checklisten</h1>
        </header>

        <DisclaimerBox>
          Abhakbare Checklisten für den echten Dienst, abgeleitet aus den jeweiligen Themenmodulen und kein Ersatz
          für die ausführliche Handlungsanweisung dort. Haken werden lokal gespeichert und bleiben bis zum
          manuellen Zurücksetzen erhalten.
        </DisclaimerBox>

        <RowGroup>
          {CHECKLISTEN.map((c) => (
            <RowLink key={c.id} title={c.title} subtitle={c.description} onClick={() => setSelectedId(c.id)} />
          ))}
        </RowGroup>
      </div>
    );
  }

  function handleToggle(itemId: string) {
    setChecked(new Set(toggleChecked(selected!.id, itemId)));
  }

  function handleReset() {
    setChecked(resetChecklist(selected!.id));
  }

  return (
    <div className="module checklisten-module">
      <BackLink label="Checklisten" onClick={() => setSelectedId(null)} />

      <div className="algo-detail">
        <div className="algo-detail-header">
          <div>
            <h2>{selected.title}</h2>
            <p className="algo-summary">{selected.description}</p>
          </div>
          <span className="checklist-progress">
            {checked.size}/{selected.items.length} erledigt
          </span>
        </div>

        <ul className="checklist-items">
          {selected.items.map((item) => (
            <li key={item.id}>
              <label className={checked.has(item.id) ? 'checked' : ''}>
                <input type="checkbox" checked={checked.has(item.id)} onChange={() => handleToggle(item.id)} />
                <span>{item.text}</span>
              </label>
            </li>
          ))}
        </ul>

        <ConfirmButton label="Checkliste zurücksetzen" className="secondary" onConfirm={handleReset} />

        {selected.sourceNote && <p className="algo-source-note">ℹ️ {selected.sourceNote}</p>}
      </div>
    </div>
  );
}

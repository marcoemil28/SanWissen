import { useEffect, useMemo, useState } from 'react';
import { RHYTHMS } from './rhythms';
import { generateTrace } from './waveform';
import { EkgTrace } from './EkgTrace';
import { CATEGORY_LABELS, type RhythmCategory } from './types';
import { useNavigation } from '../../app/NavigationContext';
import { FavoriteButton } from '../../components/FavoriteButton';
import { RowGroup, RowLink, SectionBox } from '../../components/SectionBox';

/**
 * Rhythmus-Bibliothek. Wie `EkgStudyView` auf iOS zuerst nur die nach
 * Kategorie gruppierte Liste, ein Rhythmus öffnet sich als eigene Seite.
 */
export function StudyMode() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [seed, setSeed] = useState(0);
  const { pending, clearPending } = useNavigation();

  useEffect(() => {
    if (pending?.moduleId === 'ekg' && pending.itemId && RHYTHMS.some((r) => r.id === pending.itemId)) {
      setSelectedId(pending.itemId);
      clearPending();
    }
  }, [pending, clearPending]);

  const rhythm = selectedId ? RHYTHMS.find((r) => r.id === selectedId) ?? null : null;
  const trace = useMemo(() => (rhythm ? generateTrace(rhythm.gen) : null), [rhythm, seed]);

  const grouped = useMemo(() => {
    const map = new Map<RhythmCategory, typeof RHYTHMS>();
    RHYTHMS.forEach((r) => {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list as typeof RHYTHMS);
    });
    return map;
  }, []);

  if (!rhythm || !trace) {
    return (
      <div className="study-mode">
        {[...grouped.entries()].map(([category, items]) => (
          <SectionBox key={category} title={CATEGORY_LABELS[category]}>
            <RowGroup>
              {items.map((r) => (
                <RowLink key={r.id} title={r.nameDe} subtitle={r.nameEn} onClick={() => setSelectedId(r.id)} />
              ))}
            </RowGroup>
          </SectionBox>
        ))}
      </div>
    );
  }

  return (
    <div className="study-mode">
      <button type="button" className="back-link" onClick={() => setSelectedId(null)}>
        <span aria-hidden="true">‹</span> Rhythmen
      </button>

      <section className="rhythm-detail">
        <div className="rhythm-detail-header">
          <div>
            <h2>
              {rhythm.nameDe}{' '}
              <FavoriteButton moduleId="ekg" itemId={rhythm.id} title={rhythm.nameDe} moduleTitle="EKG-Trainer" icon="📈" />
            </h2>
            <p className="rhythm-en">{rhythm.nameEn}</p>
          </div>
          <button className="secondary" onClick={() => setSeed((s) => s + 1)}>
            Neue Kurve generieren
          </button>
        </div>

        <EkgTrace trace={trace} />

        <div className="rhythm-info">
          <div className="rhythm-card">
            <h4>Erkennungsmerkmale</h4>
            <ul>
              {rhythm.keyFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="rhythm-card">
            <h4>Klinische Relevanz / Vorgehen</h4>
            <p>{rhythm.clinicalNote}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

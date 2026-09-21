import { useCallback, useEffect, useRef, useState } from 'react';
import { AtlasScene, type AtlasViewpoint } from './AtlasScene';
import {
  ATLAS_FILTERS,
  ATLAS_SYSTEMS,
  defaultVisibleSystems,
  loadAtlasManifest,
  loadChunks,
  systemById,
  type AtlasPart,
  type AtlasSex,
  type LoadedAtlas,
} from './atlasData';

/**
 * Der 3D-Atlas für Desktop und Android.
 *
 * Die Bedienung folgt `AtlasView.swift`: Ziehen dreht, zwei Finger oder das
 * Mausrad zoomen, Tippen untersucht ein Teil. Dazu Blickrichtungen, die
 * Systemliste und der Regler zum Auseinanderziehen.
 */

const VIEWPOINTS: { id: AtlasViewpoint; label: string; title: string }[] = [
  { id: 'threeQuarter', label: '¾', title: 'Schrägansicht' },
  { id: 'front', label: 'V', title: 'Von vorn' },
  { id: 'side', label: 'S', title: 'Von der Seite' },
  { id: 'back', label: 'H', title: 'Von hinten' },
];

export function AtlasView({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<AtlasScene | null>(null);

  const [sex, setSex] = useState<AtlasSex>('male');
  const [atlas, setAtlas] = useState<LoadedAtlas | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [visibleSystems, setVisibleSystems] = useState<Set<string>>(defaultVisibleSystems);
  const [systemsOpen, setSystemsOpen] = useState(false);
  const [filterId, setFilterId] = useState(ATLAS_FILTERS[0].id);
  const [explode, setExplode] = useState(0);
  const [selected, setSelected] = useState<AtlasPart | null>(null);

  // ------------------------------------------------------------- Laden

  useEffect(() => {
    let cancelled = false;
    setAtlas(null);
    setSelected(null);
    setError(null);
    setProgress({ done: 0, total: 1 });

    (async () => {
      try {
        const manifest = await loadAtlasManifest(sex);
        if (cancelled) return;
        const chunks = await loadChunks(manifest, (done, total) => {
          if (!cancelled) setProgress({ done, total });
        });
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        sceneRef.current?.dispose();
        sceneRef.current = new AtlasScene(canvas, manifest, chunks);
        setAtlas(manifest);
        setProgress(null);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sex]);

  useEffect(() => () => sceneRef.current?.dispose(), []);

  // Größe der Leinwand an den Platz anpassen.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      sceneRef.current?.setSize(rect.width, rect.height);
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [atlas]);

  // ------------------------------------------------------------- Bedienung

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinch = useRef(0);
  const moved = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ohne Zeigerfang geht die Geste verloren, sobald der Finger die
      // Leinwand verlässt. Das ist hinnehmbar; ein Fehler hier darf aber
      // nicht die ganze Bedienung lahmlegen.
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) moved.current = false;
    lastPinch.current = 0;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const scene = sceneRef.current;
    const previous = pointers.current.get(e.pointerId);
    if (!scene || !previous) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2) {
      // Zwei Finger: Abstand zoomt, gemeinsame Verschiebung schiebt.
      const [a, b] = [...pointers.current.values()];
      const spread = Math.hypot(a.x - b.x, a.y - b.y);
      if (lastPinch.current > 0 && spread > 0) scene.zoomBy(spread / lastPinch.current);
      lastPinch.current = spread;
      moved.current = true;
      return;
    }

    const dx = e.clientX - previous.x;
    const dy = e.clientY - previous.y;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) moved.current = true;

    if (e.shiftKey) {
      scene.panBy(dx, dy, e.currentTarget.clientHeight);
    } else {
      scene.orbitBy(dx * 0.008, dy * 0.008);
    }
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const scene = sceneRef.current;
    const wasSingle = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    lastPinch.current = 0;
    if (!scene || !wasSingle || moved.current) return;
    // Ohne Bewegung war es ein Tippen: Teil untersuchen.
    const hit = scene.pick(e.clientX, e.clientY);
    scene.select(hit?.id ?? null);
    setSelected(hit);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    sceneRef.current?.zoomBy(e.deltaY > 0 ? 0.92 : 1.08);
  }, []);

  // ------------------------------------------------------------- Aktionen

  function toggleSystem(id: string, on: boolean) {
    setVisibleSystems((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    sceneRef.current?.setSystemVisible(id, on);
  }

  function changeExplode(value: number) {
    setExplode(value);
    sceneRef.current?.setExplode(value / 100);
  }

  function reset() {
    sceneRef.current?.resetCamera();
    sceneRef.current?.select(null);
    setSelected(null);
  }

  // ------------------------------------------------------------- Darstellung

  const filter = ATLAS_FILTERS.find((f) => f.id === filterId) ?? ATLAS_FILTERS[0];
  const presentSystems = atlas ? new Set(atlas.parts.map((p) => p.system)) : new Set<string>();
  const shownSystems = ATLAS_SYSTEMS.filter(
    (s) => presentSystems.has(s.id) && (!filter.systems || filter.systems.includes(s.id)),
  );
  const visibleCount = atlas ? atlas.parts.filter((p) => visibleSystems.has(p.system)).length : 0;

  return (
    <div className="atlas">
      <button type="button" className="back-link" onClick={onClose}>
        <span aria-hidden="true">‹</span> Anatomie &amp; Physiologie
      </button>

      <header className="atlas-header">
        <h2>3D-Atlas</h2>
        <div className="atlas-sex-switch" role="group" aria-label="Referenzmodell">
          <button type="button" className={sex === 'male' ? 'active' : ''} onClick={() => setSex('male')}>
            Männlich
          </button>
          <button type="button" className={sex === 'female' ? 'active' : ''} onClick={() => setSex('female')}>
            Weiblich
          </button>
        </div>
      </header>

      <div className="atlas-stage" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="atlas-canvas"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        />

        {progress && (
          <div className="atlas-overlay">
            <p>Modell wird geladen …</p>
            <progress value={progress.done} max={progress.total} />
          </div>
        )}

        {error && (
          <div className="atlas-overlay">
            <p>Der Atlas lässt sich nicht laden.</p>
            <p className="atlas-error">{error}</p>
          </div>
        )}

        {atlas && (
          <div className="atlas-viewpoints">
            {VIEWPOINTS.map((v) => (
              <button
                key={v.id}
                type="button"
                title={v.title}
                onClick={() => sceneRef.current?.setViewpoint(v.id)}
              >
                {v.label}
              </button>
            ))}
            <button type="button" title="Ansicht zurücksetzen" onClick={reset}>
              ↺
            </button>
          </div>
        )}
      </div>

      {atlas && (
        <>
          <p className="atlas-hint">Ziehen dreht · Mausrad oder zwei Finger zoomen · Tippen untersucht</p>

          {selected && (
            <div className="atlas-selection">
              <div>
                <strong>{selected.name}</strong>
                <span>{systemById(selected.system)?.name ?? selected.system}</span>
              </div>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  sceneRef.current?.select(null);
                  setSelected(null);
                }}
              >
                Auswahl aufheben
              </button>
            </div>
          )}

          <button type="button" className="atlas-systems-toggle" onClick={() => setSystemsOpen((o) => !o)}>
            Systeme ({visibleSystems.size}/{presentSystems.size})
          </button>

          {systemsOpen && (
            <div className="atlas-systems">
              <div className="tab-bar">
                {ATLAS_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={f.id === filterId ? 'active' : ''}
                    onClick={() => setFilterId(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <ul className="atlas-system-list">
                {shownSystems.map((s) => (
                  <li key={s.id}>
                    <label>
                      <span className="atlas-system-dot" style={{ backgroundColor: s.hex }} aria-hidden="true" />
                      <span className="atlas-system-name">{s.name}</span>
                      <input
                        type="checkbox"
                        checked={visibleSystems.has(s.id)}
                        onChange={(e) => toggleSystem(s.id, e.target.checked)}
                      />
                    </label>
                  </li>
                ))}
              </ul>
              <p className="atlas-system-count">{visibleCount.toLocaleString('de-DE')} Teile sichtbar</p>
            </div>
          )}

          <div className="atlas-explode">
            <label htmlFor="atlas-explode">
              Anatomie auseinanderziehen <span>{explode} %</span>
            </label>
            <input
              id="atlas-explode"
              type="range"
              min={0}
              max={100}
              value={explode}
              onChange={(e) => changeExplode(Number(e.target.value))}
            />
            <div className="atlas-explode-ends">
              <span>Zusammengesetzt</span>
              <span>Jedes Teil</span>
            </div>
          </div>

          <p className="atlas-source">
            {atlas.scope} Quelle: {atlas.source}, {atlas.version}. {atlas.triangles.toLocaleString('de-DE')} Dreiecke.
          </p>
        </>
      )}
    </div>
  );
}

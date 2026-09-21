import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AtlasScene, type AtlasViewpoint } from './AtlasScene';
import {
  ATLAS_FILTERS,
  ATLAS_SYSTEMS,
  defaultVisibleSystems,
  loadAtlasManifest,
  loadChunks,
  systemById,
  type AtlasConcept,
  type AtlasPart,
  type AtlasSex,
  type LoadedAtlas,
} from './atlasData';

/**
 * Der 3D-Atlas für Desktop und Android.
 *
 * Die Bedienung folgt `AtlasView.swift`: Ziehen dreht, zwei Finger oder das
 * Mausrad zoomen, Tippen untersucht ein Teil. Dazu Suche nach Strukturen,
 * Freistellen, Blickrichtungen, die Systemliste, der Regler zum
 * Auseinanderziehen und das Struktur-Quiz.
 */

const VIEWPOINTS: { id: AtlasViewpoint; label: string; title: string }[] = [
  { id: 'threeQuarter', label: '¾', title: 'Schrägansicht' },
  { id: 'front', label: 'V', title: 'Von vorn' },
  { id: 'side', label: 'S', title: 'Von der Seite' },
  { id: 'back', label: 'H', title: 'Von hinten' },
];

type QuizResult = { correct: true } | { correct: false; hit: string } | null;

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
  const [infoOpen, setInfoOpen] = useState(false);
  const [filterId, setFilterId] = useState(ATLAS_FILTERS[0].id);
  const [explode, setExplode] = useState(0);

  const [selectedPart, setSelectedPart] = useState<AtlasPart | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<AtlasConcept | null>(null);
  const [isolated, setIsolated] = useState(false);
  const [query, setQuery] = useState('');

  const [quizActive, setQuizActive] = useState(false);
  const [quizTarget, setQuizTarget] = useState<AtlasPart | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult>(null);
  const [quizScore, setQuizScore] = useState({ asked: 0, correct: 0 });
  const askedConcepts = useRef(new Set<string>());

  // ------------------------------------------------------------- Laden

  useEffect(() => {
    let cancelled = false;
    setAtlas(null);
    setSelectedPart(null);
    setSelectedConcept(null);
    setIsolated(false);
    setQuizActive(false);
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
        setVisibleSystems(defaultVisibleSystems());
        setExplode(0);
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

  // ------------------------------------------------------------- Ableitungen

  const conceptById = useMemo(() => {
    const map = new Map<string, AtlasConcept>();
    for (const c of atlas?.concepts ?? []) map.set(c.id, c);
    return map;
  }, [atlas]);

  /** Alle Netze der gewählten Struktur; eine Struktur kann aus mehreren bestehen. */
  const selectedPartIds = useMemo(() => {
    if (selectedConcept) return new Set(selectedConcept.elements);
    if (selectedPart) return new Set([selectedPart.id]);
    return null;
  }, [selectedConcept, selectedPart]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2 || !atlas) return [];
    return atlas.concepts.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 30);
  }, [query, atlas]);

  // ------------------------------------------------------------- Auswahl

  const applySelection = useCallback(
    (part: AtlasPart | null, concept: AtlasConcept | null, keepIsolation: boolean) => {
      const scene = sceneRef.current;
      setSelectedPart(part);
      setSelectedConcept(concept);
      const ids = concept ? new Set(concept.elements) : part ? new Set([part.id]) : null;
      scene?.select(ids);
      if (keepIsolation && isolated) scene?.isolate(ids && ids.size > 0 ? ids : null);
      else if (!keepIsolation) {
        setIsolated(false);
        scene?.isolate(null);
      }
    },
    [isolated],
  );

  function selectPart(part: AtlasPart | null) {
    applySelection(part, part ? conceptById.get(part.conceptId) ?? null : null, true);
  }

  function selectConcept(concept: AtlasConcept) {
    const first = concept.elements.map((id) => atlas?.parts.find((p) => p.id === id)).find(Boolean) ?? null;
    setQuery('');
    // Das System der Struktur muss sichtbar sein, sonst zeigt die Auswahl ins Leere.
    if (first && !visibleSystems.has(first.system)) toggleSystem(first.system, true);
    applySelection(first, concept, true);
  }

  function clearSelection() {
    applySelection(null, null, false);
  }

  function toggleIsolation() {
    const scene = sceneRef.current;
    const next = !isolated;
    setIsolated(next);
    if (explode !== 0) changeExplode(0);
    scene?.isolate(next && selectedPartIds && selectedPartIds.size > 0 ? selectedPartIds : null);
  }

  // ------------------------------------------------------------- Quiz

  function nextQuestion() {
    const scene = sceneRef.current;
    if (!scene || !atlas) return;
    setQuizResult(null);
    scene.select(null);

    const outer = scene.outerParts();
    const byId = new Map(atlas.parts.map((p) => [p.id, p] as const));
    const all = outer.map((id) => byId.get(id)).filter((p): p is AtlasPart => !!p);
    // Sind alle Strukturen schon gefragt, wird von vorn begonnen.
    const fresh = all.filter((p) => !askedConcepts.current.has(p.conceptId));
    const pool = fresh.length > 0 ? fresh : all;
    const target = pool[Math.floor(Math.random() * pool.length)] ?? null;
    if (target) askedConcepts.current.add(target.conceptId);
    setQuizTarget(target);
  }

  function startQuiz() {
    askedConcepts.current = new Set();
    setQuizScore({ asked: 0, correct: 0 });
    setQuizActive(true);
    clearSelection();
    if (explode !== 0) changeExplode(0);
    // Erst nach dem Zurücksetzen abtasten, sonst stimmt die Ansicht nicht.
    window.setTimeout(nextQuestion, 60);
  }

  function endQuiz() {
    setQuizActive(false);
    setQuizTarget(null);
    setQuizResult(null);
    sceneRef.current?.select(null);
  }

  /** Richtig ist jedes Netz derselben benannten Struktur. */
  function answer(part: AtlasPart | null) {
    if (!quizTarget) return;
    const concept = conceptById.get(quizTarget.conceptId);
    const accepted = new Set(concept?.elements ?? [quizTarget.id]);
    const right = !!part && (accepted.has(part.id) || part.conceptId === quizTarget.conceptId);

    setQuizScore((s) => ({ asked: s.asked + 1, correct: s.correct + (right ? 1 : 0) }));
    if (right) {
      setQuizResult({ correct: true });
    } else {
      const name = part ? conceptById.get(part.conceptId)?.name ?? part.name : 'daneben';
      setQuizResult({ correct: false, hit: name });
    }
    // In beiden Fällen die gesuchte Struktur zeigen.
    sceneRef.current?.select(accepted);
  }

  const quizPrompt = quizTarget ? conceptById.get(quizTarget.conceptId)?.name ?? quizTarget.name : '';

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
      // Zwei Finger: der Abstand zoomt.
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

    if (e.shiftKey) scene.panBy(dx, dy, e.currentTarget.clientHeight);
    else scene.orbitBy(dx * 0.008, dy * 0.008);
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const scene = sceneRef.current;
      const wasSingle = pointers.current.size === 1;
      pointers.current.delete(e.pointerId);
      lastPinch.current = 0;
      if (!scene || !wasSingle || moved.current) return;

      const hit = scene.pick(e.clientX, e.clientY);
      if (quizActive) {
        if (!quizResult) answer(hit);
        return;
      }
      selectPart(hit);
    },
    // Absicht: bei jedem Zustandswechsel neu binden, damit der Tipp weiß,
    // ob gerade das Quiz läuft und ob die Frage schon beantwortet ist.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quizActive, quizResult, quizTarget, conceptById, isolated],
  );

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
    clearSelection();
  }

  // ------------------------------------------------------------- Darstellung

  const filter = ATLAS_FILTERS.find((f) => f.id === filterId) ?? ATLAS_FILTERS[0];
  const presentSystems = useMemo(
    () => (atlas ? new Set(atlas.parts.map((p) => p.system)) : new Set<string>()),
    [atlas],
  );
  const shownSystems = ATLAS_SYSTEMS.filter(
    (s) => presentSystems.has(s.id) && (!filter.systems || filter.systems.includes(s.id)),
  );
  const visibleCount = atlas ? atlas.parts.filter((p) => visibleSystems.has(p.system)).length : 0;
  const selectionName = selectedConcept?.name ?? selectedPart?.name ?? null;

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

      {atlas && !quizActive && (
        <div className="atlas-search">
          <input
            type="search"
            placeholder="Struktur suchen (englische Bezeichnung)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <ul className="atlas-search-results">
              {searchResults.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => selectConcept(c)}>
                    {c.name}
                    <span>{c.elements.length} Netze</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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

        {quizActive && (
          <div className="atlas-quiz">
            <div className="atlas-quiz-head">
              <strong>
                {quizScore.correct}/{quizScore.asked}
              </strong>
              <button type="button" className="secondary" onClick={endQuiz}>
                Quiz beenden
              </button>
            </div>
            {quizTarget ? (
              <>
                <p className="atlas-quiz-prompt">
                  Tippe auf: <strong>{quizPrompt}</strong>
                </p>
                {quizResult && (
                  <p className={quizResult.correct ? 'atlas-quiz-right' : 'atlas-quiz-wrong'}>
                    {quizResult.correct
                      ? 'Richtig. Die Struktur leuchtet auf.'
                      : `Das war ${quizResult.hit}. Die gesuchte Struktur leuchtet auf.`}
                  </p>
                )}
                {quizResult && (
                  <button type="button" className="primary" onClick={nextQuestion}>
                    Nächste Struktur
                  </button>
                )}
              </>
            ) : (
              <p className="atlas-quiz-prompt">
                Von hier aus ist nichts zu treffen. Dreh das Modell oder blende Systeme ein.
              </p>
            )}
          </div>
        )}

        {atlas && (
          <div className="atlas-viewpoints">
            {VIEWPOINTS.map((v) => (
              <button key={v.id} type="button" title={v.title} onClick={() => sceneRef.current?.setViewpoint(v.id)}>
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
          {!quizActive && (
            <p className="atlas-hint">
              {explode > 50 ? 'Umschalt und Ziehen verschiebt' : 'Ziehen dreht'} · Mausrad oder zwei Finger zoomen ·
              Tippen untersucht
            </p>
          )}

          {selectionName && (
            <div className="atlas-selection">
              <div>
                <strong>{selectionName}</strong>
                <span>
                  {systemById(selectedPart?.system ?? '')?.name ?? ''}
                  {selectedConcept && selectedConcept.elements.length > 1
                    ? ` · ${selectedConcept.elements.length} Netze`
                    : ''}
                </span>
              </div>
              <div className="atlas-selection-actions">
                <button type="button" className={isolated ? 'primary' : 'secondary'} onClick={toggleIsolation}>
                  {isolated ? 'Freistellen aus' : 'Freistellen'}
                </button>
                <button type="button" className="secondary" onClick={clearSelection}>
                  Aufheben
                </button>
              </div>
            </div>
          )}

          <div className="atlas-actions">
            <button type="button" onClick={() => setSystemsOpen((o) => !o)}>
              Systeme ({visibleSystems.size}/{presentSystems.size})
            </button>
            {!quizActive && (
              <button type="button" onClick={startQuiz}>
                Struktur-Quiz
              </button>
            )}
            <button type="button" onClick={() => setInfoOpen((o) => !o)}>
              Info
            </button>
          </div>

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

          {infoOpen && (
            <div className="atlas-systems">
              <p>
                {atlas.parts.length.toLocaleString('de-DE')} einzelne Netze und{' '}
                {atlas.concepts.length.toLocaleString('de-DE')} benannte Strukturen,{' '}
                {atlas.triangles.toLocaleString('de-DE')} Dreiecke.
              </p>
              <p className="atlas-source">{atlas.scope}</p>
              <p className="atlas-source">
                Quelle: {atlas.source}, {atlas.version}. Beide Datensätze stehen unter CC Attribution 4.0
                International. Die Bezeichnungen der Teile und Strukturen sind englisch, so wie sie in den
                Quelldaten stehen.
              </p>
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
        </>
      )}
    </div>
  );
}

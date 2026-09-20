import { useRef, useState } from 'react';
import type { ElectrodePoint, ElectrodeSet } from './types';
import { BodyImage } from './BodyImage';
import { labelPlacement } from './layout';

const RADIUS_TOLERANCE = 26;

function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const transformed = pt.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}

function isHit(point: ElectrodePoint, svgX: number, svgY: number): boolean {
  if (point.hitZone) {
    const { rowY, colX } = point.hitZone;
    return svgY >= rowY[0] && svgY <= rowY[1] && svgX >= colX[0] && svgX <= colX[1];
  }
  const dist = Math.hypot(svgX - point.x, svgY - point.y);
  return dist <= RADIUS_TOLERANCE;
}

export function ElectrodePlacement({ set }: { set: ElectrodeSet }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [attempts, setAttempts] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragScreenPos, setDragScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [lastWrong, setLastWrong] = useState<string | null>(null);

  const trayPoints = set.points.filter((p) => !placed[p.id]);
  const correctCount = Object.values(placed).filter(Boolean).length;
  const finished = correctCount === set.points.length;
  const { w: VIEW_W, h: VIEW_H } = set.viewBox;
  // Anzeigebreite; die Höhe folgt dem Seitenverhältnis der viewBox.
  const DISPLAY_W = set.bodyType === 'thorax' ? 460 : 400;

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, id: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragId(id);
    setDragScreenPos({ x: e.clientX, y: e.clientY });
    setLastWrong(null);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragId) return;
    setDragScreenPos({ x: e.clientX, y: e.clientY });
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>, id: string) {
    if (!svgRef.current) return;
    const svgPoint = toSvgPoint(svgRef.current, e.clientX, e.clientY);
    const target = set.points.find((p) => p.id === id)!;
    setAttempts((a) => a + 1);
    if (isHit(target, svgPoint.x, svgPoint.y)) {
      setPlaced((prev) => ({ ...prev, [id]: true }));
    } else {
      setLastWrong(id);
      window.setTimeout(() => setLastWrong((cur) => (cur === id ? null : cur)), 500);
    }
    setDragId(null);
    setDragScreenPos(null);
  }

  function reset() {
    setPlaced({});
    setAttempts(0);
    setDragId(null);
    setDragScreenPos(null);
  }

  const draggingPoint = dragId ? set.points.find((p) => p.id === dragId) : null;

  return (
    <div className="electrode-board">
      <div className="electrode-svg-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width={DISPLAY_W}
          height={Math.round(DISPLAY_W * (VIEW_H / VIEW_W))}
        >
          <BodyImage set={set} />
          {set.bodyType === 'full' &&
            set.points
              .filter((p) => !placed[p.id])
              .map((p) => <circle key={p.id} className="electrode-target-ring" cx={p.x} cy={p.y} r={RADIUS_TOLERANCE} />)}
          {set.points
            .filter((p) => placed[p.id])
            .map((p) => {
              const label = labelPlacement(p, VIEW_W);
              return (
                <g key={p.id}>
                  <circle cx={p.x} cy={p.y} r="13" fill={p.color} stroke="#0f1216" strokeWidth="1.5" />
                  <text className="electrode-placed-label" x={label.x} y={p.y + 4} textAnchor={label.anchor}>
                    {p.label}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      <div className="electrode-sidebar">
        <h3>{set.title}</h3>
        <p className="electrode-tray-hint">{set.intro}</p>
        <p className="electrode-tray-hint">Ziehe jede Elektrode an die richtige Stelle am Körper.</p>

        <div className="electrode-tray" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
          {trayPoints.map((p) => (
            <div
              key={p.id}
              className={`electrode-chip ${dragId === p.id ? 'dragging' : ''}`}
              onPointerDown={(e) => handlePointerDown(e, p.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={(e) => handlePointerUp(e, p.id)}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: p.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
                color: '#0f1216',
                touchAction: 'none',
                userSelect: 'none',
                boxShadow: lastWrong === p.id ? '0 0 0 3px var(--bad)' : undefined,
                opacity: dragId === p.id ? 0.35 : 1,
              }}
            >
              {p.label}
            </div>
          ))}
        </div>

        <ul className="electrode-legend">
          {set.points.map((p) => (
            <li key={p.id} className={placed[p.id] ? 'done' : ''}>
              <span className="electrode-legend-dot" style={{ backgroundColor: p.color }} />
              <span>
                <strong>{p.label}</strong> – {p.description}
              </span>
            </li>
          ))}
        </ul>

        <p className="electrode-score">
          {correctCount}/{set.points.length} richtig platziert · {attempts} Versuche
        </p>
        {finished && <p style={{ color: 'var(--good)', fontWeight: 700 }}>Fertig! Alle Elektroden korrekt platziert.</p>}
        <button className="secondary" onClick={reset}>
          Zurücksetzen
        </button>
      </div>

      {draggingPoint && dragScreenPos && (
        <div
          style={{
            position: 'fixed',
            left: dragScreenPos.x - 24,
            top: dragScreenPos.y - 24,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: draggingPoint.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 12,
            color: '#0f1216',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 6px 14px rgba(0,0,0,0.5)',
          }}
        >
          {draggingPoint.label}
        </div>
      )}
    </div>
  );
}

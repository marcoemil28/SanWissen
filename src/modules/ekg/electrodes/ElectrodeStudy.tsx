import type { ElectrodeSet } from './types';
import { BodyImage } from './BodyImage';
import { labelPlacement } from './layout';

export function ElectrodeStudy({ set }: { set: ElectrodeSet }) {
  const { w: VIEW_W, h: VIEW_H } = set.viewBox;
  // Anzeigebreite; die Höhe folgt dem Seitenverhältnis der viewBox.
  const DISPLAY_W = set.bodyType === 'thorax' ? 460 : 400;
  const isThorax = set.bodyType === 'thorax';
  let precordialIndex = 0;

  return (
    <div className="electrode-board">
      <div className="electrode-svg-wrap">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width={DISPLAY_W}
          height={Math.round(DISPLAY_W * (VIEW_H / VIEW_W))}
        >
          <BodyImage set={set} />
          {set.points.map((p) => {
            const isPrecordial = isThorax && p.id.startsWith('v');
            if (isPrecordial) {
              const leaderY = 522 + (precordialIndex % 2) * 22;
              precordialIndex += 1;
              return (
                <g key={p.id}>
                  <line x1={p.x} y1={p.y + 12} x2={p.x} y2={leaderY - 10} className="leader-line" />
                  <circle cx={p.x} cy={p.y} r="11" fill={p.color} stroke="#0f1216" strokeWidth="1.5" />
                  <text className="electrode-placed-label" x={p.x} y={leaderY} textAnchor="middle">
                    {p.label}
                  </text>
                </g>
              );
            }
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
        <ul className="electrode-legend">
          {set.points.map((p) => (
            <li key={p.id}>
              <span className="electrode-legend-dot" style={{ backgroundColor: p.color }} />
              <span>
                <strong>{p.label}</strong> – {p.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

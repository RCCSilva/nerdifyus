import {
  LENGTH, WIDTH, END_ZONE, HASH, BORDER, YARD_LINE_W, GOAL_LINE_W, TICK_LEN, TICK_GAP,
  NUMBER_FROM_SIDELINE, NUMBER_HEIGHT, TRY_MARK_DIST, CROSSBAR, fx, yardLabel, MID_Y,
} from './geometry';
import { FieldContext } from './FieldContext';
import './field.css';

const range = (from, to, step = 1) => {
  const out = [];
  for (let v = from; v <= to; v += step) out.push(v);
  return out;
};

/**
 * A to-scale NFL field drawn in SVG. Units are yards (see geometry.js).
 *
 * Props
 * - view:       [x0, x1] crop along the length of the field (default: whole field + border)
 * - viewY:      [y0, y1] crop across the width (default: full width + border)
 * - vertical:   draw the field upright (left end zone at the bottom) — the TV "all-22" look
 * - highlight:  array of part ids to emphasise: 'endzones' | 'fieldOfPlay' | 'goalLines'
 *               | 'sidelines' | 'endLines' | 'hashes' | 'yardLines' | 'goalposts'
 * - endZoneText: [left, right] labels painted in the end zones
 * - children:   overlays, drawn in the same yard coordinates (use fx() for x)
 */
export default function Field({
  view = [-BORDER, LENGTH + BORDER],
  viewY = [-BORDER - 0.5, WIDTH + BORDER + 0.5],
  vertical = false,
  highlight = [],
  endZoneText = ['', ''],
  title = 'American football field',
  className = '',
  children,
}) {
  const on = (part) => (highlight.includes(part) ? ' is-hl' : '');
  const [x0, x1] = view;
  const [y0, y1] = viewY;
  // Vertical: screen X = field y, screen Y = LENGTH - field x (so offense moving "right" moves up).
  const viewBox = vertical
    ? `${y0} ${LENGTH - x1} ${y1 - y0} ${x1 - x0}`
    : `${x0} ${y0} ${x1 - x0} ${y1 - y0}`;

  const fiveYard = range(5, 95, 5);
  const oneYard = range(1, 99).filter((y) => y % 5 !== 0);

  return (
    <svg
      className={`field ${highlight.length ? 'has-hl' : ''} ${className}`}
      viewBox={viewBox}
      role="img"
      aria-label={title}
    >
      <FieldContext.Provider value={{ vertical }}>
      <g transform={vertical ? `matrix(0 -1 1 0 0 ${LENGTH})` : undefined}>
      {/* white border + grass */}
      <rect className="f-border" x={-BORDER} y={-BORDER} width={LENGTH + 2 * BORDER} height={WIDTH + 2 * BORDER} rx="0.4" />
      <rect className={`f-grass part${on('fieldOfPlay')}`} x={0} y={0} width={LENGTH} height={WIDTH} />
      {range(0, 95, 10).map((y) => (
        <rect key={y} className="f-stripe" x={fx(y)} y={0} width={5} height={WIDTH} />
      ))}

      {/* end zones */}
      <g className={`part${on('endzones')}`}>
        <rect className="f-ez f-ez-left" x={0} y={0} width={END_ZONE} height={WIDTH} />
        <rect className="f-ez f-ez-right" x={LENGTH - END_ZONE} y={0} width={END_ZONE} height={WIDTH} />
        {endZoneText.map((t, i) => t && (
          <text
            key={i}
            className="f-ez-text"
            x={i === 0 ? END_ZONE / 2 : LENGTH - END_ZONE / 2}
            y={MID_Y}
            transform={`rotate(${i === 0 ? -90 : 90} ${i === 0 ? END_ZONE / 2 : LENGTH - END_ZONE / 2} ${MID_Y})`}
          >{t}</text>
        ))}
      </g>

      {/* 5-yard lines */}
      <g className={`part${on('yardLines')}`}>
        {fiveYard.map((y) => (
          <rect key={y} className="f-line" x={fx(y) - YARD_LINE_W / 2} y={0} width={YARD_LINE_W} height={WIDTH} />
        ))}
      </g>

      {/* 1-yard hash marks: at the inbounds lines and along both sidelines */}
      <g className={`part${on('hashes')}`}>
        {oneYard.map((y) => (
          <g key={y} className="f-tick">
            <line x1={fx(y)} x2={fx(y)} y1={TICK_GAP} y2={TICK_GAP + TICK_LEN} />
            <line x1={fx(y)} x2={fx(y)} y1={HASH - TICK_LEN / 2} y2={HASH + TICK_LEN / 2} />
            <line x1={fx(y)} x2={fx(y)} y1={WIDTH - HASH - TICK_LEN / 2} y2={WIDTH - HASH + TICK_LEN / 2} />
            <line x1={fx(y)} x2={fx(y)} y1={WIDTH - TICK_GAP - TICK_LEN} y2={WIDTH - TICK_GAP} />
          </g>
        ))}
      </g>

      {/* try marks (1 yd long, 2 yd from each goal line) */}
      {[fx(TRY_MARK_DIST), fx(100 - TRY_MARK_DIST)].map((x) => (
        <line key={x} className="f-tick" x1={x} x2={x} y1={MID_Y - 0.5} y2={MID_Y + 0.5} />
      ))}

      {/* numerals every 10 yd; bottoms face the sideline */}
      <g className="f-nums" aria-hidden="true">
        {range(10, 90, 10).map((y) => {
          const label = yardLabel(y);
          const topY = NUMBER_FROM_SIDELINE;
          const botY = WIDTH - NUMBER_FROM_SIDELINE;
          return (
            <g key={y}>
              <text x={fx(y)} y={botY} fontSize={NUMBER_HEIGHT * 1.35}>{label}</text>
              <text x={fx(y)} y={topY} fontSize={NUMBER_HEIGHT * 1.35} transform={`rotate(180 ${fx(y)} ${topY})`}>{label}</text>
            </g>
          );
        })}
      </g>

      {/* goal lines */}
      <g className={`part${on('goalLines')}`}>
        {[fx(0), fx(100)].map((x) => (
          <rect key={x} className="f-line f-goal" x={x - GOAL_LINE_W / 2} y={0} width={GOAL_LINE_W} height={WIDTH} />
        ))}
      </g>

      {/* boundary lines */}
      <g className={`part${on('sidelines')}`}>
        <line className="f-boundary" x1={0} x2={LENGTH} y1={0} y2={0} />
        <line className="f-boundary" x1={0} x2={LENGTH} y1={WIDTH} y2={WIDTH} />
      </g>
      <g className={`part${on('endLines')}`}>
        <line className="f-boundary" x1={0} x2={0} y1={0} y2={WIDTH} />
        <line className="f-boundary" x1={LENGTH} x2={LENGTH} y1={0} y2={WIDTH} />
      </g>

      {/* pylons: goal line/sideline corners + end line corners */}
      {[0, END_ZONE, LENGTH - END_ZONE, LENGTH].flatMap((x) => [0, WIDTH].map((y) => (
        <rect key={`${x}-${y}`} className="f-pylon" x={x - 0.18} y={y - 0.18} width={0.36} height={0.36} />
      )))}

      {/* goal posts, seen from above: crossbar in the plane of the end line */}
      <g className={`part${on('goalposts')}`}>
        {[0, LENGTH].map((x) => (
          <g key={x} className="f-goalpost">
            <line x1={x} x2={x} y1={MID_Y - CROSSBAR / 2} y2={MID_Y + CROSSBAR / 2} />
            <circle cx={x} cy={MID_Y - CROSSBAR / 2} r={0.35} />
            <circle cx={x} cy={MID_Y + CROSSBAR / 2} r={0.35} />
          </g>
        ))}
      </g>

      {children}
      </g>
      </FieldContext.Provider>
    </svg>
  );
}

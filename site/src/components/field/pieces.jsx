import { useField } from './FieldContext';
import { WIDTH } from './geometry';

/** Text that stays upright even when the field is drawn vertically. */
export function UprightText({ x, y, children, ...rest }) {
  const { vertical } = useField();
  return (
    <text x={x} y={y} transform={vertical ? `rotate(90 ${x} ${y})` : undefined} {...rest}>
      {children}
    </text>
  );
}

/** A player token. side: 'off' | 'def'. */
export function Player({ x, y, label, side = 'off', group, size = 1, active = false, dim = false, onSelect, style }) {
  const interactive = Boolean(onSelect);
  return (
    <g
      className={`player player-${side}${group ? ` g-${group}` : ''}${active ? ' is-active' : ''}${dim ? ' is-dim' : ''}${interactive ? ' is-btn' : ''}`}
      transform={`translate(${x} ${y})`}
      style={style}
      onClick={onSelect}
      onKeyDown={interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect()) : undefined}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? label : undefined}
      aria-pressed={interactive ? active : undefined}
    >
      <g transform={size !== 1 ? `scale(${size})` : undefined}>
        <circle r={0.95} />
        <UprightText x={0} y={0} className="player-label">{label}</UprightText>
      </g>
    </g>
  );
}

/** The ball, pointing along the field. `z` (0–1) lifts it for kicks and passes. */
export function Ball({ x, y, z = 0, angle = 0 }) {
  const s = 1 + z * 0.9;
  return (
    <g transform={`translate(${x} ${y - z * 1.5}) rotate(${angle}) scale(${s})`}>
      {z > 0 && <ellipse className="ball-shadow" cx={0} cy={z * 1.5 / s} rx={0.5} ry={0.28} />}
      <ellipse className="ball" rx={0.62} ry={0.38} />
      <line className="ball-lace" x1={-0.22} x2={0.22} y1={0} y2={0} />
    </g>
  );
}

/** Full-width line across the field at x (line of scrimmage, line to gain). */
export function FieldLine({ x, kind }) {
  return <line className={kind} x1={x} x2={x} y1={0} y2={WIDTH} style={{ transition: 'all .6s ease' }} />;
}

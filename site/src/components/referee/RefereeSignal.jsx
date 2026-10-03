import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../field/motion';
import { SIGNALS, P } from './signals';
import './referee.css';

// A referee drawn in flat shapes, every arm a two-bone chain (shoulder → elbow → hand).
// Signals give where the hands go; inverse kinematics finds the shoulder and elbow angles.

const UPPER_LEN = 30;
const FORE = 28;
const DEG = 180 / Math.PI;

/** Angles (deg; 0 = hanging down, clockwise +) so the hand reaches `target`, elbow bent away from the body.
 *  `upperLen` is the upper arm as drawn: shorter when it points toward the viewer. */
function ik(sh, target, out, upperLen) {
  const dx = target.x - sh.x;
  const dy = target.y - sh.y;
  const d = Math.min(upperLen + FORE - 0.01, Math.max(Math.abs(upperLen - FORE) + 0.01, Math.hypot(dx, dy)));
  const base = Math.atan2(-dx, dy);
  const alpha = Math.acos((upperLen * upperLen + d * d - FORE * FORE) / (2 * upperLen * d));
  const solve = (sgn) => {
    const a = base + sgn * alpha;
    const ex = sh.x - Math.sin(a) * upperLen;
    const ey = sh.y + Math.cos(a) * upperLen;
    return { a, f: Math.atan2(-(target.x - ex), target.y - ey), ex };
  };
  const s1 = solve(1);
  const s2 = solve(-1);
  const best = (s1.ex - sh.x) * out > (s2.ex - sh.x) * out ? s1 : s2;
  return [best.a * DEG, (best.f - best.a) * DEG];
}

/** Loops `loop` ms forever; with reduced motion it stays on `still`. */
function useLoop(loop, still) {
  const [t, setT] = useState(() => (prefersReducedMotion() ? still : 0));
  const raf = useRef();
  useEffect(() => {
    if (prefersReducedMotion()) { setT(still); return undefined; }
    let start;
    const tick = (now) => {
      start ??= now;
      setT((now - start) % loop);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf.current); };
  }, [loop, still]);
  return t;
}

function Hand({ kind }) {
  if (kind === 'open') return <rect className="ref-skin" x={-4.5} y={FORE - 1} width={9} height={11} rx={3.5} />;
  if (kind === 'flat') return <ellipse className="ref-skin" cx={0} cy={FORE + 4} rx={3} ry={6} />;
  return <circle className="ref-skin" cx={0} cy={FORE + 3} r={5.5} />;
}

function Arm({ shoulder, upper, fore, hand, len }) {
  return (
    <g transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${upper})`}>
      <line className="ref-sleeve" x1={0} y1={0} x2={0} y2={len} />
      <g transform={`translate(0 ${len}) rotate(${fore})`}>
        <line className="ref-sleeve is-fore" x1={0} y1={0} x2={0} y2={FORE} />
        <Hand kind={hand} />
      </g>
    </g>
  );
}

/** The referee making `signal` (a key of SIGNALS), looping. */
export default function RefereeSignal({ signal, className = '' }) {
  const s = SIGNALS[signal];
  const t = useLoop(s.loop, s.still);
  const side = Boolean(s.side);
  const [hl, hr] = s.hands(t);
  const [handL, handR] = s.hand ?? ['fist', 'fist'];
  const sx = side ? 3 : 14;
  const len = UPPER_LEN * (s.upper ?? 1);
  const solve = (x, h, out) => {
    const sh = P(x, 26);
    return [sh, ...ik(sh, h, side ? 1 : out, len)];
  };
  const arm = (x, h, out, kind) => {
    const [sh, u, f] = solve(x, P(h.x, h.y - 3), out);
    return <Arm shoulder={sh} upper={u} fore={f} hand={kind} len={len} />;
  };
  // `grip` (0–1): the left hand holds the right forearm that far from the wrist toward the elbow;
  // `gripIn(t)` blends it in (0–1), `gripLift(t)` raises it off the arm
  let left = hl;
  if (s.grip != null) {
    const [sh, u, f] = solve(sx, P(hr.x, hr.y - 3), 1);
    const dir = (deg) => P(-Math.sin(deg / DEG), Math.cos(deg / DEG));
    const elbow = P(sh.x + dir(u).x * len, sh.y + dir(u).y * len);
    const wrist = P(elbow.x + dir(u + f).x * FORE, elbow.y + dir(u + f).y * FORE);
    const spot = P(wrist.x + (elbow.x - wrist.x) * s.grip, wrist.y + (elbow.y - wrist.y) * s.grip);
    // aim the left wrist short of the spot, so the middle of the hand lands on it
    let aim = spot;
    for (let i = 0; i < 3; i += 1) {
      const [, lu, lf] = solve(-sx, aim, -1);
      const d = dir(lu + lf);
      aim = P(spot.x - d.x * 4.5, spot.y - d.y * 4.5);
    }
    const k = s.gripIn?.(t) ?? 1;
    const lift = s.gripLift?.(t) ?? 0; // hovering above the spot instead of holding it
    left = P(hl.x + (aim.x - hl.x) * k, hl.y + (aim.y + 3 - lift - hl.y) * k);
  }
  // the arm nearer the viewer is drawn last; `front(t)` lets a signal swap them (arms rolling over each other)
  const leftInFront = !side && s.front?.(t) === 'L';
  const armL = arm(-sx, left, -1, handL);
  const armR = arm(sx, hr, 1, handR);
  const w = side ? 24 : 34;
  const stripes = [];
  for (let x = -w / 2 + 5; x < w / 2 - 2; x += 8) stripes.push(x);

  return (
    <svg className={`ref-signal ${className}`} viewBox="-80 -50 160 210" aria-hidden="true">
      <g transform="translate(0 4)">
        {(side ? [-3, 3] : [-7, 7]).map((x) => (
          <g key={x} transform={`translate(${x} 78) rotate(${x > 0 ? -3 : 3})`}>
            <line className="ref-leg" x1={0} y1={0} x2={0} y2={74} />
            <ellipse className="ref-shoe" cx={side ? 6 : x > 0 ? 3 : -3} cy={75} rx={9} ry={4} />
          </g>
        ))}
        {side && armL}
        <rect className="ref-shirt" x={-w / 2} y={18} width={w} height={64} rx={11} />
        {stripes.map((x) => <rect key={x} className="ref-stripe" x={x} y={18} width={4} height={64} />)}
        <circle className="ref-skin" cx={0} cy={2} r={14} />
        <path className="ref-cap" d="M-14 -1 A14 14 0 0 1 14 -1 Z" />
        {side && <rect className="ref-cap" x={8} y={-3} width={12} height={3} rx={1.5} />}
        {!side && !leftInFront && armL}
        {armR}
        {leftInFront && armL}
      </g>
    </svg>
  );
}

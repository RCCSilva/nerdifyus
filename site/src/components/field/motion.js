import { useEffect, useRef, useState } from 'react';

export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
/** Progress of t through the window [a, b] (all in ms), eased, clamped to 0–1. */
export const seg = (t, a, b) => ease(clamp01((t - a) / (b - a)));

/** Point along a polyline [[x,y], ...] at progress p (0–1). */
export function along(points, p) {
  if (points.length === 1) return points[0];
  const lens = points.slice(1).map((pt, i) => Math.hypot(pt[0] - points[i][0], pt[1] - points[i][1]));
  let d = clamp01(p) * lens.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const t = lens[i] ? d / lens[i] : 1;
      return [lerp(points[i][0], points[i + 1][0], t), lerp(points[i][1], points[i + 1][1], t)];
    }
    d -= lens[i];
  }
  return points[points.length - 1];
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Elapsed time in ms, from 0 to `duration`, restarting whenever `runKey` changes.
 * With reduced motion it jumps straight to the end state.
 */
export function useTimeline(duration, runKey) {
  const [t, setT] = useState(0);
  const raf = useRef();
  useEffect(() => {
    if (prefersReducedMotion()) {
      setT(duration);
      return undefined;
    }
    let start;
    const tick = (now) => {
      start ??= now;
      const e = Math.min(now - start, duration);
      setT(e);
      if (e < duration) raf.current = requestAnimationFrame(tick);
    };
    setT(0);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [duration, runKey]);
  return t;
}

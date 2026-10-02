import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import { useTimeline, prefersReducedMotion } from '../field/motion';
import './scene.css';

/**
 * Every slide visual has the same shape:
 *
 *   ┌ header ─ a title line: what to look at ("Offense · 11", "Tap the players…") ┐
 *   │ body   ─ the picture itself (usually a <Field>)                               │
 *   └ footer ─ legends, captions, extra info (line colours, a chart, a player card) ┘
 *
 * Three kinds, all sharing that frame:
 *   <StillScene>       a picture that doesn't move
 *   <FluidScene>       a continuous animation, like a short video (children get the time `t` in ms)
 *   <StopMotionScene>  a few frames, one after the other, with back / play-pause / forward controls
 *                      (children get the frame index `i`)
 *
 * header/footer can be a node, or a function of `t` (fluid) / `i` (stop motion).
 */

function Frame({ kind, header, footer, children, className = '' }) {
  return (
    <figure className={`scene scene-${kind} ${className}`}>
      {header && <div className="scene-head">{header}</div>}
      <div className="scene-body">{children}</div>
      {footer && <figcaption className="scene-foot">{footer}</figcaption>}
    </figure>
  );
}

const call = (x, arg) => (typeof x === 'function' ? x(arg) : x);

export function StillScene({ header, footer, className, children }) {
  return <Frame kind="still" header={header} footer={footer} className={className}>{children}</Frame>;
}

export function FluidScene({ duration, replay, header, footer, className, children }) {
  const t = useTimeline(duration, replay);
  return (
    <Frame kind="fluid" header={call(header, t)} footer={call(footer, t)} className={className}>
      {children(t)}
    </Frame>
  );
}

/**
 * frames: how many frames. interval: ms per frame while playing.
 * It never loops: playback stops on the last frame, "back" is disabled on the first and "forward" on the last.
 * Pressing play on the last frame starts over. Stepping by hand pauses playback.
 */
export function StopMotionScene({ frames, interval = 2300, replay, header, footer, className, children }) {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const last = frames - 1;

  useEffect(() => { setI(0); setPlaying(!prefersReducedMotion()); }, [replay]);
  useEffect(() => {
    if (!playing) return undefined;
    if (i >= last) { setPlaying(false); return undefined; }
    const id = setTimeout(() => setI((n) => Math.min(n + 1, last)), interval);
    return () => clearTimeout(id);
  }, [i, playing, last, interval]);

  const step = (d) => { setPlaying(false); setI((n) => Math.max(0, Math.min(last, n + d))); };
  const toggle = () => {
    if (playing) { setPlaying(false); return; }
    if (i >= last) setI(0);
    setPlaying(true);
  };

  const controls = (
    <div className="scene-player">
      <div className="scene-frames" role="status" aria-live="polite">
        <span className="scene-pips" aria-hidden="true">
          {Array.from({ length: frames }, (_, n) => <i key={n} className={n < i ? 'is-done' : n === i ? 'is-on' : ''} />)}
        </span>
        <span className="scene-count">{t('ui.scene.frame', { i: i + 1, n: frames })}</span>
      </div>
      <span className="scene-controls">
        <button onClick={() => step(-1)} disabled={i === 0} aria-label={t('ui.deck.stepBack')} title={t('ui.deck.stepBack')}>⏮</button>
        <button onClick={toggle} className="is-main" aria-label={t(playing ? 'ui.deck.pause' : 'ui.deck.play')} title={t(playing ? 'ui.deck.pause' : 'ui.deck.play')}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={() => step(1)} disabled={i === last} aria-label={t('ui.deck.stepForward')} title={t('ui.deck.stepForward')}>⏭</button>
      </span>
    </div>
  );

  return (
    <Frame
      kind="stop"
      header={call(header, i)}
      footer={<>{call(footer, i)}{controls}</>}
      className={className}
    >
      {children(i)}
    </Frame>
  );
}

/* ---------- building blocks for headers and footers ---------- */

/** A row of colour keys: [{ swatch: 'los' | 'ltg' | 'team-off' | 'team-def' | 'nz' | 'g-ol' …, label }]. */
export function Legend({ items, strong = false }) {
  return (
    <span className={`scene-legend ${strong ? 'is-strong' : ''}`}>
      {items.map(({ swatch, label }) => (
        <span key={label}>{swatch && <i className={`swatch ${swatch}`} />}{label}</span>
      ))}
    </span>
  );
}

/** A one-line hint, e.g. "Tap the players to see what they do". */
export function Hint({ children }) {
  return <span className="scene-hint">👆 {children}</span>;
}

/** A dark chip + a caption on the next line, for the current state of an animation (fixed height). */
export function StateLine({ chip, caption, highlight = false }) {
  return (
    <span className="scene-state">
      <span className={`scene-chip ${highlight ? 'is-hl' : ''}`}>{chip}</span>
      {caption && <span className="scene-caption">{caption}</span>}
    </span>
  );
}

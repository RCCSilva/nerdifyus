import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18n';
import './deck.css';

/**
 * Slide deck: one idea per slide, tap/arrow/swipe to move. The current slide lives in ?s=N.
 *
 * slides:     [{ id, Visual, refs }]
 * textPath:   i18n prefix for slide text, e.g. "nfl.slides" → nfl.slides.<id>.{title, body, example}
 * resolveRef: turns a ref into { label, href, title }
 * footer:     rendered under the last slide (e.g. links onward)
 */
/** 0-based slide index from ?s=N (1-based), clamped to the deck. */
export const slideIndex = (params, n) => Math.min(Math.max(parseInt(params.get('s') ?? '1', 10) - 1 || 0, 0), n - 1);

export default function Deck({ slides, textPath, resolveRef, footer }) {
  const { t, tm } = useI18n();
  const [params, setParams] = useSearchParams();
  const n = slides.length;
  const index = slideIndex(params, n);
  const [replay, setReplay] = useState(0);
  const stage = useRef(null);

  // Slide direction for the transition. The index can also change from outside (sidebar links).
  const prev = useRef(index);
  const dir = index >= prev.current ? 1 : -1;
  useEffect(() => { prev.current = index; }, [index]);

  const go = useCallback((to) => {
    if (to < 0 || to >= n || to === index) return;
    setParams({ s: String(to + 1) }, { replace: true });
  }, [index, n, setParams]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(index + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(index - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index]);

  // Swipe: horizontal drags over the slide (ignored when they start on a button).
  const start = useRef(null);
  // Swipe is for touch screens only: with a mouse, dragging selects text (arrows and keys still work).
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse') return;
    if (e.target.closest('button, a, input, select, textarea, [role="button"]')) return;
    start.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
  };

  const slide = slides[index];
  const text = tm(`${textPath}.${slide.id}`) ?? {};
  const { Visual } = slide;

  return (
    <section className="deck" aria-roledescription="carousel">
      <nav className="deck-progress" aria-label={t('ui.deck.slides')}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={i === index ? 'is-on' : i < index ? 'is-done' : ''}
            onClick={() => go(i)}
            aria-label={t('ui.deck.progress', { i: i + 1, n })}
            aria-current={i === index ? 'step' : undefined}
          />
        ))}
      </nav>
      {/* screen readers hear which slide they're on when it changes */}
      <p className="sr-only" aria-live="polite">{t('ui.deck.progress', { i: index + 1, n })}: {text.title}</p>

      <div
        className="deck-stage"
        ref={stage}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { start.current = null; }}
      >
        <article
          key={slide.id}
          className={`slide ${dir > 0 ? 'from-right' : 'from-left'}`}
          aria-roledescription="slide"
          aria-label={t('ui.deck.progress', { i: index + 1, n })}
        >
          <h2 className="slide-title">{text.title}</h2>
          <div className="slide-visual">
            <Visual replay={replay} />
          </div>
          <div className="slide-text">
            {text.body && <p className="slide-body">{text.body}</p>}
            {text.bullets && (
              <ul className="slide-bullets">
                {text.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
            {text.example && <p className="slide-example">{text.example}</p>}
            {text.aside && (
              <div className="slide-aside" role="note">
                <strong><span aria-hidden="true">🎯 </span>{text.aside.title}</strong>
                <p>{text.aside.body}</p>
              </div>
            )}
            {text.note && (
              <div className="slide-note" role="note">
                <strong><span aria-hidden="true">⚠ </span>{t('ui.deck.important')}</strong>
                <p>{text.note}</p>
              </div>
            )}
            {text.insight && (
              <div className="slide-insight" role="note">
                <strong><span aria-hidden="true">💡 </span>{t('ui.deck.insight')}</strong>
                <p>{text.insight}</p>
                <small>{t('ui.deck.insightHint')}</small>
              </div>
            )}
            {index === n - 1 && footer}
            {slide.refs?.length > 0 && (
              <p className="slide-refs">
                <span>{t('ui.deck.source')}:</span>
                {slide.refs.map((r, i) => {
                  const ref = resolveRef(r);
                  return (
                    <a key={i} href={ref.href} target="_blank" rel="noreferrer" title={ref.title}>{ref.label}</a>
                  );
                })}
              </p>
            )}
          </div>
        </article>
      </div>

      <nav className="deck-nav">
        <button className="deck-btn" onClick={() => go(index - 1)} disabled={index === 0} aria-label={t('ui.deck.prev')}>←</button>
        <span className="deck-count">{index + 1} / {n}</span>
        <button className="deck-replay" onClick={() => setReplay((r) => r + 1)}><span aria-hidden="true">↻ </span>{t('ui.deck.replay')}</button>
        <button className="deck-btn primary" onClick={() => go(index + 1)} disabled={index === n - 1} aria-label={t('ui.deck.next')}>→</button>
      </nav>
      {index === 0 && <p className="deck-hint">{t('ui.deck.hint')}</p>}
    </section>
  );
}

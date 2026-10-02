import { useEffect, useState } from 'react';
import { useI18n } from '../../../i18n/I18n';
import { prefersReducedMotion } from '../../../components/field/motion';
import { LEAGUE, DIVISIONS, SCHEDULE } from '../league';
import './season.css';

// Visuals for "How the season works" (research/nfl/04-season.md).
// The bracket uses an EXAMPLE outcome to show the rules (seed 7 upsets seed 2); it is not a real season.

const CONFS = ['AFC', 'NFC'];
const delay = (n, step = 40) => ({ animationDelay: `${n * step}ms` });

/* ---------- 32 teams, 2 conferences ---------- */

export function LeagueVisual({ replay }) {
  return (
    <div className="season-panel league" key={replay}>
      {CONFS.map((c) => {
        const teams = DIVISIONS.flatMap((d) => LEAGUE[c][d]);
        return (
          <section key={c} className={`conf conf-${c.toLowerCase()}`}>
            <h3>{c} <span>· 16</span></h3>
            <div className="team-chips">
              {teams.map((team, n) => <span key={team} className="team-chip" style={delay(n, 30)}>{team}</span>)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ---------- 4 divisions of 4 ---------- */

export function DivisionsVisual({ replay }) {
  const { t } = useI18n();
  let n = 0;
  return (
    <div className="season-panel divisions" key={replay}>
      {CONFS.map((c) => (
        <section key={c} className={`conf conf-${c.toLowerCase()}`}>
          <h3>{c}</h3>
          <div className="division-grid">
            {DIVISIONS.map((d) => (
              <div key={d} className="division" style={delay(n++, 70)}>
                <strong>{t(`nfl.season.division.${d}`)}</strong>
                <ul>{LEAGUE[c][d].map((team) => <li key={team}>{team}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------- the 17 games ---------- */

export function ScheduleVisual({ replay }) {
  const { t } = useI18n();
  const [hover, setHover] = useState(null);
  let g = 0;
  return (
    <div className="season-panel schedule" key={replay}>
      <div className="game-strip" aria-hidden="true">
        {SCHEDULE.flatMap(([key, count]) =>
          Array.from({ length: count }, (_, i) => (
            <span key={`${key}${i}`} className={`game g-${key} ${hover && hover !== key ? 'is-dim' : ''}`} style={delay(g++, 70)}>
              {g}
            </span>
          )))}
      </div>
      <ul className="schedule-legend">
        {SCHEDULE.map(([key, count]) => (
          <li key={key} onMouseEnter={() => setHover(key)} onMouseLeave={() => setHover(null)}>
            <span className={`game g-${key}`}>{count}</span>
            <span>{t(`nfl.season.schedule.${key}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- who makes the playoffs ---------- */

export function SeedsVisual({ replay }) {
  const { t } = useI18n();
  const rows = [1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="season-panel seeds" key={replay}>
      <h3>{t('nfl.season.oneConference')}</h3>
      <ol className="seed-list">
        {rows.map((s) => (
          <li key={s} className={s <= 4 ? 'is-champ' : 'is-wild'} style={delay(s, 110)}>
            <span className="seed">{s}</span>
            <span className="seed-what">{s <= 4 ? t('nfl.season.divChamp') : t('nfl.season.wildCard')}</span>
            {s === 1 && <span className="seed-tag">{t('nfl.season.bye')}</span>}
          </li>
        ))}
        <li className="is-out" style={delay(8, 110)}>
          <span className="seed">8–16</span>
          <span className="seed-what">{t('nfl.season.out')}</span>
        </li>
      </ol>
    </div>
  );
}

/* ---------- the bracket, step by step ---------- */

// Example run through one conference. Seeds only, no real teams.
const BRACKET_STEPS = [
  { key: 'seeds', games: [], bye: 1 },
  { key: 'wildCard', games: [[2, 7], [3, 6], [4, 5]], bye: 1 },
  { key: 'wildCardResult', games: [[2, 7, 7], [3, 6, 3], [4, 5, 4]], bye: 1 },
  { key: 'divisional', games: [[1, 7], [3, 4]] },
  { key: 'divisionalResult', games: [[1, 7, 1], [3, 4, 3]] },
  { key: 'conference', games: [[1, 3]] },
  { key: 'conferenceResult', games: [[1, 3, 1]] },
];

export function BracketVisual({ replay }) {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  useEffect(() => { setI(0); }, [replay]);
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const id = setTimeout(() => setI((n) => (n + 1) % BRACKET_STEPS.length), i === BRACKET_STEPS.length - 1 ? 3600 : 2600);
    return () => clearTimeout(id);
  }, [i]);
  const step = BRACKET_STEPS[i];

  return (
    <div className="season-panel bracket downs">
      <div className="downs-board" aria-live="polite">
        <span className="downs-chip">{t(`nfl.season.round.${step.key}`)}</span>
        <span className="downs-caption">{t(`nfl.season.roundHow.${step.key}`)}</span>
      </div>
      <div className="bracket-body" key={i}>
        {step.key === 'seeds' && (
          <div className="seed-row">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => <span key={s} className={`seed-pill ${s <= 4 ? 'champ' : 'wild'}`} style={delay(s, 60)}>{s}</span>)}
          </div>
        )}
        {step.games.map(([home, away, winner], n) => (
          <div key={`${home}-${away}`} className="matchup" style={delay(n, 120)}>
            <span className={`seed-pill ${home <= 4 ? 'champ' : 'wild'} ${winner && winner !== home ? 'lost' : ''} ${winner === home ? 'won' : ''}`}>{home}</span>
            <span className="vs">{t('nfl.season.hosts')}</span>
            <span className={`seed-pill ${away <= 4 ? 'champ' : 'wild'} ${winner && winner !== away ? 'lost' : ''} ${winner === away ? 'won' : ''}`}>{away}</span>
          </div>
        ))}
        {step.bye && step.key !== 'seeds' && (
          <div className="matchup bye">
            <span className="seed-pill champ won">{step.bye}</span>
            <span className="vs">{t('nfl.season.bye')}</span>
          </div>
        )}
      </div>
      <div className="downs-legend">
        <span><i className="swatch seed-champ" />{t('nfl.season.divChamp')}</span>
        <span><i className="swatch seed-wild" />{t('nfl.season.wildCard')}</span>
        <span className="downs-dots">
          {BRACKET_STEPS.map((s, n) => (
            <button key={s.key} className={n === i ? 'is-on' : ''} onClick={() => setI(n)} aria-label={t(`nfl.season.round.${s.key}`)} />
          ))}
        </span>
      </div>
    </div>
  );
}

/* ---------- Super Bowl ---------- */

export function SuperBowlVisual({ replay }) {
  const { t } = useI18n();
  return (
    <div className="season-panel superbowl" key={replay}>
      <div className="sb-side conf-afc"><span>AFC</span><small>{t('nfl.season.champion')}</small></div>
      <div className="sb-trophy" aria-hidden="true">
        <svg viewBox="0 0 40 70"><path d="M20 4c5 6 9 13 9 21 0 9-5 15-9 17-4-2-9-8-9-17 0-8 4-15 9-21z" /><rect x="15" y="42" width="10" height="14" rx="2" /><rect x="10" y="56" width="20" height="8" rx="2" /></svg>
        <strong>Super Bowl</strong>
      </div>
      <div className="sb-side conf-nfc"><span>NFC</span><small>{t('nfl.season.champion')}</small></div>
    </div>
  );
}

/* ---------- recap ---------- */

export function SeasonEndVisual({ replay }) {
  const { t } = useI18n();
  const steps = ['regular', 'playoffs', 'superBowl'];
  return (
    <div className="season-panel season-steps" key={replay}>
      {steps.map((s, n) => (
        <div key={s} className="season-step" style={delay(n, 160)}>
          <span className="season-step-num">{n + 1}</span>
          <span>{t(`nfl.season.recap.${s}`)}</span>
        </div>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { useI18n } from '../../../i18n/I18n';
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

/* ---------- the bracket: every round, stacked ---------- */

// Example run through one conference (seeds only, no real teams): seed 7 upsets seed 2.
// Shown all at once, top to bottom, so readers scroll at their own pace (no auto-advancing steps).
const ROUNDS = [
  { key: 'wildCard', games: [[2, 7, 7], [3, 6, 3], [4, 5, 4]], bye: 1 },
  { key: 'divisional', games: [[1, 7, 1], [3, 4, 3]] },
  { key: 'conference', games: [[1, 3, 1]] },
  { key: 'superBowl', champion: 1 },
];

const pill = (seed, winner) =>
  `seed-pill ${seed <= 4 ? 'champ' : 'wild'}${winner && winner !== seed ? ' lost' : ''}${winner === seed ? ' won' : ''}`;

export function BracketVisual({ replay }) {
  const { t } = useI18n();
  return (
    <div className="season-panel bracket" key={replay}>
      <div className="bracket-legend">
        <span><i className="swatch seed-champ" />{t('nfl.season.divChamp')}</span>
        <span><i className="swatch seed-wild" />{t('nfl.season.wildCard')}</span>
        <span className="bracket-example">{t('nfl.season.example')}</span>
      </div>
      {ROUNDS.map((r, n) => (
        <section key={r.key} className="round" style={delay(n, 160)}>
          <header>
            <span className="round-chip">{t(`nfl.season.round.${r.key}`)}</span>
            <span className="round-how">{t(`nfl.season.roundHow.${r.key}`)}</span>
          </header>
          <div className="round-games">
            {r.games?.map(([home, away, winner]) => (
              <div key={`${home}-${away}`} className="matchup">
                <span className={pill(home, winner)}>{home}</span>
                <span className="vs">{t('nfl.season.hosts')}</span>
                <span className={pill(away, winner)}>{away}</span>
              </div>
            ))}
            {r.bye && (
              <div className="matchup bye">
                <span className="seed-pill champ won">{r.bye}</span>
                <span className="vs">{t('nfl.season.bye')}</span>
              </div>
            )}
            {r.champion && (
              <div className="matchup">
                <span className="seed-pill champ won">{r.champion}</span>
                <span className="vs">→ Super Bowl</span>
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------- a real season: 2025 (S68 seeds and results, S69 records) ---------- */

// [seed, team, record, division (null = wild card)]
const SEEDS_2025 = {
  NFC: [[1, 'Seahawks', '14-3', 'west'], [2, 'Bears', '11-6', 'north'], [3, 'Eagles', '11-6', 'east'], [4, 'Panthers', '8-9', 'south'],
    [5, 'Rams', '12-5', null], [6, '49ers', '12-5', null], [7, 'Packers', '9-7-1', null]],
  AFC: [[1, 'Broncos', '14-3', 'west'], [2, 'Patriots', '14-3', 'east'], [3, 'Jaguars', '13-4', 'south'], [4, 'Steelers', '10-7', 'north'],
    [5, 'Texans', '12-5', null], [6, 'Bills', '12-5', null], [7, 'Chargers', '11-6', null]],
};
// The 4th seed won its division with a worse record than seeds 5–6.
const STANDOUT = { NFC: 4, AFC: 4 };

export function Seeds2025Visual({ replay }) {
  const { t } = useI18n();
  return (
    <div className="season-panel seeds-real" key={replay}>
      {['NFC', 'AFC'].map((conf) => (
        <section key={conf} className={`seeds-conf conf-${conf.toLowerCase()}`}>
          <h3>{conf} · {t('nfl.season.real.season')}</h3>
          <ol className="seed-list">
            {SEEDS_2025[conf].map(([seed, team, record, div], n) => (
              <li key={seed} className={`${div ? 'is-champ' : 'is-wild'}${seed === STANDOUT[conf] ? ' is-standout' : ''}`} style={delay(n, 70)}>
                <span className="seed">{seed}</span>
                <span className="seed-team">{team}</span>
                <span className="seed-record">{record}</span>
                <span className="seed-why">{div ? t('nfl.season.real.wonDiv', { div: t(`nfl.season.division.${div}`) }) : t('nfl.season.wildCard')}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

// Each game: [home seed, away seed, home score, away score, overtime?]. Teams come from SEEDS_2025.
const RESULTS_2025 = {
  NFC: { wildCard: [[2, 7, 31, 27], [3, 6, 19, 23], [4, 5, 31, 34]], divisional: [[1, 6, 41, 6], [2, 5, 17, 20, true]], conference: [[1, 5, 31, 27]] },
  AFC: { wildCard: [[2, 7, 16, 3], [3, 6, 24, 27], [4, 5, 6, 30]], divisional: [[1, 6, 33, 30, true], [2, 5, 28, 16]], conference: [[1, 2, 7, 10]] },
};

function Side({ conf, seed, score, won }) {
  const [, team] = SEEDS_2025[conf][seed - 1];
  return (
    <span className={`res-side${won ? ' is-won' : ''}`}>
      <span className={`seed-pill sm ${seed <= 4 ? 'champ' : 'wild'}`}>{seed}</span>
      <span className="res-team">{team}</span>
      <b>{score}</b>
    </span>
  );
}

export function Bracket2025Visual({ replay }) {
  const { t } = useI18n();
  return (
    <div className="season-panel bracket" key={replay}>
      <div className="bracket-legend">
        <span><i className="swatch seed-champ" />{t('nfl.season.divChamp')}</span>
        <span><i className="swatch seed-wild" />{t('nfl.season.wildCard')}</span>
        <span className="bracket-example">{t('nfl.season.real.hostFirst')}</span>
      </div>
      {['wildCard', 'divisional', 'conference'].map((round, n) => (
        <section key={round} className="round" style={delay(n, 160)}>
          <header><span className="round-chip">{t(`nfl.season.round.${round}`)}</span></header>
          {['NFC', 'AFC'].map((conf) => (
            <div key={conf} className="res-conf">
              <small className={`res-conf-tag conf-${conf.toLowerCase()}`}>{conf}</small>
              <div className="res-games">
                {RESULTS_2025[conf][round].map(([home, away, hs, as, ot]) => (
                  <div key={`${home}-${away}`} className="res-game">
                    <Side conf={conf} seed={home} score={hs} won={hs > as} />
                    <span className="vs">×</span>
                    <Side conf={conf} seed={away} score={as} won={as > hs} />
                    {ot && <small className="res-ot">{t('nfl.season.real.ot')}</small>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
      <section className="round" style={delay(3, 160)}>
        <header><span className="round-chip">{t('nfl.season.round.superBowl')} LX</span></header>
        <div className="res-games">
          <div className="res-game">
            <span className="res-side is-won"><span className="res-conf-tag conf-nfc">NFC</span><span className="res-team">Seahawks</span><b>29</b></span>
            <span className="vs">×</span>
            <span className="res-side"><span className="res-conf-tag conf-afc">AFC</span><span className="res-team">Patriots</span><b>13</b></span>
          </div>
        </div>
      </section>
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

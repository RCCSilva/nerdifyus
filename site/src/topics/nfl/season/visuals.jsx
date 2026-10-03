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

/* ---------- the bracket: one box per game ---------- */

// A classic bracket for one conference, drawn after the games: Wild Card → Divisional → Conference.
// The top seed has a bye, so it only shows up in the Divisional round. The NFL reseeds (the top seed
// hosts the lowest seed left), so each conference is laid out from the real (or example) results.
// A side is { seed, team?, code?, score? }; a game is [top side, bottom side, overtime?]; the winner
// has the higher score, or `won: true` when there are no scores (the example).

const sideWon = (game, i) => {
  const [a, b] = game;
  if (a.score != null) return i === 0 ? a.score > b.score : b.score > a.score;
  return Boolean(game[i].won);
};

function BkSide({ side, won }) {
  return (
    <span className={`bk-side${won ? ' is-won' : ''}`}>
      <span className={`seed-pill sm ${side.seed <= 4 ? 'champ' : 'wild'}`}>{side.seed}</span>
      {side.team && <span className="bk-team"><span className="bk-long">{side.team}</span><span className="bk-code">{side.code}</span></span>}
      {side.score != null && <b>{side.score}</b>}
    </span>
  );
}

function BkGame({ game }) {
  const { t } = useI18n();
  return (
    <div className="bk-game">
      <BkSide side={game[0]} won={sideWon(game, 0)} />
      <BkSide side={game[1]} won={sideWon(game, 1)} />
      {game[2] && <small className="bk-ot">{t('nfl.season.real.ot')}</small>}
    </div>
  );
}

function BkBye({ side }) {
  const { t } = useI18n();
  return (
    <div className="bk-game is-bye">
      <BkSide side={side} won />
      <small>{t('nfl.season.bye')}</small>
    </div>
  );
}

/** wildCard: [bye side, game, game, game] in bracket order; divisional: [game, game]; conference: game. */
function ConferenceBracket({ conf, wildCard, divisional, conference }) {
  const { t } = useI18n();
  const slot = (child, key) => <div key={key} className="bk-slot">{child}</div>;
  const { score, ...champ } = conference[sideWon(conference, 0) ? 0 : 1]; // no score in the champion's box
  return (
    <section className={`bk conf-${(conf || 'nfc').toLowerCase()}`}>
      {conf && <h3 className="bk-conf">{conf}</h3>}
      <div className="bk-heads">
        {['wildCard', 'divisional', 'conference'].map((r) => <small key={r}>{t(`nfl.season.round.${r}`)}</small>)}
        <small>Super Bowl</small>
      </div>
      <div className="bk-grid">
        <div className="bk-col">
          <div className="bk-pair">{slot(<BkBye side={wildCard[0]} />, 'bye')}{slot(<BkGame game={wildCard[1]} />, 'g1')}</div>
          <div className="bk-pair">{slot(<BkGame game={wildCard[2]} />, 'g2')}{slot(<BkGame game={wildCard[3]} />, 'g3')}</div>
        </div>
        <div className="bk-col">
          <div className="bk-pair">{slot(<BkGame game={divisional[0]} />, 'd1')}{slot(<BkGame game={divisional[1]} />, 'd2')}</div>
        </div>
        <div className="bk-col">
          <div className="bk-pair is-single">{slot(<BkGame game={conference} />, 'c')}</div>
        </div>
        <div className="bk-col bk-final">
          <div className="bk-pair is-single">{slot(<div className="bk-game is-champ"><BkSide side={champ} won /></div>, 'f')}</div>
        </div>
      </div>
    </section>
  );
}

// The example: seeds only. The 7th knocks out the 2nd, so the 1st hosts the 7th next.
const S = (seed, won) => ({ seed, won });
const EXAMPLE = {
  wildCard: [S(1), [S(3, true), S(6)], [S(2), S(7, true)], [S(4, true), S(5)]],
  divisional: [[S(1, true), S(7)], [S(3, true), S(4)]],
  conference: [S(1, true), S(3)],
};

export function BracketVisual({ replay }) {
  const { t } = useI18n();
  return (
    <div className="season-panel bracket" key={replay}>
      <div className="bracket-legend">
        <span><i className="swatch seed-champ" />{t('nfl.season.divChamp')}</span>
        <span><i className="swatch seed-wild" />{t('nfl.season.wildCard')}</span>
        <span className="bracket-example">{t('nfl.season.example')}</span>
      </div>
      <ConferenceBracket {...EXAMPLE} />
    </div>
  );
}

// 2025–26, from S68. Codes are the teams' usual abbreviations, for narrow screens.
const CODES = { Seahawks: 'SEA', Bears: 'CHI', Eagles: 'PHI', Panthers: 'CAR', Rams: 'LAR', '49ers': 'SF', Packers: 'GB',
  Broncos: 'DEN', Patriots: 'NE', Jaguars: 'JAX', Steelers: 'PIT', Texans: 'HOU', Bills: 'BUF', Chargers: 'LAC' };
const T = (conf, seed, score) => { const team = SEEDS_2025[conf][seed - 1][1]; return { seed, team, code: CODES[team], score }; };
const REAL_2025 = {
  NFC: {
    wildCard: [T('NFC', 1), [T('NFC', 3, 19), T('NFC', 6, 23)], [T('NFC', 2, 31), T('NFC', 7, 27)], [T('NFC', 4, 31), T('NFC', 5, 34)]],
    divisional: [[T('NFC', 1, 41), T('NFC', 6, 6)], [T('NFC', 2, 17), T('NFC', 5, 20), true]],
    conference: [T('NFC', 1, 31), T('NFC', 5, 27)],
  },
  AFC: {
    wildCard: [T('AFC', 1), [T('AFC', 3, 24), T('AFC', 6, 27)], [T('AFC', 2, 16), T('AFC', 7, 3)], [T('AFC', 4, 6), T('AFC', 5, 30)]],
    divisional: [[T('AFC', 1, 33), T('AFC', 6, 30), true], [T('AFC', 2, 28), T('AFC', 5, 16)]],
    conference: [T('AFC', 1, 7), T('AFC', 2, 10)],
  },
};

export function Bracket2025Visual({ replay }) {
  const { t } = useI18n();
  return (
    <div className="season-panel bracket" key={replay}>
      <div className="bracket-legend">
        <span><i className="swatch seed-champ" />{t('nfl.season.divChamp')}</span>
        <span><i className="swatch seed-wild" />{t('nfl.season.wildCard')}</span>
        <span className="bracket-example">{t('nfl.season.real.hostFirst')}</span>
      </div>
      <ConferenceBracket conf="NFC" {...REAL_2025.NFC} />
      <ConferenceBracket conf="AFC" {...REAL_2025.AFC} />
      <section className="bk-sb">
        <small>Super Bowl LX</small>
        <div className="bk-game is-final">
          <span className="bk-side is-won"><span className="res-conf-tag conf-nfc">NFC</span><span className="bk-team">Seahawks</span><b>29</b></span>
          <span className="bk-side"><span className="res-conf-tag conf-afc">AFC</span><span className="bk-team">Patriots</span><b>13</b></span>
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

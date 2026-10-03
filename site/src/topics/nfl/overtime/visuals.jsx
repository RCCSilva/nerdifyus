import { useI18n } from '../../../i18n/I18n';
import { useTimeline } from '../../../components/field/motion';
import './overtime.css';

// Visuals for "Ties & overtime" (research/nfl/05-overtime.md). Scores and teams are EXAMPLES.

const delay = (n, step = 140) => ({ animationDelay: `${n * step}ms` });

/* ---------- tied after 60 minutes ---------- */

export function OvertimeWhenVisual({ replay }) {
  const { t } = useI18n();
  const t1 = useTimeline(2600, replay);
  return (
    <div className="ot-panel ot-when" key={replay}>
      <div className="ot-board">
        <span className="ot-team">{t('nfl.game.away')}</span>
        <span className="ot-score">20</span>
        <span className="ot-dash">–</span>
        <span className="ot-score">20</span>
        <span className="ot-team">{t('nfl.game.home')}</span>
        <span className="ot-clock">{t('nfl.game.q4')} 0:00</span>
      </div>
      <div className={`ot-coin ${t1 > 900 ? 'is-on' : ''}`} aria-hidden="true" />
      <div className={`ot-badge ${t1 > 1800 ? 'is-on' : ''}`}>{t('nfl.overtime.overtime')}</div>
    </div>
  );
}

/* ---------- regular season: one 10-minute period ---------- */

export function OvertimeRegularVisual({ replay }) {
  const { t } = useI18n();
  return (
    <div className="ot-panel" key={replay}>
      <div className="ot-period">
        <span className="ot-period-fill" />
        <span className="ot-period-label">{t('nfl.overtime.otShort')} · 10:00</span>
      </div>
      <div className="ot-timeouts">
        {['away', 'home'].map((side) => (
          <div key={side} className="ot-to-row">
            <span>{t(`nfl.game.${side}`)}</span>
            <span className="sb-timeouts big ot-two"><i className="on" /><i className="on" /></span>
            <small>{t('nfl.overtime.twoTimeouts')}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- both teams get a chance with the ball ---------- */

export function PossessionVisual({ replay }) {
  const { t } = useI18n();
  return (
    <div className="ot-panel ot-possession" key={replay}>
      {['A', 'B'].map((team, n) => (
        <div key={team} className={`ot-poss team-${team}`} style={delay(n, 450)}>
          <span className="ot-poss-team">{t('nfl.overtime.team', { x: team })}</span>
          <span className="ot-poss-what">{t(n === 0 ? 'nfl.overtime.receivesKickoff' : 'nfl.overtime.thenGetsBall')}</span>
          <span className="ot-poss-ball" aria-hidden="true" />
        </div>
      ))}
      <p className="ot-poss-rule" style={delay(2, 450)}>{t('nfl.overtime.bothChance')}</p>
    </div>
  );
}

/* ---------- who wins: the scenarios, stacked ---------- */

// [team A's first possession, team B's first possession, result] — results apply R16-1-3(b)/(c).
const SCENARIOS = [
  ['td', 'fg', 'aWins'],
  ['fg', 'td', 'bWins'],
  ['fg', 'fg', 'nextScore'],
  ['none', 'any', 'nextScore2'],
];

export function ScenariosVisual({ replay }) {
  const { t } = useI18n();
  return (
    <div className="ot-panel ot-scenarios" key={replay}>
      <div className="ot-sc-head">
        <span>{t('nfl.overtime.team', { x: 'A' })}</span>
        <span>{t('nfl.overtime.team', { x: 'B' })}</span>
        <span>{t('nfl.overtime.result')}</span>
      </div>
      {SCENARIOS.map(([a, b, r], n) => (
        <div key={n} className="ot-sc-row" style={delay(n)}>
          <span className={`ot-ev ev-${a}`}>{t(`nfl.overtime.ev.${a}`)}</span>
          <span className={`ot-ev ev-${b}`}>{t(`nfl.overtime.ev.${b}`)}</span>
          <span className={`ot-res res-${r}`}>{t(`nfl.overtime.res.${r}`)}</span>
        </div>
      ))}
      <p className="ot-example">{t('nfl.season.example')}</p>
    </div>
  );
}

/* ---------- still tied after 10 minutes: a tie ---------- */

export function TieVisual({ replay }) {
  const { t } = useI18n();
  return (
    <div className="ot-panel ot-when" key={replay}>
      <div className="ot-board">
        <span className="ot-team">{t('nfl.game.away')}</span>
        <span className="ot-score">23</span>
        <span className="ot-dash">–</span>
        <span className="ot-score">23</span>
        <span className="ot-team">{t('nfl.game.home')}</span>
        <span className="ot-clock">{t('nfl.overtime.otShort')} 0:00</span>
      </div>
      <div className="ot-badge is-on is-tie">{t('nfl.overtime.tieFinal')}</div>
    </div>
  );
}

/* ---------- postseason: periods until someone wins ---------- */

export function PostseasonVisual({ replay }) {
  const { t } = useI18n();
  const periods = [1, 2, 3];
  return (
    <div className="ot-panel" key={replay}>
      <div className="ot-chain">
        {periods.map((p, n) => (
          <div key={p} className="ot-link" style={delay(n, 380)}>
            <span className="ot-period small"><span className="ot-period-label">{t('nfl.overtime.otShort')}{p} · 15:00</span></span>
            <span className="ot-arrow">→</span>
          </div>
        ))}
        <div className="ot-link" style={delay(3, 380)}><span className="ot-more">…</span></div>
      </div>
      <p className="ot-poss-rule" style={delay(4, 380)}>{t('nfl.overtime.untilWinner')}</p>
    </div>
  );
}

/* ---------- regular season vs playoffs ---------- */

export function OvertimeSummaryVisual({ replay }) {
  const { tm, t } = useI18n();
  return (
    <div className="ot-panel" key={replay}>
      <table className="ot-table">
        <thead>
          <tr><td /><th>{t('nfl.overtime.regular')}</th><th>{t('nfl.overtime.playoffs')}</th></tr>
        </thead>
        <tbody>
          {tm('nfl.overtime.rows').map(([label, reg, post], n) => (
            <tr key={label} style={delay(n, 110)}>
              <th>{label}</th><td>{reg}</td><td>{post}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

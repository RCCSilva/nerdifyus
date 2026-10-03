import { useI18n } from '../../../i18n/I18n';
import { useTimeline, seg } from '../../../components/field/motion';
import './game.css';

// Visuals for "The game" (research/nfl/02-the-game.md).
// The scoreboard is an EXAMPLE with made-up numbers and generic away/home labels.

const mmss = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

/* ---------- the example TV scoreboard ---------- */

/**
 * focus: which part to highlight — 'teams' | 'record' | 'timeouts' | 'score' | 'clock' | 'down' | 'play' | null (all)
 */
export function Scoreboard({ focus = null, playClock = 25 }) {
  const { t, tm } = useI18n();
  const part = (name) => `sb-part${focus && focus !== name ? ' is-dim' : ''}${focus === name ? ' is-focus' : ''}`;
  const teams = [
    { side: 'away', name: t('nfl.game.away'), record: '3-1', timeouts: 3, score: 14 },
    { side: 'home', name: t('nfl.game.home'), record: '2-2', timeouts: 2, score: 3 },
  ];
  return (
    <div className={`scorebug ${focus ? 'has-focus' : ''}`} role="img" aria-label={t('nfl.game.exampleScoreboard')}>
      <div className="sb-teams">
        {teams.map((tm_) => (
          <div key={tm_.side} className={`sb-team sb-${tm_.side}`}>
            <span className={`sb-name ${part('teams')}`}>{tm_.name}</span>
            <span className={`sb-record ${part('record')}`}>{tm_.record}</span>
            <span className={`sb-timeouts ${part('timeouts')}`} aria-hidden="true">
              {[0, 1, 2].map((i) => <i key={i} className={i < tm_.timeouts ? 'on' : ''} />)}
            </span>
            <span className={`sb-score ${part('score')}`}>{tm_.score}</span>
          </div>
        ))}
      </div>
      <div className="sb-info">
        <span className={`sb-clock ${part('clock')}`}>
          <b>{t('nfl.game.q2')}</b> 8:42
        </span>
        <span className={`sb-down ${part('down')}`}>
          {t('nfl.common.downDist', { down: tm('nfl.common.downs')[1], togo: 8 })}
        </span>
        <span className={`sb-play ${part('play')} ${playClock <= 5 ? 'is-low' : ''}`}>:{String(playClock).padStart(2, '0')}</span>
      </div>
      <span className="sb-example">{t('nfl.game.example')}</span>
    </div>
  );
}

/** What the two team labels on the example scoreboard stand for. */
function TeamsKey() {
  const { t } = useI18n();
  return <p className="sb-key">{t('nfl.game.teamsKey')}</p>;
}

const SbSlide = (focus) => function ScoreboardFocus() {
  return <div className="game-panel"><Scoreboard focus={focus} /><TeamsKey /></div>;
};

export const ScoreboardVisual = SbSlide(null);
export const ScoreboardTeamsVisual = SbSlide('teams');
export const ScoreboardRecordVisual = SbSlide('record');
export const ScoreboardTimeoutsVisual = SbSlide('timeouts');
export const ScoreboardScoreVisual = SbSlide('score');
export const ScoreboardClockVisual = SbSlide('clock');
export const ScoreboardDownVisual = SbSlide('down');

export function PlayClockVisual({ replay }) {
  const t1 = useTimeline(40000, replay); // real seconds
  const left = Math.max(0, 40 - Math.floor(t1 / 1000));
  return (
    <div className="game-panel">
      <Scoreboard focus="play" playClock={left} />
      <TeamsKey />
      <div className="big-playclock" aria-hidden="true">:{String(left).padStart(2, '0')}</div>
    </div>
  );
}

/* ---------- 60 minutes, 4 quarters ---------- */

export function GameLengthVisual({ replay }) {
  const { t } = useI18n();
  const t1 = useTimeline(4200, replay);
  const blocks = [
    { k: 'q1', w: 15 }, { k: 'brk', w: 2 }, { k: 'q2', w: 15 }, { k: 'half', w: 13 },
    { k: 'q3', w: 15 }, { k: 'brk', w: 2 }, { k: 'q4', w: 15 },
  ];
  return (
    <div className="game-panel">
      <div className="halves">
        <span>{t('nfl.game.firstHalf')}</span>
        <span>{t('nfl.game.secondHalf')}</span>
      </div>
      <div className="timeline">
        {blocks.map((b, n) => {
          const fill = seg(t1, n * 550, n * 550 + 500);
          const isQ = b.k.startsWith('q');
          return (
            <div key={n} className={`tl-block tl-${isQ ? 'q' : b.k}`} style={{ flexGrow: b.w }}>
              <span className="tl-fill" style={{ transform: `scaleX(${fill})` }} />
              <span className="tl-label">
                {isQ ? t(`nfl.game.${b.k}`) : b.k === 'half' ? t('nfl.game.halftime') : ''}
                <small>{isQ ? '15:00' : b.k === 'half' ? '13 min' : ''}</small>
              </span>
            </div>
          );
        })}
      </div>
      <p className="tl-total">4 × 15 = <b>60 min</b></p>
    </div>
  );
}

/* ---------- the clock counts down ---------- */

export function GameClockVisual({ replay }) {
  const { t } = useI18n();
  const t1 = useTimeline(6000, replay);
  // 2:06 → 2:00 in real time, then the automatic two-minute warning stops it.
  const sec = Math.max(120, 126 - Math.floor(t1 / 1000));
  const stopped = sec === 120;
  return (
    <div className="game-panel clock-panel">
      <div className="clock-face">
        <span className="clock-q">{t('nfl.game.q4')}</span>
        <span className={`clock-time ${stopped ? 'is-stopped' : ''}`}>{mmss(sec)}</span>
        <span className="clock-left">{t('nfl.game.left')}</span>
      </div>
      <div className={`clock-alert ${stopped ? 'is-on' : ''}`}>{t('nfl.game.twoMinute')}</div>
    </div>
  );
}

/* ---------- 3 timeouts per half ---------- */

export function TimeoutsVisual({ replay }) {
  const { t } = useI18n();
  const t1 = useTimeline(5200, replay);
  // Example: the away team uses two timeouts in the 1st half; the 2nd half starts with 3 again.
  const used = (t1 > 1200 ? 1 : 0) + (t1 > 2400 ? 1 : 0);
  const second = t1 > 3800;
  return (
    <div className="game-panel">
      <div className="to-grid">
        {['firstHalf', 'secondHalf'].map((h, hi) => (
          <div key={h} className={`to-half ${hi === 1 && !second ? 'is-dim' : ''}`}>
            <strong>{t(`nfl.game.${h}`)}</strong>
            {['away', 'home'].map((side) => {
              const left = hi === 0 && side === 'away' ? 3 - used : 3;
              return (
                <div key={side} className="to-row">
                  <span>{t(`nfl.game.${side}`)}</span>
                  <span className="sb-timeouts big">
                    {[0, 1, 2].map((i) => <i key={i} className={i < left ? 'on' : ''} />)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- recap ---------- */

export function GameEndVisual() {
  return <div className="game-panel"><Scoreboard /></div>;
}

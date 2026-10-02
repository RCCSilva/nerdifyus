import { useEffect, useState } from 'react';
import Field from '../../../components/field/Field';
import { Player, Ball, FieldLine, UprightText } from '../../../components/field/pieces';
import { fx, MID_Y, LENGTH, BORDER, END_ZONE, WIDTH } from '../../../components/field/geometry';
import { useTimeline, seg, lerp, along, prefersReducedMotion } from '../../../components/field/motion';
import { useI18n } from '../../../i18n/I18n';
import { OFFENSE, DEFENSE } from '../formations';

// Every visual is illustrative: it shows a rule from research/nfl/*.md, not a real play.

// Frame for upright (vertical) lineup views: 9 yd behind the line to 16 yd past it.
const LINEUP_VIEW = (los) => [los - 9, los + 16];
const LINEUP_Y = [7, WIDTH - 7];

const at = (los, p) => ({ ...p, x: los + p.dx });
const byGroup = (list, ...groups) => list.filter((p) => groups.includes(p.group));

export function Pop({ x, y, show, children, kind = '' }) {
  return (
    <g className={`pop ${kind} ${show ? 'is-on' : ''}`}>
      <UprightText x={x} y={y} className="pop-text">{children}</UprightText>
    </g>
  );
}

function Dim({ x1, x2, y, label, sub, vertical = false }) {
  const [a, b] = [x1, x2];
  const mid = (a + b) / 2;
  const text = (
    <>
      <tspan x={vertical ? y : mid} dy="-1.2">{label}</tspan>
      {sub && <tspan x={vertical ? y : mid} dy="3.6" className="dim-sub">{sub}</tspan>}
    </>
  );
  return (
    <g className="dim">
      {vertical ? (
        <>
          <line x1={y} x2={y} y1={a} y2={b} />
          <line x1={y - 0.8} x2={y + 0.8} y1={a} y2={a} />
          <line x1={y - 0.8} x2={y + 0.8} y1={b} y2={b} />
          <text x={y} y={mid} transform={`rotate(-90 ${y} ${mid})`}>{text}</text>
        </>
      ) : (
        <>
          <line x1={a} x2={b} y1={y} y2={y} />
          <line x1={a} x2={a} y1={y - 0.8} y2={y + 0.8} />
          <line x1={b} x2={b} y1={y - 0.8} y2={y + 0.8} />
          <text x={mid} y={y}>{text}</text>
        </>
      )}
    </g>
  );
}

const YARD_M = 0.9144; // exact, NIST (S5)

/** "91,4 m" / "91.4 m" in the visitor's locale. */
function useMeters() {
  const { locale } = useI18n();
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  return (yards) => `${nf.format(yards * YARD_M)} m`;
}

/* ---------- field ---------- */

export function IntroVisual({ replay }) {
  const { t: tr } = useI18n();
  const t = useTimeline(3400, replay);
  const y = MID_Y - 9; // above the centre, so the end-zone label stays readable
  const x = lerp(fx(22), fx(100.8), seg(t, 900, 2800));
  return (
    <Field highlight={t > 2700 ? ['endzones'] : []} endZoneText={['', tr('nfl.slides.intro.target')]} key={replay}>
      <g className="arrow">
        <line className="arrow-shaft" x1={fx(22)} x2={fx(96)} y1={y} y2={y} pathLength="1" />
        <polygon className="arrow-head" points={`${fx(100.5)},${y} ${fx(95.5)},${y - 2.6} ${fx(95.5)},${y + 2.6}`} />
      </g>
      <UprightText x={fx(30)} y={y + 4} className="tag tag-off">{tr('nfl.common.offense')} →</UprightText>
      <g transform={`translate(${x} ${y}) scale(3)`}><Ball x={0} y={0} /></g>
    </Field>
  );
}

export function FieldVisual() {
  const m = useMeters();
  return (
    <Field highlight={['fieldOfPlay']} className="anim-in">
      <Dim x1={fx(0)} x2={fx(100)} y={MID_Y - 1.4} label="100 yd" sub={m(100)} />
      <Dim x1={0} x2={END_ZONE} y={MID_Y - 1.4} label="10 yd" sub={m(10)} />
      <Dim x1={LENGTH - END_ZONE} x2={LENGTH} y={MID_Y - 1.4} label="10 yd" sub={m(10)} />
      <Dim x1={0} x2={WIDTH} y={fx(93)} label="53⅓ yd" sub={m(160 / 3)} vertical />
    </Field>
  );
}

export function EndZonesVisual({ replay }) {
  const t = useTimeline(2400, replay);
  const p = seg(t, 200, 1600);
  return (
    <Field highlight={['endzones', 'goalLines']}>
      <Ball x={lerp(fx(88), fx(100.4), p)} y={MID_Y - 8} />
      <Pop x={fx(105)} y={MID_Y - 8} show={t > 1650}>6</Pop>
    </Field>
  );
}

export function TeamsVisual({ replay }) {
  const { t: tr } = useI18n();
  const los = fx(50);
  return (
    <div className="teams">
      <div className="teams-legend">
        <span><i className="swatch team-off" />{tr('nfl.common.offense')} · 11</span>
        <span><i className="swatch team-def" />{tr('nfl.common.defense')} · 11</span>
      </div>
      <Field vertical view={LINEUP_VIEW(los)} viewY={LINEUP_Y} key={replay}>
        <FieldLine x={los} kind="los" />
        {OFFENSE.map((p, i) => (
          <Player key={`o${i}`} x={los + p.dx} y={p.y} label="" side="off" size={1.15} style={{ animationDelay: `${i * 70}ms` }} />
        ))}
        {DEFENSE.map((p, i) => (
          <Player key={`d${i}`} x={los + p.dx} y={p.y} label="" side="def" size={1.15} style={{ animationDelay: `${(i + 11) * 70}ms` }} />
        ))}
      </Field>
    </div>
  );
}

/* ---------- downs ---------- */

const DRIVE = [
  { ball: 25, los: 25, ltg: 35, down: 1 },
  { ball: 29, los: 29, ltg: 35, down: 2 },
  { ball: 36, los: 36, ltg: 46, down: 1, first: true },
  { ball: 39, los: 39, ltg: 46, down: 2 },
  { ball: 39, los: 39, ltg: 46, down: 3, miss: true },
  { ball: 44, los: 44, ltg: 46, down: 4 },
  { ball: 82, punt: true },
];

/** The concept: line of scrimmage, line to gain, 10 yards between them, 4 tries. */
export function DownsVisual() {
  const { t } = useI18n();
  const los = fx(25);
  const ltg = fx(35);
  return (
    <div className="downs">
      <Field view={[fx(14), fx(46)]} viewY={[MID_Y - 11, MID_Y + 11]} className="anim-in">
        <FieldLine x={los} kind="los" />
        <FieldLine x={ltg} kind="ltg" />
        <g className="dim">
          <line x1={los} x2={ltg} y1={MID_Y - 5} y2={MID_Y - 5} />
          <line x1={los} x2={los} y1={MID_Y - 5.8} y2={MID_Y - 4.2} />
          <line x1={ltg} x2={ltg} y1={MID_Y - 5.8} y2={MID_Y - 4.2} />
          <text x={(los + ltg) / 2} y={MID_Y - 5} dy="-0.8" style={{ fontSize: 1.9 }}>10 yd</text>
        </g>
        <g transform={`translate(${los - 0.7} ${MID_Y}) scale(1.8)`}><Ball x={0} y={0} /></g>
        {[1, 2, 3, 4].map((d) => (
          <g key={d} className="try-dot" style={{ animationDelay: `${d * 150}ms` }}>
            <circle cx={fx(16) + (d - 1) * 2.6} cy={MID_Y + 7.5} r={1.05} />
            <UprightText x={fx(16) + (d - 1) * 2.6} y={MID_Y + 7.5} className="player-label">{d}</UprightText>
          </g>
        ))}
      </Field>
      <div className="downs-legend">
        <span><i className="swatch los" />{t('nfl.common.los')}</span>
        <span><i className="swatch ltg" />{t('nfl.common.ltg')}</span>
      </div>
    </div>
  );
}

/**
 * A short drive that plays on its own like a video (no step controls): `from`–`to` are indexes into DRIVE,
 * captions come from nfl.slides.downs.steps. The board always reserves two lines so it never jumps.
 */
function DriveVisual({ replay, from, to }) {
  const { t, tm } = useI18n();
  const [i, setI] = useState(from);
  const steps = tm('nfl.slides.downs.steps');

  useEffect(() => { setI(from); }, [replay, from]);
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const id = setTimeout(() => setI((n) => (n >= to ? from : n + 1)), i === to ? 3200 : 2300);
    return () => clearTimeout(id);
  }, [i, from, to]);

  const s = DRIVE[i];
  const spot = (y) => (y === 50 ? '50' : y < 50 ? t('nfl.common.ownSide', { n: y }) : t('nfl.common.oppSide', { n: 100 - y }));
  const board = s.punt
    ? '↺'
    : `${t('nfl.common.downDist', { down: tm('nfl.common.downs')[s.down - 1], togo: s.ltg - s.los })} · ${spot(s.ball)}`;

  return (
    <div className="downs">
      <div className="downs-board is-fixed" aria-live="polite">
        <span className={`downs-chip ${s.first ? 'is-first' : ''}`}>{board}</span>
        <span className="downs-caption">{steps[i]}</span>
      </div>
      <Field view={[fx(14), fx(94)]}>
        {!s.punt && <FieldLine x={fx(s.los)} kind="los" />}
        {!s.punt && <FieldLine x={fx(s.ltg)} kind="ltg" />}
        <g className={`downs-ball ${s.punt ? 'is-punt' : ''}`} style={{ transform: `translate(${fx(s.ball)}px, ${MID_Y}px)` }}>
          <g transform="scale(1.8)"><Ball x={0} y={0} z={s.punt ? 0.6 : 0} /></g>
        </g>
      </Field>
      <div className="downs-legend">
        <span><i className="swatch los" />{t('nfl.common.los')}</span>
        <span><i className="swatch ltg" />{t('nfl.common.ltg')}</span>
      </div>
    </div>
  );
}

export const DownsUseVisual = (props) => <DriveVisual from={0} to={2} {...props} />;

// 4th down: the three options, stacked (no sub-slides). FG make rates: 2025 league totals from S18
// (research/nfl/01-basic-rules.md, "Using the 4 downs").
const FG_RATES = [['40–49', 84], ['50–59', 70], ['60+', 55]];

function FgRates() {
  const { t } = useI18n();
  return (
    <div className="fg-rates">
      <span className="fg-rates-title">{t('nfl.fourth.fgRates')}</span>
      {FG_RATES.map(([d, pct]) => (
        <div key={d} className="fg-rate">
          <span>{d}</span>
          <span className="fg-bar"><i style={{ width: `${pct}%` }} /></span>
          <b>{pct}%</b>
        </div>
      ))}
      <span className="fg-rates-note">{t('nfl.fourth.fgDistance')}</span>
    </div>
  );
}

export function FourthDownVisual({ replay }) {
  const { t } = useI18n();
  const opts = ['goForIt', 'punt', 'fieldGoal']; // same order as the next slides
  return (
    <div className="fourth" key={replay}>
      {opts.map((o, n) => (
        <section key={o} className={`fourth-opt opt-${o}`} style={{ animationDelay: `${n * 140}ms` }}>
          <header>
            <span className="fourth-num">{n + 1}</span>
            <strong>{t(`nfl.fourth.${o}.name`)}</strong>
          </header>
          <p>{t(`nfl.fourth.${o}.what`)}</p>
        </section>
      ))}
    </div>
  );
}

/* ---------- run & pass ---------- */

export function RunVisual({ replay }) {
  const t = useTimeline(3600, replay);
  const los = fx(30);
  const ol = byGroup(OFFENSE, 'ol').map((p) => at(los, p));
  const dl = byGroup(DEFENSE, 'dl').map((p) => at(los, p));
  const lbs = byGroup(DEFENSE, 'lb').map((p) => at(los, p));
  const end = [los + 6, MID_Y + 3.6];

  const rbPath = [[los - 7, MID_Y], [los - 2.4, MID_Y + 1.6], [los - 0.4, MID_Y + 3.15], end];
  const rb = t < 600 ? rbPath[0] : along(rbPath, seg(t, 600, 2800));
  const qb = [los - 3.1, MID_Y];
  const ball = t < 300 ? along([[los - 1, MID_Y], qb], seg(t, 0, 300)) : t < 1150 ? qb : rb;
  const push = 0; // linemen hold their ground, so tokens never overlap

  return (
    <Field view={[fx(17), fx(43)]} viewY={[16.5, 37.5]}>
      <FieldLine x={los} kind="los" />
      {dl.map((p, n) => <Player key={`dl${n}`} x={p.x - push} y={p.y} label={p.id} side="def" />)}
      {lbs.map((p, n) => {
        const chase = n === 0 ? 0 : seg(t, 1500, 2850);
        const stop = n === 1 ? [end[0] + 2.2, end[1] - 1.2] : [end[0] + 1.4, end[1] + 2];
        const [x, y] = along([[p.x, p.y], stop], chase);
        return <Player key={`lb${n}`} x={x} y={y} label={p.id} side="def" />;
      })}
      {ol.map((p, n) => <Player key={`ol${n}`} x={p.x + push} y={p.y} label={p.id} side="off" />)}
      <Player x={qb[0]} y={qb[1]} label="QB" side="off" />
      <Player x={rb[0]} y={rb[1]} label="RB" side="off" active />
      <Ball x={ball[0]} y={ball[1] - 1.1} />
    </Field>
  );
}

export function PassVisual({ replay }) {
  const t = useTimeline(4200, replay);
  const los = fx(28);
  const ol = byGroup(OFFENSE, 'ol').map((p) => at(los, p));
  const dl = byGroup(DEFENSE, 'dl').map((p) => at(los, p));

  const qb = along([[los - 3.1, MID_Y], [los - 7, MID_Y]], seg(t, 300, 1300));
  const route = [[los - 1, 8], [los + 10, 8], [los + 14, 14], [los + 19, 16]];
  const wrP = t < 2300 ? seg(t, 0, 2300) * 0.72 : 0.72 + seg(t, 2300, 3300) * 0.28;
  const wr = along(route, wrP);
  const cb = along([[los + 7, 8], [los + 10.5, 9], [los + 14, 15.4], [los + 18, 17.4]], Math.max(0, wrP - 0.06));
  const catchAt = along(route, 0.72);
  const flight = seg(t, 1500, 2300);

  let ball;
  let z = 0;
  if (t < 300) ball = along([[los - 1, MID_Y], [los - 3.1, MID_Y]], seg(t, 0, 300));
  else if (t < 1500) ball = qb;
  else if (t < 2300) {
    ball = along([[los - 7, MID_Y], catchAt], flight);
    z = Math.sin(Math.PI * flight);
  } else ball = wr;

  return (
    <Field view={[fx(15), fx(52)]} viewY={[3.5, 34]}>
      <FieldLine x={los} kind="los" />
      {t >= 1500 && <path className="trail" d={`M${los - 7} ${MID_Y} L${catchAt[0]} ${catchAt[1]}`} style={{ opacity: t < 2300 ? 0.9 : 0.35 }} />}
      {dl.map((p, n) => <Player key={`dl${n}`} x={p.x - seg(t, 300, 1500) * 1.0} y={p.y} label={p.id} side="def" />)}
      {ol.map((p, n) => <Player key={`ol${n}`} x={p.x - seg(t, 300, 1500) * 1.0} y={p.y} label={p.id} side="off" />)}
      <Player x={cb[0]} y={cb[1]} label="CB" side="def" />
      <Player x={qb[0]} y={qb[1]} label="QB" side="off" active={t < 2300} />
      <Player x={wr[0]} y={wr[1]} label="WR" side="off" active={t >= 2300} />
      <Ball x={ball[0]} y={ball[1] - (t < 2300 && t >= 1500 ? 0 : 1.1)} z={z} />
    </Field>
  );
}

/* ---------- scoring ---------- */

export function TouchdownVisual({ replay }) {
  const { t: tr } = useI18n();
  const t = useTimeline(3000, replay);
  // The runner stops short: only the front of the ball reaches the goal line — that's enough (R11-2-1).
  const runner = along([[fx(84), MID_Y + 7], [fx(93), MID_Y + 3], [fx(99.2), MID_Y + 2]], seg(t, 300, 2200));
  const chaser = along([[fx(90), MID_Y - 9], [fx(98.2), MID_Y - 0.4]], seg(t, 300, 2300));
  const ballX = runner[0] + 1.05;
  const scored = ballX + 0.62 >= fx(100);
  return (
    <Field view={[fx(80), LENGTH + BORDER]} viewY={[9, 44]} highlight={scored ? ['goalLines', 'endzones'] : ['goalLines']}>
      <UprightText x={fx(100)} y={11.6} className="tag tag-hl">{tr('nfl.common.goalLine')} ↓</UprightText>
      <Player x={chaser[0]} y={chaser[1]} label="CB" side="def" />
      <Player x={runner[0]} y={runner[1]} label="RB" side="off" active />
      <Ball x={ballX} y={runner[1]} />
      <Pop x={LENGTH - END_ZONE / 2 + 1} y={MID_Y - 7} show={t > 2250}>+6</Pop>
    </Field>
  );
}

export function kickArc(from, to, p) {
  const [x, y] = along([from, to], p);
  return { x, y, z: Math.sin(Math.PI * p) };
}

export function TryVisual({ replay }) {
  const { t: tr } = useI18n();
  const t = useTimeline(5200, replay);
  const kickP = seg(t, 500, 1900);
  const kick = kickArc([fx(85), MID_Y], [LENGTH + 2, MID_Y], kickP);
  const runP = seg(t, 2900, 4300);
  const runner = along([[fx(98) - 0.5, MID_Y + 4], [fx(102.5), MID_Y + 4]], runP);
  const phase = t < 2600 ? 1 : 2;
  return (
    <Field view={[fx(76), LENGTH + BORDER]} viewY={[9, 44]} highlight={phase === 1 ? (kickP >= 1 ? ['goalposts'] : []) : runP >= 1 ? ['endzones'] : []}>
      <line className={`marker ${phase === 1 ? 'is-on' : ''}`} x1={fx(85)} x2={fx(85)} y1={9} y2={44} />
      <line className={`marker ${phase === 2 ? 'is-on' : ''}`} x1={fx(98)} x2={fx(98)} y1={9} y2={44} />
      <UprightText x={fx(85) + 4} y={MID_Y + 8.5} className={`marker-label ${phase === 1 ? 'is-on' : ''}`}>{tr('nfl.slides.try.kick')}</UprightText>
      <UprightText x={fx(98) - 3} y={MID_Y - 5} className={`marker-label ${phase === 2 ? 'is-on' : ''}`}>{tr('nfl.slides.try.two')}</UprightText>
      {phase === 1 ? (
        <Ball x={kick.x} y={kick.y} z={kick.z} />
      ) : (
        <>
          <Player x={runner[0]} y={runner[1]} label="RB" side="off" active />
          <Ball x={runner[0] + 0.9} y={runner[1] - 0.9} />
        </>
      )}
      <Pop x={LENGTH - END_ZONE / 2} y={MID_Y - 11} show={(phase === 1 && t > 1950) || t > 4350}>{phase === 1 ? '+1' : '+2'}</Pop>
    </Field>
  );
}

export function FieldGoalVisual({ replay }) {
  return (
    <div className="stack-visual">
      <FieldGoalKick replay={replay} />
      <div className="stack-visual-pad"><FgRates /></div>
    </div>
  );
}

function FieldGoalKick({ replay }) {
  const t = useTimeline(3000, replay);
  const p = seg(t, 400, 2200);
  const k = kickArc([fx(72), MID_Y + 1], [LENGTH + 3, MID_Y - 0.4], p);
  return (
    <Field view={[fx(60), LENGTH + BORDER]} viewY={[6, 47]} highlight={p >= 0.92 ? ['goalposts'] : []}>
      <path className="trail" d={`M${fx(72)} ${MID_Y + 1} L${k.x} ${k.y}`} />
      <Ball x={k.x} y={k.y} z={k.z} />
      <Pop x={LENGTH - END_ZONE / 2} y={MID_Y - 8} show={t > 2250}>+3</Pop>
    </Field>
  );
}

export function PuntVisual({ replay }) {
  const t = useTimeline(4200, replay);
  const los = fx(30);
  const punter = [los - 15, MID_Y];
  const land = [fx(78), MID_Y + 2];
  const snap = seg(t, 300, 900);
  const fly = seg(t, 1200, 3000);
  const ball = t < 1200 ? { ...xyOf(along([[los - 0.4, MID_Y], punter], snap)), z: 0 } : kickArc(punter, land, fly);
  return (
    <Field view={[fx(10), fx(84)]} viewY={[MID_Y - 11, MID_Y + 11]}>
      <FieldLine x={los} kind="los" />
      <path className="trail" d={`M${punter[0]} ${punter[1]} L${land[0]} ${land[1]}`} style={{ opacity: t > 1200 ? 0.6 : 0 }} />
      <Player x={los - 1} y={MID_Y} label="LS" side="off" size={1.9} />
      <Player x={punter[0] - 1.2} y={punter[1]} label="P" side="off" size={1.9} active />
      <Player x={land[0] + 1.4} y={land[1]} label="KR" side="def" size={1.9} />
      <Ball x={ball.x} y={ball.y} z={ball.z} />
      <UprightText x={(los + land[0]) / 2} y={MID_Y - 6.5} className="tag tag-md tag-hl" style={{ fontSize: 2.6 }}>{`≈ ${Math.round(land[0] - los)} yd`}</UprightText>
    </Field>
  );
}

const xyOf = ([x, y]) => ({ x, y });

export function SafetyVisual({ replay }) {
  const t = useTimeline(3000, replay);
  const qb = along([[fx(1), MID_Y], [fx(-4), MID_Y + 1]], seg(t, 300, 1700));
  const d1 = along([[fx(5), MID_Y - 6], [fx(-2.2), MID_Y - 0.8]], seg(t, 300, 1850));
  const d2 = along([[fx(5), MID_Y + 6], [fx(-2.4), MID_Y + 2.8]], seg(t, 450, 1900));
  const down = t > 1900;
  return (
    <Field view={[-BORDER, fx(24)]} viewY={[10, 43]} highlight={down ? ['endzones'] : []}>
      <FieldLine x={fx(3)} kind="los" />
      <Player x={d1[0]} y={d1[1]} label="DE" side="def" />
      <Player x={d2[0]} y={d2[1]} label="LB" side="def" />
      <Player x={qb[0]} y={qb[1]} label="QB" side="off" active />
      <Ball x={qb[0] + 0.9} y={qb[1] - 0.9} />
      <Pop x={END_ZONE / 2} y={MID_Y - 9} show={down} kind="def">+2</Pop>
    </Field>
  );
}

export function ScoringVisual({ replay }) {
  const { tm } = useI18n();
  let n = 0;
  const delay = () => ({ animationDelay: `${n++ * 110}ms` });
  return (
    <div className="score-grid" key={replay}>
      {tm('nfl.slides.scoring.rows').map((row) => (
        <div key={row.label} className="score-item">
          <div className="score-row" style={delay()}>
            <span className="score-pts">{row.pts}</span>
            <span className="score-label">{row.label}</span>
          </div>
          {row.after && (
            <div className="score-after" style={delay()}>
              <p className="score-after-title">↳ {row.after.title}</p>
              {row.after.rows.map(([label, pts]) => (
                <div className="score-row small" key={label}>
                  <span className="score-pts">{pts}</span>
                  <span className="score-label">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- positions ---------- */

function Lineup({ side }) {
  const { t, tm } = useI18n();
  const mine = side === 'off' ? OFFENSE : DEFENSE;
  const [sel, setSel] = useState(side === 'off' ? 8 : 5); // QB / MLB
  const los = fx(50);
  const pos = mine[sel];
  const info = tm(`nfl.positions.${pos.id}`);
  const groups = [...new Set(mine.map((p) => p.group))];

  return (
    <div className="lineup">
      <Field vertical view={LINEUP_VIEW(los)} viewY={LINEUP_Y}>
        <FieldLine x={los} kind="los" />
        {side === 'def' && OFFENSE.map((p, n) => <Player key={`o${n}`} x={los + p.dx} y={p.y} label={p.id} side="off" size={1.08} dim />)}
        {mine.map((p, n) => (
          <Player
            key={n}
            x={los + p.dx}
            y={p.y}
            label={p.id}
            side={side}
            group={p.group}
            size={1.08}
            active={n === sel}
            onSelect={() => setSel(n)}
            style={{ animationDelay: `${n * 60}ms` }}
          />
        ))}
      </Field>
      <div className="lineup-info" aria-live="polite">
        <span className={`lineup-abbr ${side}`}>{pos.id}</span>
        <div>
          <strong>{info.name}</strong>
          <p>{info.role}</p>
        </div>
      </div>
      <div className="lineup-groups">
        {groups.map((g) => <span key={g}><i className={`swatch g-${g}`} />{t(`nfl.groups.${g}`)}</span>)}
      </div>
    </div>
  );
}

export const OffenseVisual = () => <Lineup side="off" />;
export const DefenseVisual = () => <Lineup side="def" />;

// Special-teams units (research/nfl/02-positions.md, sources S2/S6/S7). dx = yards from the line of
// scrimmage (negative = behind it), dy = yards from the middle of the field.
// Sourced depths: holder 7–8 yd [S7], punter ~15 yd [S7], personal protector 1–3 yd [S7], gunners near the
// sidelines [S7]. Everything else (line spacing, the kicker's spot) is ILLUSTRATIVE.
// Blockers have no id: they're drawn faded and unlabeled, so only the specialists stand out.
const LINE7 = [-3, -2, -1, 1, 2, 3].map((k) => ({ id: '', dx: -1, dy: k * 1.9 }));
const ST_UNITS = {
  fg: {
    los: fx(78),
    view: [fx(64), LENGTH + BORDER],
    viewY: [13, 40.5],
    select: 'H',
    size: 1.15,
    players: [
      { id: 'LS', dx: -1, dy: 0 },
      ...LINE7,
      { id: '', dx: -2.1, dy: -7.4 },
      { id: '', dx: -2.1, dy: 7.4 },
      { id: 'H', dx: -7.5, dy: 0 },
      { id: 'K', dx: -10, dy: -2.4 },
    ],
  },
  punt: {
    los: fx(30),
    view: [fx(12), fx(84)],
    viewY: [2.5, WIDTH - 2.5],
    select: 'P',
    size: 1.5, // wide view: bigger tokens
    players: [
      { id: 'GUN', dx: -1, dy: -20 },
      { id: 'LS', dx: -1, dy: 0 },
      ...LINE7.map((p) => ({ ...p, dy: p.dy * 1.45 })),
      { id: 'GUN', dx: -1, dy: 20 },
      { id: 'PP', dx: -3.6, dy: 0 },
      { id: 'P', dx: -15, dy: 0 },
    ],
    returner: { id: 'KR', dx: 43, dy: 0 },
  },
};

function useStPlay(unit, replay) {
  const u = ST_UNITS[unit];
  const t = useTimeline(unit === 'fg' ? 3200 : 4200, `${unit}-${replay}`);
  const los = u.los;
  const at = (p) => [los + p.dx, MID_Y + p.dy];
  if (unit === 'fg') {
    // snap LS → H · kicker steps up · kick through the posts
    const spot = [los - 7.5 + 0.6, MID_Y];
    const kicker = along([at(u.players.at(-1)), [spot[0] - 2.6, MID_Y - 1.5]], seg(t, 500, 1100));
    const kick = seg(t, 1100, 2700);
    let ball;
    if (t < 500) ball = { ...xy(along([[los - 0.4, MID_Y], spot], seg(t, 0, 500))), z: 0 };
    else if (t < 1100) ball = { ...xy(spot), z: 0 };
    else ball = kickArc(spot, [LENGTH + 3, MID_Y - 0.3], kick);
    return { pos: (p) => (p.id === 'K' ? kicker : at(p)), ball, hl: kick >= 0.95 ? ['goalposts'] : [] };
  }
  // punt: long snap LS → P · punt downfield · gunners sprint to the returner
  const pSpot = [los - 15 + 0.9, MID_Y];
  const land = [los + 41, MID_Y];
  const fly = seg(t, 1000, 2800);
  let ball;
  if (t < 700) ball = { ...xy(along([[los - 0.4, MID_Y], pSpot], seg(t, 0, 700))), z: 0 };
  else if (t < 1000) ball = { ...xy(pSpot), z: 0 };
  else ball = kickArc(pSpot, land, fly);
  const run = seg(t, 1000, 3300);
  const pos = (p) => {
    if (p.id !== 'GUN') return at(p);
    return along([at(p), [los + 38, MID_Y + Math.sign(p.dy) * 3.2]], run);
  };
  return { pos, ball, hl: [] };
}
const xy = ([x, y]) => ({ x, y });

function SpecialTeamsUnit({ unit, replay }) {
  const { tm } = useI18n();
  const u = ST_UNITS[unit];
  const [sel, setSel] = useState(u.select);
  const play = useStPlay(unit, replay);
  const info = tm(`nfl.positions.${sel}`);

  return (
    <div className="lineup">
      <Field view={u.view} viewY={u.viewY} highlight={play.hl}>
        <FieldLine x={u.los} kind="los" />
        {u.returner && (
          <Player
            x={u.los + u.returner.dx}
            y={MID_Y + u.returner.dy}
            label={u.returner.id}
            side="def"
            size={u.size}
            active={sel === u.returner.id}
            onSelect={() => setSel(u.returner.id)}
          />
        )}
        {u.players.map((p, n) => {
          const [x, y] = play.pos(p);
          return (
            <Player
              key={n}
              x={x}
              y={y}
              label={p.id}
              side="off"
              size={p.id ? u.size : u.size * 0.75}
              dim={!p.id}
              active={p.id === sel}
              onSelect={p.id ? () => setSel(p.id) : undefined}
            />
          );
        })}
        <Ball x={play.ball.x} y={play.ball.y} z={play.ball.z} />
      </Field>
      <div className="lineup-info" aria-live="polite">
        <span className={`lineup-abbr ${sel === 'KR' ? 'def' : 'off'}`}>{sel}</span>
        <div><strong>{info.name}</strong><p>{info.role}</p></div>
      </div>
    </div>
  );
}

export const FieldGoalUnitVisual = (props) => <SpecialTeamsUnit unit="fg" {...props} />;
export const PuntUnitVisual = (props) => <SpecialTeamsUnit unit="punt" {...props} />;

export function EndVisual({ replay }) {
  const los = fx(50);
  return (
    <Field key={replay}>
      {OFFENSE.map((p, i) => <Player key={`o${i}`} x={los + p.dx} y={p.y} label="" side="off" style={{ animationDelay: `${i * 40}ms` }} />)}
      {DEFENSE.map((p, i) => <Player key={`d${i}`} x={los + p.dx} y={p.y} label="" side="def" style={{ animationDelay: `${(i + 11) * 40}ms` }} />)}
    </Field>
  );
}

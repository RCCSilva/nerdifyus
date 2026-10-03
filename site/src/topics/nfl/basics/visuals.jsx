import { useState } from 'react';
import Field from '../../../components/field/Field';
import { Player, Ball, FieldLine, UprightText } from '../../../components/field/pieces';
import { fx, MID_Y, LENGTH, BORDER, END_ZONE, WIDTH } from '../../../components/field/geometry';
import { seg, lerp, along } from '../../../components/field/motion';
import { StillScene, FluidScene, StopMotionScene, Legend, Hint, StateLine } from '../../../components/scene/Scene';
import { useI18n } from '../../../i18n/I18n';
import { OFFENSE, DEFENSE } from '../formations';

// Every visual is illustrative: it shows a rule from research/nfl/*.md, not a real play.

// Frame for upright (vertical) lineup views: 9 yd behind the line to 16 yd past it.
const LINEUP_VIEW = (los) => [los - 9, los + 16];
const LINEUP_Y = [7, WIDTH - 7];

// Header / footer legends reused by many scenes.
function useLegends() {
  const { t } = useI18n();
  return {
    teams: (count = false) => (
      <Legend strong items={[
        { swatch: 'team-off', label: count ? `${t('nfl.common.offense')} · 11` : t('nfl.common.offense') },
        { swatch: 'team-def', label: count ? `${t('nfl.common.defense')} · 11` : t('nfl.common.defense') },
      ]} />
    ),
    lines: (ltg = true) => (
      <Legend items={[
        { swatch: 'los', label: t('nfl.common.los') },
        ...(ltg ? [{ swatch: 'ltg', label: t('nfl.common.ltg') }] : []),
      ]} />
    ),
  };
}

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
  const y = MID_Y - 9; // above the centre, so the end-zone label stays readable
  return (
    <FluidScene
      duration={3400}
      replay={replay}
      header={<Legend strong items={[{ swatch: 'team-off', label: `${tr('nfl.common.offense')} →` }]} />}
    >
      {(t) => (
        <Field highlight={t > 2700 ? ['endzones'] : []} endZoneText={['', tr('nfl.slides.intro.target')]} key={replay}>
          <g className="arrow">
            <line className="arrow-shaft" x1={fx(22)} x2={fx(96)} y1={y} y2={y} pathLength="1" />
            <polygon className="arrow-head" points={`${fx(100.5)},${y} ${fx(95.5)},${y - 2.6} ${fx(95.5)},${y + 2.6}`} />
          </g>
          <g transform={`translate(${lerp(fx(22), fx(100.8), seg(t, 900, 2800))} ${y}) scale(3)`}><Ball x={0} y={0} /></g>
        </Field>
      )}
    </FluidScene>
  );
}

export function FieldVisual() {
  const m = useMeters();
  return (
    <StillScene>
    <Field highlight={['fieldOfPlay']} className="anim-in">
      <Dim x1={fx(0)} x2={fx(100)} y={MID_Y - 1.4} label="100 yd" sub={m(100)} />
      <Dim x1={0} x2={END_ZONE} y={MID_Y - 1.4} label="10 yd" sub={m(10)} />
      <Dim x1={LENGTH - END_ZONE} x2={LENGTH} y={MID_Y - 1.4} label="10 yd" sub={m(10)} />
      <Dim x1={0} x2={WIDTH} y={fx(93)} label="53⅓ yd" sub={m(160 / 3)} vertical />
    </Field>
    </StillScene>
  );
}

export function EndZonesVisual({ replay }) {
  return (
    <FluidScene duration={2400} replay={replay}>
      {(t) => (
        <Field highlight={['endzones', 'goalLines']}>
          <Ball x={lerp(fx(88), fx(100.4), seg(t, 200, 1600))} y={MID_Y - 8} />
          <Pop x={fx(105)} y={MID_Y - 8} show={t > 1650}>6</Pop>
        </Field>
      )}
    </FluidScene>
  );
}

export function TeamsVisual({ replay }) {
  const legends = useLegends();
  const los = fx(50);
  return (
    <StillScene header={legends.teams(true)}>
      <Field vertical view={LINEUP_VIEW(los)} viewY={LINEUP_Y} key={replay}>
        <FieldLine x={los} kind="los" />
        {OFFENSE.map((p, i) => (
          <Player key={`o${i}`} x={los + p.dx} y={p.y} label="" side="off" size={1.15} style={{ animationDelay: `${i * 70}ms` }} />
        ))}
        {DEFENSE.map((p, i) => (
          <Player key={`d${i}`} x={los + p.dx} y={p.y} label="" side="def" size={1.15} style={{ animationDelay: `${(i + 11) * 70}ms` }} />
        ))}
      </Field>
    </StillScene>
  );
}

/* ---------- how the game starts ---------- */

export function CoinTossVisual({ replay }) {
  const { t } = useI18n();
  const opts = ['opt1', 'opt2'];
  return (
    <StillScene header={<span className="scene-hint">🪙 {t('nfl.kickoff.tossCall')}</span>} footer={t('nfl.kickoff.loser')}>
      <div className="toss" key={replay}>
        <div className="toss-coin" aria-hidden="true" />
        <div className="toss-opts">
          <strong>{t('nfl.kickoff.winner')}</strong>
          {opts.map((o, n) => (
            <div key={o} className="toss-opt" style={{ animationDelay: `${300 + n * 150}ms` }}>
              <span>{n + 1}</span>{t(`nfl.kickoff.${o}`)}
            </div>
          ))}
        </div>
      </div>
    </StillScene>
  );
}

// Kickoff, 2026 alignment (R6-1-2/3): kicker on his 35, teammates on the receiving team's 40, at least 9
// receivers in the setup zone (their 35–30), returners behind their 20. The receiving team defends the
// left end zone, so its "own 35" is fx(35) and the kicking team's 35 is fx(65). Spacing is ILLUSTRATIVE.
const KO_KICKERS = [-4, -3, -2, -1, 1, 2, 3, 4, 5, -5].map((k) => [fx(40) + 0.8, MID_Y + k * 4.4]);
const KO_SETUP = [
  ...[-2, -1, 0, 1, 2].map((k) => [fx(35) - 0.8, MID_Y + k * 7]),
  ...[-1.5, -0.5, 0.5, 1.5].map((k) => [fx(31.5), MID_Y + k * 7]),
];
const KO_DEEP = [fx(12), MID_Y + 8];

function KickoffPhase({ t, touchback }) {
  const { t: tr } = useI18n();
  const KICK = [fx(65), MID_Y];
  const catchAt = touchback ? [fx(-5), MID_Y] : [fx(4), MID_Y];
  const fly = seg(t, 300, 1800);
  const run = seg(t, 1900, 3600);
  const ret = touchback ? catchAt : along([catchAt, [fx(14), MID_Y - 4], [fx(27), MID_Y - 3]], run);
  const rush = seg(t, 300, 3600);
  const tackleAt = [fx(27) + 1.6, MID_Y - 3];
  const ball = t < 1800 ? kickArc(KICK, catchAt, fly) : { x: ret[0] + 0.9, y: ret[1] - 0.9, z: 0 };
  const knelt = touchback && t > 2100;
  const placed = touchback && t > 2900;
  return (
    <>
      <rect className="lz-band" x={fx(0)} y={0} width={20} height={WIDTH} />
      <UprightText x={fx(10)} y={3} className="lz-label">{tr('nfl.kickoff.landingZone')}</UprightText>
      {!placed && KO_KICKERS.map(([x, y], n) => {
        const target = touchback ? [x - 8, y] : along([[x, y], [tackleAt[0] + (n % 3) * 1.6, tackleAt[1] + ((n % 5) - 2) * 2]], 1);
        const [px, py] = along([[x, y], target], rush);
        return <Player key={`k${n}`} x={px} y={py} label="" side="def" size={1.25} />;
      })}
      {!placed && (
        <>
          <Player x={KICK[0] + 1.2} y={KICK[1]} label="K" side="def" size={1.25} />
          {KO_SETUP.map(([x, y], n) => <Player key={`s${n}`} x={x - (touchback ? 0 : run * 4)} y={y} label="" side="off" size={1.25} />)}
          <Player x={KO_DEEP[0]} y={KO_DEEP[1]} label="" side="off" size={1.25} />
          <Player x={ret[0]} y={ret[1]} label="KR" side="off" size={1.25} active />
        </>
      )}
      {!placed && <Ball x={ball.x} y={ball.y} z={ball.z} />}
      {knelt && !placed && <UprightText x={catchAt[0]} y={catchAt[1] - 3.2} className="tag tag-hl">{tr('nfl.kickoff.knee')}</UprightText>}
      {placed && (
        <>
          <FieldLine x={fx(35)} kind="los" />
          <g transform={`translate(${fx(35) - 0.8} ${MID_Y}) scale(1.8)`}><Ball x={0} y={0} /></g>
          <UprightText x={fx(35)} y={MID_Y - 5} className="tag tag-hl" style={{ fontSize: 3 }}>35</UprightText>
          <path className="trail" d={`M${catchAt[0]} ${catchAt[1]} L${fx(35) - 1.5} ${MID_Y}`} />
        </>
      )}
    </>
  );
}

export function KickoffVisual({ replay }) {
  const { t } = useI18n();
  const SPLIT = 4400;
  const phase = (time) => (time < SPLIT ? 'Return' : 'Touchback');
  return (
    <FluidScene
      duration={8000}
      replay={replay}
      header={(time) => (
        <StateLine
          chip={t(`nfl.kickoff.phase${phase(time)}`)}
          caption={t(`nfl.kickoff.phase${phase(time)}How`)}
          highlight={phase(time) === 'Touchback'}
        />
      )}
      footer={(
        <Legend items={[
          { swatch: 'team-def', label: t('nfl.kickoff.kicking') },
          { swatch: 'team-off', label: t('nfl.kickoff.receiving') },
          { swatch: 'lz', label: t('nfl.kickoff.landingZone') },
        ]} />
      )}
    >
      {(time) => (
        <Field view={[-BORDER, fx(70)]} viewY={[1, WIDTH - 1]}>
          {time < SPLIT
            ? <KickoffPhase t={time} />
            : <KickoffPhase t={time - SPLIT} touchback />}
        </Field>
      )}
    </FluidScene>
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
  const legends = useLegends();
  const los = fx(25);
  const ltg = fx(35);
  return (
    <StillScene footer={legends.lines()}>
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
    </StillScene>
  );
}

/** A short drive, frame by frame: `from`–`to` index DRIVE; captions come from nfl.slides.downs.steps. */
function DriveVisual({ replay, from, to }) {
  const { t, tm } = useI18n();
  const legends = useLegends();
  const steps = tm('nfl.slides.downs.steps');
  const spot = (y) => (y === 50 ? '50' : y < 50 ? t('nfl.common.ownSide', { n: y }) : t('nfl.common.oppSide', { n: 100 - y }));
  const board = (s) => (s.punt
    ? '↺'
    : `${t('nfl.common.downDist', { down: tm('nfl.common.downs')[s.down - 1], togo: s.ltg - s.los })} · ${spot(s.ball)}`);

  return (
    <StopMotionScene
      frames={to - from + 1}
      replay={replay}
      header={(i) => <StateLine chip={board(DRIVE[from + i])} caption={steps[from + i]} highlight={DRIVE[from + i].first} />}
      footer={legends.lines()}
    >
      {(i) => {
        const s = DRIVE[from + i];
        return (
          <Field view={[fx(18), fx(50)]} viewY={[MID_Y - 11, MID_Y + 11]}>
            {!s.punt && <FieldLine x={fx(s.los)} kind="los" />}
            {!s.punt && <FieldLine x={fx(s.ltg)} kind="ltg" />}
            <g className={`downs-ball ${s.punt ? 'is-punt' : ''}`} style={{ transform: `translate(${fx(s.ball)}px, ${MID_Y}px)` }}>
              <g transform="scale(1.8)"><Ball x={0} y={0} z={s.punt ? 0.6 : 0} /></g>
            </g>
          </Field>
        );
      }}
    </StopMotionScene>
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
  const legends = useLegends();
  return (
    <FluidScene duration={3600} replay={replay} header={legends.teams()} footer={legends.lines(false)}>
      {(t) => <RunPlay t={t} />}
    </FluidScene>
  );
}

function RunPlay({ t }) {
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
  const legends = useLegends();
  return (
    <FluidScene duration={4200} replay={replay} header={legends.teams()} footer={legends.lines(false)}>
      {(t) => <PassPlay t={t} />}
    </FluidScene>
  );
}

function PassPlay({ t }) {
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
  const legends = useLegends();
  return (
    <FluidScene duration={3000} replay={replay} header={legends.teams()}>
      {(t) => <TouchdownPlay t={t} />}
    </FluidScene>
  );
}

function TouchdownPlay({ t }) {
  const { t: tr } = useI18n();
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

/** Close-up of the goal line: the ball touches it while the runner is still outside (R11-2-1(a), R3-38). */
export function TdRunVisual({ replay }) {
  const legends = useLegends();
  return (
    <FluidScene duration={2600} replay={replay} header={legends.teams()}>
      {(t) => <TdRunPlay t={t} />}
    </FluidScene>
  );
}

function TdRunPlay({ t }) {
  const { t: tr } = useI18n();
  const goal = fx(100);
  const runP = seg(t, 200, 1700);
  const runnerX = lerp(goal - 11, goal - 1.67, runP); // stops with the ball's tip on the line
  const ballX = runnerX + 1.05;
  const scored = runP >= 1;
  return (
    <Field view={[goal - 16, goal + 8]} viewY={[MID_Y - 7, MID_Y + 6]} highlight={scored ? ['goalLines', 'endzones'] : ['goalLines']}>
      <UprightText x={goal} y={MID_Y - 5.6} className="tag tag-hl">{tr('nfl.common.goalLine')} ↓</UprightText>
      <Player x={runnerX} y={MID_Y + 0.6} label="RB" side="off" active />
      <Ball x={ballX} y={MID_Y + 0.6} />
      <UprightText x={goal - 6} y={MID_Y + 4.3} className="tag tag-hl" style={{ opacity: scored ? 1 : 0 }}>{tr('nfl.common.ballOnLine')}</UprightText>
      <Pop x={goal + 4.5} y={MID_Y + 0.6} show={t > 1800} kind="sm">+6</Pop>
    </Field>
  );
}

/** A pass caught inside the end zone (R11-2-1(d), R8-1-3). */
export function TdPassVisual({ replay }) {
  const legends = useLegends();
  return (
    <FluidScene duration={3800} replay={replay} header={legends.teams()}>
      {(t) => <TdPassPlay t={t} />}
    </FluidScene>
  );
}

function TdPassPlay({ t }) {
  const { t: tr } = useI18n();
  const qb = along([[fx(88), MID_Y], [fx(84), MID_Y]], seg(t, 200, 1000));
  const route = [[fx(90), MID_Y - 9], [fx(97), MID_Y - 9], [fx(104), MID_Y - 4]];
  const wrP = seg(t, 200, 2600);
  const wr = along(route, wrP);
  const catchAt = along(route, 1);
  const cb = along([[fx(94), MID_Y - 11], [fx(99), MID_Y - 10], [fx(103), MID_Y - 6.5]], Math.max(0, wrP - 0.08));
  const flight = seg(t, 1400, 2600);
  let ball = qb;
  let z = 0;
  if (t >= 1400 && t < 2600) { ball = along([[fx(84), MID_Y], catchAt], flight); z = Math.sin(Math.PI * flight); }
  else if (t >= 2600) ball = wr;
  const caught = t >= 2600;
  return (
    <Field view={[fx(78), LENGTH + BORDER]} viewY={[MID_Y - 13, MID_Y + 9]} highlight={caught ? ['goalLines', 'endzones'] : ['goalLines']}>
      <UprightText x={fx(100)} y={MID_Y - 11.3} className="tag tag-hl">{tr('nfl.common.goalLine')} ↓</UprightText>
      {t >= 1400 && <path className="trail" d={`M${fx(84)} ${MID_Y} L${catchAt[0]} ${catchAt[1]}`} style={{ opacity: caught ? 0.35 : 0.9 }} />}
      <Player x={cb[0]} y={cb[1]} label="CB" side="def" />
      <Player x={qb[0]} y={qb[1]} label="QB" side="off" active={t < 2600} />
      <Player x={wr[0]} y={wr[1]} label="WR" side="off" active={caught} />
      <Ball x={ball[0]} y={ball[1] - (t >= 1400 && t < 2600 ? 0 : 1.1)} z={z} />
      <UprightText x={fx(95)} y={MID_Y + 6.5} className="tag tag-hl" style={{ opacity: caught ? 1 : 0 }}>{tr('nfl.common.caughtInEz')}</UprightText>
      <Pop x={LENGTH - END_ZONE / 2 + 1} y={MID_Y + 3} show={t > 2800} kind="sm">+6</Pop>
    </Field>
  );
}

export function kickArc(from, to, p) {
  const [x, y] = along([from, to], p);
  return { x, y, z: Math.sin(Math.PI * p) };
}

export function TryVisual({ replay }) {
  return (
    <FluidScene duration={5200} replay={replay}>
      {(t) => <TryPlay t={t} />}
    </FluidScene>
  );
}

function TryPlay({ t }) {
  const { t: tr } = useI18n();
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

export function FieldGoalVisual(props) {
  return <KickPlay unit="fg" {...props} footerExtra={<FgRates />} />;
}

export function SafetyVisual({ replay }) {
  const legends = useLegends();
  return (
    <FluidScene duration={3000} replay={replay} header={legends.teams()} footer={legends.lines(false)}>
      {(t) => <SafetyPlay t={t} />}
    </FluidScene>
  );
}

function SafetyPlay({ t }) {
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

function PlayerCard({ id, side }) {
  const { tm } = useI18n();
  const info = tm(`nfl.positions.${id}`);
  return (
    <div className="lineup-info" aria-live="polite">
      <span className={`lineup-abbr ${side}`}>{id}</span>
      <div><strong>{info.name}</strong><p>{info.role}</p></div>
    </div>
  );
}

function Lineup({ side }) {
  const { t } = useI18n();
  const mine = side === 'off' ? OFFENSE : DEFENSE;
  const [sel, setSel] = useState(side === 'off' ? 8 : 5); // QB / MLB
  const los = fx(50);
  const groups = [...new Set(mine.map((p) => p.group))];

  return (
    <StillScene
      header={<Hint>{t('nfl.common.tapPlayers')}</Hint>}
      footer={(
        <>
          <PlayerCard id={mine[sel].id} side={side} />
          <Legend items={groups.map((g) => ({ swatch: `g-${g}`, label: t(`nfl.groups.${g}`) }))} />
        </>
      )}
    >
      <Field vertical interactive view={LINEUP_VIEW(los)} viewY={LINEUP_Y}>
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
    </StillScene>
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

// The other team on each kicking play, for the full-team views in the basics deck. ILLUSTRATIVE spacing;
// jammers (who slow the gunners) come from S7. dx/dy as in ST_UNITS (dx positive = past the line).
const ST_DEFENSE = {
  fg: [
    ...[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => ({ dx: 1.3, dy: k * 1.9 })),
    { dx: 5, dy: -6 },
    { dx: 5, dy: 6 },
  ],
  punt: [
    ...[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((k) => ({ dx: 2.1, dy: k * 2.6 })),
    { dx: 1.3, dy: -18.6, jammer: -1 },
    { dx: 1.3, dy: 18.6, jammer: 1 },
    { dx: 10, dy: -5 },
    { dx: 10, dy: 5 },
  ],
};

/** Positions at time t (ms) for a kicking unit. */
function stPlay(unit, t) {
  const u = ST_UNITS[unit];
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

/** The field for a kicking unit at time t. plain: both full teams, no labels on blockers, no taps. */
function KickField({ unit, t, plain, sel, onSelect }) {
  const u = ST_UNITS[unit];
  const play = stPlay(unit, t);
  const gunner = (sign) => u.players.find((p) => p.id === 'GUN' && Math.sign(p.dy) === sign);
  return (
    <Field view={u.view} viewY={u.viewY} highlight={play.hl} interactive={!plain}>
      <FieldLine x={u.los} kind="los" />
      {plain && ST_DEFENSE[unit].map((d, n) => {
        // Jammers shadow the gunners downfield.
        const [x, y] = d.jammer
          ? (([gx, gy]) => [gx + 1.6, gy])(play.pos(gunner(d.jammer)))
          : [u.los + d.dx, MID_Y + d.dy];
        return <Player key={`d${n}`} x={x} y={y} label="" side="def" size={u.size} />;
      })}
      {u.returner && (
        <Player
          x={u.los + u.returner.dx}
          y={MID_Y + u.returner.dy}
          label={u.returner.id}
          side="def"
          size={u.size}
          active={!plain && sel === u.returner.id}
          onSelect={plain ? undefined : () => onSelect(u.returner.id)}
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
            size={plain || p.id ? u.size : u.size * 0.75}
            dim={!plain && !p.id}
            active={!plain && p.id === sel}
            onSelect={!plain && p.id ? () => onSelect(p.id) : undefined}
          />
        );
      })}
      <Ball x={play.ball.x} y={play.ball.y} z={play.ball.z} />
    </Field>
  );
}

/** Kicking plays in the basics deck: both full teams (offense blue, defense red), no highlighting. */
function KickPlay({ unit, replay, footerExtra }) {
  const legends = useLegends();
  return (
    <FluidScene
      duration={unit === 'fg' ? 3200 : 4200}
      replay={`${unit}-${replay}`}
      header={legends.teams(true)}
      footer={footerExtra}
    >
      {(t) => <KickField unit={unit} t={t} plain />}
    </FluidScene>
  );
}

/** Special-teams units in the positions lesson: only the specialists are labelled and tappable. */
function SpecialTeamsUnit({ unit, replay }) {
  const { t } = useI18n();
  const u = ST_UNITS[unit];
  const [sel, setSel] = useState(u.select);
  return (
    <FluidScene
      duration={unit === 'fg' ? 3200 : 4200}
      replay={`${unit}-${replay}`}
      header={<Hint>{t('nfl.common.tapPlayers')}</Hint>}
      footer={<PlayerCard id={sel} side={sel === 'KR' ? 'def' : 'off'} />}
    >
      {(time) => <KickField unit={unit} t={time} sel={sel} onSelect={setSel} />}
    </FluidScene>
  );
}

export const FieldGoalUnitVisual = (props) => <SpecialTeamsUnit unit="fg" {...props} />;
export const PuntUnitVisual = (props) => <SpecialTeamsUnit unit="punt" {...props} />;
export const PuntVisual = (props) => <KickPlay unit="punt" {...props} />;

export function EndVisual({ replay }) {
  const legends = useLegends();
  const los = fx(50);
  return (
    <StillScene header={legends.teams(true)}>
      <Field key={replay}>
        {OFFENSE.map((p, i) => <Player key={`o${i}`} x={los + p.dx} y={p.y} label="" side="off" style={{ animationDelay: `${i * 40}ms` }} />)}
        {DEFENSE.map((p, i) => <Player key={`d${i}`} x={los + p.dx} y={p.y} label="" side="def" style={{ animationDelay: `${(i + 11) * 40}ms` }} />)}
      </Field>
    </StillScene>
  );
}

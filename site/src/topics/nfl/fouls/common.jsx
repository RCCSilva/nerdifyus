import Field from '../../../components/field/Field';
import { Player, Ball, FieldLine, UprightText, PenaltyFlag } from '../../../components/field/pieces';
import { fx, MID_Y } from '../../../components/field/geometry';
import { seg, lerp, along } from '../../../components/field/motion';
import { StillScene, FluidScene, Legend, StateLine } from '../../../components/scene/Scene';
import RefereeSignal from '../../../components/referee/RefereeSignal';
import { useI18n } from '../../../i18n/I18n';
import { OFFENSE, DEFENSE } from '../formations';
import { Pop, kickArc } from '../basics/visuals';
import './fouls.css';

// "Common fouls" (intermediate): one foul per slide, a picture of the foul and the referee's signal.
// Every play is ILLUSTRATIVE: it shows a rule from research/nfl/04-common-fouls.md, not a real play.

const byGroup = (list, ...groups) => list.filter((p) => groups.includes(p.group));

function TeamsLegend() {
  const { t } = useI18n();
  return <Legend strong items={[{ swatch: 'team-off', label: t('nfl.common.offense') }, { swatch: 'team-def', label: t('nfl.common.defense') }]} />;
}

/** The official signal for a foul: the referee looping it, plus its description. */
export function SignalCard({ signal }) {
  const { t } = useI18n();
  return (
    <div className="signal-card">
      <RefereeSignal signal={signal} />
      <div>
        <strong>{t('nfl.fouls.signalTitle')}</strong>
        <p>{t(`nfl.signals.${signal}`)}</p>
      </div>
    </div>
  );
}

/** A foul as a short video: teams on top; line of scrimmage and the referee's signal below. */
function FoulScene({ duration, replay, signal, legend = ['los'], children }) {
  const { t } = useI18n();
  const items = legend.map((k) => ({ swatch: k, label: t(k === 'los' ? 'nfl.common.los' : `nfl.fouls.legend.${k}`) }));
  return (
    <FluidScene
      duration={duration}
      replay={replay}
      header={<TeamsLegend />}
      footer={<>{items.length > 0 && <Legend items={items} />}<SignalCard signal={signal} /></>}
    >
      {children}
    </FluidScene>
  );
}

/** Several short videos stacked (variants of a foul), then the signal. */
function FoulStack({ signal, children }) {
  return (
    <div className="scene-stack">
      {children}
      <StillScene className="signal-only"><SignalCard signal={signal} /></StillScene>
    </div>
  );
}

/** The line of scrimmage sliding by `shift` yards, with a dashed ghost where it was. */
function MovingLine({ from, shift }) {
  return (
    <>
      {shift !== 0 && <line className="ghost-line" x1={from} x2={from} y1={-5} y2={60} />}
      <FieldLine x={from + shift} kind="los" />
    </>
  );
}

/** A hand on someone: a short yellow line from a player to a point. */
const Grab = ({ from, to }) => <line className="hold-line" x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} />;
const Tag = ({ x, y, children, show = true }) => (show ? <UprightText x={x} y={y} className="tag tag-hl tag-xs">{children}</UprightText> : null);

/* ================= the most-called fouls ================= */

// 2025 regular season, accepted penalties (S48). side: who usually commits it.
const TOP = [
  ['offHolding', 684, 'off'], ['falseStart', 681, 'off'], ['dpi', 289, 'def'], ['defHolding', 183, 'def'],
  ['delayOfGame', 182, 'off'], ['roughness', 181, 'both'], ['offside', 146, 'def'], ['formation', 112, 'off'],
  ['faceMask', 100, 'both'], ['illegalContact', 96, 'def'], ['roughingPasser', 94, 'def'], ['nzi', 77, 'def'],
  ['opi', 72, 'off'], ['illegalHands', 61, 'both'], ['grounding', 59, 'off'],
];

export function TopFoulsVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene header={<span>{t('nfl.fouls.top.title')}</span>} footer={t('nfl.fouls.top.note')}>
      <div className="top-fouls" key={replay}>
        {TOP.map(([k, n, side], i) => (
          <div key={k} className="top-foul" style={{ animationDelay: `${i * 40}ms` }}>
            <span className={`top-side ${side}`} title={t(`nfl.fouls.top.side.${side}`)} />
            <span className="top-name">{t(`nfl.fouls.top.names.${k}`)}</span>
            <span className="top-track"><i style={{ width: `${(n / TOP[0][1]) * 100}%`, animationDelay: `${i * 40}ms` }} /></span>
            <b>{n}</b>
          </div>
        ))}
        <div className="top-key">
          {['off', 'def', 'both'].map((s) => <span key={s}><i className={`top-side ${s}`} />{t(`nfl.fouls.top.side.${s}`)}</span>)}
        </div>
      </div>
    </StillScene>
  );
}

/* ================= before the snap ================= */

export function FalseStartVisual({ replay }) {
  return (
    <FoulScene duration={3600} replay={replay} signal="falseStart">
      {(t1) => <FalseStartPlay t1={t1} />}
    </FoulScene>
  );
}

function FalseStartPlay({ t1 }) {
  const { t } = useI18n();
  const los = fx(35);
  const twitch = Math.sin(Math.PI * seg(t1, 700, 1000)) * 0.9; // the right guard flinches forward
  const flagP = seg(t1, 1000, 1600);
  const back = -5 * seg(t1, 2000, 2900);
  return (
    <Field view={[fx(20), fx(52)]} viewY={[MID_Y - 10, MID_Y + 10]}>
      <MovingLine from={los} shift={back} />
      <g transform={`translate(${back} 0)`}>
        {byGroup(DEFENSE, 'dl').map((p, n) => <Player key={`d${n}`} x={los + p.dx} y={p.y} label={p.id} side="def" />)}
        {byGroup(OFFENSE, 'ol').map((p, n) => (
          <Player key={`o${n}`} x={los + p.dx + (n === 3 ? twitch : 0)} y={p.y} label={p.id} side="off" active={n === 3} />
        ))}
        <Player x={los - 3.1} y={MID_Y} label="QB" side="off" />
        <Ball x={los - 0.3} y={MID_Y} />
      </g>
      <PenaltyFlag x={los + 3.5} y={MID_Y - 3.5} p={flagP} />
      {flagP > 0 && <UprightText x={los + 7} y={MID_Y - 7.5} className="tag tag-hl">{t('nfl.fouls.whistle')}</UprightText>}
      <Pop x={los + back - 4} y={MID_Y + 6.5} show={t1 > 2950} kind="sm">−5</Pop>
    </Field>
  );
}

/** Only 6 on the line: the tight end lines up a step back. */
export function IllegalFormationVisual({ replay }) {
  return (
    <FoulScene duration={3400} replay={replay} signal="falseStart" legend={['los', 'onLine']}>
      {(t1) => <IllegalFormationPlay t1={t1} />}
    </FoulScene>
  );
}

function IllegalFormationPlay({ t1 }) {
  const { t } = useI18n();
  const los = fx(35);
  // A compact formation so the whole line fits: WR · T G C G T on the line; the TE and the other WR a step back.
  const ON = -1.0;
  const off = [
    { id: 'WR', dx: ON, y: MID_Y - 10 },
    ...['T', 'G', 'C', 'G', 'T'].map((id, k) => ({ id, dx: ON, y: MID_Y + (k - 2) * 2.1 })),
    { id: 'TE', dx: -2.6, y: MID_Y + 6.3 },
    { id: 'WR', dx: -2.6, y: MID_Y + 10 },
    { id: 'QB', dx: -3.4, y: MID_Y },
    { id: 'RB', dx: -7, y: MID_Y },
  ];
  const onLine = off.filter((p) => p.dx === ON).length;
  const count = Math.min(onLine, Math.floor(seg(t1, 200, 1500) * (onLine + 0.99)));
  const flagP = seg(t1, 1700, 2300);
  const back = -5 * seg(t1, 2500, 3300);
  let k = 0;
  return (
    <Field view={[fx(19), fx(51)]} viewY={[MID_Y - 13, MID_Y + 13]}>
      <MovingLine from={los} shift={back} />
      <g transform={`translate(${back} 0)`}>
        {off.map((p, n) => {
          const isOn = p.dx === ON;
          const lit = isOn && (k++ < count);
          return <Player key={n} x={los + p.dx} y={p.y} label={p.id} side="off" active={lit} dim={!isOn} />;
        })}
        <Ball x={los - 0.3} y={MID_Y} />
      </g>
      <Tag x={los + 8} y={MID_Y - 10}>{t('nfl.fouls.formation.count', { n: count })}</Tag>
      <PenaltyFlag x={los + 4} y={MID_Y + 6} p={flagP} />
      <Pop x={los + back - 5} y={MID_Y - 7} show={t1 > 3300} kind="sm">−5</Pop>
    </Field>
  );
}

// The three look-alike neutral-zone fouls, stacked top to bottom.
// One defender and the neutral zone before the snap (R7-4-3/4/5). Offside needs the snap, so that
// play goes on; encroachment and the neutral zone infraction are whistled at once.
function NeutralZoneField({ scene, t1 }) {
  const { t } = useI18n();
  const los = fx(50);
  const ZONE = 0.62; // half the drawn ball: the neutral zone is the ball's length (R3-18-2)
  const move = seg(t1, 300, 1100);
  const actor = scene === 'offside' ? 0 : scene === 'encroachment' ? 2 : 3;
  const snap = scene === 'offside' ? seg(t1, 1300, 1500) : 0; // only offside gets a snap
  const run = scene === 'offside' ? seg(t1, 1500, 2700) : 0; // and the play goes on
  const flagAt = scene === 'offside' ? 1400 : 1300;
  const flagP = seg(t1, flagAt, flagAt + 600);
  const ol = [-2, -1, 0, 1, 2].map((k) => ({ id: ['T', 'G', 'C', 'G', 'T'][k + 2], x: los - ZONE - 1.1 - run * 0.5, y: MID_Y + k * 2.1 }));
  const dl = [-3.5, -1, 1, 3.6].map((k, n) => ({ id: ['DE', 'DT', 'DT', 'DE'][n], x: los + ZONE + 1.3, y: MID_Y + k * 2.1 }));
  const defPos = (p, n) => {
    if (n !== actor) return [p.x - run * 1.2, p.y];
    if (scene === 'offside') return [lerp(p.x, los + ZONE - 0.2, move) - run * 3.5, p.y - run * 0.5]; // rushes around the tackle
    if (scene === 'encroachment') return [lerp(p.x, los - ZONE - 0.6 + 2.0, move), lerp(p.y, MID_Y + 2.1, move)];
    return [lerp(p.x, los - 0.2, move), p.y];
  };
  const flinch = scene === 'nzi' ? -0.9 * seg(t1, 1000, 1300) : 0;
  const qbX = los - 4.5 - run * 3;
  const ballX = lerp(los, qbX, snap);
  const ballY = MID_Y + 1.3 * snap; // in the QB's hands, below his label
  const whistle = scene !== 'offside' && t1 > 1300;
  return (
    <Field view={[los - 13, los + 13]} viewY={[MID_Y - 9.2, MID_Y + 9.2]}>
      <rect className="nz-band" x={los - ZONE} y={MID_Y - 30} width={ZONE * 2} height={60} />
      <Player x={qbX} y={MID_Y} label="QB" side="off" dim={scene !== 'offside'} />
      <Ball x={ballX} y={ballY} />
      {ol.map((p, n) => <Player key={`o${n}`} x={p.x + (n === 4 ? flinch : 0)} y={p.y} label={p.id} side="off" />)}
      {dl.map((p, n) => {
        const [x, y] = defPos(p, n);
        return <Player key={`d${n}`} x={x} y={y} label={p.id} side="def" active={n === actor} />;
      })}
      <PenaltyFlag x={los + 3.5} y={MID_Y - 5.5} fromX={los + 7} fromY={MID_Y - 9} p={flagP} />
      <Tag x={los - 6} y={MID_Y + 7.9} show={scene === 'offside' && t1 > 1700}>{t('nfl.fouls.nz.playOn')}</Tag>
      <Tag x={los - 6.5} y={MID_Y - 7.8} show={whistle}>{t('nfl.fouls.nz.whistle')}</Tag>
      <Pop x={los + 8.5} y={MID_Y + 5} show={t1 > (scene === 'offside' ? 3000 : 1950)} kind="sm">+5</Pop>
    </Field>
  );
}

const nzVisual = (scene, duration) => function NeutralZoneVisual({ replay }) {
  return (
    <FoulScene duration={duration} replay={replay} signal="offside" legend={['nz']}>
      {(t1) => <NeutralZoneField scene={scene} t1={t1} />}
    </FoulScene>
  );
};
export const OffsideVisual = nzVisual('offside', 3600);
export const EncroachmentVisual = nzVisual('encroachment', 2600);
export const NeutralZoneInfractionVisual = nzVisual('nzi', 2600);

/** The play clock runs out before the snap. */
export function DelayOfGameVisual({ replay }) {
  return (
    <FoulScene duration={4600} replay={replay} signal="delayOfGame">
      {(t1) => <DelayPlay t1={t1} />}
    </FoulScene>
  );
}

function DelayPlay({ t1 }) {
  const { t } = useI18n();
  const los = fx(35);
  const left = Math.max(0, 3 - Math.floor(t1 / 800)); // :03 → :00, sped up
  const out = t1 >= 2400;
  const flagP = seg(t1, 2500, 3100);
  const back = -5 * seg(t1, 3400, 4300);
  return (
    <Field view={[fx(20), fx(52)]} viewY={[MID_Y - 11, MID_Y + 9]}>
      <MovingLine from={los} shift={back} />
      <g transform={`translate(${back} 0)`}>
        {byGroup(DEFENSE, 'dl').map((p, n) => <Player key={`d${n}`} x={los + p.dx} y={p.y} label={p.id} side="def" />)}
        {byGroup(OFFENSE, 'ol').map((p, n) => <Player key={`o${n}`} x={los + p.dx} y={p.y} label={p.id} side="off" />)}
        <Player x={los - 3.1} y={MID_Y} label="QB" side="off" active={out} />
        <Ball x={los - 0.3} y={MID_Y} />
      </g>
      <g className={`play-clock-sign ${out ? 'is-out' : ''}`} transform={`translate(${los + 9} ${MID_Y - 7.5})`}>
        <rect x={-3.6} y={-1.9} width={7.2} height={3.8} rx={0.6} />
        <UprightText x={0} y={0.1} className="play-clock-num">:0{left}</UprightText>
      </g>
      <UprightText x={los + 9} y={MID_Y - 4.4} className="tag tag-hl tag-xs">{t('nfl.fouls.delay.clock')}</UprightText>
      <PenaltyFlag x={los + 3.5} y={MID_Y + 4} p={flagP} />
      <Pop x={los + back - 4} y={MID_Y + 6.5} show={t1 > 4350} kind="sm">−5</Pop>
    </Field>
  );
}

/* ================= blocking ================= */

// Close-up of one tackle (T) and one defensive end (DE). The offense moves right; the QB is on the left.
const HB = { los: fx(40), y: MID_Y };

function BlockField({ children, extra }) {
  return (
    <Field view={[HB.los - 15, HB.los + 9]} viewY={[HB.y - 8.5, HB.y + 4.5]}>
      <FieldLine x={HB.los} kind="los" />
      <Player x={HB.los - 7} y={HB.y + 1.5} label="QB" side="off" dim />
      {children}
      {extra}
    </Field>
  );
}

/** Legal: the defender stays in front, the blocker's hands are on his chest. */
function LegalBlock({ t1 }) {
  const p = seg(t1, 300, 2300);
  const tk = [HB.los - 1 - 2.6 * p, HB.y - 1.2];
  const de = [tk[0] + 1.95, tk[1] + 0.1];
  return (
    <BlockField extra={<Tag x={HB.los - 2.5} y={HB.y - 6.8} show={t1 > 1200}>✓</Tag>}>
      <Player x={de[0]} y={de[1]} label="DE" side="def" />
      <Player x={tk[0]} y={tk[1]} label="T" side="off" active />
      {t1 > 300 && <>
        <Grab from={[tk[0] + 0.7, tk[1] - 0.45]} to={[de[0] - 0.75, de[1] - 0.4]} />
        <Grab from={[tk[0] + 0.7, tk[1] + 0.45]} to={[de[0] - 0.75, de[1] + 0.4]} />
      </>}
    </BlockField>
  );
}

/** Holding: the defender gets past on the side; the blocker reaches out, grabs and drags him back. */
function HoldingBlock({ t1 }) {
  const grabAt = 1300;
  const pass = seg(t1, 300, grabAt); // the DE goes around the tackle's outside shoulder
  const deRun = along([[HB.los + 1.4, HB.y - 1.6], [HB.los - 0.6, HB.y - 3.4], [HB.los - 3.4, HB.y - 3.2]], pass);
  const pulled = along([deRun, [HB.los - 2.2, HB.y - 3.9]], seg(t1, grabAt, grabAt + 600));
  const de = t1 < grabAt ? deRun : pulled;
  const tk = [HB.los - 1 - 0.8 * pass, HB.y - 1.2 + 0.2 * pass];
  const flagP = seg(t1, 2000, 2600);
  return (
    <BlockField>
      <Player x={de[0]} y={de[1]} label="DE" side="def" />
      <Player x={tk[0]} y={tk[1]} label="T" side="off" active />
      {t1 > grabAt && <Grab from={[tk[0] - 0.2, tk[1] - 0.8]} to={[de[0] + 0.3, de[1] + 0.6]} />}
      <PenaltyFlag x={HB.los + 2.5} y={HB.y - 4.5} fromX={HB.los + 4.5} fromY={HB.y - 7} p={flagP} />
      <Pop x={HB.los + 2.5} y={HB.y + 1.5} show={t1 > 2700} kind="sm">−10</Pop>
    </BlockField>
  );
}

export function OffensiveHoldingVisual({ replay }) {
  const { t } = useI18n();
  return (
    <FoulStack signal="holding">
      {[['legal', LegalBlock, 2800], ['holding', HoldingBlock, 3400]].map(([k, Play, d]) => (
        <FluidScene
          key={k}
          duration={d}
          replay={`${k}-${replay}`}
          header={<StateLine chip={t(`nfl.fouls.block.${k}`)} caption={t(`nfl.fouls.block.${k}How`)} highlight={k === 'legal'} />}
          footer={<Legend items={[{ swatch: 'hands', label: t('nfl.fouls.legend.hands') }]} />}
        >
          {(t1) => <Play t1={t1} />}
        </FluidScene>
      ))}
    </FoulStack>
  );
}

/** Illegal use of hands: the blocker shoves the defender's head instead of his chest. */
export function IllegalHandsVisual({ replay }) {
  return (
    <FoulScene duration={3200} replay={replay} signal="illegalHands" legend={['hands']}>
      {(t1) => <IllegalHandsPlay t1={t1} />}
    </FoulScene>
  );
}

function IllegalHandsPlay({ t1 }) {
  const { t } = useI18n();
  const tk = [HB.los - 1.6, HB.y - 1.2];
  const de = [tk[0] + 1.95 + 0.6 * seg(t1, 800, 1200), tk[1] - 0.2];
  const head = t1 > 800;
  const flagP = seg(t1, 1500, 2100);
  return (
    <BlockField extra={<Tag x={de[0] + 0.5} y={HB.y - 6.8} show={head}>{t('nfl.fouls.hands.head')}</Tag>}>
      <Player x={de[0]} y={de[1]} label="DE" side="def" />
      <Player x={tk[0]} y={tk[1]} label="T" side="off" active />
      {head
        ? <>
            <Grab from={[tk[0] + 0.7, tk[1] - 0.3]} to={[de[0], de[1] - 0.2]} />
            <circle className="hit-ring" cx={de[0]} cy={de[1]} r={1.35} />
          </>
        : <Grab from={[tk[0] + 0.7, tk[1]]} to={[de[0] - 0.75, de[1]]} />}
      <PenaltyFlag x={HB.los + 2.5} y={HB.y + 1} fromX={HB.los + 4.5} fromY={HB.y - 3} p={flagP} />
      <Pop x={HB.los - 9} y={HB.y + 2.5} show={t1 > 2300} kind="sm">−10</Pop>
    </BlockField>
  );
}

export function DefensiveHoldingVisual({ replay }) {
  return (
    <FoulScene duration={4400} replay={replay} signal="holding">
      {(t1) => <DefensiveHoldingPlay t1={t1} />}
    </FoulScene>
  );
}

function DefensiveHoldingPlay({ t1 }) {
  const { t } = useI18n();
  const los = fx(35);
  const route = [[los - 1, 12], [los + 6, 12], [los + 9, 16]];
  const slowed = t1 > 900;
  const wr = along(route, slowed ? 0.45 + seg(t1, 900, 2200) * 0.15 : seg(t1, 0, 900) * 0.45);
  const cb = [wr[0] + 1.9, wr[1] + 1.0];
  const flagP = seg(t1, 1500, 2100);
  const fwd = 5 * seg(t1, 2600, 3500);
  return (
    <Field view={[fx(24), fx(54)]} viewY={[5, 28.5]}>
      <MovingLine from={los} shift={fwd} />
      <g opacity={fwd > 0 ? 0.55 : 1}>
        {slowed && <Grab from={cb} to={wr} />}
        <Player x={wr[0]} y={wr[1]} label="WR" side="off" />
        <Player x={cb[0]} y={cb[1]} label="CB" side="def" active />
        <Player x={los - 3.1} y={MID_Y} label="QB" side="off" />
      </g>
      <PenaltyFlag x={wr[0] + 2} y={wr[1] + 4} p={flagP} />
      <Pop x={los + fwd + 4} y={22} show={t1 > 3550} kind="sm">+5</Pop>
      {t1 > 3550 && <UprightText x={los + fwd + 4} y={8} className="tag tag-hl">{t('nfl.fouls.firstDown')}</UprightText>}
    </Field>
  );
}

/* ================= passing plays ================= */

/** Illegal contact: a jam inside 5 yards is legal; a shove beyond 5 yards isn't. */
export function IllegalContactVisual({ replay }) {
  return (
    <FoulScene duration={4400} replay={replay} signal="illegalContact" legend={['los', 'fiveYards']}>
      {(t1) => <IllegalContactPlay t1={t1} />}
    </FoulScene>
  );
}

function IllegalContactPlay({ t1 }) {
  const { t } = useI18n();
  const los = fx(30);
  const y = 12;
  const wr = along([[los - 1, y], [los + 3, y], [los + 3.6, y], [los + 9, y], [los + 9.6, y + 0.4], [los + 14, y + 0.6]],
    seg(t1, 0, 2600));
  const cb = t1 < 1600
    ? along([[los + 4.5, y + 0.2], [los + 5, y + 0.2], [los + 7.5, y + 1.4], [los + 10.5, y + 1.5]], seg(t1, 0, 1600))
    : [wr[0] + 1.6, wr[1] + 1.3];
  const jam = t1 > 500 && t1 < 900;
  const shove = t1 > 1500 && t1 < 2000;
  const flagP = seg(t1, 2100, 2700);
  return (
    <Field view={[fx(20), fx(48)]} viewY={[3, 25]}>
      <rect className="zone5-band" x={los} y={-5} width={5} height={70} />
      <FieldLine x={los} kind="los" />
      <Player x={los - 6} y={MID_Y - 3} label="QB" side="off" />
      <Ball x={los - 5.1} y={MID_Y - 3.9} />
      <Player x={wr[0]} y={wr[1]} label="WR" side="off" />
      <Player x={cb[0]} y={cb[1]} label="CB" side="def" active={t1 > 1500} />
      {(jam || shove) && <Grab from={cb} to={wr} />}
      <Tag x={los + 2.5} y={22.6} show={t1 > 600}>✓ {t('nfl.fouls.contact.jam')}</Tag>
      <Tag x={los + 12} y={7} show={t1 > 1600}>{t('nfl.fouls.contact.shove')}</Tag>
      <PenaltyFlag x={los + 12} y={y + 4.5} p={flagP} />
      <Pop x={los + 14} y={16.5} show={t1 > 3000} kind="sm">+5</Pop>
      <Tag x={los + 11.5} y={20.2} show={t1 > 3000}>{t('nfl.fouls.firstDown')}</Tag>
    </Field>
  );
}

export function PassInterferenceVisual({ replay }) {
  return (
    <FoulScene duration={5000} replay={replay} signal="passInterference">
      {(t1) => <PassInterferencePlay t1={t1} />}
    </FoulScene>
  );
}

function PassInterferencePlay({ t1 }) {
  const { t } = useI18n();
  const los = fx(30);
  const qb = [los - 6, MID_Y];
  const catchSpot = [los + 22, 18];
  const wr = along([[los - 1, 16], [los + 12, 16], [los + 19, 17.5]], seg(t1, 0, 1800));
  const cb = along([[los + 9, 19], [los + 15, 19], [wr[0] + 1.6, wr[1] + 1.3]], seg(t1, 0, 1800));
  const flight = seg(t1, 900, 2300);
  const ball = kickArc(qb, catchSpot, flight);
  const flagP = seg(t1, 1900, 2500);
  const foulSpot = los + 19;
  const move = seg(t1, 3000, 3900);
  return (
    <Field view={[fx(18), fx(58)]} viewY={[4, 29]}>
      <MovingLine from={los} shift={(foulSpot - los) * move} />
      <g opacity={move > 0 ? 0.55 : 1}>
        <Player x={qb[0]} y={qb[1]} label="QB" side="off" />
        <Player x={wr[0]} y={wr[1]} label="WR" side="off" />
        <Player x={cb[0]} y={cb[1]} label="CB" side="def" active />
        {t1 < 2300 && t1 > 900 && <Ball x={ball.x} y={ball.y} z={ball.z} />}
      </g>
      <PenaltyFlag x={foulSpot + 3} y={22} p={flagP} />
      {move > 0 && <g transform={`translate(${lerp(los, foulSpot, move)} ${MID_Y}) scale(1.8)`}><Ball x={0} y={0} /></g>}
      {t1 > 3950 && <UprightText x={foulSpot - 2} y={8} className="tag tag-hl">{t('nfl.fouls.spotFirstDown')}</UprightText>}
    </Field>
  );
}

/** Intentional grounding: under pressure, the QB throws where no receiver is. */
export function GroundingVisual({ replay }) {
  return (
    <FoulScene duration={4200} replay={replay} signal="grounding">
      {(t1) => <GroundingPlay t1={t1} />}
    </FoulScene>
  );
}

function GroundingPlay({ t1 }) {
  const { t } = useI18n();
  const los = fx(30);
  const qb = along([[los - 3.1, MID_Y], [los - 7, MID_Y]], seg(t1, 0, 900));
  const de = along([[los + 1.4, MID_Y - 7.4], [los - 2, MID_Y - 6], [qb[0] + 1.7, qb[1] - 1.4]], seg(t1, 200, 1700));
  const throwAt = 1700;
  const land = [los + 2, MID_Y + 11];
  const fl = seg(t1, throwAt, throwAt + 800);
  const ball = t1 < throwAt ? { x: qb[0] + 0.9, y: qb[1] - 0.9, z: 0 } : kickArc([qb[0], qb[1]], land, fl);
  const flagP = seg(t1, 2700, 3300);
  return (
    <Field view={[fx(18), fx(50)]} viewY={[MID_Y - 13, MID_Y + 14]}>
      <FieldLine x={los} kind="los" />
      {byGroup(OFFENSE, 'ol').map((p, n) => <Player key={`o${n}`} x={los + p.dx - 0.6} y={p.y} label="" side="off" dim />)}
      {byGroup(DEFENSE, 'dl').slice(1).map((p, n) => <Player key={`d${n}`} x={los + p.dx - 0.8} y={p.y} label="" side="def" dim />)}
      <Player x={los + 12} y={MID_Y - 12} label="WR" side="off" />
      <Player x={los + 13} y={MID_Y - 10} label="CB" side="def" dim />
      <Player x={de[0]} y={de[1]} label="DE" side="def" />
      <Player x={qb[0]} y={qb[1]} label="QB" side="off" active />
      <Ball x={ball.x} y={ball.y} z={ball.z} />
      <Tag x={land[0] + 1} y={land[1] - 2.2} show={fl >= 1}>{t('nfl.fouls.grounding.nobody')}</Tag>
      <PenaltyFlag x={qb[0] + 3} y={qb[1] + 3} p={flagP} />
      <Tag x={los - 2} y={MID_Y - 11.5} show={t1 > 3400}>{t('nfl.fouls.grounding.result')}</Tag>
    </Field>
  );
}

/* ================= personal fouls (15 yards) ================= */

/** Roughing the passer: the rusher keeps going after the ball is gone and hits the QB. */
export function RoughingPasserVisual({ replay }) {
  return (
    <FoulScene duration={4200} replay={replay} signal="roughingPasser">
      {(t1) => <RoughingPlay t1={t1} />}
    </FoulScene>
  );
}

function RoughingPlay({ t1 }) {
  const { t } = useI18n();
  const los = fx(30);
  const qb = [los - 7, MID_Y];
  const throwAt = 1300;
  const hitAt = 2100;
  const de = along([[los + 1.4, MID_Y - 7.4], [los - 2.5, MID_Y - 5], [qb[0] + 1.5, qb[1] - 1.3]], seg(t1, 200, hitAt));
  const ball = t1 < throwAt ? { x: qb[0] + 0.9, y: qb[1] - 0.9, z: 0 } : kickArc(qb, [los + 18, MID_Y - 8], seg(t1, throwAt, throwAt + 1100));
  const hit = t1 > hitAt;
  const knocked = hit ? [qb[0] - 1.2 * seg(t1, hitAt, hitAt + 300), qb[1] + 0.8 * seg(t1, hitAt, hitAt + 300)] : qb;
  const flagP = seg(t1, 2500, 3100);
  return (
    <Field view={[fx(18), fx(48)]} viewY={[MID_Y - 12, MID_Y + 9]}>
      <FieldLine x={los} kind="los" />
      {byGroup(OFFENSE, 'ol').map((p, n) => <Player key={`o${n}`} x={los + p.dx - 0.6} y={p.y} label="" side="off" dim />)}
      {byGroup(DEFENSE, 'dl').slice(1).map((p, n) => <Player key={`d${n}`} x={los + p.dx - 0.8} y={p.y} label="" side="def" dim />)}
      <Player x={knocked[0]} y={knocked[1]} label="QB" side="off" />
      <Player x={de[0]} y={de[1]} label="DE" side="def" active={hit} />
      {t1 < throwAt + 1100 && <Ball x={ball.x} y={ball.y} z={ball.z} />}
      {hit && <circle className="hit-ring" cx={knocked[0] + 0.7} cy={knocked[1] - 0.6} r={1.6} />}
      <Tag x={los - 3} y={MID_Y - 10} show={t1 > throwAt}>{t('nfl.fouls.roughing.gone')}</Tag>
      <PenaltyFlag x={qb[0] + 3.5} y={qb[1] + 3.5} p={flagP} />
      <Pop x={los + 6} y={MID_Y + 4} show={t1 > 3200} kind="sm">+15</Pop>
      <Tag x={los + 6} y={MID_Y + 7.4} show={t1 > 3200}>{t('nfl.fouls.firstDown')}</Tag>
    </Field>
  );
}

/** Unnecessary roughness: hitting a runner after he has gone out of bounds. */
export function RoughnessVisual({ replay }) {
  return (
    <FoulScene duration={3800} replay={replay} signal="personalFoul" legend={[]}>
      {(t1) => <RoughnessPlay t1={t1} />}
    </FoulScene>
  );
}

function RoughnessPlay({ t1 }) {
  const { t } = useI18n();
  const x0 = fx(40);
  const outAt = 1400;
  // The runner heads for the sideline (y = 0) and steps out; the linebacker hits him after that.
  const rb = along([[x0, 8], [x0 + 6, 2.5], [x0 + 8, -1.5], [x0 + 8.4, -2.6]], seg(t1, 0, outAt + 300));
  const hitAt = 1900;
  const lb = along([[x0 + 4, 10], [x0 + 7, 3], [rb[0] - 1.7, rb[1] + 0.6]], seg(t1, 0, hitAt));
  const hit = t1 > hitAt;
  const flagP = seg(t1, 2200, 2800);
  return (
    <Field view={[x0 - 6, x0 + 20]} viewY={[-6.5, 10]}>
      <Player x={rb[0]} y={rb[1]} label="RB" side="off" />
      <Ball x={rb[0] + 0.9} y={rb[1] - 0.6} />
      <Player x={lb[0]} y={lb[1]} label="LB" side="def" active={hit} />
      {hit && <circle className="hit-ring" cx={(rb[0] + lb[0]) / 2} cy={(rb[1] + lb[1]) / 2} r={1.5} />}
      <Tag x={x0 + 15.5} y={-4.6} show={t1 > outAt}>{t('nfl.fouls.roughness.out')}</Tag>
      <PenaltyFlag x={x0 + 5} y={4} p={flagP} />
      <Pop x={x0 + 14} y={5} show={t1 > 3000} kind="sm">+15</Pop>
    </Field>
  );
}

/** Face mask: the tackler grabs the facemask and twists. */
export function FaceMaskVisual({ replay }) {
  return (
    <FoulScene duration={3600} replay={replay} signal="faceMask" legend={['hands']}>
      {(t1) => <FaceMaskPlay t1={t1} />}
    </FoulScene>
  );
}

function FaceMaskPlay({ t1 }) {
  const { t } = useI18n();
  const x0 = fx(45);
  const grabAt = 1100;
  const rb = t1 < grabAt
    ? along([[x0 - 6, MID_Y + 2], [x0, MID_Y]], seg(t1, 0, grabAt))
    : along([[x0, MID_Y], [x0 + 0.8, MID_Y - 1]], seg(t1, grabAt, grabAt + 700));
  const lb = t1 < grabAt
    ? along([[x0 + 5, MID_Y - 4], [x0 + 1.9, MID_Y - 1.2]], seg(t1, 0, grabAt))
    : [rb[0] + 2.4, rb[1] - 1.1];
  const grab = t1 > grabAt;
  const twist = seg(t1, grabAt, grabAt + 700) * 70;
  const flagP = seg(t1, 2000, 2600);
  return (
    <Field view={[x0 - 13, x0 + 11]} viewY={[MID_Y - 7.5, MID_Y + 6]}>
      <Player x={rb[0]} y={rb[1]} label="RB" side="off" />
      <Ball x={rb[0] - 0.4} y={rb[1] + 0.9} />
      <Player x={lb[0]} y={lb[1]} label="LB" side="def" active={grab} />
      {grab && <>
        <Grab from={[lb[0] - 0.9, lb[1] + 0.4]} to={[rb[0] + 0.6, rb[1] - 0.3]} />
        <path className="twist-arrow" transform={`translate(${rb[0]} ${rb[1]}) rotate(${-twist})`} d="M 0 1.7 A 1.7 1.7 0 0 1 -1.7 0" />
      </>}
      <Tag x={x0 - 4} y={MID_Y - 5.6} show={grab}>{t('nfl.fouls.faceMask.grab')}</Tag>
      <PenaltyFlag x={x0 + 4} y={MID_Y + 2.5} p={flagP} />
      <Pop x={x0 - 4} y={MID_Y + 3.5} show={t1 > 2800} kind="sm">15</Pop>
    </Field>
  );
}

/* ================= summary ================= */

export function FoulsSummaryVisual({ replay }) {
  const { tm } = useI18n();
  return (
    <div className="foul-rows" key={replay}>
      {tm('nfl.slides.foulsSummary.rows').map(([name, side, pen], n) => (
        <div className="foul-row" key={name} style={{ animationDelay: `${n * 60}ms` }}>
          <span className={`foul-side ${side}`}>{side === 'off' ? 'OFF' : side === 'def' ? 'DEF' : 'OFF/DEF'}</span>
          <span className="foul-name">{name}</span>
          <span className="foul-pen">{pen}</span>
        </div>
      ))}
    </div>
  );
}

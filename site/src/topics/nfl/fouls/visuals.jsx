import { useEffect, useState } from 'react';
import Field from '../../../components/field/Field';
import { Player, Ball, FieldLine, UprightText, PenaltyFlag } from '../../../components/field/pieces';
import { fx, MID_Y } from '../../../components/field/geometry';
import { useTimeline, seg, lerp, along, prefersReducedMotion } from '../../../components/field/motion';
import { useI18n } from '../../../i18n/I18n';
import { OFFENSE, DEFENSE } from '../formations';
import { Pop, kickArc } from '../basics/visuals';

// Every visual is illustrative: it shows a rule from research/nfl/03-common-fouls.md, not a real play.

const byGroup = (list, ...groups) => list.filter((p) => groups.includes(p.group));

/** The line of scrimmage sliding by `shift` yards, with a dashed ghost where it was. */
function MovingLine({ from, shift }) {
  return (
    <>
      {shift !== 0 && <line className="ghost-line" x1={from} x2={from} y1={0} y2={60} />}
      <FieldLine x={from + shift} kind="los" />
    </>
  );
}

/* ---------- intro: a flag, then yards ---------- */

export function FoulsIntroVisual({ replay }) {
  const { t } = useI18n();
  const t1 = useTimeline(5200, replay);
  const los = fx(40);
  const offPhase = t1 < 2600;
  const p = offPhase ? seg(t1, 1300, 2200) : seg(t1, 3900, 4800);
  const shift = offPhase ? -5 * p : 5 * p;
  const flagP = offPhase ? seg(t1, 300, 1000) : seg(t1, 2900, 3600);
  return (
    <Field view={[fx(25), fx(55)]} viewY={[MID_Y - 9.5, MID_Y + 9.5]}>
      <MovingLine from={los} shift={shift} />
      <PenaltyFlag x={los + 2} y={MID_Y + 4} p={flagP} />
      <g transform={`translate(${los + shift - 1} ${MID_Y}) scale(2.2)`}><Ball x={0} y={0} /></g>
      <UprightText x={los} y={MID_Y - 6.5} className={`tag tag-md ${offPhase ? 'tag-off' : 'tag-def'}`}>
        {offPhase ? t('nfl.fouls.offFoul') : t('nfl.fouls.defFoul')}
      </UprightText>
      <Pop x={los + shift} y={MID_Y + 5.5} show={p >= 1} kind="sm">{offPhase ? '−5' : '+5'}</Pop>
    </Field>
  );
}

/* ---------- false start ---------- */

export function FalseStartVisual({ replay }) {
  const { t } = useI18n();
  const t1 = useTimeline(3600, replay);
  const los = fx(35);
  const twitch = Math.sin(Math.PI * seg(t1, 700, 1000)) * 0.9; // the right guard flinches forward
  const flagP = seg(t1, 1000, 1600);
  const back = -5 * seg(t1, 2000, 2900);
  const ol = byGroup(OFFENSE, 'ol');
  const dl = byGroup(DEFENSE, 'dl');
  return (
    <Field view={[fx(20), fx(52)]} viewY={[MID_Y - 10, MID_Y + 10]}>
      <MovingLine from={los} shift={back} />
      <g transform={`translate(${back} 0)`}>
        {dl.map((p, n) => <Player key={`d${n}`} x={los + p.dx} y={p.y} label={p.id} side="def" />)}
        {ol.map((p, n) => (
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

/* ---------- offside / encroachment / neutral zone infraction ---------- */

const NZ_SCENES = ['offside', 'encroachment', 'nzi'];

export function OffsideFamilyVisual({ replay }) {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const t1 = useTimeline(2600, `${i}-${replay}`);

  useEffect(() => { setI(0); }, [replay]);
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const id = setTimeout(() => setI((n) => (n + 1) % NZ_SCENES.length), 3400);
    return () => clearTimeout(id);
  }, [i]);

  const scene = NZ_SCENES[i];
  const los = fx(50);
  const ZONE = 0.62; // half the drawn ball: the neutral zone is the ball's length (R3-18-2)
  const move = seg(t1, 300, 1100);
  const flagP = seg(t1, 1300, 1900);

  // Positions in this close-up: offense just behind the zone, defense just in front of it.
  const ol = [-2, -1, 0, 1, 2].map((k) => ({ id: ['T', 'G', 'C', 'G', 'T'][k + 2], x: los - ZONE - 1.1, y: MID_Y + k * 2.1 }));
  const dl = [-3.5, -1, 1, 3.6].map((k, n) => ({ id: ['DE', 'DT', 'DT', 'DE'][n], x: los + ZONE + 1.3, y: MID_Y + k * 2.1 }));
  const actor = scene === 'offside' ? 0 : scene === 'encroachment' ? 2 : 3;

  const defPos = (p, n) => {
    if (n !== actor) return [p.x, p.y];
    if (scene === 'offside') return [lerp(p.x, los + ZONE - 0.2, move), p.y]; // just inside the zone at the snap
    if (scene === 'encroachment') return [lerp(p.x, los - ZONE - 0.6 + 2.0, move), lerp(p.y, MID_Y + 2.1, move)]; // touches the guard
    return [lerp(p.x, los - 0.2, move), p.y]; // steps into the zone
  };
  const flinch = scene === 'nzi' ? -0.9 * seg(t1, 1000, 1300) : 0; // the tackle reacts

  return (
    <div className="downs">
      <div className="downs-board" aria-live="polite">
        <span className="downs-chip">{t(`nfl.fouls.scene.${scene}`)}</span>
        <span className="downs-caption">{t(`nfl.fouls.sceneHow.${scene}`)}</span>
      </div>
      <Field view={[los - 14, los + 14]} viewY={[MID_Y - 9.5, MID_Y + 9.5]}>
        <rect className="nz-band" x={los - ZONE} y={MID_Y - 30} width={ZONE * 2} height={60} />
        <UprightText x={los} y={MID_Y - 8.6} className="nz-label">{t('nfl.fouls.neutralZone')}</UprightText>
        <Ball x={los} y={MID_Y} />
        {ol.map((p, n) => (
          <Player key={`o${n}`} x={p.x + (n === 4 ? flinch : 0)} y={p.y} label={p.id} side="off" />
        ))}
        {dl.map((p, n) => {
          const [x, y] = defPos(p, n);
          return <Player key={`d${n}`} x={x} y={y} label={p.id} side="def" active={n === actor} />;
        })}
        <PenaltyFlag x={los + 3.5} y={MID_Y - 5.5} fromX={los + 7} fromY={MID_Y - 9} p={flagP} />
        <Pop x={los + 9} y={MID_Y + 5} show={t1 > 1950} kind="sm">+5</Pop>
      </Field>
      <div className="downs-legend">
        <span><i className="swatch nz" />{t('nfl.fouls.neutralZone')}</span>
        <span className="downs-dots">
          {NZ_SCENES.map((s, n) => (
            <button key={s} className={n === i ? 'is-on' : ''} onClick={() => setI(n)} aria-label={t(`nfl.fouls.scene.${s}`)} />
          ))}
        </span>
      </div>
    </div>
  );
}

/* ---------- offensive holding ---------- */

export function OffensiveHoldingVisual({ replay }) {
  const t1 = useTimeline(4200, replay);
  const los = fx(35);
  const ol = byGroup(OFFENSE, 'ol').map((p) => ({ ...p, x: los + p.dx }));
  const de = DEFENSE.find((p) => p.id === 'DE');
  const tackle = ol[0];
  // The DE rushes around the tackle; the tackle grabs him and drags him back.
  const deFree = along([[los + de.dx, de.y], [los - 1.2, de.y - 0.6], [los - 3.4, tackle.y + 1.2]], seg(t1, 300, 1300));
  const grab = t1 > 1300;
  const pulled = along([deFree, [los - 2.0, tackle.y - 1.3]], seg(t1, 1300, 1800));
  const dePos = grab ? pulled : deFree;
  const qb = along([[los - 3.1, MID_Y], [los - 6.5, MID_Y]], seg(t1, 200, 1200));
  const tPos = [lerp(tackle.x, los - 3.0, seg(t1, 300, 1300)), lerp(tackle.y, tackle.y + 0.9, seg(t1, 300, 1300))];
  const flagP = seg(t1, 1900, 2500);
  const back = -10 * seg(t1, 2900, 3900);
  return (
    <Field view={[fx(18), fx(48)]} viewY={[MID_Y - 10.5, MID_Y + 8]}>
      <MovingLine from={los} shift={back} />
      <g opacity={back < 0 ? 0.55 : 1}>
        {ol.slice(1).map((p, n) => <Player key={n} x={p.x} y={p.y} label={p.id} side="off" />)}
        <Player x={qb[0]} y={qb[1]} label="QB" side="off" />
        <Ball x={qb[0] + 0.9} y={qb[1] - 0.9} />
        {grab && <line className="hold-line" x1={tPos[0]} y1={tPos[1]} x2={dePos[0]} y2={dePos[1]} />}
        <Player x={dePos[0]} y={dePos[1]} label="DE" side="def" />
        <Player x={tPos[0]} y={tPos[1]} label="T" side="off" active />
      </g>
      <PenaltyFlag x={los + 3} y={tackle.y - 2.5} p={flagP} />
      <Pop x={los + back - 3} y={MID_Y + 5} show={t1 > 3950} kind="sm">−10</Pop>
    </Field>
  );
}

/* ---------- defensive holding ---------- */

export function DefensiveHoldingVisual({ replay }) {
  const { t } = useI18n();
  const t1 = useTimeline(4400, replay);
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
        {slowed && <line className="hold-line" x1={cb[0]} y1={cb[1]} x2={wr[0]} y2={wr[1]} />}
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

/* ---------- pass interference ---------- */

export function PassInterferenceVisual({ replay }) {
  const { t } = useI18n();
  const t1 = useTimeline(5000, replay);
  const los = fx(30);
  const qb = [los - 6, MID_Y];
  const catchSpot = [los + 22, 18];
  const wr = along([[los - 1, 16], [los + 12, 16], [los + 19, 17.5]], seg(t1, 0, 1800));
  // The CB cuts across the receiver before the ball arrives: contact, no chance to catch.
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

/* ---------- summary ---------- */

export function FoulsSummaryVisual({ replay }) {
  const { tm } = useI18n();
  return (
    <div className="foul-rows" key={replay}>
      {tm('nfl.slides.foulsSummary.rows').map(([name, side, pen], n) => (
        <div className="foul-row" key={name} style={{ animationDelay: `${n * 90}ms` }}>
          <span className={`foul-side ${side}`}>{side === 'off' ? 'OFF' : 'DEF'}</span>
          <span className="foul-name">{name}</span>
          <span className="foul-pen">{pen}</span>
        </div>
      ))}
    </div>
  );
}

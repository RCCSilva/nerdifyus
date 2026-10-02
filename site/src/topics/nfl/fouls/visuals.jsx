import Field from '../../../components/field/Field';
import { Player, Ball, FieldLine, UprightText, PenaltyFlag } from '../../../components/field/pieces';
import { fx, MID_Y } from '../../../components/field/geometry';
import { seg } from '../../../components/field/motion';
import { StillScene, FluidScene, StopMotionScene, Legend, StateLine } from '../../../components/scene/Scene';
import { useI18n } from '../../../i18n/I18n';
import { OFFENSE, DEFENSE } from '../formations';

// "How fouls work" (basic lesson). Every visual is illustrative (research/nfl/04-common-fouls.md).
// The common fouls themselves live in common.jsx.

const byGroup = (list, ...groups) => list.filter((p) => groups.includes(p.group));

function TeamsLegend() {
  const { t } = useI18n();
  return <Legend strong items={[{ swatch: 'team-off', label: t('nfl.common.offense') }, { swatch: 'team-def', label: t('nfl.common.defense') }]} />;
}
/* ================= How fouls work (basic lesson): the mechanism only ================= */

/** 1. A play, then the yellow flag lands. */
export function FlagVisual({ replay }) {
  const { t } = useI18n();
  const los = fx(35);
  const ol = byGroup(OFFENSE, 'ol');
  const dl = byGroup(DEFENSE, 'dl');
  return (
    <FluidScene duration={2600} replay={replay} header={<TeamsLegend />}>
      {(t1) => (
        <Field view={[fx(20), fx(52)]} viewY={[MID_Y - 10, MID_Y + 10]}>
          <FieldLine x={los} kind="los" />
          {dl.map((p, n) => <Player key={`d${n}`} x={los + p.dx} y={p.y} label="" side="def" />)}
          {ol.map((p, n) => <Player key={`o${n}`} x={los + p.dx} y={p.y} label="" side="off" />)}
          <Player x={los - 3.1} y={MID_Y} label="" side="off" />
          <Ball x={los - 0.3} y={MID_Y} />
          <PenaltyFlag x={los + 4} y={MID_Y - 4} fromX={los + 12} fromY={MID_Y - 10} p={seg(t1, 500, 1500)} />
          {t1 > 1500 && <UprightText x={los + 9} y={MID_Y - 7.6} className="tag tag-hl">{t('nfl.fouls.flagLanded')}</UprightText>}
        </Field>
      )}
    </FluidScene>
  );
}

/** 2. What the referee says on the microphone, part by part (example). */
export function AnnounceVisual({ replay }) {
  const { t, tm } = useI18n();
  const parts = tm('nfl.fouls.announce.parts');
  return (
    <StillScene header={<span className="scene-hint">🎙️ {t('nfl.fouls.announce.title')}</span>} footer={t('nfl.fouls.announce.example')}>
      <div className="announce" key={replay}>
        <p className="announce-quote">“{t('nfl.fouls.announce.quote')}”</p>
        <div className="announce-parts">
          {parts.map(([label, value], n) => (
            <div key={label} className="announce-part" style={{ animationDelay: `${200 + n * 130}ms` }}>
              <span>{label}</span><strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </StillScene>
  );
}

/**
 * 3 & 4. Before / after a penalty, as two stop-motion frames.
 * frames: [{ los, ltg, chip, caption, first, flag }] in yards from the offense's own goal line.
 */
function PenaltyFrames({ replay, frames }) {
  const { t } = useI18n();
  return (
    <StopMotionScene
      frames={frames.length}
      interval={2600}
      replay={replay}
      header={(i) => <StateLine chip={frames[i].chip} caption={frames[i].caption} highlight={frames[i].first} />}
      footer={<Legend items={[{ swatch: 'los', label: t('nfl.common.los') }, { swatch: 'ltg', label: t('nfl.common.ltg') }]} />}
    >
      {(i) => {
        const f = frames[i];
        const prev = frames[0];
        return (
          <Field view={[fx(8), fx(66)]} viewY={[MID_Y - 11, MID_Y + 11]}>
            {i > 0 && <line className="ghost-line" x1={fx(prev.los)} x2={fx(prev.los)} y1={0} y2={60} />}
            <FieldLine x={fx(f.los)} kind="los" />
            <FieldLine x={fx(f.ltg)} kind="ltg" />
            <g className="downs-ball" style={{ transform: `translate(${fx(f.los) - 0.8}px, ${MID_Y}px)` }}>
              <g transform="scale(1.8)"><Ball x={0} y={0} /></g>
            </g>
            {f.flag && <PenaltyFlag x={fx(f.los) + 4} y={MID_Y + 5} />}
            {i > 0 && (
              <UprightText x={(fx(prev.los) + fx(f.los)) / 2} y={MID_Y - 6} className="tag tag-hl" style={{ fontSize: 2.6 }}>
                {f.los > prev.los ? `+${f.los - prev.los}` : `−${prev.los - f.los}`}
              </UprightText>
            )}
          </Field>
        );
      }}
    </StopMotionScene>
  );
}

function useDownText() {
  const { t, tm } = useI18n();
  return (down, togo, spot) => `${t('nfl.common.downDist', { down: tm('nfl.common.downs')[down - 1], togo })} · ${t('nfl.common.ownSide', { n: spot })}`;
}

export function OffenseFoulVisual({ replay }) {
  const { t } = useI18n();
  const dd = useDownText();
  return (
    <PenaltyFrames
      replay={replay}
      frames={[
        { los: 30, ltg: 40, chip: dd(1, 10, 30), caption: t('nfl.fouls.offFoulBefore'), flag: true },
        { los: 20, ltg: 40, chip: dd(1, 20, 20), caption: t('nfl.fouls.offFoulAfter') },
      ]}
    />
  );
}

export function DefenseFoulVisual({ replay }) {
  const { t } = useI18n();
  const dd = useDownText();
  return (
    <PenaltyFrames
      replay={replay}
      frames={[
        { los: 40, ltg: 48, chip: dd(3, 8, 40), caption: t('nfl.fouls.defFoulBefore'), flag: true },
        { los: 45, ltg: 55, chip: dd(1, 10, 45), caption: t('nfl.fouls.defFoulAfter'), first: true },
      ]}
    />
  );
}

/** Declining a penalty: the play gained more than the penalty would. */
export function DeclineVisual({ replay }) {
  const { t } = useI18n();
  const los = fx(30);
  const play = fx(60);
  const pen = fx(40);
  return (
    <StillScene
      header={<Legend strong items={[{ swatch: 'team-off', label: t('nfl.common.offense') }]} />}
      footer={(
        <div className="decline-opts">
          <div className="decline-opt"><b>{t('nfl.fouls.decline.accept')}</b></div>
          <div className="decline-opt is-best"><b>{t('nfl.fouls.decline.reject')}</b> ✓</div>
        </div>
      )}
    >
      <Field view={[fx(20), fx(68)]} viewY={[MID_Y - 11, MID_Y + 11]} key={replay}>
        <FieldLine x={los} kind="los" />
        <path className="trail" d={`M${los} ${MID_Y + 2} L${play} ${MID_Y + 2}`} />
        <line className="marker is-on" x1={pen} x2={pen} y1={MID_Y - 9} y2={MID_Y + 9} />
        <UprightText x={pen} y={MID_Y - 7} className="tag tag-hl" style={{ fontSize: 1.8 }}>{t('nfl.fouls.decline.penalty')}</UprightText>
        <g transform={`translate(${play} ${MID_Y + 2}) scale(1.8)`}><Ball x={0} y={0} /></g>
        <UprightText x={play} y={MID_Y - 3} className="tag tag-off" style={{ fontSize: 2 }}>{t('nfl.fouls.decline.play')}</UprightText>
        <PenaltyFlag x={los + 6} y={MID_Y + 7} />
      </Field>
    </StillScene>
  );
}

/** 5. Offense foul vs defense foul, side by side. */
export function FoulMechanismSummaryVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene>
      <div className="foul-sides" key={replay}>
        {['off', 'def'].map((side, n) => (
          <section key={side} className={`foul-side-card ${side}`} style={{ animationDelay: `${n * 150}ms` }}>
            <strong>{t(`nfl.fouls.sum.${side}.title`)}</strong>
            <p><b>{t('nfl.fouls.sum.yards')}</b> {t(`nfl.fouls.sum.${side}.yards`)}</p>
            <p><b>{t('nfl.fouls.sum.down')}</b> {t(`nfl.fouls.sum.${side}.down`)}</p>
          </section>
        ))}
      </div>
    </StillScene>
  );
}

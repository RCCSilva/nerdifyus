import Field from '../../../components/field/Field';
import { Player, Ball, FieldLine } from '../../../components/field/pieces';
import { fx, MID_Y, WIDTH } from '../../../components/field/geometry';
import { seg, along } from '../../../components/field/motion';
import { StillScene, FluidScene, Legend } from '../../../components/scene/Scene';
import { useI18n } from '../../../i18n/I18n';
import './tactics.css';

// Pass coverage (research/nfl/07-defense-tactics.md). ONE illustrative play, the same four routes each
// time, so man, zone and match can be compared. Positions, routes and zones are illustrative.

const L = fx(40); // line of scrimmage; the offense moves right
const DUR = 3400;
const routeP = (t) => seg(t, 300, 2900);

const RECEIVERS = [
  { id: 'WR', route: [[L - 1, 7], [L + 35, 7]] }, // go (deep, beyond the deep zone)
  { id: 'WR', route: [[L - 1, 11], [L + 4, 11], [L + 9, 21]] }, // slant from the flat into the hook area
  { id: 'TE', route: [[L - 1, 31], [L + 3, 31], [L + 7, 39]] }, // out to the flat
  { id: 'WR', route: [[L - 1, 45], [L + 14, 45], [L + 11.5, 43]] }, // curl
];
const recAt = (n, t) => along(RECEIVERS[n].route, routeP(t));

// Cover-3-style zones: three deep thirds and four underneath areas. [x0, x1, y0, y1]
const ZONES = {
  deepTop: [L + 13, L + 27, 0, WIDTH / 3],
  deepMid: [L + 13, L + 27, WIDTH / 3, (2 * WIDTH) / 3],
  deepBot: [L + 13, L + 27, (2 * WIDTH) / 3, WIDTH],
  flatTop: [L + 1, L + 12, 0, 14],
  hookTop: [L + 1, L + 12, 14, MID_Y],
  hookBot: [L + 1, L + 12, MID_Y, 39],
  flatBot: [L + 1, L + 12, 39, WIDTH],
};
const centre = ([x0, x1, y0, y1]) => [(x0 + x1) / 2, (y0 + y1) / 2];
const inside = ([x, y], [x0, x1, y0, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
const clamp = ([x, y], [x0, x1, y0, y1], pad = 1) => [Math.min(Math.max(x, x0 + pad), x1 - pad), Math.min(Math.max(y, y0 + pad), y1 - pad)];

// The seven coverage defenders: start spot, man assignment (receiver index or null), zone.
const DEFENDERS = [
  { id: 'CB', start: [L + 6, 7], man: 0, zone: 'deepTop' },
  { id: 'NB', start: [L + 5, 11], man: 1, zone: 'flatTop' },
  { id: 'LB', start: [L + 5, 24], man: null, zone: 'hookTop' },
  { id: 'LB', start: [L + 5, 30], man: 2, zone: 'hookBot' },
  { id: 'SS', start: [L + 9, 37], man: null, zone: 'flatBot' },
  { id: 'CB', start: [L + 6, 45], man: 3, zone: 'deepBot' },
  { id: 'FS', start: [L + 15, MID_Y], man: null, zone: 'deepMid' },
];
const DL = [-1.5, -0.5, 0.5, 1.5].map((k) => [L + 1.4, MID_Y + k * 2.4]);
const OL = [-2, -1, 0, 1, 2].map((k) => [L - 1, MID_Y + k * 2.1]);

const shadow = ([x, y]) => [x + 1.6, y + 0.9]; // a defender covering a receiver sits just beside him

/** Zone defender: drop to the area, then squeeze toward any receiver inside it. */
function zonePos(d, t) {
  const z = ZONES[d.zone];
  const drop = along([d.start, centre(z)], seg(t, 300, 1300));
  const target = RECEIVERS.map((_, n) => recAt(n, t)).find((r) => inside(r, z));
  if (!target || t < 1300) return drop;
  return along([drop, clamp(shadow(target), z)], seg(t, 1300, 2300));
}

/** Man defender: mirror the assigned receiver; unassigned ones stay deep or watch the middle. */
function manPos(d, t) {
  if (d.man === null) return d.id === 'FS' ? along([d.start, [L + 20, MID_Y]], seg(t, 300, 1500)) : d.start;
  return shadow(recAt(d.man, Math.max(0, t - 180)));
}

// Match: start like zone; then, by rule, the deep corner CARRIES the vertical receiver like man, and the
// slant that leaves the nickel's area is PASSED to the linebacker whose area it enters.
const MATCH_RULES = {
  0: { from: 1100, receiver: 0 }, // CB carries the go route
  2: { from: 1500, receiver: 1 }, // LB takes the slant passed from the nickel
};
function matchPos(d, n, t) {
  const rule = MATCH_RULES[n];
  if (!rule || t < rule.from) return zonePos(d, t);
  const from = zonePos(d, rule.from);
  return along([from, shadow(recAt(rule.receiver, t))], seg(t, rule.from, rule.from + 500));
}

function CoveragePlay({ kind, t }) {
  const showZones = kind !== 'man';
  return (
    <Field view={[fx(30), fx(78)]} viewY={[0.5, WIDTH - 0.5]}>
      {showZones && Object.entries(ZONES).map(([k, [x0, x1, y0, y1]]) => (
        <rect key={k} className={`cov-zone ${k.startsWith('deep') ? 'is-deep' : ''}`} x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={0.6} />
      ))}
      <FieldLine x={L} kind="los" />
      {OL.map(([x, y], n) => <Player key={`ol${n}`} x={x} y={y} label="" side="off" dim />)}
      {DL.map(([x, y], n) => <Player key={`dl${n}`} x={x} y={y} label="" side="def" dim />)}
      <Player x={L - 4} y={MID_Y} label="QB" side="off" />
      <Ball x={L - 3.1} y={MID_Y - 1} />
      {kind === 'man' && DEFENDERS.map((d, n) => (d.man === null ? null : (() => {
        const [dx, dy] = manPos(d, t);
        const [rx, ry] = recAt(d.man, t);
        return <line key={`ml${n}`} className="cov-link" x1={dx} y1={dy} x2={rx} y2={ry} />;
      })()))}
      {kind === 'match' && Object.entries(MATCH_RULES).map(([n, r]) => (t < r.from ? null : (() => {
        const [dx, dy] = matchPos(DEFENDERS[n], Number(n), t);
        const [rx, ry] = recAt(r.receiver, t);
        return <line key={`mm${n}`} className="cov-link" x1={dx} y1={dy} x2={rx} y2={ry} />;
      })()))}
      {RECEIVERS.map((r, n) => {
        const [x, y] = recAt(n, t);
        return <Player key={`r${n}`} x={x} y={y} label={r.id} side="off" size={1.15} />;
      })}
      {DEFENDERS.map((d, n) => {
        const [x, y] = kind === 'man' ? manPos(d, t) : kind === 'zone' ? zonePos(d, t) : matchPos(d, n, t);
        const active = kind === 'match' && MATCH_RULES[n] && t >= MATCH_RULES[n].from;
        return <Player key={`d${n}`} x={x} y={y} label={d.id} side="def" size={1.15} active={active} />;
      })}
    </Field>
  );
}

function CoverageScene({ kind, replay }) {
  const { t } = useI18n();
  const items = [
    { swatch: 'team-off', label: t('nfl.tactics.receivers') },
    { swatch: 'team-def', label: t('nfl.tactics.defenders') },
  ];
  const foot = [
    ...(kind !== 'zone' ? [{ swatch: 'cov-link', label: t('nfl.tactics.following') }] : []),
    ...(kind !== 'man' ? [{ swatch: 'cov-zone', label: t('nfl.tactics.zoneArea') }] : []),
  ];
  return (
    <FluidScene
      duration={DUR}
      replay={`${kind}-${replay}`}
      header={<Legend strong items={items} />}
      footer={(time) => (
        <>
          <Legend items={foot} />
          {kind === 'match' && time >= 1100 && <span className="cov-rule">{t('nfl.tactics.matchRule')}</span>}
        </>
      )}
    >
      {(time) => <CoveragePlay kind={kind} t={time} />}
    </FluidScene>
  );
}

export const ManCoverageVisual = (props) => <CoverageScene kind="man" {...props} />;
export const ZoneCoverageVisual = (props) => <CoverageScene kind="zone" {...props} />;
export const MatchCoverageVisual = (props) => <CoverageScene kind="match" {...props} />;

/** The three families at a glance. */
export function CoverageFamiliesVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene>
      <div className="cov-cards" key={replay}>
        {['man', 'zone', 'match'].map((k, n) => (
          <section key={k} className={`cov-card cov-card-${k}`} style={{ animationDelay: `${n * 140}ms` }}>
            <strong>{t(`nfl.tactics.family.${k}.name`)}</strong>
            <p>{t(`nfl.tactics.family.${k}.what`)}</p>
          </section>
        ))}
      </div>
    </StillScene>
  );
}

/** Man coverage usage, 2025 (S27). */
export function CoverageTodayVisual({ replay }) {
  const { t } = useI18n();
  const bars = [
    { label: t('nfl.tactics.today.past'), pct: 34, note: '>⅓' },
    { label: t('nfl.tactics.today.league2025'), pct: 22.6 },
    { label: t('nfl.tactics.today.browns2025'), pct: 45.1 },
  ];
  return (
    <StillScene header={<span>{t('nfl.tactics.today.title')}</span>} footer={t('nfl.tactics.today.note')}>
      <div className="cov-bars" key={replay}>
        {bars.map((b, n) => (
          <div key={b.label} className="cov-bar">
            <span>{b.label}</span>
            <span className="cov-bar-track"><i style={{ width: `${b.pct * 1.8}%`, animationDelay: `${n * 150}ms` }} /></span>
            <b>{b.note ?? `${String(b.pct).replace('.', t('nfl.tactics.decimal'))}%`}</b>
          </div>
        ))}
      </div>
    </StillScene>
  );
}


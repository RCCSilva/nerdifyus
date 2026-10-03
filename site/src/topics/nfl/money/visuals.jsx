import { useI18n } from '../../../i18n/I18n';
import { StillScene, StopMotionScene, Legend, StateLine } from '../../../components/scene/Scene';
import './money.css';

// Trades, tags and the salary cap (research/nfl/09-trades.md, 10-tags.md, 12-salary-cap.md).
// Rules from the 2020 CBA (S33); 2026 figures from S34–S37. Contract examples are ILLUSTRATIVE,
// except Lamar Jackson's (research/nfl/14-contracts.md).

/** "$301.2M" / "US$ 301,2 mi" in the visitor's language. */
function useMoney() {
  const { locale, t } = useI18n();
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  return (millions) => t('nfl.money.m', { n: nf.format(millions) });
}

/** Horizontal bars: rows of { label, value, tone }, scaled to `max`. */
function Bars({ rows, max, fmt, wide = false }) {
  return (
    <div className={`m-bars ${wide ? 'is-wide' : ''}`}>
      {rows.map((r, n) => (
        <div key={r.label} className="m-bar">
          <span className="m-bar-label">{r.label}</span>
          <span className="m-bar-track">
            <i className={`tone-${r.tone ?? 'a'}`} style={{ width: `${(r.value / max) * 100}%`, animationDelay: `${n * 90}ms` }} />
          </span>
          <b>{fmt(r.value)}</b>
        </div>
      ))}
    </div>
  );
}

/* ================= Trades ================= */

export function TradeWhatVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene>
      <div className="trade" key={replay}>
        <div className="trade-team">{t('nfl.money.teamA')}</div>
        <div className="trade-goods">
          <span className="trade-chip go-right">🏈 {t('nfl.money.aPlayer')} →</span>
          <span className="trade-chip go-left">← 🎟️ {t('nfl.money.aPick')}</span>
        </div>
        <div className="trade-team">{t('nfl.money.teamB')}</div>
      </div>
    </StillScene>
  );
}

export function TradeWindowVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene footer={<Legend items={[{ swatch: 'win-open', label: t('nfl.money.open') }, { swatch: 'win-closed', label: t('nfl.money.closed') }]} />}>
      <div className="window" key={replay}>
        <div className="window-bar">
          <span className="win-open" style={{ flexGrow: 8 }}>{t('nfl.money.leagueYearStart')}</span>
          <span className="win-closed" style={{ flexGrow: 4 }}>{t('nfl.money.deadline')}</span>
        </div>
        <div className="window-marks">
          <span>{t('nfl.money.march')}</span>
          <span>{t('nfl.money.nov10')}</span>
          <span>{t('nfl.money.marchNext')}</span>
        </div>
      </div>
    </StillScene>
  );
}

/* ================= Tags ================= */

const TAGS = ['nonExclusive', 'exclusive', 'transition'];
const TAG_ROWS = ['salary', 'talk', 'leave'];

/** The three tags side by side; `focus` highlights one column. */
function TagTable({ focus, replay }) {
  const { t } = useI18n();
  return (
    <StillScene footer={t('nfl.money.tagFoot')}>
      <div className="tag-table-wrap" key={replay}>
        <table className="tag-table">
          <thead>
            <tr>
              <th />
              {TAGS.map((k) => <th key={k} className={focus && focus !== k ? 'is-dim' : focus === k ? 'is-focus' : ''}>{t(`nfl.money.tag.${k}.name`)}</th>)}
            </tr>
          </thead>
          <tbody>
            {TAG_ROWS.map((r) => (
              <tr key={r}>
                <th>{t(`nfl.money.tagRow.${r}`)}</th>
                {TAGS.map((k) => (
                  <td key={k} className={focus && focus !== k ? 'is-dim' : focus === k ? 'is-focus' : ''}>{t(`nfl.money.tag.${k}.${r}`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StillScene>
  );
}

export const TagWhatVisual = (p) => <TagTable {...p} />;
export const TagNonExclusiveVisual = (p) => <TagTable focus="nonExclusive" {...p} />;
export const TagExclusiveVisual = (p) => <TagTable focus="exclusive" {...p} />;
export const TagTransitionVisual = (p) => <TagTable focus="transition" {...p} />;

// 2026 values in $ millions (S37): [position key, franchise (non-exclusive), transition]
const TAG_2026 = [
  ['QB', 43.895, 37.833], ['WR', 27.298, 23.852], ['DT', 27.127, 22.521], ['LB', 26.865, 21.925],
  ['OL', 25.773, 23.392], ['DE', 24.434, 21.512], ['CB', 21.161, 18.119], ['S', 20.149, 16.012],
  ['TE', 15.045, 12.687], ['RB', 14.293, 11.323], ['KP', 6.649, 6.005],
];

export function TagValuesVisual({ replay }) {
  const { t } = useI18n();
  const money = useMoney();
  return (
    <StillScene
      header={<Legend strong items={[{ swatch: 'tone-a', label: t('nfl.money.tag.nonExclusive.name') }, { swatch: 'tone-b', label: t('nfl.money.tag.transition.name') }]} />}
      footer={t('nfl.money.tagValuesFoot')}
    >
      <div className="tag-values" key={replay}>
        {TAG_2026.map(([pos, fr, tr], n) => (
          <div key={pos} className="tag-value">
            <span className="tag-pos">{t(`nfl.money.pos.${pos}`)}</span>
            <span className="tag-bars">
              <i className="tone-a" style={{ width: `${(fr / 44) * 100}%`, animationDelay: `${n * 50}ms` }} />
              <i className="tone-b" style={{ width: `${(tr / 44) * 100}%`, animationDelay: `${n * 50 + 25}ms` }} />
            </span>
            <span className="tag-nums"><b>{money(fr)}</b><small>{money(tr)}</small></span>
          </div>
        ))}
      </div>
    </StillScene>
  );
}

/* ================= Salary cap ================= */

export function CapWhatVisual({ replay }) {
  const { t } = useI18n();
  const money = useMoney();
  return (
    <StillScene header={<span>{t('nfl.money.capLine', { cap: money(301.2) })}</span>}>
      <div className="cap-what" key={replay}>
        {['A', 'B', 'C', 'D'].map((team, n) => {
          const fill = [92, 99, 81, 96][n];
          return (
            <div key={team} className="cap-team">
              <span className="cap-team-bar"><i style={{ height: `${fill}%`, animationDelay: `${n * 120}ms` }} /></span>
              <small>{t('nfl.money.teamX', { x: team })}</small>
            </div>
          );
        })}
        <span className="cap-limit" aria-hidden="true" />
      </div>
    </StillScene>
  );
}

export function CapGrowthVisual({ replay }) {
  const money = useMoney();
  return (
    <StillScene>
      <div key={replay}>
        <Bars max={310} fmt={money} rows={[
          { label: '2022', value: 208.2 }, { label: '2024', value: 255.4 },
          { label: '2025', value: 279.2 }, { label: '2026', value: 301.2, tone: 'b' },
        ]} />
      </div>
    </StillScene>
  );
}

export function CapShareVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene footer={t('nfl.money.shareFoot')}>
      <div className="share" key={replay}>
        <div className="share-bar">
          <span className="share-players" style={{ width: '48.25%' }}>{t('nfl.money.playersShare')}</span>
          <span className="share-rest">{t('nfl.money.rest')}</span>
        </div>
        <ul className="share-buckets">
          {['media', 'ventures', 'local'].map((k) => <li key={k}>{t(`nfl.money.bucket.${k}`)}</li>)}
        </ul>
      </div>
    </StillScene>
  );
}

export function CapFloorVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene>
      <div className="floor" key={replay}>
        {[['floorTeam', 90], ['floorLeague', 95]].map(([k, pct]) => (
          <div key={k} className="floor-row">
            <strong>{t(`nfl.money.${k}`)}</strong>
            <div className="floor-bar">
              <i style={{ width: `${pct}%` }} />
              <span className="floor-mark" style={{ left: `${pct}%` }}>{pct}%</span>
              <span className="floor-mark is-cap" style={{ left: '100%' }}>{t('nfl.money.cap')}</span>
            </div>
          </div>
        ))}
        <p>{t('nfl.money.floorText')}</p>
      </div>
    </StillScene>
  );
}

/** Signing bonus: paid now in cash, spread over up to 5 years on the cap. */
export function CapBonusVisual({ replay }) {
  const { t } = useI18n();
  const money = useMoney();
  return (
    <StillScene footer={<Legend items={[{ swatch: 'tone-b', label: t('nfl.money.cash') }, { swatch: 'tone-a', label: t('nfl.money.onCap') }]} />}>
      <div className="years" key={replay}>
        {[['cash', [25, 0, 0, 0, 0], 'tone-b'], ['cap', [5, 5, 5, 5, 5], 'tone-a']].map(([k, vals, tone]) => (
          <div key={k} className="years-row">
            <span className="years-label">{t(`nfl.money.${k === 'cash' ? 'cashRow' : 'capRow'}`)}</span>
            <span className="years-cells">
              {vals.map((v, y) => (
                <span key={y} className={`year-cell ${v ? tone : 'is-empty'}`}>
                  <small>{t('nfl.money.yearN', { n: y + 1 })}</small>
                  {v ? money(v) : '—'}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </StillScene>
  );
}

/** Dead money: release after 2 seasons, before vs after June 1. */
export function CapDeadVisual({ replay }) {
  const { t } = useI18n();
  const money = useMoney();
  const frames = [
    { chip: t('nfl.money.deadF0'), caption: t('nfl.money.deadF0How'), vals: [5, 5, 5, 5, 5], dead: [] },
    { chip: t('nfl.money.deadF1'), caption: t('nfl.money.deadF1How'), vals: [5, 5, 15, 0, 0], dead: [3] },
    { chip: t('nfl.money.deadF2'), caption: t('nfl.money.deadF2How'), vals: [5, 5, 5, 10, 0], dead: [3, 4] },
  ];
  return (
    <StopMotionScene
      frames={3}
      interval={2800}
      replay={replay}
      header={(i) => <StateLine chip={frames[i].chip} caption={frames[i].caption} highlight={i > 0} />}
      footer={<Legend items={[{ swatch: 'tone-past', label: t('nfl.money.alreadyCounted') }, { swatch: 'tone-a', label: t('nfl.money.onCap') }, { swatch: 'tone-dead', label: t('nfl.money.dead') }]} />}
    >
      {(i) => (
        <div className="years">
          <div className="years-row">
            <span className="years-label">{t('nfl.money.capRow')}</span>
            <span className="years-cells">
              {frames[i].vals.map((v, y) => {
                const yr = y + 1;
                const tone = !v ? 'is-empty' : frames[i].dead.includes(yr) ? 'tone-dead' : i > 0 && yr <= 2 ? 'tone-past' : 'tone-a';
                return (
                  <span key={y} className={`year-cell ${tone}`}>
                    <small>{t('nfl.money.yearN', { n: yr })}</small>
                    {v ? money(v) : '—'}
                  </span>
                );
              })}
            </span>
          </div>
        </div>
      )}
    </StopMotionScene>
  );
}

export function CapCarryVisual({ replay }) {
  const { t } = useI18n();
  const money = useMoney();
  return (
    <StillScene footer={t('nfl.money.carryFoot')}>
      <div className="carry" key={replay}>
        <div className="carry-year">
          <strong>{t('nfl.money.thisYear')}</strong>
          <span className="carry-bar"><i style={{ width: '93%' }} /><em style={{ width: '7%' }}>{money(20)}</em></span>
        </div>
        <div className="carry-arrow">↓ {t('nfl.money.carried')}</div>
        <div className="carry-year">
          <strong>{t('nfl.money.nextYear')}</strong>
          <span className="carry-bar"><i style={{ width: '100%' }} /><em className="is-extra" style={{ width: '7%' }}>+{money(20)}</em></span>
        </div>
      </div>
    </StillScene>
  );
}

/* ================= How contracts work (research/nfl/14-contracts.md) ================= */

const PARTS = ['salary', 'signing', 'roster', 'workout'];

/** The four parts of a contract and what each one pays for. */
export function ContractPartsVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene>
      <div className="parts" key={replay}>
        {PARTS.map((k, n) => (
          <div key={k} className="part" style={{ animationDelay: `${n * 90}ms` }}>
            <strong>{t(`nfl.money.parts.${k}.name`)}</strong>
            <p>{t(`nfl.money.parts.${k}.what`)}</p>
          </div>
        ))}
      </div>
    </StillScene>
  );
}

/** Lamar Jackson's 2023 deal: total value vs guaranteed vs guaranteed at signing (S51, S52). */
export function ContractGuaranteesVisual({ replay }) {
  const { t } = useI18n();
  const money = useMoney();
  return (
    <StillScene header={<StateLine chip={t('nfl.money.guar.who')} />}>
      <Bars
        key={replay}
        wide
        max={260}
        fmt={money}
        rows={[
          { label: t('nfl.money.guar.total'), value: 260, tone: 'past' },
          { label: t('nfl.money.guar.guaranteed'), value: 185, tone: 'b' },
          { label: t('nfl.money.guar.atSigning'), value: 135, tone: 'a' },
        ]}
      />
    </StillScene>
  );
}

/** LTBE vs NLTBE side by side. */
export function ContractIncentivesVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene>
      <div className="incent" key={replay}>
        {['ltbe', 'nltbe'].map((k) => (
          <div key={k} className={`incent-card is-${k}`}>
            <strong>{t(`nfl.money.incent.${k}.name`)}</strong>
            <span>{t(`nfl.money.incent.${k}.when`)}</span>
            <b>{t(`nfl.money.incent.${k}.now`)}</b>
            <small>{t(`nfl.money.incent.${k}.after`)}</small>
          </div>
        ))}
      </div>
    </StillScene>
  );
}

/** Restructure with 2 void years, then the contract ends (illustrative numbers, in $M). */
export function ContractRestructureVisual({ replay }) {
  const { t } = useI18n();
  const money = useMoney();
  // cells: [value, kind]; years 3–4 are void years. Total on the cap stays 40 in every frame.
  const frames = [
    [[20, 'a'], [20, 'a'], [0], [0]],
    [[8, 'a'], [24, 'a'], [4, 'void'], [4, 'void']],
    [[8, 'past'], [24, 'past'], [8, 'dead'], [0]],
  ];
  return (
    <StopMotionScene
      frames={3}
      interval={2800}
      replay={replay}
      header={(i) => <StateLine chip={t(`nfl.money.rs.f${i}`)} caption={t(`nfl.money.rs.f${i}How`)} highlight={i > 0} />}
      footer={<Legend items={[{ swatch: 'tone-past', label: t('nfl.money.alreadyCounted') }, { swatch: 'tone-a', label: t('nfl.money.onCap') }, { swatch: 'tone-void', label: t('nfl.money.rs.void') }, { swatch: 'tone-dead', label: t('nfl.money.dead') }]} />}
    >
      {(i) => (
        <div className="years">
          <div className="years-row">
            <span className="years-label">{t('nfl.money.capRow')}</span>
            <span className="years-cells is-4">
              {frames[i].map(([v, kind], y) => (
                <span key={y} className={`year-cell ${v ? `tone-${kind}` : 'is-empty'}`}>
                  <small>{t('nfl.money.yearN', { n: y + 1 })}{y >= 2 ? ' · void' : ''}</small>
                  {v ? money(v) : '—'}
                </span>
              ))}
            </span>
          </div>
        </div>
      )}
    </StopMotionScene>
  );
}

/** How a new deal is reported: years, total value, guaranteed (Lamar Jackson, S52). */
export function ContractWhatVisual({ replay }) {
  const { t } = useI18n();
  const money = useMoney();
  const items = [['years', '5'], ['total', money(260)], ['guaranteed', money(185)]];
  return (
    <StillScene header={<StateLine chip={t('nfl.money.what.who')} />}>
      <div className="deal" key={replay}>
        {items.map(([k, v], n) => (
          <div key={k} className={`deal-item ${k === 'guaranteed' ? 'is-key' : ''}`} style={{ animationDelay: `${n * 120}ms` }}>
            <b>{v}</b>
            <small>{t(`nfl.money.what.${k}`)}</small>
          </div>
        ))}
      </div>
    </StillScene>
  );
}

/** A guarantee that vests on a date: injury only at signing, full on the 5th day of the 2025 league year (S51). */
export function ContractDatesVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene header={<StateLine chip={t('nfl.money.dates.who')} />}>
      <div className="vest" key={replay}>
        {['s0', 's1'].map((k, n) => (
          <div key={k} className="vest-step" style={{ animationDelay: `${n * 250}ms` }}>
            <small>{t(`nfl.money.dates.${k}`)}</small>
            <span className={`vest-bar ${n ? 'is-full' : 'is-injury'}`}>{t(`nfl.money.dates.${k}How`)}</span>
          </div>
        ))}
      </div>
    </StillScene>
  );
}

/** Guaranteed at signing, as a share of the deal: Lamar Jackson vs Deshaun Watson (S51, S56). */
export function ContractWatsonVisual({ replay }) {
  const { t } = useI18n();
  const money = useMoney();
  const deals = [['Lamar Jackson · 2023', 260, 135], ['Deshaun Watson · 2022', 230, 230]];
  return (
    <StillScene footer={<Legend items={[{ swatch: 'tone-a', label: t('nfl.money.watson.atSigning') }, { swatch: 'tone-rest', label: t('nfl.money.watson.rest') }]} />}>
      <div className="share-deals" key={replay}>
        {deals.map(([who, total, sure]) => (
          <div key={who} className="share-deal">
            <strong>{who}</strong>
            <div className="share-deal-bar" style={{ width: `${(total / 260) * 100}%` }}>
              <i className="tone-a" style={{ width: `${(sure / total) * 100}%` }}>{money(sure)}</i>
              {sure < total && <em>{money(total - sure)}</em>}
            </div>
          </div>
        ))}
      </div>
    </StillScene>
  );
}

const MAHOMES_YEARS = Array.from({ length: 12 }, (_, n) => 2020 + n);

/** Mahomes: a 10-year extension through 2031, reworked in 2023 for 2023–2026 (S59, S60). */
export function ContractMahomesVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene>
      <div className="span" key={replay}>
        <small>{t('nfl.money.mahomes.span')}</small>
        <div className="span-years">
          {MAHOMES_YEARS.map((y) => (
            <span key={y} className={`span-year ${y >= 2023 && y <= 2026 ? 'is-redo' : ''}`}>{String(y).slice(2)}</span>
          ))}
        </div>
        <p className="span-redo">{t('nfl.money.mahomes.redo')}</p>
      </div>
    </StillScene>
  );
}

/** Cash vs cap hit in year 1: $10M salary + $25M signing bonus over 5 years (illustrative). */
export function CapHitVisual({ replay }) {
  const { t } = useI18n();
  const money = useMoney();
  const rows = [['cash', 10, 25], ['cap', 10, 5]];
  return (
    <StillScene footer={<Legend items={[{ swatch: 'tone-a', label: t('nfl.money.hit.salary') }, { swatch: 'tone-b', label: t('nfl.money.hit.bonus') }]} />}>
      <div className="hit" key={replay}>
        {rows.map(([k, salary, bonus]) => (
          <div key={k} className="hit-row">
            <span className="hit-label">{t(`nfl.money.hit.${k}`)}</span>
            <div className="hit-bar" style={{ width: `${((salary + bonus) / 35) * 100}%` }}>
              <i className="tone-a" style={{ flex: salary }}>{money(salary)}</i>
              <i className="tone-b" style={{ flex: bonus }}>{money(bonus)}</i>
            </div>
            <b>{money(salary + bonus)}</b>
          </div>
        ))}
      </div>
    </StillScene>
  );
}

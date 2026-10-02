import { useI18n } from '../../../i18n/I18n';
import { StillScene, Legend } from '../../../components/scene/Scene';
import './draft.css';

// The draft (research/nfl/08-draft.md). Rules from S30; 2026 numbers from S31/S32.

const ROUNDS = [1, 2, 3, 4, 5, 6, 7];

/** 7 rounds × 32 picks, plus compensatory picks at the end of rounds 3–7. */
export function DraftBoardVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene
      header={<Legend strong items={[{ swatch: 'pick', label: t('nfl.draft.pick') }, { swatch: 'comp', label: t('nfl.draft.comp') }]} />}
      footer={t('nfl.draft.total2026')}
    >
      <div className="draft-board" key={replay}>
        {ROUNDS.map((r) => (
          <div key={r} className="draft-round" style={{ animationDelay: `${r * 90}ms` }}>
            <span className="draft-round-label">{t('nfl.draft.round', { n: r })}</span>
            <span className="draft-pips">
              {Array.from({ length: 32 }, (_, n) => <i key={n} />)}
              {r >= 3 && <b className="draft-comp">+</b>}
            </span>
          </div>
        ))}
      </div>
    </StillScene>
  );
}

const SLOTS = [
  { key: 'missed', from: 1, to: 20 },
  { key: 'wildCard', from: 21, to: 24 },
  { key: 'divisional', from: 25, to: 28 },
  { key: 'conference', from: 29, to: 30 },
  { key: 'sbLoser', from: 31, to: 31 },
  { key: 'champion', from: 32, to: 32 },
];

/** Who picks where in every round. */
export function DraftOrderVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene footer={t('nfl.draft.order2026')}>
      <div className="draft-order" key={replay}>
        <div className="draft-slots">
          {SLOTS.flatMap((g) => Array.from({ length: g.to - g.from + 1 }, (_, n) => (
            <span key={g.from + n} className={`draft-slot s-${g.key}`} title={String(g.from + n)}>{g.from + n === 1 || g.from + n === 32 ? g.from + n : ''}</span>
          )))}
        </div>
        <ul className="draft-groups">
          {SLOTS.map((g, n) => (
            <li key={g.key} style={{ animationDelay: `${n * 100}ms` }}>
              <i className={`draft-slot s-${g.key}`} />
              <b>{g.from === g.to ? g.from : `${g.from}–${g.to}`}</b>
              <span>{t(`nfl.draft.slots.${g.key}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </StillScene>
  );
}

/** Minutes per pick, by round. */
export function DraftClockVisual({ replay }) {
  const { t } = useI18n();
  const rows = [['1', 8], ['2', 7], ['3–6', 5], ['7', 4]];
  return (
    <StillScene header={<span>⏱ {t('nfl.draft.clockTitle')}</span>}>
      <div className="draft-clock" key={replay}>
        {rows.map(([r, min], n) => (
          <div key={r} className="draft-clock-row">
            <span>{t('nfl.draft.roundShort', { n: r })}</span>
            <span className="draft-clock-track"><i style={{ width: `${(min / 8) * 100}%`, animationDelay: `${n * 120}ms` }} /></span>
            <b>{min} min</b>
          </div>
        ))}
      </div>
    </StillScene>
  );
}

/** Compensatory picks, with the real 2026 numbers. */
export function DraftCompVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene>
      <div className="draft-facts" key={replay}>
        {['why', 'where', 'how'].map((k, n) => (
          <div key={k} className="draft-fact" style={{ animationDelay: `${n * 120}ms` }}>
            <strong>{t(`nfl.draft.compFacts.${k}.title`)}</strong>
            <p>{t(`nfl.draft.compFacts.${k}.text`)}</p>
          </div>
        ))}
        <div className="draft-fact is-real" style={{ animationDelay: '360ms' }}>
          <strong>{t('nfl.draft.compFacts.real.title')}</strong>
          <p>{t('nfl.draft.compFacts.real.text')}</p>
        </div>
      </div>
    </StillScene>
  );
}

/** Who can be drafted. */
export function DraftEligibilityVisual({ replay }) {
  const { t } = useI18n();
  return (
    <StillScene>
      <div className="draft-facts" key={replay}>
        {['years', 'early'].map((k, n) => (
          <div key={k} className="draft-fact" style={{ animationDelay: `${n * 140}ms` }}>
            <strong>{t(`nfl.draft.elig.${k}.title`)}</strong>
            <p>{t(`nfl.draft.elig.${k}.text`)}</p>
          </div>
        ))}
      </div>
    </StillScene>
  );
}

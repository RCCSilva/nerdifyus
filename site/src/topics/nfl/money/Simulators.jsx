import { useState } from 'react';
import { useI18n } from '../../../i18n/I18n';
import { StillScene, Legend } from '../../../components/scene/Scene';
import { contractYears, guaranteedTotal, capYears } from './contractMath';

// Two playgrounds: a contract (cash per year, what's guaranteed) and the same contract on the cap
// (cap hit vs cash, and what a release costs). Numbers are $ millions; the math is in contractMath.js.

function useMoney() {
  const { locale, t } = useI18n();
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  return (m) => t('nfl.money.m', { n: nf.format(Math.round(m * 10) / 10) });
}

/** Buttons where one option is on. */
function Choice({ label, options, value, onChange }) {
  return (
    <div className="sim-field">
      <span className="sim-label">{label}</span>
      <div className="sim-choice" role="group" aria-label={label}>
        {options.map(([v, text]) => (
          <button key={v} type="button" className={v === value ? 'is-on' : ''} aria-pressed={v === value} onClick={() => onChange(v)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Slider({ label, value, shown, min, max, step, onChange }) {
  return (
    <label className="sim-field">
      <span className="sim-label">{label} <b>{shown}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

/** Contract inputs shared by both simulators. */
function useContract() {
  const [years, setYears] = useState(4);
  const [total, setTotal] = useState(120);
  const [bonusPct, setBonusPct] = useState(25);
  const [shape, setShape] = useState('flat');
  const [gYears, setGYears] = useState(1);
  const contract = { years, total, bonus: (total * bonusPct) / 100, shape, guaranteedYears: Math.min(gYears, years) };
  const set = { setYears, setTotal, setBonusPct, setShape, setGYears };
  return { contract, bonusPct, set };
}

function ContractControls({ contract, bonusPct, set }) {
  const { t } = useI18n();
  const money = useMoney();
  const k = (key) => t(`nfl.money.sim.${key}`);
  return (
    <div className="sim-controls">
      <Choice label={k('years')} value={contract.years} onChange={set.setYears} options={[2, 3, 4, 5].map((n) => [n, String(n)])} />
      <Slider label={k('total')} shown={money(contract.total)} value={contract.total} min={20} max={300} step={10} onChange={set.setTotal} />
      <Slider label={k('bonus')} shown={`${bonusPct}% · ${money(contract.bonus)}`} value={bonusPct} min={0} max={50} step={5} onChange={set.setBonusPct} />
      <Choice label={k('shape')} value={contract.shape} onChange={set.setShape} options={['flat', 'front', 'back'].map((s) => [s, k(s)])} />
      <Choice
        label={k('gYears')}
        value={contract.guaranteedYears}
        onChange={set.setGYears}
        options={Array.from({ length: contract.years + 1 }, (_, n) => [n, n === 0 ? k('gNone') : String(n)])}
      />
    </div>
  );
}

/** Contracts lesson: build a deal, see the cash per year and what's guaranteed. */
export function ContractSimVisual() {
  const { t } = useI18n();
  const money = useMoney();
  const { contract, bonusPct, set } = useContract();
  const rows = contractYears(contract);
  const max = Math.max(...rows.map((r) => r.cash));
  const sure = guaranteedTotal(contract);
  const k = (key) => t(`nfl.money.sim.${key}`);
  return (
    <StillScene
      footer={<Legend items={[{ swatch: 'tone-b', label: k('bonusPart') }, { swatch: 'tone-a', label: k('salarySure') }, { swatch: 'tone-loose', label: k('salaryLoose') }]} />}
    >
      <div className="sim">
        <ContractControls contract={contract} bonusPct={bonusPct} set={set} />
        <div className="sim-cols" style={{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}>
          {rows.map((r, i) => {
            const bonus = i === 0 ? contract.bonus : 0;
            return (
              <div key={i} className="sim-col">
                <div className="sim-stack">
                  <i className={r.guaranteed ? 'tone-a' : 'tone-loose'} style={{ height: `${(r.salary / max) * 100}%` }} />
                  {bonus > 0 && <i className="tone-b" style={{ height: `${(bonus / max) * 100}%` }} />}
                </div>
                <b>{money(r.cash)}</b>
                <small>{t('nfl.money.yearN', { n: i + 1 })}</small>
              </div>
            );
          })}
        </div>
        <p className="sim-sum">
          <span>{k('totalLine')} <b>{money(contract.total)}</b></span>
          <span>{k('sureLine')} <b>{money(sure)}</b> ({Math.round((sure / contract.total) * 100)}%)</span>
        </p>
      </div>
    </StillScene>
  );
}

/** Cap lesson: the same deal, cash vs cap hit per year, and what a release does. */
export function CapSimVisual() {
  const { t } = useI18n();
  const money = useMoney();
  const { contract, bonusPct, set } = useContract();
  const [cut, setCut] = useState(0); // 0 = plays it out; else the year he's released before
  const [afterJune1, setAfterJune1] = useState(false);
  const year = cut > contract.years ? 0 : cut;
  const rows = capYears(contract, year ? { year, afterJune1 } : null);
  const plain = capYears(contract, null);
  const k = (key, v) => t(`nfl.money.sim.${key}`, v);
  const totals = { cash: rows.reduce((a, r) => a + r.cash, 0), cap: rows.reduce((a, r) => a + r.cap, 0) };
  return (
    <StillScene
      footer={<>
        <Legend items={[{ swatch: 'tone-b', label: k('cashRow') }, { swatch: 'tone-a', label: k('capRow') }, { swatch: 'tone-dead', label: t('nfl.money.dead') }]} />
        <small className="sim-fine">{k('simplified')}</small>
      </>}
    >
      <div className="sim">
        <ContractControls contract={contract} bonusPct={bonusPct} set={set} />
        <div className="sim-controls">
          <Choice
            label={k('release')}
            value={year}
            onChange={setCut}
            options={[[0, k('noRelease')], ...Array.from({ length: contract.years - 1 }, (_, n) => [n + 2, k('beforeYear', { n: n + 2 })])]}
          />
          {year > 0 && (
            <Choice label={k('when')} value={afterJune1} onChange={setAfterJune1} options={[[false, k('beforeJune')], [true, k('afterJune')]]} />
          )}
        </div>
        <div className="sim-table" style={{ gridTemplateColumns: `6.5rem repeat(${rows.length}, minmax(0, 1fr)) 4.6rem`, '--n': rows.length }}>
          <span />
          {rows.map((_, i) => <small key={i}>{t('nfl.money.yearN', { n: i + 1 })}</small>)}
          <small>{k('sum')}</small>
          <span className="sim-row-label">{k('cashRow')}</span>
          {rows.map((r, i) => <span key={i} className={`sim-cell ${r.cash ? 'tone-b' : 'is-empty'}`}>{money(r.cash)}</span>)}
          <b>{money(totals.cash)}</b>
          <span className="sim-row-label">{k('capRow')}</span>
          {rows.map((r, i) => <span key={i} className={`sim-cell ${r.dead ? 'tone-dead' : r.cap ? 'tone-a' : 'is-empty'}`}>{money(r.cap)}</span>)}
          <b>{money(totals.cap)}</b>
        </div>
        {year > 0 && (
          <p className="sim-sum">
            <span>{k('saved', { n: year, before: money(plain[year - 1].cap), after: money(rows[year - 1].cap) })}</span>
          </p>
        )}
      </div>
    </StillScene>
  );
}

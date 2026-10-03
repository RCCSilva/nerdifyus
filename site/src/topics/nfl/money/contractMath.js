// The math behind the contract and cap simulators ($ millions). Rules from the 2020 CBA (S33),
// simplified: no present value, no offsets, no incentives (research/nfl/14-contracts.md, 12-salary-cap.md).

const WEIGHTS = {
  flat: (n) => Array(n).fill(1),
  front: (n) => Array.from({ length: n }, (_, i) => n - i), // more early
  back: (n) => Array.from({ length: n }, (_, i) => i + 1), // more late
};

/** Base salary per year: what's left after the signing bonus, split by the chosen shape. */
export function salaries({ years, total, bonus, shape }) {
  const w = WEIGHTS[shape](years);
  const sum = w.reduce((a, b) => a + b, 0);
  return w.map((x) => ((total - bonus) * x) / sum);
}

/** One row per year: { salary, guaranteed, cash }. The first `guaranteedYears` salaries are fully guaranteed. */
export function contractYears(c) {
  return salaries(c).map((salary, i) => ({
    salary,
    guaranteed: i < c.guaranteedYears,
    cash: salary + (i === 0 ? c.bonus : 0), // the signing bonus is paid when he signs
  }));
}

/** Guaranteed money: the signing bonus plus the guaranteed salaries. */
export function guaranteedTotal(c) {
  return c.bonus + contractYears(c).filter((y) => y.guaranteed).reduce((a, y) => a + y.salary, 0);
}

/**
 * Cash and cap hit per year. `release` = { year, afterJune1 } cuts the player before the season of
 * that year (2..years), or null to play the contract out.
 * - Signing bonus: prorated evenly over the contract, up to 5 years (Art. 13 §6(b)(i)).
 * - Released before June 1: all the proration still to come counts that year (§6(b)(ii)(1)).
 *   After June 1 (or a post-June 1 designation): that year's share now, the rest the next year (§6(b)(ii)(1)–(2)).
 * - Guaranteed salary for the years after the release is still paid and counts at release (§6(d)(iv)).
 */
export function capYears(c, release) {
  const rows = contractYears(c);
  const share = c.bonus / Math.min(c.years, 5);
  const prorated = (i) => (i < 5 ? share : 0);
  const out = rows.map((y, i) => ({ cash: y.cash, cap: y.salary + prorated(i), dead: 0 }));
  if (!release) return out;
  const r = release.year - 1;
  const owed = rows.slice(r).filter((y) => y.guaranteed).reduce((a, y) => a + y.salary, 0);
  let later = 0;
  for (let i = r; i < rows.length; i += 1) {
    out[i].cash = rows[i].guaranteed ? rows[i].salary : 0;
    if (i > r) later += prorated(i);
    out[i].cap = 0;
  }
  out[r].dead = prorated(r) + owed + (release.afterJune1 ? 0 : later);
  if (release.afterJune1 && r + 1 < rows.length) out[r + 1].dead = later;
  for (let i = r; i < rows.length; i += 1) out[i].cap = out[i].dead;
  return out;
}

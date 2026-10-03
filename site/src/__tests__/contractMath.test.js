import { describe, it, expect } from 'vitest';
import { salaries, contractYears, guaranteedTotal, capYears } from '../topics/nfl/money/contractMath';

const base = { years: 5, total: 100, bonus: 25, shape: 'flat', guaranteedYears: 1 };
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

describe('contract math', () => {
  it('splits the salary by shape', () => {
    expect(salaries(base)).toEqual([15, 15, 15, 15, 15]);
    const front = salaries({ ...base, shape: 'front' });
    expect(front[0]).toBeGreaterThan(front[4]);
    expect(sum(front)).toBeCloseTo(75);
  });

  it('pays the bonus in year 1 and counts it as guaranteed', () => {
    expect(contractYears(base)[0].cash).toBe(40);
    expect(guaranteedTotal(base)).toBe(40);
  });

  it('prorates the bonus on the cap', () => {
    expect(capYears(base, null).map((y) => y.cap)).toEqual([20, 20, 20, 20, 20]);
  });

  it('accelerates everything before June 1', () => {
    const y = capYears(base, { year: 3, afterJune1: false });
    expect(y.map((r) => r.cap)).toEqual([20, 20, 15, 0, 0]);
    expect(y[2].dead).toBe(15);
  });

  it('splits it after June 1', () => {
    const y = capYears(base, { year: 3, afterJune1: true });
    expect(y.map((r) => r.cap)).toEqual([20, 20, 5, 10, 0]);
  });

  it('counts guaranteed salary at release and keeps cash = cap overall', () => {
    const c = { ...base, guaranteedYears: 4 };
    const y = capYears(c, { year: 3, afterJune1: false });
    expect(y[2].dead).toBe(15 + 30);
    expect(sum(y.map((r) => r.cash))).toBeCloseTo(sum(y.map((r) => r.cap)));
  });
});

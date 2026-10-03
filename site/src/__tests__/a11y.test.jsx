// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import App from '../App';
import { TOPICS } from '../topics/registry';

window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
window.scrollTo = () => Promise.resolve();

// Structural accessibility checks (names, roles, ARIA, landmarks) on every page and slide.
// Color contrast needs a real browser, so it's off here.
const RULES = { 'color-contrast': { enabled: false } };

async function audit(hash) {
  window.location.hash = hash;
  render(<App />);
  await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
  const res = await axe.run(document.body, { rules: RULES });
  cleanup();
  return res.violations.map((v) => `${hash} ${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
}

describe('accessibility (axe)', () => {
  afterEach(cleanup);
  const nfl = TOPICS[0];
  it('home and topic hub', async () => {
    expect([...(await audit('#/pt-BR')), ...(await audit('#/pt-BR/nfl'))]).toEqual([]);
  });
  nfl.lessons.filter((l) => l.slides).forEach((lesson) => {
    it(`lesson ${lesson.id}`, { timeout: 60000 }, async () => {
      const found = [];
      for (let i = 1; i <= lesson.slides.length; i += 1) found.push(...(await audit(`#/pt-BR/nfl/${lesson.id}?s=${i}`)));
      const uniq = [...new Set(found.map((f) => f.replace(/^\S+ /, '')))];
      if (uniq.length) console.log(lesson.id, JSON.stringify(uniq, null, 1));
      expect(uniq).toEqual([]);
    });
  });
});

// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import App from '../App';
import { BASICS_SLIDES } from '../topics/nfl/basics/slides';
import { FOULS_SLIDES } from '../topics/nfl/fouls/slides';

const DECKS = [['basics', BASICS_SLIDES], ['fouls', FOULS_SLIDES]];

// Behave like a real browser: motion ON, animation frames ticking.
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
// Like current Chrome: scrollTo returns a Promise (an effect must not return it).
window.scrollTo = () => Promise.resolve();

describe('switching language on every slide', () => {
  afterEach(cleanup);
  DECKS.forEach(([lesson, slides]) => slides.forEach((slide, i) => {
    it(`${lesson} slide ${i + 1} (${slide.id})`, async () => {
      const errors = [];
      const spy = vi.spyOn(console, 'error').mockImplementation((...a) => errors.push(a.join(' ')));
      window.location.hash = `#/en/nfl/${lesson}?s=${i + 1}`;
      render(<App />);
      await act(async () => { await new Promise((r) => setTimeout(r, 300)); });
      for (const code of ['ES', 'PT', 'EN']) {
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: code })); });
        await act(async () => { await new Promise((r) => setTimeout(r, 100)); });
      }
      spy.mockRestore();
      expect(errors.filter((e) => !e.includes('not wrapped in act'))).toEqual([]);
    });
  }));
});

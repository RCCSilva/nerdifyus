// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup, within } from '@testing-library/react';
import App from '../App';

window.scrollTo = () => Promise.resolve();
window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });

describe('topic sidebar', () => {
  afterEach(cleanup);

  it('lists every lesson and every slide, and jumps straight to a slide', async () => {
    window.location.hash = '#/en/nfl/basics?s=2';
    const { container } = render(<App />);
    const sidebar = await screen.findByRole('complementary', { name: 'Contents' });

    for (const lesson of ['How football works', 'Following a game', 'The positions', 'How fouls work', 'Ties & overtime', 'How the season works', 'Common fouls', 'Defensive tactics: pass coverage', 'Strategy', 'The salary cap']) {
      // A lesson title can also be a slide title (e.g. "The offense"), so allow several matches.
      expect(within(sidebar).getAllByText(lesson).length).toBeGreaterThan(0);
    }
    expect(within(sidebar).getAllByRole('link').filter((a) => a.href.includes('?s=')).length).toBe(107); // + 2 trades + 7 cap + 5 tags + 2 neutral zone fouls + 7 contracts + 4 cap + 2 touchdown

    // Open the (mobile) drawer, pick slide 8, and the drawer closes again.
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Contents/ })); });
    expect(container.querySelector('.topic-layout.is-open')).toBeTruthy();
    await act(async () => { fireEvent.click(within(sidebar).getByText('The goal: a touchdown (6 points)')); });
    expect(window.location.hash).toBe('#/en/nfl/basics?s=7');
    expect(await screen.findByRole('heading', { name: 'The goal: a touchdown (6 points)' })).toBeTruthy();
    expect(container.querySelector('.topic-layout.is-open')).toBeNull();
    expect(within(sidebar).getByText('The goal: a touchdown (6 points)').closest('a').getAttribute('aria-current')).toBe('step');
  });
});

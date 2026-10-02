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

    for (const lesson of ['How football works', 'Common fouls', 'Ties & overtime', 'Strategy', 'The salary cap']) {
      expect(within(sidebar).getByText(lesson)).toBeTruthy();
    }
    expect(within(sidebar).getAllByRole('link').filter((a) => a.href.includes('?s=')).length).toBe(24); // 17 basics + 7 fouls

    // Open the (mobile) drawer, pick slide 8, and the drawer closes again.
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Contents/ })); });
    expect(container.querySelector('.topic-layout.is-open')).toBeTruthy();
    await act(async () => { fireEvent.click(within(sidebar).getByText('Touchdown: 6 points')); });
    expect(window.location.hash).toBe('#/en/nfl/basics?s=8');
    expect(await screen.findByRole('heading', { name: 'Touchdown: 6 points' })).toBeTruthy();
    expect(container.querySelector('.topic-layout.is-open')).toBeNull();
    expect(within(sidebar).getByText('Touchdown: 6 points').closest('a').getAttribute('aria-current')).toBe('step');
  });
});

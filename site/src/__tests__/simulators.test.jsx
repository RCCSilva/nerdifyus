// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import App from '../App';

window.scrollTo = () => Promise.resolve();
window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });

describe('cap simulator', () => {
  afterEach(cleanup);

  it('shows dead money when the player is released', async () => {
    window.location.hash = '#/en/nfl/cap?s=9';
    const { container } = render(<App />);
    await screen.findByRole('heading', { name: 'Simulator: cash vs. cap hit' });
    expect(container.querySelector('.sim-cell.tone-dead')).toBeNull();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Before year 3' })); });
    // default deal: 4 years, $120M, 25% bonus ($30M → $7.5M a year), 1 guaranteed year → $15M accelerates
    expect(container.querySelector('.sim-cell.tone-dead').textContent).toBe('$15M');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'After June 1' })); });
    expect([...container.querySelectorAll('.sim-cell.tone-dead')].map((c) => c.textContent)).toEqual(['$7.5M', '$7.5M']);
  });
});

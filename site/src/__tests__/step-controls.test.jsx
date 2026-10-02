// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import App from '../App';

window.scrollTo = () => Promise.resolve();
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} }); // motion on

describe('step-by-step animation controls', () => {
  afterEach(cleanup);

  it('pauses, then steps forward and back by hand', async () => {
    window.location.hash = '#/en/nfl/basics?s=9'; // Downs 1 to 3
    render(<App />);
    await screen.findByText('Start: 1st & 10');

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Pause' })); });
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Next step' })); });
    expect(screen.getByText('Run: +4 yards')).toBeTruthy();

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Previous step' })); });
    expect(screen.getByText('Start: 1st & 10')).toBeTruthy();

    // Paused means paused: nothing advances on its own.
    await act(async () => { await new Promise((r) => setTimeout(r, 2600)); });
    expect(screen.getByText('Start: 1st & 10')).toBeTruthy();
  });
});

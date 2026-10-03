// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import App from '../App';

window.scrollTo = () => Promise.resolve();
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} }); // motion on

const click = (name) => act(async () => { fireEvent.click(screen.getByRole('button', { name })); });
const btn = (name) => screen.getByRole('button', { name });

describe('stop-motion scene', () => {
  afterEach(cleanup);

  it('shows the frame, disables back/forward at the ends, and never loops', async () => {
    window.location.hash = '#/en/nfl/basics?s=13'; // Downs 1 to 3: 3 frames
    render(<App />);
    await screen.findByText('Start: 1st & 10');
    expect(screen.getByText('Frame 1 of 3')).toBeTruthy();

    await click('Pause');
    expect(btn('Previous step').disabled).toBe(true); // nothing before the first frame

    await click('Next step');
    expect(screen.getByText('Run: +4 yards')).toBeTruthy();
    expect(screen.getByText('Frame 2 of 3')).toBeTruthy();
    expect(btn('Previous step').disabled).toBe(false);

    await click('Next step');
    expect(screen.getByText('Frame 3 of 3')).toBeTruthy();
    expect(btn('Next step').disabled).toBe(true); // nothing after the last frame

    await click('Previous step');
    await click('Previous step');
    expect(screen.getByText('Frame 1 of 3')).toBeTruthy(); // back stops at the first frame, no wrap-around

    // Paused means paused.
    await act(async () => { await new Promise((r) => setTimeout(r, 2600)); });
    expect(screen.getByText('Frame 1 of 3')).toBeTruthy();
  });
});

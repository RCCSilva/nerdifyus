// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import App from '../App';

// jsdom has no matchMedia / rAF timing we care about; keep animations at their end state.
window.scrollTo = () => Promise.resolve(); // current Chrome behaviour
window.matchMedia ??= () => ({ matches: true, addEventListener() {}, removeEventListener() {} });

describe('language switcher', () => {
  beforeEach(() => { window.location.hash = '#/en/nfl/basics?s=2'; });
  afterEach(cleanup);

  it('switches the slide text after the page has rendered', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'The field' })).toBeTruthy();

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'ES' })); });
    expect(window.location.hash).toBe('#/es/nfl/basics?s=2');
    expect(await screen.findByRole('heading', { name: 'El campo' })).toBeTruthy();

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'PT' })); });
    expect(window.location.hash).toBe('#/pt-BR/nfl/basics?s=2');
    expect(await screen.findByRole('heading', { name: 'O campo' })).toBeTruthy();
  });
});

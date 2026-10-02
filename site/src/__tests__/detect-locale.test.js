// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { detectLocale } from '../i18n/config';

const prefer = (...langs) => vi.spyOn(navigator, 'languages', 'get').mockReturnValue(langs);

describe('detectLocale', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it('uses the browser language, matching regional variants', () => {
    prefer('pt-BR'); expect(detectLocale()).toBe('pt-BR');
    prefer('pt-PT'); expect(detectLocale()).toBe('pt-BR');
    prefer('es-MX'); expect(detectLocale()).toBe('es');
    prefer('fr-FR', 'es-AR'); expect(detectLocale()).toBe('es'); // first supported one wins
  });

  it('falls back to English', () => {
    prefer('fr-FR', 'de'); expect(detectLocale()).toBe('en');
  });

  it('a language picked on the site wins over the browser', () => {
    prefer('pt-BR');
    localStorage.setItem('locale', 'es');
    expect(detectLocale()).toBe('es');
  });
});

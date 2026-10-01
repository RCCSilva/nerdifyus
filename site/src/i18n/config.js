// Supported languages. To add one:
//   1. add it here
//   2. add `<code>.js` next to every existing `en.js` under */messages/ (missing keys fall back to English)
export const LOCALES = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'es', name: 'Español', short: 'ES' },
  { code: 'pt-BR', name: 'Português (Brasil)', short: 'PT' },
];

export const DEFAULT_LOCALE = 'en';

export const isLocale = (code) => LOCALES.some((l) => l.code === code);

/** Best match for the visitor: saved choice → browser languages → default. */
export function detectLocale() {
  try {
    const saved = localStorage.getItem('locale');
    if (isLocale(saved)) return saved;
  } catch { /* storage unavailable */ }
  const prefs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  for (const pref of prefs) {
    if (isLocale(pref)) return pref;
    const base = pref?.split('-')[0];
    const match = LOCALES.find((l) => l.code.split('-')[0] === base);
    if (match) return match.code;
  }
  return DEFAULT_LOCALE;
}

import { createContext, useContext, useMemo } from 'react';
import { DEFAULT_LOCALE } from './config';

// Every `messages/<locale>.js` in the app, keyed by namespace = the folder that owns it.
//   src/i18n/messages/en.js            -> namespace "ui"
//   src/topics/nfl/messages/en.js      -> namespace "nfl"
const files = import.meta.glob(['./messages/*.js', '../topics/*/messages/*.js'], { eager: true, import: 'default' });

const catalog = {};
for (const [path, messages] of Object.entries(files)) {
  const locale = path.match(/([^/]+)\.js$/)[1];
  const ns = path.startsWith('./messages/') ? 'ui' : path.match(/topics\/([^/]+)\//)[1];
  (catalog[locale] ??= {})[ns] = messages;
}

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

const I18nContext = createContext(null);

export function I18nProvider({ locale, children }) {
  const value = useMemo(() => {
    /** Raw value at "ns.path" (strings, arrays, objects), falling back to English. */
    const tm = (path) => get(catalog[locale], path) ?? get(catalog[DEFAULT_LOCALE], path);
    /** String at "ns.path" with {placeholders} filled in. Missing keys render as the key. */
    const t = (path, vars) => {
      const s = tm(path);
      if (typeof s !== 'string') return path;
      return vars ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`) : s;
    };
    return { locale, t, tm };
  }, [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

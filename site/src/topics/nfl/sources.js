// Mirrors research/nfl/sources.md. Source titles stay in the original language (English).
export const SOURCES = {
  S1: {
    short: 'NFL Rulebook 2026',
    title: '2026 NFL Rulebook (official PDF)',
    url: 'https://static.www.nfl.com/image/upload/fl_attachment/league/tqivdkzt9mu6wdgsh1ku.pdf',
    page: (p) => `#page=${p}`,
  },
  S2: {
    short: 'NFL Football Terms',
    title: 'NFL Football Operations — Football Terms',
    url: 'https://operations.nfl.com/rules-officiating/nfl-football-basics/football-terms',
  },
  S3: {
    short: 'NFL Formations',
    title: 'NFL Football Operations — Formations',
    url: 'https://operations.nfl.com/rules-officiating/nfl-football-basics/formations',
  },
  S4: {
    short: 'IFAB Laws of the Game (soccer)',
    title: 'IFAB Laws of the Game 2026/27 — Law 10, The Outcome of a Match',
    url: 'https://www.theifab.com/laws/latest/determining-the-outcome-of-a-match/',
  },
  S5: {
    short: 'NIST (yards → meters)',
    title: 'NIST — SI Units: Length (1 inch = 25.4 mm exactly)',
    url: 'https://www.nist.gov/pml/owm/si-units-length',
  },
  S6: {
    short: 'Wikipedia · Holder',
    title: 'Wikipedia — Holder (gridiron football), edited 2026-09-29',
    url: 'https://en.wikipedia.org/wiki/Holder_(gridiron_football)',
  },
  S7: {
    short: 'Wikipedia · Special teams',
    title: 'Wikipedia — Special teams, edited 2026-09-28',
    url: 'https://en.wikipedia.org/wiki/Special_teams',
  },
};

/** ref: [sourceId, locator?, pdfPage?] → { label, href } */
export function resolveRef([id, at, page]) {
  const s = SOURCES[id];
  return {
    label: [s.short, at, page && `p.${page}`].filter(Boolean).join(' · '),
    href: page && s.page ? s.url + s.page(page) : s.url,
    title: s.title,
  };
}

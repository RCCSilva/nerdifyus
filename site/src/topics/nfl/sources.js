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
  S8: {
    short: 'NFL Football Ops · Making the Schedule',
    title: 'NFL Football Operations — Making the Schedule',
    url: 'https://operations.nfl.com/calendar-events/nfl-schedule/making-the-schedule',
  },
  S9: {
    short: 'NFL.com · 14-team playoffs',
    title: 'NFL.com — Owners approve expanding postseason to 14 teams',
    url: 'https://www.nfl.com/news/owners-approve-expanding-postseason-to-14-teams-0ap3000001107961',
  },
  S10: {
    short: 'NFL.com · Tiebreaking procedures',
    title: 'NFL.com — NFL Tiebreaking Procedures',
    url: 'https://www.nfl.com/standings/tie-breaking-procedures',
  },
  S11: {
    short: 'NFL · Approved 2026 rules & bylaws',
    title: 'NFL — Approved 2026 Playing Rules, Bylaws and Resolutions (2026-03-31)',
    url: 'https://media.nfl.com/football-information/2026/news/approved-2026-playing-rules--bylaws-and-resolutions',
  },
  S12: {
    short: 'NFL.com · 2026 divisions',
    title: 'NFL.com — 2026 division standings (team list)',
    url: 'https://www.nfl.com/standings/division/2026/REG',
  },
  S13: {
    short: 'Wikipedia · NFL playoffs',
    title: 'Wikipedia — NFL playoffs (fallback source)',
    url: 'https://en.wikipedia.org/wiki/NFL_playoffs',
  },
  S14: {
    short: 'Wikipedia · Score bug',
    title: 'Wikipedia — Score bug, edited 2026-09-20 (fallback source)',
    url: 'https://en.wikipedia.org/wiki/Score_bug',
  },
  S15: {
    short: 'Wikipedia · Home (sports)',
    title: 'Wikipedia — Home (sports), edited 2026-09-11 (fallback source)',
    url: 'https://en.wikipedia.org/wiki/Home_(sports)',
  },
  S16: {
    short: 'NFL · 2026 schedule',
    title: 'NFL — 2026 NFL Schedule Announced',
    url: 'https://media.nfl.com/football-information/2026/news/2026-nfl-schedule-announced',
  },
  S17: {
    short: 'IFAB Laws of the Game (soccer)',
    title: 'IFAB Laws of the Game 2026/27 — Law 7, The Duration of the Match',
    url: 'https://www.theifab.com/laws/latest/the-duration-of-the-match/',
  },
  S18: {
    short: 'NFL.com · field goals by distance',
    title: 'NFL.com — 2025 team field goal stats by distance',
    url: 'https://www.nfl.com/stats/team-stats/special-teams/field-goals/2025/reg/all',
  },
  S19: {
    short: 'Wikipedia · Field goal',
    title: 'Wikipedia — Field goal, edited 2026-09-29 (fallback source)',
    url: 'https://en.wikipedia.org/wiki/Field_goal',
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

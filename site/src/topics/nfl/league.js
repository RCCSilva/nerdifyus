// The 2026 league: 2 conferences × 4 divisions × 4 teams (S8, team list from S12).
// Team nicknames are proper names and stay untranslated. Alphabetical within each division.
export const DIVISIONS = ['east', 'north', 'south', 'west'];

export const LEAGUE = {
  AFC: {
    east: ['Bills', 'Dolphins', 'Patriots', 'Jets'],
    north: ['Ravens', 'Bengals', 'Browns', 'Steelers'],
    south: ['Texans', 'Colts', 'Jaguars', 'Titans'],
    west: ['Broncos', 'Chiefs', 'Raiders', 'Chargers'],
  },
  NFC: {
    east: ['Cowboys', 'Giants', 'Eagles', 'Commanders'],
    north: ['Bears', 'Lions', 'Packers', 'Vikings'],
    south: ['Falcons', 'Panthers', 'Saints', 'Buccaneers'],
    west: ['Cardinals', 'Rams', '49ers', 'Seahawks'],
  },
};

// The 17-game formula (S8), in order: [key, games].
export const SCHEDULE = [
  ['division', 6],
  ['confDivision', 4],
  ['otherConfDivision', 4],
  ['confRank', 2],
  ['seventeenth', 1],
];

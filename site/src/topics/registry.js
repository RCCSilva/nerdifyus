import { BASICS_SLIDES, POSITIONS_SLIDES } from './nfl/basics/slides';
import { GAME_SLIDES } from './nfl/game/slides';
import { OVERTIME_SLIDES } from './nfl/overtime/slides';
import { FOULS_SLIDES, COMMON_FOULS_SLIDES } from './nfl/fouls/slides';
import { SEASON_SLIDES } from './nfl/season/slides';
import { DEFENSE_TACTICS_SLIDES } from './nfl/tactics/slides';
import { resolveRef as nflRef } from './nfl/sources';

// All topics. A lesson with `slides` is live; without it, it shows as "coming soon".
// Titles and text come from i18n: `<topic>.lessons.<lessonId>.*`.
export const TOPICS = [
  {
    id: 'nfl',
    resolveRef: nflRef,
    lessons: [
      { id: 'basics', level: 'basic', slides: BASICS_SLIDES },
      { id: 'game', level: 'basic', slides: GAME_SLIDES },
      { id: 'positions', level: 'basic', slides: POSITIONS_SLIDES },
      { id: 'fouls', level: 'basic', slides: FOULS_SLIDES },
      { id: 'overtime', level: 'basic', slides: OVERTIME_SLIDES },
      { id: 'season', level: 'basic', slides: SEASON_SLIDES },
      { id: 'commonFouls', level: 'intermediate', slides: COMMON_FOULS_SLIDES },
      { id: 'defenseTactics', level: 'intermediate', slides: DEFENSE_TACTICS_SLIDES },
      { id: 'strategy', level: 'intermediate' },
      { id: 'matchCoverage', level: 'advanced' },
      { id: 'cap', level: 'advanced' },
    ],
  },
];

export const findTopic = (id) => TOPICS.find((t) => t.id === id);

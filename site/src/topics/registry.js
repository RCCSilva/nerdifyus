import { BASICS_SLIDES, OFFENSE_SLIDES, DEFENSE_SLIDES, SPECIAL_TEAMS_SLIDES } from './nfl/basics/slides';
import { GAME_SLIDES } from './nfl/game/slides';
import { FOULS_SLIDES } from './nfl/fouls/slides';
import { SEASON_SLIDES } from './nfl/season/slides';
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
      { id: 'offense', level: 'basic', slides: OFFENSE_SLIDES },
      { id: 'defense', level: 'basic', slides: DEFENSE_SLIDES },
      { id: 'specialTeams', level: 'basic', slides: SPECIAL_TEAMS_SLIDES },
      { id: 'season', level: 'basic', slides: SEASON_SLIDES },
      { id: 'fouls', level: 'basic', slides: FOULS_SLIDES },
      { id: 'overtime', level: 'basic' },
      { id: 'strategy', level: 'intermediate' },
      { id: 'cap', level: 'advanced' },
    ],
  },
];

export const findTopic = (id) => TOPICS.find((t) => t.id === id);

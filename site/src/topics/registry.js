import { BASICS_SLIDES } from './nfl/basics/slides';
import { FOULS_SLIDES } from './nfl/fouls/slides';
import { resolveRef as nflRef } from './nfl/sources';

// All topics. A lesson with `slides` is live; without it, it shows as "coming soon".
// Titles and text come from i18n: `<topic>.lessons.<lessonId>.*`.
export const TOPICS = [
  {
    id: 'nfl',
    resolveRef: nflRef,
    lessons: [
      { id: 'basics', level: 'basic', slides: BASICS_SLIDES },
      { id: 'fouls', level: 'basic', slides: FOULS_SLIDES },
      { id: 'overtime', level: 'basic' },
      { id: 'strategy', level: 'intermediate' },
      { id: 'cap', level: 'advanced' },
    ],
  },
];

export const findTopic = (id) => TOPICS.find((t) => t.id === id);

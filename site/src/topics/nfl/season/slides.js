import * as V from './visuals';

// The "How the season works" deck. Text lives in nfl/messages/<locale>.js under slides.<id>.
// refs: [sourceId, locator, pdfPage] — see ../sources.js and research/nfl/04-season.md.
export const SEASON_SLIDES = [
  { id: 'seasonLeague', Visual: V.LeagueVisual, refs: [['S8'], ['S12']] },
  { id: 'seasonDivisions', Visual: V.DivisionsVisual, refs: [['S8'], ['S12']] },
  { id: 'seasonSchedule', Visual: V.ScheduleVisual, refs: [['S8'], ['S71']] },
  { id: 'playoffSeeds', Visual: V.SeedsVisual, refs: [['S9'], ['S13'], ['S11'], ['S10']] },
  { id: 'playoffSeeds2025', Visual: V.Seeds2025Visual, refs: [['S68'], ['S69'], ['S13']] },
  { id: 'playoffBracket', Visual: V.BracketVisual, refs: [['S9'], ['S13']] },
  { id: 'playoffBracket2025', Visual: V.Bracket2025Visual, refs: [['S68'], ['S9']] },
  { id: 'superBowl', Visual: V.SuperBowlVisual, refs: [['S13'], ['S70']] },
  { id: 'seasonEnd', Visual: V.SeasonEndVisual, refs: [] },
];

import * as V from './visuals';

// The "The game" deck. Text lives in nfl/messages/<locale>.js under slides.<id>.
// refs: [sourceId, locator, pdfPage] — see ../sources.js and research/nfl/02-the-game.md.
export const GAME_SLIDES = [
  { id: 'gameLength', Visual: V.GameLengthVisual, refs: [['S1', 'R4-1-1/2/3', 18], ['S1', 'R4-2-3', 18]] },
  { id: 'gameClock', Visual: V.GameClockVisual, refs: [['S1', 'R4-1-4', 18], ['S1', 'R3-41'], ['S1', 'R4-4', 19], ['S17', 'Law 7']] },
  { id: 'gameTimeouts', Visual: V.TimeoutsVisual, refs: [['S1', 'R4-5-1', 19]] },
  { id: 'scoreboard', Visual: V.ScoreboardVisual, refs: [['S14'], ['S15']] },
  { id: 'sbTeams', Visual: V.ScoreboardTeamsVisual, refs: [['S15'], ['S16']] },
  { id: 'sbRecord', Visual: V.ScoreboardRecordVisual, refs: [['S14']] },
  { id: 'sbTimeouts', Visual: V.ScoreboardTimeoutsVisual, refs: [['S1', 'R4-5-1', 19]] },
  { id: 'sbScore', Visual: V.ScoreboardScoreVisual, refs: [['S1', 'R11-1-2', 49]] },
  { id: 'sbClock', Visual: V.ScoreboardClockVisual, refs: [['S1', 'R4-1-1', 18], ['S1', 'R3-41']] },
  { id: 'sbDown', Visual: V.ScoreboardDownVisual, refs: [['S1', 'R3-7-2/3', 11], ['S14']] },
  { id: 'sbPlayClock', Visual: V.PlayClockVisual, refs: [['S1', 'R4-6-1/2', 20], ['S1', 'R4-6', 21], ['S14']] },
  { id: 'gameEnd', Visual: V.GameEndVisual, refs: [] },
];

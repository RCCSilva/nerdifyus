import * as V from './visuals';

// The "How football works" deck (field, downs, moving the ball, scoring). Text lives in nfl/messages/<locale>.js under slides.<id>.
// refs: [sourceId, locator, pdfPage] — see ../sources.js and research/nfl/*.md.
export const BASICS_SLIDES = [
  { id: 'intro', Visual: V.IntroVisual, refs: [['S2', 'Offense / Defense'], ['S1', 'R11-2-1', 49]] },
  { id: 'field', Visual: V.FieldVisual, refs: [['S1', 'R1-1-1', 8], ['S5', '1 yd = 0.9144 m']] },
  { id: 'endzones', Visual: V.EndZonesVisual, refs: [['S1', 'R1-1-1', 8], ['S1', 'R11-2-1', 49]] },
  { id: 'teams', Visual: V.TeamsVisual, refs: [['S1', 'R5-1-1', 23]] },
  { id: 'coinToss', Visual: V.CoinTossVisual, refs: [['S1', 'R4-2-2', 18]] },
  { id: 'kickoff', Visual: V.KickoffVisual, refs: [['S1', 'R6-1-1/2/3', 29], ['S1', 'R6-1-4/5', 30], ['S1', 'R7-2-1(d)', 33]] },
  { id: 'touchdown', Visual: V.TouchdownVisual, refs: [['S1', 'R11-1-2', 49], ['S1', 'R11-2-1(a)(d)', 49]] },
  { id: 'run', Visual: V.RunVisual, refs: [['S1', 'R8-7-4', 41], ['S1', 'R3-27', 15], ['S1', 'R7-2-1', 33]] },
  { id: 'pass', Visual: V.PassVisual, refs: [['S1', 'R8-1-2/3', 37], ['S1', 'R8-1-4', 38]] },
  { id: 'downs', Visual: V.DownsVisual, refs: [['S1', 'R3-7-2/3', 11], ['S1', 'R7-3-1', 34], ['S1', 'R7-6-1', 35], ['S1', 'R7-4-2', 34]] },
  { id: 'downsUse', Visual: V.DownsUseVisual, refs: [['S1', 'R3-7-2', 11], ['S1', 'R7-3-1', 34]] },
  { id: 'downsFourth', Visual: V.FourthDownVisual, refs: [['S1', 'R7-3-1/2', 34], ['S2', 'Punter'], ['S19']] },
  { id: 'punt', Visual: V.PuntVisual, refs: [['S2', 'Punter'], ['S1', 'R7-3-2', 34], ['S1', 'R9-1-1', 43]] },
  { id: 'fieldGoal', Visual: V.FieldGoalVisual, refs: [['S1', 'R11-4-1', 50], ['S1', 'R11-4-2', 50], ['S18', '2025'], ['S19'], ['S7']] },
  { id: 'tdRun', Visual: V.TdRunVisual, refs: [['S1', 'R11-2-1(a)', 49], ['S1', 'R3-38', 16]] },
  { id: 'tdPass', Visual: V.TdPassVisual, refs: [['S1', 'R11-2-1(d)', 49], ['S1', 'R8-1-3', 37]] },
  { id: 'try', Visual: V.TryVisual, refs: [['S1', 'R11-3-1/2', 49], ['S2', 'Extra Point/Two-Point Conversion']] },
  { id: 'safety', Visual: V.SafetyVisual, refs: [['S1', 'R11-5-1/2', 51], ['S1', 'R7-3-2(c)', 34]] },
  { id: 'scoring', Visual: V.ScoringVisual, refs: [['S1', 'R11-1-2', 49], ['S1', 'R11-3-1/2', 49]] },
  { id: 'end', Visual: V.EndVisual, refs: [] },
];

// Positions: offense, defense and special teams, in one lesson.
export const POSITIONS_SLIDES = [
  { id: 'offense', Visual: V.OffenseVisual, refs: [['S1', 'R7-5-1', 35], ['S1', 'R5-1-2', 23], ['S2', 'positions']] },
  { id: 'defense', Visual: V.DefenseVisual, refs: [['S2', 'positions'], ['S3']] },
  { id: 'stFieldGoal', Visual: V.FieldGoalUnitVisual, refs: [['S2', 'special teams'], ['S6'], ['S7']] },
  { id: 'stPunt', Visual: V.PuntUnitVisual, refs: [['S2', 'Punter, Long Snapper'], ['S7']] },
];

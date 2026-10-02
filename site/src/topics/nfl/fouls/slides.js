import * as V from './visuals';

// The "Common fouls" deck. Text lives in nfl/messages/<locale>.js under slides.<id>.
// refs: [sourceId, locator, pdfPage] — see ../sources.js and research/nfl/03-common-fouls.md.
export const FOULS_SLIDES = [
  { id: 'foulsIntro', Visual: V.FoulsIntroVisual, refs: [['S2', 'Penalty/Flag'], ['S1', 'R7-4-2 / R12-1-6', 34]] },
  { id: 'falseStart', Visual: V.FalseStartVisual, refs: [['S1', 'R7-4-2', 34]] },
  { id: 'offside', Visual: V.OffsideFamilyVisual, refs: [['S1', 'R3-18-2', 13], ['S1', 'R7-4-3/4', 34], ['S1', 'R7-4-5', 35]] },
  { id: 'offHolding', Visual: V.OffensiveHoldingVisual, refs: [['S1', 'R12-1-3(c)', 52]] },
  { id: 'defHolding', Visual: V.DefensiveHoldingVisual, refs: [['S1', 'R12-1-6', 53], ['S1', 'R8-4-6', 39]] },
  { id: 'passInterference', Visual: V.PassInterferenceVisual, refs: [['S1', 'R8-5-1/2/3', 40], ['S1', 'R8-5 Penalty', 40]] },
  { id: 'foulsSummary', Visual: V.FoulsSummaryVisual, refs: [['S1', 'R7-4', 34], ['S1', 'R8-5', 40], ['S1', 'R12-1', 52]] },
];

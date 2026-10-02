import * as V from './visuals';

// "How fouls work" (basic: the mechanism) and "Common fouls" (intermediate: the fouls themselves). Text lives in nfl/messages/<locale>.js under slides.<id>.
// refs: [sourceId, locator, pdfPage] — see ../sources.js and research/nfl/03-common-fouls.md.
export const FOULS_SLIDES = [
  { id: 'foulFlag', Visual: V.FlagVisual, refs: [['S2', 'Penalty/Flag'], ['S20']] },
  { id: 'foulAnnounce', Visual: V.AnnounceVisual, refs: [['S20'], ['S1', 'R14-1-1', 61]] },
  { id: 'foulOffense', Visual: V.OffenseFoulVisual, refs: [['S1', 'R14-1-2 Item 1', 61], ['S1', 'R12-1-3(c)', 52]] },
  { id: 'foulDefense', Visual: V.DefenseFoulVisual, refs: [['S1', 'R14-1-2 Item 5', 61], ['S1', 'R12-1-6', 53]] },
  { id: 'foulDecline', Visual: V.DeclineVisual, refs: [['S21'], ['S1', 'R14-1-1', 61], ['S22', 'Law 5.3']] },
  { id: 'foulMechanism', Visual: V.FoulMechanismSummaryVisual, refs: [['S1', 'R14-1-2', 61], ['S1', 'R8-5-1', 40], ['S1', 'R12-1-3(c)', 52], ['S23']] },
];

export const COMMON_FOULS_SLIDES = [
  { id: 'falseStart', Visual: V.FalseStartVisual, refs: [['S1', 'R7-4-2', 34]] },
  { id: 'offside', Visual: V.OffsideFamilyVisual, refs: [['S1', 'R3-18-2', 13], ['S1', 'R7-4-3/4', 34], ['S1', 'R7-4-5', 35]] },
  { id: 'offHolding', Visual: V.OffensiveHoldingVisual, refs: [['S1', 'R12-1-3(c)', 52]] },
  { id: 'defHolding', Visual: V.DefensiveHoldingVisual, refs: [['S1', 'R12-1-6', 53], ['S1', 'R8-4-6', 39]] },
  { id: 'passInterference', Visual: V.PassInterferenceVisual, refs: [['S1', 'R8-5-1/2/3', 40], ['S1', 'R8-5 Penalty', 40]] },
  { id: 'foulsSummary', Visual: V.FoulsSummaryVisual, refs: [['S1', 'R7-4', 34], ['S1', 'R8-5', 40], ['S1', 'R12-1', 52]] },
];

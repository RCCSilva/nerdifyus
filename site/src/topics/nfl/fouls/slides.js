import * as V from './visuals';
import * as C from './common';

// "How fouls work" (basic: the mechanism) and "Common fouls" (intermediate: the fouls themselves). Text lives in nfl/messages/<locale>.js under slides.<id>.
// refs: [sourceId, locator, pdfPage] — see ../sources.js and research/nfl/04-common-fouls.md.
export const FOULS_SLIDES = [
  { id: 'foulFlag', Visual: V.FlagVisual, refs: [['S2', 'Penalty/Flag'], ['S20']] },
  { id: 'foulAnnounce', Visual: V.AnnounceVisual, refs: [['S20'], ['S1', 'R14-1-1', 61]] },
  { id: 'foulOffense', Visual: V.OffenseFoulVisual, refs: [['S1', 'R14-1-2 Item 1', 61], ['S1', 'R12-1-3(c)', 52]] },
  { id: 'foulDefense', Visual: V.DefenseFoulVisual, refs: [['S1', 'R14-1-2 Item 5', 61], ['S1', 'R12-1-6', 53]] },
  { id: 'foulDecline', Visual: V.DeclineVisual, refs: [['S21'], ['S1', 'R14-1-1', 61], ['S22', 'Law 5.3']] },
  { id: 'foulMechanism', Visual: V.FoulMechanismSummaryVisual, refs: [['S1', 'R14-1-2', 61], ['S1', 'R8-5-1', 40], ['S1', 'R12-1-3(c)', 52], ['S23']] },
];

// Ordered like a play: before the snap, blocking, passing plays, personal fouls. Each visual has the
// official referee signal (S1 "Official Signals", PDF p.80–84).
const SIG = (page) => ['S1', 'Official Signals', page];

export const COMMON_FOULS_SLIDES = [
  { id: 'foulsTop', Visual: C.TopFoulsVisual, refs: [['S48', '2025']] },
  { id: 'falseStart', Visual: C.FalseStartVisual, refs: [['S1', 'R7-4-2', 34], SIG(81)] },
  { id: 'illegalFormation', Visual: C.IllegalFormationVisual, refs: [['S1', 'R7-5-1', 35], SIG(81)] },
  { id: 'offside', Visual: C.OffsideVisual, refs: [['S1', 'R3-18-2', 13], ['S1', 'R7-4-5', 35], ['S1', 'R3-13-1(a)', 12], ['S49'], ['S1', 'R14-1-1', 61], SIG(83)] },
  { id: 'encroachment', Visual: C.EncroachmentVisual, refs: [['S1', 'R7-4-3', 34], ['S49'], SIG(83)] },
  { id: 'nzi', Visual: C.NeutralZoneInfractionVisual, refs: [['S1', 'R7-4-4', 34], ['S1', 'R7-4-4(a)(b)', 35], ['S49'], SIG(83)] },
  { id: 'delayOfGame', Visual: C.DelayOfGameVisual, refs: [['S1', 'R4-6-1/2', 20], ['S1', 'R4-6 Penalty', 21], SIG(81)] },
  { id: 'offHolding', Visual: C.OffensiveHoldingVisual, refs: [['S1', 'R12-1-2', 52], ['S1', 'R12-1-3(c)', 52], SIG(81)] },
  { id: 'illegalHands', Visual: C.IllegalHandsVisual, refs: [['S1', 'R12-1-3(a)', 52], ['S1', 'R12-1-7', 53], SIG(81)] },
  { id: 'defHolding', Visual: C.DefensiveHoldingVisual, refs: [['S1', 'R12-1-6', 53], ['S1', 'R8-4-6', 39], SIG(81)] },
  { id: 'illegalContact', Visual: C.IllegalContactVisual, refs: [['S1', 'R8-4-1/3', 39], ['S1', 'R8-4 Penalty', 39], SIG(83)] },
  { id: 'passInterference', Visual: C.PassInterferenceVisual, refs: [['S1', 'R8-5-1/2/3', 40], ['S1', 'R8-5 Penalty', 40], SIG(82)] },
  { id: 'grounding', Visual: C.GroundingVisual, refs: [['S1', 'R8-2-1', 38], ['S1', 'R8-2 Penalty', 38], SIG(82)] },
  { id: 'roughingPasser', Visual: C.RoughingPasserVisual, refs: [['S1', 'R12-2-11', 55], ['S1', 'R12-2-11 Penalty', 56], SIG(81)] },
  { id: 'roughness', Visual: C.RoughnessVisual, refs: [['S1', 'R12-2-8', 54], ['S1', 'R12-2-8 Penalty', 55], SIG(81)] },
  { id: 'faceMask', Visual: C.FaceMaskVisual, refs: [['S1', 'R12-2-15', 57], SIG(81)] },
  { id: 'foulsSummary', Visual: C.FoulsSummaryVisual, refs: [['S48', '2025'], ['S1', 'R7-4', 34], ['S1', 'R8-5', 40], ['S1', 'R12-1', 52], ['S1', 'R12-2', 54]] },
];

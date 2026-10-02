import * as V from './visuals';

// The "Ties & overtime" deck. Text lives in nfl/messages/<locale>.js under slides.<id>.
// refs: [sourceId, locator, pdfPage] — see ../sources.js and research/nfl/05-overtime.md.
export const OVERTIME_SLIDES = [
  { id: 'otWhen', Visual: V.OvertimeWhenVisual, refs: [['S1', 'R16-1-1/2', 72], ['S4', 'Law 10.2']] },
  { id: 'otRegular', Visual: V.OvertimeRegularVisual, refs: [['S1', 'R16-1-3', 72]] },
  { id: 'otPossession', Visual: V.PossessionVisual, refs: [['S1', 'R16-1-3(a)', 72], ['S1', 'R16-1-5(c)', 72]] },
  { id: 'otScenarios', Visual: V.ScenariosVisual, refs: [['S1', 'R16-1-3(b)(c)', 72]] },
  { id: 'otTie', Visual: V.TieVisual, refs: [['S1', 'R16-1-3(d)', 72]] },
  { id: 'otPostseason', Visual: V.PostseasonVisual, refs: [['S1', 'R16-1-4', 72]] },
  { id: 'otSummary', Visual: V.OvertimeSummaryVisual, refs: [['S1', 'R16-1-3/4', 72]] },
];

import * as V from './visuals';

// "The draft". Text lives in nfl/messages/<locale>.js under slides.<id>.
// refs: [sourceId, locator] — see ../sources.js and research/nfl/08-draft.md.
export const DRAFT_SLIDES = [
  { id: 'draftWhat', Visual: V.DraftBoardVisual, refs: [['S30'], ['S31', '2026'], ['S32', '2026']] },
  { id: 'draftOrder', Visual: V.DraftOrderVisual, refs: [['S30'], ['S31', '2026']] },
  { id: 'draftClock', Visual: V.DraftClockVisual, refs: [['S30']] },
  { id: 'draftComp', Visual: V.DraftCompVisual, refs: [['S30'], ['S32', '2026']] },
  { id: 'draftElig', Visual: V.DraftEligibilityVisual, refs: [['S30']] },
];

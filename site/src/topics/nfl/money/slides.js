import * as V from './visuals';

// Trades (intermediate), tags and the salary cap (advanced). Text lives in nfl/messages/<locale>.js.
// refs: [sourceId, locator, pdfPage] — see ../sources.js and research/nfl/09-trades.md, 10-tags.md, 12-salary-cap.md.
export const TRADES_SLIDES = [
  { id: 'tradeWhat', Visual: V.TradeWhatVisual, refs: [['S30'], ['S32', '2026']] },
  { id: 'tradeWindow', Visual: V.TradeWindowVisual, refs: [['S34', '2026']] },
  { id: 'tradeCap', Visual: V.TradeCapVisual, refs: [['S33', 'Art. 13 §6(b)(i)', 126], ['S33', 'Art. 13 §6(b)(ii)', 127]] },
];

export const TAGS_SLIDES = [
  { id: 'tagWhat', Visual: V.TagWhatVisual, refs: [['S36', '2026'], ['S33', 'Art. 10 §1–3', 75]] },
  { id: 'tagNonExclusive', Visual: V.TagNonExclusiveVisual, refs: [['S33', 'Art. 10 §2(a)(i)', 75], ['S36']] },
  { id: 'tagExclusive', Visual: V.TagExclusiveVisual, refs: [['S33', 'Art. 10 §2(a)(ii)', 75], ['S36']] },
  { id: 'tagTransition', Visual: V.TagTransitionVisual, refs: [['S33', 'Art. 10 §4–5', 78]] },
  { id: 'tagValues', Visual: V.TagValuesVisual, refs: [['S37', '2026'], ['S33', 'Art. 10 §2(b)', 76]] },
];

export const CAP_SLIDES = [
  { id: 'capWhat', Visual: V.CapWhatVisual, refs: [['S33', 'Art. 13 §1–2', 123], ['S35', '2026']] },
  { id: 'capGrowth', Visual: V.CapGrowthVisual, refs: [['S35']] },
  { id: 'capShare', Visual: V.CapShareVisual, refs: [['S33', 'Art. 12 §6(c)', 112]] },
  { id: 'capFloor', Visual: V.CapFloorVisual, refs: [['S33', 'Art. 12 §8–9', 117]] },
  { id: 'capBonus', Visual: V.CapBonusVisual, refs: [['S33', 'Art. 13 §6(b)(i)', 126]] },
  { id: 'capDead', Visual: V.CapDeadVisual, refs: [['S33', 'Art. 13 §6(b)(ii)', 127]] },
  { id: 'capCarry', Visual: V.CapCarryVisual, refs: [['S33', 'Art. 13 §6(b)(v)', 129]] },
];

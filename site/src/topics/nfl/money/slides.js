import * as V from './visuals';

// Trades (intermediate), tags and the salary cap (advanced). Text lives in nfl/messages/<locale>.js.
// refs: [sourceId, locator, pdfPage] — see ../sources.js and research/nfl/09-trades.md, 10-tags.md, 12-salary-cap.md.
export const TRADES_SLIDES = [
  { id: 'tradeWhat', Visual: V.TradeWhatVisual, refs: [['S30'], ['S32', '2026'], ['S46', 'Art. XVI §16.6', 76], ['S46', '2001 position on trades for cash', 228], ['S47']] },
  { id: 'tradeWindow', Visual: V.TradeWindowVisual, refs: [['S34', '2026']] },
];

export const TAGS_SLIDES = [
  { id: 'tagWhat', Visual: V.TagWhatVisual, refs: [['S36', '2026'], ['S33', 'Art. 10 §1–3', 75], ['S41'], ['S40'], ['S42']] },
  { id: 'tagNonExclusive', Visual: V.TagNonExclusiveVisual, refs: [['S33', 'Art. 10 §2(a)(i)', 75], ['S36'], ['S33', 'Art. 9 §2(j)', 69], ['S43'], ['S44'], ['S45'], ['S39']] },
  { id: 'tagExclusive', Visual: V.TagExclusiveVisual, refs: [['S33', 'Art. 10 §2(a)(ii)', 75], ['S36']] },
  { id: 'tagTransition', Visual: V.TagTransitionVisual, refs: [['S33', 'Art. 10 §4–5', 78]] },
  { id: 'tagValues', Visual: V.TagValuesVisual, refs: [['S37', '2026'], ['S33', 'Art. 10 §2(b)', 76]] },
];

// How contracts work, without the cap (research/nfl/14-contracts.md). The cap side is in CAP_SLIDES.
export const CONTRACTS_SLIDES = [
  { id: 'contractWhat', Visual: V.ContractWhatVisual, refs: [['S52'], ['S50'], ['S33', 'Art. 13 §2', 123]] },
  { id: 'contractParts', Visual: V.ContractPartsVisual, refs: [['S50'], ['S33', 'App. A ¶6', 354], ['S33', 'App. A ¶11', 356]] },
  { id: 'contractGuarantees', Visual: V.ContractGuaranteesVisual, refs: [['S33', 'App. A ¶11', 356], ['S50'], ['S52'], ['S51']] },
  { id: 'contractDates', Visual: V.ContractDatesVisual, refs: [['S51']] },
  { id: 'contractWatson', Visual: V.ContractWatsonVisual, refs: [['S56'], ['S58'], ['S57'], ['S51']] },
  { id: 'contractMahomes', Visual: V.ContractMahomesVisual, refs: [['S59'], ['S60']] },
];

export const CAP_SLIDES = [
  { id: 'capWhat', Visual: V.CapWhatVisual, refs: [['S33', 'Art. 13 §1–2', 123], ['S35', '2026']] },
  { id: 'capGrowth', Visual: V.CapGrowthVisual, refs: [['S35']] },
  { id: 'capShare', Visual: V.CapShareVisual, refs: [['S33', 'Art. 12 §6(c)', 112]] },
  { id: 'capFloor', Visual: V.CapFloorVisual, refs: [['S33', 'Art. 12 §8–9', 117]] },
  { id: 'capHit', Visual: V.CapHitVisual, refs: [['S53'], ['S33', 'Art. 13 §6(a)(i)', 125], ['S33', 'Art. 13 §6(b)(i)', 126], ['S50'], ['S33', 'Art. 13 §6(c)(i)', 130]] },
  { id: 'contractIncentives', Visual: V.ContractIncentivesVisual, refs: [['S33', 'Art. 13 §6(c)', 130], ['S50']] },
  { id: 'capBonus', Visual: V.CapBonusVisual, refs: [['S33', 'Art. 13 §6(b)(i)', 126]] },
  { id: 'capDead', Visual: V.CapDeadVisual, refs: [['S33', 'Art. 13 §6(b)(ii)', 127], ['S61'], ['S62']] },
  { id: 'contractRestructure', Visual: V.ContractRestructureVisual, refs: [['S50'], ['S33', 'Art. 13 §6(b)(iii)(3)', 128], ['S33', 'Art. 13 §6(b)(ii)(4)', 127], ['S54'], ['S55'], ['S53'], ['S58']] },
  { id: 'capCarry', Visual: V.CapCarryVisual, refs: [['S33', 'Art. 13 §6(b)(v)', 129]] },
];

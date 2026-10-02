import * as V from './visuals';

// "Defensive tactics: pass coverage". Text lives in nfl/messages/<locale>.js under slides.<id>.
// refs: [sourceId, locator] — see ../sources.js and research/nfl/07-defense-tactics.md.
export const DEFENSE_TACTICS_SLIDES = [
  { id: 'covFamilies', Visual: V.CoverageFamiliesVisual, refs: [['S24'], ['S25'], ['S26']] },
  { id: 'covMan', Visual: V.ManCoverageVisual, refs: [['S24'], ['S25'], ['S28']] },
  { id: 'covZone', Visual: V.ZoneCoverageVisual, refs: [['S25'], ['S29']] },
  { id: 'covToday', Visual: V.CoverageTodayVisual, refs: [['S27', '2025']] },
];

// Match coverage: an ADVANCED lesson, still being researched (listed as "coming soon").
// The slide below is ready to reuse when it goes live.
export const MATCH_SLIDES_DRAFT = [
  { id: 'covMatch', Visual: V.MatchCoverageVisual, refs: [['S26']] },
];

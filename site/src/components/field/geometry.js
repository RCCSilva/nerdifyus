// Field geometry, in yards. Every number here comes from the 2026 NFL Rulebook, Rule 1
// (research/nfl/01-basic-rules.md, source S1 R1, p.8). Coordinate system:
//   x: 0 = left end line, 10 = left goal line, 110 = right goal line, 120 = right end line
//   y: 0 = top sideline, WIDTH = bottom sideline

const FT = 1 / 3;
const IN = 1 / 36;

export const LENGTH = 360 * FT; // 120 yd — R1-1-1
export const WIDTH = 160 * FT; // 53⅓ yd — R1-1-1
export const END_ZONE = 10; // goal lines 10 yd from end lines — R1-1-1
export const HASH = 70 * FT + 9 * IN; // inbounds lines 70'9" from each sideline — R1-1-1, R1-2-2
export const BORDER = 6 * FT; // solid white border, min 6 ft — R1-1-2
export const YARD_LINE_W = 4 * IN; // R1-2-1
export const GOAL_LINE_W = 8 * IN; // R1-2-3
export const TICK_LEN = 2 * FT; // 1-yd hash marks, 2 ft long — R1-2-2
export const TICK_GAP = 8 * IN; // sideline ticks start 8 in from the border — R1-2-2
export const NUMBER_FROM_SIDELINE = 12; // bottoms of numerals 12 yd in — R1-2-4
export const NUMBER_HEIGHT = 2; // numerals 2 yd tall — R1-2-4
export const TRY_MARK_DIST = 2; // 1-yd line, 2 yd from the middle of each goal line — R1-2-4
export const CROSSBAR = 18 * FT + 6 * IN; // 18'6" — R1-3-1

/** x coordinate of a yard line counted from the LEFT goal line (0–100). */
export const fx = (yardsFromLeftGoal) => END_ZONE + yardsFromLeftGoal;

/** The number painted on a yard line (0–100 from the left goal) — 10, 20 … 50 … 20, 10. */
export const yardLabel = (yardsFromLeftGoal) => Math.min(yardsFromLeftGoal, 100 - yardsFromLeftGoal);

export const MID_Y = WIDTH / 2;

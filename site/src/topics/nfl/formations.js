import { MID_Y } from '../../components/field/geometry';

// Player spots relative to the line of scrimmage: dx in yards (offense negative, defense positive),
// y in yards from the top sideline. Sources: research/nfl/02-positions.md.
// Exact spacing is ILLUSTRATIVE — the rules fix only who is on the line (S1 R7-5-1) and S2 gives
// depth ranges for linebackers (3–5 yd) and safeties (10–15 yd). Everything else is approximate.

const LINE = -1.0; // offensive players "on the line" stand just behind it
const GAP = 2.1; // approximate spacing between linemen

// Line of 7 (R7-5-1): WR · T G C G T · TE — eligible receivers at both ends.
export const OFFENSE = [
  { id: 'WR', group: 'rec', dx: LINE, y: 10.5 },
  { id: 'T', group: 'ol', dx: LINE, y: MID_Y - 2 * GAP },
  { id: 'G', group: 'ol', dx: LINE, y: MID_Y - GAP },
  { id: 'C', group: 'ol', dx: LINE, y: MID_Y },
  { id: 'G', group: 'ol', dx: LINE, y: MID_Y + GAP },
  { id: 'T', group: 'ol', dx: LINE, y: MID_Y + 2 * GAP },
  { id: 'TE', group: 'rec', dx: LINE, y: MID_Y + 3 * GAP },
  { id: 'WR', group: 'rec', dx: -2.2, y: 43 }, // off the line
  { id: 'QB', group: 'backs', dx: -3.1, y: MID_Y },
  { id: 'FB', group: 'backs', dx: -5.4, y: MID_Y },
  { id: 'RB', group: 'backs', dx: -7.7, y: MID_Y },
];

// Base 4-3 (S2): DTs across from the guards, DEs outside; LBs 3–5 yd behind the line;
// CBs across from the WRs; SS closer on the tight-end (strong) side; FS deepest.
export const DEFENSE = [
  { id: 'DE', group: 'dl', dx: 1.4, y: MID_Y - 3.5 * GAP },
  { id: 'DT', group: 'dl', dx: 1.4, y: MID_Y - GAP },
  { id: 'DT', group: 'dl', dx: 1.4, y: MID_Y + GAP },
  { id: 'DE', group: 'dl', dx: 1.4, y: MID_Y + 3.6 * GAP },
  { id: 'WLB', group: 'lb', dx: 5, y: MID_Y - 5.5 },
  { id: 'MLB', group: 'lb', dx: 5, y: MID_Y },
  { id: 'SLB', group: 'lb', dx: 5, y: MID_Y + 6 },
  { id: 'CB', group: 'db', dx: 7, y: 10.5 },
  { id: 'CB', group: 'db', dx: 7, y: 43 },
  { id: 'SS', group: 'db', dx: 10, y: MID_Y + 9 },
  { id: 'FS', group: 'db', dx: 14, y: MID_Y - 3 },
];

export const SPECIAL_TEAMS = ['K', 'P', 'LS', 'H', 'KR'];

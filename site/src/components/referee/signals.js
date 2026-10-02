// Referee signals, drawn from the descriptions in the rulebook's "Official Signals" pages
// (research/nfl/04-common-fouls.md, "Referee signals"). Each signal gives the two hands' positions
// over a loop of `loop` ms, in figure coordinates: head at (0,2), shoulders at y=26, hips at y=78.
// Hands: 'fist' | 'open' (palm toward the viewer) | 'flat' (palm down, seen edge-on).
// `side: true` draws the referee in profile, facing right, for signals that point "forward".
// `still` is the time shown with reduced motion: a frame that reads well on its own.

const lerp = (a, b, p) => a + (b - a) * p;
const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
const seg = (t, a, b) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
const wave = (t, ms) => (1 - Math.cos((t / ms) * Math.PI * 2)) / 2; // 0 → 1 → 0
export const P = (x, y) => ({ x, y });
const mix = (a, b, p) => P(lerp(a.x, b.x, p), lerp(a.y, b.y, p));

export const REST_L = P(-20, 82);
export const REST_R = P(20, 82);
const SIDE_REST = P(4, 82);

/** Arms come up over 0.2–0.65 s, then the signal runs. */
const up = (t) => seg(t, 200, 650);
const hold = (l, r, extra = {}) => ({ hands: (t) => [mix(REST_L, l, up(t)), mix(REST_R, r, up(t))], loop: 2400, still: 2000, ...extra });

const personalFoul = (t) => {
  const b = up(t);
  const hit = wave(Math.max(0, t - 650), 420);
  return [mix(REST_L, P(-4, -18), b), mix(REST_R, mix(P(22, -38), P(6, -22), hit), b)];
};

export const SIGNALS = {
  // 9 — "Forearms rotated over and over in front of body."
  falseStart: {
    loop: 3000, still: 1500,
    hands: (t) => {
      const a = (t / 480) * Math.PI * 2;
      const b = up(t);
      return [
        mix(REST_L, P(-5 + Math.cos(a) * 9, 50 + Math.sin(a) * 9), b),
        mix(REST_R, P(5 + Math.cos(a + Math.PI) * 9, 50 + Math.sin(a + Math.PI) * 9), b),
      ];
    },
    hand: ['fist', 'fist'],
  },
  // 21 — "Hands on hips."
  offside: hold(P(-19, 74), P(19, 74)),
  // 8 — "Folded arms."
  delayOfGame: hold(P(14, 50), P(-14, 56)),
  // 11 — "Grasping one wrist, the fist clenched, in front of chest."
  holding: {
    loop: 2400, still: 2000,
    hands: (t) => { const b = up(t); const tug = Math.sin(t / 150) * 1.2 * b; return [mix(REST_L, P(-2 + tug, 50), b), mix(REST_R, P(6 + tug, 52), b)]; },
    hand: ['open', 'fist'],
  },
  // 12 — "Grasping one wrist, the hand open and facing forward, in front of chest."
  illegalHands: {
    loop: 2400, still: 2000,
    hands: (t) => { const b = up(t); return [mix(REST_L, P(-2, 52), b), mix(REST_R, P(6, 44), b)]; },
    hand: ['fist', 'open'],
  },
  // 20 — "One open hand extended forward." (profile)
  illegalContact: {
    side: true, loop: 2400, still: 2000,
    hands: (t) => [SIDE_REST, mix(SIDE_REST, P(58, 26), up(t))],
    hand: ['fist', 'open'],
  },
  // 17 — "Hands open and extended forward from shoulders with hands vertical." (profile)
  passInterference: {
    side: true, loop: 2400, still: 2000,
    hands: (t) => [mix(SIDE_REST, P(56, 20), up(t)), mix(SIDE_REST, P(58, 27), up(t))],
    hand: ['open', 'open'],
  },
  // 16 — "Parallel arms waved in a diagonal plane across body. Followed by loss of down signal (23)."
  grounding: {
    loop: 4200, still: 1300,
    hands: (t) => {
      if (t < 2600) {
        const b = up(t);
        const w = wave(Math.max(0, t - 650), 900);
        return [mix(REST_L, mix(P(-46, 14), P(14, 66), w), b), mix(REST_R, mix(P(-30, 4), P(30, 56), w), b)];
      }
      const b = seg(t, 2600, 3000);
      return [mix(P(14, 66), P(-12, -8), b), mix(P(30, 56), P(12, -8), b)];
    },
    hand: ['flat', 'flat'],
  },
  // 10 — "One wrist striking the other above head."
  personalFoul: { loop: 2600, still: 900, hands: personalFoul },
  // 10 + "raised arm swinging forward: Roughing Passer."
  roughingPasser: {
    loop: 4400, still: 3300,
    hands: (t) => {
      if (t < 2000) return personalFoul(t);
      const swing = wave(t - 2000, 900);
      return [mix(P(-4, -18), REST_L, seg(t, 2000, 2400)), mix(P(16, -32), P(36, 28), swing)];
    },
  },
  // 10 + "grasping facemask: Facemask."
  faceMask: {
    loop: 4400, still: 3200,
    hands: (t) => {
      if (t < 2000) return personalFoul(t);
      const tug = wave(t - 2000, 700) * 5;
      return [mix(P(-4, -18), REST_L, seg(t, 2000, 2400)), mix(P(6, -22), P(8, 14 + tug), seg(t, 2000, 2400))];
    },
    hand: ['fist', 'fist'],
  },
  // 3 — "Arms pointed toward defensive team's goal."
  firstDown: hold(REST_L, P(70, 24)),
};

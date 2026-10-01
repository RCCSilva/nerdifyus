// Content for the NFL topic. Every fact here comes from research/nfl/*.md — don't add facts that aren't there.
export default {
  name: 'NFL',
  blurb: 'American football, from "what is a down?" to how the salary cap works.',
  lessons: {
    basics: { title: 'How football works', summary: 'The field, scoring, positions, running and passing.' },
    fouls: { title: 'Common fouls', summary: 'False start, offside, holding, pass interference.' },
    overtime: { title: 'Ties & overtime', summary: 'Ties are possible in the regular season, never in the playoffs.' },
    strategy: { title: 'Strategy', summary: 'Why teams do what they do.' },
    cap: { title: 'The salary cap', summary: 'How team payrolls really work.' },
  },

  common: {
    goalLine: 'Goal line',
    offense: 'Offense',
    defense: 'Defense',
    los: 'Line of scrimmage',
    ltg: 'Line to gain',
    pts: '+{n}',
    ownSide: 'own {n}',
    oppSide: 'opp {n}',
    downs: ['1st', '2nd', '3rd', '4th'],
    downDist: '{down} & {togo}',
    tapPlayer: 'Tap a player',
  },

  slides: {
    intro: {
      title: 'Football in a few taps',
      target: 'THEIR END ZONE',
      body: 'Two teams, one ball. The offense has the ball and tries to get it into the other team’s end zone. The defense tries to stop them.',
    },
    field: {
      title: 'The field',
      body: '100 yards to play on, plus a 10-yard end zone at each end.',
      example: 'All together: 120 × 53⅓ yards (360 × 160 ft), about 109.7 × 48.8 meters.',
    },
    endzones: {
      title: 'End zones',
      body: 'Get the ball into the other team’s end zone: touchdown.',
      example: 'The goal line is the front edge of the end zone. A player holding the ball only needs to get the tip of the ball to the goal line. It doesn’t have to cross it.',
    },
    teams: {
      title: '11 vs 11',
      body: 'Each team has 11 players on the field.',
      example: 'A 12th player on the field during a play = 5-yard penalty.',
    },
    downs: {
      title: '4 tries to go 10 yards',
      body: 'Each try is a down. The offense needs to gain at least 10 yards in 4 downs.',
      example: 'Got 10+ yards, in one play or several? The count resets: 1st & 10 again. Didn’t? The other team gets the ball.',
      steps: [
        'Start: 1st & 10',
        'Run, +4 yards',
        'Pass, +7 → 11 yards total: reset to 1st & 10!',
        'Run, +3 yards',
        'Incomplete pass: ball comes back, down is used',
        'Run, +5 yards',
        '4th & 2: most teams punt — kick it away',
      ],
    },
    run: {
      title: 'Running the ball',
      body: 'The QB hands the ball to the running back (RB). The RB runs until tackled or out of bounds.',
      example: 'Handing the ball forward is only legal to an eligible player behind the line, like the RB.',
    },
    pass: {
      title: 'Passing the ball',
      body: 'One forward pass per play, thrown from behind the line of scrimmage.',
      example: 'Caught → complete, keep running. Hits the ground → incomplete: the down is used and the ball goes back.',
    },
    touchdown: {
      title: 'Touchdown: 6 points',
      body: 'Carry the ball into the other team’s end zone, or catch it there.',
      note: 'Not like soccer! The ball doesn’t have to cross the line. Touchdown = a player holding the ball gets just the tip of it to the goal line. A loose ball (nobody holding it) in the end zone only counts if a player grabs it there.',
    },
    try: {
      title: 'After a TD: 1 or 2 more points',
      body: 'The team that scored gets one bonus play. It picks one option:',
      bullets: [
        '1-point attempt: kick it through the posts from the 15 → 1 point.',
        '2-point attempt: from the 2, run or pass. The offense must score a “touchdown” (reach the end zone with the ball) → 2 points.',
      ],
      kick: '1-pt attempt: kick from the 15',
      two: '2-pt attempt: run/pass from the 2',
    },
    fieldGoal: {
      title: 'Field goal: 3 points',
      body: 'Kick the ball over the crossbar and between the uprights. The whole ball must go through.',
      example: 'When? Usually on 4th down, when the offense is stuck. Close enough to the posts → kick a field goal. Too far → punt it away.',
    },
    safety: {
      title: 'Safety: 2 points for the defense',
      body: 'Tackle the ball carrier in his own end zone.',
      note: 'Double win for the defense: the team that gave up the safety must then kick the ball to them from its own 20. So they score 2 and (almost always) get the ball too.',
    },
    scoring: {
      title: 'Every way to score',
      rows: [
        { label: 'Touchdown', pts: '6', after: {
          title: 'Only after a touchdown: one bonus play',
          rows: [['1-point attempt: kick', '+1'], ['2-point attempt: run or pass in', '+2']],
        } },
        { label: 'Field goal', pts: '3' },
        { label: 'Safety', pts: '2' },
      ],
      example: 'Most points at the end wins.',
    },
    offense: {
      title: 'The offense',
      body: 'At least 7 players must line up on the line of scrimmage.',
      example: 'Linemen (50–79) block and can’t catch passes. Receivers wear 0–49 or 80–89.',
    },
    defense: {
      title: 'The defense (4-3)',
      body: '4 linemen, 3 linebackers, 4 defensive backs.',
      example: 'Linebackers stand 3–5 yards back. Safeties are deepest, 10–15 yards back.',
    },
    stFieldGoal: {
      title: 'Special teams: field goal',
      body: 'For kicks, a special unit comes in. The long snapper snaps, the holder sets the ball, the kicker kicks. The rest just block. Tap a highlighted player.',
      note: 'Who holds the ball? Usually the punter (sometimes the backup QB). Teams almost never keep a player just to hold.',
    },
    stPunt: {
      title: 'Special teams: punt',
      body: 'On 4th down the punt unit comes in. The long snapper snaps the ball about 15 yards back to the punter, who kicks it far. The gunners race to tackle the returner. Tap a highlighted player.',
    },
    end: {
      title: 'That’s the basics!',
      body: 'You now know the field, how to score, who plays where, and how the ball moves.',
      example: 'Next up: common fouls, then ties & overtime.',
    },
  },

  groups: {
    ol: 'Offensive line — blocks',
    backs: 'Backs — run & lead',
    rec: 'Receivers — catch',
    dl: 'Defensive line — rush',
    lb: 'Linebackers — everything',
    db: 'Defensive backs — cover',
  },

  positions: {
    QB: { name: 'Quarterback', role: 'Leads the offense. Takes the snap, then hands off, runs or passes.' },
    C: { name: 'Center', role: 'Snaps the ball to the QB and directs the blocking.' },
    G: { name: 'Guard', role: 'Blocks pass rushers and opens running lanes. Lines up next to the center.' },
    T: { name: 'Tackle', role: 'Protects the QB and opens running lanes. Lines up outside the guards.' },
    TE: { name: 'Tight end', role: 'Blocks on runs, catches passes on pass plays. Lines up at the end of the line.' },
    WR: { name: 'Wide receiver', role: 'Catches passes. Fast. Lines up out wide, near the sideline.' },
    RB: { name: 'Running back', role: 'The main ball carrier. Lines up in the backfield.' },
    FB: { name: 'Fullback', role: 'Blocks for the running back; can also run or catch.' },
    DE: { name: 'Defensive end', role: 'Rushes in to pressure or sack the QB. Outside edge of the line.' },
    DT: { name: 'Defensive tackle', role: 'Stops the run and disrupts plays. Lines up across from the guards.' },
    MLB: { name: 'Middle linebacker (Mike)', role: 'Stops the run, covers passes, rushes the QB. 3–5 yards back.' },
    SLB: { name: 'Strong-side linebacker (Sam)', role: 'Linebacker on the tight end’s side.' },
    WLB: { name: 'Weak-side linebacker (Will)', role: 'Linebacker on the side away from the tight end.' },
    CB: { name: 'Cornerback', role: 'Covers the wide receivers.' },
    SS: { name: 'Strong safety', role: 'Defends the pass and helps against the run. Closer, on the tight end’s side.' },
    FS: { name: 'Free safety', role: 'The deepest defender. Defends the pass and reads the QB.' },
    K: { name: 'Placekicker', role: 'Kicks field goals, extra points and kickoffs.' },
    P: { name: 'Punter', role: 'Punts the ball on 4th down from about 15 yards back. Usually also the holder on field goals.' },
    LS: { name: 'Long snapper', role: 'Snaps the ball back to the holder or punter.' },
    H: { name: 'Holder', role: 'Catches the snap about 7–8 yards back and sets the ball for the kicker. Usually it’s the punter.' },
    KR: { name: 'Returner', role: 'The other team’s fast player who catches the kick and tries to run it back.' },
    GUN: { name: 'Gunner', role: 'Lines up near the sideline and sprints downfield to tackle the returner.' },
    PP: { name: 'Personal protector', role: 'Lines up 1–3 yards behind the line and blocks for the punter.' },
  },
};

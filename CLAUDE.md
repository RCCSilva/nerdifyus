# nerdifyus

A static website for nerding out on topics: learning them in depth and explaining them to anyone curious.
First topic: **NFL** — basic rules → strategy → salary cap mechanics.

## Non-negotiable: references

Every factual claim on the site must trace back to a reference.
- Research notes in `research/` cite a source for each claim (see `research/README.md` for the format).
- Pages show their sources to readers (a "Sources" section per page, inline markers where useful).
- If something can't be sourced, it is either labelled as opinion/interpretation or left out. On slides, interpretation goes in the purple "Interpretation" box (`insight` in the slide text), separate from the yellow "Important" box (`note`, sourced facts). A teal box with its own title (`aside: { title, body }`, sourced) is for extras like "How to beat it". Ground it in the closest sourced rules and cite those.
- References only: never explain from prior/trained knowledge. If no source supports it, it doesn't go on the site.
- Official sources first. For the NFL, that's the official rulebook PDF and operations.nfl.com, archived in `research/<topic>/raw/`. `raw/` is gitignored: those files are third-party copyrighted, so they stay local and `sources.md` links the original URL.
- Fallback: explainer websites, cited by exact URL and access date.
- Real examples (games, plays, contracts) are welcome, each with an exact reference.

## Two agents, one-way flow

```
sources (PDFs, sites, docs) ──► researcher ──► research/<topic>/*.md ──► web-dev ──► site/
```

- **researcher** (`.claude/agents/researcher.md`): reads sources, writes cited notes. Never touches `site/`.
- **web-dev** (`.claude/agents/web-dev.md`): builds the site from the notes. Never adds facts that aren't in `research/`.

If web-dev needs a fact that isn't in the notes, it asks for research. It does not make one up.

## Tech

- React 19 + Vite, built to static files (`site/dist`). Hash routing (`#/en/nfl/basics?s=3`), so any static host works.
- No UI or animation libraries. The field is hand-drawn SVG, to scale from Rulebook Rule 1 (`site/src/components/field/`). Animations use `requestAnimationFrame` timelines (`motion.js`) and CSS. Use D3 later only for data charts (e.g. the salary cap).
- Respect `prefers-reduced-motion`: timelines jump to their end state.
- Commands (in `site/`): `npm run dev`, `npm run build`, `npm run preview`, `npm test` (Vitest + jsdom, tests in `src/__tests__/`).
- Deploy: every push to `main` runs the tests, builds `site/` and publishes it to GitHub Pages (`.github/workflows/deploy.yml`) at http://rccsilva.com/nerdifyus/.
- `index.html` opts out of browser auto-translation (`translate="no"`), since we ship our own translations.
- Effects must never return a value implicitly: write `useEffect(() => { fn(); }, deps)`, not `useEffect(() => fn(), deps)`. Current Chrome returns a Promise from `scrollTo`, React then calls it as a cleanup, and the page crashes (this broke the language switch once). The tests stub `scrollTo` to return a Promise to catch this.

## Lesson format: a tap-through deck

Lessons are slide decks, not articles. People don't want to read walls of text.
- One idea per slide: a **visual** (usually the field), a title, 1–2 short sentences, an optional example, and source chips.
- Navigation: arrows, ← → keys, swipe, progress segments, and the topic sidebar (every lesson, every slide; a drawer on phones). The current slide is in `?s=N`.
- Always start from the basics, and be direct.
- **No sub-slides.** Don't put steppers, dots or auto-advancing stages inside a slide. When a visual has several static parts (rounds of a bracket, variants of a foul), stack them vertically so readers scroll at their own pace, especially on phones. A continuous animation (like a play) is fine: it's a short video. A step-by-step animation (frames that change on a timer, like the downs drive) is a `StopMotionScene`, so readers can stop and step at their own pace.
- **Every slide visual is a scene** (`site/src/components/scene/Scene.jsx`), so they all look the same: a header (what to look at: `Legend`, `Hint`, `StateLine`), the picture, and a footer (legends, a chart, a player card). Three kinds:
  - `StillScene`: a picture that doesn't move (e.g. 11 vs 11, the lineups).
  - `FluidScene`: a continuous animation, like a short video (run, pass, kicks); children get the time `t`.
  - `StopMotionScene`: a few frames with a frame indicator and back / play-pause / forward. It never loops: back is disabled on the first frame, forward on the last, playback stops at the end.
- One topic per lesson, but don't over-split: e.g. offense, defense and special teams live together in one "Positions" lesson.

## i18n

- Languages: `en`, `es`, `pt-BR`. The language is the first URL segment.
- Strings live in `messages/<locale>.js` files: `site/src/i18n/messages/` for the UI, and `site/src/topics/<topic>/messages/` for content. Missing keys fall back to English.
- To add a language, add it to `site/src/i18n/config.js` and add a `<locale>.js` next to every `en.js`.
- Every new UI string or slide text needs all three languages.

## Layout

```
CLAUDE.md
.claude/agents/        agent definitions
research/              cited notes, one folder per topic
  README.md            note + citation format
  <topic>/
    sources.md         every source used for the topic
    raw/               archived source PDFs (cite these)
    NN-<subject>.md    notes, ordered basic → advanced
site/src/
  components/field/    Field (SVG), players/ball, motion helpers
  components/deck/     slide deck
  components/scene/    the shared frame for slide visuals (still / fluid / stop motion)
  components/referee/  the referee figure and the official signals (drawn from the rulebook's descriptions)
  pages/TopicLayout    sidebar: every lesson of a topic, with live lessons' slides nested below
  i18n/                locale config + UI strings
  topics/registry.js   topics → lessons
  topics/<topic>/      sources.js, messages/, <lesson>/slides.js + visuals.jsx
```

## Content structure

Each topic = one hub page + pages ordered by level: **basic → intermediate → advanced**.
Adding a topic means adding `research/<topic>/` and its pages. Don't change the structure for it.

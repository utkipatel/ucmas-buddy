# Epic 001: Study mode — Plan

Status: **Draft**, waiting for review
Spec: [spec.md](spec.md)

## 1. Stack

| Choice | Why |
|---|---|
| **Vite** | Dev server with instant reload; builds static files for GitHub Pages. |
| **TypeScript**, strict mode | Catches mistakes early; makes the data model explicit. |
| **React** | The most common frontend framework, so the skills transfer. Components map cleanly onto the app: an abacus, a study screen, a settings panel. |
| **SVG** (written as JSX) for the abacus | Scales sharply to any screen size; each bead is an element we can style and test. |
| **Vitest** | Test runner that shares Vite's config; runs TypeScript directly. |
| **React Testing Library** + jsdom | Tests components the way a user sees them, without a real browser. |
| **ESLint + Prettier** | Lint and format, enforced in CI. |
| **GitHub Actions** | CI on every PR; deploys to GitHub Pages on every merge to `main`. |

Node 26, npm.

## 2. File layout

```
index.html                 page shell
src/
  main.tsx                 entry point: mounts <App />
  App.tsx                  top-level component: holds settings state
  style.css
  abacus/
    model.ts               number -> rod and bead state (pure logic)
    Abacus.tsx             <Abacus rods={...} />: draws the SVG
  practice/
    generator.ts           random numbers within a digit range
    session.ts             study mode round and score logic (pure)
    StudyScreen.tsx        abacus, Reveal / Check / Next, answer input, score
    SettingsPanel.tsx      digit range and answer style controls
  settings.ts              load and save settings in browser storage
  **/*.test.ts(x)          tests sit next to the code they test
.github/workflows/
  ci.yml                   typecheck, lint, format check, test, build
  deploy.yml               build and publish to GitHub Pages
```

The rule: **logic is pure and tested; components are thin.** Everything
that decides *what* to show lives in `model.ts`, `generator.ts`, `session.ts`
and `settings.ts`, which don't import React. Components hold state with
`useState`, call those functions, and render the result.

## 3. Data model

```ts
// abacus/model.ts
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface Rod {
  upper: boolean;          // true = the 5-bead is on the beam
  lower: 0 | 1 | 2 | 3 | 4; // number of 1-beads on the beam
}

const ROD_COUNT = 11;
const UNIT_ROD = 6;               // 1-based; the ones digit goes here
const MARKER_RODS = [3, 6, 9];    // rods with a dot on the beam

function digitToRod(d: Digit): Rod;
function numberToRods(n: number): Rod[]; // always 11 rods; throws if n is
                                         // not an integer in 0..999999
```

```ts
// practice/generator.ts
interface DigitRange { min: number; max: number } // 1 <= min <= max <= 6

// `random` returns a value in [0, 1). Injected so tests are repeatable.
function generateNumber(range: DigitRange, random = Math.random): number;
```

```ts
// practice/session.ts
type AnswerStyle = "self-check" | "type-it";

interface SessionState {
  number: number;
  phase: "asking" | "revealed"; // revealed = after Reveal or Check
  lastAnswerCorrect?: boolean;  // type-it only
  score: { correct: number; attempted: number };
}

// Pure functions: take a state, return a new one. StudyScreen keeps a
// SessionState in useState and replaces it with the result.
function reveal(s: SessionState): SessionState;               // self-check
function check(s: SessionState, typed: string): SessionState; // type-it
function next(s: SessionState, newNumber: number): SessionState;
function resetScore(s: SessionState): SessionState;
```

```ts
// settings.ts
interface Settings { range: DigitRange; answerStyle: AnswerStyle }
const DEFAULT_SETTINGS: Settings; // range 1-3, self-check

// Storage is passed in, so tests don't need a browser. Bad or missing
// saved data falls back to the defaults.
function loadSettings(storage: Storage): Settings;
function saveSettings(storage: Storage, s: Settings): void;
```

## 4. Abacus drawing

- One SVG with a fixed `viewBox`, scaled to the screen width with CSS. On a
  360px screen each rod gets about 30px.
- Frame and beam in wood tones; beads are flattened diamonds like soroban
  beads; marker dots on rods 3, 6 and 9.
- A bead on the beam touches it; a bead away from the beam sits against the
  frame, with a clear gap. Beads on the beam get a slightly stronger color so
  the reading is obvious at a glance (F2).

## 5. How each acceptance criterion is checked

| AC | Checked by |
|---|---|
| AC1 bead layout | Unit tests on `numberToRods` (every digit, 1–6 digit numbers, bounds) plus an `<Abacus>` component test that counts beads on the beam per rod |
| AC2 digit range | Unit tests on `generateNumber` with a fake `random`, plus a many-runs test |
| AC3 self-check | Unit tests on `session.ts`, plus a `<StudyScreen>` test: number hidden until Reveal is clicked, no score shown |
| AC4 type-it scoring | Unit tests on `check` (right, wrong, extra spaces, empty input), plus a `<StudyScreen>` test that types an answer |
| AC5 fits on phone | Manual check at 360px wide in browser dev tools and on a real phone |
| AC6 settings persist | Unit tests on `loadSettings` / `saveSettings` with a fake storage |

## 6. Tasks

Each becomes a GitHub issue in milestone "001 Study mode", done in this
order, one PR each.

1. **chore: scaffold project** — Vite + React + TypeScript, ESLint,
   Prettier, Vitest, CI workflow, README with commands.
2. **feat: abacus model** — `model.ts` + tests. (AC1)
3. **feat: number generator** — `generator.ts` + tests. (AC2)
4. **feat: draw abacus** — `<Abacus>` component + test (sets up React
   Testing Library); the page shows a fixed number. (AC1, AC5)
5. **feat: study mode logic** — `session.ts` + tests. (AC3, AC4)
6. **feat: settings storage** — `settings.ts` + tests. (AC6)
7. **feat: study mode screen** — `<StudyScreen>`, `<SettingsPanel>` and
   `<App>`: buttons, answer input, score, settings. (AC3–AC6)
8. **ci: deploy to GitHub Pages** — `deploy.yml`, Vite base path. (NFR)

## 7. Decisions and risks

- **Type-it answer parsing:** ignore spaces and commas (so `1,234` and
  `1 234` count as 1234); anything else that isn't a number is wrong.
- **Phone keypad:** the answer input uses `inputmode="numeric"`, which opens
  a number pad on iPhone and Android.
- **Browser storage can fail** (for example in some private browsing modes).
  Settings then fall back to defaults instead of breaking the app.
- **No end-to-end browser tests yet.** AC5 is checked by hand. If manual
  checks become tedious, a later epic can add Playwright.

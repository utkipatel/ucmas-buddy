# Epic 003: Play and test modes — Plan

Status: **Draft**, waiting for review
Spec: [spec.md](spec.md)

## 1. New library: React Router

Pages and their addresses are handled by **React Router**, the most widely
used routing library for React. Version **8.4**: the newest release (8.5.1)
is only days old, and waiting a few weeks for a new release to settle is a
common precaution.

It uses **hash addresses** (`#/play`, `#/test`). GitHub Pages only serves
real files, so an address like `/ucmas-buddy/test` would show GitHub's
"not found" page on reload. Everything after `#` stays in the browser, so
hash addresses always load the app.

## 2. File layout

```
src/
  main.tsx                   mounts the router
  App.tsx                    routes: #/play, #/test, anything else -> play
  layout/
    Layout.tsx               header (☰, mode name, ⚙) around each page
    NavMenu.tsx              side menu with Play and Test
  abacus/                    unchanged
  practice/                  shared answering pieces, unchanged where
                             possible (generator, session, vanish)
    SettingsPanel.tsx        gains an optional test length field
  modes/
    play/PlayPage.tsx        today's StudyScreen with Play's settings
    test/
      test.ts                test rules as pure functions (no React)
      TestPage.tsx           start screen, running test, results
  settings.ts                one saved settings entry per mode
```

## 3. Data model

```ts
// settings.ts
type Mode = "play" | "test";

interface PlaySettings { range: DigitRange; vanish: VanishSettings }
interface TestSettings extends PlaySettings { minutes: 1 | 2 | 3 | 5 }

// Saved separately: "ucmas-buddy.play.v1" and "ucmas-buddy.test.v1".
// The old "ucmas-buddy.settings.v1" entry is read as the Play settings if
// there is no Play entry yet.
function loadPlaySettings(storage): PlaySettings;
function loadTestSettings(storage): TestSettings;
function savePlaySettings(storage, s): void;
function saveTestSettings(storage, s): void;
```

```ts
// modes/test/test.ts — times are passed in, so tests control the clock
interface TestState {
  phase: "ready" | "running" | "finished";
  endsAt: number | null;          // ms timestamp
  number: number;                 // shown number while running
  answers: { number: number; typed: string; correct: boolean }[];
}

function startTest(now: number, minutes: number, first: number): TestState;
function answerInTest(s: TestState, typed: string, next: number, now: number): TestState;
function finishIfTimeUp(s: TestState, now: number): TestState;
function timeLeftMs(s: TestState, now: number): number;
function results(s: TestState): { correct: number; answered: number };
```

The test ends at a fixed time (`endsAt`), worked out once at Start. The
countdown on screen is redrawn a few times a second from `endsAt - now`,
so it can't drift, and an answer typed after `endsAt` is rejected even if
the screen hasn't caught up yet.

## 4. How each acceptance criterion is checked

| AC | Checked by |
|---|---|
| AC1 side menu | `<App>` tests: open the menu, see both modes, current one marked, tap to switch |
| AC2 addresses | `<App>` tests rendered at `#/play`, `#/test`, `#/` and `#/nope` |
| AC3 settings per mode | `<App>` tests: save in one mode, check the other is unchanged |
| AC4 settings remembered | `settings.ts` tests: both modes round trip, old entry becomes Play's |
| AC5 test running | `test.ts` unit tests, plus a `<TestPage>` test with fake timers |
| AC6 time up and results | `test.ts` tests (late answers rejected), `<TestPage>` test of the results list |
| AC7 start again | `<TestPage>` test |
| AC8 settings disabled | `<App>` test during a running test |

## 5. Tasks

1. **feat: pages and navigation** — React Router with hash addresses, the
   layout with ☰ and ⚙, the side menu, Play at `#/play` and a placeholder
   at `#/test`. (AC1, AC2)
2. **feat: settings per mode** — separate saved settings, moving the old
   entry to Play, the test length field. (AC3, AC4)
3. **feat: test rules** — `test.ts` and its tests. (AC5, AC6)
4. **feat: test page** — start screen, running test, results, settings
   button disabled while running. (AC5–AC8)

## 6. Decisions and risks

- **Phone asleep or app in the background during a test:** the timer is
  based on the clock, not on counting ticks, so the test still ends at the
  right moment; the results show when the learner comes back.
- **Old saved settings:** read once into Play's entry; the old entry is
  left in place, harmless, so nothing is lost if something goes wrong.

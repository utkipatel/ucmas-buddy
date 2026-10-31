# Epic 002: Vanish mode — Plan

Status: **Done** (shipped 2026-10-31; frozen, do not edit)
Spec: [spec.md](spec.md)

## 1. Approach

No new libraries. Three small changes on top of epic 001:

1. **Settings** gain a vanish part, saved and validated like the digit
   range.
2. **`<Abacus>`** gains a `beadsHidden` prop that leaves out the beads but
   draws everything else. The SVG keeps its fixed `viewBox`, so its size
   never changes (F3, AC4).
3. **`<StudyScreen>`** gains a `vanishAfterMs` prop. A timer hides the
   beads after that long, and restarts with each new number.

## 2. Data model

```ts
// settings.ts
interface VanishSettings {
  enabled: boolean;
  seconds: number; // 0.2 to 3.0, in 0.1 steps
}

interface Settings {
  range: DigitRange;
  vanish: VanishSettings;
}

const DEFAULT_SETTINGS: Settings = {
  range: { min: 1, max: 3 },
  vanish: { enabled: false, seconds: 0.5 },
};

const VANISH_SECONDS = { min: 0.2, max: 3, step: 0.1 };
```

- `loadSettings` checks the vanish part on its own: a missing or invalid
  value falls back to its default without touching the digit range.
  Settings saved before this epic have no `vanish` field and load with
  vanish mode off.
- Seconds are rounded to one decimal place when loaded, so floating-point
  noise like 0.30000000000000004 never shows up.

## 3. Components

- **`<Abacus rods beadsHidden?>`**: when `beadsHidden` is true, the bead
  shapes are not drawn. Frame, rods, beam and dots are unchanged.
- **`<StudyScreen range vanishAfterMs?>`**: `vanishAfterMs` is null when
  vanish mode is off. A `round` counter goes up with every answer; an
  effect keyed on it starts two timers: one marks the beads as fading at
  `vanishAfterMs` minus the fade time, the other hides them at
  `vanishAfterMs`. The fade itself is a CSS opacity transition, so it
  ends exactly when the beads are removed. Keying on the
  round, not the number, means a number that repeats still gets its full
  showing, and Reset score doesn't re-show a vanished number.
- **`<SettingsPanel>`**: a checkbox for vanish mode and, while it is on, a
  range input (`<input type="range">`) with an `<output>` showing the
  value. "Changed" (which enables Save) now compares the whole settings
  object.
- **`<App>`**: passes `vanishAfterMs` and includes the vanish settings in
  the study screen's key, so saving them starts a fresh round.

## 4. How each acceptance criterion is checked

| AC | Checked by |
|---|---|
| AC1 off: beads stay | `<StudyScreen>` test with fake timers: beads still drawn long after the number appears |
| AC2 on: beads vanish | `<StudyScreen>` test with fake timers: beads drawn just before T, gone at T, frame still drawn |
| AC3 each new number | `<StudyScreen>` test: answer, then the new number's beads are back and vanish after T |
| AC4 nothing moves | `<Abacus>` test: same `viewBox` and element with beads hidden; manual check on a phone |
| AC5 slider | `<SettingsPanel>`/`<App>` tests: range, step, default, value label, only shown when on |
| AC6 persisted | `settings.ts` tests: round trip, missing field, bad values, rounding |

Fake timers (Vitest's `vi.useFakeTimers()`) let tests jump ahead in time
instead of waiting for real seconds.

## 5. Tasks

1. **feat: vanish settings** — `settings.ts` and the settings panel
   (switch, slider, value label). (AC5, AC6)
2. **feat: vanish the abacus** — `beadsHidden` on `<Abacus>`, the timer
   in `<StudyScreen>`, wiring in `<App>`. (AC1–AC4)

## 6. Decisions and risks

- **Timer accuracy:** browsers run timers a few milliseconds late at
  most, which is fine for 0.2 seconds and up.
- **Phone in the background:** if the learner switches apps while a
  number is showing, the timer may fire late; the beads vanish when they
  come back. Acceptable.

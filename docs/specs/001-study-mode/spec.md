# Epic 001: Study mode — Spec

Status: **Approved**
Last updated: 2026-10-30 (self-check removed, settings Save button and
keyboard fix, from phone testing after the first deploy)

## 1. Purpose

UCMAS Buddy helps a beginner learn to read numbers on a UCMAS (soroban-style)
abacus. The app shows a random number as beads on the abacus. The learner reads
it (out loud if they like) and types it, and the app checks the answer. Regular
practice builds the bead-to-number recognition that UCMAS mental math (anzan)
depends on.

**User:** an adult beginner practicing on a phone, tablet or laptop, usually in
short sessions.

## 2. Abacus model

These rules match a physical UCMAS abacus.

- The app shows **11 rods**, numbered 1–11 from left to right.
- Each rod has **1 upper bead** worth 5 and **4 lower beads** worth 1 each,
  separated by a horizontal **beam**.
- A bead **counts only when pushed against the beam**. A rod at rest (all beads
  away from the beam) shows 0.
- Every digit 0–9 has exactly one bead position:

  | Digit | Upper bead | Lower beads on beam |
  |-------|------------|---------------------|
  | 0–4   | away       | 0–4                 |
  | 5–9   | on beam    | 0–4 (digit − 5)     |

- The beam has **unit-marker dots on rods 3, 6 and 9**.
- **Rod 6 (center) is the unit rod.** Every number ends on it: the ones digit
  goes on rod 6, tens on rod 5, and so on. So a number has at most **6 digits**.
- Rods 7–11 are always at 0 in v1, and so is any rod to the left of the
  number's first digit.

Example: 342 → rod 4 = 3, rod 5 = 4, rod 6 = 2; all other rods 0.

## 3. Features (v1)

### F1. Random number generation
- The learner sets a **digit range** with a minimum and maximum, each from 1
  to 6. *Default: 1 to 3.*
- Each new number picks a digit count at random within the range. It never
  starts with 0. *Default: the number 0 itself is never generated.*

### F2. Abacus display
- Looks **close to a real abacus**: a frame, rods, a beam with the unit dots,
  and bead shapes like a physical one. Drawn cleanly, without photo textures.
- The bead positions must be unmistakable at a glance: a bead is clearly on
  the beam or clearly away from it.
- Fits without scrolling on a phone in portrait (from 360px wide), a tablet,
  and a laptop.

### F3. Study mode (the only mode in v1)
One tap per number:
1. A new number appears on the abacus.
2. The learner enters the number on a numeric keypad and taps **Next** (or
   presses Enter).
3. The app scores the answer and right away shows a new number. A short
   result line says whether the last answer was right and, if not, what the
   number was. It stays until the next answer.

Typing is the only way to answer in v1. (An earlier "self-check" style, where
the learner revealed the number and checked themselves, was removed after
phone testing: voice input will cover answering out loud, with checking.)

### F4. Session score
- Shows **correct / attempted** for the current session, for example `7 / 9`.
- A **Reset** control sets the score to 0 / 0.
- The score isn't saved. Reloading the page starts a new session.

### F5. Settings
- Digit range (F1).
- Opened from a **menu button in the header**, as a side panel over the
  study screen, so the screen itself stays uncluttered.
- Changes take effect only when the learner taps **Save**. Closing the panel
  without saving keeps the previous settings.
- Saving starts a new number and resets the score, because scores at
  different settings can't be compared. The settings panel says so.
- *Default: settings are remembered on the device* (in browser storage), so the
  learner doesn't set them again each time.

## 4. Acceptance criteria

- **AC1:** Given any number from 1 to 999999, the abacus shows each digit on
  the correct rod with the correct beads, ending on rod 6, and all other rods
  at 0.
- **AC2:** Given a digit range of 2 to 4, every generated number has 2, 3 or 4
  digits and never starts with 0.
- **AC3:** *Removed* (was: self-check style hides the number until Reveal).
- **AC4:** Entering the shown number and tapping Next
  counts as correct, and any other entry counts as wrong and shows what the
  number was. Either way, "attempted" goes up by one and a new number
  appears.
- **AC5:** On a 360px-wide phone screen in portrait, the whole abacus and the
  controls are visible without scrolling or zooming, including while the
  number pad is open.
- **AC6:** After a reload, the digit range is the same as before, and the
  score is 0 / 0.
- **AC7:** Changing the digit range in settings has no effect until Save is
  tapped. Save applies it, shows a new number and resets the score to 0 / 0.
  Closing the panel without saving keeps the old range.

## 5. Non-functional requirements

- Static website, no server or account. Hosted on GitHub Pages.
- Works in current Safari (iPhone, iPad, Mac) and Chrome.
- Nothing the learner does leaves their device.
- The number-to-beads logic and number generation have unit tests.

## 6. Out of scope for v1

- Flash mode
- Timed tests
- Voice input and spoken feedback
- Decimals (using rods 7–11)
- Addition and subtraction exercises
- Moving beads by hand
- Long-term progress history and accounts

Future ideas are tracked as epic issues on GitHub (label `epic`).

## 7. Open questions

- None right now. The defaults in *italics* above are guesses; change any of
  them during review.

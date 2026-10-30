# Epic 002: Vanish mode — Spec

Status: **Approved**
Last updated: 2026-10-30
Epic issue: #2

## 1. Purpose

In UCMAS, learners see an abacus only briefly and then work from the
picture in their mind (anzan). Vanish mode trains that: each number shows
on the abacus for a short, adjustable time, then the beads disappear, and
the learner types the number from memory.

Builds on epic 001 (study mode). Everything there still applies; this epic
only adds the vanishing.

## 2. Features

### F1. Vanish settings
- A **Vanish mode** switch in the settings panel. *Default: off.*
- A **vanish time** slider, shown while the switch is on: from 0.2 to 3.0
  seconds in steps of 0.1. *Default: 0.5 seconds.* The current value is
  shown next to the slider (for example "0.5 s") and updates while
  dragging.
- Works like the other settings (epic 001, F5): changes apply on Save,
  which starts a new number and resets the score, and the settings are
  remembered on the device.

### F2. Vanishing
- With vanish mode on, each new number shows on the abacus for the vanish
  time, then the **beads disappear**. The frame, rods, beam and unit dots
  stay, so it's clear the abacus is hidden rather than showing 0.
- The timer starts when the number appears. Typing doesn't pause or
  restart it.
- The learner answers as usual (epic 001, F3). The next number shows and
  vanishes the same way.
- There is no way to see a vanished number again; that is the point of
  the exercise. The result line still says what the number was.
- With vanish mode off, the app behaves exactly as in epic 001.

### F3. Nothing moves
- When the beads vanish, nothing else on the screen moves: the abacus
  keeps its size, and the answer box, result line and score stay where
  they are.

## 3. Acceptance criteria

- **AC1:** With vanish mode off, the beads stay visible until the number
  is answered.
- **AC2:** With vanish mode on and a vanish time of T seconds, a new
  number's beads are visible when it appears and gone T seconds later,
  while the frame stays.
- **AC3:** After an answer, the next number's beads are visible again and
  vanish T seconds after it appears.
- **AC4:** Vanishing doesn't change the size or position of the abacus,
  the answer box, the result line or the score.
- **AC5:** The slider goes from 0.2 to 3.0 seconds in 0.1 steps, starts at
  0.5, and shows its current value. It is only shown while vanish mode is
  on.
- **AC6:** After saving and reloading, vanish mode and the vanish time are
  the same as saved. Bad or missing saved values fall back to the
  defaults (off, 0.5 seconds).

## 4. Out of scope

- A "peek" button to see a vanished number again
- Sounds or countdowns before a number appears
- Vanish mode as its own screen; it is a setting. (Modes, epic #27, may
  move it later.)

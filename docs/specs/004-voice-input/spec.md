# Epic 004: Voice input — Spec

Status: **Approved** (in progress)
Last updated: 2026-10-31
Epic issue: #5

## 1. Purpose

Today the learner answers by typing the number and tapping Next. In a
real UCMAS class, learners usually say the answer out loud, and typing
takes the eyes and hands away from the abacus.

This epic adds voice answers: the learner says the number, and the app
hears it and checks it, with no tapping. It works in both Play and Test.
Typing still works as before, at any time.

Speech recognition comes from the browser (the Web Speech API). It works
in Chrome and Safari, not in Firefox.

## 2. Features

### F1. Voice setting
- A **Voice answers** switch in the settings panel of each mode (Play and
  Test). *Default: off.*
- Works like the other settings (epic 001, F5): it applies on Save, which
  starts over, and each mode remembers its own choice on the device.
- **No speech recognition in this browser:** the switch doesn't appear.
  In its place, a short note says that voice answers need Chrome or
  Safari.

### F2. Listening
- With voice answers on, the app listens for an answer while a number is
  showing, so the learner can answer without touching the screen:
  - **Play:** from the first number on.
  - **Test:** from Start until the time runs out.
  - With vanish mode on, listening starts when the number appears, not
    when the beads vanish.
- A small indicator under the abacus shows **🎤 Listening…** while the
  app is listening.
- The app keeps listening until it hears a number or the learner types an
  answer. Short silences don't stop it.
- The app stops listening while the settings panel is open, when the
  learner leaves the page, and when a test ends. It starts again when
  that's over (for example, when the settings panel closes).
- The answer box stays, so the learner can type an answer at any time.
  With voice answers on, the answer box doesn't take the focus by itself,
  so a phone's keyboard stays closed until the learner taps the box.

### F3. Answering by voice
- When the app hears a number, it counts as the answer right away, as if
  the learner had typed it and tapped Next. The right/wrong message, the
  score and the next number all work exactly as with typing.
- The app understands numbers said in English, whether the browser writes
  them as digits ("412") or words ("four hundred twelve"). Common
  sound-alikes count as the number they sound like, for example "for" as
  4 and "to" as 2.
- If the app hears something that isn't a number, it doesn't count as an
  answer. The indicator says **Didn't catch a number, try again**, and
  the app keeps listening.
- The app doesn't speak. Results show on screen only, as they do today.
- In the Test results list, a wrong answer says what the learner said or
  typed, for example `✗ 412, you answered 41` (today it says "you
  typed").

### F4. Microphone permission
- The browser asks for permission to use the microphone the first time
  the app listens.
- If the learner blocks the microphone, or listening fails for another
  reason, the indicator is replaced by a short message (for example
  **Microphone blocked. You can still type your answers.**). Typing keeps
  working, and the voice setting stays as it is.

## 3. Acceptance criteria

- **AC1:** Play and Test each have a Voice answers switch, off by
  default, saved and remembered per mode like the other settings.
- **AC2:** In a browser without speech recognition, the switch doesn't
  appear and the settings panel says voice answers need Chrome or Safari.
- **AC3:** With voice answers on, the app shows "Listening…" while a
  number is showing (in Test, only while the test runs), and stops
  listening while the settings panel is open and after a test ends.
- **AC4:** Saying the number shown counts as an answer straight away: the
  right/wrong message and score update and the next number appears, the
  same as typing it and tapping Next.
- **AC5:** Numbers are understood whether recognized as digits or as
  English words, including common sound-alikes such as "for" and "to".
- **AC6:** Speech that isn't a number doesn't count as an answer; the app
  says it didn't catch a number and keeps listening.
- **AC7:** With voice answers on, typing an answer and tapping Next still
  works, and the answer box doesn't take the focus by itself.
- **AC8:** If the microphone is blocked or listening fails, the app says
  so and typing keeps working.
- **AC9:** Test results show a wrong answer as "you answered …", whether
  it was said or typed.

## 4. Out of scope

- The app speaking results aloud.
- Languages other than English.
- Firefox and other browsers without the Web Speech API (no fallback or
  third-party speech service).
- A mic button for answering one number at a time (hands-free listening
  only).
- Asking the learner to confirm a heard number before it counts.

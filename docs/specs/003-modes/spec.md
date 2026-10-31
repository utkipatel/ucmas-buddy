# Epic 003: Play and test modes — Spec

Status: **Draft**, waiting for review
Last updated: 2026-10-31
Epic issue: #27

## 1. Purpose

So far the app has one screen for open-ended practice. This epic splits it
into two modes:

- **Play**: today's practice screen. Answer at your own pace with a running
  score.
- **Test**: a timed test. Answer as many numbers as possible before the time
  runs out, then see how it went.

Each mode has its own page, its own web address and its own settings.
Everything from epics 001 and 002 (the abacus, answering, vanish mode)
works in both.

## 2. Features

### F1. Navigation
- The menu button (☰, left of the header) opens a side menu listing
  **Play** and **Test**. The current mode is highlighted. Tapping a mode
  goes there and closes the menu.
- Each mode has its own address: `.../ucmas-buddy/#/play` and `#/test`.
  The plain address opens Play. The browser's back button moves between
  modes, and either address can be bookmarked or added to a phone's home
  screen.
- The header shows the current mode's name.
- Leaving a page discards its unsaved state (a Play score or a running
  test), the same as a reload.

### F2. Settings per mode
- A settings button (⚙, right of the header) opens the settings panel for
  the current mode. It works as before (epic 001, F5): changes apply on
  Save, which starts over, and are remembered on the device.
- **Play settings:** digit range and vanish mode.
- **Test settings:** digit range, vanish mode and **test length**: 1, 2, 3
  or 5 minutes. *Default: 1 minute.*
- Each mode remembers its own settings. Settings saved before this epic
  become the Play settings; Test starts with the defaults (1-3 digits,
  vanish off, 1 minute).
- The settings button is disabled while a test is running.

### F3. Play mode
- Exactly the screen from epics 001 and 002, at `#/play`.

### F4. Test mode
1. **Before the test:** a short summary of the test (length, digit range,
   vanish on or off) and a **Start** button.
2. **During the test:** numbers appear and are answered like in Play
   (type, then Next), with vanish mode if it's on. The screen shows the
   **time left** (for example `0:42`) and how many numbers have been
   answered. There is no right/wrong message after each answer, so the
   learner keeps their focus.
3. **When time runs out:** answering stops right away. A number that was
   showing but not yet answered doesn't count.
4. **Results:** correct / answered (for example `14 / 17`), then a list of
   each number with the learner's answer, marked right or wrong. A
   **Start again** button begins a new test with the same settings.

## 3. Acceptance criteria

- **AC1:** The side menu lists Play and Test, highlights the current mode,
  and tapping one shows that mode and closes the menu.
- **AC2:** `#/play` shows Play, `#/test` shows Test, and an address without
  a mode (or an unknown one) shows Play.
- **AC3:** Each mode's settings panel shows that mode's settings, and
  saving changes one mode's settings without changing the other's.
- **AC4:** After a reload, each mode's saved settings are the same as
  before. Settings saved before this epic appear as Play's settings.
- **AC5:** In Test, Start begins a test of the set length; the time left
  counts down and the answered count goes up with each answer.
- **AC6:** When the time is up, no more answers are accepted and the
  results show correct / answered and every answer, marked right or wrong.
  An unanswered last number isn't counted.
- **AC7:** Start again begins a new test with a full timer and no answers.
- **AC8:** The settings button is disabled while a test is running.

## 4. Out of scope

- Fixed-count tests (answer N numbers). The old Test mode epic (#3) had
  them; they can come back later.
- Saving test results over time (epic #7).
- Pausing a test.
- Voice input (epic #5).

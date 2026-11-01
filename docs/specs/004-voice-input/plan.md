# Epic 004: Voice input — Plan

Status: **Draft** (waiting for approval)
Spec: [spec.md](spec.md)

## 1. Speech recognition in the browser

The app uses the browser's built-in **Web Speech API**
(`SpeechRecognition`), so there's no new library and no server. Chrome
and Safari only offer it under the older name `webkitSpeechRecognition`,
so the app looks for both. If neither exists, voice isn't supported
(spec F1).

How the app sets it up:

- **Language:** the browser's language if it is a kind of English (such
  as `en-IN` or `en-GB`), otherwise `en-US`. The spec only covers
  English.
- **`continuous: true`**, so a pause doesn't end listening. Browsers
  still stop on their own after a while (Chrome after about a minute of
  silence). When that happens, the app starts listening again, as long
  as it should still be listening (spec F2).
- **`maxAlternatives: 5`**: the browser returns up to five guesses for
  what was said, and the app uses the first one that reads as a number.
  This helps with sound-alikes ("for" vs "4").
- **Early guesses that settle** (`interimResults: true`). Hand testing
  showed Chrome takes 5-7 seconds after a short phrase like "seven" to
  call its result final. Learners then said the number again, and
  "nine nine" counted as 99. So the app also uses Chrome's early
  guesses: one that stays the same for 0.7 seconds counts as heard. A
  final result counts straight away. 0.7 seconds is long enough not to
  cut "forty... two" short.
- **One answer per number.** After a number is heard, the app stops the
  recognizer and starts a new one for the next number. Anything said
  just after the answer can't then spill over onto the next number.

## 2. File layout

```
src/
  voice/
    spokenNumber.ts       reads speech text as a number (pure, no React)
    recognizer.ts         wraps the browser's SpeechRecognition
    useVoiceAnswers.ts    React hook: listens while asked to, reports
                          heard numbers and the status to show
    VoiceStatus.tsx       "🎤 Listening…" and the other messages
  practice/
    Exercise.tsx          gains a `voice` prop: listens, and answers
                          with a heard number like a typed one
    SettingsPanel.tsx     gains the Voice answers switch, or the note
  modes/play/PlayPage.tsx passes voice on, paused while settings are open
  modes/test/TestPage.tsx same, and "you answered" in the results
  settings.ts             `voice: boolean` in each mode's settings
  test/fakeSpeech.ts      a fake SpeechRecognition for tests
```

## 3. Data model and functions

```ts
// settings.ts — Test's settings extend Play's, so both get it.
interface PlaySettings {
  range: DigitRange;
  vanish: VanishSettings;
  voice: boolean; // default false; missing or invalid when loaded → false
}
```

Saved settings keep the same keys (`ucmas-buddy.play.v1`,
`ucmas-buddy.test.v1`). Older saved settings have no `voice` field, so
they load with voice off. No new version is needed.

```ts
// voice/spokenNumber.ts
/** The number in what was said, or null if it isn't a number. */
function parseSpokenNumber(text: string): number | null;
/** The first of the browser's guesses that reads as a number. */
function firstNumber(alternatives: string[]): number | null;
```

`parseSpokenNumber` accepts:

- **Digits:** `"412"`, `"4,120"`, `"4 1 2"` (spaces and commas ignored,
  the same as typed answers).
- **Words, up to 999,999** (6 digits is the largest range): `"four
  hundred twelve"`, `"four hundred and twelve"`, `"forty-two"`, `"two
  thousand and five"`, `"zero"`, `"oh"`. Upper or lower case, with or
  without hyphens.
- **Single digits one by one:** `"four one two"` → 412, since some
  learners read the rods one at a time.
- **Mixes the browser sometimes produces:** `"4 hundred"`, `"2
  thousand 5"`.
- **Sound-alikes:** `for`/`fore` → 4, `to`/`too` → 2, `won` → 1, `ate`
  → 8, `tree` → 3. A short, fixed list, extended if testing finds more.
- Anything else (`"um"`, `"what"`, `"four apples"`) → null.

```ts
// voice/recognizer.ts
function isVoiceSupported(): boolean;

type ListenError = "blocked" | "failed";
interface Listener { stop(): void }

/** Starts listening; calls onHeard with the guesses for each phrase. */
function startListening(handlers: {
  onHeard: (alternatives: string[]) => void;
  onError: (error: ListenError) => void;
}): Listener;
```

`"blocked"` is the browser's `not-allowed` or `service-not-allowed`
error (microphone permission refused). `no-speech` and `aborted` are
normal and just restart listening. Every other error is `"failed"`.

```ts
// voice/useVoiceAnswers.ts
type VoiceStatus = "off" | "listening" | "not-a-number" | "blocked" | "failed";

/**
 * While `active`, listens and calls onNumber for each heard number.
 * `round` changes with every new number, which restarts listening.
 */
function useVoiceAnswers(options: {
  active: boolean;
  round: number;
  onNumber: (n: number) => void;
}): VoiceStatus;
```

`Exercise` already counts a `round` per number for vanish mode, so it
passes that in. A heard number goes through the same code as tapping
Next with a typed answer (`onAnswer(String(n))`), so scoring, the
result line and the Test timer rules don't change. The Test rule that
rejects answers after the time is up covers late voice answers too.

**When listening is active** (spec F2):

- Play: `settings.voice && !settingsOpen`.
- Test: the same, and only while the test runs. `Exercise` is only
  shown while running, so this follows on its own.
- Leaving the page unmounts the component, which stops listening.

With voice on, `Exercise` doesn't put the cursor in the answer box by
itself (no `autoFocus`), so a phone's keyboard stays closed.

**Test results:** the list says `you answered 41` instead of `you typed
41`. The `TestAnswer.typed` field keeps its name, to keep the change
small; its comment changes to "what the learner typed or said".

## 4. Testing without a microphone

Tests can't use a real microphone, so `src/test/fakeSpeech.ts`
installs a fake `SpeechRecognition` on `window`. Tests make it "hear"
text, end or fail, and check what the app does. Tests without it see a
browser without speech recognition, like Firefox.

Some things can only be checked by hand, in the deployed app (step 5 of
"How we work"): the permission prompt, Chrome and Safari on a computer,
Safari on an iPhone and Chrome on Android, and how well real speech
turns into the right numbers.

## 5. How each acceptance criterion is checked

| AC | Checked by |
|---|---|
| AC1 voice setting | `settings.ts` tests (default, round trip, old data); `<SettingsPanel>` test of the switch |
| AC2 no support | `<SettingsPanel>` test without the fake: no switch, note shown |
| AC3 listening | `useVoiceAnswers` tests; `<PlayPage>` and `<TestPage>` tests: listening while a number shows, stopped with settings open and after the test |
| AC4 answer by voice | `<PlayPage>` and `<TestPage>` tests: fake hears the number, result and score update, next number shows |
| AC5 numbers understood | `spokenNumber.ts` unit tests (digits, words, digit by digit, sound-alikes) |
| AC6 not a number | `spokenNumber.ts` tests; hook test shows "not-a-number" and keeps listening |
| AC7 typing still works | `<Exercise>` test with voice on: type and Next work, box not focused |
| AC8 mic blocked | `useVoiceAnswers` and `<Exercise>` tests with the fake failing |
| AC9 "you answered" | `<TestPage>` results test |

## 6. Tasks

Review is **user** or **auto**, as described in CLAUDE.md ("Who
merges").

| # | Task | ACs | Review |
|---|---|---|---|
| 1 | **feat: read spoken numbers** — `spokenNumber.ts` and its tests | AC5, AC6 | auto |
| 2 | **feat: save the voice answers setting** — the `voice` field in `settings.ts`, loading and saving, with tests | AC1 | auto |
| 3 | **feat: add the voice answers switch** — the switch in the settings panel, or the note when unsupported | AC1, AC2 | user |
| 4 | **feat: listen with the browser's speech recognition** — `recognizer.ts`, `useVoiceAnswers.ts`, the fake, and their tests | AC3, AC6, AC8 | user |
| 5 | **feat: answer by voice in play and test** — `Exercise`, `VoiceStatus`, pausing, no auto-focus, "you answered" | AC3, AC4, AC7, AC8, AC9 | user |

Tasks 1 and 2 don't depend on each other. Task 3 needs 2, task 5 needs
1, 3 and 4. Tasks 1 and 2 are auto because they are pure logic with no
screen changes. The rest change what the learner sees or use the
microphone, so they wait for the user.

## 7. Decisions and risks

- **iPhone Safari may need a tap before listening.** Some versions of
  Safari only start speech recognition right after a tap. In Test the
  Start tap counts, but Play starts listening on page load. If it fails
  there, the learner sees the "listening failed" message and can type.
  If hand testing shows this happens, the fix is a spec change (for
  example a "Tap to start listening" button), proposed separately.
- **Privacy:** Chrome sends the audio to Google's servers to recognize
  it, and Safari may send it to Apple. The app itself stores and sends
  nothing. The settings note could mention this. It isn't in the spec,
  so it's left out unless the user wants it.
- **Misheard numbers count as wrong.** This is the trade-off chosen in
  the spec for hands-free answering. Taking the first of up to five
  guesses that reads as a number keeps this rare.
- **The browser may still be listening briefly after leaving a page.**
  The hook stops the recognizer when the component unmounts. Tests
  check that `stop` is called.

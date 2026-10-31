import { describe, expect, it } from "vitest";
import {
  answerInTest,
  finishIfTimeUp,
  formatTimeLeft,
  READY,
  results,
  startTest,
  type TestState,
  timeLeftMs,
} from "./test";

const MINUTE = 60_000;
const START = 1_000_000; // any clock time, in ms

/** A one-minute test started at START, showing 42. */
const started = () => startTest(START, 1, 42);

/** Answers each [typed, next number] in turn, `msApart` after the start. */
function answerAll(
  state: TestState,
  answers: [string, number][],
  msApart = 1000,
): TestState {
  return answers.reduce(
    (s, [typed, next], i) =>
      answerInTest(s, typed, next, START + (i + 1) * msApart),
    state,
  );
}

describe("test rules", () => {
  it("waits for Start with nothing answered", () => {
    expect(READY.phase).toBe("ready");
    expect(results(READY)).toEqual({ correct: 0, answered: 0 });
    expect(timeLeftMs(READY, START)).toBe(0);
  });

  it("starts a test of the set length showing the first number (AC5)", () => {
    const state = startTest(START, 3, 42);
    expect(state.phase).toBe("running");
    expect(state.number).toBe(42);
    expect(state.answers).toEqual([]);
    expect(timeLeftMs(state, START)).toBe(3 * MINUTE);
  });

  it("counts the time left down from the clock (AC5)", () => {
    const state = started();
    expect(timeLeftMs(state, START + 18_000)).toBe(42_000);
    expect(timeLeftMs(state, START + MINUTE)).toBe(0);
    expect(timeLeftMs(state, START + 2 * MINUTE)).toBe(0);
  });

  it("records each answer and moves to the next number (AC5)", () => {
    const state = answerAll(started(), [
      ["42", 7],
      ["8", 123],
    ]);
    expect(state.number).toBe(123);
    expect(state.answers).toEqual([
      { number: 42, typed: "42", correct: true },
      { number: 7, typed: "8", correct: false },
    ]);
    expect(results(state)).toEqual({ correct: 1, answered: 2 });
  });

  it("reads answers like Play does", () => {
    const state = startTest(START, 1, 1234);
    const after = answerInTest(state, " 1,234 ", 5, START + 1000);
    expect(after.answers).toEqual([
      { number: 1234, typed: "1,234", correct: true },
    ]);
  });

  it("ignores an empty answer", () => {
    const state = started();
    expect(answerInTest(state, "  ", 7, START + 1000)).toBe(state);
  });

  it("finishes when the time is up, not before (AC6)", () => {
    const state = started();
    expect(finishIfTimeUp(state, START + MINUTE - 1)).toBe(state);
    expect(finishIfTimeUp(state, START + MINUTE).phase).toBe("finished");
  });

  it("rejects an answer typed after the time is up (AC6)", () => {
    const state = answerAll(started(), [["42", 7]]);
    const late = answerInTest(state, "7", 9, START + MINUTE);
    expect(late.phase).toBe("finished");
    // The unanswered last number doesn't count.
    expect(results(late)).toEqual({ correct: 1, answered: 1 });
  });

  it("accepts no answers once finished (AC6)", () => {
    const finished = finishIfTimeUp(started(), START + MINUTE);
    expect(answerInTest(finished, "42", 7, START + MINUTE)).toBe(finished);
    expect(answerInTest(READY, "42", 7, START)).toBe(READY);
  });

  it("keeps every answer for the results (AC6)", () => {
    const state = answerAll(
      started(),
      [
        ["42", 1],
        ["1", 2],
        ["3", 4],
      ],
      10_000,
    );
    const finished = finishIfTimeUp(state, START + MINUTE);
    expect(finished.answers.map((a) => a.correct)).toEqual([true, true, false]);
    expect(results(finished)).toEqual({ correct: 2, answered: 3 });
  });

  it("starts again with a full timer and no answers (AC7)", () => {
    const finished = finishIfTimeUp(
      answerAll(started(), [["42", 7]]),
      START + MINUTE,
    );
    const later = START + 5 * MINUTE;
    const again = startTest(later, 1, 9);
    expect(finished.answers).toHaveLength(1);
    expect(again.answers).toEqual([]);
    expect(timeLeftMs(again, later)).toBe(MINUTE);
  });
});

describe("formatTimeLeft", () => {
  it.each([
    [60_000, "1:00"],
    [42_000, "0:42"],
    [41_001, "0:42"],
    [125_000, "2:05"],
    [300_000, "5:00"],
    [999, "0:01"],
    [0, "0:00"],
  ])("shows %i ms as %s", (ms, text) => {
    expect(formatTimeLeft(ms)).toBe(text);
  });
});

import { describe, expect, it } from "vitest";
import {
  answer,
  parseAnswer,
  resetScore,
  type SessionState,
  startSession,
} from "./session";

describe("startSession", () => {
  it("starts asking about the first number with a 0 / 0 score", () => {
    expect(startSession(342)).toEqual<SessionState>({
      number: 342,
      lastResult: null,
      score: { correct: 0, attempted: 0 },
    });
  });
});

describe("answer (AC4)", () => {
  it("counts the shown number as correct and moves on", () => {
    expect(answer(startSession(342), "342", 57)).toEqual<SessionState>({
      number: 57,
      lastResult: { number: 342, correct: true },
      score: { correct: 1, attempted: 1 },
    });
  });

  it("counts any other number as wrong and remembers the right one", () => {
    const s = answer(startSession(342), "324", 57);
    expect(s.number).toBe(57);
    expect(s.lastResult).toEqual({ number: 342, correct: false });
    expect(s.score).toEqual({ correct: 0, attempted: 1 });
  });

  it("counts text that isn't a number as wrong", () => {
    expect(answer(startSession(342), "abc", 57).lastResult?.correct).toBe(
      false,
    );
    expect(answer(startSession(342), "3.42", 57).lastResult?.correct).toBe(
      false,
    );
  });

  it("ignores an empty answer instead of counting it", () => {
    const start = startSession(342);
    expect(answer(start, "", 57)).toEqual(start);
    expect(answer(start, "   ", 57)).toEqual(start);
  });

  it("keeps a running score across numbers", () => {
    const first = answer(startSession(342), "342", 57);
    const second = answer(first, "75", 8);
    expect(second.score).toEqual({ correct: 1, attempted: 2 });
    expect(second.lastResult).toEqual({ number: 57, correct: false });
  });
});

describe("resetScore", () => {
  it("sets the score to 0 / 0 and clears the last result", () => {
    const reset = resetScore(answer(startSession(342), "1", 57));
    expect(reset.score).toEqual({ correct: 0, attempted: 0 });
    expect(reset.lastResult).toBeNull();
    expect(reset.number).toBe(57);
  });
});

describe("parseAnswer", () => {
  it.each([
    ["342", 342],
    [" 342 ", 342],
    ["1,234", 1234],
    ["1 234", 1234],
    ["007", 7],
  ])("reads %j as %i", (typed, expected) => {
    expect(parseAnswer(typed)).toBe(expected);
  });

  it.each(["", "   ", "abc", "12a", "3.42", "-5", "1e3"])(
    "rejects %j",
    (typed) => {
      expect(parseAnswer(typed)).toBeNull();
    },
  );
});

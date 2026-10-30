import { describe, expect, it } from "vitest";
import {
  check,
  next,
  parseAnswer,
  resetScore,
  reveal,
  type SessionState,
  startSession,
} from "./session";

describe("startSession", () => {
  it("starts asking about the first number with a 0 / 0 score", () => {
    expect(startSession(342)).toEqual<SessionState>({
      number: 342,
      phase: "asking",
      lastAnswerCorrect: null,
      score: { correct: 0, attempted: 0 },
    });
  });
});

describe("self-check: reveal (AC3)", () => {
  it("keeps the number hidden until Reveal", () => {
    expect(startSession(342).phase).toBe("asking");
    expect(reveal(startSession(342)).phase).toBe("revealed");
  });

  it("does not touch the score", () => {
    expect(reveal(startSession(342)).score).toEqual({
      correct: 0,
      attempted: 0,
    });
  });
});

describe("type it: check (AC4)", () => {
  it("counts the shown number as correct", () => {
    const s = check(startSession(342), "342");
    expect(s.phase).toBe("revealed");
    expect(s.lastAnswerCorrect).toBe(true);
    expect(s.score).toEqual({ correct: 1, attempted: 1 });
  });

  it("counts any other number as wrong and reveals the right one", () => {
    const s = check(startSession(342), "324");
    expect(s.phase).toBe("revealed");
    expect(s.lastAnswerCorrect).toBe(false);
    expect(s.score).toEqual({ correct: 0, attempted: 1 });
  });

  it("counts text that isn't a number as wrong", () => {
    expect(check(startSession(342), "abc").lastAnswerCorrect).toBe(false);
    expect(check(startSession(342), "3.42").lastAnswerCorrect).toBe(false);
  });

  it("ignores an empty answer instead of counting it", () => {
    const start = startSession(342);
    expect(check(start, "")).toEqual(start);
    expect(check(start, "   ")).toEqual(start);
  });

  it("only scores once per number", () => {
    const once = check(startSession(342), "342");
    expect(check(once, "342")).toEqual(once);
  });
});

describe("next", () => {
  it("asks about a new number and keeps the score", () => {
    const answered = check(startSession(342), "342");
    expect(next(answered, 57)).toEqual<SessionState>({
      number: 57,
      phase: "asking",
      lastAnswerCorrect: null,
      score: { correct: 1, attempted: 1 },
    });
  });
});

describe("resetScore", () => {
  it("sets the score to 0 / 0 and keeps the current round", () => {
    const answered = check(startSession(342), "1");
    const reset = resetScore(answered);
    expect(reset.score).toEqual({ correct: 0, attempted: 0 });
    expect(reset.number).toBe(342);
    expect(reset.phase).toBe("revealed");
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

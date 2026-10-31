/**
 * Timed test rules as pure functions: each takes the current state and
 * returns a new one. The clock (`now`, in ms) is passed in, so tests
 * control time. See docs/specs/003-modes/spec.md, F4.
 */
import { parseAnswer } from "../../practice/session";

export interface TestAnswer {
  /** The number that was shown. */
  number: number;
  /** What the learner typed, without surrounding spaces. */
  typed: string;
  correct: boolean;
}

export interface TestState {
  phase: "ready" | "running" | "finished";
  /** When the test ends, as a clock time in ms; null before Start. */
  endsAt: number | null;
  /** The number shown while the test runs. */
  number: number;
  answers: TestAnswer[];
}

/** Before Start: nothing shown, nothing answered. */
export const READY: TestState = {
  phase: "ready",
  endsAt: null,
  number: 0,
  answers: [],
};

/** Starts a test of `minutes` at clock time `now`, showing `first`. */
export function startTest(
  now: number,
  minutes: number,
  first: number,
): TestState {
  return {
    phase: "running",
    endsAt: now + minutes * 60_000,
    number: first,
    answers: [],
  };
}

/**
 * Records the typed answer and moves on to `next`. An empty answer is
 * ignored. An answer that arrives once the time is up isn't counted: the
 * test finishes instead, even if the screen hadn't caught up yet.
 */
export function answerInTest(
  state: TestState,
  typed: string,
  next: number,
  now: number,
): TestState {
  if (state.phase !== "running") {
    return state;
  }
  if (isTimeUp(state, now)) {
    return { ...state, phase: "finished" };
  }
  const answer = typed.trim();
  if (answer === "") {
    return state;
  }

  return {
    ...state,
    number: next,
    answers: [
      ...state.answers,
      {
        number: state.number,
        typed: answer,
        correct: parseAnswer(answer) === state.number,
      },
    ],
  };
}

/** Finishes a running test once its time is up. */
export function finishIfTimeUp(state: TestState, now: number): TestState {
  return state.phase === "running" && isTimeUp(state, now)
    ? { ...state, phase: "finished" }
    : state;
}

/** Time left in a running test, never below 0; 0 when not running. */
export function timeLeftMs(state: TestState, now: number): number {
  if (state.phase !== "running" || state.endsAt === null) {
    return 0;
  }
  return Math.max(0, state.endsAt - now);
}

export function results(state: TestState): {
  correct: number;
  answered: number;
} {
  return {
    correct: state.answers.filter((a) => a.correct).length,
    answered: state.answers.length,
  };
}

function isTimeUp(state: TestState, now: number): boolean {
  return state.endsAt !== null && now >= state.endsAt;
}

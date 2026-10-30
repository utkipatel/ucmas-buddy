/**
 * Study mode rules as pure functions: each takes the current state and
 * returns a new one. Components keep the state and call these.
 * See docs/specs/001-study-mode/spec.md, F3 and F4.
 */

export type AnswerStyle = "self-check" | "type-it";

export interface Score {
  correct: number;
  attempted: number;
}

/** How the last type-it answer went, shown while the next number is up. */
export interface AnswerResult {
  number: number;
  correct: boolean;
}

export interface SessionState {
  /** The number shown on the abacus. */
  number: number;
  /** Self-check only: "revealed" after Reveal. */
  phase: "asking" | "revealed";
  /** Type-it only: the result of the last answer, or null before one. */
  lastResult: AnswerResult | null;
  /** Type-it only. */
  score: Score;
}

export function startSession(number: number): SessionState {
  return {
    number,
    phase: "asking",
    lastResult: null,
    score: { correct: 0, attempted: 0 },
  };
}

/** Self-check: show the number. */
export function reveal(state: SessionState): SessionState {
  return { ...state, phase: "revealed" };
}

/** Self-check: move on to a new, hidden number. */
export function next(state: SessionState, newNumber: number): SessionState {
  return { ...state, number: newNumber, phase: "asking" };
}

/**
 * Type it: score the typed answer and move straight on to `newNumber`,
 * remembering the result so it can be shown. An empty answer is ignored.
 */
export function answer(
  state: SessionState,
  typed: string,
  newNumber: number,
): SessionState {
  if (typed.trim() === "") {
    return state;
  }

  const correct = parseAnswer(typed) === state.number;
  return {
    number: newNumber,
    phase: "asking",
    lastResult: { number: state.number, correct },
    score: {
      correct: state.score.correct + (correct ? 1 : 0),
      attempted: state.score.attempted + 1,
    },
  };
}

export function resetScore(state: SessionState): SessionState {
  return {
    ...state,
    lastResult: null,
    score: { correct: 0, attempted: 0 },
  };
}

/**
 * Reads a typed answer as a whole number. Spaces and commas are ignored,
 * so "1,234" and "1 234" both mean 1234. Returns null for anything else.
 */
export function parseAnswer(typed: string): number | null {
  const digits = typed.replace(/[\s,]/g, "");
  return /^\d+$/.test(digits) ? Number(digits) : null;
}

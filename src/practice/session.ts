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

export interface SessionState {
  /** The number shown on the abacus. */
  number: number;
  /** "revealed" after Reveal (self-check) or Check (type it). */
  phase: "asking" | "revealed";
  /** Result of the last Check in type-it style; null otherwise. */
  lastAnswerCorrect: boolean | null;
  /** Only used in type-it style. */
  score: Score;
}

export function startSession(number: number): SessionState {
  return {
    number,
    phase: "asking",
    lastAnswerCorrect: null,
    score: { correct: 0, attempted: 0 },
  };
}

/** Self-check: show the number. */
export function reveal(state: SessionState): SessionState {
  return { ...state, phase: "revealed" };
}

/**
 * Type it: score the typed answer and show the number. An empty answer is
 * ignored, and a number can only be scored once.
 */
export function check(state: SessionState, typed: string): SessionState {
  if (state.phase !== "asking" || typed.trim() === "") {
    return state;
  }

  const correct = parseAnswer(typed) === state.number;
  return {
    ...state,
    phase: "revealed",
    lastAnswerCorrect: correct,
    score: {
      correct: state.score.correct + (correct ? 1 : 0),
      attempted: state.score.attempted + 1,
    },
  };
}

/** Move on to a new number, keeping the score. */
export function next(state: SessionState, newNumber: number): SessionState {
  return {
    ...state,
    number: newNumber,
    phase: "asking",
    lastAnswerCorrect: null,
  };
}

export function resetScore(state: SessionState): SessionState {
  return { ...state, score: { correct: 0, attempted: 0 } };
}

/**
 * Reads a typed answer as a whole number. Spaces and commas are ignored,
 * so "1,234" and "1 234" both mean 1234. Returns null for anything else.
 */
export function parseAnswer(typed: string): number | null {
  const digits = typed.replace(/[\s,]/g, "");
  return /^\d+$/.test(digits) ? Number(digits) : null;
}

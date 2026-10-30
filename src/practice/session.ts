/**
 * Study mode rules as pure functions: each takes the current state and
 * returns a new one. Components keep the state and call these.
 * See docs/specs/001-study-mode/spec.md, F3 and F4.
 */

export interface Score {
  correct: number;
  attempted: number;
}

/** How the last answer went, shown while the next number is up. */
export interface AnswerResult {
  number: number;
  correct: boolean;
}

export interface SessionState {
  /** The number shown on the abacus. */
  number: number;
  /** The result of the last answer, or null before one. */
  lastResult: AnswerResult | null;
  score: Score;
}

export function startSession(number: number): SessionState {
  return {
    number,
    lastResult: null,
    score: { correct: 0, attempted: 0 },
  };
}

/**
 * Scores the typed answer and moves straight on to `newNumber`,
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

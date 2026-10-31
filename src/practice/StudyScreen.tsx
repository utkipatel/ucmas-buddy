import { useState } from "react";
import Exercise from "./Exercise";
import { type DigitRange, generateNumber } from "./generator";
import { answer, resetScore, startSession } from "./session";

interface StudyScreenProps {
  range: DigitRange;
  /** Vanish mode: hide the beads this long after each number appears. */
  vanishAfterMs?: number | null;
  /** Replaces Math.random in tests. */
  random?: () => number;
}

/** The abacus, the answer box, and the running score. */
export default function StudyScreen({
  range,
  vanishAfterMs = null,
  random = Math.random,
}: StudyScreenProps) {
  const [session, setSession] = useState(() =>
    startSession(generateNumber(range, random)),
  );
  const { lastResult, score } = session;

  function handleAnswer(typed: string) {
    const newNumber = generateNumber(range, random);
    setSession((s) => answer(s, typed, newNumber));
  }

  return (
    <Exercise
      number={session.number}
      onAnswer={handleAnswer}
      vanishAfterMs={vanishAfterMs}
    >
      <p
        role="status"
        // A new key replays the fade-in, even when two results in a
        // row read the same.
        key={score.attempted}
        className={
          lastResult === null
            ? "result"
            : lastResult.correct
              ? "result correct"
              : "result wrong"
        }
      >
        {lastResult === null
          ? " "
          : lastResult.correct
            ? `✓ Right, that was ${lastResult.number}`
            : `✗ Not quite. That was ${lastResult.number}`}
      </p>

      <p className="score">
        <span>{`Score: ${score.correct} / ${score.attempted}`}</span>
        <button
          type="button"
          className="link"
          onClick={() => setSession(resetScore)}
        >
          Reset
        </button>
      </p>
    </Exercise>
  );
}

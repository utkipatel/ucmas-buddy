import { useState } from "react";
import Exercise from "./Exercise";
import { type DigitRange, generateNumber } from "./generator";
import ResultLine from "./ResultLine";
import { answer, resetScore, startSession } from "./session";

interface StudyScreenProps {
  range: DigitRange;
  /** Vanish mode: hide the beads this long after each number appears. */
  vanishAfterMs?: number | null;
  /** Voice answers: listen for the answer while this is true. */
  voice?: boolean;
  /** Replaces Math.random in tests. */
  random?: () => number;
}

/** The abacus, the answer box, and the running score. */
export default function StudyScreen({
  range,
  vanishAfterMs = null,
  voice = false,
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
      voice={voice}
    >
      <ResultLine result={lastResult} count={score.attempted} />

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

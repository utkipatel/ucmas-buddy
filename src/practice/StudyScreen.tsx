import { type FormEvent, useRef, useState } from "react";
import Abacus from "../abacus/Abacus";
import { numberToRods } from "../abacus/model";
import { type DigitRange, generateNumber } from "./generator";
import { answer, resetScore, startSession } from "./session";

interface StudyScreenProps {
  range: DigitRange;
  /** Replaces Math.random in tests. */
  random?: () => number;
}

/** The abacus, the answer box, and the running score. */
export default function StudyScreen({
  range,
  random = Math.random,
}: StudyScreenProps) {
  const [session, setSession] = useState(() =>
    startSession(generateNumber(range, random)),
  );
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { lastResult, score } = session;

  function handleAnswer(event: FormEvent) {
    event.preventDefault();
    if (typed.trim() === "") return;
    const newNumber = generateNumber(range, random);
    setSession((s) => answer(s, typed, newNumber));
    setTyped("");
    // Keep the keyboard up on phones, ready for the next number.
    inputRef.current?.focus();
  }

  return (
    <section className="study">
      <Abacus rods={numberToRods(session.number)} />

      <form className="answer" onSubmit={handleAnswer}>
        <label htmlFor="answer">Your answer</label>
        <input
          id="answer"
          ref={inputRef}
          inputMode="numeric"
          autoComplete="off"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
        />
        <button type="submit" disabled={typed.trim() === ""}>
          Next
        </button>

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
      </form>
    </section>
  );
}

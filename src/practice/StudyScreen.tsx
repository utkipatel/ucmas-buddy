import { type FormEvent, useState } from "react";
import Abacus from "../abacus/Abacus";
import { numberToRods } from "../abacus/model";
import type { Settings } from "../settings";
import { generateNumber } from "./generator";
import { check, next, resetScore, reveal, startSession } from "./session";

interface StudyScreenProps {
  settings: Settings;
  /** Replaces Math.random in tests. */
  random?: () => number;
}

/** One study round at a time: the abacus, then Reveal or Check, then Next. */
export default function StudyScreen({
  settings,
  random = Math.random,
}: StudyScreenProps) {
  const { range, answerStyle } = settings;
  const [session, setSession] = useState(() =>
    startSession(generateNumber(range, random)),
  );
  const [typed, setTyped] = useState("");
  const revealed = session.phase === "revealed";

  function handleNext() {
    const newNumber = generateNumber(range, random);
    setSession((s) => next(s, newNumber));
    setTyped("");
  }

  function handleCheck(event: FormEvent) {
    event.preventDefault();
    setSession((s) => check(s, typed));
  }

  return (
    <section className="study">
      <Abacus rods={numberToRods(session.number)} />

      {answerStyle === "self-check" ? (
        <div className="answer">
          {revealed ? (
            <>
              <p className="revealed-number">{session.number}</p>
              <button type="button" onClick={handleNext} autoFocus>
                Next
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setSession(reveal)} autoFocus>
              Reveal
            </button>
          )}
        </div>
      ) : (
        <form className="answer" onSubmit={handleCheck}>
          {revealed ? (
            <>
              <p
                role="status"
                className={
                  session.lastAnswerCorrect ? "result correct" : "result wrong"
                }
              >
                {session.lastAnswerCorrect
                  ? `✓ Correct: ${session.number}`
                  : `✗ Not quite. It was ${session.number}.`}
              </p>
              <button type="button" onClick={handleNext} autoFocus>
                Next
              </button>
            </>
          ) : (
            <>
              <label htmlFor="answer">Your answer</label>
              <input
                id="answer"
                inputMode="numeric"
                autoComplete="off"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                autoFocus
              />
              <button type="submit" disabled={typed.trim() === ""}>
                Check
              </button>
            </>
          )}
          <p className="score">
            <span>{`Score: ${session.score.correct} / ${session.score.attempted}`}</span>
            <button
              type="button"
              className="link"
              onClick={() => setSession(resetScore)}
            >
              Reset
            </button>
          </p>
        </form>
      )}
    </section>
  );
}

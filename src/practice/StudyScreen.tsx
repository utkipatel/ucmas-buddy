import { type FormEvent, useEffect, useRef, useState } from "react";
import Abacus, { type BeadVisibility } from "../abacus/Abacus";
import { numberToRods } from "../abacus/model";
import { type DigitRange, generateNumber } from "./generator";
import { answer, resetScore, startSession } from "./session";
import { fadeDurationMs } from "./vanish";

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
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Vanish mode. `round` goes up with every answer, so each number gets
  // its full showing, even if the same number comes up twice in a row.
  const [round, setRound] = useState(0);
  // The beads fade during the last part of the vanish time and are gone
  // exactly when it ends.
  const [beads, setBeads] = useState<BeadVisibility>("shown");
  const fadeMs = vanishAfterMs === null ? 0 : fadeDurationMs(vanishAfterMs);
  useEffect(() => {
    if (vanishAfterMs === null) return;
    const fade = setTimeout(() => setBeads("fading"), vanishAfterMs - fadeMs);
    const hide = setTimeout(() => setBeads("hidden"), vanishAfterMs);
    return () => {
      clearTimeout(fade);
      clearTimeout(hide);
    };
  }, [round, vanishAfterMs, fadeMs]);
  const { lastResult, score } = session;

  // When the phone keyboard opens, the browser scrolls the answer box into
  // view, which can push the abacus off the top. The visible area shrinks
  // at that moment, so put the abacus back at the top of what's visible.
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const keepAbacusVisible = () => {
      if (document.activeElement === inputRef.current) {
        sectionRef.current?.scrollIntoView({ block: "start" });
      }
    };
    viewport.addEventListener("resize", keepAbacusVisible);
    return () => viewport.removeEventListener("resize", keepAbacusVisible);
  }, []);

  function handleAnswer(event: FormEvent) {
    event.preventDefault();
    if (typed.trim() === "") return;
    const newNumber = generateNumber(range, random);
    setSession((s) => answer(s, typed, newNumber));
    setTyped("");
    setRound((r) => r + 1);
    setBeads("shown");
    // Keep the keyboard up on phones, ready for the next number, without
    // letting the browser scroll the abacus away.
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <section className="study" ref={sectionRef}>
      <Abacus
        rods={numberToRods(session.number)}
        beads={beads}
        fadeMs={fadeMs}
      />

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

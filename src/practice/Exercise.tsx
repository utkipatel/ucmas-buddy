import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import Abacus, { type BeadVisibility } from "../abacus/Abacus";
import { numberToRods } from "../abacus/model";
import { fadeDurationMs } from "./vanish";

interface ExerciseProps {
  /** The number shown on the abacus. */
  number: number;
  /** Called with what the learner typed when they tap Next. */
  onAnswer: (typed: string) => void;
  /** Vanish mode: hide the beads this long after each number appears. */
  vanishAfterMs?: number | null;
  /** Puts the cursor in the answer box straight away. */
  autoFocus?: boolean;
  /** Shown under the answer box, such as the result line and score. */
  children?: ReactNode;
}

/**
 * The abacus and the answer box, shared by Play and Test. Each answer
 * starts a new round: the next number gets its full showing in vanish
 * mode, even if it's the same number again.
 */
export default function Exercise({
  number,
  onAnswer,
  vanishAfterMs = null,
  autoFocus = false,
  children,
}: ExerciseProps) {
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
    onAnswer(typed);
    setTyped("");
    setRound((r) => r + 1);
    setBeads("shown");
    // Keep the keyboard up on phones, ready for the next number, without
    // letting the browser scroll the abacus away.
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <section className="study" ref={sectionRef}>
      <Abacus rods={numberToRods(number)} beads={beads} fadeMs={fadeMs} />

      <form className="answer" onSubmit={handleAnswer}>
        <label htmlFor="answer">Your answer</label>
        <input
          id="answer"
          ref={inputRef}
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
        />
        <button type="submit" disabled={typed.trim() === ""}>
          Next
        </button>
        {children}
      </form>
    </section>
  );
}

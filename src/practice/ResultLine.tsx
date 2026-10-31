import type { AnswerResult } from "./session";

interface ResultLineProps {
  /** The last answer, or null before the first one. */
  result: AnswerResult | null;
  /** How many answers so far; a change replays the fade-in. */
  count: number;
}

/** Says whether the last answer was right and what the number was. */
export default function ResultLine({ result, count }: ResultLineProps) {
  return (
    <p
      role="status"
      // A new key replays the fade-in, even when two results in a row
      // read the same.
      key={count}
      className={
        result === null
          ? "result"
          : result.correct
            ? "result correct"
            : "result wrong"
      }
    >
      {result === null
        ? " "
        : result.correct
          ? `✓ Right, that was ${result.number}`
          : `✗ Not quite. That was ${result.number}`}
    </p>
  );
}

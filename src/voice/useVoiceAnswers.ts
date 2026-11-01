import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { type ListenError, startListening } from "./recognizer";
import { firstNumber } from "./spokenNumber";

/** What to show the learner about listening (spec F2-F4). */
export type VoiceStatus =
  "off" | "listening" | "not-a-number" | "blocked" | "failed";

interface VoiceAnswersOptions {
  /** Listen only while this is true. */
  active: boolean;
  /** Changes with every new number, which restarts listening. */
  round: number;
  /** Called once per round with the number the learner said. */
  onNumber: (n: number) => void;
}

/**
 * Listens for spoken answers while `active` and the page is visible.
 * Each round hears at most one number: listening stops when it's heard,
 * and starts afresh for the next round, so speech just after an answer
 * can't answer the next number too.
 *
 * After a problem (microphone blocked, or listening failed) it doesn't
 * try again each round. It tries again only after a pause, such as
 * opening the settings or switching tabs.
 */
export function useVoiceAnswers({
  active,
  round,
  onNumber,
}: VoiceAnswersOptions): VoiceStatus {
  const visible = usePageVisible();
  const listening = active && visible;
  const [problem, setProblem] = useState<ListenError | null>(null);
  const [missed, setMissed] = useState(false);

  // The latest callback, so a new one doesn't restart listening.
  const onNumberRef = useRef(onNumber);
  useEffect(() => {
    onNumberRef.current = onNumber;
  }, [onNumber]);

  // A pause clears a problem, so listening is tried again afterwards.
  useEffect(() => {
    if (!listening) return;
    return () => setProblem(null);
  }, [listening]);

  useEffect(() => {
    if (!listening || problem !== null) return;
    const listener = startListening({
      onHeard(alternatives) {
        const n = firstNumber(alternatives);
        if (n === null) {
          setMissed(true);
        } else {
          listener.stop();
          onNumberRef.current(n);
        }
      },
      onError: setProblem,
    });
    return () => {
      listener.stop();
      setMissed(false);
    };
  }, [listening, round, problem]);

  if (!listening) return "off";
  if (problem !== null) return problem;
  return missed ? "not-a-number" : "listening";
}

/** True while the page is showing, not in a hidden tab. */
function usePageVisible(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener("visibilitychange", onChange);
      return () => document.removeEventListener("visibilitychange", onChange);
    },
    () => document.visibilityState === "visible",
    () => true,
  );
}

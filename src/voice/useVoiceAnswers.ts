import { useEffect, useRef, useState } from "react";
import { startListening } from "./recognizer";
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
 * Listens for spoken answers while `active`. Each round hears at most
 * one number, so speech just after an answer can't answer the next
 * number too.
 */
export function useVoiceAnswers({
  active,
  round,
  onNumber,
}: VoiceAnswersOptions): VoiceStatus {
  // What happened since listening last (re)started; null means nothing.
  const [status, setStatus] = useState<VoiceStatus | null>(null);

  // The latest callback, so a new one doesn't restart listening.
  const onNumberRef = useRef(onNumber);
  useEffect(() => {
    onNumberRef.current = onNumber;
  }, [onNumber]);

  useEffect(() => {
    if (!active) return;
    let answered = false;
    const listener = startListening({
      onHeard(alternatives) {
        if (answered) return;
        const n = firstNumber(alternatives);
        if (n === null) {
          setStatus("not-a-number");
        } else {
          answered = true;
          onNumberRef.current(n);
        }
      },
      onError: setStatus,
    });
    return () => {
      listener.stop();
      setStatus(null);
    };
  }, [active, round]);

  if (!active) return "off";
  return status ?? "listening";
}

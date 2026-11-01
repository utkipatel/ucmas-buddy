import type { VoiceStatus as Status } from "./useVoiceAnswers";

const MESSAGES: Record<Exclude<Status, "off">, string> = {
  listening: "🎤 Listening…",
  "not-a-number": "🎤 Didn't catch a number, try again",
  blocked: "Microphone blocked. You can still type your answers.",
  failed: "Voice answers stopped working. You can still type your answers.",
};

/** Says whether the app is listening for a spoken answer (spec F2-F4). */
export default function VoiceStatus({ status }: { status: Status }) {
  if (status === "off") return null;
  const problem = status === "blocked" || status === "failed";
  return (
    <p
      className={problem ? "voice-status problem" : "voice-status"}
      aria-live="polite"
      data-testid="voice-status"
    >
      {MESSAGES[status]}
    </p>
  );
}

/**
 * The browser's speech recognition (the Web Speech API). Chrome and
 * Safari only offer it under the older name `webkitSpeechRecognition`.
 * See docs/specs/004-voice-input/plan.md, section 1.
 */

/** True when this browser can recognize speech (not Firefox, for one). */
export function isVoiceSupported(): boolean {
  const w = window as unknown as Record<string, unknown>;
  return (
    w.SpeechRecognition !== undefined || w.webkitSpeechRecognition !== undefined
  );
}

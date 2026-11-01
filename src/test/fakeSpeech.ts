/**
 * A fake of the browser's SpeechRecognition, so tests can "say" things
 * without a microphone. Install it in a test with installFakeSpeech().
 */
import { onTestFinished, vi } from "vitest";
import type {
  SpeechRecognitionLike,
  SpeechResultEvent,
} from "../voice/recognizer";

export class FakeSpeechRecognition implements SpeechRecognitionLike {
  lang = "";
  continuous = false;
  interimResults = true;
  maxAlternatives = 1;
  onresult: ((event: SpeechResultEvent) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;

  /** True between start() and the end of listening. */
  listening = false;
  starts = 0;
  aborted = false;

  constructor() {
    created.push(this);
  }

  start(): void {
    if (this.listening) {
      throw new Error("InvalidStateError: already started");
    }
    this.listening = true;
    this.starts++;
  }

  abort(): void {
    this.aborted = true;
    this.listening = false;
  }

  /** The browser heard a phrase; `guesses` are its guesses, best first. */
  hear(...guesses: string[]): void {
    const result = Object.assign(
      guesses.map((transcript) => ({ transcript })),
      { isFinal: true },
    );
    this.onresult?.({ resultIndex: 0, results: [result] });
  }

  /** The browser reports an error, such as "not-allowed", then ends. */
  fail(error: string): void {
    this.onerror?.({ error });
    this.end();
  }

  /** The browser stops listening on its own, as after a long silence. */
  end(): void {
    this.listening = false;
    this.onend?.();
  }
}

let created: FakeSpeechRecognition[] = [];

/**
 * Makes the browser look like it supports speech recognition, for this
 * test only. Returns every recognizer the app creates, in order.
 */
export function installFakeSpeech(): FakeSpeechRecognition[] {
  created = [];
  vi.stubGlobal("webkitSpeechRecognition", FakeSpeechRecognition);
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
  return created;
}

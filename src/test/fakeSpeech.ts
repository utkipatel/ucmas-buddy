/**
 * A fake of the browser's SpeechRecognition, so tests can "say" things
 * without a microphone. Install it in a test with installFakeSpeech().
 */
import { onTestFinished } from "vitest";
import type {
  SpeechRecognitionLike,
  SpeechResult,
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
  /** Everything heard so far; like Chrome, each event lists it all. */
  private results: SpeechResult[] = [];
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
    this.results = [...this.results, result];
    this.onresult?.({
      resultIndex: this.results.length - 1,
      results: this.results,
    });
  }

  /**
   * An early guess for the phrase being spoken. Like Chrome, each new
   * guess replaces the previous one until the phrase is final.
   */
  hearSoFar(...guesses: string[]): void {
    const result = Object.assign(
      guesses.map((transcript) => ({ transcript })),
      { isFinal: false },
    );
    this.onresult?.({
      resultIndex: this.results.length,
      results: [...this.results, result],
    });
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
  const w = window as unknown as Record<string, unknown>;
  w.webkitSpeechRecognition = FakeSpeechRecognition;
  onTestFinished(() => {
    delete w.webkitSpeechRecognition;
  });
  return created;
}

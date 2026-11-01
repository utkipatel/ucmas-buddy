/**
 * The browser's speech recognition (the Web Speech API). Chrome and
 * Safari only offer it under the older name `webkitSpeechRecognition`.
 * See docs/specs/004-voice-input/plan.md, section 1.
 */

/** The parts of the browser's SpeechRecognition the app uses. */
export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}

/** One phrase the browser heard: its guesses, most likely first. */
export type SpeechResult = ArrayLike<{ transcript: string }> & {
  isFinal: boolean;
};

export interface SpeechResultEvent {
  /** The first result that is new in this event. */
  resultIndex: number;
  results: ArrayLike<SpeechResult>;
}

type SpeechRecognitionClass = new () => SpeechRecognitionLike;

/** How many guesses to ask the browser for (plan section 1). */
const MAX_ALTERNATIVES = 5;

/**
 * Browsers end listening after a few seconds of silence, and the app
 * starts again. If it ends more often than this with nothing heard,
 * something is wrong (for example the browser won't listen without a
 * tap), so give up rather than restart forever.
 */
const RESTART_WINDOW_MS = 10_000;
const MAX_RESTARTS_IN_WINDOW = 4;

function speechRecognitionClass(): SpeechRecognitionClass | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionClass;
    webkitSpeechRecognition?: SpeechRecognitionClass;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** True when this browser can recognize speech (not Firefox, for one). */
export function isVoiceSupported(): boolean {
  return speechRecognitionClass() !== undefined;
}

/** The browser's language if it's a kind of English, otherwise en-US. */
export function speechLanguage(language: string): string {
  return /^en\b/i.test(language) ? language : "en-US";
}

/** Why listening stopped: microphone permission refused, or anything else. */
export type ListenError = "blocked" | "failed";

export interface Listener {
  /** Stops listening. Nothing more is reported after this. */
  stop(): void;
}

/**
 * Starts listening. Calls onHeard with the guesses for each phrase, and
 * keeps listening through pauses until stop() or an error.
 */
export function startListening(handlers: {
  onHeard: (alternatives: string[]) => void;
  onError: (error: ListenError) => void;
}): Listener {
  const Recognition = speechRecognitionClass();
  if (Recognition === undefined) {
    handlers.onError("failed");
    return { stop() {} };
  }

  const recognition = new Recognition();
  recognition.lang = speechLanguage(navigator.language);
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = MAX_ALTERNATIVES;

  let stopped = false;
  /** When listening ended recently, with nothing heard since. */
  let recentEnds: number[] = [];

  function stop() {
    stopped = true;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
  }

  function fail(error: ListenError) {
    stop();
    handlers.onError(error);
  }

  function start() {
    try {
      recognition.start();
    } catch {
      fail("failed");
    }
  }

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result?.isFinal) {
        recentEnds = [];
        handlers.onHeard(Array.from(result, (r) => r.transcript));
      }
    }
  };

  recognition.onerror = ({ error }) => {
    if (error === "not-allowed" || error === "service-not-allowed") {
      fail("blocked");
    } else if (error !== "no-speech" && error !== "aborted") {
      fail("failed");
    }
    // "no-speech" and "aborted" are normal: listening ends and restarts.
  };

  // Browsers stop listening on their own after a while, so start again.
  recognition.onend = () => {
    if (stopped) return;
    const now = Date.now();
    recentEnds = [...recentEnds, now].filter(
      (t) => now - t < RESTART_WINDOW_MS,
    );
    if (recentEnds.length > MAX_RESTARTS_IN_WINDOW) {
      fail("failed");
    } else {
      start();
    }
  };

  start();
  return {
    stop() {
      if (!stopped) stop();
    },
  };
}

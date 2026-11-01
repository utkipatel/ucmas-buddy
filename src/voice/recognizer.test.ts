// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { installFakeSpeech } from "../test/fakeSpeech";
import {
  isVoiceSupported,
  SETTLE_MS,
  speechLanguage,
  startListening,
} from "./recognizer";

afterEach(() => {
  vi.useRealTimers();
});

/** Starts listening with spies for both handlers. */
function listen() {
  const onHeard = vi.fn();
  const onError = vi.fn();
  const listener = startListening({ onHeard, onError });
  return { listener, onHeard, onError };
}

describe("isVoiceSupported", () => {
  it("is false without speech recognition, as in Firefox", () => {
    expect(isVoiceSupported()).toBe(false);
  });

  it("is true with speech recognition", () => {
    installFakeSpeech();
    expect(isVoiceSupported()).toBe(true);
  });
});

describe("speechLanguage", () => {
  it.each(["en-US", "en-IN", "en-GB", "en"])("keeps %s", (language) => {
    expect(speechLanguage(language)).toBe(language);
  });

  it.each(["hi-IN", "fr-FR", "eng", ""])("uses en-US for %j", (language) => {
    expect(speechLanguage(language)).toBe("en-US");
  });
});

describe("startListening", () => {
  it("listens continuously, with early guesses and up to 5 guesses", () => {
    const created = installFakeSpeech();
    listen();
    const [r] = created;
    expect(created).toHaveLength(1);
    expect(r?.listening).toBe(true);
    expect(r?.continuous).toBe(true);
    expect(r?.interimResults).toBe(true);
    expect(r?.maxAlternatives).toBe(5);
    expect(r?.lang).toBe(speechLanguage(navigator.language));
  });

  it("reports every guess for each phrase heard", () => {
    const created = installFakeSpeech();
    const { onHeard } = listen();
    created[0]?.hear("for", "four", "4");
    created[0]?.hear("um");
    expect(onHeard.mock.calls).toEqual([[["for", "four", "4"]], [["um"]]]);
  });

  describe("early guesses", () => {
    it("reports one once it stops changing for a moment", () => {
      vi.useFakeTimers();
      const created = installFakeSpeech();
      const { onHeard } = listen();
      created[0]?.hearSoFar("seven");
      vi.advanceTimersByTime(SETTLE_MS - 1);
      expect(onHeard).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(onHeard.mock.calls).toEqual([[["seven"]]]);
    });

    it("waits while the phrase is still changing", () => {
      vi.useFakeTimers();
      const created = installFakeSpeech();
      const { onHeard } = listen();
      created[0]?.hearSoFar("forty");
      vi.advanceTimersByTime(300);
      created[0]?.hearSoFar("forty two");
      vi.advanceTimersByTime(SETTLE_MS);
      expect(onHeard.mock.calls).toEqual([[["forty two"]]]);
    });

    it("uses the final result straight away when it comes first", () => {
      vi.useFakeTimers();
      const created = installFakeSpeech();
      const { onHeard } = listen();
      created[0]?.hearSoFar("seven");
      created[0]?.hear("seven", "7");
      vi.advanceTimersByTime(SETTLE_MS);
      expect(onHeard.mock.calls).toEqual([[["seven", "7"]]]);
    });

    it("doesn't report the same phrase twice", () => {
      vi.useFakeTimers();
      const created = installFakeSpeech();
      const { onHeard } = listen();
      created[0]?.hearSoFar("seven");
      vi.advanceTimersByTime(SETTLE_MS);
      created[0]?.hear("seven");
      expect(onHeard).toHaveBeenCalledTimes(1);
    });

    it("reports nothing after stop()", () => {
      vi.useFakeTimers();
      const created = installFakeSpeech();
      const { listener, onHeard } = listen();
      created[0]?.hearSoFar("seven");
      listener.stop();
      vi.advanceTimersByTime(SETTLE_MS);
      expect(onHeard).not.toHaveBeenCalled();
    });
  });

  it("starts again when the browser stops on its own (spec F2)", () => {
    vi.useFakeTimers();
    const created = installFakeSpeech();
    const { onError } = listen();
    const r = created[0];
    vi.advanceTimersByTime(30_000);
    r?.end();
    expect(r?.listening).toBe(true);
    expect(r?.starts).toBe(2);
    expect(onError).not.toHaveBeenCalled();
  });

  it.each(["no-speech", "aborted"])(
    "keeps listening after a %s error",
    (error) => {
      vi.useFakeTimers();
      const created = installFakeSpeech();
      const { onError } = listen();
      vi.advanceTimersByTime(5_000);
      created[0]?.fail(error);
      expect(created[0]?.listening).toBe(true);
      expect(onError).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["not-allowed", "blocked"],
    ["service-not-allowed", "blocked"],
    ["network", "failed"],
    ["audio-capture", "failed"],
  ])("stops for good after a %s error (AC8)", (error, reported) => {
    const created = installFakeSpeech();
    const { onError } = listen();
    created[0]?.fail(error);
    expect(onError.mock.calls).toEqual([[reported]]);
    expect(created[0]?.listening).toBe(false);
    expect(created[0]?.starts).toBe(1);
  });

  it("gives up if listening keeps ending with nothing heard", () => {
    vi.useFakeTimers();
    const created = installFakeSpeech();
    const { onError } = listen();
    const r = created[0];
    for (let i = 0; i < 4; i++) {
      vi.advanceTimersByTime(1_500);
      r?.end();
    }
    expect(onError).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1_500);
    r?.end();
    expect(onError.mock.calls).toEqual([["failed"]]);
    expect(r?.listening).toBe(false);
  });

  it("keeps restarting after normal silences", () => {
    vi.useFakeTimers();
    const created = installFakeSpeech();
    const { onError } = listen();
    for (let i = 0; i < 20; i++) {
      vi.advanceTimersByTime(8_000);
      created[0]?.end();
    }
    expect(onError).not.toHaveBeenCalled();
    expect(created[0]?.listening).toBe(true);
  });

  it("counts only new results in each event", () => {
    const created = installFakeSpeech();
    const { onHeard } = listen();
    created[0]?.hear("what");
    created[0]?.hear("12");
    expect(onHeard.mock.calls).toEqual([[["what"]], [["12"]]]);
  });

  it("reports a failure if the browser won't start", () => {
    const created = installFakeSpeech();
    const { onError } = listen();
    // Starting a recognizer that's already listening throws.
    created[0]?.onend?.();
    expect(onError.mock.calls).toEqual([["failed"]]);
  });

  it("reports nothing more once stop() is called while hearing", () => {
    const created = installFakeSpeech();
    const onHeard = vi.fn(() => listener.stop());
    const listener = startListening({ onHeard, onError: vi.fn() });
    const phrase = (t: string) =>
      Object.assign([{ transcript: t }], { isFinal: true });
    created[0]?.onresult?.({
      resultIndex: 0,
      results: [phrase("one"), phrase("four")],
    });
    expect(onHeard).toHaveBeenCalledTimes(1);
  });

  it("reports nothing more after stop()", () => {
    const created = installFakeSpeech();
    const { listener, onHeard, onError } = listen();
    const r = created[0];
    listener.stop();
    expect(r?.aborted).toBe(true);
    r?.hear("412");
    r?.fail("network");
    expect(onHeard).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(r?.starts).toBe(1);
  });

  it("reports a failure without speech recognition", () => {
    const { onError } = listen();
    expect(onError.mock.calls).toEqual([["failed"]]);
  });
});

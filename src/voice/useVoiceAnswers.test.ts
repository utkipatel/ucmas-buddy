// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { installFakeSpeech } from "../test/fakeSpeech";
import { useVoiceAnswers } from "./useVoiceAnswers";

/** Renders the hook; rerender({ active, round }) changes its options. */
function renderVoice(active = true, round = 0) {
  const onNumber = vi.fn();
  const hook = renderHook(
    (props: { active: boolean; round: number }) =>
      useVoiceAnswers({ ...props, onNumber }),
    { initialProps: { active, round } },
  );
  return { ...hook, onNumber };
}

describe("useVoiceAnswers", () => {
  it("doesn't listen while not active", () => {
    const created = installFakeSpeech();
    const { result } = renderVoice(false);
    expect(result.current).toBe("off");
    expect(created).toHaveLength(0);
  });

  it("listens while active (AC3)", () => {
    const created = installFakeSpeech();
    const { result } = renderVoice();
    expect(result.current).toBe("listening");
    expect(created[0]?.listening).toBe(true);
  });

  it("reports the number heard, then stops listening (AC4)", () => {
    const created = installFakeSpeech();
    const { onNumber } = renderVoice();
    act(() => created[0]?.hear("um", "for", "4"));
    expect(onNumber.mock.calls).toEqual([[4]]);
    expect(created[0]?.aborted).toBe(true);
  });

  it("says when speech isn't a number and keeps listening (AC6)", () => {
    const created = installFakeSpeech();
    const { result, onNumber } = renderVoice();
    act(() => created[0]?.hear("what"));
    expect(result.current).toBe("not-a-number");
    expect(created[0]?.listening).toBe(true);

    act(() => created[0]?.hear("twelve"));
    expect(onNumber.mock.calls).toEqual([[12]]);
  });

  it("starts listening afresh for each new number", () => {
    const created = installFakeSpeech();
    const { result, rerender, onNumber } = renderVoice();
    act(() => created[0]?.hear("what"));
    rerender({ active: true, round: 1 });

    expect(created[0]?.aborted).toBe(true);
    expect(created[1]?.listening).toBe(true);
    expect(result.current).toBe("listening");
    act(() => created[1]?.hear("7"));
    expect(onNumber.mock.calls).toEqual([[7]]);
  });

  it("stops listening when no longer active (AC3)", () => {
    const created = installFakeSpeech();
    const { result, rerender } = renderVoice();
    rerender({ active: false, round: 0 });
    expect(created[0]?.aborted).toBe(true);
    expect(result.current).toBe("off");

    rerender({ active: true, round: 0 });
    expect(created[1]?.listening).toBe(true);
    expect(result.current).toBe("listening");
  });

  it("stops listening when the page goes away", () => {
    const created = installFakeSpeech();
    const { unmount } = renderVoice();
    unmount();
    expect(created[0]?.aborted).toBe(true);
  });

  it.each([
    ["not-allowed", "blocked"],
    ["network", "failed"],
  ])("reports a %s error as %s (AC8)", (error, status) => {
    const created = installFakeSpeech();
    const { result } = renderVoice();
    act(() => created[0]?.fail(error));
    expect(result.current).toBe(status);
  });

  it("reports a failure without speech recognition", () => {
    const { result } = renderVoice();
    expect(result.current).toBe("failed");
  });

  it("doesn't retry each round after a problem, only after a pause (AC8)", () => {
    const created = installFakeSpeech();
    const { result, rerender } = renderVoice();
    act(() => created[0]?.fail("not-allowed"));
    rerender({ active: true, round: 1 });
    expect(created).toHaveLength(1);
    expect(result.current).toBe("blocked");

    rerender({ active: false, round: 1 });
    rerender({ active: true, round: 1 });
    expect(created).toHaveLength(2);
    expect(result.current).toBe("listening");
  });

  it("pauses while the page is in a hidden tab", () => {
    const created = installFakeSpeech();
    const { result } = renderVoice();
    let state: DocumentVisibilityState = "hidden";
    vi.spyOn(document, "visibilityState", "get").mockImplementation(
      () => state,
    );
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(created[0]?.aborted).toBe(true);
    expect(result.current).toBe("off");

    state = "visible";
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(created[1]?.listening).toBe(true);
    vi.restoreAllMocks();
  });
});

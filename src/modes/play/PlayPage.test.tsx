// @vitest-environment jsdom
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../App";
import { PLAY_SETTINGS_KEY } from "../../settings";
import { installFakeSpeech } from "../../test/fakeSpeech";

// With Math.random at 0, every number is 1 (in the default 1-3 digits),
// so "1" is right and anything else is wrong.
beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  localStorage.clear();
  window.history.replaceState(null, "", "/#/play");
});

afterEach(() => {
  vi.restoreAllMocks();
});

const voiceStatus = () => screen.queryByTestId("voice-status");
const result = () => screen.getByRole("status").textContent;

/** Opens Play with voice answers saved as on or off. */
function renderPlay(voice: boolean) {
  localStorage.setItem(PLAY_SETTINGS_KEY, JSON.stringify({ voice }));
  render(<App />);
}

describe("<PlayPage> voice answers (epic 004)", () => {
  it("listens for the first number (AC3)", () => {
    const created = installFakeSpeech();
    renderPlay(true);
    expect(voiceStatus()?.textContent).toMatch(/listening/i);
    expect(created.at(-1)?.listening).toBe(true);
  });

  it("answers with the spoken number and listens for the next (AC4)", () => {
    const created = installFakeSpeech();
    renderPlay(true);
    act(() => created.at(-1)?.hear("one"));
    expect(result()).toMatch(/right.*1/i);
    expect(screen.getByText("Score: 1 / 1")).toBeTruthy();

    expect(created).toHaveLength(2);
    act(() => created.at(-1)?.hear("for"));
    expect(result()).toMatch(/not quite/i);
    expect(screen.getByText("Score: 1 / 2")).toBeTruthy();
  });

  it("says when it didn't catch a number (AC6)", () => {
    const created = installFakeSpeech();
    renderPlay(true);
    act(() => created.at(-1)?.hear("hmm"));
    expect(voiceStatus()?.textContent).toMatch(/didn't catch a number/i);
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();
  });

  it("still takes typed answers (AC7)", () => {
    installFakeSpeech();
    renderPlay(true);
    fireEvent.change(screen.getByLabelText(/your answer/i), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Score: 1 / 1")).toBeTruthy();
  });

  it("pauses while the settings are open (AC3)", async () => {
    const created = installFakeSpeech();
    renderPlay(true);
    const first = created.at(-1);
    fireEvent.click(screen.getByRole("button", { name: /open settings/i }));
    expect(first?.aborted).toBe(true);
    expect(voiceStatus()).toBeNull();

    fireEvent.click(screen.getByLabelText(/close settings/i));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(created.at(-1)?.listening).toBe(true);
    expect(voiceStatus()?.textContent).toMatch(/listening/i);
  });

  it("says when the microphone is blocked (AC8)", () => {
    const created = installFakeSpeech();
    renderPlay(true);
    act(() => created.at(-1)?.fail("not-allowed"));
    expect(voiceStatus()?.textContent).toMatch(/microphone blocked/i);
    expect(screen.getByLabelText(/your answer/i)).toBeTruthy();
  });

  it("doesn't listen when voice answers are off", () => {
    const created = installFakeSpeech();
    renderPlay(false);
    expect(created).toHaveLength(0);
    expect(voiceStatus()).toBeNull();
  });

  it("doesn't listen without speech recognition, even if saved as on", () => {
    vi.stubGlobal("SpeechRecognition", undefined);
    vi.stubGlobal("webkitSpeechRecognition", undefined);
    renderPlay(true);
    expect(voiceStatus()).toBeNull();
    vi.unstubAllGlobals();
  });
});

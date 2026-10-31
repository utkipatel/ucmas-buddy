// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../App";
import { TEST_SETTINGS_KEY } from "../../settings";

// With Math.random at 0, every number is 1 (in the default 1-3 digits),
// so "1" is right and anything else is wrong.
beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
  localStorage.clear();
  window.history.replaceState(null, "", "/#/test");
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const click = (name: RegExp) =>
  fireEvent.click(screen.getByRole("button", { name }));
const timeLeft = () => screen.getByRole("timer").textContent;
const answerBox = () => screen.queryByLabelText(/your answer/i);
const settingsButton = () =>
  screen.getByRole<HTMLButtonElement>("button", { name: /open settings/i });

/** Switches mode with the side menu and lets it finish closing. */
function goTo(mode: string) {
  click(/open menu/i);
  fireEvent.click(
    screen.getByRole("link", { name: new RegExp(`^${mode}$`, "i") }),
  );
  wait(300);
}

function answerWith(text: string) {
  fireEvent.change(screen.getByLabelText(/your answer/i), {
    target: { value: text },
  });
  click(/next/i);
}

describe("<TestPage>", () => {
  it("shows a summary of the test and a Start button", () => {
    render(<App />);
    expect(screen.getByText(/1 minute/i)).toBeTruthy();
    expect(screen.getByText(/1–3 digits/i)).toBeTruthy();
    expect(screen.getByText(/vanish off/i)).toBeTruthy();
    expect(answerBox()).toBeNull();
    expect(settingsButton().disabled).toBe(false);
  });

  it("summarizes the saved test settings", () => {
    localStorage.setItem(
      TEST_SETTINGS_KEY,
      JSON.stringify({
        range: { min: 2, max: 2 },
        vanish: { enabled: true, seconds: 0.8 },
        minutes: 5,
      }),
    );
    render(<App />);
    expect(screen.getByText(/5 minutes/i)).toBeTruthy();
    expect(screen.getByText(/2 digits/i)).toBeTruthy();
    expect(screen.getByText(/vanish after 0\.8 s/i)).toBeTruthy();
  });

  it("counts down and keeps a running score once started (AC5)", () => {
    render(<App />);
    click(/start/i);
    expect(timeLeft()).toBe("1:00");
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();

    answerWith("1");
    expect(screen.getByRole("status").textContent).toMatch(/right.*1/i);
    answerWith("2");
    expect(screen.getByRole("status").textContent).toMatch(/not quite.*was 1/i);
    expect(screen.getByText("Score: 1 / 2")).toBeTruthy();

    wait(18_000);
    expect(timeLeft()).toBe("0:42");
  });

  it("runs for the saved length (AC5)", () => {
    localStorage.setItem(TEST_SETTINGS_KEY, JSON.stringify({ minutes: 3 }));
    render(<App />);
    click(/start/i);
    expect(timeLeft()).toBe("3:00");
  });

  it("disables the settings button while the test runs (AC8)", () => {
    render(<App />);
    click(/start/i);
    expect(settingsButton().disabled).toBe(true);
    wait(60_000);
    expect(settingsButton().disabled).toBe(false);
  });

  it("stops at the time limit and shows every answer (AC6)", () => {
    render(<App />);
    click(/start/i);
    answerWith("1");
    answerWith("7");
    answerWith("1");
    // A number is showing but unanswered when the time runs out.
    wait(60_000);

    expect(answerBox()).toBeNull();
    expect(screen.getByText("2 / 3")).toBeTruthy();
    const rows = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(rows).toEqual(["✓ 1", "✗ 1, you typed 7", "✓ 1"]);
  });

  it("says so when nothing was answered (AC6)", () => {
    render(<App />);
    click(/start/i);
    wait(60_000);
    expect(screen.getByText("0 / 0")).toBeTruthy();
    expect(screen.getByText(/no answers/i)).toBeTruthy();
  });

  it("starts again with a full timer and no answers (AC7)", () => {
    render(<App />);
    click(/start/i);
    answerWith("1");
    wait(60_000);

    click(/start again/i);
    expect(timeLeft()).toBe("1:00");
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();
    expect(screen.getByRole("status").textContent?.trim()).toBe("");
  });

  it("drops a running test when leaving the page", () => {
    render(<App />);
    click(/start/i);
    answerWith("1");
    goTo("play");
    goTo("test");
    expect(screen.getByRole("button", { name: /^start$/i })).toBeTruthy();
    expect(settingsButton().disabled).toBe(false);
  });
});

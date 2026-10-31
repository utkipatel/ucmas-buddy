// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeRandom } from "../test/fakeRandom";
import StudyScreen from "./StudyScreen";

// With a 3-digit range, these random values give 100 first, then 550.
const random = () => fakeRandom(0, 0, 0, 0.5);
const range = { min: 3, max: 3 };

const renderScreen = () =>
  render(<StudyScreen range={range} random={random()} />);

const click = (name: RegExp) =>
  fireEvent.click(screen.getByRole("button", { name }));

/** Types an answer and taps Next, as the learner would. */
function answerWith(text: string) {
  fireEvent.change(screen.getByLabelText(/your answer/i), {
    target: { value: text },
  });
  click(/next/i);
}

const result = () => screen.getByRole("status").textContent;

describe("<StudyScreen> (AC4)", () => {
  it("scores a right answer and moves on in one tap", () => {
    renderScreen();
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();

    answerWith("100");
    expect(result()).toMatch(/right.*100/i);
    expect(screen.getByText("Score: 1 / 1")).toBeTruthy();
    // Ready for the next number: the box is empty again.
    expect(screen.getByLabelText<HTMLInputElement>(/your answer/i).value).toBe(
      "",
    );
  });

  it("scores a wrong answer and says what the number was", () => {
    renderScreen();
    answerWith("101");
    expect(result()).toMatch(/not quite.*100/i);
    expect(screen.getByText("Score: 0 / 1")).toBeTruthy();
  });

  it("keeps the score across numbers and resets it on request", () => {
    renderScreen();
    answerWith("100"); // right
    answerWith("1"); // wrong: the second number is 550
    expect(result()).toMatch(/not quite.*550/i);
    expect(screen.getByText("Score: 1 / 2")).toBeTruthy();

    click(/reset/i);
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();
  });

  it("can't submit an empty answer", () => {
    renderScreen();
    const nextButton = screen.getByRole<HTMLButtonElement>("button", {
      name: /next/i,
    });
    expect(nextButton.disabled).toBe(true);
  });

  it("opens a number pad on phones", () => {
    renderScreen();
    expect(
      screen.getByLabelText(/your answer/i).getAttribute("inputmode"),
    ).toBe("numeric");
  });
});

describe("<StudyScreen> with the phone keyboard open (AC5)", () => {
  // jsdom has no on-screen keyboard, so fake the browser's visual viewport
  // (the part of the page not covered by the keyboard).
  function fakeVisualViewport() {
    const viewport = new EventTarget();
    vi.stubGlobal("visualViewport", viewport);
    return viewport;
  }
  const scrolls = () => vi.mocked(Element.prototype.scrollIntoView).mock;

  afterEach(() => vi.unstubAllGlobals());

  it("scrolls the abacus back into view when the keyboard opens", () => {
    Element.prototype.scrollIntoView = vi.fn();
    const viewport = fakeVisualViewport();
    renderScreen();

    screen.getByLabelText(/your answer/i).focus();
    viewport.dispatchEvent(new Event("resize")); // keyboard opened

    expect(scrolls().calls).toHaveLength(1);
    expect(scrolls().contexts[0]).toBe(document.querySelector(".study"));
    expect(scrolls().calls[0]?.[0]).toMatchObject({ block: "start" });
  });

  it("leaves scrolling alone when the answer box isn't focused", () => {
    Element.prototype.scrollIntoView = vi.fn();
    const viewport = fakeVisualViewport();
    renderScreen();

    viewport.dispatchEvent(new Event("resize")); // e.g. rotating the phone

    expect(scrolls().calls).toHaveLength(0);
  });
});

describe("<StudyScreen> in vanish mode", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const beadCount = () => document.querySelectorAll("[data-bead]").length;
  const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));
  const ALL_BEADS = 11 * 5;

  it("keeps the beads when vanish mode is off (AC1)", () => {
    render(
      <StudyScreen range={range} random={random()} vanishAfterMs={null} />,
    );
    wait(10_000);
    expect(beadCount()).toBe(ALL_BEADS);
  });

  it("hides the beads exactly after the vanish time (AC2)", () => {
    render(<StudyScreen range={range} random={random()} vanishAfterMs={500} />);
    wait(499);
    expect(beadCount()).toBe(ALL_BEADS);
    wait(1);
    expect(beadCount()).toBe(0);
    expect(screen.getAllByTestId("rod")).toHaveLength(11); // frame stays
  });

  it("fades the beads during the end of the vanish time (AC2)", () => {
    render(<StudyScreen range={range} random={random()} vanishAfterMs={500} />);
    const fading = () =>
      document.querySelector(".abacus")?.classList.contains("beads-fading");

    wait(299);
    expect(fading()).toBe(false);
    wait(1); // 500 ms vanish time fades over its last 200 ms
    expect(fading()).toBe(true);
    expect(beadCount()).toBe(ALL_BEADS); // still drawn while fading
    wait(200);
    expect(beadCount()).toBe(0);
  });

  it("shows each new number, then hides it again (AC3)", () => {
    render(<StudyScreen range={range} random={random()} vanishAfterMs={500} />);
    wait(500);
    answerWith("100");
    expect(beadCount()).toBe(ALL_BEADS);
    wait(500);
    expect(beadCount()).toBe(0);
  });

  it("isn't restarted by typing", () => {
    render(<StudyScreen range={range} random={random()} vanishAfterMs={500} />);
    wait(300);
    fireEvent.change(screen.getByLabelText(/your answer/i), {
      target: { value: "1" },
    });
    wait(200);
    expect(beadCount()).toBe(0);
  });

  it("doesn't bring a vanished number back when the score is reset", () => {
    render(<StudyScreen range={range} random={random()} vanishAfterMs={500} />);
    wait(500);
    click(/reset/i);
    expect(beadCount()).toBe(0);
  });

  it("keeps the answer box in place when the beads vanish (AC4)", () => {
    render(<StudyScreen range={range} random={random()} vanishAfterMs={500} />);
    const box = screen.getByLabelText(/your answer/i);
    wait(500);
    expect(screen.getByLabelText(/your answer/i)).toBe(box); // same element
    expect(document.querySelector(".abacus")).not.toBeNull();
  });
});

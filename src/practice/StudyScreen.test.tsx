// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Settings } from "../settings";
import { fakeRandom } from "../test/fakeRandom";
import StudyScreen from "./StudyScreen";

// With a 3-digit range, these random values give 100 first, then 550.
const random = () => fakeRandom(0, 0, 0, 0.5);
const selfCheck: Settings = {
  range: { min: 3, max: 3 },
  answerStyle: "self-check",
};
const typeIt: Settings = { range: { min: 3, max: 3 }, answerStyle: "type-it" };

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

describe("<StudyScreen> in self-check style (AC3)", () => {
  it("hides the number until Reveal, then shows it", () => {
    render(<StudyScreen settings={selfCheck} random={random()} />);
    expect(screen.queryByText("100")).toBeNull();

    click(/reveal/i);
    expect(screen.getByText("100")).toBeTruthy();
  });

  it("moves to a new hidden number on Next", () => {
    render(<StudyScreen settings={selfCheck} random={random()} />);
    click(/reveal/i);
    click(/next/i);

    expect(screen.queryByText("550")).toBeNull();
    click(/reveal/i);
    expect(screen.getByText("550")).toBeTruthy();
  });

  it("shows no score", () => {
    render(<StudyScreen settings={selfCheck} random={random()} />);
    click(/reveal/i);
    expect(screen.queryByText(/score/i)).toBeNull();
  });
});

describe("<StudyScreen> in type-it style (AC4)", () => {
  it("scores a right answer and moves on in one tap", () => {
    render(<StudyScreen settings={typeIt} random={random()} />);
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
    render(<StudyScreen settings={typeIt} random={random()} />);
    answerWith("101");
    expect(result()).toMatch(/not quite.*100/i);
    expect(screen.getByText("Score: 0 / 1")).toBeTruthy();
  });

  it("keeps the score across numbers and resets it on request", () => {
    render(<StudyScreen settings={typeIt} random={random()} />);
    answerWith("100"); // right
    answerWith("1"); // wrong: the second number is 550
    expect(result()).toMatch(/not quite.*550/i);
    expect(screen.getByText("Score: 1 / 2")).toBeTruthy();

    click(/reset/i);
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();
  });

  it("can't submit an empty answer", () => {
    render(<StudyScreen settings={typeIt} random={random()} />);
    const nextButton = screen.getByRole<HTMLButtonElement>("button", {
      name: /next/i,
    });
    expect(nextButton.disabled).toBe(true);
  });

  it("opens a number pad on phones", () => {
    render(<StudyScreen settings={typeIt} random={random()} />);
    expect(
      screen.getByLabelText(/your answer/i).getAttribute("inputmode"),
    ).toBe("numeric");
  });
});

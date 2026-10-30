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

function typeAnswer(text: string) {
  fireEvent.change(screen.getByLabelText(/your answer/i), {
    target: { value: text },
  });
  click(/check/i);
}

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
  it("counts the right answer as correct", () => {
    render(<StudyScreen settings={typeIt} random={random()} />);
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();

    typeAnswer("100");
    expect(screen.getByRole("status").textContent).toMatch(/correct/i);
    expect(screen.getByText("Score: 1 / 1")).toBeTruthy();
  });

  it("counts a wrong answer and shows the right number", () => {
    render(<StudyScreen settings={typeIt} random={random()} />);
    typeAnswer("101");
    expect(screen.getByRole("status").textContent).toMatch(/not quite.*100/i);
    expect(screen.getByText("Score: 0 / 1")).toBeTruthy();
  });

  it("keeps the score across rounds and resets it on request", () => {
    render(<StudyScreen settings={typeIt} random={random()} />);
    typeAnswer("100");
    click(/next/i);
    typeAnswer("1");
    expect(screen.getByText("Score: 1 / 2")).toBeTruthy();

    click(/reset/i);
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();
  });

  it("can't check an empty answer", () => {
    render(<StudyScreen settings={typeIt} random={random()} />);
    const check = screen.getByRole<HTMLButtonElement>("button", {
      name: /check/i,
    });
    expect(check.disabled).toBe(true);
  });

  it("opens a number pad on phones", () => {
    render(<StudyScreen settings={typeIt} random={random()} />);
    expect(
      screen.getByLabelText(/your answer/i).getAttribute("inputmode"),
    ).toBe("numeric");
  });
});

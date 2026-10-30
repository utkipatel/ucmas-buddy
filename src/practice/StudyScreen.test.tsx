// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

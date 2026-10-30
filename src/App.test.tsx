// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

beforeEach(() => localStorage.clear());

const openSettings = () =>
  fireEvent.click(screen.getByRole("button", { name: /open settings/i }));

const save = () =>
  fireEvent.click(screen.getByRole("button", { name: /save/i }));

/** Picks a digit range in the open settings panel (without saving). */
function pickRange(min: string, max: string) {
  fireEvent.change(screen.getByLabelText(/from/i), { target: { value: min } });
  fireEvent.change(screen.getByLabelText(/to/i), { target: { value: max } });
}

/** Answers the current number wrongly ("0" is never generated). */
function answerWrong() {
  fireEvent.change(screen.getByLabelText(/your answer/i), {
    target: { value: "0" },
  });
  fireEvent.click(screen.getByRole("button", { name: /next/i }));
}

/** Waits for the panel's closing animation to finish. */
const settingsClosed = () =>
  waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

const rangeShown = () => [
  screen.getByLabelText<HTMLSelectElement>(/from/i).value,
  screen.getByLabelText<HTMLSelectElement>(/to/i).value,
];

describe("<App>", () => {
  it("starts with the answer box and settings closed", () => {
    render(<App />);
    expect(screen.getByLabelText(/your answer/i)).toBeTruthy();
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens settings from the header menu button", () => {
    render(<App />);
    openSettings();
    expect(screen.getByRole("dialog", { name: /settings/i })).toBeTruthy();
    expect(screen.getByText(/resets the score/i)).toBeTruthy();
  });

  it.each([
    [
      "the close button",
      () => fireEvent.click(screen.getByLabelText(/close settings/i)),
    ],
    ["Escape", () => fireEvent.keyDown(window, { key: "Escape" })],
    [
      "a tap outside",
      () => fireEvent.click(screen.getByTestId("drawer-backdrop")),
    ],
  ])("closes settings with %s", async (_, close) => {
    render(<App />);
    openSettings();
    close();
    await settingsClosed();
  });

  it("applies a change only when Save is tapped (AC7)", async () => {
    render(<App />);
    answerWrong();
    openSettings();
    pickRange("2", "4");
    // Nothing applied yet: the score from before is still there.
    expect(screen.getByText("Score: 0 / 1")).toBeTruthy();

    save();
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();
    await settingsClosed();
    openSettings();
    expect(rangeShown()).toEqual(["2", "4"]);
  });

  it("keeps the old settings when closed without saving (AC7)", async () => {
    render(<App />);
    answerWrong();
    openSettings();
    pickRange("4", "5");
    fireEvent.keyDown(window, { key: "Escape" });
    await settingsClosed();

    expect(screen.getByText("Score: 0 / 1")).toBeTruthy();
    openSettings();
    expect(rangeShown()).toEqual(["1", "3"]);
  });

  it("can only save when something changed", () => {
    render(<App />);
    openSettings();
    const saveButton = screen.getByRole<HTMLButtonElement>("button", {
      name: /save/i,
    });
    expect(saveButton.disabled).toBe(true);
    pickRange("2", "3");
    expect(saveButton.disabled).toBe(false);
  });

  it("keeps saved settings but not the score after a reload (AC6)", () => {
    const first = render(<App />);
    openSettings();
    pickRange("2", "4");
    save();
    answerWrong();
    expect(screen.getByText("Score: 0 / 1")).toBeTruthy();

    first.unmount(); // like closing the page
    render(<App />);
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();
    openSettings();
    expect(rangeShown()).toEqual(["2", "4"]);
  });

  it("keeps the digit range valid when one end passes the other", () => {
    render(<App />);
    openSettings();
    fireEvent.change(screen.getByLabelText(/from/i), {
      target: { value: "5" },
    });
    expect(rangeShown()).toEqual(["5", "5"]);
  });
});

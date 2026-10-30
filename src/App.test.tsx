// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

beforeEach(() => localStorage.clear());

const openSettings = () =>
  fireEvent.click(screen.getByRole("button", { name: /open settings/i }));

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
  ])("closes settings with %s", (_, close) => {
    render(<App />);
    openSettings();
    close();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps settings but not the score after a reload (AC6)", () => {
    const first = render(<App />);
    openSettings();
    fireEvent.change(screen.getByLabelText(/from/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText(/to/i), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/your answer/i), {
      target: { value: "1" }, // never right: numbers have 2-4 digits
    });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Score: 0 / 1")).toBeTruthy();

    first.unmount(); // like closing the page
    render(<App />);
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();

    openSettings();
    expect(screen.getByLabelText<HTMLSelectElement>(/from/i).value).toBe("2");
    expect(screen.getByLabelText<HTMLSelectElement>(/to/i).value).toBe("4");
  });

  it("keeps the digit range valid when one end passes the other", () => {
    render(<App />);
    openSettings();
    fireEvent.change(screen.getByLabelText(/from/i), {
      target: { value: "5" },
    });
    expect(screen.getByLabelText<HTMLSelectElement>(/to/i).value).toBe("5");
  });
});

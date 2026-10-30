// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

beforeEach(() => localStorage.clear());

describe("<App>", () => {
  it("starts in self-check style by default", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /reveal/i })).toBeTruthy();
  });

  it("switches to type-it style from settings", () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText(/type it/i));
    expect(screen.getByLabelText(/your answer/i)).toBeTruthy();
  });

  it("keeps settings but not the score after a reload (AC6)", () => {
    const first = render(<App />);
    fireEvent.click(screen.getByLabelText(/type it/i));
    fireEvent.change(screen.getByLabelText(/from/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText(/to/i), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/your answer/i), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));
    expect(screen.getByText("Score: 0 / 1")).toBeTruthy();

    first.unmount(); // like closing the page
    render(<App />);

    expect(screen.getByLabelText<HTMLInputElement>(/type it/i).checked).toBe(
      true,
    );
    expect(screen.getByLabelText<HTMLSelectElement>(/from/i).value).toBe("2");
    expect(screen.getByLabelText<HTMLSelectElement>(/to/i).value).toBe("4");
    expect(screen.getByText("Score: 0 / 0")).toBeTruthy();
  });

  it("keeps the digit range valid when one end passes the other", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/from/i), {
      target: { value: "5" },
    });
    expect(screen.getByLabelText<HTMLSelectElement>(/to/i).value).toBe("5");
  });
});

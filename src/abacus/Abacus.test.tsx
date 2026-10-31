// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Abacus, { BEAD_HEIGHT } from "./Abacus";
import { MARKER_RODS, numberToRods, ROD_COUNT } from "./model";

/** Reads the drawing back: the digit on each rod, from the beads on the beam. */
function readDrawing(): number[] {
  return screen.getAllByTestId("rod").map((rod) => {
    const upper = rod.querySelectorAll(
      '[data-bead="upper"][data-on-beam="true"]',
    ).length;
    const lower = rod.querySelectorAll(
      '[data-bead="lower"][data-on-beam="true"]',
    ).length;
    return upper * 5 + lower;
  });
}

describe("<Abacus>", () => {
  it("draws 11 rods, each with 1 upper and 4 lower beads", () => {
    render(<Abacus rods={numberToRods(0)} />);
    const rods = screen.getAllByTestId("rod");
    expect(rods).toHaveLength(ROD_COUNT);
    rods.forEach((rod) => {
      expect(rod.querySelectorAll('[data-bead="upper"]')).toHaveLength(1);
      expect(rod.querySelectorAll('[data-bead="lower"]')).toHaveLength(4);
    });
  });

  it("shows each digit of 342 on rods 4-6 and 0 elsewhere (AC1)", () => {
    render(<Abacus rods={numberToRods(342)} />);
    expect(readDrawing()).toEqual([0, 0, 0, 3, 4, 2, 0, 0, 0, 0, 0]);
  });

  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])(
    "shows the digit %i on the unit rod",
    (digit) => {
      render(<Abacus rods={numberToRods(digit)} />);
      expect(readDrawing()[5]).toBe(digit);
    },
  );

  it("shows a 6-digit number on rods 1-6", () => {
    render(<Abacus rods={numberToRods(987_654)} />);
    expect(readDrawing()).toEqual([9, 8, 7, 6, 5, 4, 0, 0, 0, 0, 0]);
  });

  it("puts unit-marker dots on rods 3, 6 and 9", () => {
    render(<Abacus rods={numberToRods(0)} />);
    const markedRods = screen
      .getAllByTestId("marker")
      .map((dot) => Number(dot.dataset.rod));
    expect(markedRods).toEqual([...MARKER_RODS]);
  });

  it("draws beads on the beam closer to it than beads at rest", () => {
    render(<Abacus rods={numberToRods(2)} />);
    const unitRod = screen.getAllByTestId("rod")[5];
    const centers = [
      ...(unitRod?.querySelectorAll<SVGElement>('[data-bead="lower"]') ?? []),
    ].map((bead) => ({
      onBeam: bead.dataset.onBeam === "true",
      y: Number(bead.dataset.y),
    }));
    const lowestOnBeam = Math.max(
      ...centers.filter((c) => c.onBeam).map((c) => c.y),
    );
    const highestAtRest = Math.min(
      ...centers.filter((c) => !c.onBeam).map((c) => c.y),
    );
    // At least one full bead of empty space between the two groups.
    expect(highestAtRest - lowestOnBeam).toBeGreaterThanOrEqual(
      2 * BEAD_HEIGHT,
    );
  });

  it("can hide the beads while keeping the frame and size (AC4)", () => {
    const { container, rerender } = render(<Abacus rods={numberToRods(342)} />);
    const svg = container.querySelector("svg");
    const viewBox = svg?.getAttribute("viewBox");

    rerender(<Abacus rods={numberToRods(342)} beadsHidden />);
    expect(container.querySelector("svg")).toBe(svg); // same element
    expect(svg?.getAttribute("viewBox")).toBe(viewBox);
    expect(container.querySelectorAll("[data-bead]")).toHaveLength(0);
    expect(screen.getAllByTestId("rod")).toHaveLength(ROD_COUNT);
    expect(screen.getAllByTestId("marker")).toHaveLength(MARKER_RODS.length);
  });
});

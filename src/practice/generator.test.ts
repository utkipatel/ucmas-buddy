import { describe, expect, it } from "vitest";
import { MAX_NUMBER } from "../abacus/model";
import { type DigitRange, generateNumber, MAX_DIGITS } from "./generator";

/** A fake Math.random that returns the given values in order, then repeats. */
function fakeRandom(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
}

const LOWEST = 0;
const HIGHEST = 0.999_999_9; // Math.random never returns 1

describe("generateNumber", () => {
  it("picks the digit count first, then the number", () => {
    // First value picks the digit count, second picks the number.
    expect(generateNumber({ min: 1, max: 3 }, fakeRandom(LOWEST, LOWEST))).toBe(
      1,
    );
    expect(
      generateNumber({ min: 1, max: 3 }, fakeRandom(HIGHEST, HIGHEST)),
    ).toBe(999);
  });

  it("returns the smallest and largest number for a digit count", () => {
    const range = { min: 3, max: 3 };
    expect(generateNumber(range, fakeRandom(LOWEST, LOWEST))).toBe(100);
    expect(generateNumber(range, fakeRandom(LOWEST, HIGHEST))).toBe(999);
  });

  it("never returns 0 for 1-digit numbers", () => {
    expect(generateNumber({ min: 1, max: 1 }, fakeRandom(LOWEST, LOWEST))).toBe(
      1,
    );
  });

  it("stays within what the abacus can show", () => {
    const range = { min: MAX_DIGITS, max: MAX_DIGITS };
    expect(generateNumber(range, fakeRandom(HIGHEST, HIGHEST))).toBe(
      MAX_NUMBER,
    );
  });

  it("gives 2, 3 or 4 digits for a 2-4 range, never starting with 0 (AC2)", () => {
    const lengths = new Set<number>();
    for (let run = 0; run < 1000; run++) {
      const text = String(generateNumber({ min: 2, max: 4 }));
      expect(text).toMatch(/^[1-9]\d{1,3}$/);
      lengths.add(text.length);
    }
    expect([...lengths].sort()).toEqual([2, 3, 4]);
  });

  it.each<DigitRange>([
    { min: 0, max: 3 },
    { min: 1, max: 7 },
    { min: 4, max: 2 },
    { min: 1.5, max: 3 },
  ])("rejects the range %o", (range) => {
    expect(() => generateNumber(range)).toThrow(RangeError);
  });
});

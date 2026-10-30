import { describe, expect, it } from "vitest";
import {
  type Digit,
  type Rod,
  digitToRod,
  MAX_NUMBER,
  numberToRods,
  ROD_COUNT,
  UNIT_ROD,
} from "./model";

/** Reads rods back into a number, the way a learner would. */
function readRods(rods: Rod[]): number {
  return rods
    .slice(0, UNIT_ROD)
    .reduce((total, rod) => total * 10 + (rod.upper ? 5 : 0) + rod.lower, 0);
}

const ZERO: Rod = { upper: false, lower: 0 };

describe("digitToRod", () => {
  it.each<[Digit, Rod]>([
    [0, { upper: false, lower: 0 }],
    [1, { upper: false, lower: 1 }],
    [2, { upper: false, lower: 2 }],
    [3, { upper: false, lower: 3 }],
    [4, { upper: false, lower: 4 }],
    [5, { upper: true, lower: 0 }],
    [6, { upper: true, lower: 1 }],
    [7, { upper: true, lower: 2 }],
    [8, { upper: true, lower: 3 }],
    [9, { upper: true, lower: 4 }],
  ])("shows %i as %o", (digit, rod) => {
    expect(digitToRod(digit)).toEqual(rod);
  });
});

describe("numberToRods", () => {
  it("always returns 11 rods", () => {
    expect(numberToRods(0)).toHaveLength(ROD_COUNT);
    expect(numberToRods(7)).toHaveLength(ROD_COUNT);
    expect(numberToRods(MAX_NUMBER)).toHaveLength(ROD_COUNT);
  });

  it("puts the ones digit on rod 6 and tens to its left (spec example)", () => {
    const rods = numberToRods(342);
    expect(rods[3]).toEqual(digitToRod(3)); // rod 4
    expect(rods[4]).toEqual(digitToRod(4)); // rod 5
    expect(rods[5]).toEqual(digitToRod(2)); // rod 6, the unit rod
  });

  it("leaves every other rod at 0", () => {
    const rods = numberToRods(342);
    [0, 1, 2, 6, 7, 8, 9, 10].forEach((i) => expect(rods[i]).toEqual(ZERO));
  });

  it("shows 0 as all rods at rest", () => {
    expect(numberToRods(0)).toEqual(Array(ROD_COUNT).fill(ZERO));
  });

  it("keeps zeros inside a number, such as 1005", () => {
    expect(readRods(numberToRods(1005))).toBe(1005);
    expect(numberToRods(1005)[3]).toEqual(ZERO); // hundreds
    expect(numberToRods(1005)[4]).toEqual(ZERO); // tens
  });

  it("fits the largest 6-digit number on rods 1-6", () => {
    const rods = numberToRods(999_999);
    rods.slice(0, 6).forEach((rod) => expect(rod).toEqual(digitToRod(9)));
    rods.slice(6).forEach((rod) => expect(rod).toEqual(ZERO));
  });

  it("can be read back for numbers of every length", () => {
    for (const n of [1, 9, 10, 99, 342, 4096, 50_505, 123_456, MAX_NUMBER]) {
      expect(readRods(numberToRods(n))).toBe(n);
    }
  });

  it.each([-1, 1.5, MAX_NUMBER + 1, Number.NaN, Infinity])(
    "rejects %s",
    (n) => {
      expect(() => numberToRods(n)).toThrow(RangeError);
    },
  );
});

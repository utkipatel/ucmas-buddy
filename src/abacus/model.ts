/**
 * The abacus as data: which beads sit against the beam on each rod.
 * See docs/specs/001-study-mode/spec.md, section 2.
 */

export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Rod {
  /** True when the 5-bead is against the beam. */
  upper: boolean;
  /** How many 1-beads are against the beam. */
  lower: 0 | 1 | 2 | 3 | 4;
}

export const ROD_COUNT = 11;

/** 1-based rod that holds the ones digit. */
export const UNIT_ROD = 6;

/** 1-based rods with a unit-marker dot on the beam. */
export const MARKER_RODS = [3, 6, 9] as const;

/** Numbers end on the unit rod, so they can use rods 1 to 6. */
export const MAX_NUMBER = 10 ** UNIT_ROD - 1;

export function digitToRod(digit: Digit): Rod {
  return {
    upper: digit >= 5,
    lower: (digit % 5) as Rod["lower"],
  };
}

/** Returns all 11 rods, with the number's ones digit on the unit rod. */
export function numberToRods(n: number): Rod[] {
  if (!Number.isInteger(n) || n < 0 || n > MAX_NUMBER) {
    throw new RangeError(
      `Expected a whole number from 0 to ${MAX_NUMBER}, got ${n}`,
    );
  }

  const rods = Array.from({ length: ROD_COUNT }, () => digitToRod(0));
  let rest = n;
  for (let index = UNIT_ROD - 1; rest > 0; index--) {
    rods[index] = digitToRod((rest % 10) as Digit);
    rest = Math.floor(rest / 10);
  }
  return rods;
}

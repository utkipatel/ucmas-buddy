import { UNIT_ROD } from "../abacus/model";

/** How many digits a generated number may have, inclusive. */
export interface DigitRange {
  min: number;
  max: number;
}

export const MIN_DIGITS = 1;

/** Numbers end on the unit rod, so they can use at most that many rods. */
export const MAX_DIGITS = UNIT_ROD;

/**
 * Returns a random number whose digit count is within `range`. It never
 * starts with 0, so it is never 0 itself.
 *
 * `random` must behave like Math.random (a value in [0, 1)); tests pass a
 * fake one to get repeatable results.
 */
export function generateNumber(
  range: DigitRange,
  random: () => number = Math.random,
): number {
  const { min, max } = range;
  if (!isValidRange(range)) {
    throw new RangeError(
      `Expected a digit range within ${MIN_DIGITS}-${MAX_DIGITS}, got ${min}-${max}`,
    );
  }

  const digits = randomInt(min, max, random);
  return randomInt(10 ** (digits - 1), 10 ** digits - 1, random);
}

/** True when both ends are whole numbers within 1-6 and min <= max. */
export function isValidRange({ min, max }: DigitRange): boolean {
  return (
    Number.isInteger(min) &&
    Number.isInteger(max) &&
    min >= MIN_DIGITS &&
    max <= MAX_DIGITS &&
    min <= max
  );
}

/** Random whole number from `low` to `high`, inclusive. */
function randomInt(low: number, high: number, random: () => number): number {
  return low + Math.floor(random() * (high - low + 1));
}

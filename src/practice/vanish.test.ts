import { describe, expect, it } from "vitest";
import { fadeDurationMs } from "./vanish";

describe("fadeDurationMs", () => {
  it.each([
    [200, 80], // shortest vanish time: 40% of it
    [500, 200], // default
    [625, 250], // where the cap starts
    [3000, 250], // longest: capped
  ])("fades a %i ms vanish over its last %i ms", (vanishMs, fadeMs) => {
    expect(fadeDurationMs(vanishMs)).toBe(fadeMs);
  });
});

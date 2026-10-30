/**
 * The learner's settings, remembered in browser storage (spec F5, AC6).
 * Storage is passed in so tests don't need a browser.
 */
import { type DigitRange, isValidRange } from "./practice/generator";

/** Vanish mode (epic 002): hide the beads a moment after each number. */
export interface VanishSettings {
  enabled: boolean;
  seconds: number;
}

export interface Settings {
  range: DigitRange;
  vanish: VanishSettings;
}

export const DEFAULT_SETTINGS: Settings = {
  range: { min: 1, max: 3 },
  vanish: { enabled: false, seconds: 0.5 },
};

/** The vanish time slider's range, in seconds. */
export const VANISH_SECONDS = { min: 0.2, max: 3, step: 0.1 } as const;

/** Rounds to one decimal place, so 0.1 + 0.2 shows as 0.3. */
export function roundSeconds(seconds: number): number {
  return Math.round(seconds * 10) / 10;
}

/** The ".v1" lets a future version change the format without misreading old data. */
export const SETTINGS_KEY = "ucmas-buddy.settings.v1";

/** The part of the browser's localStorage this file uses. */
export type SettingsStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * Returns the saved settings. Anything missing, invalid or unreadable
 * falls back to the default for that setting, so the app always starts.
 * Fields no longer used (such as an old answer style) are ignored.
 */
export function loadSettings(storage: SettingsStorage | undefined): Settings {
  let saved: unknown;
  try {
    saved = JSON.parse(storage?.getItem(SETTINGS_KEY) ?? "null");
  } catch {
    return DEFAULT_SETTINGS;
  }
  if (typeof saved !== "object" || saved === null) {
    return DEFAULT_SETTINGS;
  }

  const { range, vanish } = saved as Partial<Record<keyof Settings, unknown>>;
  return {
    range: isRange(range)
      ? { min: range.min, max: range.max }
      : DEFAULT_SETTINGS.range,
    vanish: toVanish(vanish),
  };
}

/** Saves the settings. Does nothing if browser storage is unavailable. */
export function saveSettings(
  storage: SettingsStorage | undefined,
  settings: Settings,
): void {
  try {
    storage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Settings just won't be remembered; the app keeps working.
  }
}

function isRange(value: unknown): value is DigitRange {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const { min, max } = value as Record<string, unknown>;
  return (
    typeof min === "number" &&
    typeof max === "number" &&
    isValidRange({ min, max })
  );
}

/** Checks each part of saved vanish settings, using defaults for bad ones. */
function toVanish(value: unknown): VanishSettings {
  const defaults = DEFAULT_SETTINGS.vanish;
  if (typeof value !== "object" || value === null) {
    return defaults;
  }
  const { enabled, seconds } = value as Record<string, unknown>;
  const validSeconds =
    typeof seconds === "number" &&
    seconds >= VANISH_SECONDS.min &&
    seconds <= VANISH_SECONDS.max;
  return {
    enabled: typeof enabled === "boolean" ? enabled : defaults.enabled,
    seconds: validSeconds ? roundSeconds(seconds) : defaults.seconds,
  };
}

/** The browser's localStorage, or undefined where reading it throws. */
export function browserStorage(): SettingsStorage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

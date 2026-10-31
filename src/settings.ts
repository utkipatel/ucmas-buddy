/**
 * The learner's settings, remembered in browser storage. Each mode (Play
 * and Test) has its own. Storage is passed in so tests don't need a
 * browser.
 */
import { type DigitRange, isValidRange } from "./practice/generator";

/** Vanish mode (epic 002): hide the beads a moment after each number. */
export interface VanishSettings {
  enabled: boolean;
  seconds: number;
}

export interface PlaySettings {
  range: DigitRange;
  vanish: VanishSettings;
}

/** The test lengths the learner can pick, in minutes. */
export const TEST_MINUTES = [1, 2, 3, 5] as const;
export type TestMinutes = (typeof TEST_MINUTES)[number];

export interface TestSettings extends PlaySettings {
  minutes: TestMinutes;
}

export const DEFAULT_PLAY_SETTINGS: PlaySettings = {
  range: { min: 1, max: 3 },
  vanish: { enabled: false, seconds: 0.5 },
};

export const DEFAULT_TEST_SETTINGS: TestSettings = {
  ...DEFAULT_PLAY_SETTINGS,
  minutes: 1,
};

/** The vanish time slider's range, in seconds. */
export const VANISH_SECONDS = { min: 0.2, max: 3, step: 0.1 } as const;

/** Vanish mode's time in ms, or null when vanish mode is off. */
export function vanishAfterMs({ vanish }: PlaySettings): number | null {
  return vanish.enabled ? Math.round(vanish.seconds * 1000) : null;
}

/** Rounds to one decimal place, so 0.1 + 0.2 shows as 0.3. */
export function roundSeconds(seconds: number): number {
  return Math.round(seconds * 10) / 10;
}

// The ".v1" lets a future version change the format without misreading
// old data.
export const PLAY_SETTINGS_KEY = "ucmas-buddy.play.v1";
export const TEST_SETTINGS_KEY = "ucmas-buddy.test.v1";
/** Settings saved before there were modes. They become Play's. */
export const OLD_SETTINGS_KEY = "ucmas-buddy.settings.v1";

/** The part of the browser's localStorage this file uses. */
export type SettingsStorage = Pick<Storage, "getItem" | "setItem">;

/*
 * Loading: anything missing, invalid or unreadable falls back to the
 * default for that setting, so the app always starts. Fields no longer
 * used (such as an old answer style) are ignored.
 */

/** Returns Play's saved settings, or the ones saved before modes existed. */
export function loadPlaySettings(
  storage: SettingsStorage | undefined,
): PlaySettings {
  const saved =
    readSaved(storage, PLAY_SETTINGS_KEY) ??
    readSaved(storage, OLD_SETTINGS_KEY);
  return toPlaySettings(saved);
}

/** Returns Test's saved settings. */
export function loadTestSettings(
  storage: SettingsStorage | undefined,
): TestSettings {
  const saved = readSaved(storage, TEST_SETTINGS_KEY);
  const { minutes } = isObject(saved) ? saved : {};
  return {
    ...toPlaySettings(saved),
    minutes:
      TEST_MINUTES.find((m) => m === minutes) ?? DEFAULT_TEST_SETTINGS.minutes,
  };
}

export function savePlaySettings(
  storage: SettingsStorage | undefined,
  settings: PlaySettings,
): void {
  save(storage, PLAY_SETTINGS_KEY, settings);
}

export function saveTestSettings(
  storage: SettingsStorage | undefined,
  settings: TestSettings,
): void {
  save(storage, TEST_SETTINGS_KEY, settings);
}

/** Saves a value. Does nothing if browser storage is unavailable. */
function save(
  storage: SettingsStorage | undefined,
  key: string,
  value: unknown,
): void {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // Settings just won't be remembered; the app keeps working.
  }
}

/** The saved value, or null when there is none or it can't be read. */
function readSaved(storage: SettingsStorage | undefined, key: string): unknown {
  try {
    return JSON.parse(storage?.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toPlaySettings(saved: unknown): PlaySettings {
  if (!isObject(saved)) {
    return DEFAULT_PLAY_SETTINGS;
  }
  const { range, vanish } = saved;
  return {
    range: isRange(range)
      ? { min: range.min, max: range.max }
      : DEFAULT_PLAY_SETTINGS.range,
    vanish: toVanish(vanish),
  };
}

function isRange(value: unknown): value is DigitRange {
  if (!isObject(value)) {
    return false;
  }
  const { min, max } = value;
  return (
    typeof min === "number" &&
    typeof max === "number" &&
    isValidRange({ min, max })
  );
}

/** Checks each part of saved vanish settings, using defaults for bad ones. */
function toVanish(value: unknown): VanishSettings {
  const defaults = DEFAULT_PLAY_SETTINGS.vanish;
  if (!isObject(value)) {
    return defaults;
  }
  const { enabled, seconds } = value;
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

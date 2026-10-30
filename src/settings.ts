/**
 * The learner's settings, remembered in browser storage (spec F5, AC6).
 * Storage is passed in so tests don't need a browser.
 */
import { type DigitRange, isValidRange } from "./practice/generator";
import type { AnswerStyle } from "./practice/session";

export interface Settings {
  range: DigitRange;
  answerStyle: AnswerStyle;
}

export const DEFAULT_SETTINGS: Settings = {
  range: { min: 1, max: 3 },
  answerStyle: "self-check",
};

/** The ".v1" lets a future version change the format without misreading old data. */
export const SETTINGS_KEY = "ucmas-buddy.settings.v1";

/** The part of the browser's localStorage this file uses. */
export type SettingsStorage = Pick<Storage, "getItem" | "setItem">;

const ANSWER_STYLES: readonly AnswerStyle[] = ["self-check", "type-it"];

/**
 * Returns the saved settings. Anything missing, invalid or unreadable
 * falls back to the default for that setting, so the app always starts.
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

  const { range, answerStyle } = saved as Partial<
    Record<keyof Settings, unknown>
  >;
  return {
    range: isRange(range)
      ? { min: range.min, max: range.max }
      : DEFAULT_SETTINGS.range,
    answerStyle:
      ANSWER_STYLES.find((style) => style === answerStyle) ??
      DEFAULT_SETTINGS.answerStyle,
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

/** The browser's localStorage, or undefined where reading it throws. */
export function browserStorage(): SettingsStorage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

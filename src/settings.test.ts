import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type Settings,
  SETTINGS_KEY,
  type SettingsStorage,
} from "./settings";

/** In-memory stand-in for the browser's localStorage. */
function fakeStorage(initial: Record<string, string> = {}): SettingsStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

/** Storage that fails, like some private browsing modes. */
const brokenStorage: SettingsStorage = {
  getItem: () => {
    throw new Error("storage disabled");
  },
  setItem: () => {
    throw new Error("storage disabled");
  },
};

const CUSTOM: Settings = {
  range: { min: 2, max: 5 },
  answerStyle: "type-it",
};

describe("settings", () => {
  it("defaults to a 1-3 digit range and self-check", () => {
    expect(DEFAULT_SETTINGS).toEqual({
      range: { min: 1, max: 3 },
      answerStyle: "self-check",
    });
  });

  it("uses the defaults when nothing is saved", () => {
    expect(loadSettings(fakeStorage())).toEqual(DEFAULT_SETTINGS);
  });

  it("loads what was saved, as after a page reload (AC6)", () => {
    const storage = fakeStorage();
    saveSettings(storage, CUSTOM);
    expect(loadSettings(storage)).toEqual(CUSTOM);
  });

  it("uses the defaults when saved data isn't valid JSON", () => {
    expect(loadSettings(fakeStorage({ [SETTINGS_KEY]: "{oops" }))).toEqual(
      DEFAULT_SETTINGS,
    );
  });

  it("keeps each valid setting and replaces only the invalid one", () => {
    const badRange = JSON.stringify({ ...CUSTOM, range: { min: 5, max: 2 } });
    expect(loadSettings(fakeStorage({ [SETTINGS_KEY]: badRange }))).toEqual({
      range: DEFAULT_SETTINGS.range,
      answerStyle: "type-it",
    });

    const badStyle = JSON.stringify({ ...CUSTOM, answerStyle: "shout-it" });
    expect(loadSettings(fakeStorage({ [SETTINGS_KEY]: badStyle }))).toEqual({
      range: CUSTOM.range,
      answerStyle: DEFAULT_SETTINGS.answerStyle,
    });
  });

  it.each([null, 42, "text", [], { range: "1-3" }])(
    "uses the defaults when saved data is %j",
    (saved) => {
      const storage = fakeStorage({ [SETTINGS_KEY]: JSON.stringify(saved) });
      expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
    },
  );

  it("still works when browser storage is unavailable", () => {
    expect(loadSettings(brokenStorage)).toEqual(DEFAULT_SETTINGS);
    expect(loadSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(() => saveSettings(brokenStorage, CUSTOM)).not.toThrow();
    expect(() => saveSettings(undefined, CUSTOM)).not.toThrow();
  });
});

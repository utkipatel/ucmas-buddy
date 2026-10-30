import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type Settings,
  SETTINGS_KEY,
  type SettingsStorage,
  VANISH_SECONDS,
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
  vanish: { enabled: true, seconds: 1.2 },
};

/** Loads settings from storage holding the given saved value. */
const loadSaved = (saved: unknown) =>
  loadSettings(fakeStorage({ [SETTINGS_KEY]: JSON.stringify(saved) }));

describe("settings", () => {
  it("defaults to a 1-3 digit range with vanish mode off at 0.5 s", () => {
    expect(DEFAULT_SETTINGS).toEqual({
      range: { min: 1, max: 3 },
      vanish: { enabled: false, seconds: 0.5 },
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

  it("uses the default range when the saved one is invalid", () => {
    const badRange = JSON.stringify({ range: { min: 5, max: 2 } });
    expect(loadSettings(fakeStorage({ [SETTINGS_KEY]: badRange }))).toEqual(
      DEFAULT_SETTINGS,
    );
  });

  it("ignores the answer style saved by older versions", () => {
    const old = JSON.stringify({ ...CUSTOM, answerStyle: "self-check" });
    expect(loadSettings(fakeStorage({ [SETTINGS_KEY]: old }))).toEqual(CUSTOM);
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

  describe("vanish settings (AC6)", () => {
    it("loads settings saved before vanish mode existed with it off", () => {
      expect(loadSaved({ range: CUSTOM.range })).toEqual({
        range: CUSTOM.range,
        vanish: DEFAULT_SETTINGS.vanish,
      });
    });

    it.each([0.1, 3.1, -1, "1", null])(
      "uses the default time for %j but keeps the switch",
      (seconds) => {
        expect(
          loadSaved({ ...CUSTOM, vanish: { enabled: true, seconds } }),
        ).toEqual({ ...CUSTOM, vanish: { enabled: true, seconds: 0.5 } });
      },
    );

    it("uses the default switch for a value that isn't true or false", () => {
      const saved = { ...CUSTOM, vanish: { enabled: "yes", seconds: 2 } };
      expect(loadSaved(saved).vanish).toEqual({ enabled: false, seconds: 2 });
    });

    it("keeps the range when the vanish part is broken", () => {
      expect(loadSaved({ ...CUSTOM, vanish: "fast" })).toEqual({
        range: CUSTOM.range,
        vanish: DEFAULT_SETTINGS.vanish,
      });
    });

    it("rounds the time to one decimal place", () => {
      const saved = {
        ...CUSTOM,
        vanish: { enabled: true, seconds: 0.1 + 0.2 },
      };
      expect(loadSaved(saved).vanish.seconds).toBe(0.3);
    });

    it("accepts both ends of the slider", () => {
      for (const seconds of [VANISH_SECONDS.min, VANISH_SECONDS.max]) {
        const saved = { ...CUSTOM, vanish: { enabled: true, seconds } };
        expect(loadSaved(saved).vanish.seconds).toBe(seconds);
      }
    });
  });
});

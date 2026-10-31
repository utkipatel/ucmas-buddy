import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLAY_SETTINGS,
  DEFAULT_TEST_SETTINGS,
  loadPlaySettings,
  loadTestSettings,
  OLD_SETTINGS_KEY,
  PLAY_SETTINGS_KEY,
  type PlaySettings,
  savePlaySettings,
  saveTestSettings,
  type SettingsStorage,
  TEST_SETTINGS_KEY,
  type TestSettings,
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

const CUSTOM: PlaySettings = {
  range: { min: 2, max: 5 },
  vanish: { enabled: true, seconds: 1.2 },
};

const CUSTOM_TEST: TestSettings = { ...CUSTOM, minutes: 3 };

/** Loads Play settings from storage holding the given saved value. */
const loadSaved = (saved: unknown) =>
  loadPlaySettings(fakeStorage({ [PLAY_SETTINGS_KEY]: JSON.stringify(saved) }));

/** Loads Test settings from storage holding the given saved value. */
const loadSavedTest = (saved: unknown) =>
  loadTestSettings(fakeStorage({ [TEST_SETTINGS_KEY]: JSON.stringify(saved) }));

describe("play settings", () => {
  it("defaults to a 1-3 digit range with vanish mode off at 0.5 s", () => {
    expect(DEFAULT_PLAY_SETTINGS).toEqual({
      range: { min: 1, max: 3 },
      vanish: { enabled: false, seconds: 0.5 },
    });
  });

  it("uses the defaults when nothing is saved", () => {
    expect(loadPlaySettings(fakeStorage())).toEqual(DEFAULT_PLAY_SETTINGS);
  });

  it("loads what was saved, as after a page reload (AC4)", () => {
    const storage = fakeStorage();
    savePlaySettings(storage, CUSTOM);
    expect(loadPlaySettings(storage)).toEqual(CUSTOM);
  });

  it("reads settings saved before modes existed (AC4)", () => {
    const storage = fakeStorage({ [OLD_SETTINGS_KEY]: JSON.stringify(CUSTOM) });
    expect(loadPlaySettings(storage)).toEqual(CUSTOM);
  });

  it("prefers Play's own settings over the old ones", () => {
    const storage = fakeStorage({
      [OLD_SETTINGS_KEY]: JSON.stringify(CUSTOM),
      [PLAY_SETTINGS_KEY]: JSON.stringify(DEFAULT_PLAY_SETTINGS),
    });
    expect(loadPlaySettings(storage)).toEqual(DEFAULT_PLAY_SETTINGS);
  });

  it("uses the defaults when saved data isn't valid JSON", () => {
    expect(
      loadPlaySettings(fakeStorage({ [PLAY_SETTINGS_KEY]: "{oops" })),
    ).toEqual(DEFAULT_PLAY_SETTINGS);
  });

  it("uses the default range when the saved one is invalid", () => {
    const badRange = JSON.stringify({ range: { min: 5, max: 2 } });
    expect(
      loadPlaySettings(fakeStorage({ [PLAY_SETTINGS_KEY]: badRange })),
    ).toEqual(DEFAULT_PLAY_SETTINGS);
  });

  it("ignores the answer style saved by older versions", () => {
    const old = JSON.stringify({ ...CUSTOM, answerStyle: "self-check" });
    expect(loadPlaySettings(fakeStorage({ [PLAY_SETTINGS_KEY]: old }))).toEqual(
      CUSTOM,
    );
  });

  it.each([null, 42, "text", [], { range: "1-3" }])(
    "uses the defaults when saved data is %j",
    (saved) => {
      const storage = fakeStorage({
        [PLAY_SETTINGS_KEY]: JSON.stringify(saved),
      });
      expect(loadPlaySettings(storage)).toEqual(DEFAULT_PLAY_SETTINGS);
    },
  );

  it("still works when browser storage is unavailable", () => {
    expect(loadPlaySettings(brokenStorage)).toEqual(DEFAULT_PLAY_SETTINGS);
    expect(loadPlaySettings(undefined)).toEqual(DEFAULT_PLAY_SETTINGS);
    expect(() => savePlaySettings(brokenStorage, CUSTOM)).not.toThrow();
    expect(() => savePlaySettings(undefined, CUSTOM)).not.toThrow();
  });

  describe("vanish settings (epic 002, AC6)", () => {
    it("loads settings saved before vanish mode existed with it off", () => {
      expect(loadSaved({ range: CUSTOM.range })).toEqual({
        range: CUSTOM.range,
        vanish: DEFAULT_PLAY_SETTINGS.vanish,
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
        vanish: DEFAULT_PLAY_SETTINGS.vanish,
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

describe("test settings", () => {
  it("defaults to Play's defaults and a 1 minute test", () => {
    expect(DEFAULT_TEST_SETTINGS).toEqual({
      ...DEFAULT_PLAY_SETTINGS,
      minutes: 1,
    });
    expect(loadTestSettings(fakeStorage())).toEqual(DEFAULT_TEST_SETTINGS);
  });

  it("loads what was saved, as after a page reload (AC4)", () => {
    const storage = fakeStorage();
    saveTestSettings(storage, CUSTOM_TEST);
    expect(loadTestSettings(storage)).toEqual(CUSTOM_TEST);
  });

  it("is saved separately from Play's settings (AC3)", () => {
    const storage = fakeStorage();
    savePlaySettings(storage, CUSTOM);
    expect(loadTestSettings(storage)).toEqual(DEFAULT_TEST_SETTINGS);
    saveTestSettings(storage, { ...DEFAULT_TEST_SETTINGS, minutes: 5 });
    expect(loadPlaySettings(storage)).toEqual(CUSTOM);
  });

  it("doesn't take the settings saved before modes existed (AC4)", () => {
    const storage = fakeStorage({ [OLD_SETTINGS_KEY]: JSON.stringify(CUSTOM) });
    expect(loadTestSettings(storage)).toEqual(DEFAULT_TEST_SETTINGS);
  });

  it.each([1, 2, 3, 5])("accepts a %i minute test", (minutes) => {
    expect(loadSavedTest({ ...CUSTOM, minutes }).minutes).toBe(minutes);
  });

  it.each([0, 4, 10, 1.5, "2", null])(
    "uses 1 minute for %j but keeps the rest",
    (minutes) => {
      expect(loadSavedTest({ ...CUSTOM, minutes })).toEqual({
        ...CUSTOM,
        minutes: 1,
      });
    },
  );

  it("checks the range and vanish parts like Play's", () => {
    const saved = { range: { min: 5, max: 2 }, vanish: "fast", minutes: 2 };
    expect(loadSavedTest(saved)).toEqual({
      ...DEFAULT_TEST_SETTINGS,
      minutes: 2,
    });
  });

  it("still works when browser storage is unavailable", () => {
    expect(loadTestSettings(brokenStorage)).toEqual(DEFAULT_TEST_SETTINGS);
    expect(() => saveTestSettings(brokenStorage, CUSTOM_TEST)).not.toThrow();
  });
});

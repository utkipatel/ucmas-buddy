import { useState } from "react";
import Drawer from "../layout/Drawer";
import {
  type PlaySettings,
  roundSeconds,
  TEST_MINUTES,
  type TestMinutes,
  type TestSettings,
  VANISH_SECONDS,
  type VanishSettings,
} from "../settings";
import { isVoiceSupported } from "../voice/recognizer";
import { MAX_DIGITS, MIN_DIGITS } from "./generator";

interface SettingsPanelProps<S extends PlaySettings> {
  /** A mode's settings. Test settings also show the test length. */
  settings: S;
  /** Says what saving does, for example "Saving starts a new test." */
  note: string;
  /** Called with the new settings when the learner taps Save. */
  onSave: (settings: S) => void;
  onClose: () => void;
}

const DIGIT_OPTIONS = Array.from(
  { length: MAX_DIGITS - MIN_DIGITS + 1 },
  (_, i) => MIN_DIGITS + i,
);

/**
 * Side panel with the settings. Changes are kept in a draft until Save;
 * closing (×, Escape, or a tap outside) throws the draft away.
 */
export default function SettingsPanel<S extends PlaySettings>({
  settings,
  note,
  onSave,
  onClose,
}: SettingsPanelProps<S>) {
  const [draft, setDraft] = useState(settings);
  const { range, vanish } = draft;
  const { minutes } = draft as Partial<TestSettings>;
  const changed = JSON.stringify(draft) !== JSON.stringify(settings);

  // Keep min <= max by moving the other end when needed.
  const setMin = (min: number) =>
    setDraft({ ...draft, range: { min, max: Math.max(min, range.max) } });
  const setMax = (max: number) =>
    setDraft({ ...draft, range: { min: Math.min(range.min, max), max } });
  const setVanish = (change: Partial<VanishSettings>) =>
    setDraft({ ...draft, vanish: { ...vanish, ...change } });
  const setMinutes = (minutes: TestMinutes) => setDraft({ ...draft, minutes });

  return (
    <Drawer
      title="Settings"
      closeLabel="Close settings"
      side="right"
      onClose={onClose}
    >
      {(close) => (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(draft);
            close();
          }}
        >
          <p className="note">{note}</p>

          {minutes !== undefined && (
            <fieldset>
              <legend>Test</legend>
              <label>
                Length{" "}
                <select
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(Number(e.target.value) as TestMinutes)
                  }
                >
                  {TEST_MINUTES.map((m) => (
                    <option key={m} value={m}>
                      {m === 1 ? "1 minute" : `${m} minutes`}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
          )}

          <fieldset>
            <legend>Digits</legend>
            <label>
              From{" "}
              <select
                value={range.min}
                onChange={(e) => setMin(Number(e.target.value))}
              >
                {DIGIT_OPTIONS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>{" "}
            <label>
              to{" "}
              <select
                value={range.max}
                onChange={(e) => setMax(Number(e.target.value))}
              >
                {DIGIT_OPTIONS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend>Vanish mode</legend>
            <label className="toggle">
              <input
                type="checkbox"
                checked={vanish.enabled}
                onChange={(e) => setVanish({ enabled: e.target.checked })}
              />{" "}
              Turn on vanish mode
            </label>
            {vanish.enabled && (
              <label className="slider">
                <span>Vanish after</span>
                <input
                  type="range"
                  min={VANISH_SECONDS.min}
                  max={VANISH_SECONDS.max}
                  step={VANISH_SECONDS.step}
                  value={vanish.seconds}
                  onChange={(e) =>
                    setVanish({ seconds: roundSeconds(Number(e.target.value)) })
                  }
                />
                <output>{`${vanish.seconds.toFixed(1)} s`}</output>
              </label>
            )}
          </fieldset>

          <fieldset>
            <legend>Voice answers</legend>
            {isVoiceSupported() ? (
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={draft.voice}
                  onChange={(e) =>
                    setDraft({ ...draft, voice: e.target.checked })
                  }
                />{" "}
                Answer by saying the number
              </label>
            ) : (
              <p className="note">
                Voice answers need Chrome or Safari. This browser can't
                recognize speech.
              </p>
            )}
          </fieldset>

          <button type="submit" className="save" disabled={!changed}>
            Save
          </button>
        </form>
      )}
    </Drawer>
  );
}

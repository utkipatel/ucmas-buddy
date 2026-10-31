import { useState } from "react";
import Drawer from "../layout/Drawer";
import {
  roundSeconds,
  type Settings,
  VANISH_SECONDS,
  type VanishSettings,
} from "../settings";
import { MAX_DIGITS, MIN_DIGITS } from "./generator";

interface SettingsPanelProps {
  settings: Settings;
  /** Called with the new settings when the learner taps Save. */
  onSave: (settings: Settings) => void;
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
export default function SettingsPanel({
  settings,
  onSave,
  onClose,
}: SettingsPanelProps) {
  const [draft, setDraft] = useState(settings);
  const { range, vanish } = draft;
  const changed = JSON.stringify(draft) !== JSON.stringify(settings);

  // Keep min <= max by moving the other end when needed.
  const setMin = (min: number) =>
    setDraft({ ...draft, range: { min, max: Math.max(min, range.max) } });
  const setMax = (max: number) =>
    setDraft({ ...draft, range: { min: Math.min(range.min, max), max } });
  const setVanish = (change: Partial<VanishSettings>) =>
    setDraft({ ...draft, vanish: { ...vanish, ...change } });

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
          <p className="note">
            Saving starts a new number and resets the score.
          </p>

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

          <button type="submit" className="save" disabled={!changed}>
            Save
          </button>
        </form>
      )}
    </Drawer>
  );
}

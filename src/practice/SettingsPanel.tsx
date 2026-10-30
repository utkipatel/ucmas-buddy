import { type FormEvent, useEffect, useState } from "react";
import type { Settings } from "../settings";
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
  const { range } = draft;
  const changed =
    range.min !== settings.range.min || range.max !== settings.range.max;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  // Keep min <= max by moving the other end when needed.
  const setMin = (min: number) =>
    setDraft({ ...draft, range: { min, max: Math.max(min, range.max) } });
  const setMax = (max: number) =>
    setDraft({ ...draft, range: { min: Math.min(range.min, max), max } });

  function handleSave(event: FormEvent) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <div
      className="drawer-backdrop"
      data-testid="drawer-backdrop"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="drawer-header">
          <h2 id="settings-title">Settings</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close settings"
            onClick={onClose}
            autoFocus
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave}>
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

          <button type="submit" className="save" disabled={!changed}>
            Save
          </button>
        </form>
      </aside>
    </div>
  );
}

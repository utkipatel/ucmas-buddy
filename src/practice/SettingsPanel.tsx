import { type FormEvent, useEffect, useState } from "react";
import type { Settings } from "../settings";
import { MAX_DIGITS, MIN_DIGITS } from "./generator";

interface SettingsPanelProps {
  settings: Settings;
  /** Called with the new settings when the learner taps Save. */
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

/** How long the closing animation runs; matches `.closing` in style.css. */
export const CLOSE_MS = 250;

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
  const [closing, setClosing] = useState(false);
  const { range } = draft;
  const changed =
    range.min !== settings.range.min || range.max !== settings.range.max;

  // Closing first plays the slide-out animation, then removes the panel.
  const close = () => setClosing(true);
  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(onClose, CLOSE_MS);
    return () => clearTimeout(timer);
  }, [closing, onClose]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  // Keep min <= max by moving the other end when needed.
  const setMin = (min: number) =>
    setDraft({ ...draft, range: { min, max: Math.max(min, range.max) } });
  const setMax = (max: number) =>
    setDraft({ ...draft, range: { min: Math.min(range.min, max), max } });

  function handleSave(event: FormEvent) {
    event.preventDefault();
    onSave(draft);
    close();
  }

  return (
    <div
      className={closing ? "drawer-backdrop closing" : "drawer-backdrop"}
      data-testid="drawer-backdrop"
      onClick={(event) => event.target === event.currentTarget && close()}
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
            onClick={close}
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

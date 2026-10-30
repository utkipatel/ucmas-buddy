import type { Settings } from "../settings";
import { MAX_DIGITS, MIN_DIGITS } from "./generator";
import type { AnswerStyle } from "./session";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

const DIGIT_OPTIONS = Array.from(
  { length: MAX_DIGITS - MIN_DIGITS + 1 },
  (_, i) => MIN_DIGITS + i,
);

const ANSWER_STYLES: { value: AnswerStyle; label: string }[] = [
  { value: "self-check", label: "Say it, then reveal" },
  { value: "type-it", label: "Type it (scored)" },
];

export default function SettingsPanel({
  settings,
  onChange,
}: SettingsPanelProps) {
  const { range, answerStyle } = settings;

  // Keep min <= max by moving the other end when needed.
  const setMin = (min: number) =>
    onChange({ ...settings, range: { min, max: Math.max(min, range.max) } });
  const setMax = (max: number) =>
    onChange({ ...settings, range: { min: Math.min(range.min, max), max } });

  return (
    <details className="settings">
      <summary>Settings</summary>

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
        <legend>Answer style</legend>
        {ANSWER_STYLES.map(({ value, label }) => (
          <label key={value} className="choice">
            <input
              type="radio"
              name="answer-style"
              checked={answerStyle === value}
              onChange={() => onChange({ ...settings, answerStyle: value })}
            />{" "}
            {label}
          </label>
        ))}
      </fieldset>
    </details>
  );
}

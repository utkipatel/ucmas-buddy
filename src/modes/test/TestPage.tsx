import { useEffect, useState } from "react";
import { usePageContext } from "../../layout/modes";
import Exercise from "../../practice/Exercise";
import { generateNumber } from "../../practice/generator";
import ResultLine from "../../practice/ResultLine";
import SettingsPanel from "../../practice/SettingsPanel";
import {
  browserStorage,
  loadTestSettings,
  saveTestSettings,
  type TestSettings,
  vanishAfterMs,
} from "../../settings";
import { isVoiceSupported } from "../../voice/recognizer";
import {
  answerInTest,
  finishIfTimeUp,
  formatTimeLeft,
  READY,
  results,
  startTest,
  timeLeftMs,
} from "./test";

/** How often the countdown is redrawn. */
const TICK_MS = 250;

/** The timed test: a summary and Start, the test, then the results. */
export default function TestPage() {
  const { settingsOpen, closeSettings, setSettingsDisabled } = usePageContext();
  const [settings, setSettings] = useState(() =>
    loadTestSettings(browserStorage()),
  );
  const [test, setTest] = useState(READY);
  const [now, setNow] = useState(() => Date.now());
  const running = test.phase === "running";
  const score = results(test);

  // Settings can't change mid-test (spec F2).
  useEffect(() => {
    setSettingsDisabled(running);
    return () => setSettingsDisabled(false);
  }, [running, setSettingsDisabled]);

  // While the test runs, redraw the countdown and end the test on time.
  // Times come from the clock, so the end is exact even if ticks are late.
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      setTest((t) => finishIfTimeUp(t, time));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [running]);

  function start() {
    const time = Date.now();
    setNow(time);
    setTest(startTest(time, settings.minutes, generateNumber(settings.range)));
  }

  function handleAnswer(typed: string) {
    const next = generateNumber(settings.range);
    const time = Date.now();
    setTest((t) => answerInTest(t, typed, next, time));
  }

  function handleSettingsSave(newSettings: TestSettings) {
    setSettings(newSettings);
    saveTestSettings(browserStorage(), newSettings);
    setTest(READY);
  }

  return (
    <>
      {test.phase === "ready" && (
        <section className="test-panel">
          <p className="test-summary">{summary(settings)}</p>
          <button type="button" onClick={start}>
            Start
          </button>
        </section>
      )}

      {running && (
        <>
          <p className="test-status">
            <span role="timer" aria-label="Time left">
              {formatTimeLeft(timeLeftMs(test, now))}
            </span>
            <span>{`Score: ${score.correct} / ${score.answered}`}</span>
          </p>
          <Exercise
            number={test.number}
            onAnswer={handleAnswer}
            vanishAfterMs={vanishAfterMs(settings)}
            autoFocus
            voice={settings.voice && isVoiceSupported() && !settingsOpen}
          >
            <ResultLine
              result={test.answers.at(-1) ?? null}
              count={score.answered}
            />
          </Exercise>
        </>
      )}

      {test.phase === "finished" && (
        <section className="test-panel">
          <h2>Time's up!</h2>
          <TestResults answers={test.answers} />
          <button type="button" onClick={start}>
            Start again
          </button>
        </section>
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          note="Saving starts a new test."
          onSave={handleSettingsSave}
          onClose={closeSettings}
        />
      )}
    </>
  );
}

function TestResults({ answers }: { answers: typeof READY.answers }) {
  const { correct, answered } = results({ ...READY, answers });
  return (
    <>
      <p className="test-score" aria-label="Correct out of answered">
        {`${correct} / ${answered}`}
      </p>
      {answered === 0 ? (
        <p className="note">No answers this time.</p>
      ) : (
        <ol className="test-answers">
          {answers.map((a, i) => (
            <li key={i} className={a.correct ? "correct" : "wrong"}>
              {a.correct
                ? `✓ ${a.number}`
                : `✗ ${a.number}, you answered ${a.typed}`}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

/** For example "1 minute test · 1–3 digits · vanish off". */
function summary({ minutes, range, vanish }: TestSettings): string {
  const length = minutes === 1 ? "1 minute" : `${minutes} minutes`;
  const digits =
    range.min === range.max
      ? `${range.min} digit${range.min === 1 ? "" : "s"}`
      : `${range.min}–${range.max} digits`;
  const vanishing = vanish.enabled
    ? `vanish after ${vanish.seconds.toFixed(1)} s`
    : "vanish off";
  return `${length} test · ${digits} · ${vanishing}`;
}

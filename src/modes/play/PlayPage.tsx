import { useState } from "react";
import { usePageContext } from "../../layout/modes";
import SettingsPanel from "../../practice/SettingsPanel";
import StudyScreen from "../../practice/StudyScreen";
import {
  browserStorage,
  loadPlaySettings,
  type PlaySettings,
  savePlaySettings,
  vanishAfterMs,
} from "../../settings";

/** Open-ended practice with a running score. */
export default function PlayPage() {
  const { settingsOpen, closeSettings } = usePageContext();
  const [settings, setSettings] = useState(() =>
    loadPlaySettings(browserStorage()),
  );

  function handleSettingsSave(newSettings: PlaySettings) {
    setSettings(newSettings);
    savePlaySettings(browserStorage(), newSettings);
  }

  // A new key gives StudyScreen a fresh start: saving new settings starts
  // a new round with a 0 / 0 score, since scores at different settings
  // can't be compared.
  const { range } = settings;
  const vanishMs = vanishAfterMs(settings);
  const sessionKey = `${range.min}-${range.max}-${vanishMs}`;

  return (
    <>
      <StudyScreen key={sessionKey} range={range} vanishAfterMs={vanishMs} />

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          note="Saving starts a new number and resets the score."
          onSave={handleSettingsSave}
          onClose={closeSettings}
        />
      )}
    </>
  );
}

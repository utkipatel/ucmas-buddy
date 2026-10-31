import { useState } from "react";
import { usePageContext } from "../../layout/modes";
import SettingsPanel from "../../practice/SettingsPanel";
import StudyScreen from "../../practice/StudyScreen";
import {
  browserStorage,
  loadPlaySettings,
  type PlaySettings,
  savePlaySettings,
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
  const { range, vanish } = settings;
  const vanishAfterMs = vanish.enabled
    ? Math.round(vanish.seconds * 1000)
    : null;
  const sessionKey = `${range.min}-${range.max}-${vanishAfterMs}`;

  return (
    <>
      <StudyScreen
        key={sessionKey}
        range={range}
        vanishAfterMs={vanishAfterMs}
      />

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

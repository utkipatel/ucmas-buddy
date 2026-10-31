import { useState } from "react";
import { usePageContext } from "../../layout/modes";
import SettingsPanel from "../../practice/SettingsPanel";
import StudyScreen from "../../practice/StudyScreen";
import {
  browserStorage,
  loadSettings,
  saveSettings,
  type Settings,
} from "../../settings";

/** Open-ended practice with a running score. */
export default function PlayPage() {
  const { settingsOpen, closeSettings } = usePageContext();
  const [settings, setSettings] = useState(() =>
    loadSettings(browserStorage()),
  );

  function handleSettingsSave(newSettings: Settings) {
    setSettings(newSettings);
    saveSettings(browserStorage(), newSettings);
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
          onSave={handleSettingsSave}
          onClose={closeSettings}
        />
      )}
    </>
  );
}

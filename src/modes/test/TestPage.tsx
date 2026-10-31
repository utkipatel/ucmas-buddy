import { useState } from "react";
import { usePageContext } from "../../layout/modes";
import SettingsPanel from "../../practice/SettingsPanel";
import {
  browserStorage,
  loadTestSettings,
  saveTestSettings,
  type TestSettings,
} from "../../settings";

/** The timed test. For now only its settings; the test itself comes next. */
export default function TestPage() {
  const { settingsOpen, closeSettings } = usePageContext();
  const [settings, setSettings] = useState(() =>
    loadTestSettings(browserStorage()),
  );

  function handleSettingsSave(newSettings: TestSettings) {
    setSettings(newSettings);
    saveTestSettings(browserStorage(), newSettings);
  }

  return (
    <>
      <p className="placeholder">The timed test is coming soon.</p>

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

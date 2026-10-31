import { useCallback, useState } from "react";
import SettingsPanel from "./practice/SettingsPanel";
import StudyScreen from "./practice/StudyScreen";
import {
  browserStorage,
  loadSettings,
  saveSettings,
  type Settings,
} from "./settings";

export default function App() {
  const [settings, setSettings] = useState(() =>
    loadSettings(browserStorage()),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

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
      <header className="app-header">
        <button
          type="button"
          className="icon-button"
          aria-label="Open settings"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        <h1>UCMAS Buddy</h1>
      </header>

      <StudyScreen
        key={sessionKey}
        range={range}
        vanishAfterMs={vanishAfterMs}
      />

      {menuOpen && (
        <SettingsPanel
          settings={settings}
          onSave={handleSettingsSave}
          onClose={closeMenu}
        />
      )}
    </>
  );
}

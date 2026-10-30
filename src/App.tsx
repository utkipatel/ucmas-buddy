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

  function handleSettingsChange(newSettings: Settings) {
    setSettings(newSettings);
    saveSettings(browserStorage(), newSettings);
  }

  // A new key gives StudyScreen a fresh start: changing a setting starts a
  // new round with a 0 / 0 score, since scores at different settings
  // can't be compared.
  const { range } = settings;
  const sessionKey = `${range.min}-${range.max}`;

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

      <StudyScreen key={sessionKey} range={range} />

      {menuOpen && (
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          onClose={closeMenu}
        />
      )}
    </>
  );
}

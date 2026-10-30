import { useState } from "react";
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

  function handleSettingsChange(newSettings: Settings) {
    setSettings(newSettings);
    saveSettings(browserStorage(), newSettings);
  }

  // A new key gives StudyScreen a fresh start: changing a setting starts a
  // new round with a 0 / 0 score, since scores at different settings
  // can't be compared.
  const { range, answerStyle } = settings;
  const sessionKey = `${range.min}-${range.max}-${answerStyle}`;

  return (
    <>
      <h1>UCMAS Buddy</h1>
      <StudyScreen key={sessionKey} settings={settings} />
      <SettingsPanel settings={settings} onChange={handleSettingsChange} />
    </>
  );
}
